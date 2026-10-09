import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaCar, 
  FaUser, 
  FaLayerGroup, 
  FaPaperPlane, 
  FaSpinner, 
  FaCheckCircle, 
  FaCalendarCheck,
  FaIdBadge,
  FaSearch,
  FaBell,
  FaFileContract,
  FaClipboardList,
  FaExclamationCircle,
  FaRedo
} from 'react-icons/fa';

export default function ServiceBookingMainPanel() {
  const { customer, agentId, getFormattedName, selectedVin, vehicles } = useCustomer();

  const customerName = getFormattedName();
  const initialCustomerNo = customer?.customerNumber || customer?.id || "";
  const initialGroup = customer?.keyloopGroup || "BMW";
  const initialCreatedBy = agentId || "agent.42";
  const initialVin = selectedVin || customer?.vin || (vehicles && vehicles.length > 0 ? vehicles[0].vin : "") || "";

  const [keyloopGroup, setKeyloopGroup] = useState(initialGroup);
  const [customerNumber, setCustomerNumber] = useState(initialCustomerNo);
  const [vin, setVin] = useState(initialVin);
  const [createdBy, setCreatedBy] = useState(initialCreatedBy);
  const [wipNumber, setWipNumber] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  // Tools state for other Service Booking screen features
  const [activeToolTab, setActiveToolTab] = useState('CreateBooking');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [requestKind, setRequestKind] = useState("REQUEST");

  // Customer complaints/requests list state (GET /api/v1/customers/{group}/{customerNumber}/requests)
  const [customerRequests, setCustomerRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Sync state when customer profile or selected vehicle changes
  useEffect(() => {
    if (customer) {
      if (customer.keyloopGroup) setKeyloopGroup(customer.keyloopGroup);
      if (customer.customerNumber || customer.id) setCustomerNumber(customer.customerNumber || customer.id);
    }
  }, [customer]);

  useEffect(() => {
    if (selectedVin) {
      setVin(selectedVin);
    } else if (vehicles && vehicles.length > 0) {
      setVin(vehicles[0].vin);
    }
  }, [selectedVin, vehicles]);

  useEffect(() => {
    if (agentId) setCreatedBy(agentId);
  }, [agentId]);

  // Fetch list of customer complaints and requests (GET /api/v1/customers/{group}/{customerNumber}/requests)
  const fetchCustomerRequests = async () => {
    if (!customerNumber) return;
    setRequestsLoading(true);
    try {
      const res = await apiFetch(`/api/v1/customers/${keyloopGroup}/${customerNumber}/requests`);
      if (res && res.ok && Array.isArray(res.data)) {
        setCustomerRequests(res.data);
      } else {
        setCustomerRequests([]);
      }
    } catch (err) {
      console.warn("Failed to fetch customer requests list:", err);
      setCustomerRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (activeToolTab === 'Requests' && customerNumber) {
      fetchCustomerRequests();
    }
  }, [activeToolTab, keyloopGroup, customerNumber]);

  // 1. Create Service Booking (POST /api/v1/service-bookings)
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!customerNumber || !vin) return;
    setSubmitting(true);
    setApiResponse(null);

    const payload = {
      keyloopGroup,
      customerNumber,
      vin,
      createdBy: createdBy || "agent.42"
    };

    try {
      const res = await apiFetch('/api/v1/service-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res && res.ok && res.data) {
        setApiResponse({ ok: true, data: res.data });
      } else {
        setApiResponse({ ok: false, error: res?.statusText || "Unable to save service booking request" });
      }
    } catch (err) {
      console.warn("Service booking submission error:", err);
      setApiResponse({ ok: false, error: err.message || "Service booking submission failed" });
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Check Service Eligibility (GET /api/v1/vehicles/{group}/{vin}/service-eligibility)
  const handleCheckEligibility = async () => {
    if (!vin) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await apiFetch(`/api/v1/vehicles/${keyloopGroup}/${vin}/service-eligibility`);
      if (res && res.ok && res.data) {
        setLookupResult({ type: 'eligibility', ok: true, data: res.data });
      } else {
        setLookupResult({ type: 'eligibility', ok: false, error: res?.statusText || "No eligibility data returned for this VIN" });
      }
    } catch (err) {
      setLookupResult({ type: 'eligibility', ok: false, error: err.message || "Failed to fetch eligibility" });
    } finally {
      setLookupLoading(false);
    }
  };

  // 3. Lookup Booking by WIP Number (GET /api/v1/service-bookings/{group}/{wipNumber})
  const handleLookupWip = async () => {
    if (!wipNumber.trim()) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await apiFetch(`/api/v1/service-bookings/${keyloopGroup}/${wipNumber.trim()}`);
      if (res && res.ok && res.data) {
        setLookupResult({ type: 'wip', ok: true, data: res.data });
      } else {
        setLookupResult({ type: 'wip', ok: false, error: res?.statusText || `No booking found for WIP #${wipNumber}` });
      }
    } catch (err) {
      setLookupResult({ type: 'wip', ok: false, error: err.message || "Failed to fetch WIP booking" });
    } finally {
      setLookupLoading(false);
    }
  };

  // 4. Save Request/Complaint (POST /api/v1/customers/{group}/{customerNumber}/requests)
  const handleSaveRequest = async (e) => {
    e.preventDefault();
    if (!customerNumber || !requestText.trim()) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const payload = {
        kind: requestKind,
        text: requestText.trim(),
        vin: vin,
        createdBy: createdBy || "agent.42"
      };
      const res = await apiFetch(`/api/v1/customers/${keyloopGroup}/${customerNumber}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res && res.ok && res.data) {
        setLookupResult({ type: 'request', ok: true, data: res.data });
        setRequestText("");
        fetchCustomerRequests();
      } else {
        setLookupResult({ type: 'request', ok: false, error: res?.statusText || "Failed to save request" });
      }
    } catch (err) {
      setLookupResult({ type: 'request', ok: false, error: err.message || "Failed to save request" });
    } finally {
      setLookupLoading(false);
    }
  };

  // 5. Check Confirmation (GET /api/v1/service-bookings/{group}/{wipNumber}/confirmation)
  const handleCheckConfirmation = async () => {
    if (!wipNumber.trim()) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await apiFetch(`/api/v1/service-bookings/${keyloopGroup}/${wipNumber.trim()}/confirmation`);
      if (res && res.ok && res.data) {
        setLookupResult({ type: 'confirmation', ok: true, data: res.data });
      } else {
        setLookupResult({ type: 'confirmation', ok: false, error: res?.statusText || `No confirmation details for WIP #${wipNumber}` });
      }
    } catch (err) {
      setLookupResult({ type: 'confirmation', ok: false, error: err.message || "Failed to check confirmation" });
    } finally {
      setLookupLoading(false);
    }
  };

  // 6. Check Service Reminder (GET /api/v1/service-bookings/{group}/{wipNumber}/reminder)
  const handleCheckReminder = async () => {
    if (!wipNumber.trim()) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await apiFetch(`/api/v1/service-bookings/${keyloopGroup}/${wipNumber.trim()}/reminder`);
      if (res && res.ok && res.data) {
        setLookupResult({ type: 'reminder', ok: true, data: res.data });
      } else {
        setLookupResult({ type: 'reminder', ok: false, error: res?.statusText || `No reminder details for WIP #${wipNumber}` });
      }
    } catch (err) {
      setLookupResult({ type: 'reminder', ok: false, error: err.message || "Failed to check reminder" });
    } finally {
      setLookupLoading(false);
    }
  };

  // Helper component to render rich booking fields grid dynamically from API response object
  const renderBookingFieldsGrid = (data) => {
    if (!data || typeof data !== 'object') return null;

    const bookingRef = data.bookingId || data.wipNumber || data.jobNumber || data.reference;
    const branchName = typeof data.branch === 'object' ? (data.branch.name || data.branch.code) : (data.branch || '');
    const vehicleDesc = data.vehicle ? `${data.brand || ''} ${data.vehicle}`.trim() : (data.brand || '');
    const dateTimeStr = [data.date, data.time ? `@ ${data.time}` : null].filter(Boolean).join(' ');

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {bookingRef && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Booking ID / WIP</span>
            <span className="font-mono font-extrabold text-blue-700 text-xs">{bookingRef}</span>
          </div>
        )}

        {data.status && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Booking Status</span>
            <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 inline-block text-xs">
              {data.status} {data.statusCode ? `(${data.statusCode})` : ''}
            </span>
          </div>
        )}

        {vehicleDesc && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Vehicle</span>
            <span className="font-bold text-gray-900">{vehicleDesc}</span>
          </div>
        )}

        {data.vin && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Vehicle VIN</span>
            <span className="font-mono font-bold text-gray-900 uppercase">{data.vin}</span>
          </div>
        )}

        {dateTimeStr && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Booking Date & Time</span>
            <span className="font-bold text-gray-900">{dateTimeStr}</span>
          </div>
        )}

        {data.dueOutDate && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Due Out Date</span>
            <span className="font-bold text-gray-900">{data.dueOutDate}</span>
          </div>
        )}

        {branchName && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Branch Location</span>
            <span className="font-bold text-blue-700">{branchName}</span>
          </div>
        )}

        {data.bookedBy && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Booked By (Staff ID)</span>
            <span className="font-bold text-gray-900">{data.bookedBy}</span>
          </div>
        )}

        {data.odometerKm !== undefined && data.odometerKm !== null && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Odometer Reading</span>
            <span className="font-extrabold text-gray-900">{Number(data.odometerKm).toLocaleString()} KM</span>
          </div>
        )}

        {data.nextServiceDate && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Next Service Date</span>
            <span className="font-bold text-gray-900">{data.nextServiceDate}</span>
          </div>
        )}

        {data.createdDate && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Created Date</span>
            <span className="font-semibold text-gray-700">{data.createdDate}</span>
          </div>
        )}

        {data.lastUpdatedDate && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Last Updated</span>
            <span className="font-semibold text-gray-700">{data.lastUpdatedDate}</span>
          </div>
        )}

        {data.keyloopGroup && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Keyloop Group</span>
            <span className="font-bold text-gray-900">{data.keyloopGroup}</span>
          </div>
        )}

        {data.customerNumber && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Customer Number</span>
            <span className="font-bold text-gray-900">{data.customerNumber}</span>
          </div>
        )}

        {data.open !== undefined && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Workshop Status</span>
            <span className={`font-extrabold px-2 py-0.5 rounded text-[11px] inline-block ${data.open ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
              {data.open ? 'Open Job' : 'Closed Job'}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-5 text-xs">
      
      {/* Tool Navigation Selector Bar */}
      <div className="bg-gray-100/90 rounded-xl p-2 shadow-2xs border border-gray-200 flex items-center justify-between overflow-x-auto gap-2 text-[11px] font-semibold no-scrollbar">
        <button
          onClick={() => { setActiveToolTab('CreateBooking'); setLookupResult(null); }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeToolTab === 'CreateBooking' 
              ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 font-semibold'
          }`}
        >
          <FaPaperPlane className="text-xs" />
          <span>1. Book Service</span>
        </button>

        <button
          onClick={() => { setActiveToolTab('Eligibility'); setLookupResult(null); }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeToolTab === 'Eligibility' 
              ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 font-semibold'
          }`}
        >
          <FaFileContract className="text-xs" />
          <span>2. Service Eligibility</span>
        </button>

        <button
          onClick={() => { setActiveToolTab('ModifyWip'); setLookupResult(null); }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeToolTab === 'ModifyWip' 
              ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 font-semibold'
          }`}
        >
          <FaSearch className="text-xs" />
          <span>3. Lookup WIP Booking</span>
        </button>

        <button
          onClick={() => { setActiveToolTab('Requests'); setLookupResult(null); }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeToolTab === 'Requests' 
              ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 font-semibold'
          }`}
        >
          <FaClipboardList className="text-xs" />
          <span>4. Save Request</span>
        </button>

        <button
          onClick={() => { setActiveToolTab('Confirmation'); setLookupResult(null); }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeToolTab === 'Confirmation' 
              ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 font-semibold'
          }`}
        >
          <FaCheckCircle className="text-xs" />
          <span>5. Confirmation & Reminder</span>
        </button>
      </div>

      {/* 1. CREATE SERVICE BOOKING FORM */}
      {activeToolTab === 'CreateBooking' && (
        <div className="flex flex-col gap-4">
          
          {/* Response Formatted UI Card */}
          {apiResponse && (
            <div className="bg-white rounded-xl border border-emerald-300 shadow-sm overflow-hidden text-xs">
              <div className={`px-4 py-2.5 text-white flex items-center justify-between font-bold ${apiResponse.ok ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                <span className="flex items-center gap-2 text-sm">
                  {apiResponse.ok ? <FaCheckCircle /> : <FaExclamationCircle />}
                  {apiResponse.ok ? 'Service Booking Confirmation' : 'Submission Error'}
                </span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase font-mono font-extrabold">
                  {apiResponse.ok ? 'SUCCESS' : 'FAILED'}
                </span>
              </div>

              {apiResponse.error ? (
                <div className="p-4 bg-rose-50 text-rose-800 font-semibold">{apiResponse.error}</div>
              ) : (
                <div className="p-4 bg-slate-50/50">
                  {renderBookingFieldsGrid(apiResponse.data)}
                </div>
              )}
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden">
            
            {/* Header Section */}
            <div className="bg-slate-100/80 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white shadow-xs flex items-center justify-center font-bold">
                  <FaCalendarCheck className="text-lg" />
                </div>
                <div>
                  <h2 className="font-extrabold text-gray-900 text-sm leading-tight">Create Service Booking</h2>
                  <p className="text-[11px] font-semibold text-gray-500">
                    Request service booking for <span className="text-blue-700 font-bold">{customerName || `Customer #${customerNumber || 'N/A'}`}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields Body */}
            <form onSubmit={handleSubmitBooking} className="p-6 space-y-6 text-xs bg-slate-50/40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Field 1: Keyloop Group */}
                <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1">
                  <label className="text-[11px] font-extrabold text-gray-800 flex items-center gap-1.5">
                    <FaLayerGroup className="text-blue-600 text-xs" /> Keyloop Group <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <select 
                    value={keyloopGroup}
                    onChange={(e) => setKeyloopGroup(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    <option value="BMW">BMW</option>
                    <option value="MINI">MINI</option>
                    <option value="Motorrad">Motorrad</option>
                    <option value="Rolls-Royce">Rolls-Royce</option>
                  </select>
                </div>

                {/* Field 2: Customer Number */}
                <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1">
                  <label className="text-[11px] font-extrabold text-gray-800 flex items-center gap-1.5">
                    <FaUser className="text-blue-600 text-xs" /> Customer Number <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input 
                    type="text"
                    value={customerNumber}
                    onChange={(e) => setCustomerNumber(e.target.value)}
                    placeholder="Enter Customer Number..."
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                {/* Field 3: Vehicle VIN */}
                <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1">
                  <label className="text-[11px] font-extrabold text-gray-800 flex items-center gap-1.5">
                    <FaCar className="text-blue-600 text-xs" /> Vehicle VIN <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input 
                    type="text"
                    value={vin}
                    onChange={(e) => setVin(e.target.value)}
                    placeholder="Enter Vehicle VIN..."
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all uppercase"
                  />
                </div>

                {/* Field 4: Created By */}
                <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1">
                  <label className="text-[11px] font-extrabold text-gray-800 flex items-center gap-1.5">
                    <FaIdBadge className="text-blue-600 text-xs" /> Created By (Agent ID) <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input 
                    type="text"
                    value={createdBy}
                    onChange={(e) => setCreatedBy(e.target.value)}
                    placeholder="e.g. agent.42"
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

              </div>

              {/* Center-aligned Submit Button Bar */}
              <div className="flex items-center justify-center pt-4 border-t border-gray-300">
                <button 
                  type="submit" 
                  disabled={submitting || !customerNumber || !vin}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 min-w-[220px]"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      <span>Submitting Booking...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="text-sm" />
                      <span>Book Service</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. SERVICE ELIGIBILITY CHECK */}
      {activeToolTab === 'Eligibility' && (
        <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden flex flex-col">
          <div className="bg-slate-100/80 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
              <FaFileContract className="text-blue-600" /> Service Eligibility Check
            </h3>
          </div>

          <div className="p-6 bg-slate-50/40 flex flex-col gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-2xs flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[11px] font-extrabold text-gray-800 mb-1 block">Vehicle VIN</label>
                <input 
                  type="text"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  placeholder="Enter Vehicle VIN..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all uppercase"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleCheckEligibility}
                  disabled={lookupLoading || !vin}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg cursor-pointer flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {lookupLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />} Check Eligibility
                </button>
              </div>
            </div>

            {/* Formatted Eligibility UI Card */}
            {lookupResult?.type === 'eligibility' && (
              <div className="bg-white rounded-xl border border-blue-300 shadow-sm overflow-hidden text-xs">
                <div className={`px-4 py-2.5 text-white flex items-center justify-between font-bold ${lookupResult.ok ? 'bg-blue-600' : 'bg-rose-600'}`}>
                  <span className="flex items-center gap-2 text-sm">
                    {lookupResult.ok ? <FaCheckCircle /> : <FaExclamationCircle />} Eligibility Check Result
                  </span>
                  <span className="bg-blue-800 text-white font-mono px-2 py-0.5 rounded text-[10px] font-extrabold">
                    VIN: #{lookupResult.data?.vin || vin}
                  </span>
                </div>

                {lookupResult.error ? (
                  <div className="p-4 bg-rose-50 text-rose-800 font-semibold">{lookupResult.error}</div>
                ) : (
                  <div className="p-4 bg-slate-50/50 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      
                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Vehicle VIN</span>
                        <span className="font-mono font-bold text-gray-900 text-xs">{lookupResult.data?.vin || vin}</span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Keyloop Group</span>
                        <span className="font-bold text-gray-900">{lookupResult.data?.keyloopGroup || keyloopGroup}</span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Current Mileage</span>
                        <span className="font-bold text-gray-900">
                          {lookupResult.data?.mileageKm !== undefined ? `${lookupResult.data.mileageKm.toLocaleString()} KM` : 'N/A'}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Warranty Status</span>
                        <span className={`inline-block font-extrabold text-xs px-2 py-0.5 rounded ${
                          lookupResult.data?.warrantyStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {lookupResult.data?.warrantyStatus || 'N/A'}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Warranty Coverage</span>
                        <span className="font-semibold text-gray-800">{lookupResult.data?.warrantyCoverage || 'N/A'}</span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Warranty Expiry Date</span>
                        <span className="font-semibold text-gray-900">{lookupResult.data?.warrantyExpiryDate || 'N/A'}</span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Service Contract Status</span>
                        <span className={`inline-block font-extrabold text-xs px-2 py-0.5 rounded ${
                          lookupResult.data?.serviceContractStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {lookupResult.data?.serviceContractStatus || 'EXPIRED'}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Contract Package Type</span>
                        <span className="font-bold text-gray-900">{lookupResult.data?.serviceContractType || 'N/A'}</span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Contract Expiry Date</span>
                        <span className="font-semibold text-gray-900">{lookupResult.data?.serviceContractExpiryDate || 'N/A'}</span>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. LOOKUP WIP BOOKING */}
      {activeToolTab === 'ModifyWip' && (
        <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden flex flex-col">
          <div className="bg-slate-100/80 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
              <FaSearch className="text-blue-600" /> Modify / Reschedule / Lookup WIP Booking
            </h3>
          </div>

          <div className="p-6 bg-slate-50/40 flex flex-col gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-2xs flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[11px] font-extrabold text-gray-800 mb-1 block">WIP Number</label>
                <input 
                  type="text"
                  value={wipNumber}
                  onChange={(e) => setWipNumber(e.target.value)}
                  placeholder="Enter WIP Number (e.g. WIP-10294)..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all uppercase"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleLookupWip}
                  disabled={lookupLoading || !wipNumber.trim()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg cursor-pointer flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {lookupLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />} Fetch WIP Booking
                </button>
              </div>
            </div>

            {/* Formatted WIP Booking UI Card */}
            {lookupResult?.type === 'wip' && (
              <div className="bg-white rounded-xl border border-indigo-300 shadow-sm overflow-hidden text-xs">
                <div className={`px-4 py-2.5 text-white flex items-center justify-between font-bold ${lookupResult.ok ? 'bg-indigo-600' : 'bg-rose-600'}`}>
                  <span className="flex items-center gap-2 text-sm">
                    {lookupResult.ok ? <FaCheckCircle /> : <FaExclamationCircle />} Booking Details for WIP #{wipNumber}
                  </span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono font-extrabold">
                    {lookupResult.ok ? 'FOUND' : 'NOT FOUND'}
                  </span>
                </div>

                {lookupResult.error ? (
                  <div className="p-4 bg-rose-50 text-rose-800 font-semibold">{lookupResult.error}</div>
                ) : (
                  <div className="p-4 bg-slate-50/50 space-y-3">
                    {renderBookingFieldsGrid(lookupResult.data)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SAVE REQUEST / COMPLAINT */}
      {activeToolTab === 'Requests' && (
        <div className="flex flex-col gap-5">
          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden flex flex-col">
            <div className="bg-slate-100/80 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                <FaClipboardList className="text-blue-600" /> Save Customer Complaint / Request
              </h3>
            </div>

            <form onSubmit={handleSaveRequest} className="p-6 bg-slate-50/40 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1">
                  <label className="text-[11px] font-extrabold text-gray-800 block">Request Type / Kind</label>
                  <select 
                    value={requestKind}
                    onChange={(e) => setRequestKind(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="REQUEST">REQUEST</option>
                    <option value="COMPLAINT">COMPLAINT</option>
                    <option value="SERVICE_BOOKING">SERVICE_BOOKING</option>
                  </select>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1">
                  <label className="text-[11px] font-extrabold text-gray-800 block">Vehicle VIN</label>
                  <input 
                    type="text"
                    value={vin}
                    onChange={(e) => setVin(e.target.value)}
                    placeholder="Enter Vehicle VIN..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 uppercase"
                  />
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1">
                <label className="text-[11px] font-extrabold text-gray-800 block">
                  Request Details / Notes <span className="text-rose-500 font-bold">*</span>
                </label>
                <textarea 
                  rows="3"
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  placeholder="Describe customer request or complaint notes..."
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-medium text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-center pt-2">
                <button 
                  type="submit" 
                  disabled={lookupLoading || !customerNumber || !requestText.trim()}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 min-w-[200px]"
                >
                  {lookupLoading ? <FaSpinner className="animate-spin text-sm" /> : <FaClipboardList className="text-sm" />} Save Request
                </button>
              </div>
            </form>

            {/* Formatted Request Save UI Card */}
            {lookupResult?.type === 'request' && (
              <div className="p-6 pt-0">
                <div className="bg-white rounded-xl border border-emerald-300 shadow-sm overflow-hidden text-xs">
                  <div className={`px-4 py-2.5 text-white flex items-center justify-between font-bold ${lookupResult.ok ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                    <span className="flex items-center gap-2 text-sm">
                      {lookupResult.ok ? <FaCheckCircle /> : <FaExclamationCircle />}
                      {lookupResult.ok ? 'Customer Request Saved Successfully' : 'Save Error'}
                    </span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono font-extrabold">
                      {requestKind}
                    </span>
                  </div>

                  {lookupResult.error ? (
                    <div className="p-4 bg-rose-50 text-rose-800 font-semibold">{lookupResult.error}</div>
                  ) : (
                    <div className="p-4 bg-slate-50/50 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                          <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Request Reference ID</span>
                          <span className="font-mono font-extrabold text-emerald-700 text-xs">{lookupResult.data?.requestId || lookupResult.data?.id || 'SAVED'}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                          <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Request Type</span>
                          <span className="font-bold text-gray-900">{requestKind}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                          <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Vehicle VIN</span>
                          <span className="font-mono font-bold text-gray-900 uppercase">{vin || 'N/A'}</span>
                        </div>
                      </div>
                      {lookupResult.data?.text && (
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                          <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Request Notes</span>
                          <p className="font-medium text-gray-800 text-xs">{lookupResult.data.text}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* List of Saved Customer Complaints & Requests (GET /api/v1/customers/{group}/{customerNumber}/requests) */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden flex flex-col">
            <div className="bg-slate-100/80 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaClipboardList className="text-blue-600" />
                <h3 className="font-extrabold text-gray-900 text-sm">
                  Saved Customer Complaints & Requests ({customerRequests.length})
                </h3>
              </div>
              <button 
                onClick={fetchCustomerRequests}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                title="Refresh Requests List"
              >
                <FaRedo className={`text-xs ${requestsLoading ? 'animate-spin' : ''}`} /> Refresh List
              </button>
            </div>

            <div className="p-6 bg-slate-50/40">
              {requestsLoading ? (
                <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <FaSpinner className="animate-spin text-lg text-blue-600" />
                  <span className="text-xs font-semibold">Loading saved complaints & requests...</span>
                </div>
              ) : customerRequests.length === 0 ? (
                <div className="p-6 text-center text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                  <p className="font-bold text-gray-700 text-xs">No Complaints or Requests Found</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">There are currently no saved complaints or requests returned for Customer #{customerNumber}.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-2xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-gray-600 font-extrabold uppercase text-[10px] border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4"># / Request ID</th>
                        <th className="py-3 px-4">Type / Kind</th>
                        <th className="py-3 px-4">Request Description / Details</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Saved Date / Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-medium text-gray-800 text-xs">
                      {customerRequests.map((req, idx) => (
                        <tr key={req.requestId || req.id || idx} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">
                            {req.requestId || req.id || `REQ-${idx + 1}`}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                              req.kind === 'COMPLAINT' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                              req.kind === 'SERVICE_BOOKING' ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                              'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}>
                              {req.kind || 'REQUEST'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-900 max-w-md">
                            {req.text || req.description || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                              req.status === 'RESOLVED' || req.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              req.status === 'OPEN' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}>
                              {req.status || 'OPEN'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 font-mono">
                            {req.savedTimestamp || req.createdDate || req.date || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. CONFIRMATION & REMINDER */}
      {activeToolTab === 'Confirmation' && (
        <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden flex flex-col">
          <div className="bg-slate-100/80 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
              <FaCheckCircle className="text-blue-600" /> Booking Confirmation & Service Reminder
            </h3>
          </div>

          <div className="p-6 bg-slate-50/40 flex flex-col gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div className="flex-1">
                <label className="text-[11px] font-extrabold text-gray-800 mb-1 block">WIP Number</label>
                <input 
                  type="text"
                  value={wipNumber}
                  onChange={(e) => setWipNumber(e.target.value)}
                  placeholder="Enter WIP Number..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all uppercase"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCheckConfirmation}
                  disabled={lookupLoading || !wipNumber.trim()}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  <FaCheckCircle /> Get Confirmation
                </button>

                <button
                  onClick={handleCheckReminder}
                  disabled={lookupLoading || !wipNumber.trim()}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  <FaBell /> Get Reminder
                </button>
              </div>
            </div>

            {/* Formatted Confirmation / Reminder UI Card */}
            {lookupResult && (lookupResult.type === 'confirmation' || lookupResult.type === 'reminder') && (
              <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden text-xs">
                <div className={`px-4 py-2.5 text-white flex items-center justify-between font-bold ${lookupResult.ok ? 'bg-slate-700' : 'bg-rose-600'}`}>
                  <span className="flex items-center gap-2 text-sm">
                    {lookupResult.ok ? <FaCheckCircle /> : <FaExclamationCircle />}
                    {lookupResult.type === 'confirmation' ? 'Booking Confirmation Details' : 'Service Reminder Details'}
                  </span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono font-extrabold">
                    WIP #{wipNumber}
                  </span>
                </div>

                {lookupResult.error ? (
                  <div className="p-4 bg-rose-50 text-rose-800 font-semibold">{lookupResult.error}</div>
                ) : (
                  <div className="p-4 bg-slate-50/50 space-y-3">
                    {renderBookingFieldsGrid(lookupResult.data)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
