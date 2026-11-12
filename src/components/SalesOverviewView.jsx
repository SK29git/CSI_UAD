import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaCar, 
  FaCheckCircle, 
  FaCalculator, 
  FaShieldAlt, 
  FaExchangeAlt, 
  FaCheck, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaChevronDown,
  FaSpinner,
  FaRedo,
  FaTimes
} from 'react-icons/fa';

export default function SalesOverviewView() {
  const { customer, salesSummary: contextSalesSummary, group: contextGroup } = useCustomer();
  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || "");
  const customerNumber = customer?.customerNumber || customer?.id || "";

  const [vehicles, setVehicles] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Active detail section state
  const [activeDetailTab, setActiveDetailTab] = useState(null); // 'finance' | 'insurance' | 'tradein' | null
  const [financeData, setFinanceData] = useState([]);
  const [insuranceData, setInsuranceData] = useState([]);
  const [tradeInData, setTradeInData] = useState([]);
  const [salesSummary, setSalesSummary] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchSalesData = async () => {
    if (!customerNumber) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Primary composite API: GET /api/v1/customers/{group}/{customerNumber}/sales-screen
      const salesScreenUrl = `/api/v1/customers/${group}/${customerNumber}/sales-screen`;
      const res = await apiFetch(salesScreenUrl);

      if (res && res.ok && res.data && typeof res.data === 'object') {
        const d = res.data;
        if (Array.isArray(d.vehicles)) setVehicles(d.vehicles);
        if (Array.isArray(d.finance)) setFinanceData(d.finance);
        if (Array.isArray(d.insurance)) setInsuranceData(d.insurance);
        if (Array.isArray(d.tradeInHistory)) setTradeInData(d.tradeInHistory);
        if (d.salesSummary && typeof d.salesSummary === 'object') setSalesSummary(d.salesSummary);
        setSelectedIndex(0);
        return;
      }

      // Individual API fallbacks if sales-screen is unavailable
      const vehRes = await apiFetch(`/api/v1/customers/${group}/${customerNumber}/vehicles`);
      if (vehRes && vehRes.ok && Array.isArray(vehRes.data)) {
        setVehicles(vehRes.data);
      } else {
        setVehicles([]);
      }

      const finRes = await apiFetch(`/api/v1/customers/${group}/${customerNumber}/finance`);
      if (finRes && finRes.ok && Array.isArray(finRes.data)) {
        setFinanceData(finRes.data);
      } else {
        setFinanceData([]);
      }

      const insRes = await apiFetch(`/api/v1/customers/${group}/${customerNumber}/insurance`);
      if (insRes && insRes.ok && Array.isArray(insRes.data)) {
        setInsuranceData(insRes.data);
      } else {
        setInsuranceData([]);
      }

      const trdRes = await apiFetch(`/api/v1/customers/${group}/${customerNumber}/trade-in-history`);
      if (trdRes && trdRes.ok && Array.isArray(trdRes.data)) {
        setTradeInData(trdRes.data);
      } else {
        setTradeInData([]);
      }
    } catch (err) {
      console.warn("Failed to fetch customer sales data:", err);
      setVehicles([]);
      setFinanceData([]);
      setInsuranceData([]);
      setTradeInData([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDetailTab = (tabName) => {
    if (activeDetailTab === tabName) {
      setActiveDetailTab(null);
    } else {
      setActiveDetailTab(tabName);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [group, customerNumber]);

  const activeVehicle = vehicles[selectedIndex] || (vehicles && vehicles.length > 0 ? vehicles[0] : null);

  const hasFinance = Array.isArray(financeData) && financeData.length > 0;
  const hasInsurance = Array.isArray(insuranceData) && insuranceData.length > 0;
  const hasTradeIn = Array.isArray(tradeInData) && tradeInData.length > 0;
  const hasAnyDetailTab = hasFinance || hasInsurance || hasTradeIn;

  const currentSalesSummary = salesSummary || contextSalesSummary;
  const hasSalesSummary = Boolean(
    currentSalesSummary &&
    typeof currentSalesSummary === 'object' &&
    (
      currentSalesSummary.totalLeads !== undefined ||
      currentSalesSummary.openLeads !== undefined ||
      currentSalesSummary.wonDeals !== undefined ||
      currentSalesSummary.lostDeals !== undefined ||
      currentSalesSummary.lastPurchaseDate
    )
  );

  return (
    <div className="flex flex-col gap-4">
      
      {/* 1. Vehicle Details Card */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 text-base">Vehicle Details</h2>
            {vehicles.length > 0 && (
              <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-2.5 py-0.5 rounded-full border border-emerald-200">
                {selectedIndex === 0 ? 'Primary Vehicle' : `Vehicle ${selectedIndex + 1} of ${vehicles.length}`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button 
              onClick={fetchSalesData} 
              className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              title="Refresh Vehicle Data"
            >
              <FaRedo className={`text-xs ${loading ? 'animate-spin' : ''}`} />
            </button>

            {activeVehicle?.vin && (
              <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                <FaCheckCircle className="text-xs" /> Verified VIN
              </span>
            )}
          </div>
        </div>

        {/* Multi-Vehicle Tabs (Glossy Modern Tabs with Primary Vehicle First - Replaces Dropdown) */}
        {vehicles.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-100 mb-4 no-scrollbar">
            <span className="text-[10px] font-extrabold uppercase text-gray-400 shrink-0 flex items-center gap-1 mr-1">
              <FaCar className="text-blue-600 text-xs" />
              <span>Vehicles ({vehicles.length}):</span>
            </span>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/90 flex-wrap sm:flex-nowrap">
              {vehicles.map((v, idx) => {
                const isSelected = selectedIndex === idx;
                const brand = v.brand || 'Vehicle';
                const model = v.model || v.variant || '';
                const desc = v.description || `${brand} ${model}`.trim();
                const reg = v.registrationNumber || v.plateNumber || '';
                const isPrimary = idx === 0;

                return (
                  <button
                    key={v.vin || idx}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap overflow-hidden select-none active:scale-[0.98] ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/50 border border-white/30 before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/25 before:to-transparent before:pointer-events-none"
                        : "bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-slate-300 shadow-2xs"
                    }`}
                    title={`Select Vehicle ${idx + 1}${isPrimary ? ' (Primary)' : ''}: ${desc}`}
                  >
                    <FaCar
                      className={`text-xs shrink-0 ${isSelected ? "text-blue-100" : "text-blue-600"}`}
                    />
                    <span>Vehicle {idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-10 flex flex-col items-center justify-center text-gray-400 gap-2">
            <FaSpinner className="animate-spin text-xl text-blue-600" />
            <span className="text-xs font-medium">Loading customer vehicle data...</span>
          </div>
        ) : !activeVehicle ? (
          <div className="py-6 text-center text-gray-400 text-xs">
            No vehicle records found for this customer.
          </div>
        ) : (
          <div className="w-full space-y-2.5">
            {/* Header: Title and Key Badges */}
            <div className="pb-2 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm leading-tight flex items-center gap-2">
                  <FaCar className="text-blue-600 text-xs shrink-0" />
                  <span>{activeVehicle.description || `${activeVehicle.brand || ''} ${activeVehicle.model || ''}`.trim() || 'Vehicle'}</span>
                  {activeVehicle.modelYear && <span className="text-xs text-gray-400 font-semibold">({activeVehicle.modelYear})</span>}
                </h3>
                
              </div>
            </div>

            {/* 2 Primary DMS Panels: Vehicle Identity & Vehicle Definition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">

              {/* PANEL 1: Vehicle Identity */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                <div className="bg-gradient-to-r from-blue-50/90 to-gray-50 border-b border-gray-200 px-3 py-1.5 flex items-center justify-between">
                  <span className="font-bold text-blue-950 text-xs tracking-wide">Vehicle Identity</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    { label: 'Registration number:', value: activeVehicle.registrationNumber },
                    { label: 'Registration date:', value: activeVehicle.registrationDate ? String(activeVehicle.registrationDate).split('T')[0] : null },
                    { label: 'VIN:', value: activeVehicle.vin, mono: true, bold: true },
                    { label: 'Vehicle number', value: activeVehicle.vehicleNumber ? `#${activeVehicle.vehicleNumber}` : null, mono: true, bold: true },
                    { label: 'Model analysis code:', value: activeVehicle.modelAnalysisCode },
                    { label: 'Engine number:', value: activeVehicle.engineNumber, mono: true },
                    { label: 'Battery ID:', value: activeVehicle.batteryIdentificationNumber, red: true },
                    { label: 'Mileage:', value: activeVehicle.mileageKm != null ? `${Number(activeVehicle.mileageKm).toLocaleString()} KM` : (activeVehicle.lastOdometer ? `${activeVehicle.lastOdometer} KM` : null), bold: true },
                    { label: 'Last odometer reading:', value: activeVehicle.lastOdometer ? `${activeVehicle.lastOdometer} Kilometres` : (activeVehicle.mileageKm != null ? `${Number(activeVehicle.mileageKm).toLocaleString()} Kilometres` : null), bold: true },
                  ].map(({ label, value, mono, bold, red }) => (
                    <div key={label} className="flex items-center justify-between px-3 py-1.5 gap-2 hover:bg-gray-50/60 transition-colors">
                      <span className={`font-medium text-[11px] w-48 shrink-0 ${red ? 'text-red-600 font-bold' : 'text-gray-600'}`}>{label}</span>
                      <div className="flex-1 flex justify-end">
                        <span className={`text-[11px] truncate max-w-full ${mono ? 'font-mono' : ''} ${bold ? 'font-bold' : 'font-semibold'} ${red ? 'text-red-600 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px]' : 'text-gray-900'}`}>
                          {value || '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PANEL 2: Vehicle Definition */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                <div className="bg-gradient-to-r from-blue-50/90 to-gray-50 border-b border-gray-200 px-3 py-1.5 flex items-center justify-between">
                  <span className="font-bold text-blue-950 text-xs tracking-wide">Vehicle Definition</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    { label: 'Manufacturer:', value: activeVehicle.brand || activeVehicle.manufacturerCode, bold: true },
                    { label: 'Model:', value: activeVehicle.model, bold: true },
                    { label: 'Variant:', value: activeVehicle.variant },
                    { label: 'Sub-variant:', value: activeVehicle.subVariantCode },
                    { label: 'Model year:', value: activeVehicle.modelYear, bold: true },
                    { label: 'Description:', value: activeVehicle.description },
                    { label: 'Colour:', value: activeVehicle.colourDescription || activeVehicle.colour || activeVehicle.colourCode },
                  ].map(({ label, value, bold }) => (
                    <div key={label} className="flex items-center justify-between px-3 py-1.5 gap-2 hover:bg-gray-50/60 transition-colors">
                      <span className="text-gray-600 font-medium text-[11px] w-36 shrink-0">{label}</span>
                      <span className={`text-[11px] truncate text-right flex-1 text-gray-900 ${bold ? 'font-bold' : 'font-semibold'}`} title={String(value || '')}>
                        {value || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2 Bottom Panels: Owners & Customer Detail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">

              {/* PANEL 3: Owners */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                <div className="bg-gradient-to-r from-blue-50/90 to-gray-50 border-b border-gray-200 px-3 py-1.5 flex items-center justify-between">
                  <span className="font-bold text-blue-950 text-xs tracking-wide">Owners</span>
                </div>
                <div className="p-2 sm:p-2.5">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Linked Owner Customers</div>
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-blue-50/60 text-blue-950 border-b border-gray-200 font-bold">
                        <tr>
                          <th className="py-1 px-2.5 w-1/3">Link Type</th>
                          <th className="py-1 px-2.5 w-1/2">Customer</th>
                          <th className="py-1 px-2.5">Company</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {activeVehicle.salesCustomer && (
                          <tr className="hover:bg-gray-50/60 text-gray-800">
                            <td className="py-1 px-2.5 flex items-center gap-1.5 text-gray-600">
                              <span>🔗</span> Sales customer
                            </td>
                            <td className="py-1 px-2.5 font-semibold text-gray-900">
                              {customer?.fullName || activeVehicle.salesCustomer}
                            </td>
                            <td className="py-1 px-2.5 text-gray-400">-</td>
                          </tr>
                        )}
                        {activeVehicle.aftersalesCustomer && (
                          <tr className="hover:bg-gray-50/60 text-gray-800">
                            <td className="py-1 px-2.5 flex items-center gap-1.5 text-gray-600">
                              <span>🔗</span> Aftersales customer
                            </td>
                            <td className="py-1 px-2.5 font-semibold">
                              {customer?.fullName || activeVehicle.aftersalesCustomer}
                            </td>
                            <td className="py-1 px-2.5 text-gray-400">-</td>
                          </tr>
                        )}
                        {activeVehicle.driveCustomer && (
                          <tr className="hover:bg-gray-50/60 text-gray-800">
                            <td className="py-1 px-2.5 flex items-center gap-1.5 text-gray-600">
                              <span>🔗</span> Driver customer
                            </td>
                            <td className="py-1 px-2.5 font-semibold">
                              {customer?.fullName || activeVehicle.driveCustomer}
                            </td>
                            <td className="py-1 px-2.5 text-gray-400">-</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* PANEL 4: Customer Detail */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                <div className="bg-gradient-to-r from-blue-50/90 to-gray-50 border-b border-gray-200 px-3 py-1.5 flex items-center justify-between">
                  <span className="font-bold text-blue-950 text-xs tracking-wide">Customer Detail</span>
                </div>
                <div className="p-2 sm:p-2.5 divide-y divide-gray-100">
                  <div className="flex items-center justify-between py-1.5 gap-2">
                    <span className="text-gray-600 font-medium text-[11px] w-28 shrink-0">Title:</span>
                    <span className="font-semibold text-gray-900 text-[11px] text-right flex-1">{customer?.salutation || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 gap-2">
                    <span className="text-gray-600 font-medium text-[11px] w-28 shrink-0">First name:</span>
                    <span className="font-semibold text-gray-900 text-[11px] text-right flex-1">{customer?.firstName || '-'}</span>
                    <span className="text-gray-400 text-[10px] ml-2">Initials: <strong className="text-gray-800">{customer?.initials || '-'}</strong></span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 gap-2">
                    <span className="text-gray-600 font-medium text-[11px] w-28 shrink-0">Middle name:</span>
                    <span className="font-semibold text-gray-900 text-[11px] text-right flex-1">{customer?.middleName || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 gap-2">
                    <span className="text-gray-600 font-medium text-[11px] w-28 shrink-0">Surname:</span>
                    <span className="font-bold text-gray-900 text-[11px] text-right flex-1">{customer?.surname || '-'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* API-Backed Action Pill Buttons (Finance, Insurance, Trade-in) - Shown ONLY if data exists in API */}
        {hasAnyDetailTab && (
          <div className="flex flex-wrap items-center gap-2.5 pt-4 mt-4 border-t border-gray-100 text-xs">
            {hasFinance && (
              <button 
                onClick={() => toggleDetailTab('finance')}
                className={`flex-1 min-w-[120px] p-2 border rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeDetailTab === 'finance'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaCalculator className={activeDetailTab === 'finance' ? 'text-white' : 'text-gray-500'} />
                <span>Finance Details ({financeData.length})</span>
              </button>
            )}

            {hasInsurance && (
              <button 
                onClick={() => toggleDetailTab('insurance')}
                className={`flex-1 min-w-[120px] p-2 border rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeDetailTab === 'insurance'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaShieldAlt className={activeDetailTab === 'insurance' ? 'text-white' : 'text-gray-500'} />
                <span>Insurance Details ({insuranceData.length})</span>
              </button>
            )}

            {hasTradeIn && (
              <button 
                onClick={() => toggleDetailTab('tradein')}
                className={`flex-1 min-w-[120px] p-2 border rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeDetailTab === 'tradein'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaExchangeAlt className={activeDetailTab === 'tradein' ? 'text-white' : 'text-gray-500'} />
                <span>Trade-in History ({tradeInData.length})</span>
              </button>
            )}
          </div>
        )}

        {/* Expandable Live API Details Container */}
        {activeDetailTab && (
          <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-fade-in text-xs">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="font-bold text-gray-900 text-xs flex items-center gap-2">
                {activeDetailTab === 'finance' && <><FaCalculator className="text-blue-600" /> Finance Details Response</>}
                {activeDetailTab === 'insurance' && <><FaShieldAlt className="text-emerald-600" /> Insurance Details Response</>}
                {activeDetailTab === 'tradein' && <><FaExchangeAlt className="text-purple-600" /> Trade-in History Response</>}
              </h4>
              <button 
                onClick={() => setActiveDetailTab(null)}
                className="text-gray-400 hover:text-gray-700 font-bold text-xs p-1"
              >
                <FaTimes />
              </button>
            </div>

            {/* Content Data */}
            <div>
              {/* 1. Finance Details Card */}
              {activeDetailTab === 'finance' && hasFinance && (
                <div className="space-y-3">
                  {financeData.map((fin, idx) => (
                    <div key={fin.enquiryNumber || idx} className="bg-white p-3.5 rounded-lg border border-gray-200 space-y-2">
                      <div className="flex flex-wrap justify-between items-center border-b border-gray-100 pb-2">
                        <span className="font-bold text-gray-900 text-xs">{fin.provider || 'Finance Provider'}</span>
                        {fin.status && (
                          <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                            Status: {fin.status}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-gray-700">
                        {fin.enquiryNumber && <div>Enquiry #: <strong className="font-mono text-blue-600">{fin.enquiryNumber}</strong></div>}
                        {fin.vehicleNumber && <div>Vehicle #: <strong className="font-mono text-gray-900">{fin.vehicleNumber}</strong></div>}
                        {fin.vin && <div>VIN: <strong className="font-mono text-gray-900">{fin.vin}</strong></div>}
                        {fin.vehicle && <div>Vehicle: <strong>{typeof fin.vehicle === 'object' ? (fin.vehicle.description || fin.vehicle.model || fin.vehicle.name || 'Vehicle') : String(fin.vehicle)}</strong></div>}
                        {fin.salesOrderType && <div>Order Type: <strong>{fin.salesOrderType}</strong></div>}
                        {fin.loanAmount !== undefined && fin.loanAmount !== null && fin.loanAmount !== "" && (
                          <div>Loan Amount: <strong className="text-gray-900 font-extrabold">AED {Number(fin.loanAmount).toLocaleString()}</strong></div>
                        )}
                        {fin.monthlyPayment !== undefined && fin.monthlyPayment !== null && fin.monthlyPayment !== "" && (
                          <div>Monthly Payment: <strong className="text-emerald-700 font-extrabold">AED {Number(fin.monthlyPayment).toLocaleString()}</strong></div>
                        )}
                        {fin.numberOfPayments && <div>No. of Payments: <strong>{fin.numberOfPayments}</strong></div>}
                        {fin.tenureMonths && <div>Tenure: <strong>{fin.tenureMonths} Months</strong></div>}
                        {fin.invoiceDate && <div>Invoice Date: <span>{fin.invoiceDate}</span></div>}
                        {fin.startDate && <div>Start Date: <span>{fin.startDate}</span></div>}
                        {fin.expiryDate && <div>Expiry Date: <span>{fin.expiryDate}</span></div>}
                        {fin.financed !== undefined && <div>Financed: <strong>{fin.financed ? 'Yes' : 'No'}</strong></div>}
                        {fin.outstandingAmount && <div>Outstanding: <strong>AED {fin.outstandingAmount}</strong></div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. Insurance Details Card */}
              {activeDetailTab === 'insurance' && hasInsurance && (
                <div className="space-y-3">
                  {insuranceData.map((ins, idx) => (
                    <div key={ins.policyNumber || idx} className="bg-white p-3.5 rounded-lg border border-gray-200 space-y-2">
                      <div className="flex flex-wrap justify-between items-center border-b border-gray-100 pb-2">
                        <span className="font-bold text-gray-900 text-xs">{ins.provider || 'Insurance Provider'}</span>
                        {ins.status && (
                          <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                            {ins.status}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-gray-700">
                        {ins.policyNumber && <div>Policy Number: <strong className="font-mono text-blue-600">{ins.policyNumber}</strong></div>}
                        {ins.contractType && <div>Contract Type: <strong>{ins.contractType}</strong></div>}
                        {ins.startDate && <div>Start Date: <span>{ins.startDate}</span></div>}
                        {ins.expiryDate && <div>Expiry Date: <span>{ins.expiryDate}</span></div>}
                        {ins.premium && <div>Premium: <strong className="text-emerald-700 font-extrabold">{ins.premium}</strong></div>}
                        {ins.vin && <div>VIN: <strong className="font-mono">{ins.vin}</strong></div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. Trade-in History Card */}
              {activeDetailTab === 'tradein' && hasTradeIn && (
                <div className="space-y-3">
                  {tradeInData.map((trd, idx) => {
                    const refNo = trd.reference || trd.tradeInId || `TRD-${idx + 1}`;
                    const vehicleDesc = trd.previousVehicle || (typeof trd.vehicle === 'object' ? (trd.vehicle.description || trd.vehicle.model || trd.vehicle.name) : trd.vehicle) || 'Trade-in Vehicle';
                    const vehNo = trd.vehicleNumber || trd.vehicleNo;
                    const val = trd.value !== undefined && trd.value !== null ? trd.value : trd.appraisedValue;
                    const formattedVal = val !== undefined && val !== null && val !== ''
                      ? (typeof val === 'number' ? `AED ${val.toLocaleString()}` : (String(val).startsWith('AED') ? val : `AED ${Number(val).toLocaleString() || val}`))
                      : null;
                    const status = trd.status || 'Recorded';
                    const isCompleted = String(status).toLowerCase() === 'completed';
                    const isCancelled = String(status).toLowerCase() === 'cancelled';

                    return (
                      <div key={refNo || idx} className="bg-white p-3.5 rounded-lg border border-gray-200 space-y-2.5">
                        <div className="flex flex-wrap justify-between items-center border-b border-gray-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-purple-700 text-xs">
                              Ref #{refNo}
                            </span>
                            {vehNo && (
                              <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                Vehicle #{vehNo}
                              </span>
                            )}
                          </div>
                          <span className={`font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wide ${
                            isCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            isCancelled ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {status}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Previous Vehicle</span>
                          <span className="font-extrabold text-gray-900 text-xs">{vehicleDesc}</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-gray-700 pt-1 border-t border-gray-50">
                          {formattedVal && (
                            <div>
                              <span className="text-gray-400 block text-[10px]">Trade-in Value</span>
                              <strong className="text-emerald-700 font-extrabold">{formattedVal}</strong>
                            </div>
                          )}
                          {trd.tradeInDate && (
                            <div>
                              <span className="text-gray-400 block text-[10px]">Trade Date</span>
                              <span className="font-mono">{trd.tradeInDate}</span>
                            </div>
                          )}
                          {trd.valuationDate && (
                            <div>
                              <span className="text-gray-400 block text-[10px]">Valuation Date</span>
                              <span className="font-mono">{trd.valuationDate}</span>
                            </div>
                          )}
                          {trd.appraisalDate && (
                            <div>
                              <span className="text-gray-400 block text-[10px]">Appraisal Date</span>
                              <span className="font-mono">{trd.appraisalDate}</span>
                            </div>
                          )}
                          {trd.vin && (
                            <div>
                              <span className="text-gray-400 block text-[10px]">VIN</span>
                              <strong className="font-mono text-gray-800">{trd.vin}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 2. Sales Summary Card - Rendered strictly if present in API payload */}
      {hasSalesSummary && (
        <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 text-xs">
          <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-gray-100 mb-3">Sales Summary</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
              <span className="text-gray-400 block text-[10px] font-semibold">Total Leads</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block">{currentSalesSummary.totalLeads ?? 0}</span>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
              <span className="text-gray-400 block text-[10px] font-semibold">Open Leads</span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">{currentSalesSummary.openLeads ?? 0}</span>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
              <span className="text-gray-400 block text-[10px] font-semibold">Won Deals</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">{currentSalesSummary.wonDeals ?? 0}</span>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
              <span className="text-gray-400 block text-[10px] font-semibold">Lost Deals</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">{currentSalesSummary.lostDeals ?? 0}</span>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center col-span-2 sm:col-span-1">
              <span className="text-gray-400 block text-[10px] font-semibold">Last Purchase</span>
              <span className="text-base font-black text-gray-900 mt-2 block">{currentSalesSummary.lastPurchaseDate || activeVehicle?.deliveryDate || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
