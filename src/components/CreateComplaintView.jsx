import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { createComplaintCase, DEFAULT_RPA_CALLBACK_URL } from '../utils/api';
import { 
  FaPlusCircle, 
  FaPaperPlane, 
  FaSpinner, 
  FaUser, 
  FaBuilding, 
  FaLayerGroup, 
  FaBriefcase, 
  FaPhoneAlt, 
  FaFlag, 
  FaClipboardList, 
  FaTag, 
  FaUserCheck, 
  FaAlignLeft, 
  FaCar, 
  FaCheckCircle 
} from 'react-icons/fa';

export default function CreateComplaintView() {
  const { customer, getFormattedName, agentId, group: contextGroup } = useCustomer();

  const customerNameFormatted = getFormattedName();
  const initialCustomerNo = customer?.customerNumber || customer?.id || "52660";
  const initialCustomerName = customerNameFormatted && customerNameFormatted !== 'Walk-in Customer' && customerNameFormatted !== 'Unknown'
    ? customerNameFormatted 
    : (customer?.name || customer?.customerName || "vera sfeir");
  const initialGroup = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || "BMW");

  // FORM FIELDS MATCHING POST /api/intake/cases (caseType: "CREATE_COMPLAINT")
  const [group, setGroup] = useState(initialGroup);
  const [customerId, setCustomerId] = useState(initialCustomerNo);
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [branch, setBranch] = useState("10 - Sheikh Zayed Rd");
  const [department, setDepartment] = useState("Service");
  const [source, setSource] = useState("Customer Call");
  const [complaintPriority, setComplaintPriority] = useState("Normal");
  const [complaintGroup, setComplaintGroup] = useState("Process");
  const [category, setCategory] = useState("Process Delay");
  const [complaint, setComplaint] = useState("the work is taking too much time.");
  const [allocateTo, setAllocateTo] = useState("pattepu");

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
      if (customer?.keyloopGroup) {
        setGroup(customer.keyloopGroup);
      }
    }
  }, [customer]);

  useEffect(() => {
    if (contextGroup) {
      setGroup(contextGroup);
    }
  }, [contextGroup]);

  // Auto-dismiss success toast after 5 seconds
  useEffect(() => {
    if (toast && !toast.isError) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const brandGroups = ['BMW', 'MINI', 'Rolls-Royce', 'GEELY'];

  const branches = [
    "10 - Sheikh Zayed Rd",
    "20 - Sharjah",
    "30 - Abu Dhabi",
    "40 - Deira",
    "10 - Geely Group - SZR",
    "20 - Geely Group - Sharjah",
    "30 - Ras Al Khaimah",
    "50 - Fujairah"
  ];

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

  const priorities = ["Normal", "Low", "High", "Urgent"];

  const complaintGroups = [
    "Process",
    "Staff / People",
    "Vehicle / Technical",
    "Billing & Invoicing",
    "Parts & Accessories",
    "Facility / Showroom"
  ];

  const categories = [
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
    "the work is taking too much time.",
    "Advisor did not call back as promised.",
    "Vehicle repair delayed without advance notification.",
    "Invoice amount differs from initial cost estimate.",
    "Quality of repair unsatisfactory upon vehicle collection.",
    "Delay in spare parts procurement from central warehouse.",
    "Staff behavior during customer reception was unprofessional."
  ];

  const allocateOptions = [
    { value: "pattepu", label: "pattepu (Primary Assignee)" },
    { value: "service.manager", label: "service.manager (Workshop Manager)" },
    { value: "crm.escalations", label: "crm.escalations (Customer Relations Lead)" },
    { value: "advisor.lead", label: "advisor.lead (Senior Service Advisor)" },
    { value: "unassigned", label: "unassigned (Queue Dispatch)" }
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
      group: group || "BMW",
      customerId: String(customerId || "").trim(),
      customerName: String(customerName || "").trim(),
      branch: branch || "10 - Sheikh Zayed Rd",
      department: department || "Service",
      source: source || "Customer Call",
      complaintPriority: complaintPriority || "Normal",
      complaintGroup: complaintGroup || "Process",
      category: category || "Process Delay",
      complaint: String(complaint || "").trim(),
      allocateTo: String(allocateTo || "pattepu").trim()
    };

    try {
      const res = await createComplaintCase(details, {
        createdBy: agentId || "genesys",
        callbackUrl: DEFAULT_RPA_CALLBACK_URL
      });

      if (res && res.ok) {
        setToast({
          isError: false,
          message: "Complaint registered successfully!",
          taskId: res.taskId || res.result?.taskId || null
        });
        // Clear complaint description for next entry
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
        <div className={`p-3 rounded-xl flex items-center justify-between shadow-xs border transition-all animate-fade-in ${
          toast.isError
            ? "bg-rose-50 border-rose-200 text-rose-900"
            : "bg-emerald-50 border-emerald-200 text-emerald-900"
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-2xs ${
              toast.isError ? "bg-rose-500" : "bg-emerald-600"
            }`}>
              {toast.isError ? "✕" : "✓"}
            </div>
            <div>
              <h4 className="font-bold text-xs">{toast.message}</h4>
              {toast.taskId && (
                <span className="text-[10px] text-emerald-700 font-mono font-semibold block">
                  RPA Task Reference: #{toast.taskId}
                </span>
              )}
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
      )}

      {/* MAIN ENQUIRY-STYLE COMPLAINT FORM CARD */}
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
              Group: <span className="font-bold text-gray-800">{group}</span> | <span className="font-bold text-gray-800">Customer #{customerId}</span>
            </span>
            <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shadow-2xs shrink-0">
              <FaCar className="text-[10px]" />
            </div>
          </div>
        </div>

        {/* Form Body with Clean 3-Column Grid matching New Enquiry */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex flex-col gap-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            
            {/* 1. Brand / Group (Dynamic Dropdown) */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                Automotive Group <span className="text-rose-500 font-bold">*</span>
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
                  placeholder="e.g. 52660"
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
                  placeholder="e.g. vera sfeir"
                  required
                  className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* 4. Branch Location */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                Branch Location <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                  <FaBuilding />
                </div>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs cursor-pointer"
                >
                  {branches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. Department */}
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

            {/* 6. Complaint Source */}
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

            {/* 7. Complaint Priority */}
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

            {/* 8. Complaint Group */}
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

            {/* 9. Category */}
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

          </div>

          {/* 10. Allocate To (Dropdown with option to type custom ID) */}
          <div className="pt-0.5">
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                Allocate To <span className="text-rose-500 font-bold">*</span>
              </label>
              <span className="text-[10px] text-gray-400 font-mono">Assignee: {allocateTo}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                  <FaUserCheck />
                </div>
                <select
                  value={allocateOptions.some(o => o.value === allocateTo) ? allocateTo : 'custom'}
                  onChange={(e) => {
                    if (e.target.value !== 'custom') {
                      setAllocateTo(e.target.value);
                    }
                  }}
                  className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs cursor-pointer"
                >
                  {allocateOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                  <option value="custom">-- Custom Staff ID --</option>
                </select>
              </div>

              {/* Direct Text Input for AllocateTo */}
              <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                <input
                  type="text"
                  value={allocateTo}
                  onChange={(e) => setAllocateTo(e.target.value)}
                  placeholder="Enter custom staff username or ID..."
                  required
                  className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs font-mono placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* 11. Complaint Description (Textarea + Quick Templates Dropdown) */}
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

          {/* Form Submit Action Row matching New Enquiry */}
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
                  <span>Create Complaint</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
