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
  FaCalendarAlt,
  FaCheck,
  FaArrowRight
} from 'react-icons/fa';

export default function SalesTestDriveView() {
  const { customer, group: contextGroup } = useCustomer();
  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || '');
  const customerNumber = customer?.customerNumber || "";
  const prospectNumber = customer?.prospectNumber || "";
  const enquiryNumber = customer?.enquiryNumber || (new URLSearchParams(window.location.search).get('enquiryNumber') || "");

  const [activeTab, setActiveTab] = useState("bookings"); // "bookings" | "fleet"
  const [filterMode, setFilterMode] = useState("customer"); // "customer" | "date"
  const [selectedDate, setSelectedDate] = useState("");
  
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
      if (val.code) return String(val.code);
      return fallback;
    }
    const str = String(val).trim();
    if (str === '{}' || str === '[]' || str === '') return fallback;
    return str;
  };

  const fetchTestDrives = async () => {
    setLoading(true);
    try {
      // 1. Fetch available test drive fleet slots for group
      const slotsUrl = `/api/v1/test-drives/vehicles?group=${group}`;
      const slotsRes = await apiFetch(slotsUrl);
      if (slotsRes && slotsRes.ok && Array.isArray(slotsRes.data)) {
        setAvailableSlots(slotsRes.data);
      } else {
        setAvailableSlots([]);
      }

      // 2. Fetch customer bookings or date bookings
      let listUrl = null;
      if (filterMode === 'date' && selectedDate) {
        listUrl = `/api/v1/test-drives?group=${group}&date=${selectedDate}`;
      } else if (customerNumber) {
        listUrl = `/api/v1/test-drives?group=${group}&customerNumber=${customerNumber}`;
      } else if (enquiryNumber) {
        listUrl = `/api/v1/test-drives?group=${group}&enquiryNumber=${enquiryNumber}`;
      } else if (prospectNumber) {
        listUrl = `/api/v1/test-drives?group=${group}&prospectNumber=${prospectNumber}`;
      }

      if (listUrl) {
        let listRes = await apiFetch(listUrl);
        let bookings = (listRes && listRes.ok && Array.isArray(listRes.data)) ? listRes.data : [];

        // If customerNumber returned 0 and enquiryNumber/prospectNumber is present, fallback
        if (bookings.length === 0 && enquiryNumber) {
          const fallbackRes = await apiFetch(`/api/v1/test-drives?group=${group}&enquiryNumber=${enquiryNumber}`);
          if (fallbackRes && fallbackRes.ok && Array.isArray(fallbackRes.data)) {
            bookings = fallbackRes.data;
          }
        } else if (bookings.length === 0 && prospectNumber) {
          const fallbackRes = await apiFetch(`/api/v1/test-drives?group=${group}&prospectNumber=${prospectNumber}`);
          if (fallbackRes && fallbackRes.ok && Array.isArray(fallbackRes.data)) {
            bookings = fallbackRes.data;
          }
        }

        setTestDrives(bookings);
        if (bookings.length > 0 && !selectedBookingNo) {
          const firstNo = bookings[0].bookingId || bookings[0].bookingNumber || bookings[0].id || "";
          setSelectedBookingNo(firstNo);
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
  }, [group, customerNumber, prospectNumber, customer?.branchCode, filterMode, selectedDate]);

  // Execute operations cleanly
  const handleTriggerAction = async (actionType, targetBookingNo) => {
    const bookingNo = targetBookingNo || selectedBookingNo || searchBookingInput;
    if (!bookingNo) return;

    setSelectedBookingNo(bookingNo);
    setActionLoading(true);
    setActionOutput(null);

    try {
      let endpoint = `/api/v1/test-drives/${group}/${bookingNo}`;
      let actionLabel = "";

      if (actionType === 'read') {
        actionLabel = "Booking Details";
      } else if (actionType === 'notify') {
        endpoint += `/advisor-notification`;
        actionLabel = "Notify Sales Advisor";
      } else if (actionType === 'trigger-feedback') {
        endpoint += `/feedback`;
        actionLabel = "Trigger Feedback Survey";
      } else if (actionType === 'receive-feedback') {
        endpoint += `/feedback`;
        actionLabel = "Customer Feedback";
      } else if (actionType === 'confirmation') {
        endpoint += `/confirmation`;
        actionLabel = "Confirmation Communication";
      }

      const res = await apiFetch(endpoint);
      if (res && res.ok && res.data) {
        setActionOutput({ 
          action: actionType, 
          label: actionLabel,
          bookingNo, 
          data: res.data, 
          ok: true 
        });

        // If booking data is returned, populate testDrives so table displays it instead of empty box
        if (res.data.bookingId || res.data.bookingNumber) {
          setTestDrives(prev => {
            const bId = String(res.data.bookingId || res.data.bookingNumber);
            const exists = prev.some(b => String(b.bookingId || b.bookingNumber || b.id) === bId);
            return exists ? prev : [res.data, ...prev];
          });
        }
      } else {
        setActionOutput({ 
          action: actionType, 
          label: actionLabel,
          bookingNo, 
          error: res?.data?.message || res?.statusText || "No booking records found for ID", 
          ok: false 
        });
      }
    } catch (err) {
      setActionOutput({ 
        action: actionType, 
        bookingNo, 
        error: err.message || "Failed to execute request", 
        ok: false 
      });
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
    const desc = (s.vehicle?.description || s.description || '').toString().toLowerCase();
    const brand = (s.vehicle?.brand || s.brand || '').toString().toLowerCase();
    const reg = (s.vehicle?.registrationNumber || s.registrationNumber || '').toString().toLowerCase();
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
              Customer: <span className="font-bold text-gray-800">{customer?.fullName || 'Active Customer'}</span> 
              {customerNumber ? ` (#${customerNumber})` : ''}
              {prospectNumber ? ` | Prospect #${prospectNumber}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Lookup Booking Search Bar */}
          <form onSubmit={handleLookupBookingSubmit} className="flex items-center gap-1.5">
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-[10px]" />
              <input
                type="text"
                value={searchBookingInput}
                onChange={(e) => setSearchBookingInput(e.target.value)}
                placeholder="Booking # (e.g. 148050)..."
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

      {/* Main Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
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

        {activeTab === "bookings" && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 font-semibold">Filter:</span>
            <button
              onClick={() => { setFilterMode('customer'); setSelectedDate(''); }}
              className={`px-2 py-1 rounded text-[11px] font-bold ${
                filterMode === 'customer' 
                  ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              By Customer
            </button>
            <button
              onClick={() => { setFilterMode('date'); if (!selectedDate) setSelectedDate('2024-11-25'); }}
              className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 ${
                filterMode === 'date' 
                  ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaCalendarAlt className="text-[10px]" /> By Date
            </button>
            {filterMode === 'date' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2 py-0.5 bg-gray-50 border border-gray-300 rounded text-xs font-mono"
              />
            )}
          </div>
        )}

        {activeTab === "fleet" && (
          <div className="relative">
            <input
              type="text"
              value={fleetSearch}
              onChange={(e) => setFleetSearch(e.target.value)}
              placeholder="Search demo model, reg #..."
              className="pl-3 pr-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs w-52 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* TAB 1: BOOKINGS & ACTIONS */}
      {activeTab === "bookings" && (
        <div className="flex flex-col gap-4">
          
          {/* Quick Action Controller Bar */}
          <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50/40 to-slate-50 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Active Booking Operations</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-extrabold text-gray-900 text-xs">Selected Booking:</span>
                <span className="font-mono text-blue-700 bg-white px-2.5 py-0.5 rounded border border-blue-200 shadow-2xs font-bold text-xs">
                  {selectedBookingNo || searchBookingInput || "None Selected"}
                </span>
                {!selectedBookingNo && !searchBookingInput && (
                  <button
                    onClick={() => {
                      setSelectedBookingNo("148050");
                      handleTriggerAction('read', "148050");
                    }}
                    className="text-[10px] text-blue-600 hover:underline font-bold bg-white px-2 py-0.5 rounded border border-blue-200"
                  >
                    Quick Test: #148050
                  </button>
                )}
              </div>
            </div>

            {/* 5 Clean Operations */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => handleTriggerAction('read')}
                disabled={(!selectedBookingNo && !searchBookingInput) || actionLoading}
                className="px-2.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1 disabled:opacity-40"
              >
                <FaInfoCircle className="text-blue-600 text-xs" /> Read Details
              </button>

              <button
                onClick={() => handleTriggerAction('notify')}
                disabled={(!selectedBookingNo && !searchBookingInput) || actionLoading}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1 disabled:opacity-40"
              >
                <FaBell className="text-amber-300 text-xs" /> Notify Advisor
              </button>

              <button
                onClick={() => handleTriggerAction('trigger-feedback')}
                disabled={(!selectedBookingNo && !searchBookingInput) || actionLoading}
                className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1 disabled:opacity-40"
              >
                <FaCommentAlt className="text-purple-200 text-xs" /> Trigger Feedback
              </button>

              <button
                onClick={() => handleTriggerAction('receive-feedback')}
                disabled={(!selectedBookingNo && !searchBookingInput) || actionLoading}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1 disabled:opacity-40"
              >
                <FaCheckCircle className="text-emerald-300 text-xs" /> Receive Feedback
              </button>

              <button
                onClick={() => handleTriggerAction('confirmation')}
                disabled={(!selectedBookingNo && !searchBookingInput) || actionLoading}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1 disabled:opacity-40"
              >
                <FaPaperPlane className="text-white text-xs" /> Confirm Comm
              </button>
            </div>
          </div>

          {/* Action Output Result Card */}
          {actionOutput && (
            <div className={`p-4 rounded-xl text-xs space-y-2 animate-fade-in ${
              actionOutput.ok 
                ? 'bg-emerald-50/80 border border-emerald-300 text-emerald-950' 
                : 'bg-rose-50/80 border border-rose-300 text-rose-950'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <h4 className="font-extrabold text-sm flex items-center gap-2">
                  <FaCheckCircle className={actionOutput.ok ? 'text-emerald-600' : 'text-rose-600'} />
                  {actionOutput.label || `Action`} for Booking #{actionOutput.bookingNo}
                </h4>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded font-bold ${
                    actionOutput.ok ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}>
                    {actionOutput.ok ? 'Success' : 'Error'}
                  </span>
                  <button
                    onClick={() => setActionOutput(null)}
                    className="w-6 h-6 rounded-md bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-200 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors shadow-2xs"
                    title="Close / Hide Details"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {actionOutput.error ? (
                <p className="text-xs font-medium text-rose-700">{actionOutput.error}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {typeof actionOutput.data === 'object' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1">
                      {actionOutput.data.customerName && (
                        <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                          <span className="text-[10px] text-gray-400 block font-bold uppercase">Customer</span>
                          <span className="font-bold text-gray-900 text-xs">{actionOutput.data.customerName}</span>
                          <span className="text-[10px] text-gray-500 block">Cust #{actionOutput.data.customerNumber || 'N/A'}</span>
                        </div>
                      )}

                      {actionOutput.data.advisor && (
                        <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                          <span className="text-[10px] text-gray-400 block font-bold uppercase">Sales Advisor</span>
                          <span className="font-bold text-gray-800 text-xs">{renderSafeVal(actionOutput.data.advisor?.name || actionOutput.data.advisor)}</span>
                          {actionOutput.data.advisor?.email && (
                            <span className="text-[10px] text-gray-500 block truncate">{actionOutput.data.advisor.email}</span>
                          )}
                        </div>
                      )}

                      {actionOutput.data.status && (
                        <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                          <span className="text-[10px] text-gray-400 block font-bold uppercase">Booking Status</span>
                          <span className="font-bold text-emerald-700 text-xs">{renderSafeVal(actionOutput.data.status)}</span>
                          {actionOutput.data.outcome && (
                            <span className="text-[10px] text-gray-500 block">Outcome: {actionOutput.data.outcome}</span>
                          )}
                        </div>
                      )}

                      {actionOutput.data.slot && (
                        <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                          <span className="text-[10px] text-gray-400 block font-bold uppercase">Slot Date & Time</span>
                          <span className="font-mono font-bold text-gray-800 text-xs">
                            {actionOutput.data.slot.startDate || actionOutput.data.slot.startAt?.slice(0, 10) || 'Scheduled'}
                          </span>
                          <span className="text-[10px] text-gray-500 block">Location: {actionOutput.data.slot.location || 'Showroom'}</span>
                        </div>
                      )}

                      {actionOutput.data.vehicle && (
                        <div className="bg-white p-2.5 rounded-lg border border-emerald-200 col-span-2">
                          <span className="text-[10px] text-gray-400 block font-bold uppercase">Test Drive Vehicle</span>
                          <span className="font-bold text-gray-800 text-xs block">{formatVehicleDisplay(actionOutput.data.vehicle)}</span>
                          {actionOutput.data.vehicle?.registrationNumber && (
                            <span className="text-[10px] font-mono text-gray-500">Reg: {actionOutput.data.vehicle.registrationNumber}</span>
                          )}
                        </div>
                      )}

                      {actionOutput.data.deliveryStatus !== undefined && (
                        <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                          <span className="text-[10px] text-gray-400 block font-bold uppercase">Advisor Delivery</span>
                          <span className="font-bold text-blue-700 text-xs">{actionOutput.data.deliveryStatus || 'Sent / Queued'}</span>
                          <span className="text-[10px] font-mono text-gray-400 block">Msg: {actionOutput.data.messageId || 'N/A'}</span>
                        </div>
                      )}

                      {actionOutput.data.feedbackStatus !== undefined && (
                        <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                          <span className="text-[10px] text-gray-400 block font-bold uppercase">Feedback Survey</span>
                          <span className="font-bold text-purple-700 text-xs">{actionOutput.data.feedbackStatus || 'Recorded'}</span>
                          <span className="text-[10px] text-gray-500 block">Routing: {actionOutput.data.routingDecision || 'Standard'}</span>
                        </div>
                      )}

                      {actionOutput.data.messageStatus !== undefined && (
                        <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                          <span className="text-[10px] text-gray-400 block font-bold uppercase">Confirmation Comm</span>
                          <span className="font-bold text-emerald-700 text-xs">{actionOutput.data.messageStatus || 'Delivered'}</span>
                          <span className="text-[10px] font-mono text-gray-400 block">Msg: {actionOutput.data.messageId || 'N/A'}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Customer Test Drive Bookings Table */}
          <div className="flex flex-col gap-2">
            {(!actionOutput || testDrives.length > 0) && (
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
                  <FaClock className="text-blue-600" />
                  {filterMode === 'date' 
                    ? `Test Drive Bookings on ${selectedDate || 'Selected Date'} (${testDrives.length})` 
                    : `Customer Test Drive History (${testDrives.length})`}
                </h3>
              </div>
            )}

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
                <FaSpinner className="animate-spin text-xl text-blue-600" />
                <span className="text-xs font-medium">Loading test drive bookings...</span>
              </div>
            ) : testDrives.length === 0 ? (
              !actionOutput && (
                <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-2">
                  <FaInfoCircle className="mx-auto text-xl text-gray-400 mb-1" />
                  <p className="font-bold text-gray-700 text-xs">
                    No test drive bookings found for {filterMode === 'date' ? `date ${selectedDate}` : `Customer #${customerNumber || 'N/A'}`}.
                  </p>
                  <p className="text-[11px] text-gray-500 max-w-lg mx-auto">
                    You can look up any specific Booking ID or switch filter to 
                    <button 
                      onClick={() => { setFilterMode('date'); setSelectedDate('2024-11-25'); }} 
                      className="ml-1 text-blue-600 font-bold hover:underline"
                    >
                      Date 2024-11-25 (49 Bookings)
                    </button>
                    .
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSelectedBookingNo("148050");
                        handleTriggerAction('read', "148050");
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                    >
                      <span>Quick View Booking #148050</span>
                      <FaArrowRight className="text-[10px]" />
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-x-auto overflow-y-auto max-h-[460px] shadow-2xs relative bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-gray-700 font-extrabold uppercase text-[9px] sticky top-0 z-10 shadow-2xs">
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-3 bg-slate-100">Booking #</th>
                      <th className="py-3 px-3 bg-slate-100">Vehicle Model</th>
                      <th className="py-3 px-3 bg-slate-100">Slot Date & Time</th>
                      <th className="py-3 px-3 bg-slate-100">Branch</th>
                      <th className="py-3 px-3 bg-slate-100">Sales Advisor</th>
                      <th className="py-3 px-3 bg-slate-100">Status</th>
                      <th className="py-3 px-3 text-right bg-slate-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
                    {testDrives.map((row, idx) => {
                      const bookingNo = row.bookingId || row.bookingNumber || row.id || `TD-${idx+1}`;
                      const isSelected = selectedBookingNo === String(bookingNo);
                      const vehicleName = formatVehicleDisplay(row.vehicle || row.description || row);
                      const slotDate = row.slot?.startDate || row.date || 'N/A';
                      const slotTime = row.slot?.startAt ? new Date(row.slot.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (row.time || '');
                      const branchText = row.branch?.name || row.branch?.code || (typeof row.branch === 'string' && row.branch !== '{}' ? row.branch : '') || 'Showroom';
                      const advisorText = row.advisor?.name || row.advisor?.code || (typeof row.advisor === 'string' && row.advisor !== '{}' ? row.advisor : '') || 'Assigned Advisor';

                      return (
                        <tr key={idx} className={`hover:bg-blue-50/40 transition-colors ${isSelected ? 'bg-blue-50/70 font-semibold' : ''}`}>
                          <td className="py-3 px-3 font-mono font-bold text-blue-600">
                            <button
                              onClick={() => { setSelectedBookingNo(String(bookingNo)); handleTriggerAction('read', String(bookingNo)); }}
                              className="hover:underline text-left cursor-pointer"
                            >
                              #{bookingNo}
                            </button>
                          </td>
                          <td className="py-3 px-3 font-bold text-gray-900 max-w-[200px] truncate" title={vehicleName}>
                            {vehicleName}
                          </td>
                          <td className="py-3 px-3 font-mono text-gray-600 whitespace-nowrap">
                            {slotDate} {slotTime}
                          </td>
                          <td className="py-3 px-3 text-gray-800 whitespace-nowrap">{renderSafeVal(branchText)}</td>
                          <td className="py-3 px-3 text-gray-800 whitespace-nowrap">{renderSafeVal(advisorText)}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.status === 'CONFIRMED' || row.status === 'COMPLETED' || row.outcome === 'SCHEDULED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {renderSafeVal(row.status || row.outcome)}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => { setSelectedBookingNo(String(bookingNo)); handleTriggerAction('read', String(bookingNo)); }}
                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Read
                              </button>
                              <button 
                                onClick={() => { setSelectedBookingNo(String(bookingNo)); handleTriggerAction('notify', String(bookingNo)); }}
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Notify
                              </button>
                              <button 
                                onClick={() => { setSelectedBookingNo(String(bookingNo)); handleTriggerAction('trigger-feedback', String(bookingNo)); }}
                                className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Feedback
                              </button>
                              <button 
                                onClick={() => { setSelectedBookingNo(String(bookingNo)); handleTriggerAction('confirmation', String(bookingNo)); }}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Confirm
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
              <span className="text-xs font-medium">Loading demo vehicles...</span>
            </div>
          ) : filteredFleet.length === 0 ? (
            <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No demo vehicles matching "{fleetSearch}".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[550px] overflow-y-auto pr-1">
              {filteredFleet.map((slot, idx) => {
                const veh = slot.vehicle || slot;
                const title = formatVehicleDisplay(veh);
                const reg = veh.registrationNumber || slot.registrationNumber;
                const vehNo = veh.vehicleNumber || slot.vehicleNumber;
                const branchName = slot.branch?.name || (slot.branch?.code ? `Branch ${slot.branch.code}` : 'Showroom');

                return (
                  <div 
                    key={idx} 
                    className="p-3.5 bg-white border border-gray-200 hover:border-blue-400 rounded-xl flex flex-col justify-between gap-2 hover:shadow-xs transition-all"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-mono font-bold border border-blue-100">
                          {slot.status || 'AVAILABLE'}
                        </span>
                        {veh.brand && (
                          <span className="text-[10px] text-gray-500 font-bold uppercase">{veh.brand}</span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-gray-900 text-xs leading-snug mt-1" title={title}>
                        {title}
                      </h4>
                      {reg && (
                        <span className="text-[10px] font-mono text-gray-600">Reg: {reg}</span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                      <span className="flex items-center gap-1 truncate" title={branchName}>
                        <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" /> 
                        <span className="truncate">{branchName}</span>
                      </span>
                      {vehNo && (
                        <span className="font-mono text-gray-400 flex-shrink-0">#{vehNo}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
