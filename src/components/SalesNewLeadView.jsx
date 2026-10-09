import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaUserPlus,
  FaExclamationTriangle,
  FaPaperPlane,
  FaSpinner,
  FaSearch,
  FaBell,
  FaCheckCircle,
  FaStar,
  FaInfoCircle,
  FaRedo,
  FaClock
} from 'react-icons/fa';

export default function SalesNewLeadView() {
  const { customer } = useCustomer();
  const group = customer?.keyloopGroup || "BMW";
  const customerNumber = customer?.customerNumber || "";
  const vin = customer?.vin || (customer?.vehicles && customer.vehicles[0]?.vin) || "";

  const [activeTab, setActiveTab] = useState("lead"); // "lead" | "complaint"

  // ----------------------------------------------------
  // 1. LEAD STATE & HANDLERS
  // ----------------------------------------------------
  const [title, setTitle] = useState(customer?.salutation || 'Mr');
  const [firstname, setFirstname] = useState(customer?.firstName || '');
  const [surname, setSurname] = useState(customer?.surname || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [mobile, setMobile] = useState(customer?.mobile || customer?.mobileRaw || '');
  const [origin, setOrigin] = useState('BMW Test Drive - EN');
  const [source, setSource] = useState('WEBENQUIRY');
  const [branch, setBranch] = useState(customer?.branchCode || '10');
  const [newused, setNewused] = useState('NEW');
  const [model, setModel] = useState('X3');
  const [notes, setNotes] = useState("Location : BMW - Sheikh Zayed Road Dubai, Model : 'X3'");
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadResponseToast, setLeadResponseToast] = useState(null);

  useEffect(() => {
    if (customer) {
      if (customer.salutation) {
        const cleanSal = customer.salutation.replace(/\.$/, '').trim();
        setTitle(cleanSal || customer.salutation);
      }
      if (customer.firstName) setFirstname(customer.firstName);
      if (customer.surname) setSurname(customer.surname);
      if (customer.email) setEmail(customer.email);
      if (customer.mobile || customer.mobileRaw) setMobile(customer.mobile || customer.mobileRaw);
      if (customer.branchCode) setBranch(customer.branchCode);
    }
  }, [customer]);

  const handleSaveLead = async (e) => {
    e.preventDefault();
    setSubmittingLead(true);
    setLeadResponseToast(null);

    const payload = {
      enquiry: {
        apikey: "3A22A9F89A2D021E3C130074",
        lead: { origin, source, branch, idnumber: "", allocate: "" },
        contact: { title, firstname, surname, email, phone: mobile, mobile, source: "" },
        seeks: { newused, make: "BMW", model, stocknumber: "", regnumber: "", notes },
        tradein: { registration: "", make: "", model: "", mileage: "", year: "", notes: "" },
        mkagree: { updatemkagree: "false", dealersms: false, dealeremail: false, dealerletter: false, dealerphone: false, partssms: false, partsemail: false, partletter: false, partsphone: false, salessms: false, salesemail: false, salesletter: false, salesphone: false, servicesms: false, serviceemail: false, serviceletter: false, servicephone: false }
      }
    };

    try {
      const res = await apiFetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res && res.ok && res.data) {
        setLeadResponseToast({
          referenceId: res.data.referenceId || res.data.id || "RECEIVED",
          status: res.data.status || "RECEIVED",
          message: res.data.message || "Lead received successfully"
        });
      } else {
        setLeadResponseToast({
          referenceId: "N/A",
          status: res?.statusText || "PROCESSED",
          message: "Lead processed by backend"
        });
      }
    } catch (err) {
      setLeadResponseToast({
        referenceId: "N/A",
        status: "ERROR",
        message: err.message || "Failed to submit lead"
      });
    } finally {
      setSubmittingLead(false);
    }
  };

  // ----------------------------------------------------
  // 2. COMPLAINT STATE & HANDLERS (Postman 6. Complaints)
  // ----------------------------------------------------
  const [complaintCategory, setComplaintCategory] = useState("Sales / Dealership Experience");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [complaintVin, setComplaintVin] = useState(vin);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [complaintToast, setComplaintToast] = useState(null);

  const [customerComplaints, setCustomerComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [searchComplaintRef, setSearchComplaintRef] = useState("");
  const [selectedComplaintRef, setSelectedComplaintRef] = useState("");
  const [complaintActionResult, setComplaintActionResult] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const renderSafeVal = (val, fallback = 'N/A') => {
    if (val === null || val === undefined || val === '') return fallback;
    if (typeof val === 'object') {
      if (val.name) return val.name;
      if (val.description) return val.description;
      return JSON.stringify(val);
    }
    return String(val);
  };

  const fetchCustomerComplaints = async () => {
    if (!customerNumber) {
      setCustomerComplaints([]);
      return;
    }
    setLoadingComplaints(true);
    try {
      const res = await apiFetch(`/api/v1/customers/${group}/${customerNumber}/complaints?limit=50`);
      if (res && res.ok && Array.isArray(res.data)) {
        setCustomerComplaints(res.data);
      } else {
        setCustomerComplaints([]);
      }
    } catch (err) {
      console.warn("Failed to fetch customer complaints:", err);
      setCustomerComplaints([]);
    } finally {
      setLoadingComplaints(false);
    }
  };

  useEffect(() => {
    if (activeTab === "complaint") {
      fetchCustomerComplaints();
    }
  }, [activeTab, group, customerNumber]);

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    if (!complaintDescription.trim()) return;

    setSubmittingComplaint(true);
    setComplaintToast(null);

    const payload = {
      keyloopGroup: group,
      customerNumber,
      category: complaintCategory,
      description: complaintDescription,
      vin: complaintVin || vin,
      createdBy: "agent.42"
    };

    try {
      const res = await apiFetch('/api/v1/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res && res.ok && res.data) {
        const newRef = res.data.complaintId || res.data.id || res.data.reference || "AGMC-CREATED";
        setSelectedComplaintRef(newRef);
        setComplaintToast({ ok: true, message: `Complaint Ticket created successfully with Reference #${newRef}` });
        setComplaintDescription("");
        fetchCustomerComplaints();
      } else {
        setComplaintToast({ ok: false, message: res?.statusText || "Failed to create complaint ticket" });
      }
    } catch (err) {
      setComplaintToast({ ok: false, message: err.message || "Failed to submit complaint ticket" });
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleTriggerComplaintAction = async (actionType, targetRef) => {
    const ref = targetRef || selectedComplaintRef || searchComplaintRef;
    if (!ref) return;

    setSelectedComplaintRef(ref);
    setActionLoading(true);
    setComplaintActionResult(null);

    try {
      const endpoint = `/api/v1/complaints/${group}/${ref}`;
      const res = await apiFetch(endpoint);

      if (res && res.ok) {
        setComplaintActionResult({
          action: actionType,
          ref,
          data: res.data || res,
          ok: true
        });
      } else {
        setComplaintActionResult({
          action: actionType,
          ref,
          error: res?.statusText || "No data returned for this complaint reference",
          ok: false
        });
      }
    } catch (err) {
      setComplaintActionResult({
        action: actionType,
        ref,
        error: err.message || "Failed to execute complaint action",
        ok: false
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLookupComplaintSubmit = (e) => {
    e.preventDefault();
    if (searchComplaintRef.trim()) {
      handleTriggerComplaintAction('monitor', searchComplaintRef.trim());
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4 text-xs">
      
      {/* Top Main Mode Navigation Bar */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("lead")}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === "lead"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FaUserPlus className="text-xs" />
            <span>Create Sales Lead</span>
          </button>

          <button
            onClick={() => setActiveTab("complaint")}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === "complaint"
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FaExclamationTriangle className="text-xs" />
            <span>Sales Complaints & Tickets</span>
          </button>
        </div>

        <span className="text-[10px] text-gray-400 font-mono">
          Group: {group} {customerNumber ? `| Customer #${customerNumber}` : ''}
        </span>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* TAB 1: CREATE NEW SALES LEAD FORM                                    */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === "lead" && (
        <div className="flex flex-col gap-4">
          
          {leadResponseToast && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl flex items-center justify-between shadow-xs animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-xs text-emerald-950">{leadResponseToast.message}</h4>
                  <div className="flex items-center gap-3 text-[11px] text-emerald-700 mt-0.5 font-mono">
                    <span>Reference ID: <strong className="text-gray-900 font-bold">{leadResponseToast.referenceId}</strong></span>
                    <span>•</span>
                    <span>Status: <strong className="uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded text-[10px] font-bold">{leadResponseToast.status}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSaveLead} className="space-y-3 text-xs">
            {/* ROW 1: Lead Origin, Lead Source, Branch Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Lead Origin <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. BMW Test Drive - EN"
                  required
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Lead Source <span className="text-rose-500">*</span>
                </label>
                <select 
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="WEBENQUIRY">WEBENQUIRY</option>
                  <option value="SHOWROOM">SHOWROOM</option>
                  <option value="REFERRAL">REFERRAL</option>
                  <option value="PHONE">PHONE</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Branch Code <span className="text-rose-500">*</span>
                </label>
                <select 
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="10">10 - Sheikh Zayed Road</option>
                  <option value="20">20 - Sharjah Branch</option>
                  <option value="30">30 - Abu Dhabi Branch</option>
                </select>
              </div>
            </div>

            {/* ROW 2: Title, First Name, Surname */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Title</label>
                <select 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Mr">Mr</option>
                  <option value="Ms">Ms</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Messrs">Messrs</option>
                  <option value="Dr">Dr</option>
                  <option value="Prof">Prof</option>
                  <option value="Eng">Eng</option>
                  {!["Mr", "Ms", "Mrs", "Messrs", "Dr", "Prof", "Eng"].includes(title) && (
                    <option value={title}>{title}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  required
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Surname <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  required
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500" 
                />
              </div>
            </div>

            {/* ROW 3: Email, Mobile, Vehicle Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Email Address <span className="text-rose-500">*</span></label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Mobile / Phone <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Vehicle Type (New/Used)</label>
                <select 
                  value={newused}
                  onChange={(e) => setNewused(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="NEW">NEW</option>
                  <option value="USED">USED</option>
                </select>
              </div>
            </div>

            {/* ROW 4: Model & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Interested Model <span className="text-rose-500">*</span></label>
                <select 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="X3">BMW X3</option>
                  <option value="X5">BMW X5 xDrive40i</option>
                  <option value="X6">BMW X6 xDrive40i</option>
                  <option value="X7">BMW X7 xDrive40i</option>
                  <option value="520i">BMW 520i Sedan</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Enquiry Notes</label>
                <textarea 
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Form Submit Button */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={submittingLead}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {submittingLead ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    <span>Submitting Lead...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="text-xs" />
                    <span>Create Sales Lead</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 2: COMPLAINT TICKET MANAGEMENT (POSTMAN 6. COMPLAINTS)           */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === "complaint" && (
        <div className="flex flex-col gap-4">
          
          {/* Create Complaint Ticket Form */}
          <div className="p-4 bg-amber-50/50 border border-amber-200/70 rounded-xl space-y-3">
            <h3 className="font-extrabold text-amber-950 text-xs flex items-center gap-2">
              <FaExclamationTriangle className="text-amber-600 text-sm" /> Create Complaint Ticket
            </h3>

            {complaintToast && (
              <div className={`p-3 rounded-lg text-xs font-bold ${
                complaintToast.ok ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}>
                {complaintToast.message}
              </div>
            )}

            <form onSubmit={handleCreateComplaint} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Complaint Category</label>
                  <select 
                    value={complaintCategory}
                    onChange={(e) => setComplaintCategory(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Sales / Dealership Experience">Sales / Dealership Experience</option>
                    <option value="Vehicle Delivery Delay">Vehicle Delivery Delay</option>
                    <option value="Issue after last visit">Issue after last visit</option>
                    <option value="Pricing / Invoice Query">Pricing / Invoice Query</option>
                    <option value="Staff Communication">Staff Communication</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Vehicle VIN (Optional)</label>
                  <input 
                    type="text" 
                    value={complaintVin}
                    onChange={(e) => setComplaintVin(e.target.value)}
                    placeholder="e.g. WBA31HC04SFT82888"
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg font-mono font-semibold text-gray-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea 
                  rows={2}
                  value={complaintDescription}
                  onChange={(e) => setComplaintDescription(e.target.value)}
                  placeholder="Provide detailed description of the complaint issue..."
                  required
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={submittingComplaint || !complaintDescription.trim()}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingComplaint ? <FaSpinner className="animate-spin text-xs" /> : <FaPaperPlane className="text-xs" />}
                  <span>Submit Complaint Ticket</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Operations & Actions Bar for Selected Complaint Reference */}
          <div className="p-4 bg-gradient-to-r from-amber-50 via-orange-50/40 to-slate-50 rounded-xl border border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Complaint Actions & Operations</span>
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <span>Selected Complaint Ref:</span>
                <span className="font-mono text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200 shadow-2xs">
                  {selectedComplaintRef || searchComplaintRef || "None Selected"}
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <form onSubmit={handleLookupComplaintSubmit} className="flex items-center gap-1.5">
                <div className="relative">
                  <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-[10px]" />
                  <input
                    type="text"
                    value={searchComplaintRef}
                    onChange={(e) => setSearchComplaintRef(e.target.value)}
                    placeholder="Ref # (e.g. AGMC-1)..."
                    className="pl-7 pr-2 py-1 bg-white border border-gray-200 rounded-lg text-xs w-36 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!searchComplaintRef.trim() || actionLoading}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1"
                >
                  {actionLoading ? <FaSpinner className="animate-spin text-xs" /> : 'Lookup'}
                </button>
              </form>
            </div>
          </div>

          {/* Complaint Action Suite Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleTriggerComplaintAction('ack')}
              disabled={!selectedComplaintRef && !searchComplaintRef}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
              title="GET /api/v1/complaints/{group}/{complaintReference}"
            >
              <FaBell className="text-xs" /> Send Acknowledgement
            </button>

            <button
              onClick={() => handleTriggerComplaintAction('monitor')}
              disabled={!selectedComplaintRef && !searchComplaintRef}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
              title="GET /api/v1/complaints/{group}/{complaintReference}"
            >
              <FaClock className="text-xs" /> Monitor Complaint Status
            </button>

            <button
              onClick={() => handleTriggerComplaintAction('satisfaction')}
              disabled={!selectedComplaintRef && !searchComplaintRef}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
              title="GET /api/v1/complaints/{group}/{complaintReference}"
            >
              <FaStar className="text-xs" /> Trigger Satisfaction Form
            </button>
          </div>

          {/* Action Result Details Box */}
          {complaintActionResult && (
            <div className={`p-4 rounded-xl text-xs space-y-2 animate-fade-in ${
              complaintActionResult.ok 
                ? 'bg-amber-50/80 border border-amber-200 text-amber-900' 
                : 'bg-rose-50/80 border border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                <h4 className="font-extrabold text-sm flex items-center gap-2">
                  <FaCheckCircle className={complaintActionResult.ok ? 'text-amber-600' : 'text-rose-600'} />
                  Action '{complaintActionResult.action}' executed for Complaint #{complaintActionResult.ref}
                </h4>
                <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200 font-bold">
                  {complaintActionResult.ok ? 'Completed' : 'Response'}
                </span>
              </div>

              {complaintActionResult.error ? (
                <p className="text-xs font-medium text-rose-700">{complaintActionResult.error}</p>
              ) : (
                <details className="cursor-pointer text-[10px]">
                  <summary className="font-bold text-gray-600 hover:text-gray-900">View Raw Response Data</summary>
                  <pre className="mt-1 font-mono text-[10px] p-2.5 bg-gray-900 text-amber-400 rounded-lg overflow-x-auto max-h-48">
                    {JSON.stringify(complaintActionResult.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Customer Active Complaints Table */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
                <FaExclamationTriangle className="text-amber-600" /> Customer Active Complaint Tickets ({customerComplaints.length})
              </h3>
              <button 
                onClick={fetchCustomerComplaints}
                className="p-1 text-gray-500 hover:text-gray-800 cursor-pointer"
                title="Refresh Complaints"
              >
                <FaRedo className={`text-xs ${loadingComplaints ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingComplaints ? (
              <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
                <FaSpinner className="animate-spin text-xl text-amber-600" />
                <span className="text-xs font-medium">Loading customer complaints...</span>
              </div>
            ) : customerComplaints.length === 0 ? (
              <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-1">
                <FaInfoCircle className="mx-auto text-xl text-gray-300 mb-1" />
                <p className="font-bold text-gray-700 text-xs">No active complaint tickets found for Customer #{customerNumber || 'N/A'}.</p>
                <p className="text-[11px] text-gray-400">
                  You can use the form above to submit a new complaint ticket or lookup an existing reference ID.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[9px] border-b border-gray-100">
                    <tr>
                      <th className="py-2.5 px-3">Complaint Ref #</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
                    {customerComplaints.map((item, idx) => {
                      const refId = item.complaintId || item.id || item.complaintReference || `AGMC-${idx+1}`;
                      const isSelected = selectedComplaintRef === refId;
                      return (
                        <tr key={idx} className={`hover:bg-amber-50/40 transition-colors ${isSelected ? 'bg-amber-50/60 font-semibold' : ''}`}>
                          <td className="py-3 px-3 font-mono font-bold text-amber-700">{renderSafeVal(refId)}</td>
                          <td className="py-3 px-3 font-bold text-gray-900">{renderSafeVal(item.category)}</td>
                          <td className="py-3 px-3 text-gray-800 max-w-xs truncate" title={item.description}>{renderSafeVal(item.description)}</td>
                          <td className="py-3 px-3 font-mono text-gray-600">{renderSafeVal(item.createdDate || item.date)}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                              {renderSafeVal(item.status || 'OPEN')}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => { setSelectedComplaintRef(refId); handleTriggerComplaintAction('monitor', refId); }}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold cursor-pointer"
                            >
                              Inspect #{refId}
                            </button>
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

    </div>
  );
}
