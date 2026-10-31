import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch, createSalesFollowUpCase } from '../utils/api';
import VehiclePackagesModal from './VehiclePackagesModal';
import { 
  FaWrench, 
  FaCalendarAlt, 
  FaCalendarPlus,
  FaUserCheck, 
  FaExclamationCircle, 
  FaSpinner, 
  FaRedo, 
  FaPhoneAlt, 
  FaCheckCircle, 
  FaSearch, 
  FaCar, 
  FaBell, 
  FaPaperPlane, 
  FaInfoCircle,
  FaShieldAlt,
  FaFileContract,
  FaExclamationTriangle,
  FaHistory,
  FaUserTie,
  FaClock,
  FaBuilding,
  FaTimes,
  FaLayerGroup,
  FaBoxes
} from 'react-icons/fa';
import { getFullMobileNumber } from '../utils/phoneUtils';

const BRANCH_OPTIONS = [
  { code: "10", name: "10 - Sheikh Zayed Rd" },
  { code: "11", name: "11 - Body & Paint Centre" },
  { code: "20", name: "20 - Sharjah" },
  { code: "25", name: "25 - Sajja Yard" },
  { code: "30", name: "30 - Ras Al Khaimah" },
  { code: "40", name: "40 - Deira" },
  { code: "50", name: "50 - Fujairah" },
  { code: "60", name: "60 - Motor City" },
  { code: "70", name: "70 - City Walk" },
  { code: "99", name: "99 - Head Office" }
];

