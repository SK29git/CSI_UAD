import React, { useState, useEffect, useRef } from 'react';
import { useCustomer, isExistingCustomer } from '../context/CustomerContext';
import { apiFetch, submitLeadIntake, executeRpaCase } from '../utils/api';
import { 
  FaUserPlus,
  FaUserCheck,
  FaExclamationTriangle,
  FaPaperPlane,
  FaSpinner,
  FaSearch,
  FaBell,
  FaCheckCircle,
  FaStar,
  FaInfoCircle,
  FaRedo,
  FaClock,
  FaChevronDown,
  FaCheck,
  FaTh,
  FaBullhorn,
  FaBuilding,
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaCar,
  FaList,
  FaMapMarkerAlt,
  FaRegFileAlt
} from 'react-icons/fa';
import { getFullMobileNumber, isFullMobileNumber } from '../utils/phoneUtils';
import { BRAND_OPTIONS, getModelsForBrand, GEELY_BRANCHES, BMW_BRANCHES, getBranchesForGroup } from '../data/brandModels';

/**
 * CustomSelect - Compact dropdown that ALWAYS opens downwards with medium scrollbar height
 */
function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = '-- Select --',
  searchable = true,
  searchPlaceholder = 'Search...',
  required = false,
  icon = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const normalizedOptions = options.map(opt => 
    typeof opt === 'object' ? opt : { value: opt, label: opt }
  );

  const selectedOption = normalizedOptions.find(o => o.value === value) || (value ? { value, label: value } : null);

  const filteredOptions = normalizedOptions.filter(o => 
    (o.label || o.value || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative w-full ${isOpen ? 'z-50' : 'z-10'}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => { setIsOpen(prev => !prev); setSearch(''); }}
        className={`w-full h-8 px-2 bg-white border rounded-lg font-semibold text-gray-800 text-left flex items-center justify-between cursor-pointer shadow-2xs text-xs transition-all ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200/90 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center min-w-0 flex-1">
          {icon && (
            <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
              {icon}
            </div>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : <span className="text-gray-400 font-normal">{placeholder}</span>}
          </span>
        </div>
        <FaChevronDown className={`text-gray-400 text-[9px] shrink-0 ml-1 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {required && (
        <input
          tabIndex={-1}
          autoComplete="off"
          style={{ opacity: 0, width: 0, height: 0, position: 'absolute', pointerEvents: 'none' }}
          value={value || ''}
          onChange={() => {}}
          required={required}
        />
      )}

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 flex flex-col gap-1 animate-in fade-in slide-in-from-top-1">
          {searchable && normalizedOptions.length > 8 && (
            <div className="relative p-1">
              <FaSearch className="absolute left-3 top-3 text-gray-400 text-[10px]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                autoFocus
                className="w-full pl-7 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div className="max-h-48 overflow-y-auto flex flex-col gap-0.5 pr-0.5 divide-y divide-gray-50 text-xs">
            {filteredOptions.length === 0 ? (
              <div className="p-2.5 text-center text-gray-400 text-xs">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-2.5 py-2 text-left text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-gray-800 hover:bg-blue-50 hover:text-blue-700 font-medium'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <FaCheck className="text-[10px] shrink-0 ml-1.5 text-white" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const LEAD_SOURCES = [
  'CRM Inbound',
  'CRM Outbound',
  'CRM Digital Media / Online Enquiries',
  'CRM Service Booking Lead'
];

const LEAD_ORIGINS = [
  'BMW Test Drive - EN',
  'BMW Test Drive - AR',
  'BMW Web Enquiry',
  'Geely Test Drive - EN',
  'Geely Web Enquiry',
  'MINI Test Drive',
  'Motorrad Test Drive',
  'Showroom Walk-in',
  'Website Inquiry',
  'Digital Campaign',
  'Call Center Inbound',
  'Direct Referral'
];

const TITLE_OPTIONS = [
  'Mr',
  'Ms',
  'Mrs',
  'Messrs',
  'Dr',
  'Prof',
  'Eng'
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
  const { customer, currentMobile, group: contextGroup } = useCustomer();
  const hasCustomer = isExistingCustomer(customer);
  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || '');
  const customerNumber = customer?.customerNumber || "";
  const vin = customer?.vin || (customer?.vehicles && customer?.vehicles[0]?.vin) || "";

  const [activeTab, setActiveTab] = useState("lead"); // "lead" | "complaint"

  // ----------------------------------------------------
  // 1. LEAD STATE & HANDLERS
  // ----------------------------------------------------
  const resolveMake = (val) => {
    if (!val) return 'BMW';
    const norm = String(val).trim().toUpperCase();
    if (BRAND_OPTIONS.some(b => b.code === norm)) return norm;
    if (norm === 'GEELY') return 'GEELY';
    if (norm === 'ROLLS-ROYCE' || norm === 'ROLLS_ROYCE') return 'ROLLS';
    if (norm === 'BMW_I' || norm === 'BMW I') return 'BMWI';
    if (norm === 'BMW_MOTORRAD' || norm === 'MOTORRAD') return 'BMWMOTO';
    return norm;
  };

  const initialMake = resolveMake(group || customer?.keyloopGroup || 'BMW');
  const [make, setMake] = useState(initialMake);
  const [model, setModel] = useState(() => customer?.model || '');

  // Determine branch list dynamically based on group / make
  const getBranches = () => {
    const mk = String(make || '').toUpperCase();
    if (['GEELY', 'GALAXY', 'RIDDARA'].includes(mk)) {
      return GEELY_BRANCHES;
    }
    const grp = String(group || customer?.keyloopGroup || '').toUpperCase();
    if (grp.includes('GEELY')) {
      return GEELY_BRANCHES;
    }
    return BMW_BRANCHES;
  };

  const currentBranches = getBranches();

  const [title, setTitle] = useState(() => (customer?.salutation ? customer.salutation.replace(/\.$/, '').trim() : 'Mr'));
  const [firstname, setFirstname] = useState(() => customer?.firstName || '');
  const [surname, setSurname] = useState(() => customer?.surname || '');
  const [email, setEmail] = useState(() => customer?.email || customer?.emailRaw || '');
  const [mobile, setMobile] = useState(() => getFullMobileNumber(customer) || currentMobile || '');
  const [origin, setOrigin] = useState(group ? `${group} Test Drive - EN` : 'Test Drive - EN');
  const [source, setSource] = useState(LEAD_SOURCES[0]);
  const [branch, setBranch] = useState(() => {
    if (customer?.branchCode && currentBranches.some(b => b.code === customer.branchCode)) {
      return customer.branchCode;
    }
    return currentBranches[0]?.code || '10';
  });
  const [newused, setNewused] = useState('NEW');
  const [dealershipLocation, setDealershipLocation] = useState(() => {
    const brObj = currentBranches.find(b => b.code === (customer?.branchCode || '10'));
    return brObj ? brObj.name : (currentBranches[0]?.name || 'Sheikh Zayed Rd');
  });
  const [notes, setNotes] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadResponseToast, setLeadResponseToast] = useState(null);

  const currentModels = getModelsForBrand(make);
  const originOptions = Array.from(new Set([origin, ...LEAD_ORIGINS])).filter(Boolean);
  const titleOptions = Array.from(new Set([title, ...TITLE_OPTIONS])).filter(Boolean);

  useEffect(() => {
    if (customer && customer.customerNumber) {
      if (customer?.salutation) {
        const cleanSal = customer?.salutation?.replace(/\.$/, '').trim();
        setTitle(cleanSal || customer?.salutation);
      }
      setFirstname(customer?.firstName || '');
      setSurname(customer?.surname || '');
      setEmail(customer?.email || customer?.emailRaw || '');
      const fullMobile = getFullMobileNumber(customer, currentMobile);
      if (fullMobile) {
        setMobile(fullMobile);
      } else if (customer?.mobile && isFullMobileNumber(customer.mobile)) {
        setMobile(customer.mobile);
      } else if (isFullMobileNumber(currentMobile)) {
        setMobile(currentMobile);
      }
      if (customer?.branchCode) setBranch(customer?.branchCode);
      if (customer?.keyloopGroup) {
        const detectedMake = resolveMake(customer.keyloopGroup);
        setMake(detectedMake);
        const models = getModelsForBrand(detectedMake);
        if (customer?.model && models.includes(customer.model)) {
          setModel(customer.model);
        }
      }
    } else {
      // Clean state for New Customer / Prospect intake
      setTitle('Mr');
      setFirstname('');
      setSurname('');
      setEmail('');
      setMobile(currentMobile || '');
      setModel('');
      setNotes('');
    }
  }, [customer, currentMobile]);

  useEffect(() => {
    if (group && group !== make) {
      const resolved = resolveMake(group);
      setMake(resolved);
      setModel('');
    }
  }, [group]);

  // Keep branch valid if switching between Geely & BMW
  useEffect(() => {
    if (!currentBranches.some(b => b.code === branch)) {
      setBranch(currentBranches[0]?.code || '10');
    }
  }, [currentBranches, branch]);

  const handleMakeChange = (newMake) => {
    setMake(newMake);
    setModel('');
    setOrigin(`${newMake} Test Drive - EN`);
    setNotes('');
  };

  const handleModelChange = (newModel) => {
    setModel(newModel);
    if (!notes || notes.startsWith("Model : '")) {
      setNotes(newModel ? `Model : '${newModel}'` : '');
    }
  };

  const handleBranchChange = (newBranch) => {
    setBranch(newBranch);
    const brObj = currentBranches.find(b => b.code === newBranch);
    const brName = brObj ? brObj.name : 'Sheikh Zayed Rd';
    setDealershipLocation(brName);
    if (model) {
      setNotes(`Location : ${brName}, Model : '${model}'`);
    }
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    setSubmittingLead(true);
    setLeadResponseToast(null);

    const dynamicGroup = group || customer?.keyloopGroup || 'BMW';
    const brObj = currentBranches.find(b => b.code === branch);
    const branchLabel = brObj ? `${brObj.code} - ${brObj.name}` : `${branch} - ${dealershipLocation || 'Sheikh Zayed Rd'}`;
    const fullName = `${firstname} ${surname}`.trim() || customer?.fullName || "Valued Prospect";

    // If active profile is a Prospect with a prospect ID, use RPA Case: CONVERT_PROSPECT_TO_ENQUIRY (Item 4 in RPA collection)
    const prospectId = customer?.prospectNumber || (customer?.isProspect ? (customer?.customerNumber || customer?.id) : null);
    if (prospectId) {
      const rpaPayload = {
        prospectId: String(prospectId),
        customerName: fullName,
        group: dynamicGroup,
        branch: branchLabel,
        titleCode: title || customer?.salutation || "Mr.",
        area: customer?.location?.area || "Dubai",
        city: customer?.location?.city || "Dubai",
        country: customer?.nationality || "United Arab Emirates",
        postcode: "",
        source: source || customer?.leadSource || "Inbound",
        dob: customer?.dateOfBirth || "",
        vehicleType: (newused || "new").toLowerCase(),
        manufacturer: make || "BMW",
        model: model || "",
        purchaseType: "",
        dateRequired: ""
      };

      try {
        const result = await executeRpaCase("CONVERT_PROSPECT_TO_ENQUIRY", rpaPayload, {
          createdBy: "genesys"
        });

        const enqId = result?.result?.enquiryId || result?.result?.enquiryNumber || result?.taskId || "CONVERTED";
        setLeadResponseToast({
          isError: false,
          referenceId: String(enqId),
          status: "COMPLETED",
          message: `Prospect #${prospectId} successfully converted to Enquiry #${enqId} in Keyloop!`
        });
        setSubmittingLead(false);
        return;
      } catch (err) {
        console.warn("Prospect to Enquiry RPA failed, falling back to Lead Intake API:", err);
      }
    }

    // Default flow: New Lead Intake submission (for brand-new unassigned web prospects)
    const computedLocation = dealershipLocation.trim() || 'Sheikh Zayed Road Dubai';
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
      leadSource: source || LEAD_SOURCES[0],
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
          message: res.data.message || "Enquiry received and is being forwarded to Keyloop and Genesys"
        });
      }
    } catch (err) {
      console.error("Failed to submit enquiry:", err);
      setLeadResponseToast({
        isError: true,
        referenceId: "FAILED",
        status: "ERROR",
        message: err.message || "Failed to submit enquiry. Please check required fields."
      });
    } finally {
      setSubmittingLead(false);
    }
  };

  const handleSaveExistingCustomerEnquiry = async (e) => {
    e.preventDefault();
    const custNo = customerNumber || customer?.customerNumber || customer?.id;
    if (!custNo) {
      setLeadResponseToast({
        isError: true,
        referenceId: "FAILED",
        status: "ERROR",
        message: "No existing customer number found. Please select a customer or switch to Prospect mode."
      });
      return;
    }

    setSubmittingLead(true);
    setLeadResponseToast(null);

    const dynamicGroup = group || customer?.keyloopGroup || 'BMW';
    const brObj = currentBranches.find(b => b.code === branch);
    const branchLabel = brObj ? `${brObj.code} - ${brObj.name}` : `${branch} - ${dealershipLocation}`;
    const fullName = `${firstname} ${surname}`.trim() || customer?.fullName || customer?.name || "Valued Customer";

    const payload = {
      group: dynamicGroup,
      customerId: String(custNo),
      customerName: fullName,
      branch: branchLabel,
      vehicleType: (newused || "new").toLowerCase(),
      manufacturer: make,
      model: model
    };

    try {
      const result = await executeRpaCase("CONVERT_PROSPECT_TO_ENQUIRY", payload, {
        createdBy: "genesys"
      });

      const enqId = result?.result?.enquiryId || result?.result?.enquiryNumber || result?.taskId || "CREATED";
      setLeadResponseToast({
        isError: false,
        referenceId: String(enqId),
        status: "COMPLETED",
        message: `New Enquiry successfully created for Customer #${custNo} via Keyloop RPA!`
      });
    } catch (err) {
      console.warn("Existing customer enquiry RPA error, falling back to Lead Intake:", err);
      try {
        const computedLocation = dealershipLocation.trim() || 'Sheikh Zayed Road Dubai';
        const formattedMobile = formatMobileForLead(mobile);
        const intakeRes = await submitLeadIntake({
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
          leadSource: source || LEAD_SOURCES[0],
          branch: branch || "10",
          notes: `Existing Customer #${custNo}. ${notes || ''}`
        });

        if (intakeRes && intakeRes.ok && intakeRes.data) {
          setLeadResponseToast({
            isError: false,
            referenceId: intakeRes.data.referenceId || "AGMC-SUCCESS",
            status: intakeRes.data.status || "RECEIVED",
            message: `Enquiry received for Existing Customer #${custNo} and forwarded to Keyloop!`
          });
        }
      } catch (fallbackErr) {
        setLeadResponseToast({
          isError: true,
          referenceId: "FAILED",
          status: "ERROR",
          message: err.message || fallbackErr.message || "Failed to create enquiry for existing customer."
        });
      }
    } finally {
      setSubmittingLead(false);
    }
  };

  const handleSubmitEnquiry = (e) => {
    if (hasCustomer) {
      return handleSaveExistingCustomerEnquiry(e);
    }
    return handleSaveLead(e);
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
    <div className="bg-white rounded-xl p-2.5 sm:p-3 shadow-xs border border-slate-200/90 flex flex-col gap-2 text-xs transition-all">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        {/* Left: Icon, Title, Subtitle & Switch Tab Pill */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === "lead" ? (
            <>
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shadow-xs shrink-0">
                <FaUserPlus />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight">
                  New Enquiry
                </h2>
                <p className="text-[10px] text-gray-400 font-medium">
                  {hasCustomer 
                    ? `Create new enquiry for Customer #${customerNumber}` 
                    : 'Capture customer details to create a new enquiry'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("complaint")}
                className="ml-0 sm:ml-1.5 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center gap-1 border border-slate-200/80 cursor-pointer shadow-2xs transition-all"
              >
                <FaExclamationTriangle className="text-slate-500 text-[9px]" />
                <span>Sales Complaints & Tickets</span>
              </button>
            </>
          ) : (
            <>
              <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs shadow-xs shrink-0">
                <FaExclamationTriangle />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight">Sales Complaints & Tickets</h2>
                <p className="text-[10px] text-gray-400 font-medium">Manage and track customer complaints and inquiries</p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("lead")}
                className="ml-0 sm:ml-1.5 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center gap-1 border border-slate-200/80 cursor-pointer shadow-2xs transition-all"
              >
                <FaUserPlus className="text-blue-600 text-[9px]" />
                <span>New Enquiry</span>
              </button>
            </>
          )}
        </div>

        {/* Right: Group / Customer badge and Circular Car Icon */}
        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
          <span className="text-[10px] text-gray-500 font-medium">
            Group : <span className="font-bold text-gray-700">{group || 'BMW'}</span> | <span className="font-bold text-gray-700">{hasCustomer ? `Customer #${customerNumber}` : 'New Enquiry'}</span>
          </span>
          <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shadow-2xs shrink-0">
            <FaCar className="text-[10px]" />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* TAB 1: CREATE NEW ENQUIRY (EXISTING CUSTOMER) / NEW LEAD             */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === "lead" && (
        <div className="flex flex-col gap-2">

          {leadResponseToast && (
            <div className={`p-2.5 rounded-lg flex items-center justify-between shadow-xs border animate-fade-in ${
              leadResponseToast.isError
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shadow-xs text-white ${
                  leadResponseToast.isError ? "bg-rose-500" : "bg-emerald-500"
                }`}>
                  {leadResponseToast.isError ? "✕" : "✓"}
                </div>
                <div>
                  <h4 className={`font-bold text-xs ${leadResponseToast.isError ? "text-rose-950" : "text-emerald-950"}`}>
                    {leadResponseToast.message}
                  </h4>
                  <div className={`flex items-center gap-2 text-[10px] mt-0.5 font-mono ${
                    leadResponseToast.isError ? "text-rose-700" : "text-emerald-700"
                  }`}>
                    <span>Reference ID: <strong className="text-gray-900 font-bold">{leadResponseToast.referenceId}</strong></span>
                    <span>•</span>
                    <span>Status: <strong className={`uppercase px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      leadResponseToast.isError ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                    }`}>{leadResponseToast.status}</strong></span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLeadResponseToast(null)}
                className="text-gray-400 hover:text-gray-600 text-xs px-1.5 py-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmitEnquiry} className="space-y-1.5 text-xs">
            {/* Unified Continuous Grid: 3 columns on xl/lg, 2 columns on md/sm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-1.5">
              
              {/* 1. Lead Origin */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  Lead Origin <span className="text-rose-500 font-bold">*</span>
                </label>
                <CustomSelect
                  icon={<FaTh className="text-blue-500 text-[10px]" />}
                  value={origin}
                  onChange={(val) => setOrigin(val)}
                  options={originOptions.map(o => ({ value: o, label: o }))}
                  placeholder="Select Lead Origin"
                  searchPlaceholder="Search origin..."
                  required
                />
              </div>

              {/* 2. Lead Source */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  Lead Source <span className="text-rose-500 font-bold">*</span>
                </label>
                <CustomSelect
                  icon={<FaBullhorn className="text-blue-500 text-[10px]" />}
                  value={source}
                  onChange={(val) => setSource(val)}
                  options={LEAD_SOURCES.map(s => ({ value: s, label: s }))}
                  placeholder="Select Lead Source"
                  searchPlaceholder="Search source..."
                  required
                />
              </div>

              {/* 3. Branch Code */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  Branch Code <span className="text-rose-500 font-bold">*</span>
                </label>
                <CustomSelect
                  icon={<FaBuilding className="text-blue-500 text-[10px]" />}
                  value={branch}
                  onChange={(val) => handleBranchChange(val)}
                  options={currentBranches.map(b => ({ value: b.code, label: `${b.code} - ${b.name}` }))}
                  placeholder="-- Select Branch --"
                  searchPlaceholder="Search branch..."
                  required
                />
              </div>

              {/* 4. Title */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  Title
                </label>
                <CustomSelect
                  icon={<FaUser className="text-blue-500 text-[10px]" />}
                  value={title}
                  onChange={(val) => setTitle(val)}
                  options={titleOptions.map(t => ({ value: t, label: t }))}
                  placeholder="Select Title"
                />
              </div>

              {/* 5. First Name */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  First Name <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                  <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                    <FaUser />
                  </div>
                  <input 
                    type="text" 
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    required
                    placeholder="Enter first name"
                    className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* 6. Surname */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  Surname <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                  <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-xs mr-1.5">
                    <FaUser />
                  </div>
                  <input 
                    type="text" 
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    required
                    placeholder="Enter surname"
                    className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* 7. Mobile / Phone */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  Mobile / Phone <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                  <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                    <FaPhoneAlt />
                  </div>
                  <input 
                    type="text" 
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    placeholder="544444551"
                    className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* 8. Email Address */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  Email Address <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                  <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                    <FaEnvelope />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter email address"
                    className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* 9. Vehicle Type (New/Used) */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  Vehicle Type (New/Used)
                </label>
                <CustomSelect
                  icon={<FaCar className="text-blue-500 text-[10px]" />}
                  value={newused}
                  onChange={(val) => setNewused(val)}
                  options={[{ value: 'NEW', label: 'NEW' }, { value: 'USED', label: 'USED' }]}
                  placeholder="Select Vehicle Type"
                />
              </div>

              {/* 10. Make / Brand */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  Make / Brand <span className="text-rose-500 font-bold">*</span>
                </label>
                <CustomSelect
                  icon={<FaCar className="text-blue-500 text-[10px]" />}
                  value={make}
                  onChange={(val) => handleMakeChange(val)}
                  options={BRAND_OPTIONS.map((b) => ({ value: b.code, label: b.label }))}
                  placeholder="-- Select Brand --"
                  searchPlaceholder="Search brand..."
                  required
                />
              </div>

              {/* 11. Model */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  Model <span className="text-rose-500 font-bold">*</span>
                </label>
                <CustomSelect
                  icon={<FaList className="text-blue-500 text-[10px]" />}
                  value={model}
                  onChange={(val) => handleModelChange(val)}
                  options={currentModels.map((m) => ({ value: m, label: m }))}
                  placeholder={`-- Select Model (${currentModels.length} available) --`}
                  searchPlaceholder="Search model..."
                  required
                />
              </div>

              {/* 12. Location (Dealership) */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  Location (Dealership)
                </label>
                <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                  <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                    <FaMapMarkerAlt />
                  </div>
                  <input
                    type="text"
                    value={dealershipLocation}
                    onChange={(e) => setDealershipLocation(e.target.value)}
                    placeholder="e.g. Sheikh Zayed Rd"
                    className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs placeholder:text-gray-400"
                  />
                </div>
              </div>

            </div>

            {/* ROW: Enquiry Notes & Submit Button */}
            <div className="flex flex-col sm:flex-row items-end gap-2 pt-0.5">
              <div className="flex-1 w-full">
                <label className="text-[10px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  <FaRegFileAlt className="text-blue-500 text-[10px]" />
                  <span>Enquiry Notes</span>
                </label>
                <div className="relative w-full bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs transition-all px-2 py-1">
                  <textarea 
                    rows={1}
                    maxLength={500}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter enquiry notes..."
                    className="w-full bg-transparent border-0 focus:outline-none text-xs font-semibold text-gray-800 pr-12 py-0.5 leading-snug resize-none placeholder:text-gray-400 h-6.5"
                  />
                  <div className="absolute right-2 top-1.5 text-[9px] font-semibold text-gray-400 select-none">
                    {(notes || '').length}/500
                  </div>
                </div>
              </div>

              {/* Form Submit Button */}
              <button 
                type="submit" 
                disabled={submittingLead}
                className="h-8.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] disabled:opacity-50 shrink-0"
              >
                {submittingLead ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    <span>{hasCustomer ? 'Creating Enquiry...' : 'Submitting Enquiry...'}</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="text-xs" />
                    <span>{hasCustomer ? `Create Enquiry #${customerNumber}` : 'Create Enquiry'}</span>
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
