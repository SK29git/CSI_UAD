import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaShieldAlt, 
  FaSpinner, 
  FaRedo, 
  FaInfoCircle
} from 'react-icons/fa';

export default function ServiceWarrantyClaimsView() {
  const { customer, selectedVin, vehicleDetails, vehicles } = useCustomer();
  const group = customer?.keyloopGroup || "";
  const customerNumber = customer?.customerNumber || customer?.id || "";
  const vin = selectedVin || vehicleDetails?.vin || (vehicles && vehicles[0]?.vin) || "";

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDisplayVal = (val, fallback = 'N/A') => {
    if (val === null || val === undefined || val === '') return fallback;
    if (typeof val === 'object') {
      if (val.name) return val.name;
      if (val.description) return val.description;
      return JSON.stringify(val);
    }
    return String(val);
  };

  const fetchWarrantyClaims = async () => {
    if (!vin) {
      setClaims([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setClaims([]);
    try {
      const apiUrl = `/api/v1/vehicles/${group}/${vin}/warranty-claims`;
      const res = await apiFetch(apiUrl);
      if (res && res.ok && Array.isArray(res.data)) {
        setClaims(res.data);
      } else {
        setClaims([]);
      }
    } catch (err) {
      console.warn("Failed to fetch warranty claims:", err);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarrantyClaims();
  }, [group, vin]);

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4 text-xs">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FaShieldAlt className="text-base" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">Warranty Claims & History</h2>
            <span className="text-[10px] text-gray-400 font-mono">
              Keyloop Group: {group} {customerNumber ? `| Customer #${customerNumber}` : ''} {vin ? `| VIN: ${vin}` : ''}
            </span>
          </div>
        </div>

        <button 
          onClick={fetchWarrantyClaims}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer self-start sm:self-auto"
          title="Refresh Warranty Claims"
        >
          <FaRedo className={`text-xs ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Claims Table */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
          <FaSpinner className="animate-spin text-xl text-blue-600" />
          <span className="text-xs font-medium">Loading warranty claims...</span>
        </div>
      ) : claims.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-1">
          <FaInfoCircle className="mx-auto text-xl text-gray-300 mb-1" />
          <p className="font-semibold text-xs text-gray-700">No Warranty Claims Found</p>
          <p className="text-[11px] text-gray-400">There are no warranty claim records returned from the API for this vehicle.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[9px] border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3">Claim ID</th>
                <th className="py-2.5 px-3">Claim Date</th>
                <th className="py-2.5 px-3">Warranty Provider / Type</th>
                <th className="py-2.5 px-3">Contract Code</th>
                <th className="py-2.5 px-3">Description / Claim Parts</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Approved Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
              {claims.map((row, idx) => (
                <tr key={row.claimId || idx} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-blue-600">{formatDisplayVal(row.claimId)}</td>
                  <td className="py-3 px-3 font-mono text-gray-600">{formatDisplayVal(row.claimDate || row.date)}</td>
                  <td className="py-3 px-3 font-bold text-gray-900">{formatDisplayVal(row.claimType)}</td>
                  <td className="py-3 px-3 font-mono text-gray-700 font-bold">{formatDisplayVal(row.contractType)}</td>
                  <td className="py-3 px-3 font-semibold text-gray-800">{formatDisplayVal(row.description)}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      row.status === 'APPROVED' || row.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {formatDisplayVal(row.status)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-black text-gray-900">{formatDisplayVal(row.approvedAmount || row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
