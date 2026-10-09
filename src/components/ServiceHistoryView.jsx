import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaHistory, 
  FaCar, 
  FaSpinner, 
  FaRedo, 
  FaWrench,
  FaCalendarAlt,
  FaInfoCircle
} from 'react-icons/fa';

export default function ServiceHistoryView() {
  const { customer, selectedVin, vehicleDetails, vehicles } = useCustomer();
  const group = customer?.keyloopGroup || "BMW";
  const customerNumber = customer?.customerNumber || customer?.id || "";
  const vin = selectedVin || vehicleDetails?.vin || (vehicles && vehicles[0]?.vin) || "";

  const [history, setHistory] = useState([]);
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

  const fetchServiceHistory = async () => {
    if (!vin) {
      setHistory([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setHistory([]);
    try {
      const apiUrl = `/api/v1/vehicles/${group}/${vin}/service-history?from=2025-01-01&to=2026-12-31`;
      const res = await apiFetch(apiUrl);
      if (res && res.ok && Array.isArray(res.data)) {
        setHistory(res.data);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.warn("Failed to fetch vehicle service history:", err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceHistory();
  }, [group, vin]);

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4 text-xs">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FaHistory className="text-base" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">Vehicle Workshop Service History</h2>
            <span className="text-[10px] text-gray-400 font-mono">
              Keyloop Group: {group} {customerNumber ? `| Customer #${customerNumber}` : ''} {vin ? `| VIN: ${vin}` : ''}
            </span>
          </div>
        </div>

        <button 
          onClick={fetchServiceHistory}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer self-start sm:self-auto"
          title="Refresh Service History"
        >
          <FaRedo className={`text-xs ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
          <FaSpinner className="animate-spin text-xl text-blue-600" />
          <span className="text-xs font-medium">Loading workshop service history...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-1">
          <FaInfoCircle className="mx-auto text-xl text-gray-300 mb-1" />
          <p className="font-bold text-gray-700 text-xs">No Service History Records Found</p>
          <p className="text-[11px] text-gray-400">There are no historical workshop invoices returned from the API for this vehicle.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[9px] border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">WIP Number</th>
                <th className="py-2.5 px-3">Mileage</th>
                <th className="py-2.5 px-3">Service Type / Description</th>
                <th className="py-2.5 px-3">Branch</th>
                <th className="py-2.5 px-3">Service Advisor</th>
                <th className="py-2.5 px-3 text-right">Invoice Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
              {history.map((row, idx) => (
                <tr key={row.wipNumber || idx} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-gray-900 font-mono">
                    <div className="flex items-center gap-1.5">
                      <FaCalendarAlt className="text-gray-400 text-[10px]" />
                      <span>{formatDisplayVal(row.date)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-600">{formatDisplayVal(row.wipNumber)}</td>
                  <td className="py-3 px-3 font-bold text-gray-900">
                    {typeof row.mileageKm === 'number' ? `${row.mileageKm.toLocaleString()} KM` : formatDisplayVal(row.mileage)}
                  </td>
                  <td className="py-3 px-3 font-semibold text-gray-800">
                    <div className="flex items-center gap-1.5">
                      <FaWrench className="text-gray-400 text-[10px]" />
                      <span>{formatDisplayVal(row.serviceType || row.description)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-600">{formatDisplayVal(row.branch)}</td>
                  <td className="py-3 px-3 text-gray-800 font-medium">{formatDisplayVal(row.advisor)}</td>
                  <td className="py-3 px-3 text-right font-black text-gray-900">{formatDisplayVal(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
