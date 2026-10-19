import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch, submitLeadIntake } from '../utils/api';
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
import { getFullMobileNumber, isFullMobileNumber } from '../utils/phoneUtils';

const BRAND_MODELS = {
  BMW: [
    'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'XM',
    '1 Series', '2 Series Gran Coupe', '3 Series Sedan', '4 Series Coupe', '4 Series Gran Coupe',
    '5 Series Sedan', '7 Series Sedan', '8 Series Gran Coupe',
    'i4', 'i5', 'i7', 'iX', 'iX1', 'iX3', 'M2', 'M3', 'M4', 'M5'
  ],
  Geely: [
    'Coolray', 'Monjaro', 'Tugella', 'Emgrand', 'Geometry C', 'Okavango', 'Preface', 'Starray', 'GX3 Pro'
  ],
  MINI: [
    'Cooper 3-Door', 'Cooper 5-Door', 'Countryman', 'Clubman', 'Aceman', 'Cabrio', 'John Cooper Works'
  ],
  'Rolls-Royce': [
    'Ghost', 'Phantom', 'Cullinan', 'Spectre'
  ]
};

const BRANCHES = [
  { code: '10', name: 'Sheikh Zayed Road Dubai' },
  { code: '20', name: 'Sharjah Branch' },
  { code: '30', name: 'Abu Dhabi Branch' },
  { code: '40', name: 'Deira Branch' },
  { code: '50', name: 'Motor City Dubai' }
];

const formatMobileForLead = (val) => {
  if (!val) return '';
  const str = String(val).trim();
  if (str.startsWith('+')) return str;
  if (str.startsWith('00')) return `+${str.slice(2)}`;
  const digits = str.replace(/[^0-9]/g, '');
  if (digits.startsWith('971')) return `+${digits}`;
  if (digits.startsWith('0')) return `+971${digits.slice(1)}`;
  return `+971${digits}`;
};

