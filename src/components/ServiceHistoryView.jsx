import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch, getServiceHistory, getServiceHistoryDetail } from '../utils/api';
import { createPortal } from 'react-dom';
import { 
  FaHistory, 
  FaCar, 
  FaSpinner, 
  FaRedo, 
  FaWrench,
  FaCalendarAlt,
  FaInfoCircle,
  FaCheckCircle,
  FaEye,
  FaTimes,
  FaFileInvoiceDollar,
  FaUser
} from 'react-icons/fa';

export default function ServiceHistoryView() {
  const { customer, selectedVin, vehicleDetails, vehicles, group: contextGroup } = useCustomer();
  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || "");
  const customerNumber = customer?.customerNumber || customer?.id || "";
  const vin = selectedVin || vehicleDetails?.vin || (vehicles && vehicles[0]?.vin) || "";

  // Flow Toggle: 'GEELY' (default) or 'KEYLOOP'
  const [historyFlow, setHistoryFlow] = useState('GEELY');

  // Universal DMS Flow State
  const initialGeelyVin = vin || customer?.vin || (vehicles && vehicles.length > 0 ? vehicles[0].vin : '') || 'SAJAB4BG7GA910301';
  const [geelyVin, setGeelyVin] = useState(initialGeelyVin);
  const [geelyHistory, setGeelyHistory] = useState([]);
  const [geelyLoading, setGeelyLoading] = useState(true);

  useEffect(() => {
    if (vin) setGeelyVin(vin);
  }, [vin]);

  // Detail Modal State
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState(null);
  const [historyDetailLoading, setHistoryDetailLoading] = useState(false);
  const [historyDetailData, setHistoryDetailData] = useState(null);

  // KEYLOOP State
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Universal Service History (GET /api/service/history?vinNumber={vin}&page=1&pageSize=50)
  const fetchGeelyHistory = async () => {
    if (!geelyVin.trim()) return;
    setGeelyLoading(true);
    try {
      const res = await getServiceHistory(geelyVin.trim(), 1, 50);
      if (res && res.ok && res.data) {
        const rawList = res.data.vehicleServiceHistory?.serviceHistory || res.data.result || res.data.data || res.data || [];
        setGeelyHistory(Array.isArray(rawList) ? rawList : [rawList]);
      } else {
        setGeelyHistory([]);
      }
    } catch (err) {
      console.warn("Failed to fetch service history:", err);
      setGeelyHistory([]);
    } finally {
      setGeelyLoading(false);
    }
  };

  useEffect(() => {
    if (historyFlow === 'GEELY') {
      fetchGeelyHistory();
    }
  }, [historyFlow, geelyVin]);

  // Open Service History Details Modal (GET /api/service/history-by-Id/{serviceHistoryId})
  const handleOpenDetailModal = async (record) => {
    setSelectedHistoryRecord(record);
    const histId = record.serviceHistoryId || record.id || record.historyId;
    if (!histId) return;

    setHistoryDetailLoading(true);
    setHistoryDetailData(null);
    try {
      const res = await getServiceHistoryDetail(histId);
      if (res && res.ok && res.data) {
        setHistoryDetailData(res.data.result || res.data.data || res.data);
      }
    } catch (err) {
      console.warn("Fetch service history details error:", err);
    } finally {
      setHistoryDetailLoading(false);
    }
  };

  // Fetch Keyloop Service History
  const fetchServiceHistory = async () => {
    if (!vin) {
      setHistory([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setHistory([]);
    try {
      const apiUrl = `/api/v1/vehicles/${group}/${vin}/service-history?from=2025-01-01&to=2026-12-31`;
      const res = await apiFetch(apiUrl);
      if (res && res.ok && Array.isArray(res.data)) {
        setHistory(res.data);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.warn("Failed to fetch vehicle service history:", err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (historyFlow === 'KEYLOOP') {
      fetchServiceHistory();
    }
  }, [group, vin, historyFlow]);

  const getStatusBadge = (status) => {
    if (!status) return <span className="text-gray-400 font-normal">-</span>;
    const s = String(status).trim().toUpperCase();
    if (s === 'BOOKED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <FaCheckCircle className="text-[9px] text-blue-600" /> Booked
        </span>
      );
    }
    if (s === 'COMPLETED' || s === 'INVOICED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <FaCheckCircle className="text-[9px] text-emerald-600" /> {status}
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
        {status}
      </span>
    );
  };

  const getSourceBadge = (source) => {
    if (!source) return <span className="text-gray-400 font-normal">-</span>;
    const s = String(source).trim().toUpperCase();
    if (s === 'WORKSHOP_BOOKING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <FaWrench className="text-[9px]" /> Workshop Booking
        </span>
      );
    }
    if (s === 'VEHICLE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <FaCar className="text-[9px]" /> Vehicle Record
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
        {source}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-4 text-xs font-sans">
      
      {/* Integration Flow Switcher Bar */}
      <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
            <FaHistory className="text-sm" />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-xs block">Service History Integration Flow</span>
            <span className="text-[10px] text-gray-500 font-medium">Select backend DMS for vehicle maintenance logs</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setHistoryFlow('GEELY')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              historyFlow === 'GEELY'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>AGMC Universal Service Engine (Direct DMS)</span>
          </button>
          <button
            type="button"
            onClick={() => setHistoryFlow('KEYLOOP')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              historyFlow === 'KEYLOOP'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>Keyloop RPA Flow</span>
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 1. AGMC UNIVERSAL SERVICE HISTORY VIEW (Direct DMS)              */}
      {/* ================================================================ */}
      {historyFlow === 'GEELY' && (
        <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4 text-xs">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FaWrench className="text-base" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900 leading-tight">Vehicle Service History</h2>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200 uppercase">
                    Multi-Brand DMS Engine
                  </span>
                  {geelyHistory.length > 0 && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                      {geelyHistory.length} Records
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 font-medium">
                  Historical Workshop Job Cards & Invoices
                </span>
              </div>
            </div>

            {/* VIN Input & Refresh Bar */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase">VIN:</span>
                <input
                  type="text"
                  value={geelyVin}
                  onChange={(e) => setGeelyVin(e.target.value)}
                  placeholder="e.g. SAJAB4BG7GA910301"
                  className="w-40 sm:w-48 bg-transparent font-mono font-bold text-gray-900 text-xs focus:outline-none uppercase"
                />
              </div>

              <button
                type="button"
                onClick={fetchGeelyHistory}
                disabled={geelyLoading}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer transition-colors"
                title="Refresh Service History"
              >
                <FaRedo className={`text-xs ${geelyLoading ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* History Body */}
          {geelyLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-400 gap-2">
              <FaSpinner className="animate-spin text-xl text-blue-600" />
              <span className="text-xs font-medium">Fetching vehicle service history from DMS...</span>
            </div>
          ) : geelyHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-1">
              <FaInfoCircle className="mx-auto text-xl text-gray-300 mb-1" />
              <p className="font-bold text-gray-700 text-xs">No Service History Records Found for VIN {geelyVin}</p>
              <p className="text-[11px] text-gray-400">
                There are no historical repair orders recorded in Keyloop for this chassis.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-center">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center">Service Date</th>
                    <th className="py-2.5 px-3 text-center">History / Invoice ID</th>
                    <th className="py-2.5 px-3 text-center">Mileage</th>
                    <th className="py-2.5 px-3 text-center">Service Operations</th>
                    <th className="py-2.5 px-3 text-center">Amount</th>
                    <th className="py-2.5 px-3 text-center">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
                  {geelyHistory.map((row, idx) => {
                    const histId = row.serviceHistoryId || row.id || row.invoiceNumber || idx;
                    const dateStr = row.serviceDate || row.date || row.completedDate || '-';
                    const mileage = row.mileage || row.mileageKm;
                    const ops = row.operationDescription || row.description || row.serviceType || 'Periodic Maintenance';
                    const amount = row.cost || row.amount || row.totalCost;

                    return (
                      <tr key={histId} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-3 font-semibold text-gray-900 font-mono text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <FaCalendarAlt className="text-gray-400 text-xs shrink-0" />
                            <span>{dateStr}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono font-bold text-blue-700 text-center">
                          #{histId}
                        </td>

                        <td className="py-3 px-3 font-bold text-gray-900 font-mono text-center">
                          {mileage ? `${Number(mileage).toLocaleString()} KM` : '-'}
                        </td>

                        <td className="py-3 px-3 font-semibold text-gray-800 text-center max-w-[200px] truncate" title={ops}>
                          {ops}
                        </td>

                        <td className="py-3 px-3 font-mono font-bold text-gray-900 text-center">
                          {amount ? `AED ${Number(amount).toLocaleString()}` : '-'}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(row)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <FaEye className="text-xs" />
                            <span>View Details</span>
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
      )}

      {/* ================================================================ */}
      {/* 2. BMW KEYLOOP SERVICE HISTORY VIEW                              */}
      {/* ================================================================ */}
      {historyFlow === 'KEYLOOP' && (
        <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4 text-xs font-sans">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FaHistory className="text-base" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900 leading-tight">BMW Vehicle Service History</h2>
                  {history.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                      {history.length} {history.length === 1 ? 'Record' : 'Records'}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  Keyloop Group: {group} {customerNumber ? `| Customer #${customerNumber}` : ''} {vin ? `| VIN: ${vin}` : ''}
                </span>
              </div>
            </div>

            <button 
              onClick={fetchServiceHistory}
              disabled={loading}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer self-start sm:self-auto transition-colors"
              title="Refresh Service History"
            >
              <FaRedo className={`text-xs ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>

          {/* History Table */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <FaSpinner className="animate-spin text-xl text-blue-600" />
              <span className="text-xs font-medium">Loading workshop service history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-1">
              <FaInfoCircle className="mx-auto text-xl text-gray-300 mb-1" />
              <p className="font-bold text-gray-700 text-xs">No Service History Records Found</p>
              <p className="text-[11px] text-gray-400">There are no historical workshop records returned from the API for this vehicle.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-center">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center">Service Date</th>
                    <th className="py-2.5 px-3 text-center">Booking ID</th>
                    <th className="py-2.5 px-3 text-center">Mileage</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Source</th>
                    <th className="py-2.5 px-3 text-center">Branch</th>
                    <th className="py-2.5 px-3 text-center">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
                  {history.map((row, idx) => (
                    <tr key={row.bookingId || row.serviceDate || idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-gray-900 font-mono text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <FaCalendarAlt className="text-gray-400 text-xs shrink-0" />
                          <span>{row.serviceDate || row.date || <span className="text-gray-400 font-normal">-</span>}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-blue-600 text-center">
                        {row.bookingId ? `#${row.bookingId}` : row.wipNumber ? `#${row.wipNumber}` : <span className="text-gray-400 font-normal">-</span>}
                      </td>

                      <td className="py-3 px-3 font-bold text-gray-900 font-mono text-center">
                        {row.mileageKm !== undefined && row.mileageKm !== null ? `${Number(row.mileageKm).toLocaleString()} KM` : row.mileage ? `${row.mileage} KM` : <span className="text-gray-400 font-normal">-</span>}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center">
                          {getStatusBadge(row.status)}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center">
                          {getSourceBadge(row.source)}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-gray-700 font-semibold text-center">
                        {row.branch || <span className="text-gray-400 font-normal">-</span>}
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-gray-900 font-mono">
                        {row.cost && String(row.cost).trim() !== '' ? `AED ${Number(row.cost).toLocaleString()}` : row.amount && String(row.amount).trim() !== '' ? `AED ${row.amount}` : <span className="text-gray-400 font-normal">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ================================================================ */}
      {/* GEELY SERVICE HISTORY DETAILS MODAL (/api/service/history-by-Id) */}
      {/* ================================================================ */}
      {selectedHistoryRecord && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedHistoryRecord(null);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200/90 max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-2xs shrink-0">
                  <FaFileInvoiceDollar className="text-base" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">
                    Service Record Details #{selectedHistoryRecord.serviceHistoryId || selectedHistoryRecord.id}
                  </h3>
                  <span className="text-[10px] text-gray-500 font-medium">
                    Historical Job Card & Line Items Breakdown
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHistoryRecord(null)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col gap-4 text-xs">
              {historyDetailLoading ? (
                <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <FaSpinner className="animate-spin text-xl text-blue-600" />
                  <span>Loading service history details from Keyloop DMS...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5 bg-gray-50 p-3 rounded-xl border border-gray-200 text-[11px]">
                    <div>
                      <span className="text-gray-400 text-[10px] block font-semibold uppercase">Service Date</span>
                      <span className="font-bold text-gray-900 font-mono">
                        {selectedHistoryRecord.serviceDate || selectedHistoryRecord.date || 'Recorded'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block font-semibold uppercase">Mileage</span>
                      <span className="font-mono text-gray-900 font-bold">
                        {selectedHistoryRecord.mileage ? `${Number(selectedHistoryRecord.mileage).toLocaleString()} KM` : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block font-semibold uppercase">Invoice / Reference</span>
                      <span className="font-mono text-blue-700 font-bold">
                        #{selectedHistoryRecord.serviceHistoryId || selectedHistoryRecord.id || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block font-semibold uppercase">Status</span>
                      <span className="font-bold text-emerald-800">
                        {selectedHistoryRecord.status || 'COMPLETED'}
                      </span>
                    </div>
                    {(selectedHistoryRecord.batteryId || selectedHistoryRecord.batteryID || historyDetailData?.batteryId || historyDetailData?.batteryID) && (
                      <div>
                        <span className="text-gray-400 text-[10px] block font-semibold uppercase">Battery ID</span>
                        <span className="font-mono text-blue-700 font-bold">
                          {selectedHistoryRecord.batteryId || selectedHistoryRecord.batteryID || historyDetailData?.batteryId || historyDetailData?.batteryID}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-gray-500 font-bold text-[11px] block mb-1">Service Operations & Labor</span>
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-gray-800 text-xs leading-relaxed font-medium">
                      {historyDetailData?.operations || historyDetailData?.description || selectedHistoryRecord.operationDescription || selectedHistoryRecord.description || 'Periodic Maintenance & Safety Inspections'}
                    </div>
                  </div>

                  {historyDetailData?.parts && (
                    <div>
                      <span className="text-gray-500 font-bold text-[11px] block mb-1">Parts Replaced</span>
                      <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-[11px]">
                        {Array.isArray(historyDetailData.parts) ? (
                          historyDetailData.parts.map((p, pIdx) => (
                            <div key={pIdx} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                              <span>{p.description || p.partNumber}</span>
                              <span className="font-mono font-bold">AED {p.price || p.amount || 0}</span>
                            </div>
                          ))
                        ) : (
                          <span>{String(historyDetailData.parts)}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Total Amount</span>
                      <span className="font-mono font-bold text-gray-900 text-sm">
                        {selectedHistoryRecord.cost ? `AED ${Number(selectedHistoryRecord.cost).toLocaleString()}` : selectedHistoryRecord.amount ? `AED ${selectedHistoryRecord.amount}` : 'AED 0.00'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedHistoryRecord(null)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-2xs"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
