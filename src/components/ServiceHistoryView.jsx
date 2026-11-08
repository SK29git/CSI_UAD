import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import {
  FaHistory,
  FaRedo,
  FaSpinner
} from 'react-icons/fa';

export default function ServiceHistoryView() {
  const { customer, selectedVin, vehicleDetails, vehicles, group: contextGroup } = useCustomer();
  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || "BMW");
  const customerNumber = customer?.customerNumber || customer?.id || "";
  const vin = selectedVin || vehicleDetails?.vin || (vehicles && vehicles[0]?.vin) || "";
  const vehicleNumber = vehicleDetails?.vehicleNumber || (vehicles && vehicles[0]?.vehicleNumber) || "";

  // Editable search inputs for firing the 3 APIs (no hardcoded defaults)
  const [searchVin, setSearchVin] = useState(vin);
  const [searchCustomerNumber, setSearchCustomerNumber] = useState(customerNumber);
  const [searchWipNumber, setSearchWipNumber] = useState("");

  useEffect(() => {
    if (vin) setSearchVin(vin);
  }, [vin]);

  useEffect(() => {
    if (customerNumber) setSearchCustomerNumber(customerNumber);
  }, [customerNumber]);

  // Main service history state (strictly populated by live API responses)
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected row index (default to first row)
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);

  // Helper to deduplicate records from multiple APIs
  const deduplicateRecords = (records) => {
    const seen = new Set();
    const result = [];

    for (const r of records) {
      if (!r || typeof r !== 'object') continue;
      const key = `${r.wipNumber || ''}_${r.invoiceNumber || ''}_${r.eventDate || r.documentDate || ''}_${r.repairDescription || ''}_${r.account || ''}_${r.branchCode || ''}_${r.odometer || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(r);
      }
    }
    return result;
  };

  // Safe extraction of array data from various API response envelopes
  const extractArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.result)) return data.result;
    if (data && Array.isArray(data.serviceHistory)) return data.serviceHistory;
    if (data && typeof data === 'object') {
      const keys = Object.keys(data);
      for (const k of keys) {
        if (Array.isArray(data[k])) return data[k];
      }
    }
    return [];
  };

  // Core multi-API fetching function that fires all 3 endpoints concurrently
  const fetchAllServiceHistoryApis = async () => {
    setLoading(true);

    const activeGroup = (group || 'BMW').trim();
    const activeVin = (searchVin || vin || '').trim();
    const activeCust = (searchCustomerNumber || customerNumber || '').trim();
    const activeWip = (searchWipNumber || '').trim();

    const calls = [];

    // 1. GET /api/v1/service-history?group={{group}}&wipNumber={{wipNumber}} (if WIP provided)
    if (activeWip) {
      calls.push(
        apiFetch(`/api/v1/service-history?group=${encodeURIComponent(activeGroup)}&wipNumber=${encodeURIComponent(activeWip)}`)
          .then(res => ({ type: 'wip', res }))
          .catch(err => ({ type: 'wip', error: err?.message || 'Failed' }))
      );
    }

    // 2. GET /api/v1/service-history?group={{group}}&customerNumber={{customerNumber}} (if customer # provided)
    if (activeCust) {
      calls.push(
        apiFetch(`/api/v1/service-history?group=${encodeURIComponent(activeGroup)}&customerNumber=${encodeURIComponent(activeCust)}`)
          .then(res => ({ type: 'customer', res }))
          .catch(err => ({ type: 'customer', error: err?.message || 'Failed' }))
      );
    }

    // 3. GET /api/v1/service-history?group={{group}}&vin={{vin}} (if VIN provided)
    if (activeVin) {
      calls.push(
        apiFetch(`/api/v1/service-history?group=${encodeURIComponent(activeGroup)}&vin=${encodeURIComponent(activeVin)}`)
          .then(res => ({ type: 'vin', res }))
          .catch(err => ({ type: 'vin', error: err?.message || 'Failed' }))
      );
    }

    const settled = await Promise.allSettled(calls);
    let combined = [];

    settled.forEach(item => {
      if (item.status === 'fulfilled') {
        const val = item.value;
        if (val.res && val.res.ok && val.res.data) {
          const arr = extractArray(val.res.data);
          combined = combined.concat(arr);
        }
      }
    });

    const deduplicated = deduplicateRecords(combined);
    setHistoryRecords(deduplicated);
    setSelectedRowIndex(0);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllServiceHistoryApis();
  }, [group, vin, customerNumber]);

  // Selected item reference for populating the 3 bottom cards
  const selectedItem = historyRecords[selectedRowIndex] || historyRecords[0] || null;

  // Formatting helpers
  const fmt = (val) => (val !== undefined && val !== null && String(val).trim() !== '' ? String(val) : '-');
  const fmtDate = (val) => {
    if (!val || String(val).trim() === '') return '/  /';
    const s = String(val).split('T')[0];
    const parts = s.split('-');
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }
    return s;
  };
  const fmtNum = (val) => {
    if (val === undefined || val === null || String(val).trim() === '') return '-';
    const n = Number(val);
    return isNaN(n) ? String(val) : n.toLocaleString();
  };

  // Dynamic Odometer Unit - never hardcoded
  const odoUnit = (() => {
    if (!selectedItem?.odometerType || String(selectedItem.odometerType).trim() === '') return '';
    const t = String(selectedItem.odometerType).trim().toUpperCase();
    if (t === 'K' || t === 'KM' || t === 'KILOMETRES') return 'Kilometres';
    if (t === 'M' || t === 'MI' || t === 'MILES') return 'Miles';
    return selectedItem.odometerType;
  })();

  const displayOdometerType = odoUnit || '-';

  return (
    <div className="flex flex-col gap-3 font-sans text-xs">

      {/* Top Banner & Query Bar */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-2xs p-3 flex flex-col gap-2">
        
        {/* Title Line */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
              <FaHistory className="text-xs" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm leading-tight">
                {vehicleNumber ? `Vehicle #${vehicleNumber} (Current vehicle)` : (vin ? `Vehicle VIN: ${vin}` : 'Vehicle Service History')}
              </h2>
              <span className="text-[10px] text-gray-500 font-mono">
                Group: {group || 'BMW'} | VIN: {searchVin || vin || '-'} | Customer #: {searchCustomerNumber || customerNumber || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Search Inputs & Fetch Button */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]">
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-2 py-1">
            <span className="text-gray-500 font-semibold uppercase text-[10px]">WIP #:</span>
            <input
              type="text"
              value={searchWipNumber}
              onChange={(e) => setSearchWipNumber(e.target.value)}
              placeholder="Enter WIP #"
              className="w-24 font-mono font-bold text-gray-900 bg-transparent focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-2 py-1">
            <span className="text-gray-500 font-semibold uppercase text-[10px]">Cust #:</span>
            <input
              type="text"
              value={searchCustomerNumber}
              onChange={(e) => setSearchCustomerNumber(e.target.value)}
              placeholder="Customer #"
              className="w-24 font-mono font-bold text-gray-900 bg-transparent focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-2 py-1">
            <span className="text-gray-500 font-semibold uppercase text-[10px]">VIN:</span>
            <input
              type="text"
              value={searchVin}
              onChange={(e) => setSearchVin(e.target.value)}
              placeholder="VIN number"
              className="w-40 font-mono font-bold text-gray-900 bg-transparent focus:outline-none uppercase"
            />
          </div>

          <button
            type="button"
            onClick={fetchAllServiceHistoryApis}
            disabled={loading}
            className="px-3.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FaRedo className={`text-[10px] ${loading ? 'animate-spin' : ''}`} />
            <span>Fetch</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN KEYLOOP DMS PANEL: Service History Table                              */}
      {/* ========================================================================= */}
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-2xs">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-50/90 via-sky-50 to-gray-50 border-b border-gray-300 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-950 text-xs tracking-wide">Service History</span>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.2 rounded-full border border-blue-200">
              {historyRecords.length} records
            </span>
          </div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
            <FaSpinner className="animate-spin text-lg text-blue-600" />
            <span className="text-xs font-semibold">Querying Service History APIs...</span>
          </div>
        ) : historyRecords.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-gray-50/50">
            <p className="font-bold text-gray-700 text-xs">No Service History Records Found</p>
            <p className="text-[11px] text-gray-400 mt-0.5">No records returned from Keyloop DMS for the current customer or vehicle.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[360px] overflow-y-auto border-b border-gray-200">
            <table className="w-full text-left text-[11px] border-collapse select-none">
              <thead className="bg-[#e9eef4] text-[#1e3a5f] font-bold border-b border-gray-300 sticky top-0 z-10">
                <tr>
                  <th className="py-1.5 px-2.5 border-r border-gray-200 whitespace-nowrap">Date</th>
                  <th className="py-1.5 px-2.5 border-r border-gray-200 whitespace-nowrap">Invoice Date</th>
                  <th className="py-1.5 px-2.5 border-r border-gray-200 whitespace-nowrap">Event Code</th>
                  <th className="py-1.5 px-2.5 border-r border-gray-200 whitespace-nowrap">Event Type</th>
                  <th className="py-1.5 px-2.5 border-r border-gray-200 whitespace-nowrap">Repair Description</th>
                  <th className="py-1.5 px-2.5 border-r border-gray-200 whitespace-nowrap text-right">Odometer</th>
                  <th className="py-1.5 px-2.5 border-r border-gray-200 whitespace-nowrap text-right">WIP #</th>
                  <th className="py-1.5 px-2.5 border-r border-gray-200 whitespace-nowrap text-right">Vehicle #</th>
                  <th className="py-1.5 px-2.5 border-r border-gray-200 whitespace-nowrap text-right">Customer #</th>
                  <th className="py-1.5 px-2.5 border-r border-gray-200 whitespace-nowrap">Customer Name</th>
                  <th className="py-1.5 px-2.5 border-r border-gray-200 whitespace-nowrap">Account</th>
                  <th className="py-1.5 px-2.5 border-r border-gray-200 whitespace-nowrap text-right">Invoice Value</th>
                  <th className="py-1.5 px-2.5 border-r border-gray-200 whitespace-nowrap text-right">Invoice #</th>
                  <th className="py-1.5 px-2.5 border-r border-gray-200 whitespace-nowrap">Branch</th>
                  <th className="py-1.5 px-2.5 border-r border-gray-200 whitespace-nowrap">Branch Name</th>
                  <th className="py-1.5 px-2.5 border-r border-gray-200 whitespace-nowrap">Misc Reference</th>
                  <th className="py-1.5 px-2.5 border-r border-gray-200 whitespace-nowrap">Owning Operator</th>
                  <th className="py-1.5 px-2.5 whitespace-nowrap">Invoice Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium">
                {historyRecords.map((row, idx) => {
                  const isSelected = idx === selectedRowIndex;
                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedRowIndex(idx)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#0078d7] text-white font-bold'
                          : idx % 2 === 0
                            ? 'bg-white hover:bg-blue-50/50 text-gray-800'
                            : 'bg-[#fbfcfe] hover:bg-blue-50/50 text-gray-800'
                      }`}
                    >
                      <td className={`py-1.5 px-2.5 border-r whitespace-nowrap font-mono ${isSelected ? 'border-blue-400' : 'border-gray-100'}`}>
                        {fmtDate(row.eventDate || row.documentDate)}
                      </td>
                      <td className={`py-1.5 px-2.5 border-r whitespace-nowrap font-mono ${isSelected ? 'border-blue-400' : 'border-gray-100'}`}>
                        {fmtDate(row.invoiceDate)}
                      </td>
                      <td className={`py-1.5 px-2.5 border-r whitespace-nowrap font-mono font-bold ${isSelected ? 'border-blue-400 text-yellow-200' : 'border-gray-100 text-blue-800'}`}>
                        {fmt(row.eventCode)}
                      </td>
                      <td className={`py-1.5 px-2.5 border-r whitespace-nowrap font-mono ${isSelected ? 'border-blue-400 text-sky-100' : 'border-gray-100 text-purple-700'}`}>
                        {fmt(row.eventType)}
                      </td>
                      <td className={`py-1.5 px-2.5 border-r max-w-[240px] truncate ${isSelected ? 'border-blue-400' : 'border-gray-100'}`} title={row.repairDescription}>
                        {fmt(row.repairDescription)}
                      </td>
                      <td className={`py-1.5 px-2.5 border-r whitespace-nowrap text-right font-mono ${isSelected ? 'border-blue-400' : 'border-gray-100'}`}>
                        {fmtNum(row.odometer)}
                      </td>
                      <td className={`py-1.5 px-2.5 border-r whitespace-nowrap text-right font-mono font-bold ${isSelected ? 'border-blue-400 text-white' : 'border-gray-100 text-blue-900'}`}>
                        {fmt(row.wipNumber)}
                      </td>
                      <td className={`py-1.5 px-2.5 border-r whitespace-nowrap text-right font-mono ${isSelected ? 'border-blue-400' : 'border-gray-100'}`}>
                        {fmt(row.vehicleNumber)}
                      </td>
                      <td className={`py-1.5 px-2.5 border-r whitespace-nowrap text-right font-mono ${isSelected ? 'border-blue-400' : 'border-gray-100'}`}>
                        {fmt(row.customerNumber)}
                      </td>
                      <td className={`py-1.5 px-2.5 border-r whitespace-nowrap max-w-[150px] truncate ${isSelected ? 'border-blue-400' : 'border-gray-100'}`} title={row.customerName}>
                        {fmt(row.customerName)}
                      </td>
                      <td className={`py-1.5 px-2.5 border-r whitespace-nowrap font-mono ${isSelected ? 'border-blue-400' : 'border-gray-100'}`}>
                        {fmt(row.account)}
                      </td>
                      <td className={`py-1.5 px-2.5 border-r whitespace-nowrap text-right font-mono font-bold ${isSelected ? 'border-blue-400' : 'border-gray-100 text-gray-900'}`}>
                        {row.invoiceValue && String(row.invoiceValue).trim() !== '' ? row.invoiceValue : (row.baseCurrencyVatValue && String(row.baseCurrencyVatValue).trim() !== '' ? row.baseCurrencyVatValue : '-')}
                      </td>
                      <td className={`py-1.5 px-2.5 border-r whitespace-nowrap text-right font-mono ${isSelected ? 'border-blue-400' : 'border-gray-100'}`}>
                        {fmt(row.invoiceNumber)}
                      </td>
                      <td className={`py-1.5 px-2.5 border-r whitespace-nowrap font-mono ${isSelected ? 'border-blue-400' : 'border-gray-100'}`}>
                        {fmt(row.branchCode)}
                      </td>
                      <td className={`py-1.5 px-2.5 border-r whitespace-nowrap ${isSelected ? 'border-blue-400' : 'border-gray-100'}`}>
                        {fmt(row.branchName)}
                      </td>
                      <td className={`py-1.5 px-2.5 border-r whitespace-nowrap font-mono ${isSelected ? 'border-blue-400' : 'border-gray-100'}`}>
                        {fmt(row.miscReference)}
                      </td>
                      <td className={`py-1.5 px-2.5 border-r whitespace-nowrap ${isSelected ? 'border-blue-400' : 'border-gray-100'}`}>
                        {row.owningOperator || row.operatorName ? `${row.owningOperator || ''} ${row.operatorName ? `(${row.operatorName})` : ''}`.trim() : '-'}
                      </td>
                      <td className="py-1.5 px-2.5 whitespace-nowrap">
                        {row.invoiceOperator || row.invoiceOperatorName ? `${row.invoiceOperator || ''} ${row.invoiceOperatorName ? `(${row.invoiceOperatorName})` : ''}`.trim() : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 3 BOTTOM CARDS (Point of Sale Detail | Service Data | Inspection)        */}
      {/* Only shown when service history records exist                           */}
      {/* ========================================================================= */}
      {historyRecords.length > 0 && selectedItem && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">

        {/* ===================================================================== */}
        {/* CARD 1: Point of Sale Detail                                         */}
        {/* ===================================================================== */}
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-2xs flex flex-col">
          <div className="bg-gradient-to-r from-blue-50/90 to-gray-50 border-b border-gray-300 px-3 py-1.5 flex items-center justify-between">
            <span className="font-bold text-blue-950 text-xs tracking-wide">Point of Sale Detail</span>
          </div>

          <div className="p-3 flex flex-col gap-2 text-[11px] flex-1">
            {/* Point of Sale account */}
            <div className="flex items-center gap-2">
              <span className="w-36 text-gray-600 font-medium shrink-0">Point of Sale account:</span>
              <div className="flex-1 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-medium text-gray-900 min-h-[22px] truncate">
                {selectedItem?.pointOfSaleAccount || selectedItem?.account || '-'}
              </div>
            </div>

            {/* Aftersales branch */}
            <div className="flex items-center gap-2">
              <span className="w-36 text-gray-600 font-medium shrink-0">Aftersales branch:</span>
              <div className="flex items-center gap-1 flex-1">
                <div className="w-16 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-medium text-gray-900 min-h-[22px] truncate text-center">
                  {selectedItem?.branchCode ? String(selectedItem.branchCode).padStart(4, '0') : '-'}
                </div>
                <div className="flex-1 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-medium text-gray-900 min-h-[22px] truncate">
                  {selectedItem?.branchName || selectedItem?.aftersalesBranch || '-'}
                </div>
              </div>
            </div>

            {/* Aftersales Executive */}
            <div className="flex items-center gap-2">
              <span className="w-36 text-gray-600 font-medium shrink-0">Aftersales Executive:</span>
              <div className="flex-1 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-medium text-gray-900 min-h-[22px] truncate">
                {selectedItem?.afterSalesExecutive || '-'}
              </div>
            </div>

            {/* Contract Reference Number */}
            <div className="flex items-center gap-2">
              <span className="w-36 text-gray-600 font-medium shrink-0">Contract Reference #:</span>
              <div className="flex-1 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-medium text-gray-900 min-h-[22px] truncate">
                {selectedItem?.contractReferenceNumber || '-'}
              </div>
            </div>

            {/* Job Card Archive */}
            <div className="flex items-center gap-2">
              <span className="w-36 text-gray-600 font-medium shrink-0">Job Card Archive:</span>
              <div className="flex-1 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-medium text-gray-900 min-h-[22px] truncate">
                {selectedItem?.jobCardArchive || '-'}
              </div>
            </div>

            {/* Registration & Date */}
            <div className="flex items-center gap-2">
              <span className="w-36 text-gray-600 font-medium shrink-0">Registration:</span>
              <div className="flex items-center gap-1 flex-1">
                <div className="flex-1 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-medium text-gray-900 min-h-[22px] truncate">
                  {selectedItem?.registrationNumber || '-'}
                </div>
                <div className="w-24 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono text-center text-gray-900 min-h-[22px]">
                  {fmtDate(selectedItem?.registrationDate)}
                </div>
              </div>
            </div>

            {/* VIN */}
            <div className="flex items-center gap-2">
              <span className="w-36 text-gray-600 font-medium shrink-0">VIN:</span>
              <div className="flex-1 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-medium text-gray-900 min-h-[22px] truncate">
                {selectedItem?.vin || '-'}
              </div>
            </div>

            {/* Base Currency VAT Value */}
            <div className="flex items-center gap-2">
              <span className="w-36 text-gray-600 font-medium shrink-0">Base Currency VAT:</span>
              <div className="flex-1 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-medium text-gray-900 min-h-[22px] truncate">
                {selectedItem?.baseCurrencyVatValue || '-'}
              </div>
            </div>

            {/* Additional Information */}
            <div className="flex items-start gap-2">
              <span className="w-36 text-gray-600 font-medium shrink-0 pt-0.5">Additional Info:</span>
              <div className="flex-1 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs text-gray-900 min-h-[22px] text-[10px] break-words">
                {selectedItem?.additionalInformation || '-'}
              </div>
            </div>

          </div>
        </div>

        {/* ===================================================================== */}
        {/* CARD 2: Service Data                                                 */}
        {/* ===================================================================== */}
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-2xs flex flex-col">
          <div className="bg-gradient-to-r from-blue-50/90 to-gray-50 border-b border-gray-300 px-3 py-1.5 flex items-center justify-between">
            <span className="font-bold text-blue-950 text-xs tracking-wide">Service Data</span>
          </div>

          <div className="p-3 flex flex-col gap-2 text-[11px] flex-1">
            {/* Display odometer as */}
            <div className="flex items-center gap-2">
              <span className="w-36 text-gray-600 font-medium shrink-0">Display odometer as:</span>
              <div className="flex-1 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-medium text-gray-900 min-h-[22px]">
                {displayOdometerType}
              </div>
            </div>

            {/* Last service date */}
            <div className="flex items-center gap-2">
              <span className="w-36 text-gray-600 font-medium shrink-0">Last service date:</span>
              <div className="flex items-center gap-1 flex-1">
                <div className="w-24 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-medium text-gray-900 min-h-[22px] text-center">
                  {fmtDate(selectedItem?.lastServiceDate)}
                </div>
                <span className="text-gray-500 text-[10px] font-bold px-0.5">@</span>
                <div className="flex-1 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-bold text-gray-900 min-h-[22px] text-right">
                  {selectedItem?.lastServiceOdometer && selectedItem.lastServiceOdometer !== '0' ? Number(selectedItem.lastServiceOdometer).toLocaleString() : '-'}
                </div>
                {odoUnit && <span className="text-blue-700 font-semibold text-[10px]">{odoUnit}</span>}
              </div>
            </div>

            {/* Next service due */}
            <div className="flex items-center gap-2">
              <span className="w-36 text-gray-600 font-medium shrink-0">Next service due:</span>
              <div className="flex items-center gap-1 flex-1">
                <div className="w-24 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-medium text-gray-900 min-h-[22px] text-center">
                  {fmtDate(selectedItem?.nextServiceDate)}
                </div>
                <span className="text-gray-500 text-[10px] font-bold px-0.5">@</span>
                <div className="flex-1 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-bold text-gray-900 min-h-[22px] text-right">
                  {selectedItem?.nextServiceOdometer && selectedItem.nextServiceOdometer !== '0' ? Number(selectedItem.nextServiceOdometer).toLocaleString() : '-'}
                </div>
                {odoUnit && <span className="text-blue-700 font-semibold text-[10px]">{odoUnit}</span>}
              </div>
            </div>

            {/* Next service due (2) */}
            <div className="flex items-center gap-2">
              <span className="w-36 text-gray-600 font-medium shrink-0">Next service due (2):</span>
              <div className="flex items-center gap-1 flex-1">
                <div className="w-24 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-medium text-gray-900 min-h-[22px] text-center">
                  {fmtDate(selectedItem?.nextServiceDate2)}
                </div>
                <span className="text-gray-500 text-[10px] font-bold px-0.5">@</span>
                <div className="flex-1 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-bold text-gray-900 min-h-[22px] text-right">
                  {selectedItem?.nextServiceOdometer2 && selectedItem.nextServiceOdometer2 !== '0' ? Number(selectedItem.nextServiceOdometer2).toLocaleString() : '-'}
                </div>
                {odoUnit && <span className="text-blue-700 font-semibold text-[10px]">{odoUnit}</span>}
              </div>
            </div>

            {/* Date of last work */}
            <div className="flex items-center gap-2">
              <span className="w-36 text-gray-600 font-medium shrink-0">Date of last work:</span>
              <div className="flex items-center gap-1 flex-1">
                <div className="w-24 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-medium text-gray-900 min-h-[22px] text-center">
                  {fmtDate(selectedItem?.dateOfLastWork)}
                </div>
                <span className="text-gray-500 text-[10px] font-bold px-0.5">@</span>
                <div className="flex-1 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-bold text-gray-900 min-h-[22px] text-right">
                  {selectedItem?.odometerAtLastWork && selectedItem.odometerAtLastWork !== '0' ? Number(selectedItem.odometerAtLastWork).toLocaleString() : '-'}
                </div>
                {odoUnit && <span className="text-blue-700 font-semibold text-[10px]">{odoUnit}</span>}
              </div>
            </div>

            {/* Odometer at last work (2) */}
            <div className="flex items-center gap-2">
              <span className="w-36 text-gray-600 font-medium shrink-0">Odometer last work (2):</span>
              <div className="flex items-center gap-1 flex-1">
                <div className="flex-1 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-bold text-gray-900 min-h-[22px] text-right">
                  {selectedItem?.odometerAtLastWork2 && selectedItem.odometerAtLastWork2 !== '0' ? Number(selectedItem.odometerAtLastWork2).toLocaleString() : '-'}
                </div>
                {odoUnit && <span className="text-blue-700 font-semibold text-[10px]">{odoUnit}</span>}
              </div>
            </div>

            {/* Odometer change date */}
            <div className="flex items-center gap-2">
              <span className="w-36 text-gray-600 font-medium shrink-0">Odometer change date:</span>
              <div className="flex items-center gap-1 flex-1">
                <div className="w-24 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-medium text-gray-900 min-h-[22px] text-center">
                  {fmtDate(selectedItem?.odometerChangeDate || selectedItem?.documentDate)}
                </div>
                <span className="text-gray-500 text-[10px] font-bold px-0.5">@</span>
                <div className="flex-1 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-bold text-gray-900 min-h-[22px] text-right">
                  {selectedItem?.odometer && selectedItem.odometer !== '0' ? Number(selectedItem.odometer).toLocaleString() : '-'}
                </div>
                {odoUnit && <span className="text-blue-700 font-semibold text-[10px]">{odoUnit}</span>}
              </div>
            </div>

            {/* Timing belt */}
            <div className="flex items-center gap-2">
              <span className="w-36 text-gray-600 font-medium shrink-0">Timing belt:</span>
              <div className="flex items-center gap-1 flex-1">
                <div className="w-24 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-medium text-gray-900 min-h-[22px] text-center">
                  {selectedItem?.timingBeltMonths && selectedItem.timingBeltMonths !== '0' ? `${selectedItem.timingBeltMonths} Months` : '-'}
                </div>
                <span className="text-gray-500 text-[10px] font-medium px-0.5">or:</span>
                <div className="flex-1 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-medium text-gray-900 min-h-[22px] text-center">
                  {selectedItem?.timingBeltOdometer && selectedItem.timingBeltOdometer !== '0' ? `${Number(selectedItem.timingBeltOdometer).toLocaleString()} ${odoUnit}` : '-'}
                </div>
              </div>
            </div>

            {/* Service interval */}
            <div className="flex items-center gap-2">
              <span className="w-36 text-gray-600 font-medium shrink-0">Service interval:</span>
              <div className="flex items-center gap-1 flex-1">
                <div className="w-24 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-medium text-gray-900 min-h-[22px] text-center">
                  {selectedItem?.serviceIntervalMonths && selectedItem.serviceIntervalMonths !== '0' ? `${selectedItem.serviceIntervalMonths} Months` : '-'}
                </div>
                <span className="text-gray-500 text-[10px] font-medium px-0.5">or:</span>
                <div className="flex-1 bg-[#e4e7eb] border border-gray-400 px-2 py-0.5 rounded-xs font-mono font-medium text-gray-900 min-h-[22px] text-center">
                  {selectedItem?.serviceIntervalOdometer && selectedItem.serviceIntervalOdometer !== '0' ? `${Number(selectedItem.serviceIntervalOdometer).toLocaleString()} ${odoUnit}` : '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* CARD 3: Inspection                                                   */}
        {/* ========================================================================= */}
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-2xs flex flex-col">
          <div className="bg-gradient-to-r from-blue-50/90 to-gray-50 border-b border-gray-300 px-3 py-1.5 flex items-center justify-between">
            <span className="font-bold text-blue-950 text-xs tracking-wide">Inspection</span>
          </div>

          <div className="p-3 flex flex-col gap-1.5 text-[11px] flex-1">
            
            {/* Row 1: Last road safety test | Return parts */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium truncate pr-1">Last road safety test:</span>
                <div className="w-20 bg-[#e4e7eb] border border-gray-400 px-1 py-0.5 rounded-xs font-mono text-center min-h-[22px]">
                  {fmtDate(selectedItem?.lastRoadSafetyTestDate)}
                </div>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-gray-600 font-medium">Return parts:</span>
                <div className="w-6 h-[22px] bg-[#e4e7eb] border border-gray-400 rounded-xs flex items-center justify-center font-bold">
                  {selectedItem?.returnParts === '1' ? '✓' : ''}
                </div>
              </div>
            </div>

            {/* Row 2: First road safety test interval | Camchain */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium truncate pr-1">First road safety test interval:</span>
                <div className="w-20 bg-[#e4e7eb] border border-gray-400 px-1 py-0.5 rounded-xs font-mono text-center min-h-[22px]">
                  {selectedItem?.firstRoadSafetyTestIntervalMonths && selectedItem.firstRoadSafetyTestIntervalMonths !== '0' ? selectedItem.firstRoadSafetyTestIntervalMonths : '-'}
                </div>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-gray-600 font-medium">Camchain:</span>
                <div className="w-6 h-[22px] bg-[#e4e7eb] border border-gray-400 rounded-xs flex items-center justify-center font-bold">
                  {selectedItem?.camchain === '1' ? '✓' : ''}
                </div>
              </div>
            </div>

            {/* Row 3: Road Safety Test expiry | CO2 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium truncate pr-1">Road Safety Test expiry:</span>
                <div className="w-20 bg-[#e4e7eb] border border-gray-400 px-1 py-0.5 rounded-xs font-mono text-center min-h-[22px]">
                  {fmtDate(selectedItem?.roadSafetyTestExpiryDate)}
                </div>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-gray-600 font-medium">CO2:</span>
                <div className="w-20 bg-[#e4e7eb] border border-gray-400 px-1.5 py-0.5 rounded-xs font-mono text-right min-h-[22px]">
                  {selectedItem?.co2Emissions && selectedItem.co2Emissions !== '0' ? selectedItem.co2Emissions : '-'}
                </div>
              </div>
            </div>

            {/* Row 4: Road Safety Test interval | RFL expiry */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium truncate pr-1">Road Safety Test interval:</span>
                <div className="w-20 bg-[#e4e7eb] border border-gray-400 px-1 py-0.5 rounded-xs font-mono text-center min-h-[22px]">
                  {selectedItem?.roadSafetyTestIntervalMonths && selectedItem.roadSafetyTestIntervalMonths !== '0' ? selectedItem.roadSafetyTestIntervalMonths : '-'}
                </div>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-gray-600 font-medium">RFL expiry:</span>
                <div className="w-20 bg-[#e4e7eb] border border-gray-400 px-1 py-0.5 rounded-xs font-mono text-center min-h-[22px]">
                  {fmtDate(selectedItem?.rflExpiryDate)}
                </div>
              </div>
            </div>

            {/* Row 5: Next emission | PDI completed */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium truncate pr-1">Next emission:</span>
                <div className="w-20 bg-[#e4e7eb] border border-gray-400 px-1 py-0.5 rounded-xs font-mono text-center min-h-[22px]">
                  {fmtDate(selectedItem?.nextEmissionCheckDate)}
                </div>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-gray-600 font-medium">PDI completed:</span>
                <div className="w-20 bg-[#e4e7eb] border border-gray-400 px-1 py-0.5 rounded-xs font-mono text-center min-h-[22px]">
                  {fmtDate(selectedItem?.pdiCompleted)}
                </div>
              </div>
            </div>

            {/* Row 6: Brake fluid */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Brake fluid:</span>
              <div className="w-20 bg-[#e4e7eb] border border-gray-400 px-1 py-0.5 rounded-xs font-mono text-center min-h-[22px]">
                {fmtDate(selectedItem?.brakeFluidChange)}
              </div>
            </div>

            {/* Row 7: Air con inspection */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Air con inspection:</span>
              <div className="w-20 bg-[#e4e7eb] border border-gray-400 px-1 py-0.5 rounded-xs font-mono text-center min-h-[22px]">
                {fmtDate(selectedItem?.airConInspection)}
              </div>
            </div>

            {/* Row 8: Cambelt inspection */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Cambelt inspection:</span>
              <div className="w-20 bg-[#e4e7eb] border border-gray-400 px-1 py-0.5 rounded-xs font-mono text-center min-h-[22px]">
                {fmtDate(selectedItem?.cambeltInspection)}
              </div>
            </div>

            {/* Row 9: Transm. oil change */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Transm. oil change:</span>
              <div className="w-20 bg-[#e4e7eb] border border-gray-400 px-1 py-0.5 rounded-xs font-mono text-center min-h-[22px]">
                {fmtDate(selectedItem?.transmissionOilChange)}
              </div>
            </div>

          </div>
        </div>

      </div>
      )}

    </div>
  );
}