export default function SalesNewLeadView() {
  const { customer, group: contextGroup } = useCustomer();
  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || '');
  const customerNumber = customer?.customerNumber || "";
  const vin = customer?.vin || (customer?.vehicles && customer?.vehicles[0]?.vin) || "";

  const [activeTab, setActiveTab] = useState("lead"); // "lead" | "complaint"

  // ----------------------------------------------------
  // 1. LEAD STATE & HANDLERS
  // ----------------------------------------------------
  const [make, setMake] = useState(group || customer?.keyloopGroup || 'BMW');
  const [model, setModel] = useState(() => {
    const curMake = group || customer?.keyloopGroup || 'BMW';
    return (BRAND_MODELS[curMake] && BRAND_MODELS[curMake][2]) || (BRAND_MODELS[curMake] && BRAND_MODELS[curMake][0]) || 'X3';
  });
  const [title, setTitle] = useState(customer?.salutation || 'Mr');
  const [firstname, setFirstname] = useState(customer?.firstName || '');
  const [surname, setSurname] = useState(customer?.surname || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [mobile, setMobile] = useState(() => getFullMobileNumber(customer) || '');
  const [origin, setOrigin] = useState(group ? `${group} Test Drive - EN` : 'Test Drive - EN');
  const [source, setSource] = useState('WEBENQUIRY');
  const [branch, setBranch] = useState(customer?.branchCode || '10');
  const [newused, setNewused] = useState('NEW');
  const [customLocation, setCustomLocation] = useState('');
  const [notes, setNotes] = useState(() => {
    const curMake = group || customer?.keyloopGroup || 'BMW';
    return `Location : ${curMake} - Sheikh Zayed Road Dubai, Model : '${(BRAND_MODELS[curMake] && BRAND_MODELS[curMake][2]) || 'X3'}'`;
  });
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadResponseToast, setLeadResponseToast] = useState(null);

  useEffect(() => {
    if (customer) {
      if (customer?.salutation) {
        const cleanSal = customer?.salutation?.replace(/\.$/, '').trim();
        setTitle(cleanSal || customer?.salutation);
      }
      if (customer?.firstName) setFirstname(customer?.firstName);
      if (customer?.surname) setSurname(customer?.surname);
      if (customer?.email) setEmail(customer?.email);
      const fullMobile = getFullMobileNumber(customer);
      if (fullMobile) {
        setMobile(fullMobile);
      } else if (customer?.mobile && isFullMobileNumber(customer.mobile)) {
        setMobile(customer.mobile);
      }
      if (customer?.branchCode) setBranch(customer?.branchCode);
      if (customer?.keyloopGroup) {
        setMake(customer.keyloopGroup);
      }
    }
  }, [customer]);

  useEffect(() => {
    if (group && group !== make) {
      setMake(group);
      const models = BRAND_MODELS[group] || [];
      if (models.length > 0) setModel(models[0]);
    }
  }, [group]);

  const handleMakeChange = (newMake) => {
    setMake(newMake);
    const models = BRAND_MODELS[newMake] || [];
    const defModel = models[0] || '';
    setModel(defModel);
    setOrigin(`${newMake} Test Drive - EN`);
    const brObj = BRANCHES.find(b => b.code === branch);
    const brName = brObj ? brObj.name : 'Sheikh Zayed Road Dubai';
    setNotes(`Location : ${newMake} - ${brName}, Model : '${defModel}'`);
  };

  const handleBranchChange = (newBranch) => {
    setBranch(newBranch);
    const brObj = BRANCHES.find(b => b.code === newBranch);
    const brName = brObj ? brObj.name : 'Sheikh Zayed Road Dubai';
    setNotes(`Location : ${make} - ${brName}, Model : '${model}'`);
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    setSubmittingLead(true);
    setLeadResponseToast(null);

    const brObj = BRANCHES.find(b => b.code === branch);
    const brName = brObj ? brObj.name : 'Sheikh Zayed Road Dubai';
    const computedLocation = customLocation.trim() || `${make} - ${brName}`;
    const formattedMobile = formatMobileForLead(mobile);

    const payload = {
      firstName: firstname.trim(),
      lastName: surname.trim(),
      email: email.trim(),
      mobile: formattedMobile,
      make: make.trim(),
      model: model.trim(),
      newUsed: (newused || "new").toLowerCase(),
      location: computedLocation,
      title: title || "",
      leadOrigin: origin || "",
      leadSource: source || "WEBENQUIRY",
      branch: branch || "10",
      notes: notes || ""
    };

    try {
      const res = await submitLeadIntake(payload);

      if (res && res.ok && res.data) {
        setLeadResponseToast({
          isError: false,
          referenceId: res.data.referenceId || "AGMC-SUCCESS",
          status: res.data.status || "RECEIVED",
          message: res.data.message || "Lead received and is being forwarded to Keyloop and Genesys"
        });
      }
    } catch (err) {
      console.error("Failed to submit sales lead:", err);
      setLeadResponseToast({
        isError: true,
        referenceId: "FAILED",
        status: "ERROR",
        message: err.message || "Failed to submit sales lead. Please check required fields."
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
  const [actionSubTab, setActionSubTab] = useState('monitor'); // 'monitor' | 'ack' | 'satisfaction'

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
      const res = await apiFetch(`/api/v1/complaints?group=${group}&customerNumber=${customerNumber}&status=all`);
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
        // Automatically fetch and show acknowledgement for the newly created complaint
        handleTriggerComplaintAction('ack', newRef);
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
    setActionSubTab(actionType || 'monitor');
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
            <div className={`p-4 rounded-xl flex items-center justify-between shadow-xs border animate-fade-in ${
              leadResponseToast.isError
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs text-white ${
                  leadResponseToast.isError ? "bg-rose-500" : "bg-emerald-500"
                }`}>
                  {leadResponseToast.isError ? "✕" : "✓"}
                </div>
                <div>
                  <h4 className={`font-bold text-xs ${leadResponseToast.isError ? "text-rose-950" : "text-emerald-950"}`}>
                    {leadResponseToast.message}
                  </h4>
                  <div className={`flex items-center gap-3 text-[11px] mt-0.5 font-mono ${
                    leadResponseToast.isError ? "text-rose-700" : "text-emerald-700"
                  }`}>
                    <span>Reference ID: <strong className="text-gray-900 font-bold">{leadResponseToast.referenceId}</strong></span>
                    <span>•</span>
                    <span>Status: <strong className={`uppercase px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      leadResponseToast.isError ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                    }`}>{leadResponseToast.status}</strong></span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLeadResponseToast(null)}
                className="text-gray-400 hover:text-gray-600 text-xs px-2 py-1 rounded cursor-pointer"
              >
                ✕
              </button>
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
                  onChange={(e) => handleBranchChange(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
                >
                  {BRANCHES.map(b => (
                    <option key={b.code} value={b.code}>{b.code} - {b.name}</option>
                  ))}
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
                  placeholder="+971500000001"
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

            {/* ROW 4: Make/Brand, Interested Model, Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Make / Brand <span className="text-rose-500">*</span>
                </label>
                <select
                  value={make}
                  onChange={(e) => handleMakeChange(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="BMW">BMW</option>
                  <option value="Geely">Geely</option>
                  <option value="MINI">MINI</option>
                  <option value="Rolls-Royce">Rolls-Royce</option>
                  {!["BMW", "Geely", "MINI", "Rolls-Royce"].includes(make) && make && (
                    <option value={make}>{make}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Interested Model <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="brand-model-options"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Coolray, X3, etc."
                    required
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
                  />
                  <datalist id="brand-model-options">
                    {(BRAND_MODELS[make] || []).map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Location (Dealership)
                </label>
                <input
                  type="text"
                  value={customLocation || `${make} - ${(BRANCHES.find(b => b.code === branch)?.name) || 'Sheikh Zayed Road Dubai'}`}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* ROW 5: Enquiry Notes */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">Enquiry Notes</label>
              <textarea 
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
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

          {/* Customer Active Complaints Table */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
                <FaExclamationTriangle className="text-amber-600" /> Customer Active Complaint Tickets ({customerComplaints.length})
              </h3>
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
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1"
                  >
                    {actionLoading ? <FaSpinner className="animate-spin text-xs" /> : 'Lookup'}
                  </button>
                </form>
                <button 
                  onClick={fetchCustomerComplaints}
                  className="p-1 text-gray-500 hover:text-gray-800 cursor-pointer"
                  title="Refresh Complaints"
                >
                  <FaRedo className={`text-xs ${loadingComplaints ? 'animate-spin' : ''}`} />
                </button>
              </div>
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
                          <td className="py-3 px-3 font-mono text-gray-600">{renderSafeVal(item.openDate || item.createdDate || item.date)}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                              {renderSafeVal(item.status || 'OPEN')}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => { setSelectedComplaintRef(refId); handleTriggerComplaintAction('monitor', refId); }}
                                className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold cursor-pointer"
                                title="Monitor Complaint Status"
                              >
                                Status
                              </button>
                              <button
                                onClick={() => { setSelectedComplaintRef(refId); handleTriggerComplaintAction('ack', refId); }}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold cursor-pointer"
                                title="Customer Acknowledgement"
                              >
                                Ack
                              </button>
                              <button
                                onClick={() => { setSelectedComplaintRef(refId); handleTriggerComplaintAction('satisfaction', refId); }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                                title="Satisfaction & Resolution Survey"
                              >
                                Survey
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

          {/* Action Result Details Box (shown DOWN BELOW the table when a complaint is inspected or looked up) */}
          {complaintActionResult && (
            <div className={`p-4 rounded-xl text-xs space-y-3 animate-fade-in ${
              complaintActionResult.ok 
                ? 'bg-amber-50/70 border border-amber-200 text-amber-950' 
                : 'bg-rose-50/80 border border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className={complaintActionResult.ok ? 'text-amber-600' : 'text-rose-600'} />
                  <h4 className="font-extrabold text-sm text-gray-900">
                    Complaint Ticket #{complaintActionResult.ref}
                  </h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    (complaintActionResult.data?.complaint?.status || complaintActionResult.data?.status) === 'CLOSED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {complaintActionResult.data?.complaint?.status || complaintActionResult.data?.status || 'OPEN'}
                  </span>
                </div>
                <button 
                  onClick={() => setComplaintActionResult(null)} 
                  className="text-gray-400 hover:text-gray-700 text-sm font-bold cursor-pointer p-1"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {complaintActionResult.error ? (
                <p className="text-xs font-medium text-rose-700">{complaintActionResult.error}</p>
              ) : (
                <>
                  {/* 3 Operational Action Tabs (matching Postman 6. Complaints APIs) */}
                  <div className="flex items-center gap-1.5 border-b border-amber-200/50 pb-2">
                    <button
                      onClick={() => setActionSubTab('monitor')}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                        actionSubTab === 'monitor'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-white text-gray-700 hover:bg-amber-100/60 border border-amber-200'
                      }`}
                    >
                      <FaClock className="text-xs" /> Monitor Status
                    </button>
                    <button
                      onClick={() => setActionSubTab('ack')}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                        actionSubTab === 'ack'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                      }`}
                    >
                      <FaBell className="text-xs" /> Customer Acknowledgement
                    </button>
                    <button
                      onClick={() => setActionSubTab('satisfaction')}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                        actionSubTab === 'satisfaction'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
                      }`}
                    >
                      <FaStar className="text-xs" /> Satisfaction & Closure
                    </button>
                  </div>

                  {/* TAB 1: MONITOR STATUS */}
                  {actionSubTab === 'monitor' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-[11px]">
                      <div>
                        <span className="text-gray-500 block text-[10px]">Category:</span>
                        <strong>{complaintActionResult.data?.complaint?.category || complaintActionResult.data?.category || 'Sales Experience'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Department:</span>
                        <strong>{complaintActionResult.data?.complaint?.department || complaintActionResult.data?.department || 'Sales'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Branch / Location:</span>
                        <strong>{complaintActionResult.data?.complaint?.location || 'Branch 10'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Raised Date:</span>
                        <strong>{(complaintActionResult.data?.complaint?.raisedDate || complaintActionResult.data?.createdAt || '').slice(0, 10) || 'Today'}</strong>
                      </div>
                      <div className="col-span-2 sm:col-span-4 bg-white p-2.5 rounded-lg border border-amber-200/80">
                        <span className="text-gray-500 block text-[10px] mb-0.5">Description:</span>
                        <p className="text-gray-800 font-medium">
                          {complaintActionResult.data?.complaint?.description || complaintActionResult.data?.description || 'No description provided'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: SEND ACKNOWLEDGEMENT */}
                  {actionSubTab === 'ack' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                      <div>
                        <span className="text-gray-500 block text-[10px]">Customer:</span>
                        <strong>{complaintActionResult.data?.customerName || customer?.fullName || 'Customer Record'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Mobile:</span>
                        <strong className="font-mono">{complaintActionResult.data?.mobile || customer?.mobile || 'N/A'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Email:</span>
                        <strong>{complaintActionResult.data?.email || customer?.email || 'N/A'}</strong>
                      </div>
                      <div className="col-span-2 sm:col-span-3 bg-white p-2.5 rounded-lg border border-blue-200">
                        <span className="text-blue-700 block text-[10px] font-bold uppercase mb-0.5">Acknowledgement Status:</span>
                        <p className="text-gray-700">
                          {complaintActionResult.data?.messageStatus 
                            ? `Status: ${complaintActionResult.data.messageStatus}` 
                            : 'Complaint ticket acknowledged and logged to customer communication profile.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: TRIGGER SATISFACTION FORM */}
                  {actionSubTab === 'satisfaction' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                      <div>
                        <span className="text-gray-500 block text-[10px]">Resolution State:</span>
                        <strong className="text-amber-800">
                          {(complaintActionResult.data?.complaint?.open ?? true) ? 'In Progress (Open)' : 'Resolved & Closed'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Closure Date:</span>
                        <strong>{complaintActionResult.data?.complaint?.closedDate || complaintActionResult.data?.closedAt || 'Active / Open'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Satisfaction Survey:</span>
                        <span className="inline-block bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
                          {(complaintActionResult.data?.complaint?.open ?? true) ? 'Eligible on resolution' : 'Dispatched'}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
