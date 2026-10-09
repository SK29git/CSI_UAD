import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaCar, 
  FaCalendarCheck, 
  FaClock, 
  FaUser, 
  FaRedo, 
  FaSpinner, 
  FaCheckCircle, 
  FaCommentAlt,
  FaBell,
  FaMapMarkerAlt,
  FaSearch,
  FaPaperPlane,
  FaInfoCircle,
  FaBuilding,
  FaCheck
} from 'react-icons/fa';

export default function SalesTestDriveView() {
  const { customer } = useCustomer();
  const group = customer?.keyloopGroup || "BMW";
  const customerNumber = customer?.customerNumber || "";

  const [activeTab, setActiveTab] = useState("bookings"); // "bookings" | "fleet"
  const [testDrives, setTestDrives] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [fleetSearch, setFleetSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Search/Lookup Booking state
  const [searchBookingInput, setSearchBookingInput] = useState("");
  const [selectedBookingNo, setSelectedBookingNo] = useState("");
  const [actionOutput, setActionOutput] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const formatVehicleDisplay = (v) => {
    if (!v) return 'N/A';
    if (typeof v === 'string') return v;
    if (typeof v === 'object') {
      if (v.description) return v.description;
      const name = `${v.brand || ''} ${v.model || ''}`.trim();
      if (name) return name;
      if (v.vehicleNumber) return `Vehicle #${v.vehicleNumber}`;
      if (v.registrationNumber) return `Reg: ${v.registrationNumber}`;
      return 'Vehicle Details';
    }
    return String(v);
  };

  const renderSafeVal = (val, fallback = 'N/A') => {
    if (val === null || val === undefined || val === '') return fallback;
    if (typeof val === 'object') {
      if (val.name) return val.name;
      if (val.description) return val.description;
      return JSON.stringify(val);
    }
    return String(val);
  };

  const fetchTestDrives = async () => {
    setLoading(true);
    try {
      // 1. Fetch available test drive fleet slots
      const branchCode = customer?.branchCode || customer?.preferredBranch || "";
      const slotsUrl = branchCode 
        ? `/api/v1/test-drives/vehicles?group=${group}&branchCode=${branchCode}`
        : `/api/v1/test-drives/vehicles?group=${group}`;
      
      const slotsRes = await apiFetch(slotsUrl);
      if (slotsRes && slotsRes.ok && Array.isArray(slotsRes.data)) {
        setAvailableSlots(slotsRes.data);
      } else {
        setAvailableSlots([]);
      }

      // 2. Fetch customer test drive bookings if customerNumber exists
      if (customerNumber) {
        const listRes = await apiFetch(`/api/v1/test-drives?group=${group}&prospectNumber=${customerNumber}`);
        if (listRes && listRes.ok && Array.isArray(listRes.data)) {
          setTestDrives(listRes.data);
          if (listRes.data.length > 0 && !selectedBookingNo) {
            setSelectedBookingNo(listRes.data[0].bookingNumber || listRes.data[0].id || "");
          }
        } else {
          setTestDrives([]);
        }
      } else {
        setTestDrives([]);
      }
    } catch (err) {
      console.warn("Failed to fetch test drive data:", err);
      setAvailableSlots([]);
      setTestDrives([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestDrives();
  }, [group, customerNumber, customer?.branchCode]);

  const handleTriggerAction = async (actionType, targetBookingNo) => {
    const bookingNo = targetBookingNo || selectedBookingNo || searchBookingInput;
    if (!bookingNo) return;

    setSelectedBookingNo(bookingNo);
    setActionLoading(true);
    setActionOutput(null);

    try {
      let endpoint = `/api/v1/test-drives/${group}/${bookingNo}`;
      if (actionType === 'confirm') endpoint += `/confirmation`;
      else if (actionType === 'notify') endpoint += `/advisor-notification`;
      else if (actionType === 'feedback') endpoint += `/feedback`;
      else if (actionType === 'feedback-response') endpoint += `/feedback-response`;
      else if (actionType === 'confirmation-comm') endpoint += `/confirmation-communication`;

      const res = await apiFetch(endpoint);
      if (res && res.ok) {
        setActionOutput({ action: actionType, bookingNo, data: res.data || res, ok: true });
      } else {
        setActionOutput({ action: actionType, bookingNo, error: res?.statusText || "No details found", ok: false });
      }
    } catch (err) {
      setActionOutput({ action: actionType, bookingNo, error: err.message || "Failed to execute action", ok: false });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLookupBookingSubmit = (e) => {
    e.preventDefault();
    if (searchBookingInput.trim()) {
      handleTriggerAction('read', searchBookingInput.trim());
    }
  };

  const filteredFleet = availableSlots.filter(s => {
    if (!fleetSearch) return true;
    const q = fleetSearch.toLowerCase();
    const desc = (s.description || s.vehicle || '').toString().toLowerCase();
    const brand = (s.brand || '').toString().toLowerCase();
    const reg = (s.registrationNumber || '').toString().toLowerCase();
    return desc.includes(q) || brand.includes(q) || reg.includes(q);
  });

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4 text-xs">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <FaCar className="text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 leading-tight">Sales Test Drive Management</h2>
              <span className="bg-blue-50 text-blue-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-blue-200">
                {group}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium">
              Customer: <span className="font-bold text-gray-800">{customer?.fullName || 'Walk-in Prospect'}</span> 
              {customerNumber ? ` (#${customerNumber})` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Lookup Booking Search Bar */}
          <form onSubmit={handleLookupBookingSubmit} className="flex items-center gap-1.5">
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-[10px]" />
              <input
                type="text"
                value={searchBookingInput}
                onChange={(e) => setSearchBookingInput(e.target.value)}
                placeholder="Booking # (e.g. TD-9021)..."
                className="pl-7 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs w-44 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!searchBookingInput.trim() || actionLoading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1"
            >
              {actionLoading ? <FaSpinner className="animate-spin text-xs" /> : 'Lookup'}
            </button>
          </form>

          <button 
            onClick={fetchTestDrives}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer flex items-center gap-1 font-medium text-xs"
            title="Refresh Data"
          >
            <FaRedo className={`text-xs ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Mode Navigation Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === "bookings"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FaClock className="text-xs" />
            <span>Bookings & Actions</span>
            {testDrives.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === "bookings" ? "bg-white/30 text-white" : "bg-blue-100 text-blue-800"
              }`}>
                {testDrives.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("fleet")}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === "fleet"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FaCar className="text-xs" />
            <span>Showroom Demo Fleet</span>
            {availableSlots.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === "fleet" ? "bg-white/30 text-white" : "bg-gray-200 text-gray-700"
              }`}>
                {availableSlots.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "fleet" && (
          <div className="relative">
            <input
              type="text"
              value={fleetSearch}
              onChange={(e) => setFleetSearch(e.target.value)}
              placeholder="Search vehicle model..."
              className="pl-3 pr-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs w-48 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* TAB 1: BOOKINGS & ACTIONS VIEW */}
      {activeTab === "bookings" && (
        <div className="flex flex-col gap-4">
          
          {/* Quick Action Controller Bar for Selected Booking */}
          <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50/40 to-gray-50 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Active Booking Operations</span>
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <span>Selected Booking:</span>
                <span className="font-mono text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200 shadow-2xs">
                  {selectedBookingNo || searchBookingInput || "None Selected"}
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => handleTriggerAction('read')}
                disabled={!selectedBookingNo && !searchBookingInput}
                className="px-2.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1 disabled:opacity-50"
                title="Read Booking Details"
              >
                <FaInfoCircle className="text-blue-500 text-xs" /> Read Details
              </button>

              <button
                onClick={() => handleTriggerAction('notify')}
                disabled={!selectedBookingNo && !searchBookingInput}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1 disabled:opacity-50"
                title="Notify Sales Advisor"
              >
                <FaBell className="text-amber-300 text-xs" /> Notify Advisor
              </button>

              <button
                onClick={() => handleTriggerAction('feedback')}
                disabled={!selectedBookingNo && !searchBookingInput}
                className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1 disabled:opacity-50"
                title="Trigger Feedback Survey"
              >
                <FaCommentAlt className="text-purple-200 text-xs" /> Trigger Feedback
              </button>

              <button
                onClick={() => handleTriggerAction('feedback-response')}
                disabled={!selectedBookingNo && !searchBookingInput}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1 disabled:opacity-50"
                title="Get Feedback Response"
              >
                <FaCheckCircle className="text-emerald-300 text-xs" /> Feedback Resp
              </button>

              <button
                onClick={() => handleTriggerAction('confirm')}
                disabled={!selectedBookingNo && !searchBookingInput}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1 disabled:opacity-50"
                title="Booking Confirmation Communication"
              >
                <FaPaperPlane className="text-white text-xs" /> Confirm Comm
              </button>
            </div>
          </div>

          {/* Action API Output Result Card */}
          {actionOutput && (
            <div className={`p-4 rounded-xl text-xs space-y-2 animate-fade-in ${
              actionOutput.ok 
                ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-900' 
                : 'bg-rose-50/80 border border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                <h4 className="font-extrabold text-sm flex items-center gap-2">
                  <FaCheckCircle className={actionOutput.ok ? 'text-emerald-600' : 'text-rose-600'} />
                  Action '{actionOutput.action}' executed for Booking #{actionOutput.bookingNo}
                </h4>
                <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200 font-bold">
                  {actionOutput.ok ? 'Completed' : 'Response'}
                </span>
              </div>

              {actionOutput.error ? (
                <p className="text-xs font-medium text-rose-700">{actionOutput.error}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {typeof actionOutput.data === 'object' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1">
                      {actionOutput.data.advisor && (
                        <div className="bg-white p-2 rounded border border-emerald-200">
                          <span className="text-[10px] text-gray-400 block font-bold uppercase">Sales Advisor</span>
                          <span className="font-bold text-gray-800 text-xs">{renderSafeVal(actionOutput.data.advisor)}</span>
                        </div>
                      )}
                      {actionOutput.data.status && (
                        <div className="bg-white p-2 rounded border border-emerald-200">
                          <span className="text-[10px] text-gray-400 block font-bold uppercase">Status</span>
                          <span className="font-bold text-emerald-700 text-xs">{renderSafeVal(actionOutput.data.status)}</span>
                        </div>
                      )}
                      {actionOutput.data.date && (
                        <div className="bg-white p-2 rounded border border-emerald-200">
                          <span className="text-[10px] text-gray-400 block font-bold uppercase">Slot Date & Time</span>
                          <span className="font-mono font-bold text-gray-800 text-xs">{renderSafeVal(actionOutput.data.date)} {renderSafeVal(actionOutput.data.time, '')}</span>
                        </div>
                      )}
                      {actionOutput.data.vehicle && (
                        <div className="bg-white p-2 rounded border border-emerald-200">
                          <span className="text-[10px] text-gray-400 block font-bold uppercase">Vehicle</span>
                          <span className="font-bold text-gray-800 text-xs truncate block">{formatVehicleDisplay(actionOutput.data.vehicle)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <details className="cursor-pointer text-[10px]">
                    <summary className="font-bold text-gray-600 hover:text-gray-900">View Raw Response Data</summary>
                    <pre className="mt-1 font-mono text-[10px] p-2.5 bg-gray-900 text-emerald-400 rounded-lg overflow-x-auto max-h-48">
                      {JSON.stringify(actionOutput.data, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          )}

          {/* Customer Test Drive Bookings Table */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
                <FaClock className="text-blue-600" /> Customer Test Drive History ({testDrives.length})
              </h3>
            </div>

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
                <FaSpinner className="animate-spin text-xl text-blue-600" />
                <span className="text-xs font-medium">Loading customer test drives...</span>
              </div>
            ) : testDrives.length === 0 ? (
              <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-1">
                <FaInfoCircle className="mx-auto text-xl text-gray-300 mb-1" />
                <p className="font-bold text-gray-700 text-xs">No active test drive bookings found for Customer #{customerNumber || 'N/A'}.</p>
                <p className="text-[11px] text-gray-400">
                  You can use the search bar at the top right to lookup any existing Booking # directly (e.g. TD-9021).
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[9px] border-b border-gray-100">
                    <tr>
                      <th className="py-2.5 px-3">Booking #</th>
                      <th className="py-2.5 px-3">Vehicle Model</th>
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">Showroom Branch</th>
                      <th className="py-2.5 px-3">Sales Advisor</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
                    {testDrives.map((row, idx) => {
                      const bookingNo = row.bookingNumber || row.id || `TD-${idx+1}`;
                      const isSelected = selectedBookingNo === bookingNo;
                      return (
                        <tr key={idx} className={`hover:bg-blue-50/40 transition-colors ${isSelected ? 'bg-blue-50/60 font-semibold' : ''}`}>
                          <td className="py-3 px-3 font-mono font-bold text-blue-600">{renderSafeVal(bookingNo)}</td>
                          <td className="py-3 px-3 font-bold text-gray-900">{formatVehicleDisplay(row.vehicle || row.description || row)}</td>
                          <td className="py-3 px-3 font-mono text-gray-600">{renderSafeVal(row.date)} {renderSafeVal(row.time, '')}</td>
                          <td className="py-3 px-3 text-gray-800">{renderSafeVal(row.branch || row.branchCode)}</td>
                          <td className="py-3 px-3 text-gray-800">{renderSafeVal(row.advisor || row.salesAdvisor)}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.status === 'CONFIRMED' || row.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {renderSafeVal(row.status)}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => { setSelectedBookingNo(bookingNo); handleTriggerAction('notify', bookingNo); }}
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[10px] font-bold cursor-pointer"
                                title="Notify Sales Advisor"
                              >
                                Notify
                              </button>
                              <button 
                                onClick={() => { setSelectedBookingNo(bookingNo); handleTriggerAction('feedback', bookingNo); }}
                                className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-[10px] font-bold cursor-pointer"
                                title="Trigger Feedback"
                              >
                                Feedback
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: SHOWROOM DEMO FLEET VIEW */}
      {activeTab === "fleet" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
              <FaCar className="text-blue-600" /> Showroom Test Drive Demo Fleet ({filteredFleet.length} Vehicles)
            </h3>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <FaSpinner className="animate-spin text-2xl text-blue-600" />
              <span className="text-xs font-medium">Loading available demo vehicles...</span>
            </div>
          ) : filteredFleet.length === 0 ? (
            <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No demo vehicles matching "{fleetSearch}".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[550px] overflow-y-auto pr-1">
              {filteredFleet.map((slot, idx) => (
                <div 
                  key={idx} 
                  className="p-3.5 bg-white border border-gray-100 hover:border-blue-400 rounded-xl flex flex-col justify-between gap-2 hover:shadow-xs transition-all"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-mono font-bold border border-blue-100">
                        {slot.status || 'AVAILABLE'}
                      </span>
                      {slot.modelYear && (
                        <span className="text-[10px] text-gray-400 font-bold">{slot.modelYear}</span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-gray-900 text-xs leading-snug mt-1" title={formatVehicleDisplay(slot.description || slot.vehicle || slot)}>
                      {formatVehicleDisplay(slot.description || slot.vehicle || slot)}
                    </h4>
                    {slot.registrationNumber && (
                      <span className="text-[10px] font-mono text-gray-500">Reg: {slot.registrationNumber}</span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-gray-400" /> {renderSafeVal(slot.branch || (slot.branchCode ? `Branch ${slot.branchCode}` : 'Showroom'))}
                    </span>
                    {slot.vehicleNumber && (
                      <span className="font-mono text-gray-400">#{slot.vehicleNumber}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
