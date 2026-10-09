import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaCalendarCheck, 
  FaCar, 
  FaSpinner, 
  FaRedo, 
  FaCheckCircle, 
  FaClock, 
  FaFilter,
  FaWrench,
  FaInfoCircle
} from 'react-icons/fa';

export default function ServiceOpenBookingsView() {
  const { customer, selectedVin, vehicleDetails, vehicles } = useCustomer();
  const group = customer?.keyloopGroup || "BMW";
  const customerNumber = customer?.customerNumber || customer?.id || "";
  const vin = selectedVin || vehicleDetails?.vin || (vehicles && vehicles[0]?.vin) || "";

  const [openBookings, setOpenBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchMode, setFetchMode] = useState('customer'); // 'customer' or 'vehicle'

  const formatDisplayVal = (val, fallback = 'N/A') => {
    if (val === null || val === undefined || val === '') return fallback;
    if (typeof val === 'object') {
      if (val.name) return val.name;
      if (val.description) return val.description;
      return JSON.stringify(val);
    }
    return String(val);
  };

  const fetchOpenBookings = async () => {
    setLoading(true);
    setOpenBookings([]);
    try {
      let apiUrl = `/api/v1/customers/${group}/${customerNumber}/service-bookings`;
      if (fetchMode === 'vehicle' && vin) {
        apiUrl = `/api/v1/vehicles/${group}/${vin}/service-bookings`;
      } else if (!customerNumber) {
        setOpenBookings([]);
        setLoading(false);
        return;
      }

      const res = await apiFetch(apiUrl);
      if (res && res.ok && Array.isArray(res.data)) {
        setOpenBookings(res.data);
      } else {
        setOpenBookings([]);
      }
    } catch (err) {
      console.warn("Failed to fetch open service bookings:", err);
      setOpenBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenBookings();
  }, [group, customerNumber, vin, fetchMode]);

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4 text-xs">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FaCalendarCheck className="text-base" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">Open Workshop Bookings</h2>
              <span className="text-[10px] text-gray-400 font-mono">
                Keyloop Group: {group} {customerNumber ? `| Customer #${customerNumber}` : ''} {vin ? `| VIN: ${vin}` : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setFetchMode('customer')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                fetchMode === 'customer' ? 'bg-blue-600 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              By Customer ID
            </button>
            <button
              onClick={() => setFetchMode('vehicle')}
              disabled={!vin}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer disabled:opacity-40 ${
                fetchMode === 'vehicle' ? 'bg-blue-600 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              By VIN {vin ? `(${vin.slice(-6)})` : ''}
            </button>
          </div>

          <button 
            onClick={fetchOpenBookings}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer"
            title="Refresh Open Bookings"
          >
            <FaRedo className={`text-xs ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
          <FaSpinner className="animate-spin text-xl text-blue-600" />
          <span className="text-xs font-medium">Loading open workshop bookings...</span>
        </div>
      ) : openBookings.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-1">
          <FaInfoCircle className="mx-auto text-xl text-gray-300 mb-1" />
          <p className="font-bold text-gray-700 text-xs">No Open Workshop Bookings Found</p>
          <p className="text-[11px] text-gray-400">There are currently no active upcoming bookings returned from the API.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[9px] border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3">WIP / Booking ID</th>
                <th className="py-2.5 px-3">Service Type</th>
                <th className="py-2.5 px-3">Preferred Date & Time</th>
                <th className="py-2.5 px-3">Branch Location</th>
                <th className="py-2.5 px-3">Service Advisor</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Loan Car</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
              {openBookings.map((b, idx) => (
                <tr key={b.wipNumber || b.bookingId || idx} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-blue-600">
                    {formatDisplayVal(b.wipNumber || b.bookingId)}
                  </td>
                  <td className="py-3 px-3 font-bold text-gray-900">
                    <div className="flex items-center gap-1.5">
                      <FaWrench className="text-gray-400 text-[10px]" />
                      <span>{formatDisplayVal(b.serviceType || b.description)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-800 font-mono">
                    {formatDisplayVal(b.dateTime || b.createdDate || b.date)}
                  </td>
                  <td className="py-3 px-3 text-gray-600">{formatDisplayVal(b.branch)}</td>
                  <td className="py-3 px-3 font-semibold text-gray-800">{formatDisplayVal(b.advisor || b.bookedBy)}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      b.status === 'OPEN' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {formatDisplayVal(b.status)}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-gray-800">
                    {formatDisplayVal(b.loanCar)}
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
