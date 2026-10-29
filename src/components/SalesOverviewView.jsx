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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 text-base">Vehicle Details</h2>
            {vehicles.length > 0 && (
              <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-2.5 py-0.5 rounded-full border border-emerald-200">
                {selectedIndex === 0 ? 'Primary Vehicle' : `Vehicle ${selectedIndex + 1} of ${vehicles.length}`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Vehicle Selector Dropdown */}
            {vehicles.length > 1 && (
              <div className="flex items-center gap-1.5 bg-blue-50/70 border border-blue-200 px-2 py-1 rounded-lg">
                <FaCar className="text-blue-600 text-xs shrink-0" />
                <label htmlFor="vehicle-select" className="text-[11px] font-bold text-blue-950 shrink-0">
                  Select Vehicle:
                </label>
                <select
                  id="vehicle-select"
                  value={selectedIndex}
                  onChange={(e) => setSelectedIndex(Number(e.target.value))}
                  className="bg-white text-xs font-bold text-gray-800 border border-blue-300 rounded-md px-2.5 py-1 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs max-w-[280px] truncate"
                >
                  {vehicles.map((v, idx) => {
                    const brand = v.brand || 'Vehicle';
                    const model = v.model || v.variant || '';
                    const desc = v.description || `${brand} ${model}`.trim();
                    const reg = v.registrationNumber || v.plateNumber || '';
                    const vinShort = v.vin ? `(..${v.vin.slice(-6)})` : '';
                    const label = [
                      `${idx === 0 ? 'Primary: ' : ''}${desc || brand}`,
                      reg ? `[${reg}]` : '',
                      vinShort
                    ].filter(Boolean).join(' ');

                    return (
                      <option key={v.vin || idx} value={idx}>
                        {label || `Vehicle ${idx + 1}`}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <button 
              onClick={fetchSalesData} 
              className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              title="Refresh Vehicle Data"
            >
              <FaRedo className={`text-xs ${loading ? 'animate-spin' : ''}`} />
            </button>

            {activeVehicle?.vin && (
              <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                <FaCheckCircle className="text-xs" /> VIN Verified
              </span>
            )}
          </div>
        </div>

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
          <div className="w-full">
            {/* Vehicle Specs Grid */}
            <div className="flex flex-col justify-between gap-3">
              <div className="mb-1">
                <h3 className="font-extrabold text-gray-900 text-sm leading-tight flex items-center gap-2">
                  <span>{activeVehicle.description || `${activeVehicle.brand || ''} ${activeVehicle.model || ''}`}</span>
                  {activeVehicle.modelYear && (
                    <span className="text-xs text-gray-500 font-semibold">
                      ({activeVehicle.modelYear})
                    </span>
                  )}
                </h3>
                <span className="text-xs text-gray-500 font-semibold block mt-0.5">
                  {activeVehicle.colour ? `${activeVehicle.colour}${activeVehicle.colourCode ? ` (${activeVehicle.colourCode})` : ''}` : ''}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">VIN Number</span>
                  <span className="font-mono font-bold text-gray-800 text-[11px]">{activeVehicle.vin || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Registration No.</span>
                  <span className="font-bold text-gray-900">{activeVehicle.registrationNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Mileage</span>
                  <span className="font-black text-gray-900 text-sm">
                    {typeof activeVehicle.mileageKm === 'number' ? `${activeVehicle.mileageKm.toLocaleString()} KM` : 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px]">Fuel Type</span>
                  <span className="font-semibold text-gray-800">{activeVehicle.fuelType || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Variant / Model</span>
                  <span className="font-semibold text-gray-800">{activeVehicle.variant || activeVehicle.model || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Stock Progress</span>
                  <span className="font-bold text-blue-600">{activeVehicle.stockProgress || 'N/A'}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px]">Color</span>
                  <span className="font-semibold text-gray-800">{activeVehicle.colour || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">First Registration</span>
                  <span className="font-semibold text-gray-800">{activeVehicle.registrationDate || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Next Service Date</span>
                  <span className="text-emerald-600 font-bold text-[11px]">{activeVehicle.nextServiceDate || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Next Service Odometer</span>
                  <span className="text-emerald-600 font-bold text-[11px]">
                    {activeVehicle.nextServiceOdometerKm !== undefined && activeVehicle.nextServiceOdometerKm !== null ? `${activeVehicle.nextServiceOdometerKm.toLocaleString()} KM` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Purchase Enquiry No.</span>
                  <span className="font-mono font-bold text-gray-900">{activeVehicle.purchaseEnquiryNumber || 'N/A'}</span>
                </div>

                {Array.isArray(activeVehicle.linkedVia) && activeVehicle.linkedVia.length > 0 && (
                  <div className="col-span-2 sm:col-span-4 mt-1 pt-1 border-t border-gray-100">
                    <span className="text-gray-400 block text-[10px] mb-1">Linked Via</span>
                    <div className="flex flex-wrap gap-1">
                      {activeVehicle.linkedVia.map((link, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 font-bold text-[9px] px-2 py-0.5 rounded border border-blue-200">
                          {link}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
                  {tradeInData.map((trd, idx) => (
                    <div key={trd.tradeInId || idx} className="bg-white p-3.5 rounded-lg border border-gray-200 space-y-2">
                      <div className="flex flex-wrap justify-between items-center border-b border-gray-100 pb-2">
                        <span className="font-mono font-bold text-purple-700 text-xs">{trd.tradeInId || `TRD-${idx+1}`}</span>
                        {trd.status && (
                          <span className="bg-blue-100 text-blue-800 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                            {trd.status}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-gray-700">
                        {trd.vehicle && <div>Evaluated Vehicle: <strong>{typeof trd.vehicle === 'object' ? (trd.vehicle.description || trd.vehicle.model || trd.vehicle.name || 'Vehicle') : String(trd.vehicle)}</strong></div>}
                        {trd.vin && <div>VIN: <strong className="font-mono">{trd.vin}</strong></div>}
                        {trd.appraisedValue && <div>Appraised Value: <strong className="text-emerald-700 font-extrabold">{trd.appraisedValue}</strong></div>}
                        {trd.tradeInDate && <div>Trade Date: <span>{trd.tradeInDate}</span></div>}
                      </div>
                    </div>
                  ))}
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
