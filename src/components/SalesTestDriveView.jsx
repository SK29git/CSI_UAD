import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaCar, 
  FaClock, 
  FaUser, 
  FaRedo, 
  FaSpinner, 
  FaCheckCircle, 
  FaSearch, 
  FaInfoCircle, 
  FaMapMarkerAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaFileAlt,
  FaPaperPlane,
  FaChevronRight
} from 'react-icons/fa';

export default function SalesTestDriveView() {
  const { 
    customer, 
    group: contextGroup,
    enquiryNumber: contextEnquiryNumber,
    enquiries: contextEnquiries,
    setEnquiryNumber: setContextEnquiryNumber
  } = useCustomer();

  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || 'BMW');
  const customerNumber = customer?.customerNumber || "";

  // Enquiries list from customer object or context
  const customerEnquiries = (customer?.enquiries && Array.isArray(customer.enquiries) && customer.enquiries.length > 0)
    ? customer.enquiries
    : (contextEnquiries && Array.isArray(contextEnquiries) && contextEnquiries.length > 0)
      ? contextEnquiries
      : [];

  const urlEnquiry = (new URLSearchParams(window.location.search).get('enquiryNumber') || new URLSearchParams(window.location.search).get('enquiry') || "");
  const initialEnquiry = customer?.enquiryNumber 
    || (customerEnquiries[0] && customerEnquiries[0].enquiryNumber)
    || contextEnquiryNumber 
    || urlEnquiry 
    || "";

  const [activeTab, setActiveTab] = useState("bookings"); // "bookings" | "fleet"
  const [filterMode, setFilterMode] = useState("enquiry"); // "enquiry" | "customer"
  const [selectedEnquiry, setSelectedEnquiry] = useState(initialEnquiry);
  const [searchEnquiryInput, setSearchEnquiryInput] = useState("");
  
  const [testDrives, setTestDrives] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [fleetSearch, setFleetSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Search/Lookup Booking state & Details Card
  const [searchBookingInput, setSearchBookingInput] = useState("");
  const [activeBookingDetails, setActiveBookingDetails] = useState(null);
  const [activeDetailType, setActiveDetailType] = useState('details'); // 'details' | 'confirmation'
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Synchronize active enquiry when customer or context updates
  useEffect(() => {
    const active = customer?.enquiryNumber 
      || (customer?.enquiries && customer.enquiries[0]?.enquiryNumber) 
      || contextEnquiryNumber 
      || urlEnquiry 
      || "";
    if (active && (!selectedEnquiry || !customerEnquiries.some(e => String(e.enquiryNumber) === String(selectedEnquiry)))) {
      setSelectedEnquiry(active);
    }
  }, [customer, contextEnquiryNumber, urlEnquiry]);

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

  // 1. Fetch Bookings and Fleet according to Postman collection APIs
  const fetchTestDrives = async (overrideEnquiry = null, overrideFilter = null) => {
    setLoading(true);
    const mode = overrideFilter !== null ? overrideFilter : filterMode;
    const enqToQuery = overrideEnquiry !== null 
      ? overrideEnquiry 
      : (selectedEnquiry || customer?.enquiryNumber || (customerEnquiries[0] && customerEnquiries[0].enquiryNumber) || contextEnquiryNumber || urlEnquiry || "");

    try {
      // 1.1 Fetch available demo vehicles: GET /api/v1/test-drives/vehicles?group={{group}}
      const slotsUrl = `/api/v1/test-drives/vehicles?group=${encodeURIComponent(group)}`;
      apiFetch(slotsUrl).then(res => {
        if (res && res.ok && Array.isArray(res.data)) {
          setAvailableSlots(res.data);
        } else {
          setAvailableSlots([]);
        }
      }).catch(() => setAvailableSlots([]));

      // 1.2 Fetch bookings based on active filter mode
      let bookings = [];

      if (mode === 'customer' && customerNumber) {
        // GET /api/v1/test-drives?group={{group}}&customerNumber={{customerNumber}}
        const custRes = await apiFetch(`/api/v1/test-drives?group=${encodeURIComponent(group)}&customerNumber=${encodeURIComponent(customerNumber)}`);
        if (custRes && custRes.ok && Array.isArray(custRes.data)) {
          bookings = custRes.data;
        }
      } else {
        // Default mode: Search on the basis of Enquiry Number (POSTMAN: Test drives for a lead)
        // GET /api/v1/test-drives?group={{group}}&enquiryNumber={{enquiryNumber}}
        if (enqToQuery) {
          const enqRes = await apiFetch(`/api/v1/test-drives?group=${encodeURIComponent(group)}&enquiryNumber=${encodeURIComponent(enqToQuery.trim())}`);
          if (enqRes && enqRes.ok && Array.isArray(enqRes.data)) {
            bookings = enqRes.data;
          }
        }

        // Fallback to customerNumber if enquiry was empty or returned no records
        if (bookings.length === 0 && !enqToQuery && customerNumber) {
          const custRes = await apiFetch(`/api/v1/test-drives?group=${encodeURIComponent(group)}&customerNumber=${encodeURIComponent(customerNumber)}`);
          if (custRes && custRes.ok && Array.isArray(custRes.data)) {
            bookings = custRes.data;
          }
        }
      }

      setTestDrives(bookings);
    } catch (err) {
      console.warn("Test drive fetch error:", err);
      setTestDrives([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestDrives();
  }, [group, selectedEnquiry, customerNumber, filterMode]);

  // 2. Fetch specific Booking Details or Confirmation Communication from Postman collection
  // API 3: GET /api/v1/test-drives/{{group}}/{{bookingNumber}} (Confirm booking read)
  // API 4: GET /api/v1/test-drives/{{group}}/{{bookingNumber}}/confirmation (Booking confirmation communication)
  const fetchBookingAction = async (bookingNo, type = 'details') => {
    if (!bookingNo) return;
    setDetailsLoading(true);
    setActiveDetailType(type);

    try {
      const endpoint = type === 'confirmation'
        ? `/api/v1/test-drives/${encodeURIComponent(group)}/${encodeURIComponent(bookingNo)}/confirmation`
        : `/api/v1/test-drives/${encodeURIComponent(group)}/${encodeURIComponent(bookingNo)}`;

      const res = await apiFetch(endpoint);
      if (res && res.ok && res.data) {
        setActiveBookingDetails({
          bookingNo,
          type,
          data: res.data,
          ok: true
        });

        // If booking record was fetched and not in testDrives list, add it
        if (res.data.bookingId || res.data.bookingNumber) {
          setTestDrives(prev => {
            const bId = String(res.data.bookingId || res.data.bookingNumber);
            const exists = prev.some(b => String(b.bookingId || b.bookingNumber || b.id) === bId);
            return exists ? prev : [res.data, ...prev];
          });
        }
      } else {
        setActiveBookingDetails({
          bookingNo,
          type,
          error: res?.data?.message || res?.statusText || `No booking records found for #${bookingNo}`,
          ok: false
        });
      }
    } catch (err) {
      setActiveBookingDetails({
        bookingNo,
        type,
        error: err.message || "Failed to load booking information",
        ok: false
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEnquirySearchSubmit = (e) => {
    e.preventDefault();
    const clean = searchEnquiryInput.trim();
    if (clean) {
      setSelectedEnquiry(clean);
      if (setContextEnquiryNumber) setContextEnquiryNumber(clean);
      setFilterMode('enquiry');
      fetchTestDrives(clean, 'enquiry');
    }
  };

  const handleSelectEnquiryBadge = (enqNo) => {
    const clean = String(enqNo || '').trim();
    setSelectedEnquiry(clean);
    if (setContextEnquiryNumber) setContextEnquiryNumber(clean);
    setFilterMode('enquiry');
    fetchTestDrives(clean, 'enquiry');
  };

  const handleLookupBookingSubmit = (e) => {
    e.preventDefault();
    const clean = searchBookingInput.trim();
    if (clean) {
      fetchBookingAction(clean, 'details');
    }
  };

  const filteredFleet = availableSlots.filter(s => {
    if (!fleetSearch) return true;
    const q = fleetSearch.toLowerCase();
    const desc = (s.vehicle?.description || s.description || '').toString().toLowerCase();
    const brand = (s.vehicle?.brand || s.brand || '').toString().toLowerCase();
    const reg = (s.vehicle?.registrationNumber || s.registrationNumber || '').toString().toLowerCase();
    const brName = (s.branch?.name || '').toString().toLowerCase();
    return desc.includes(q) || brand.includes(q) || reg.includes(q) || brName.includes(q);
  });

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4 text-xs">
      
      {/* Top Header Bar */}
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
              {selectedEnquiry ? (
                <span> | Active Enquiry: <strong className="text-blue-600 font-mono font-bold">#{selectedEnquiry}</strong></span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Enquiry Number Search Bar */}
          <form onSubmit={handleEnquirySearchSubmit} className="flex items-center gap-1.5">
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-[10px]" />
              <input
                type="text"
                value={searchEnquiryInput}
                onChange={(e) => setSearchEnquiryInput(e.target.value)}
                placeholder="Search Enquiry #..."
                className="pl-7 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs w-40 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!searchEnquiryInput.trim() || loading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              {loading ? <FaSpinner className="animate-spin text-xs" /> : 'Search'}
            </button>
          </form>

          {/* Lookup Booking Search Bar */}
          <form onSubmit={handleLookupBookingSubmit} className="flex items-center gap-1.5">
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-[10px]" />
              <input
                type="text"
                value={searchBookingInput}
                onChange={(e) => setSearchBookingInput(e.target.value)}
                placeholder="Lookup Booking #..."
                className="pl-7 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs w-36 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!searchBookingInput.trim() || detailsLoading}
              className="px-2.5 py-1.5 bg-gray-700 hover:bg-gray-800 disabled:opacity-50 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              {detailsLoading ? <FaSpinner className="animate-spin text-xs" /> : 'Lookup'}
            </button>
          </form>

          <button 
            onClick={() => fetchTestDrives()}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer flex items-center gap-1 font-medium text-xs"
            title="Refresh Data"
          >
            <FaRedo className={`text-xs ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Customer Enquiries Quick Filter Bar */}
      {customerEnquiries.length > 0 && (
        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-blue-950 flex items-center gap-1">
              <FaInfoCircle className="text-blue-600 text-xs" /> Customer Enquiries:
            </span>
            {customerEnquiries.map((enq, idx) => {
              const enqNo = String(enq.enquiryNumber || '');
              const isSelected = String(selectedEnquiry) === enqNo;
              return (
                <button
                  key={enqNo || idx}
                  onClick={() => handleSelectEnquiryBadge(enqNo)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-blue-800 hover:bg-blue-100/80 border border-blue-200'
                  }`}
                >
                  <span>#{enqNo}</span>
                  {enq.model && <span className="opacity-90 font-sans font-medium text-[11px]">({enq.model})</span>}
                  {enq.status && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-sans uppercase font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-900'
                    }`}>
                      {enq.status}
                    </span>
                  )}
                  {enq.outcome && (
                    <span className={`text-[9px] px-1 py-0.2 rounded font-sans uppercase font-bold ${
                      isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {enq.outcome}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedEnquiry && (
            <span className="text-[11px] font-medium text-blue-900 bg-white px-2.5 py-1 rounded-lg border border-blue-200 font-mono">
              Filtered by Enquiry: <strong>#{selectedEnquiry}</strong>
            </span>
          )}
        </div>
      )}

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
            <span>Test Drive Bookings</span>
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-gray-500 font-semibold">Filter:</span>
            {selectedEnquiry && (
              <button
                onClick={() => { setFilterMode('enquiry'); fetchTestDrives(selectedEnquiry, 'enquiry'); }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer ${
                  filterMode === 'enquiry' 
                    ? 'bg-blue-600 text-white shadow-2xs' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Enquiry #{selectedEnquiry}
              </button>
            )}
            {customerNumber && (
              <button
                onClick={() => { setFilterMode('customer'); fetchTestDrives(null, 'customer'); }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filterMode === 'customer' 
                    ? 'bg-blue-600 text-white shadow-2xs' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Customer Bookings (#{customerNumber})
              </button>
            )}
          </div>
        )}

        {activeTab === "fleet" && (
          <div className="relative">
            <input
              type="text"
              value={fleetSearch}
              onChange={(e) => setFleetSearch(e.target.value)}
              placeholder="Search demo fleet..."
              className="pl-3 pr-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs w-52 focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* TAB 1: TEST DRIVE BOOKINGS */}
      {activeTab === "bookings" && (
        <div className="flex flex-col gap-4">
          
          {/* Booking Details Card (Loaded when clicking View Details or Confirmation) */}
          {activeBookingDetails && (
            <div className={`p-4 rounded-xl text-xs space-y-3 animate-fade-in ${
              activeBookingDetails.ok 
                ? 'bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/50 border border-blue-200 shadow-2xs text-gray-900' 
                : 'bg-rose-50/90 border border-rose-300 text-rose-950'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className={activeBookingDetails.ok ? 'text-blue-600' : 'text-rose-600'} />
                  <h4 className="font-extrabold text-sm text-gray-900">
                    {activeBookingDetails.type === 'confirmation' ? 'Booking Confirmation Communication' : 'Booking Details'} — Booking #{activeBookingDetails.bookingNo}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  {/* Switch between Details and Confirmation seamlessly */}
                  {activeBookingDetails.ok && (
                    <div className="flex items-center bg-white rounded-lg p-0.5 border border-gray-200 shadow-2xs">
                      <button
                        onClick={() => fetchBookingAction(activeBookingDetails.bookingNo, 'details')}
                        disabled={detailsLoading}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          activeBookingDetails.type === 'details' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Details
                      </button>
                      <button
                        onClick={() => fetchBookingAction(activeBookingDetails.bookingNo, 'confirmation')}
                        disabled={detailsLoading}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          activeBookingDetails.type === 'confirmation' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Confirmation
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setActiveBookingDetails(null)}
                    className="w-6 h-6 rounded-md bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-200 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors shadow-2xs"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {activeBookingDetails.error ? (
                <div className="p-3 bg-white rounded-lg border border-rose-200 text-rose-700 text-xs font-medium">
                  {activeBookingDetails.error}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {activeBookingDetails.data.customerName && (
                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
                      <span className="text-[10px] text-gray-400 block font-bold uppercase">Customer</span>
                      <span className="font-bold text-gray-900 text-xs">{activeBookingDetails.data.customerName}</span>
                      <span className="text-[10px] text-gray-500 block">Cust #{activeBookingDetails.data.customerNumber || 'N/A'}</span>
                    </div>
                  )}

                  {activeBookingDetails.data.advisor && (
                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
                      <span className="text-[10px] text-gray-400 block font-bold uppercase">Sales Advisor</span>
                      <span className="font-bold text-gray-800 text-xs">{renderSafeVal(activeBookingDetails.data.advisor?.name || activeBookingDetails.data.advisor)}</span>
                      {activeBookingDetails.data.advisor?.email && (
                        <span className="text-[10px] text-gray-500 block truncate">{activeBookingDetails.data.advisor.email}</span>
                      )}
                    </div>
                  )}

                  <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">Booking Status</span>
                    <span className="font-bold text-emerald-700 text-xs">{renderSafeVal(activeBookingDetails.data.status || 'Active')}</span>
                    {activeBookingDetails.data.outcome && (
                      <span className="text-[10px] text-gray-500 block">Outcome: {activeBookingDetails.data.outcome}</span>
                    )}
                  </div>

                  {activeBookingDetails.data.slot && (
                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
                      <span className="text-[10px] text-gray-400 block font-bold uppercase">Scheduled Slot</span>
                      <span className="font-mono font-bold text-gray-800 text-xs">
                        {activeBookingDetails.data.slot.startDate || activeBookingDetails.data.slot.startAt?.slice(0, 10) || 'Scheduled'}
                      </span>
                      <span className="text-[10px] text-gray-500 block">Location: {activeBookingDetails.data.slot.location || 'Showroom'}</span>
                    </div>
                  )}

                  {activeBookingDetails.data.vehicle && (
                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs col-span-2">
                      <span className="text-[10px] text-gray-400 block font-bold uppercase">Test Drive Vehicle</span>
                      <span className="font-bold text-gray-900 text-xs block">{formatVehicleDisplay(activeBookingDetails.data.vehicle)}</span>
                      {activeBookingDetails.data.vehicle?.registrationNumber && (
                        <span className="text-[10px] font-mono text-gray-500">Reg: {activeBookingDetails.data.vehicle.registrationNumber}</span>
                      )}
                    </div>
                  )}

                  {/* Confirmation Communication Fields */}
                  {activeBookingDetails.type === 'confirmation' && (
                    <>
                      <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">Message ID</span>
                        <span className="font-mono text-blue-700 font-bold text-xs">{activeBookingDetails.data.messageId || 'N/A'}</span>
                        <span className="text-[10px] text-gray-400 block">Comm ID</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">Delivery Status</span>
                        <span className="font-bold text-emerald-700 text-xs">{activeBookingDetails.data.deliveryStatus || activeBookingDetails.data.status || 'Sent'}</span>
                        <span className="text-[10px] text-gray-500 block">{activeBookingDetails.data.timestamp ? new Date(activeBookingDetails.data.timestamp).toLocaleString() : 'Delivered'}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Test Drive Bookings Table */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
                <FaClock className="text-blue-600" />
                {filterMode === 'customer' 
                  ? `Customer Test Drive Bookings (${testDrives.length})` 
                  : `Test Drives for Enquiry #${selectedEnquiry || 'N/A'} (${testDrives.length})`}
              </h3>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                <FaSpinner className="animate-spin text-xl text-blue-600" />
                <span className="text-xs font-medium">Loading test drive bookings...</span>
              </div>
            ) : testDrives.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-2">
                <FaInfoCircle className="mx-auto text-2xl text-gray-400 mb-1" />
                <p className="font-bold text-gray-800 text-sm">
                  No Test Drive Bookings Found
                </p>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  {filterMode === 'customer' 
                    ? `No test drive bookings found for Customer #${customerNumber || 'N/A'}.`
                    : `No test drive bookings found for Enquiry #${selectedEnquiry || 'N/A'}.`}
                </p>
                <p className="text-[11px] text-gray-400">
                  There are currently no active or historical test drive records matching this selection.
                </p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-x-auto shadow-2xs relative bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-gray-700 font-extrabold uppercase text-[9px] sticky top-0 z-10 shadow-2xs">
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-3 bg-slate-100">Booking #</th>
                      <th className="py-3 px-3 bg-slate-100">Enquiry #</th>
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
                      const vehicleName = formatVehicleDisplay(row.vehicle || row.description || row);
                      const slotDate = row.slot?.startDate || row.date || 'N/A';
                      const slotTime = row.slot?.startAt ? new Date(row.slot.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (row.time || '');
                      const branchText = row.branch?.name || row.branch?.code || (typeof row.branch === 'string' && row.branch !== '{}' ? row.branch : '') || 'Showroom';
                      const advisorText = row.advisor?.name || row.advisor?.code || (typeof row.advisor === 'string' && row.advisor !== '{}' ? row.advisor : '') || 'Assigned Advisor';

                      return (
                        <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-blue-600">
                            <button
                              onClick={() => fetchBookingAction(String(bookingNo), 'details')}
                              className="hover:underline text-left cursor-pointer"
                              title="View Booking Details"
                            >
                              #{bookingNo}
                            </button>
                          </td>
                          <td className="py-3 px-3 font-mono">
                            {row.enquiryNumber ? (
                              <button
                                onClick={() => handleSelectEnquiryBadge(String(row.enquiryNumber))}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200 cursor-pointer font-bold text-[10px] inline-flex items-center gap-1 shadow-2xs"
                                title={`Filter by Enquiry #${row.enquiryNumber}`}
                              >
                                #{row.enquiryNumber}
                              </button>
                            ) : (
                              <span className="text-gray-400 font-normal text-[10px]">N/A</span>
                            )}
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
                              row.status === 'Complete' || row.status === 'CONFIRMED' || row.status === 'COMPLETED' || row.outcome === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {renderSafeVal(row.status || row.outcome)}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                onClick={() => fetchBookingAction(String(bookingNo), 'details')}
                                className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                                title="Read Booking Details"
                              >
                                View Details
                              </button>
                              <button 
                                onClick={() => fetchBookingAction(String(bookingNo), 'confirmation')}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                                title="Booking Confirmation Communication"
                              >
                                Confirmation
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
              <span className="text-xs font-medium">Loading demo fleet...</span>
            </div>
          ) : filteredFleet.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
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
