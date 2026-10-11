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
  FaFileContract
} from 'react-icons/fa';

export default function SalesAfterSalesView() {
  const { customer, vehicles: contextVehicles = [] } = useCustomer();
  const group = customer?.keyloopGroup || "BMW";
  const customerNumber = customer?.customerNumber || "";
  const customerName = customer?.fullName || customer?.name || "Customer Record";
  const currentMobile = customer?.mobileRaw || customer?.mobile || "";

  // Tabs: only customer-specific data related to this customer number
  const [activeTab, setActiveTab] = useState('CustomerVehicles');
  const [vehiclesList, setVehiclesList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
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

  // Fetch after-sales data strictly for this customer number
  const fetchCustomerAfterSalesData = async () => {
    if (!customerNumber) {
      setVehiclesList([]);
      setBookingsList([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // 1. Fetch customer's vehicles: /api/v1/vehicles?group={group}&customerNumber={customerNumber}
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
    } catch (err) {
      console.warn("Failed to fetch customer after-sales data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerAfterSalesData();
  }, [group, customerNumber]);

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
              {currentMobile ? ` | ${currentMobile}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Tabs Selector: Strictly customer-specific endpoints */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
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

          {actionOutput.error ? (
            <p className="text-xs font-medium text-rose-700">{actionOutput.error}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-gray-500 block text-[10px]">Vehicle:</span>
                <strong>{actionOutput.data?.vehicle || actionOutput.data?.vin || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Workshop Branch:</span>
                <strong>{actionOutput.data?.branch?.name || actionOutput.data?.branch || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Service Advisor:</span>
                <strong>{actionOutput.data?.bookedBy || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Service Status:</span>
                <span className="inline-block bg-teal-100 text-teal-900 font-bold px-2 py-0.5 rounded text-[10px]">
                  {actionOutput.data?.status || 'Active'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Data Views */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
          <FaSpinner className="animate-spin text-2xl text-teal-600" />
          <span className="text-xs font-medium">Fetching after-sales details for customer #{customerNumber}...</span>
        </div>
      ) : activeTab === 'CustomerVehicles' ? (
        /* TAB 1: CUSTOMER VEHICLES & CONTRACTS */
        vehiclesList.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-1">
            <FaCar className="mx-auto text-xl text-gray-300 mb-1" />
            <p className="font-bold text-gray-700 text-xs">No vehicles found for customer #{customerNumber}.</p>
            <p className="text-[11px] text-gray-400">There are no vehicle records linked to this customer number in Keyloop.</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-x-auto overflow-y-auto max-h-[460px] shadow-2xs relative bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-gray-700 font-extrabold uppercase text-[9px] sticky top-0 z-10 shadow-2xs">
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-3 bg-slate-100">Cust #</th>
                  <th className="py-3 px-3 bg-slate-100">Customer Name</th>
                  <th className="py-3 px-3 bg-slate-100">Vehicle Description</th>
                  <th className="py-3 px-3 bg-slate-100">Plate & VIN</th>
                  <th className="py-3 px-3 bg-slate-100">Mileage & Delivery</th>
                  <th className="py-3 px-3 bg-slate-100">Warranty & Contracts</th>
                  <th className="py-3 px-3 bg-slate-100 text-right">Insurance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
                {vehiclesList.map((veh, idx) => {
                  const regNo = veh.registrationNumber || 'N/A';
                  const vin = veh.vin || 'N/A';
                  const description = veh.description || veh.model || 'BMW Vehicle';
                  const mileage = typeof veh.mileageKm === 'number' ? `${veh.mileageKm.toLocaleString()} KM` : formatDisplayVal(veh.mileageKm);
                  const deliveryDate = veh.deliveryDate || 'N/A';
                  
                  const warranty = veh.warranty;
                  const serviceContract = veh.serviceContract;
                  const ins = Array.isArray(veh.insurance) && veh.insurance.length > 0 ? veh.insurance[0] : null;

                  return (
                    <tr key={idx} className="hover:bg-teal-50/40 transition-colors">
                      {/* Cust # */}
                      <td className="py-3 px-3 font-mono font-bold text-teal-700 whitespace-nowrap">
                        #{customerNumber}
                      </td>

                      {/* Real Customer Name */}
                      <td className="py-3 px-3 font-bold text-gray-900 whitespace-nowrap">
                        {customerName}
                      </td>

                      {/* Vehicle Description */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-bold text-gray-900 flex items-center gap-1.5">
                          <FaCar className="text-teal-600 text-xs" />
                          {description}
                        </span>
                        {veh.colour && (
                          <span className="text-[10px] text-gray-500 block">
                            Colour: {veh.colour} ({veh.modelYear || ''})
                          </span>
                        )}
                      </td>

                      {/* Plate & VIN */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[10px]">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded font-bold text-gray-800 border border-gray-200">
                          {regNo}
                        </span>
                        <span className="text-gray-400 block mt-0.5" title={vin}>
                          VIN: {vin}
                        </span>
                      </td>

                      {/* Mileage & Delivery Date */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-bold text-gray-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                          {mileage}
                        </span>
                        <span className="text-[10px] text-gray-500 block mt-0.5">
                          Delivered: {deliveryDate}
                        </span>
                      </td>

                      {/* Warranty & Service Contract */}
                      <td className="py-3 px-3 whitespace-nowrap text-[10px]">
                        <div className="flex flex-col gap-1">
                          {warranty && (
                            <span className="flex items-center gap-1">
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold ${
                                warranty.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                              }`}>
                                Warranty: {warranty.status}
                              </span>
                              <span className="text-gray-500 truncate max-w-[120px]" title={warranty.provider}>
                                {warranty.expiryDate ? `Exp: ${warranty.expiryDate}` : ''}
                              </span>
                            </span>
                          )}
                          {serviceContract && (
                            <span className="flex items-center gap-1">
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold ${
                                serviceContract.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                Service Contract: {serviceContract.status}
                              </span>
                              <span className="text-gray-500 truncate max-w-[120px]">
                                {serviceContract.expiryDate ? `Exp: ${serviceContract.expiryDate}` : ''}
                              </span>
                            </span>
                          )}
                          {!warranty && !serviceContract && (
                            <span className="text-gray-400 italic">No contract on file</span>
                          )}
                        </div>
                      </td>

                      {/* Insurance */}
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
      ) : (
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
      )}

    </div>
  );
}
