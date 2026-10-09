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
  FaCommentAlt,
  FaInfoCircle
} from 'react-icons/fa';

export default function SalesAfterSalesView() {
  const { customer } = useCustomer();
  const group = customer?.keyloopGroup || "BMW";
  const customerNumber = customer?.customerNumber || "";
  const currentMobile = customer?.mobileRaw || customer?.mobile || "";

  const [activeTab, setActiveTab] = useState('ServiceDue');
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);

  // WIP / Work Order Search state
  const [searchWipInput, setSearchWipInput] = useState("");
  const [selectedWipNo, setSelectedWipNo] = useState("");
  const [actionOutput, setActionOutput] = useState(null);
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

  const fetchAfterSalesData = async (tabType) => {
    setActiveTab(tabType);
    setLoading(true);
    setDataList([]);

    try {
      let endpoint = `/api/v1/segments/service-due?group=${group}&withinDays=30`;
      if (tabType === 'NoService') endpoint = `/api/v1/segments/no-service?group=${group}&months=18`;
      if (tabType === 'Reactivated') endpoint = `/api/v1/segments/reactivated?group=${group}&months=18`;
      if (tabType === 'CustomerBookings') {
        if (customerNumber) {
          endpoint = `/api/v1/customers/${group}/${customerNumber}/service-bookings`;
        } else {
          setDataList([]);
          setLoading(false);
          return;
        }
      }
      if (tabType === 'CustomerVehicles') {
        if (customerNumber) {
          endpoint = `/api/v1/vehicles?group=${group}&customerNumber=${customerNumber}`;
        } else {
          setDataList([]);
          setLoading(false);
          return;
        }
      }

      const res = await apiFetch(endpoint);
      if (res && res.ok && Array.isArray(res.data)) {
        setDataList(res.data);
      } else {
        setDataList([]);
      }
    } catch (err) {
      console.warn("Failed to fetch after-sales data:", err);
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAfterSalesData('ServiceDue');
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
        setActionOutput({ action: actionType, wipNo, error: res?.statusText || "No response data found for this WIP", ok: false });
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
              <h2 className="text-base font-bold text-gray-900 leading-tight">After-Sales Retention & Service Opportunity Tracking</h2>
              <span className="bg-teal-50 text-teal-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-teal-200">
                {group}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium">
              Customer: <span className="font-bold text-gray-800">{customer?.fullName || 'Walk-in Prospect'}</span> 
              {customerNumber ? ` (#${customerNumber})` : ''}
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
                className="pl-7 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs w-44 focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!searchWipInput.trim() || actionLoading}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1"
            >
              {actionLoading ? <FaSpinner className="animate-spin text-xs" /> : 'Lookup'}
            </button>
          </form>

          <button 
            onClick={() => fetchAfterSalesData(activeTab)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer flex items-center gap-1 font-medium text-xs"
            title="Refresh Data"
          >
            <FaRedo className={`text-xs ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs Selector - Covering Postman 4. After-sales endpoints */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-gray-100">
        <button
          onClick={() => fetchAfterSalesData('ServiceDue')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ServiceDue' ? 'bg-teal-600 text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaCalendarAlt /> Due for Service (30 Days)
        </button>

        <button
          onClick={() => fetchAfterSalesData('NoService')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'NoService' ? 'bg-teal-600 text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaExclamationCircle /> No Service (&gt;18 Months)
        </button>

        <button
          onClick={() => fetchAfterSalesData('Reactivated')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'Reactivated' ? 'bg-teal-600 text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaUserCheck /> Reactivated Customers
        </button>

        <button
          onClick={() => fetchAfterSalesData('CustomerBookings')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'CustomerBookings' ? 'bg-teal-600 text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaWrench /> Open Service Bookings
        </button>

        <button
          onClick={() => fetchAfterSalesData('CustomerVehicles')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'CustomerVehicles' ? 'bg-teal-600 text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaCar /> Customer Vehicles
        </button>
      </div>

      {/* Active WIP Action Operations Bar */}
      <div className="p-4 bg-gradient-to-r from-teal-50 via-emerald-50/40 to-slate-50 rounded-xl border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase text-teal-700 tracking-wider">Service Booking / WIP Operations</span>
          <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
            <span>Selected WIP:</span>
            <span className="font-mono text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200 shadow-2xs">
              {selectedWipNo || searchWipInput || "None Selected"}
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleTriggerWipAction('read')}
            disabled={!selectedWipNo && !searchWipInput}
            className="px-2.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1 disabled:opacity-50"
            title="Inspect Service Booking WIP"
          >
            <FaInfoCircle className="text-teal-500 text-xs" /> Inspect WIP
          </button>

          <button
            onClick={() => handleTriggerWipAction('confirm')}
            disabled={!selectedWipNo && !searchWipInput}
            className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1 disabled:opacity-50"
            title="Send Appointment Confirmation"
          >
            <FaPaperPlane className="text-white text-xs" /> Send Confirmation
          </button>

          <button
            onClick={() => handleTriggerWipAction('reminder')}
            disabled={!selectedWipNo && !searchWipInput}
            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1 disabled:opacity-50"
            title="Send Service Progress Update"
          >
            <FaBell className="text-amber-300 text-xs" /> Progress Update
          </button>
        </div>
      </div>

      {/* Action API Output Result Card */}
      {actionOutput && (
        <div className={`p-4 rounded-xl text-xs space-y-2 animate-fade-in ${
          actionOutput.ok 
            ? 'bg-teal-50/80 border border-teal-200 text-teal-900' 
            : 'bg-rose-50/80 border border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-teal-200/60">
            <h4 className="font-extrabold text-sm flex items-center gap-2">
              <FaCheckCircle className={actionOutput.ok ? 'text-teal-600' : 'text-rose-600'} />
              Action '{actionOutput.action}' executed for WIP #{actionOutput.wipNo}
            </h4>
            <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200 font-bold">
              {actionOutput.ok ? 'Completed' : 'Response'}
            </span>
          </div>

          {actionOutput.error ? (
            <p className="text-xs font-medium text-rose-700">{actionOutput.error}</p>
          ) : (
            <div className="flex flex-col gap-2">
              <details className="cursor-pointer text-[10px]">
                <summary className="font-bold text-gray-600 hover:text-gray-900">View Raw Response Data</summary>
                <pre className="mt-1 font-mono text-[10px] p-2.5 bg-gray-900 text-teal-400 rounded-lg overflow-x-auto max-h-48">
                  {JSON.stringify(actionOutput.data, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}

      {/* Data Table */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
          <FaSpinner className="animate-spin text-2xl text-teal-600" />
          <span className="text-xs font-medium">Loading after-sales retention records...</span>
        </div>
      ) : dataList.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-1">
          <FaInfoCircle className="mx-auto text-xl text-gray-300 mb-1" />
          <p className="font-bold text-gray-700 text-xs">No customer records returned for this filter.</p>
          <p className="text-[11px] text-gray-400">There are currently no active records matching the selected after-sales criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[9px] border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3">Cust #</th>
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Vehicle / VIN</th>
                <th className="py-2.5 px-3">Service Date / Milestone</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
              {dataList.map((row, idx) => {
                const custNo = row.customerNumber || row.prospectNumber || row.id || `CUST-${idx+1}`;
                const name = row.fullName || row.name || row.customerName || 'Customer Record';
                const vehicleStr = row.vehicle || row.description || row.vin || row.model || 'Vehicle Info';
                const dateStr = row.serviceDueDate || row.lastServiceDate || row.reactivatedDate || row.dueDate || row.date || 'N/A';
                const statusStr = row.status || row.bookingStatus || 'PROCESSED';
                const wipNo = row.wipNumber || row.bookingNumber || row.id || '';

                return (
                  <tr key={idx} className="hover:bg-teal-50/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-teal-700">{renderSafeVal(custNo)}</td>
                    <td className="py-3 px-3 font-bold text-gray-900">{renderSafeVal(name)}</td>
                    <td className="py-3 px-3 text-gray-800">{renderSafeVal(vehicleStr)}</td>
                    <td className="py-3 px-3 font-mono text-gray-600">{renderSafeVal(dateStr)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300 uppercase">
                        {renderSafeVal(statusStr)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {wipNo ? (
                        <button 
                          onClick={() => handleTriggerWipAction('read', wipNo)}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1"
                        >
                          Inspect #{wipNo}
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-semibold">Active Record</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
