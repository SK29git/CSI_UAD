import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaCar, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaShieldAlt,
  FaFileAlt,
  FaHistory,
  FaRedo
} from 'react-icons/fa';

export default function ServiceOverviewView() {
  const { 
    customer,
    vehicles, 
    selectedVin, 
    vehicleDetails, 
    vehiclesLoading, 
    selectVehicleByVin,
    group: contextGroup
  } = useCustomer();

  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || "");
  const customerNumber = customer?.customerNumber || "";

  // 1. Vehicle Summaries by Customer ID State: GET /api/v1/vehicles?group={group}&customerNumber={customerNumber}
  const [customerVehicleList, setCustomerVehicleList] = useState([]);
  const [vehicleListLoading, setVehicleListLoading] = useState(false);

  // 2. Vehicle Summary by Vehicle ID State: GET /api/v1/vehicles/{group}/{vin}
  const [vehicleSummaryData, setVehicleSummaryData] = useState(null);

  // 3. Service Intervals & Contract States
  const [nextServiceData, setNextServiceData] = useState(null);
  const [lastServiceData, setLastServiceData] = useState(null);
  const [warrantyData, setWarrantyData] = useState(null);
  const [contractData, setContractData] = useState(null);
  const [loadingOverviewApis, setLoadingOverviewApis] = useState(false);

  // Combined vehicle list prioritizing the direct API response
  const allVehicles = customerVehicleList.length > 0 ? customerVehicleList : (vehicles || []);
  const currentVehicle = vehicleSummaryData || (allVehicles.find(v => v.vin === selectedVin)) || vehicleDetails || (allVehicles.length > 0 ? allVehicles[0] : null);
  const vin = selectedVin || currentVehicle?.vin || "";

  // Fetch Vehicle Summaries by Customer ID (GET /api/v1/vehicles?group={group}&customerNumber={customerNumber})
  const fetchCustomerVehicleSummaries = async () => {
    if (!customerNumber || !group) return;
    setVehicleListLoading(true);
    try {
      const res = await apiFetch(`/api/v1/vehicles?group=${encodeURIComponent(group)}&customerNumber=${encodeURIComponent(customerNumber)}`);
      let list = [];
      if (res && res.ok && res.data) {
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res.data.vehicles)) {
          list = res.data.vehicles;
        } else if (Array.isArray(res.data.data)) {
          list = res.data.data;
        } else if (typeof res.data === 'object' && (res.data.vin || res.data.chassisNumber)) {
          list = [res.data];
        }
      }
      setCustomerVehicleList(list);

      // If no vehicle is selected yet, automatically select the first vehicle from the customer's fleet
      if (list.length > 0 && !selectedVin) {
        const firstVin = list[0].vin || list[0].chassisNumber;
        if (firstVin) {
          selectVehicleByVin(firstVin);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch customer vehicle summaries:", err);
      setCustomerVehicleList([]);
    } finally {
      setVehicleListLoading(false);
    }
  };

  // Fetch specific Vehicle Summary by VIN + service intervals & contracts
  const fetchOverviewData = async () => {
    if (!vin) return;
    setLoadingOverviewApis(true);

    // Reset data
    setNextServiceData(null);
    setLastServiceData(null);
    setWarrantyData(null);
    setContractData(null);
    
    // A. Vehicle Summary by Vehicle ID (VIN) API: GET /api/v1/vehicles/{group}/{vin}
    apiFetch(`/api/v1/vehicles/${group}/${vin}`).then(res => {
      if (res && res.ok && res.data && typeof res.data === 'object') {
        setVehicleSummaryData(res.data);
      } else {
        setVehicleSummaryData(null);
      }
    }).catch(err => {
      console.warn("Failed to fetch vehicle summary by VIN:", err);
      setVehicleSummaryData(null);
    });

    // B. Next Service Due API: GET /api/v1/vehicles/{group}/{vin}/next-service
    apiFetch(`/api/v1/vehicles/${group}/${vin}/next-service`).then(res => {
      if (res && res.ok && res.data) {
        setNextServiceData(res.data);
      } else {
        setNextServiceData(null);
      }
    }).catch(() => {
      setNextServiceData(null);
    });

    // C. Last Service Details API: GET /api/v1/vehicles/{group}/{vin}/last-service
    apiFetch(`/api/v1/vehicles/${group}/${vin}/last-service`).then(res => {
      if (res && res.ok && res.data) {
        setLastServiceData(res.data);
      } else {
        setLastServiceData(null);
      }
    }).catch(() => {
      setLastServiceData(null);
    });

    // D. Warranty Status API: GET /api/v1/vehicles/{group}/{vin}/warranty
    apiFetch(`/api/v1/vehicles/${group}/${vin}/warranty`).then(res => {
      if (res && res.ok && res.data && typeof res.data === 'object' && Object.keys(res.data).length > 0) {
        setWarrantyData(res.data);
      } else {
        setWarrantyData(null);
      }
    }).catch(() => {
      setWarrantyData(null);
    });

    // E. Service Contract API: GET /api/v1/vehicles/{group}/{vin}/service-contract
    apiFetch(`/api/v1/vehicles/${group}/${vin}/service-contract`).then(res => {
      if (res && res.ok && res.data && typeof res.data === 'object' && Object.keys(res.data).length > 0) {
        setContractData(res.data);
      } else {
        setContractData(null);
      }
    }).catch(() => {
      setContractData(null);
    }).finally(() => {
      setLoadingOverviewApis(false);
    });
  };

  useEffect(() => {
    fetchCustomerVehicleSummaries();
  }, [group, customerNumber]);

  useEffect(() => {
    fetchOverviewData();
  }, [group, vin]);

  const handleRefreshAll = () => {
    fetchCustomerVehicleSummaries();
    fetchOverviewData();
  };

  const isGlobalLoading = (vehiclesLoading || vehicleListLoading) && !currentVehicle;

  if (isGlobalLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-100 flex items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading vehicle summaries for customer...
        </div>
      </div>
    );
  }

  if (!currentVehicle) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-100 text-center text-xs text-gray-500 font-medium">
        No vehicle summaries found for customer #{customerNumber || 'N/A'}.
      </div>
    );
  }

  const registrationNumber = currentVehicle?.registrationNumber || currentVehicle?.plateNumber || currentVehicle?.plate || '';
  const registrationDate = currentVehicle?.registrationDate || '';
  const brand = currentVehicle?.brand || currentVehicle?.make || '';
  const model = currentVehicle?.model || '';
  const variant = currentVehicle?.variant || '';
  const description = currentVehicle?.description || currentVehicle?.vehicle || `${brand} ${model} ${variant}`.trim();
  const modelYear = currentVehicle?.modelYear || currentVehicle?.year || '';
  const fuelType = currentVehicle?.fuelType || '';
  const colour = currentVehicle?.colour || currentVehicle?.color || '';
  const mileageKm = currentVehicle?.mileageKm !== undefined ? currentVehicle.mileageKm : (currentVehicle?.mileage !== undefined ? currentVehicle.mileage : currentVehicle?.odometerKm);
  const deliveryDate = currentVehicle?.deliveryDate || '';
  const stockProgress = currentVehicle?.stockProgress || '';
  const eligibility = currentVehicle?.eligibility || '';
  const batteryId = currentVehicle?.batteryId || currentVehicle?.batteryID || currentVehicle?.battery_id || '';
  const vehicleContracts = currentVehicle?.contracts || currentVehicle?.insuranceContracts || (Array.isArray(currentVehicle?.insurance) ? currentVehicle.insurance : null);

  const isWarrantyActive = warrantyData?.status === 'ACTIVE';
  const isServiceContractActive = contractData?.status === 'ACTIVE';

  // Fallbacks: if nextServiceData or lastServiceData standalone endpoint is empty, use values from Vehicle Summary API
  const nextServiceDate = nextServiceData?.nextServiceDate || currentVehicle?.nextServiceDate || currentVehicle?.nextServiceDue;
  const hasNextService = Boolean(nextServiceDate || (nextServiceData && (nextServiceData.nextServiceOdometerKm !== undefined || nextServiceData.dueMileageKm !== undefined)));

  const lastServiceDate = lastServiceData?.lastServiceDate || currentVehicle?.lastServiceDate;
  const lastServiceOdometer = lastServiceData?.lastServiceOdometerKm !== undefined && lastServiceData?.lastServiceOdometerKm !== null
    ? lastServiceData.lastServiceOdometerKm
    : (lastServiceData?.lastServiceMileageKm !== undefined && lastServiceData?.lastServiceMileageKm !== null
      ? lastServiceData.lastServiceMileageKm
      : (lastServiceData?.mileageKm !== undefined && lastServiceData?.mileageKm !== null
        ? lastServiceData.mileageKm
        : (currentVehicle?.lastServiceOdometerKm !== undefined ? currentVehicle.lastServiceOdometerKm : null)));

  const hasLastService = Boolean(lastServiceDate || lastServiceOdometer !== null || (lastServiceData && (lastServiceData.serviceType || lastServiceData.branch)));

  const hasWarranty = Boolean(warrantyData && typeof warrantyData === 'object' && (warrantyData.status || warrantyData.provider || warrantyData.expiryDate || warrantyData.contractType));
  const hasContract = Boolean(contractData && typeof contractData === 'object' && (contractData.status || contractData.provider || contractData.expiryDate || contractData.contractType));
  const hasInsurance = Boolean(vehicleContracts && (Array.isArray(vehicleContracts) ? vehicleContracts.length > 0 : Object.keys(vehicleContracts).length > 0));

  return (
    <div className="flex flex-col gap-4 text-xs font-sans">
      
      {/* Primary Vehicle Summary Card */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-100 flex flex-col gap-4">
        
        {/* Header & Multi-Vehicle Selector */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-gray-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FaCar className="text-base" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-900 text-base leading-tight">
                  {brand || ''} {description || `${model || ''} ${variant || ''}`.trim()}
                </h2>
                {allVehicles.length > 1 && (
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                    {allVehicles.length} Vehicles in Fleet
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                Keyloop Group: {group} {customerNumber ? `| Customer #${customerNumber}` : ''} {vin ? `| VIN: ${vin}` : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {allVehicles.length > 1 && (
              <div className="flex items-center gap-2 bg-blue-50/60 p-1.5 rounded-lg border border-blue-100">
                <span className="text-[11px] font-bold text-blue-900 uppercase">Select Vehicle:</span>
                <select
                  value={vin}
                  onChange={(e) => selectVehicleByVin(e.target.value)}
                  className="bg-white text-xs font-bold text-gray-900 border border-blue-300 rounded px-2.5 py-1 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
                >
                  {allVehicles.map((v) => {
                    const vVin = v.vin || v.chassisNumber;
                    const vPlate = v.registrationNumber || v.plateNumber || v.plate;
                    const vDesc = v.description || `${v.brand || ''} ${v.model || ''}`.trim() || 'Vehicle';
                    return (
                      <option key={vVin} value={vVin}>
                        {vDesc} {vPlate ? `(${vPlate})` : `(${vVin})`}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
            
            <button 
              onClick={handleRefreshAll}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer transition-colors"
              title="Refresh Vehicle Summaries"
            >
              <FaRedo className={`text-xs ${loadingOverviewApis || vehicleListLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Multi-Vehicle Garage Strip (Rendered when customer owns multiple cars) */}
        {allVehicles.length > 1 && (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar border-b border-gray-100 pb-3">
            <span className="text-[10px] font-extrabold uppercase text-gray-400 shrink-0">Garage ({allVehicles.length}):</span>
            {allVehicles.map((v) => {
              const vVin = v.vin || v.chassisNumber;
              const isSelected = vVin === vin;
              const vPlate = v.registrationNumber || v.plateNumber || v.plate;
              const vTitle = v.description || `${v.brand || ''} ${v.model || ''}`.trim() || 'Vehicle';
              const vOdo = v.mileageKm !== undefined ? v.mileageKm : v.mileage;

              return (
                <button
                  key={vVin}
                  type="button"
                  onClick={() => selectVehicleByVin(vVin)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-left transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaCar className={`text-xs ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                  <div>
                    <span className="font-bold text-xs block leading-tight">{vTitle}</span>
                    <span className={`text-[10px] font-mono block ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                      {vPlate ? `Plate: ${vPlate}` : ''} {vVin ? `• VIN: ${vVin.slice(-6)}` : ''} {vOdo ? `• ${Number(vOdo).toLocaleString()} KM` : ''}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Next & Last Service Banner Grid - Rendered conditionally when backend returns data */}
        {(hasNextService || hasLastService) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Next Service Due Box */}
            {hasNextService && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 p-3.5 rounded-xl border border-blue-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-blue-900 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <FaCalendarAlt className="text-blue-600" /> Next Service Due
                  </span>
                  {nextServiceDate && (
                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-mono">
                      {nextServiceDate}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  {nextServiceData?.nextServiceOdometerKm !== undefined && nextServiceData?.nextServiceOdometerKm !== null && (
                    <div>
                      <span className="text-gray-500 block text-[10px]">Due Odometer:</span>
                      <span className="font-extrabold text-gray-900">
                        {nextServiceData.nextServiceOdometerKm.toLocaleString()} KM
                      </span>
                    </div>
                  )}
                  {nextServiceData?.dueMileageKm !== undefined && nextServiceData?.dueMileageKm !== null && (
                    <div>
                      <span className="text-gray-500 block text-[10px]">Interval Limit:</span>
                      <span className="font-extrabold text-gray-900">
                        {nextServiceData.dueMileageKm.toLocaleString()} KM
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Last Service Details Box */}
            {hasLastService && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50/60 p-3.5 rounded-xl border border-emerald-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-emerald-900 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <FaHistory className="text-emerald-600" /> Last Service Details
                  </span>
                  {lastServiceDate && (
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-mono">
                      {lastServiceDate}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                  {lastServiceOdometer !== null && (
                    <div>
                      <span className="text-gray-500 block text-[10px]">Service Odometer:</span>
                      <span className="font-extrabold text-gray-900">
                        {Number(lastServiceOdometer).toLocaleString()} KM
                      </span>
                    </div>
                  )}
                  {lastServiceData?.serviceType && (
                    <div>
                      <span className="text-gray-500 block text-[10px]">Service Type:</span>
                      <span className="font-bold text-gray-900 truncate block" title={lastServiceData.serviceType}>{lastServiceData.serviceType}</span>
                    </div>
                  )}
                  {lastServiceData?.branch && (
                    <div>
                      <span className="text-gray-500 block text-[10px]">Service Branch:</span>
                      <span className="font-bold text-gray-900 truncate block" title={lastServiceData.branch}>{lastServiceData.branch}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Dynamic Vehicle Specifications Grid (Driven by Vehicle Summary APIs) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-4 text-xs pt-2">
          {vin && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">VIN</span>
              <span className="font-mono font-bold text-gray-900 text-[11px]">{vin}</span>
            </div>
          )}

          {registrationNumber && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Registration Number</span>
              <span className="font-bold text-gray-900">{registrationNumber}</span>
            </div>
          )}

          {registrationDate && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Registration Date</span>
              <span className="font-medium text-gray-800">{registrationDate}</span>
            </div>
          )}

          {(brand || model || variant) && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Brand / Model / Variant</span>
              <span className="font-bold text-gray-900">{brand || ''} {model || ''} ({variant || 'N/A'})</span>
            </div>
          )}

          {description && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Description</span>
              <span className="font-medium text-gray-800">{description}</span>
            </div>
          )}

          {modelYear && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Model Year</span>
              <span className="font-bold text-gray-900">{modelYear}</span>
            </div>
          )}

          {fuelType && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Fuel Type</span>
              <span className="font-semibold text-gray-800">{fuelType}</span>
            </div>
          )}

          {colour && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Colour</span>
              <span className="font-semibold text-gray-800">{colour}</span>
            </div>
          )}

          {mileageKm !== undefined && mileageKm !== null && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Current Mileage</span>
              <span className="font-black text-gray-900 text-sm">
                {Number(mileageKm).toLocaleString()} KM
              </span>
            </div>
          )}

          {deliveryDate && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Delivery Date</span>
              <span className="font-medium text-gray-800">{deliveryDate}</span>
            </div>
          )}

          {stockProgress && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Stock Progress</span>
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block">
                {stockProgress}
              </span>
            </div>
          )}

          {eligibility && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Eligibility</span>
              <span className="font-bold text-emerald-700">{eligibility}</span>
            </div>
          )}

          {batteryId && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Battery ID</span>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block text-[11px]">
                {batteryId}
              </span>
            </div>
          )}
        </div>

        {/* Warranty, Service Contract & Insurance Policy Cards */}
        {(hasWarranty || hasContract || hasInsurance) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-xs">
            
            {/* Warranty Details */}
            {hasWarranty && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
                  <span className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                    <FaShieldAlt className="text-blue-600" /> Warranty Information
                  </span>
                  {warrantyData.status && (
                    <span className={`font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1 ${
                      isWarrantyActive 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {isWarrantyActive ? <FaCheckCircle className="text-[9px]" /> : <FaExclamationCircle className="text-[9px]" />}
                      {warrantyData.status}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-[11px]">
                  {warrantyData.provider && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Provider:</span>
                      <span className="font-semibold text-gray-900 text-right">{warrantyData.provider}</span>
                    </div>
                  )}
                  {warrantyData.contractType && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contract Code:</span>
                      <span className="font-mono font-bold text-gray-800">{warrantyData.contractType}</span>
                    </div>
                  )}
                  {warrantyData.expiryDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Expiry Date:</span>
                      <span className="font-bold text-gray-900">{warrantyData.expiryDate}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Service Contract Details */}
            {hasContract && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
                  <span className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                    <FaFileAlt className="text-purple-600" /> Service Contract Information
                  </span>
                  {contractData.status && (
                    <span className={`font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1 ${
                      isServiceContractActive 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {isServiceContractActive ? <FaCheckCircle className="text-[9px]" /> : <FaExclamationCircle className="text-[9px]" />}
                      {contractData.status}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-[11px]">
                  {contractData.provider && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Provider:</span>
                      <span className="font-semibold text-gray-900 text-right">{contractData.provider}</span>
                    </div>
                  )}
                  {contractData.contractType && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contract Code:</span>
                      <span className="font-mono font-bold text-gray-800">{contractData.contractType}</span>
                    </div>
                  )}
                  {contractData.expiryDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Expiry Date:</span>
                      <span className="font-bold text-gray-900">{contractData.expiryDate}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vehicle Insurance / Policy Contracts from Vehicle Summary API */}
            {hasInsurance && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
                  <span className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                    <FaFileAlt className="text-emerald-600" /> Vehicle Insurance / Policy Contracts
                  </span>
                  <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Active
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  {Array.isArray(vehicleContracts) ? (
                    vehicleContracts.map((c, cIdx) => (
                      <div key={cIdx} className="p-2 bg-white rounded-lg border border-gray-200 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-medium">{c.provider || c.insuranceCompany || 'Policy'}:</span>
                          <span className="font-bold text-gray-900">{c.contractNumber || c.policyNumber || c.number || `Policy #${cIdx+1}`}</span>
                        </div>
                        {c.type && (
                          <div className="flex justify-between text-[10px]">
                            <span className="text-gray-400">Type:</span>
                            <span className="font-mono text-gray-700">{c.type}</span>
                          </div>
                        )}
                        {c.expiryDate && (
                          <div className="flex justify-between text-[10px]">
                            <span className="text-gray-400">Expires:</span>
                            <span className="font-semibold text-gray-800">{c.expiryDate}</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 bg-white rounded border border-gray-200">
                      <span className="font-semibold text-gray-800">{String(vehicleContracts)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
