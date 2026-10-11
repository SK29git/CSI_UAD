import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaShoppingBag, 
  FaTruck, 
  FaIndustry, 
  FaClipboardCheck, 
  FaCheckCircle, 
  FaSpinner, 
  FaRedo, 
  FaSearch,
  FaPaperPlane,
  FaInfoCircle,
  FaCar
} from 'react-icons/fa';

export default function SalesVehicleOrdersView() {
  const { customer } = useCustomer();
  const group = customer?.keyloopGroup || "";
  const customerNumber = customer?.customerNumber || "";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEnquiryInput, setSearchEnquiryInput] = useState("");
  const [selectedEnquiryNo, setSelectedEnquiryNo] = useState("");
  
  // Dynamic Milestone / Order API Details state
  const [orderDetails, setOrderDetails] = useState(null);
  const [productionDetails, setProductionDetails] = useState(null);
  const [shipmentDetails, setShipmentDetails] = useState(null);
  const [registrationDetails, setRegistrationDetails] = useState(null);
  const [milestonesDetails, setMilestonesDetails] = useState(null);
  const [vehicleReadyDetails, setVehicleReadyDetails] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const renderSafeVal = (val, fallback = 'N/A') => {
    if (val === null || val === undefined || val === '') return fallback;
    if (typeof val === 'object') {
      if (val.name) return val.name;
      if (val.description) return val.description;
      return JSON.stringify(val);
    }
    return String(val);
  };

  const fetchOrders = async () => {
    setLoading(true);
    setOrders([]);
    try {
      if (!customerNumber) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // API 1: GET /api/v1/orders?group={group}&customerNumber={customerNumber}
      const apiUrl = `/api/v1/orders?group=${group}&customerNumber=${customerNumber}`;
      const res = await apiFetch(apiUrl);
      if (res && res.ok && Array.isArray(res.data)) {
        setOrders(res.data);
        if (res.data.length > 0 && !selectedEnquiryNo) {
          const firstEnquiry = res.data[0].enquiryNumber || res.data[0].id || "";
          if (firstEnquiry) {
            fetchFullOrderMilestones(firstEnquiry);
          }
        }
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.warn("Failed to fetch vehicle orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [group, customerNumber]);

  const fetchFullOrderMilestones = async (enquiryNo) => {
    if (!enquiryNo) return;
    setSelectedEnquiryNo(enquiryNo);
    setActionLoading(true);
    setActionMessage(null);

    // Reset details before fetching
    setOrderDetails(null);
    setProductionDetails(null);
    setShipmentDetails(null);
    setRegistrationDetails(null);
    setMilestonesDetails(null);
    setVehicleReadyDetails(null);

    try {
      // Execute all sub-APIs for vehicle order in parallel
      const [orderRes, prodRes, shipRes, regRes, milesRes, readyRes] = await Promise.allSettled([
        apiFetch(`/api/v1/orders/${group}/${enquiryNo}`),
        apiFetch(`/api/v1/orders/${group}/${enquiryNo}/production`),
        apiFetch(`/api/v1/orders/${group}/${enquiryNo}/shipment`),
        apiFetch(`/api/v1/orders/${group}/${enquiryNo}/registration`),
        apiFetch(`/api/v1/orders/${group}/${enquiryNo}/milestones`),
        apiFetch(`/api/v1/orders/${group}/${enquiryNo}/vehicle-ready`)
      ]);

      if (orderRes.status === 'fulfilled' && orderRes.value?.ok && orderRes.value?.data) {
        setOrderDetails(orderRes.value.data);
      }
      if (prodRes.status === 'fulfilled' && prodRes.value?.ok && prodRes.value?.data) {
        setProductionDetails(prodRes.value.data);
      }
      if (shipRes.status === 'fulfilled' && shipRes.value?.ok && shipRes.value?.data) {
        setShipmentDetails(shipRes.value.data);
      }
      if (regRes.status === 'fulfilled' && regRes.value?.ok && regRes.value?.data) {
        setRegistrationDetails(regRes.value.data);
      }
      if (milesRes.status === 'fulfilled' && milesRes.value?.ok && milesRes.value?.data) {
        setMilestonesDetails(milesRes.value.data);
      }
      if (readyRes.status === 'fulfilled' && readyRes.value?.ok && readyRes.value?.data) {
        setVehicleReadyDetails(readyRes.value.data);
      }

    } catch (err) {
      console.warn("Failed to fetch order milestone details:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLookupEnquirySubmit = (e) => {
    e.preventDefault();
    if (searchEnquiryInput.trim()) {
      fetchFullOrderMilestones(searchEnquiryInput.trim());
    }
  };

  const triggerMilestoneUpdate = async () => {
    const enquiryNo = selectedEnquiryNo || searchEnquiryInput;
    if (!enquiryNo) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await apiFetch(`/api/v1/orders/${group}/${enquiryNo}/milestones`);
      if (res && res.ok && res.data) {
        setMilestonesDetails(res.data);
        setActionMessage({ ok: true, text: `Milestone notification dispatched for Enquiry #${enquiryNo}` });
      } else {
        setActionMessage({ ok: false, text: `Unable to dispatch milestone updates for Enquiry #${enquiryNo}` });
      }
    } catch (err) {
      setActionMessage({ ok: false, text: err.message || "Action failed" });
    } finally {
      setActionLoading(false);
    }
  };

  const checkVehicleReady = async () => {
    const enquiryNo = selectedEnquiryNo || searchEnquiryInput;
    if (!enquiryNo) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await apiFetch(`/api/v1/orders/${group}/${enquiryNo}/vehicle-ready`);
      if (res && res.ok && res.data) {
        setVehicleReadyDetails(res.data);
        setActionMessage({ ok: true, text: `Vehicle readiness check completed for Enquiry #${enquiryNo}` });
      } else {
        setActionMessage({ ok: false, text: `No readiness status found for Enquiry #${enquiryNo}` });
      }
    } catch (err) {
      setActionMessage({ ok: false, text: err.message || "Readiness check failed" });
    } finally {
      setActionLoading(false);
    }
  };

  const hasAnyMilestoneData = Boolean(
    orderDetails || productionDetails || shipmentDetails || registrationDetails || milestonesDetails || vehicleReadyDetails
  );

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4 text-xs">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <FaShoppingBag className="text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 leading-tight">Vehicle Order Tracking & Milestones</h2>
              <span className="bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-emerald-200">
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
          {/* Enquiry # Search Bar */}
          <form onSubmit={handleLookupEnquirySubmit} className="flex items-center gap-1.5">
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-[10px]" />
              <input
                type="text"
                value={searchEnquiryInput}
                onChange={(e) => setSearchEnquiryInput(e.target.value)}
                placeholder="Enquiry # (e.g. ENQ-77102)..."
                className="pl-7 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs w-48 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!searchEnquiryInput.trim() || actionLoading}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1"
            >
              {actionLoading ? <FaSpinner className="animate-spin text-xs" /> : 'Lookup'}
            </button>
          </form>

          <button 
            onClick={fetchOrders}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer flex items-center gap-1 font-medium text-xs"
            title="Refresh Orders"
          >
            <FaRedo className={`text-xs ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders Table Section */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
          <FaSpinner className="animate-spin text-2xl text-emerald-600" />
          <span className="text-xs font-medium">Loading vehicle orders from database...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-1">
          <FaInfoCircle className="mx-auto text-xl text-gray-300 mb-1" />
          <p className="font-bold text-gray-700 text-xs">No vehicle orders found for Customer #{customerNumber || 'N/A'}.</p>
          <p className="text-[11px] text-gray-400">
            You can use the Enquiry # search bar at the top right to lookup any existing order directly.
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-x-auto overflow-y-auto max-h-[460px] shadow-2xs relative bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-gray-700 font-extrabold uppercase text-[9px] sticky top-0 z-10 shadow-2xs">
              <tr className="border-b border-gray-200">
                <th className="py-3 px-3 bg-slate-100">Enquiry #</th>
                <th className="py-3 px-3 bg-slate-100">Order Date</th>
                <th className="py-3 px-3 bg-slate-100">Vehicle Model</th>
                <th className="py-3 px-3 bg-slate-100">Production Stage</th>
                <th className="py-3 px-3 bg-slate-100">Shipment Status</th>
                <th className="py-3 px-3 bg-slate-100">Status</th>
                <th className="py-3 px-3 text-right bg-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
              {orders.map((row, idx) => {
                const enquiryNo = row.enquiryNumber || row.id || `ENQ-${idx+1}`;
                const isSelected = selectedEnquiryNo === enquiryNo;
                return (
                  <tr key={idx} className={`hover:bg-emerald-50/40 transition-colors ${isSelected ? 'bg-emerald-50/60 font-semibold' : ''}`}>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">{renderSafeVal(enquiryNo)}</td>
                    <td className="py-3 px-3 font-mono text-gray-600">{renderSafeVal(row.orderDate || row.date)}</td>
                    <td className="py-3 px-3 font-bold text-gray-900">{renderSafeVal(row.model || row.vehicleDescription || row.vehicle)}</td>
                    <td className="py-3 px-3 text-gray-800">{renderSafeVal(row.productionStage || row.productionStatus)}</td>
                    <td className="py-3 px-3 text-gray-800">{renderSafeVal(row.shipmentStatus)}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        row.status === 'DELIVERED' || row.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}>
                        {renderSafeVal(row.status)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button 
                        onClick={() => fetchFullOrderMilestones(enquiryNo)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        Track Milestones
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected Order Milestone Actions Bar */}
      {selectedEnquiryNo && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-slate-50 rounded-xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Active Order Operations</span>
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <span>Selected Order:</span>
              <span className="font-mono text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
                {selectedEnquiryNo}
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={triggerMilestoneUpdate}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <FaPaperPlane className="text-xs" /> Send Milestone Update
            </button>

            <button
              onClick={checkVehicleReady}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <FaCheckCircle className="text-xs" /> Check Vehicle Ready
            </button>
          </div>
        </div>
      )}

      {/* Action Status Toast */}
      {actionMessage && (
        <div className={`p-3 rounded-lg text-xs font-bold ${
          actionMessage.ok ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
        }`}>
          {actionMessage.text}
        </div>
      )}

      {/* Dynamic Milestone Cards - Render ONLY if API returned response data */}
      {hasAnyMilestoneData && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-2">
              <FaShoppingBag className="text-emerald-600" /> Real-time Milestones for Order <span className="font-mono text-emerald-700">{selectedEnquiryNo}</span>
            </h4>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
              Live API Status
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            
            {/* Order Summary Details Card (from GET /api/v1/orders/{group}/{enquiryNumber}) */}
            {orderDetails && (
              <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 flex items-center gap-1.5 text-xs text-emerald-700">
                  <FaCar /> Order & Vehicle Details
                </span>
                <p className="text-[11px] text-gray-700">Model: <strong>{formatDisplay(orderDetails.model || orderDetails.vehicle)}</strong></p>
                <p className="text-[10px] text-gray-500">Order Date: <strong>{renderSafeVal(orderDetails.orderDate || orderDetails.date)}</strong></p>
                {orderDetails.salesExecutive && (
                  <p className="text-[10px] text-gray-500">Sales Executive: <strong>{renderSafeVal(orderDetails.salesExecutive)}</strong></p>
                )}
              </div>
            )}

            {/* Production Status Card (from GET /api/v1/orders/{group}/{enquiryNumber}/production) */}
            {productionDetails && (
              <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 flex items-center gap-1.5 text-xs text-blue-700">
                  <FaIndustry /> Production Status
                </span>
                <p className="text-[11px] text-gray-700">Stage: <strong>{renderSafeVal(productionDetails.stage || productionDetails.productionStatus)}</strong></p>
                <p className="text-[10px] text-gray-500">Status: <strong className="text-blue-700">{renderSafeVal(productionDetails.status)}</strong></p>
                {productionDetails.plannedDelivery && (
                  <p className="text-[10px] text-gray-500">Planned Delivery: <strong>{renderSafeVal(productionDetails.plannedDelivery)}</strong></p>
                )}
              </div>
            )}

            {/* Shipment Status Card (from GET /api/v1/orders/{group}/{enquiryNumber}/shipment) */}
            {shipmentDetails && (
              <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 flex items-center gap-1.5 text-xs text-indigo-700">
                  <FaTruck /> Shipment Status
                </span>
                <p className="text-[11px] text-gray-700">Location: <strong>{renderSafeVal(shipmentDetails.vessel || shipmentDetails.location || shipmentDetails.shipmentStatus)}</strong></p>
                <p className="text-[10px] text-gray-500">Status: <strong className="text-indigo-700">{renderSafeVal(shipmentDetails.status)}</strong></p>
                {shipmentDetails.eta && (
                  <p className="text-[10px] text-gray-500">ETA: <strong>{renderSafeVal(shipmentDetails.eta)}</strong></p>
                )}
              </div>
            )}

            {/* Registration Status Card (from GET /api/v1/orders/{group}/{enquiryNumber}/registration) */}
            {registrationDetails && (
              <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 flex items-center gap-1.5 text-xs text-purple-700">
                  <FaClipboardCheck /> RTA Registration Status
                </span>
                <p className="text-[11px] text-gray-700">File/Plate: <strong>{renderSafeVal(registrationDetails.rtaFileNo || registrationDetails.plate || registrationDetails.registrationStatus)}</strong></p>
                <p className="text-[10px] text-gray-500">Status: <strong className="text-purple-700">{renderSafeVal(registrationDetails.status)}</strong></p>
              </div>
            )}

            {/* Milestone Communication Card (from GET /api/v1/orders/{group}/{enquiryNumber}/milestones) */}
            {milestonesDetails && (
              <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 flex items-center gap-1.5 text-xs text-amber-700">
                  <FaPaperPlane /> Milestone Updates
                </span>
                <p className="text-[11px] text-gray-700">Milestone: <strong>{renderSafeVal(milestonesDetails.milestone || milestonesDetails.template)}</strong></p>
                <p className="text-[10px] text-gray-500">Delivery Status: <strong className="text-amber-700">{renderSafeVal(milestonesDetails.status || milestonesDetails.deliveryStatus)}</strong></p>
              </div>
            )}

            {/* Vehicle Ready Card (from GET /api/v1/orders/{group}/{enquiryNumber}/vehicle-ready) */}
            {vehicleReadyDetails && (
              <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1">
                <span className="font-bold text-gray-900 flex items-center gap-1.5 text-xs text-emerald-700">
                  <FaCheckCircle /> Vehicle Readiness
                </span>
                <p className="text-[11px] text-gray-700">Handover Ready: <strong>{renderSafeVal(vehicleReadyDetails.isReady ? 'READY FOR HANDOVER' : vehicleReadyDetails.status)}</strong></p>
              </div>
            )}

          </div>

          <details className="cursor-pointer text-[10px] pt-1 border-t border-gray-200">
            <summary className="font-bold text-gray-600 hover:text-gray-900">View Milestone JSON Data</summary>
            <pre className="mt-1 font-mono text-[10px] p-2.5 bg-gray-900 text-emerald-400 rounded-lg overflow-x-auto max-h-48">
              {JSON.stringify({ orderDetails, productionDetails, shipmentDetails, registrationDetails, milestonesDetails, vehicleReadyDetails }, null, 2)}
            </pre>
          </details>
        </div>
      )}

    </div>
  );
}

function formatDisplay(val) {
  if (!val) return 'N/A';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val.description || val.model || val.name || JSON.stringify(val);
  return String(val);
}
