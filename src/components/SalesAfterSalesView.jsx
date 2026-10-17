import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaWrench, 
  FaCalendarAlt, 
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
  FaHistory
} from 'react-icons/fa';

export default function SalesAfterSalesView() {
  const { customer, vehicles: contextVehicles = [], currentMobile: contextMobile, group: contextGroup } = useCustomer();
  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || '');
  const customerNumber = customer?.customerNumber || customer?.id || "";
  const customerName = customer?.fullName || `${customer?.firstName || ''} ${customer?.surname || ''}`.trim() || "Customer Record";

  const rawMobile = customer?.mobileRaw || customer?.mobile || contextMobile || 
    (new URLSearchParams(window.location.search).get('Complaint') || 
     new URLSearchParams(window.location.search).get('Sales') || 
     new URLSearchParams(window.location.search).get('mobile') || '');
  const cleanMobile = rawMobile ? String(rawMobile).replace(/[^0-9]/g, '') : '';

  // Tabs: 'CustomerVehicles' | 'ServiceBookings' | 'RetentionAlerts'
  const [activeTab, setActiveTab] = useState('CustomerVehicles');
  const [vehiclesList, setVehiclesList] = useState([]);
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
        setServiceDueList(dueRes.data.members);
      } else {
        setServiceDueList([]);
      }

      // b. No Service in 18+ Months
      const noServRes = await apiFetch(`/api/v1/segments/no-service?group=${group}&months=18${mobileQuery}`);
      if (noServRes && noServRes.ok && Array.isArray(noServRes.data?.members)) {
        setNoServiceList(noServRes.data.members);
      } else {
        setNoServiceList([]);
      }

      // c. Reactivated Customers
      const reactRes = await apiFetch(`/api/v1/segments/reactivated?group=${group}&months=18${mobileQuery}`);
      if (reactRes && reactRes.ok && Array.isArray(reactRes.data?.members)) {
        setReactivatedList(reactRes.data.members);
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
              {cleanMobile ? ` | ${cleanMobile}` : ''}
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
        </div>
      </div>

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
              <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200 font-bold">
                {actionOutput.ok ? 'Found' : 'Not Found'}
              </span>
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
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-1">
            <FaCar className="mx-auto text-xl text-gray-300 mb-1" />
            <p className="font-bold text-gray-700 text-xs">No registered vehicles found for customer #{customerNumber}.</p>
            <p className="text-[11px] text-gray-400">There are no vehicles linked to this customer account in Keyloop.</p>
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
                  <th className="py-3 px-3 bg-slate-100 text-right">Insurance</th>
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
                      <td className="py-3 px-3 text-right whitespace-nowrap text-[10px]">
                        {ins ? (
                          <div className="flex flex-col items-end">
                            <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-extrabold text-[9px] uppercase">
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
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-1">
            <FaWrench className="mx-auto text-xl text-gray-300 mb-1" />
            <p className="font-bold text-gray-700 text-xs">No open service bookings found for customer #{customerNumber}.</p>
            <p className="text-[11px] text-gray-400">There are currently no active workshop WIPs or scheduled service appointments for this customer in Keyloop.</p>
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
                        <button
                          onClick={() => handleTriggerWipAction('read', wipNo)}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          Inspect #{wipNo}
                        </button>
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
              <p className="text-[11px] text-gray-600">
                {serviceDueList.length > 0
                  ? `Next service due date: ${serviceDueList[0].nextServiceDate || 'Upcoming'} (${serviceDueList[0].vehicle || 'Vehicle'})`
                  : 'Customer has no vehicles scheduled or due for routine maintenance in the next 30 days.'}
              </p>
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
              <p className="text-[11px] text-gray-600">
                {noServiceList.length > 0
                  ? `Vehicle ${noServiceList[0].vehicle || ''} has not visited the service workshop in > 18 months.`
                  : 'Customer is actively servicing their vehicles with AGMC.'}
              </p>
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
              <p className="text-[11px] text-gray-600">
                {reactivatedList.length > 0
                  ? `Customer returned for service on ${reactivatedList[0].bookingDate || 'recent date'}.`
                  : 'Customer maintains regular service cadence with AGMC.'}
              </p>
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
                    <span className="text-[10px] bg-rose-200 text-rose-950 px-2 py-0.5 rounded font-bold">Follow-Up Recommended</span>
                  </div>
                ))}
                {serviceDueList.map((item, idx) => (
                  <div key={`serv-due-${idx}`} className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-amber-900 block text-xs">Upcoming Service Window</span>
                      <span className="text-gray-600">Vehicle: {item.vehicle} | Next Service: {item.nextServiceDate} | Registration: {item.registrationNumber}</span>
                    </div>
                    <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded font-bold">Due in &lt; 30 Days</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
