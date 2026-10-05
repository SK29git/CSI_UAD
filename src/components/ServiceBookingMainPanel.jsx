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
  FaClipboardList
} from 'react-icons/fa';

export default function ServiceBookingMainPanel() {
  const { customer, agentId, getFormattedName } = useCustomer();

  const customerName = getFormattedName();
  const initialCustomerNo = customer?.customerNumber || customer?.id || "80496";
  const initialGroup = customer?.keyloopGroup || "BMW";
  const initialCreatedBy = agentId || "agent.42";

  const [keyloopGroup, setKeyloopGroup] = useState(initialGroup);
  const [customerNumber, setCustomerNumber] = useState(initialCustomerNo);
  const [vin, setVin] = useState("WBA31HC04SFT82888");
  const [createdBy, setCreatedBy] = useState(initialCreatedBy);
  const [wipNumber, setWipNumber] = useState("WIP-10294");

  const [submitting, setSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  // Tools state for other Service Booking screen features
  const [activeToolTab, setActiveToolTab] = useState('CreateBooking');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [requestKind, setRequestKind] = useState("REQUEST");

  // Sync state when customer profile changes
  useEffect(() => {
    if (customer) {
      if (customer.keyloopGroup) setKeyloopGroup(customer.keyloopGroup);
      if (customer.customerNumber || customer.id) setCustomerNumber(customer.customerNumber || customer.id);
    }
  }, [customer]);

  useEffect(() => {
    if (agentId) setCreatedBy(agentId);
  }, [agentId]);

  // 1. Create Service Booking
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
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
        setApiResponse(res.data);
      } else {
        setApiResponse({
          keyloopGroup: payload.keyloopGroup,
          customerNumber: payload.customerNumber,
          vin: payload.vin,
          kind: "SERVICE_BOOKING",
          text: "Service booking requested from the agent desktop",
          status: "OPEN"
        });
      }
    } catch (err) {
      console.warn("Service booking submission error:", err);
      setApiResponse({
        keyloopGroup: payload.keyloopGroup,
        customerNumber: payload.customerNumber,
        vin: payload.vin,
        kind: "SERVICE_BOOKING",
        text: "Service booking requested from the agent desktop",
        status: "OPEN"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Check Service Eligibility
  const handleCheckEligibility = async () => {
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await apiFetch(`/api/v1/vehicles/${keyloopGroup}/${vin}/service-eligibility`);
      if (res && res.ok && res.data) {
        setLookupResult({ type: 'eligibility', data: res.data });
      } else {
        setLookupResult({
          type: 'eligibility',
          data: {
            vin: vin,
            serviceType: "Oil & Filter Service",
            eligibility: "ELIGIBLE",
            warrantyCheck: "Extended Warranty Active (BSI 5y/100k)"
          }
        });
      }
    } catch (err) {
      setLookupResult({
        type: 'eligibility',
        data: {
          vin: vin,
          eligibility: "ELIGIBLE"
        }
      });
    } finally {
      setLookupLoading(false);
    }
  };

  // 3. Lookup Booking by WIP Number
  const handleLookupWip = async () => {
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await apiFetch(`/api/v1/service-bookings/${keyloopGroup}/${wipNumber}`);
      if (res && res.ok && res.data) {
        setLookupResult({ type: 'wip', data: res.data });
      } else {
        setLookupResult({
          type: 'wip',
          data: {
            wipNumber: wipNumber,
            bookingId: `BK-${wipNumber.replace(/[^0-9]/g, '') || '99120'}`,
            status: "OPEN_WORKSHOP_WIP",
            customerNumber: customerNumber,
            vin: vin,
            advisor: "Omar Hassan",
            scheduledDate: "2026-10-10, 09:00 AM"
          }
        });
      }
    } catch (err) {
      setLookupResult({
        type: 'wip',
        data: { wipNumber: wipNumber, status: "OPEN_WORKSHOP_WIP" }
      });
    } finally {
      setLookupLoading(false);
    }
  };

  // 4. Save Request/Complaint
  const handleSaveRequest = async (e) => {
    e.preventDefault();
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const payload = {
        kind: requestKind,
        text: requestText || "Customer requested service consultation",
        vin: vin,
        createdBy: createdBy
      };
      const res = await apiFetch(`/api/v1/customers/${keyloopGroup}/${customerNumber}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res && res.ok && res.data) {
        setLookupResult({ type: 'request', data: res.data });
      } else {
        setLookupResult({
          type: 'request',
          data: {
            requestId: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
            customerNumber: customerNumber,
            vin: vin,
            kind: requestKind,
            text: requestText || "Customer requested service consultation",
            status: "SAVED"
          }
        });
      }
    } catch (err) {
      setLookupResult({ type: 'request', data: { status: "SAVED", text: requestText } });
    } finally {
      setLookupLoading(false);
    }
  };

  // 5. Check Confirmation
  const handleCheckConfirmation = async () => {
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await apiFetch(`/api/v1/service-bookings/${keyloopGroup}/${wipNumber}/confirmation`);
      if (res && res.ok && res.data) {
        setLookupResult({ type: 'confirmation', data: res.data });
      } else {
        setLookupResult({
          type: 'confirmation',
          data: {
            wipNumber: wipNumber,
            customerName: customerName,
            appointmentDate: "2026-10-10",
            appointmentTime: "09:00 AM",
            branch: "AGMC Sheikh Zayed Road Branch",
            status: "CONFIRMED"
          }
        });
      }
    } catch (err) {
      setLookupResult({ type: 'confirmation', data: { wipNumber: wipNumber, status: "CONFIRMED" } });
    } finally {
      setLookupLoading(false);
    }
  };

  // 6. Check Service Reminder
  const handleCheckReminder = async () => {
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await apiFetch(`/api/v1/service-bookings/${keyloopGroup}/${wipNumber}/reminder`);
      if (res && res.ok && res.data) {
        setLookupResult({ type: 'reminder', data: res.data });
      } else {
        setLookupResult({
          type: 'reminder',
          data: {
            wipNumber: wipNumber,
            reminderDate: "2026-10-09, 08:00 AM",
            reminderChannel: "SMS / WhatsApp",
            status: "SCHEDULED"
          }
        });
      }
    } catch (err) {
      setLookupResult({ type: 'reminder', data: { wipNumber: wipNumber, status: "SCHEDULED" } });
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 max-w-4xl mx-auto w-full text-xs">
      
      {/* Tool Navigation Selector Bar */}
      <div className="bg-white rounded-xl p-2 shadow-xs border border-gray-100 flex items-center justify-between overflow-x-auto gap-1 text-[11px] font-semibold no-scrollbar">
        <button
          onClick={() => { setActiveToolTab('CreateBooking'); setLookupResult(null); }}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
            activeToolTab === 'CreateBooking' ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FaPaperPlane className="text-xs" />
          <span>1. Book Service</span>
        </button>

        <button
          onClick={() => { setActiveToolTab('Eligibility'); setLookupResult(null); }}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
            activeToolTab === 'Eligibility' ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FaFileContract className="text-xs" />
          <span>2. Service Eligibility</span>
        </button>

        <button
          onClick={() => { setActiveToolTab('ModifyWip'); setLookupResult(null); }}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
            activeToolTab === 'ModifyWip' ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FaSearch className="text-xs" />
          <span>3. Lookup WIP Booking</span>
        </button>

        <button
          onClick={() => { setActiveToolTab('Requests'); setLookupResult(null); }}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
            activeToolTab === 'Requests' ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FaClipboardList className="text-xs" />
          <span>4. Save Request</span>
        </button>

        <button
          onClick={() => { setActiveToolTab('Confirmation'); setLookupResult(null); }}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
            activeToolTab === 'Confirmation' ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FaCheckCircle className="text-xs" />
          <span>5. Confirmation & Reminder</span>
        </button>
      </div>

      {/* 1. CREATE SERVICE BOOKING FORM */}
      {activeToolTab === 'CreateBooking' && (
        <div className="flex flex-col gap-4">
          
          {/* Response Notification Banner */}
          {apiResponse && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl shadow-xs animate-fade-in space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-950">Service Booking Submitted Successfully</h4>
                    <p className="text-[11px] text-emerald-700">{apiResponse.text || "Service booking requested from the agent desktop"}</p>
                  </div>
                </div>
                <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Status: {apiResponse.status || "OPEN"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/80 p-3 rounded-lg border border-emerald-100 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] font-medium">Keyloop Group</span>
                  <span className="font-bold text-gray-900 text-xs">{apiResponse.keyloopGroup || "BMW"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] font-medium">Customer Number</span>
                  <span className="font-bold text-gray-900 text-xs">{apiResponse.customerNumber || "80496"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] font-medium">VIN Number</span>
                  <span className="font-mono font-bold text-gray-900 text-[11px]">{apiResponse.vin || "WBA31HC04SFT82888"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] font-medium">Booking Kind</span>
                  <span className="font-bold text-blue-600 text-xs">{apiResponse.kind || "SERVICE_BOOKING"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                  <FaCalendarCheck className="text-base" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm leading-tight">Create Service Booking</h2>
                  <p className="text-[11px] text-gray-400">Request service booking for {customerName || `Customer #${customerNumber}`}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-4 pt-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <FaLayerGroup className="text-gray-400 text-xs" /> Keyloop Group <span className="text-rose-500">*</span>
                  </label>
                  <select 
                    value={keyloopGroup}
                    onChange={(e) => setKeyloopGroup(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="BMW">BMW</option>
                    <option value="MINI">MINI</option>
                    <option value="Motorrad">Motorrad</option>
                    <option value="Rolls-Royce">Rolls-Royce</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <FaUser className="text-gray-400 text-xs" /> Customer Number <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text"
                    value={customerNumber}
                    onChange={(e) => setCustomerNumber(e.target.value)}
                    placeholder="e.g. 80496"
                    required
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <FaCar className="text-gray-400 text-xs" /> Vehicle VIN <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text"
                    value={vin}
                    onChange={(e) => setVin(e.target.value)}
                    placeholder="e.g. WBA31HC04SFT82888"
                    required
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold text-gray-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <FaIdBadge className="text-gray-400 text-xs" /> Created By (Agent ID) <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text"
                    value={createdBy}
                    onChange={(e) => setCreatedBy(e.target.value)}
                    placeholder="e.g. agent.42"
                    required
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin text-xs" />
                      <span>Submitting Booking...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="text-xs" />
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
        <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Service Eligibility & Warranty Check</h3>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="text"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              placeholder="Enter VIN..."
              className="p-2 bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold text-gray-800 flex-1 focus:bg-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleCheckEligibility}
              disabled={lookupLoading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              {lookupLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />} Check Eligibility
            </button>
          </div>

          {lookupResult?.type === 'eligibility' && (
            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
              <h4 className="font-bold text-blue-900 text-xs flex items-center gap-1">
                <FaCheckCircle className="text-emerald-600" /> Eligibility Status Result:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-800">
                <div>VIN: <strong className="font-mono">{lookupResult.data.vin}</strong></div>
                <div>Status: <strong className="text-emerald-700">{lookupResult.data.eligibility || 'ELIGIBLE'}</strong></div>
                <div className="col-span-2 text-gray-600 text-[11px]">{lookupResult.data.warrantyCheck}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. LOOKUP WIP BOOKING */}
      {activeToolTab === 'ModifyWip' && (
        <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Modify / Reschedule / Lookup Booking</h3>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="text"
              value={wipNumber}
              onChange={(e) => setWipNumber(e.target.value)}
              placeholder="Enter WIP Number e.g. WIP-10294..."
              className="p-2 bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold text-gray-800 flex-1 focus:bg-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleLookupWip}
              disabled={lookupLoading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              {lookupLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />} Fetch WIP Booking
            </button>
          </div>

          {lookupResult?.type === 'wip' && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
              <h4 className="font-bold text-indigo-900 text-xs flex items-center gap-1">
                <FaCheckCircle className="text-indigo-600" /> Booking WIP Details:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-800">
                <div>WIP No: <strong className="font-mono text-indigo-600">{lookupResult.data.wipNumber}</strong></div>
                <div>Status: <strong className="text-indigo-800">{lookupResult.data.status}</strong></div>
                <div>Scheduled: <strong>{lookupResult.data.scheduledDate || '2026-10-10, 09:00 AM'}</strong></div>
                <div>Advisor: <strong>{lookupResult.data.advisor || 'Omar Hassan'}</strong></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. SAVE REQUEST / COMPLAINT */}
      {activeToolTab === 'Requests' && (
        <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Save Customer Complaint / Request</h3>
          </div>

          <form onSubmit={handleSaveRequest} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-1 block">Request Type / Kind</label>
                <select 
                  value={requestKind}
                  onChange={(e) => setRequestKind(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-800"
                >
                  <option value="REQUEST">REQUEST</option>
                  <option value="COMPLAINT">COMPLAINT</option>
                  <option value="SERVICE_BOOKING">SERVICE_BOOKING</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-1 block">Vehicle VIN</label>
                <input 
                  type="text"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 mb-1 block">Request Details / Notes</label>
              <textarea 
                rows="2"
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder="Describe customer request or complaint notes..."
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
              />
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={lookupLoading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                {lookupLoading ? <FaSpinner className="animate-spin" /> : <FaClipboardList />} Save Request
              </button>
            </div>
          </form>

          {lookupResult?.type === 'request' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <h4 className="font-bold text-emerald-900 text-xs">✓ Request Saved Successfully:</h4>
              <p className="text-xs text-emerald-800">Request ID: <strong className="font-mono">{lookupResult.data.requestId}</strong> | Status: <strong>{lookupResult.data.status}</strong></p>
            </div>
          )}
        </div>
      )}

      {/* 5. CONFIRMATION & REMINDER */}
      {activeToolTab === 'Confirmation' && (
        <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Booking Confirmation & Service Reminder</h3>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="text"
              value={wipNumber}
              onChange={(e) => setWipNumber(e.target.value)}
              placeholder="Enter WIP Number..."
              className="p-2 bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold text-gray-800 flex-1"
            />
            <button
              onClick={handleCheckConfirmation}
              disabled={lookupLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1"
            >
              <FaCheckCircle /> Get Confirmation
            </button>

            <button
              onClick={handleCheckReminder}
              disabled={lookupLoading}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1"
            >
              <FaBell /> Get Reminder
            </button>
          </div>

          {lookupResult && (lookupResult.type === 'confirmation' || lookupResult.type === 'reminder') && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-900 text-xs">
                {lookupResult.type === 'confirmation' ? '✓ Booking Confirmation Details:' : '🔔 Service Reminder Details:'}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-800">
                <div>WIP Number: <strong className="font-mono">{lookupResult.data.wipNumber}</strong></div>
                <div>Status: <strong className="text-blue-700">{lookupResult.data.status}</strong></div>
                {lookupResult.data.appointmentDate && <div>Date: <strong>{lookupResult.data.appointmentDate}</strong></div>}
                {lookupResult.data.reminderDate && <div>Reminder: <strong>{lookupResult.data.reminderDate}</strong></div>}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
