import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { createComplaintCase } from '../utils/api';
import { 
  FaPlusCircle, 
  FaPaperPlane, 
  FaSpinner, 
  FaUser, 
  FaBuilding, 
  FaLayerGroup, 
  FaBriefcase, 
  FaPhoneAlt, 
  FaEnvelope,
  FaFlag, 
  FaClipboardList, 
  FaTag, 
  FaUserCheck, 
  FaAlignLeft, 
  FaCar, 
  FaCheckCircle,
  FaShieldAlt
} from 'react-icons/fa';

export default function CreateComplaintView() {
  const { customer, getFormattedName, agentId, group: contextGroup, currentMobile } = useCustomer();

  const customerNameFormatted = getFormattedName();
  const initialCustomerNo = customer?.customerNumber || customer?.id || "123456";
  const initialCustomerName = customerNameFormatted && customerNameFormatted !== 'Walk-in Customer' && customerNameFormatted !== 'Unknown'
    ? customerNameFormatted 
    : (customer?.name || customer?.customerName || "Ahmed Ali");
  const initialGroup = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || "Geely");
  const initialPhone = customer?.mobile || currentMobile || "971454378907";
  const initialEmail = customer?.email || "ahmedali@agmc.com";

  // FORM FIELDS MATCHING POST /api/v1/complaints
  const [group, setGroup] = useState(initialGroup);
  const [customerId, setCustomerId] = useState(initialCustomerNo);
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [customerPhone, setCustomerPhone] = useState(initialPhone);
  const [customerEmail, setCustomerEmail] = useState(initialEmail);
  const [department, setDepartment] = useState("Service");
  const [source, setSource] = useState("Customer Call");
  const [complaintPriority, setComplaintPriority] = useState("Urgent");
  const [complaintGroup, setComplaintGroup] = useState("Customer");
  const [category, setCategory] = useState("Service Delay");
  const [complaint, setComplaint] = useState("Car not ready on the promised date");
  const [externalRef, setExternalRef] = useState(`GENESYS-000${Math.floor(10 + Math.random() * 90)}`);

  // TOAST & SUBMIT STATE
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Sync state when active customer changes
  useEffect(() => {
    if (customer) {
      if (customer?.customerNumber || customer?.id) {
        setCustomerId(customer?.customerNumber || customer?.id);
      }
      const formatted = getFormattedName();
      if (formatted && formatted !== 'Walk-in Customer' && formatted !== 'Unknown') {
        setCustomerName(formatted);
      } else if (customer?.name || customer?.customerName) {
        setCustomerName(customer?.name || customer?.customerName);
      }
      if (customer?.mobile || currentMobile) {
        setCustomerPhone(customer?.mobile || currentMobile);
      }
      if (customer?.email) {
        setCustomerEmail(customer?.email);
      }
      if (customer?.keyloopGroup) {
        setGroup(customer.keyloopGroup);
      }
    }
  }, [customer, currentMobile]);

  useEffect(() => {
    if (contextGroup) {
      setGroup(contextGroup);
    }
  }, [contextGroup]);

  // Auto-dismiss success toast after 8 seconds
  useEffect(() => {
    if (toast && !toast.isError) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const brandGroups = ['Geely', 'BMW', 'MINI', 'Rolls-Royce'];

  const departments = [
    "Service",
    "Sales",
    "Parts",
    "Body Shop",
    "Customer Care / CRM",
    "Finance & Accounts"
  ];

  const sources = [
    "Customer Call",
    "Email",
    "Walk-in",
    "Web Inquiry",
    "WhatsApp / Chat",
    "Social Media",
    "Management Escalation"
  ];

  const priorities = ["Urgent", "High", "Normal", "Low"];

  const complaintGroups = [
    "Customer",
    "Process",
    "Staff / People",
    "Vehicle / Technical",
    "Billing & Invoicing",
    "Parts & Accessories",
    "Facility / Showroom"
  ];

  const categories = [
    "Service Delay",
    "Process Delay",
    "Customer Handling Skills",
    "Delay in Parts Delivery",
    "Service Quality Issue",
    "Pricing & Invoice Dispute",
    "Staff Conduct & Behavior",
    "Vehicle Repair Quality",
    "Communication Gap",
    "Other Complaint"
  ];

  const complaintTemplates = [
    "Car not ready on the promised date",
    "the work is taking too much time.",
    "Advisor did not call back as promised.",
    "Vehicle repair delayed without advance notification.",
    "Invoice amount differs from initial cost estimate.",
    "Quality of repair unsatisfactory upon vehicle collection.",
    "Delay in spare parts procurement from central warehouse.",
    "Staff behavior during customer reception was unprofessional."
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaint.trim() || !customerId.trim() || !customerName.trim()) {
      setToast({ isError: true, message: "Please fill in Customer ID, Customer Name, and Complaint description." });
      return;
    }

    setSubmitting(true);
    setToast(null);

    const details = {
      company: group || "Geely",
      customerId: String(customerId || "").trim(),
      customerName: String(customerName || "").trim(),
      customerPhone: String(customerPhone || "").trim(),
      customerEmail: String(customerEmail || "").trim(),
      complaint: String(complaint || "").trim(),
      category: category || "Service Delay",
      complaintPriority: complaintPriority || "Urgent",
      department: department || "Service",
      source: source || "Customer Call",
      complaintGroup: complaintGroup || "Customer",
      externalRef: String(externalRef || "").trim() || `GENESYS-000${Math.floor(10 + Math.random() * 90)}`
    };

    try {
      const res = await createComplaintCase(details);

      if (res && res.ok) {
        setToast({
          isError: false,
          message: "Complaint ticket registered successfully!",
          referenceId: res.referenceId,
          ticketNumber: res.ticketNumber,
          keyloopStatus: res.keyloopStatus,
          cxpulseStatus: res.cxpulseStatus,
          keyloopRef: res.keyloopRef,
          company: res.company,
          data: res.data
        });
        // Generate fresh externalRef for the next complaint
        setExternalRef(`GENESYS-000${Math.floor(10 + Math.random() * 90)}`);
        // Clear complaint description
        setComplaint("");
      } else {
        setToast({
          isError: true,
          message: res?.errorMessage || "Failed to create complaint ticket"
        });
      }
    } catch (err) {
      console.error("Create Complaint error:", err);
      setToast({
        isError: true,
        message: err.message || "Failed to submit complaint ticket"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 text-xs w-full">
      
      {/* TOAST MESSAGE (Appears on API 200 or Error) */}
      {toast && (
        <div className={`p-4 rounded-xl flex flex-col gap-2.5 shadow-xs border transition-all animate-fade-in ${
          toast.isError
            ? "bg-rose-50 border-rose-200 text-rose-900"
            : "bg-emerald-50 border-emerald-200 text-emerald-950"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-2xs ${
                toast.isError ? "bg-rose-500" : "bg-emerald-600"
              }`}>
                {toast.isError ? "✕" : "✓"}
              </div>
              <div>
                <h4 className="font-bold text-xs">{toast.message}</h4>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setToast(null)} 
              className="text-gray-400 hover:text-gray-700 font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {!toast.isError && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-emerald-200/80 text-xs">
              {toast.referenceId && (
                <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Reference ID</span>
                  <span className="font-mono font-bold text-emerald-900 text-xs block truncate">{toast.referenceId}</span>
                  {toast.company && (
                    <span className="text-[10px] text-gray-500">Company: <strong>{toast.company}</strong></span>
                  )}
                </div>
              )}
              <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">CXPulse CRM</span>
                  {toast.cxpulseStatus && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                      toast.cxpulseStatus === 'CREATED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {toast.cxpulseStatus}
                    </span>
                  )}
                </div>
                {toast.ticketNumber ? (
                  <span className="font-mono font-bold text-blue-900 text-xs block">Ticket #{toast.ticketNumber}</span>
                ) : (
                  <span className="text-[11px] text-gray-500">Ticket Queued</span>
                )}
              </div>
              <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-200 shadow-2xs">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Keyloop DMS</span>
                  {toast.keyloopStatus && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-extrabold uppercase">
                      {toast.keyloopStatus}
                    </span>
                  )}
                </div>
                {toast.keyloopRef ? (
                  <span className="font-mono text-[10px] text-gray-700 block truncate" title={toast.keyloopRef}>
                    Ref: {toast.keyloopRef}
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-500">{toast.keyloopStatus || 'Handled'}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MAIN COMPLAINT FORM CARD */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        
        {/* Header Bar matching New Enquiry */}
        <div className="bg-slate-50/80 px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
              <FaPlusCircle />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-xs leading-tight">Create Customer Complaint</h2>
              <p className="text-[10px] text-gray-400">
                Register an escalation for <span className="font-semibold text-gray-700">{customerName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
            <span className="text-[10px] text-gray-500 font-medium">
              Company: <span className="font-bold text-gray-800">{group}</span> | <span className="font-bold text-gray-800">Customer #{customerId}</span>
            </span>
            <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shadow-2xs shrink-0">
              <FaCar className="text-[10px]" />
            </div>
          </div>
        </div>

        {/* Form Body with Clean 3-Column Grid */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex flex-col gap-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            
            {/* 1. Company / Brand */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                Company / Brand <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                  <FaLayerGroup />
                </div>
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs cursor-pointer"
                >
                  {brandGroups.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                  {!brandGroups.includes(group) && (
                    <option value={group}>{group}</option>
                  )}
                </select>
              </div>
            </div>

            {/* 2. Customer ID */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                Customer ID <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                  <FaUser />
                </div>
                <input
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="e.g. 123456"
                  required
                  className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs font-mono placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* 3. Customer Name */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                Customer Name <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                  <FaUserCheck />
                </div>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ahmed Ali"
                  required
                  className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* 4. Customer Phone */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                Customer Phone <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                  <FaPhoneAlt />
                </div>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 971454378907"
                  required
                  className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs font-mono placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* 5. Customer Email */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                Customer Email
              </label>
              <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. ahmedali@agmc.com"
                  className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* 6. Department */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                Department <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                  <FaBriefcase />
                </div>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs cursor-pointer"
                >
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 7. Complaint Source */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                Complaint Source <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                  <FaPhoneAlt />
                </div>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs cursor-pointer"
                >
                  {sources.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 8. Complaint Priority */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                Priority <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                  <FaFlag />
                </div>
                <select
                  value={complaintPriority}
                  onChange={(e) => setComplaintPriority(e.target.value)}
                  className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs cursor-pointer"
                >
                  {priorities.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 9. Complaint Group */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                Complaint Group <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                  <FaClipboardList />
                </div>
                <select
                  value={complaintGroup}
                  onChange={(e) => setComplaintGroup(e.target.value)}
                  className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs cursor-pointer"
                >
                  {complaintGroups.map(cg => (
                    <option key={cg} value={cg}>{cg}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 10. Category */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                Category <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                  <FaTag />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 11. External Reference */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                External Reference <span className="text-gray-400 font-normal">(Auto-generated or custom)</span>
              </label>
              <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                  <FaTag />
                </div>
                <input
                  type="text"
                  value={externalRef}
                  onChange={(e) => setExternalRef(e.target.value)}
                  placeholder="e.g. GENESYS-00029"
                  className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs font-mono placeholder:text-gray-400"
                />
              </div>
            </div>

          </div>

          {/* 12. Complaint Description (Textarea + Quick Templates Dropdown) */}
          <div className="pt-0.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
              <label className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                <FaAlignLeft className="text-blue-500 text-[10px]" />
                <span>Complaint Description</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>

              {/* Quick Template Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-gray-400">Template:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) setComplaint(e.target.value);
                  }}
                  defaultValue=""
                  className="h-6 px-2 bg-white border border-slate-200/90 rounded-md text-[11px] font-medium text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                >
                  <option value="" disabled>-- Select Quick Template --</option>
                  {complaintTemplates.map((tmpl, idx) => (
                    <option key={idx} value={tmpl}>{tmpl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative w-full bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs transition-all p-2">
              <textarea
                rows={3}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Enter detailed description of customer complaint..."
                required
                className="w-full bg-transparent border-0 focus:outline-none text-xs font-semibold text-gray-800 leading-relaxed resize-none placeholder:text-gray-400"
              />
              <div className="text-right text-[10px] text-gray-400 select-none pt-0.5">
                {complaint.length} characters
              </div>
            </div>
          </div>

          {/* Form Submit Action Row */}
          <div className="pt-1 flex items-center justify-end border-t border-gray-100">
            <button
              type="submit"
              disabled={submitting}
              className="h-8.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin text-xs" />
                  <span>Submitting Complaint...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane className="text-xs" />
                  <span>Create Complaint Ticket</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