export default function SalesAfterSalesView() {
  const { customer, vehicles: contextVehicles = [], currentMobile: contextMobile, group: contextGroup } = useCustomer();
  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || 'BMW');
  const customerNumber = customer?.customerNumber || customer?.id || "";
  const customerName = customer?.fullName || `${customer?.firstName || ''} ${customer?.surname || ''}`.trim() || "Customer Record";

  const cleanMobile = getFullMobileNumber(customer, contextMobile);

  // Tabs: 'CustomerVehicles' | 'ServiceBookings' | 'RetentionAlerts'
  const [activeTab, setActiveTab] = useState('CustomerVehicles');
  const [vehiclesList, setVehiclesList] = useState([]);
  const [selectedVehicleForPackages, setSelectedVehicleForPackages] = useState(null);
  const [bookingsList, setBookingsList] = useState([]);
  const [serviceDueList, setServiceDueList] = useState([]);
  const [noServiceList, setNoServiceList] = useState([]);
  const [reactivatedList, setReactivatedList] = useState([]);
  const [loading, setLoading] = useState(false);

  // WIP / Work Order Search and actions
  const [searchWipInput, setSearchWipInput] = useState("");
  const [selectedWipNo, setSelectedWipNo] = useState("");
  const [actionOutput, setActionOutput] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Sales Follow-Up RPA Modal State (caseType: 'CREATE_SALES_FOLLOW_UP')
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpCustomerId, setFollowUpCustomerId] = useState("");
  const [followUpCustomerName, setFollowUpCustomerName] = useState("");
  const [followUpGroup, setFollowUpGroup] = useState("BMW");
  const [followUpBranchCode, setFollowUpBranchCode] = useState("10");
  const [followUpAdvisorId, setFollowUpAdvisorId] = useState("kunnath");
  const [followUpAdvisorName, setFollowUpAdvisorName] = useState("");
  const [followUpAdvisorDisplay, setFollowUpAdvisorDisplay] = useState("");
  const [followUpDueDate, setFollowUpDueDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [followUpDueTime, setFollowUpDueTime] = useState("11:00");
  const [followUpNotes, setFollowUpNotes] = useState("please do a follow up on this customer");
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);
  const [followUpToast, setFollowUpToast] = useState(null);

  // Auto dismiss success toast after 8s
  useEffect(() => {
    if (followUpToast && !followUpToast.isError) {
      const timer = setTimeout(() => {
        setFollowUpToast(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [followUpToast]);

  const handleOpenFollowUp = (options = {}) => {
    const custId = options.customerId || customerNumber || "120023";
    const custName = options.customerName || customerName || "Customer Record";
    const grp = options.group || group || "BMW";
    const branchCode = options.branchCode || customer?.branchCode || "10";
    const rawAdvisorId = String(options.advisorId || "kunnath").trim();
    const rawAdvisorName = String(options.advisorName || "").trim();

    // Show name and code both when advisor name is available
    let displayAdvisor = rawAdvisorId;
    if (rawAdvisorName && rawAdvisorId) {
      if (rawAdvisorName.toLowerCase().includes(rawAdvisorId.toLowerCase())) {
        displayAdvisor = rawAdvisorName;
      } else if (rawAdvisorName === "Assigned Service Advisor" || rawAdvisorName === "Service Advisor") {
        displayAdvisor = rawAdvisorId ? `Advisor #${rawAdvisorId}` : rawAdvisorName;
      } else {
        displayAdvisor = `${rawAdvisorName} (${rawAdvisorId})`;
      }
    } else if (rawAdvisorName) {
      displayAdvisor = rawAdvisorName;
    } else if (rawAdvisorId) {
      displayAdvisor = rawAdvisorId;
    }

    const defaultNotes = options.notes || `Please follow up on this customer with Service Advisor ${displayAdvisor}`;

    setFollowUpCustomerId(custId);
    setFollowUpCustomerName(custName);
    setFollowUpGroup(grp);
    setFollowUpBranchCode(branchCode);
    setFollowUpAdvisorId(rawAdvisorId);
    setFollowUpAdvisorName(rawAdvisorName);
    setFollowUpAdvisorDisplay(displayAdvisor);
    setFollowUpNotes(defaultNotes);
    setShowFollowUpModal(true);
  };

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFollowUp(true);
    setFollowUpToast(null);

    // Extract advisor ID/code from display string if present
    let resolvedAdvisorId = String(followUpAdvisorDisplay || followUpAdvisorId || "kunnath").trim();
    const parensMatch = resolvedAdvisorId.match(/\(([^)]+)\)/);
    if (parensMatch && parensMatch[1]) {
      resolvedAdvisorId = parensMatch[1].trim();
    } else if (resolvedAdvisorId.startsWith("Advisor #")) {
      resolvedAdvisorId = resolvedAdvisorId.replace("Advisor #", "").trim();
    }

    const payload = {
      group: followUpGroup || group || "BMW",
      customerId: String(followUpCustomerId || customerNumber || "").trim(),
      customerName: String(followUpCustomerName || customerName || "").trim(),
      followupId: resolvedAdvisorId || "kunnath",
      dueDate: followUpDueDate || new Date().toISOString().split('T')[0],
      dueTime: followUpDueTime || "11:00",
      branchCode: followUpBranchCode || "10",
      notes: String(followUpNotes || "").trim() || "please do a follow up on this customer"
    };

    try {
      const res = await createSalesFollowUpCase(payload);
      if (res && (res.ok || res.taskId)) {
        setFollowUpToast({
          isError: false,
          message: `Sales follow-up scheduled successfully via Keyloop RPA!`,
          taskId: res.taskId || res.result?.taskId,
          status: res.status || "QUEUED",
          details: payload
        });
        setShowFollowUpModal(false);
      } else {
        setFollowUpToast({
          isError: true,
          message: res?.errorMessage || "Failed to schedule sales follow-up."
        });
      }
    } catch (err) {
      console.error("Create follow up error:", err);
      setFollowUpToast({
        isError: true,
        message: err.message || "Failed to submit sales follow-up task."
      });
    } finally {
      setSubmittingFollowUp(false);
    }
  };

  const formatDisplayVal = (val, fallback = 'N/A') => {
    if (val === null || val === undefined || val === '') return fallback;
    if (typeof val === 'object') {
      if (val.name) return val.name;
      if (val.description) return val.description;
      return fallback;
    }
    const str = String(val).trim();
    if (str === '{}' || str === '[]' || str === '') return fallback;
    return str;
  };

  // Fetch after-sales data strictly for this customer number & mobile
  const fetchCustomerAfterSalesData = async () => {
    if (!customerNumber && !cleanMobile) {
      setVehiclesList([]);
      setBookingsList([]);
      setServiceDueList([]);
      setNoServiceList([]);
      setReactivatedList([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // 1. Fetch customer's vehicles: /api/v1/vehicles?group={group}&customerNumber={customerNumber}
      if (customerNumber) {
        const vehRes = await apiFetch(`/api/v1/vehicles?group=${group}&customerNumber=${customerNumber}`);
        let vList = [];
        if (vehRes && vehRes.ok && Array.isArray(vehRes.data)) {
          vList = vehRes.data;
        } else if (contextVehicles && contextVehicles.length > 0) {
          vList = contextVehicles;
        }
        setVehiclesList(vList);

        // 2. Fetch customer's service bookings: /api/v1/customers/{group}/{customerNumber}/service-bookings
        const bookRes = await apiFetch(`/api/v1/customers/${group}/${customerNumber}/service-bookings`);
        let bList = [];
        if (bookRes && bookRes.ok) {
          if (Array.isArray(bookRes.data)) {
            bList = bookRes.data;
          } else if (bookRes.data && Array.isArray(bookRes.data.members)) {
            bList = bookRes.data.members;
          }
        }
        setBookingsList(bList);
      }

      // 3. Customer-specific After-sales Segments (filtered by cleanMobile)
      const mobileQuery = cleanMobile ? `&mobile=${cleanMobile}` : '';

      // a. Service Due within 30 days
      const dueRes = await apiFetch(`/api/v1/segments/service-due?group=${group}&withinDays=30${mobileQuery}`);
      if (dueRes && dueRes.ok && Array.isArray(dueRes.data?.members)) {
        let members = dueRes.data.members;
        if (!cleanMobile && customerNumber) {
          members = members.filter(m => String(m.customerNumber || '') === String(customerNumber));
        }
        setServiceDueList(members);
      } else {
        setServiceDueList([]);
      }

      // b. No Service in 18+ Months
      const noServRes = await apiFetch(`/api/v1/segments/no-service?group=${group}&months=18${mobileQuery}`);
      if (noServRes && noServRes.ok && Array.isArray(noServRes.data?.members)) {
        let members = noServRes.data.members;
        if (!cleanMobile && customerNumber) {
          members = members.filter(m => String(m.customerNumber || '') === String(customerNumber));
        }
        setNoServiceList(members);
      } else {
        setNoServiceList([]);
      }

      // c. Reactivated Customers
      const reactRes = await apiFetch(`/api/v1/segments/reactivated?group=${group}&months=18${mobileQuery}`);
      if (reactRes && reactRes.ok && Array.isArray(reactRes.data?.members)) {
        let members = reactRes.data.members;
        if (!cleanMobile && customerNumber) {
          members = members.filter(m => String(m.customerNumber || '') === String(customerNumber));
        }
        setReactivatedList(members);
      } else {
        setReactivatedList([]);
      }

    } catch (err) {
      console.warn("Failed to fetch customer after-sales data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerAfterSalesData();
  }, [group, customerNumber, cleanMobile]);

  const handleTriggerWipAction = async (actionType, targetWip) => {
    const wipNo = targetWip || selectedWipNo || searchWipInput;
    if (!wipNo) return;

    setSelectedWipNo(wipNo);
    setActionLoading(true);
    setActionOutput(null);

    try {
      let endpoint = `/api/v1/service-bookings/${group}/${wipNo}`;
      if (actionType === 'confirm') endpoint += `/confirmation`;
      else if (actionType === 'reminder') endpoint += `/reminder`;

      const res = await apiFetch(endpoint);
      if (res && res.ok) {
        setActionOutput({ action: actionType, wipNo, data: res.data || res, ok: true });
      } else {
        setActionOutput({ 
          action: actionType, 
          wipNo, 
          error: res?.statusText || "No booking record found for this WIP number in Keyloop", 
          ok: false 
        });
      }
    } catch (err) {
      setActionOutput({ action: actionType, wipNo, error: err.message || "Failed to execute action", ok: false });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLookupWipSubmit = (e) => {
    e.preventDefault();
    if (searchWipInput.trim()) {
      handleTriggerWipAction('read', searchWipInput.trim());
    }
  };

  const totalAlertsCount = serviceDueList.length + noServiceList.length + reactivatedList.length;

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4 text-xs">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
            <FaWrench className="text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 leading-tight">After-Sales & Service Tracking</h2>
              <span className="bg-teal-50 text-teal-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-teal-200">
                {group}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium">
              Customer: <span className="font-bold text-gray-800">{customerName}</span> 
              {customerNumber ? ` (#${customerNumber})` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* WIP / Booking Lookup Search Bar */}
          <form onSubmit={handleLookupWipSubmit} className="flex items-center gap-1.5">
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-[10px]" />
              <input
                type="text"
                value={searchWipInput}
                onChange={(e) => setSearchWipInput(e.target.value)}
                placeholder="WIP / Booking #..."
                className="pl-7 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs w-40 focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!searchWipInput.trim() || actionLoading}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1 transition-colors"
            >
              {actionLoading ? <FaSpinner className="animate-spin text-xs" /> : 'Lookup'}
            </button>
          </form>

          <button 
            onClick={fetchCustomerAfterSalesData}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer flex items-center gap-1.5 font-medium text-xs transition-colors"
            title="Refresh Data"
          >
            <FaRedo className={`text-xs ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Primary Create Sales Follow-Up Action Button */}
          <button
            type="button"
            onClick={() => handleOpenFollowUp()}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Create Sales / Advisor Follow-Up in Keyloop"
          >
            <FaCalendarPlus className="text-xs" />
            <span>Create Follow-Up</span>
          </button>
        </div>
      </div>

      {/* SALES FOLLOW-UP STATUS INDICATOR */}
      {followUpToast && !followUpToast.isError && followUpToast.status === 'Processing' && (
        <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <FaSpinner className="animate-spin text-amber-600 text-xs shrink-0" />
            <span>Processing follow-up request...</span>
          </div>
          <button 
            type="button" 
            onClick={() => setFollowUpToast(null)}
            className="text-amber-500 hover:text-amber-800 font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
      {followUpToast && followUpToast.isError && (
        <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-xs font-semibold flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-rose-600 text-xs shrink-0" />
            <span>{followUpToast.message}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setFollowUpToast(null)}
            className="text-rose-400 hover:text-rose-700 font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2 flex-wrap">
        <button
          onClick={() => setActiveTab('CustomerVehicles')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === 'CustomerVehicles' 
              ? 'bg-teal-600 text-white shadow-2xs' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaCar className="text-xs" />
          <span>Customer Vehicles & Contracts</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
            activeTab === 'CustomerVehicles' ? 'bg-white/30 text-white' : 'bg-teal-100 text-teal-800'
          }`}>
            {vehiclesList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ServiceBookings')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === 'ServiceBookings' 
              ? 'bg-teal-600 text-white shadow-2xs' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaWrench className="text-xs" />
          <span>Open Service Bookings & WIPs</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
            activeTab === 'ServiceBookings' ? 'bg-white/30 text-white' : 'bg-teal-100 text-teal-800'
          }`}>
            {bookingsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('RetentionAlerts')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === 'RetentionAlerts' 
              ? 'bg-teal-600 text-white shadow-2xs' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaBell className="text-xs" />
          <span>Retention & Cohort Alerts</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
            totalAlertsCount > 0 
              ? (activeTab === 'RetentionAlerts' ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-900 border border-amber-300') 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {totalAlertsCount}
          </span>
        </button>
      </div>

      {/* Action API Output Result Card (shown when a WIP is inspected or looked up) */}
      {actionOutput && (
        <div className={`p-4 rounded-xl text-xs space-y-2 animate-fade-in ${
          actionOutput.ok 
            ? 'bg-teal-50/80 border border-teal-200 text-teal-900' 
            : 'bg-rose-50/80 border border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-teal-200/60">
            <h4 className="font-extrabold text-sm flex items-center gap-2">
              <FaCheckCircle className={actionOutput.ok ? 'text-teal-600' : 'text-rose-600'} />
              <span>WIP #{actionOutput.wipNo} Service Job Details</span>
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenFollowUp({
                  notes: `Follow up on WIP #${actionOutput.wipNo} (${actionOutput.data?.vehicle || customerName})`
                })}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[10px] cursor-pointer flex items-center gap-1"
              >
                <FaCalendarPlus className="text-[9px]" />
                <span>Follow-Up on WIP</span>
              </button>
              <button 
                onClick={() => setActionOutput(null)} 
                className="text-gray-400 hover:text-gray-700 text-sm font-bold cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {actionOutput.ok && typeof actionOutput.data === 'object' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-[11px]">
              <div>
                <span className="text-gray-500 block text-[10px]">Job Number / Status</span>
                <span className="font-mono font-bold text-gray-900">{actionOutput.data.jobNumber || actionOutput.data.status || 'Active'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Service Code / Brand</span>
                <span className="font-bold text-gray-900">{actionOutput.data.serviceCode || actionOutput.data.brand || group}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Due Out Date</span>
                <span className="font-mono font-semibold text-gray-800">{actionOutput.data.dueOutDate || actionOutput.data.date || 'Scheduled'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Customer / Vehicle</span>
                <span className="font-semibold text-gray-800">{actionOutput.data.vehicle || customerName}</span>
              </div>
            </div>
          )}

          {!actionOutput.ok && (
            <p className="text-rose-700 font-medium text-[11px]">{actionOutput.error}</p>
          )}
        </div>
      )}

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-gray-400 gap-2">
          <FaSpinner className="animate-spin text-2xl text-teal-600" />
          <span className="text-xs font-medium">Fetching customer after-sales data...</span>
        </div>
      ) : activeTab === 'CustomerVehicles' ? (
        /* TAB 1: CUSTOMER VEHICLES & CONTRACTS */
        vehiclesList.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-2">
            <FaCar className="mx-auto text-xl text-gray-300 mb-1" />
            <p className="font-bold text-gray-700 text-xs">No registered vehicles found for customer #{customerNumber}.</p>
            <p className="text-[11px] text-gray-400">There are no vehicles linked to this customer account in Keyloop.</p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleOpenFollowUp()}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <FaCalendarPlus className="text-xs" />
                <span>Schedule Customer Follow-Up</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-x-auto overflow-y-auto max-h-[460px] shadow-2xs relative bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-gray-700 font-extrabold uppercase text-[9px] sticky top-0 z-10 shadow-2xs">
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-3 bg-slate-100">Vehicle / Model</th>
                  <th className="py-3 px-3 bg-slate-100">VIN / Chassis</th>
                  <th className="py-3 px-3 bg-slate-100">Reg #</th>
                  <th className="py-3 px-3 bg-slate-100">Mileage</th>
                  <th className="py-3 px-3 bg-slate-100">Warranty Status</th>
                  <th className="py-3 px-3 bg-slate-100">Packages</th>
                  <th className="py-3 px-3 bg-slate-100">Insurance</th>
                  <th className="py-3 px-3 bg-slate-100 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
                {vehiclesList.map((v, idx) => {
                  const vin = v.vin || v.chassisNumber || `VIN-${idx+1}`;
                  const modelName = v.model || v.description || v.variant || `${v.brand || ''} Vehicle`.trim();
                  const mileage = v.mileageKm || v.odometerKm;
                  const regNo = v.registrationNumber || v.plateNumber || 'N/A';
                  const warranty = v.warranty;
                  const ins = v.insurance && v.insurance.length > 0 ? v.insurance[0] : null;

                  return (
                    <tr key={idx} className="hover:bg-teal-50/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-gray-900 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <FaCar className="text-gray-400 text-xs" />
                          <span>{modelName}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-teal-700 whitespace-nowrap">{vin}</td>
                      <td className="py-3 px-3 font-mono text-gray-600 whitespace-nowrap">{regNo}</td>
                      <td className="py-3 px-3 font-mono text-gray-800 whitespace-nowrap">
                        {mileage ? `${Number(mileage).toLocaleString()} KM` : 'N/A'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {warranty && warranty.status ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            warranty.status === 'ACTIVE' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {warranty.status} ({warranty.provider || 'OEM'})
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">No warranty</span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {v.packages && v.packages.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setSelectedVehicleForPackages(v)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 cursor-pointer shadow-2xs transition"
                            title="View installed vehicle packages"
                          >
                            <FaBoxes className="text-[9px]" />
                            <span>{v.packages.length} Packages</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-[10px] italic">None</span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-[10px]">
                        {ins ? (
                          <div className="flex flex-col">
                            <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-extrabold text-[9px] uppercase inline-block">
                              {ins.status || 'Active'} ({ins.provider})
                            </span>
                            <span className="text-gray-500 mt-0.5">
                              Exp: {ins.expiryDate || 'N/A'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No insurance</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenFollowUp({
                            notes: `Vehicle follow-up for ${modelName} (VIN: ${vin}, Reg: ${regNo})`
                          })}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[10px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1"
                        >
                          <FaCalendarPlus className="text-[9px]" />
                          <span>Follow-Up</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : activeTab === 'ServiceBookings' ? (
        /* TAB 2: SERVICE BOOKINGS & OPEN WIPS */
        bookingsList.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-2">
            <FaWrench className="mx-auto text-xl text-gray-300 mb-1" />
            <p className="font-bold text-gray-700 text-xs">No open service bookings found for customer #{customerNumber}.</p>
            <p className="text-[11px] text-gray-400">There are currently no active workshop WIPs or scheduled service appointments for this customer in Keyloop.</p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleOpenFollowUp()}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <FaCalendarPlus className="text-xs" />
                <span>Schedule Customer Follow-Up</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-x-auto overflow-y-auto max-h-[460px] shadow-2xs relative bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-gray-700 font-extrabold uppercase text-[9px] sticky top-0 z-10 shadow-2xs">
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-3 bg-slate-100">Cust #</th>
                  <th className="py-3 px-3 bg-slate-100">WIP / Booking #</th>
                  <th className="py-3 px-3 bg-slate-100">Vehicle</th>
                  <th className="py-3 px-3 bg-slate-100">Scheduled Date</th>
                  <th className="py-3 px-3 bg-slate-100">Status</th>
                  <th className="py-3 px-3 bg-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
                {bookingsList.map((b, idx) => {
                  const wipNo = b.wipNumber || b.bookingNumber || b.id || `WIP-${idx+1}`;
                  const veh = b.vehicle || b.vin || 'Customer Vehicle';
                  const date = b.scheduledDate || b.bookingDate || b.date || 'N/A';
                  const status = b.status || b.bookingStatus || 'Open';
                  const advId = b.advisorId || b.advisor?.code || b.advisorCode || (typeof b.advisor === 'string' && /^\d+$/.test(b.advisor.trim()) ? b.advisor : '');
                  const advName = b.advisorName || b.advisor?.name || b.serviceAdvisorName || (typeof b.advisor === 'string' && isNaN(b.advisor) ? b.advisor : '');

                  return (
                    <tr key={idx} className="hover:bg-teal-50/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-teal-700">#{customerNumber}</td>
                      <td className="py-3 px-3 font-mono font-bold text-gray-900">#{wipNo}</td>
                      <td className="py-3 px-3 font-medium text-gray-800">{veh}</td>
                      <td className="py-3 px-3 font-mono text-gray-600">{date}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300 uppercase">
                          {status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleTriggerWipAction('read', wipNo)}
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Inspect #{wipNo}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenFollowUp({
                              advisorId: advId,
                              advisorName: advName,
                              notes: `Follow up on WIP #${wipNo} (${veh}, Scheduled: ${date})`
                            })}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[10px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1"
                          >
                            <FaCalendarPlus className="text-[9px]" />
                            <span>Follow-Up</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* TAB 3: RETENTION & SERVICE COHORT ALERTS */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Service Due Alert Card */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              serviceDueList.length > 0 
                ? 'bg-amber-50/80 border-amber-300 text-amber-900' 
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-xs flex items-center gap-1.5">
                  <FaBell className={serviceDueList.length > 0 ? 'text-amber-600' : 'text-gray-400'} />
                  Service Due within 30 Days
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                  serviceDueList.length > 0 ? 'bg-amber-200 text-amber-950' : 'bg-gray-200 text-gray-600'
                }`}>
                  {serviceDueList.length > 0 ? `${serviceDueList.length} Due` : 'Clear'}
                </span>
              </div>
              <p className="text-[11px] text-gray-600 mb-2">
                {serviceDueList.length > 0
                  ? `Next service due date: ${serviceDueList[0].nextServiceDate || 'Upcoming'} (${serviceDueList[0].vehicle || 'Vehicle'})`
                  : 'Customer has no vehicles scheduled or due for routine maintenance in the next 30 days.'}
              </p>
              {serviceDueList.length > 0 && (
                <div className="pt-1 border-t border-amber-200/60">
                  <button
                    type="button"
                    onClick={() => handleOpenFollowUp({
                      customerId: serviceDueList[0].customerNumber,
                      customerName: serviceDueList[0].customerName,
                      notes: `Upcoming service window follow-up: ${serviceDueList[0].vehicle || 'Vehicle'} due on ${serviceDueList[0].nextServiceDate || 'soon'}`
                    })}
                    className="w-full py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
                  >
                    <FaCalendarPlus className="text-[9px]" />
                    <span>Schedule Service Follow-Up</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. No Service 18+ Months Card */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              noServiceList.length > 0 
                ? 'bg-rose-50/80 border-rose-300 text-rose-900' 
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-xs flex items-center gap-1.5">
                  <FaExclamationTriangle className={noServiceList.length > 0 ? 'text-rose-600' : 'text-gray-400'} />
                  No Service (18+ Months)
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                  noServiceList.length > 0 ? 'bg-rose-200 text-rose-950' : 'bg-gray-200 text-gray-600'
                }`}>
                  {noServiceList.length > 0 ? `${noServiceList.length} Inactive` : 'Active'}
                </span>
              </div>
              <p className="text-[11px] text-gray-600 mb-2">
                {noServiceList.length > 0
                  ? `Vehicle ${noServiceList[0].vehicle || ''} has not visited the service workshop in > 18 months.`
                  : 'Customer is actively servicing their vehicles with AGMC.'}
              </p>
              {noServiceList.length > 0 && (
                <div className="pt-1 border-t border-rose-200/60">
                  <button
                    type="button"
                    onClick={() => handleOpenFollowUp({
                      customerId: noServiceList[0].customerNumber,
                      customerName: noServiceList[0].customerName,
                      notes: `Retention outreach: ${noServiceList[0].vehicle || 'Vehicle'} (VIN: ${noServiceList[0].vin || ''}) inactive > 18 months`
                    })}
                    className="w-full py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
                  >
                    <FaCalendarPlus className="text-[9px]" />
                    <span>Schedule Retention Follow-Up</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Reactivated Customer Card */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              reactivatedList.length > 0 
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900' 
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-xs flex items-center gap-1.5">
                  <FaUserCheck className={reactivatedList.length > 0 ? 'text-emerald-600' : 'text-gray-400'} />
                  Reactivated Customer
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                  reactivatedList.length > 0 ? 'bg-emerald-200 text-emerald-950' : 'bg-gray-200 text-gray-600'
                }`}>
                  {reactivatedList.length > 0 ? 'Reactivated' : 'Regular'}
                </span>
              </div>
              <p className="text-[11px] text-gray-600 mb-2">
                {reactivatedList.length > 0
                  ? `Customer returned for service on ${reactivatedList[0].bookingDate || 'recent date'}.`
                  : 'Customer maintains regular service cadence with AGMC.'}
              </p>
              {reactivatedList.length > 0 && (
                <div className="pt-1 border-t border-emerald-200/60">
                  <button
                    type="button"
                    onClick={() => handleOpenFollowUp({
                      customerId: reactivatedList[0].customerNumber,
                      customerName: reactivatedList[0].customerName,
                      notes: `Reactivated customer welcome follow-up: Returned on ${reactivatedList[0].bookingDate || 'recently'}`
                    })}
                    className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
                  >
                    <FaCalendarPlus className="text-[9px]" />
                    <span>Schedule Welcome Follow-Up</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Details Table if Alerts exist */}
          {totalAlertsCount > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div className="p-3 bg-slate-100 font-extrabold text-xs text-gray-800 border-b border-gray-200">
                Detailed Service Cohort Records for {customerName}
              </div>
              <div className="p-3 space-y-2 text-[11px]">
                {noServiceList.map((item, idx) => (
                  <div key={`no-serv-${idx}`} className="p-2.5 bg-rose-50/70 border border-rose-200 rounded-lg flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-rose-900 block text-xs">Retention Risk: No Service in 18+ Months</span>
                      <span className="text-gray-600">Vehicle: {item.vehicle} | VIN: {item.vin} | Mileage: {item.mileageKm ? `${item.mileageKm.toLocaleString()} KM` : 'N/A'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenFollowUp({
                        customerId: item.customerNumber,
                        customerName: item.customerName,
                        notes: `Retention outreach: ${item.vehicle || 'Vehicle'} (VIN: ${item.vin || ''}) has no service for > 18 months`
                      })}
                      className="text-[10px] bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded font-bold cursor-pointer transition-colors shrink-0 flex items-center gap-1"
                    >
                      <FaCalendarPlus className="text-[9px]" />
                      <span>Schedule Follow-Up</span>
                    </button>
                  </div>
                ))}
                {serviceDueList.map((item, idx) => (
                  <div key={`serv-due-${idx}`} className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-amber-900 block text-xs">Upcoming Service Window</span>
                      <span className="text-gray-600">Vehicle: {item.vehicle} | Next Service: {item.nextServiceDate} | Registration: {item.registrationNumber}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenFollowUp({
                        customerId: item.customerNumber,
                        customerName: item.customerName,
                        notes: `Upcoming service window outreach: ${item.vehicle || 'Vehicle'} due on ${item.nextServiceDate || 'soon'}`
                      })}
                      className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded font-bold cursor-pointer transition-colors shrink-0 flex items-center gap-1"
                    >
                      <FaCalendarPlus className="text-[9px]" />
                      <span>Schedule Follow-Up</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SALES FOLLOW-UP RPA MODAL (POST /api/intake/cases -> CREATE_SALES_FOLLOW_UP) */}
      {showFollowUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-3.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white">
                  <FaCalendarPlus className="text-sm" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">Create Sales & Advisor Follow-Up</h3>
                  <p className="text-[10px] text-blue-100 font-mono">
                    Keyloop RPA Task: <span className="font-bold">CREATE_SALES_FOLLOW_UP</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFollowUpModal(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFollowUpSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Customer ID */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <span>Customer ID</span>
                  </label>
                  <input
                    type="text"
                    value={followUpCustomerId}
                    readOnly
                    className="w-full h-8 px-2.5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-700 cursor-not-allowed select-none focus:outline-none"
                  />
                </div>

                {/* Customer Name */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <span>Customer Name</span>
                  </label>
                  <input
                    type="text"
                    value={followUpCustomerName}
                    readOnly
                    className="w-full h-8 px-2.5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 cursor-not-allowed select-none focus:outline-none truncate"
                  />
                </div>

                {/* Service Advisor Name */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <FaUserTie className="text-blue-500 text-[10px]" />
                    <span>Service Advisor Name</span>
                  </label>
                  <input
                    type="text"
                    value={followUpAdvisorName || 'Assigned Service Advisor'}
                    readOnly
                    className="w-full h-8 px-2.5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 cursor-not-allowed select-none focus:outline-none truncate"
                  />
                </div>
              </div>

              {/* Row 2: Service Advisor ID (Non-editable), Due Date, Due Time (Editable) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Service Advisor ID */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <FaUserTie className="text-blue-500 text-[10px]" />
                    <span>Service Advisor ID</span>
                  </label>
                  <input
                    type="text"
                    value={followUpAdvisorId}
                    readOnly
                    className="w-full h-8 px-2.5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-700 cursor-not-allowed select-none focus:outline-none"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <FaCalendarAlt className="text-blue-500 text-[10px]" />
                    <span>Due Date</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="date"
                    value={followUpDueDate}
                    onChange={(e) => setFollowUpDueDate(e.target.value)}
                    required
                    className="w-full h-8 px-2.5 bg-white border border-gray-300 rounded-lg text-xs font-mono font-semibold text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Due Time */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <FaClock className="text-blue-500 text-[10px]" />
                    <span>Due Time</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="time"
                    value={followUpDueTime}
                    onChange={(e) => setFollowUpDueTime(e.target.value)}
                    required
                    className="w-full h-8 px-2.5 bg-white border border-gray-300 rounded-lg text-xs font-mono font-semibold text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                    <span>Follow-Up Instructions / Notes</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <span className="text-[10px] text-gray-400">Quick templates:</span>
                </div>

                {/* Quick Note Template Chips */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    "please do a follow up on this customer",
                    "Customer requested status update on vehicle",
                    "Retention Follow-Up: Service maintenance due",
                    "Inquiry regarding service invoice / estimate"
                  ].map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFollowUpNotes(tpl)}
                      className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-medium border border-blue-200 cursor-pointer transition-colors text-left"
                    >
                      {tpl}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="Enter specific follow-up instructions for the advisor..."
                  required
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>

              {/* Actions Footer */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowFollowUpModal(false)}
                  disabled={submittingFollowUp}
                  className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFollowUp}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  {submittingFollowUp ? (
                    <>
                      <FaSpinner className="animate-spin text-xs" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="text-xs" />
                      <span>Schedule Follow-Up (Keyloop RPA)</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Vehicle Packages Modal */}
      <VehiclePackagesModal
        isOpen={Boolean(selectedVehicleForPackages)}
        onClose={() => setSelectedVehicleForPackages(null)}
        vehicle={selectedVehicleForPackages}
      />

    </div>
  );
}
