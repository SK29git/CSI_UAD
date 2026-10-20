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
  FaInfoCircle,
  FaCheckCircle
} from 'react-icons/fa';

export default function ServiceHistoryView() {
  const { customer, selectedVin, vehicleDetails, vehicles, group: contextGroup } = useCustomer();
  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || "");
  const customerNumber = customer?.customerNumber || customer?.id || "";
  const vin = selectedVin || vehicleDetails?.vin || (vehicles && vehicles[0]?.vin) || "";

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusBadge = (status) => {
    if (!status) return <span className="text-gray-400 font-normal">-</span>;
    const s = String(status).trim().toUpperCase();
    if (s === 'BOOKED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <FaCheckCircle className="text-[9px] text-blue-600" /> Booked
        </span>
      );
    }
    if (s === 'COMPLETED' || s === 'INVOICED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <FaCheckCircle className="text-[9px] text-emerald-600" /> {status}
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
        {status}
      </span>
    );
  };

  const getSourceBadge = (source) => {
    if (!source) return <span className="text-gray-400 font-normal">-</span>;
    const s = String(source).trim().toUpperCase();
    if (s === 'WORKSHOP_BOOKING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <FaWrench className="text-[9px]" /> Workshop Booking
        </span>
      );
    }
    if (s === 'VEHICLE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <FaCar className="text-[9px]" /> Vehicle Record
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
        {source}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4 text-xs font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FaHistory className="text-base" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 leading-tight">Vehicle Workshop Service History</h2>
              {history.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                  {history.length} {history.length === 1 ? 'Record' : 'Records'}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 font-mono">
              Keyloop Group: {group} {customerNumber ? `| Customer #${customerNumber}` : ''} {vin ? `| VIN: ${vin}` : ''}
            </span>
          </div>
        </div>

        <button 
          onClick={fetchServiceHistory}
          disabled={loading}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer self-start sm:self-auto transition-colors"
          title="Refresh Service History"
        >
          <FaRedo className={`text-xs ${loading ? 'animate-spin text-blue-600' : ''}`} />
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
          <p className="text-[11px] text-gray-400">There are no historical workshop records returned from the API for this vehicle.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-center">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-3 text-center">Service Date</th>
                <th className="py-2.5 px-3 text-center">Booking ID</th>
                <th className="py-2.5 px-3 text-center">Mileage</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Source</th>
                <th className="py-2.5 px-3 text-center">Branch</th>
                <th className="py-2.5 px-3 text-center">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
              {history.map((row, idx) => (
                <tr key={row.bookingId || row.serviceDate || idx} className="hover:bg-gray-50/80 transition-colors">
                  {/* 1. Service Date */}
                  <td className="py-3 px-3 font-semibold text-gray-900 font-mono text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <FaCalendarAlt className="text-gray-400 text-xs shrink-0" />
                      <span>{row.serviceDate || row.date || <span className="text-gray-400 font-normal">-</span>}</span>
                    </div>
                  </td>

                  {/* 2. Booking ID */}
                  <td className="py-3 px-3 font-mono font-bold text-blue-600 text-center">
                    {row.bookingId ? (
                      `#${row.bookingId}`
                    ) : row.wipNumber ? (
                      `#${row.wipNumber}`
                    ) : (
                      <span className="text-gray-400 font-normal">-</span>
                    )}
                  </td>

                  {/* 3. Mileage */}
                  <td className="py-3 px-3 font-bold text-gray-900 font-mono text-center">
                    {row.mileageKm !== undefined && row.mileageKm !== null ? (
                      `${Number(row.mileageKm).toLocaleString()} KM`
                    ) : row.mileage ? (
                      `${row.mileage} KM`
                    ) : (
                      <span className="text-gray-400 font-normal">-</span>
                    )}
                  </td>

                  {/* 4. Status */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center">
                      {getStatusBadge(row.status)}
                    </div>
                  </td>

                  {/* 5. Source */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center">
                      {getSourceBadge(row.source)}
                    </div>
                  </td>

                  {/* 6. Branch */}
                  <td className="py-3 px-3 text-gray-700 font-semibold text-center">
                    {row.branch || <span className="text-gray-400 font-normal">-</span>}
                  </td>

                  {/* 7. Cost */}
                  <td className="py-3 px-3 text-center font-bold text-gray-900 font-mono">
                    {row.cost && String(row.cost).trim() !== '' ? (
                      `AED ${Number(row.cost).toLocaleString()}`
                    ) : row.amount && String(row.amount).trim() !== '' ? (
                      `AED ${row.amount}`
                    ) : (
                      <span className="text-gray-400 font-normal">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
