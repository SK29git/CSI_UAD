import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaCar, 
  FaCalendarAlt, 
  FaTachometerAlt, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaShieldAlt,
  FaFileAlt,
  FaWrench,
  FaHistory,
  FaClock,
  FaRedo
} from 'react-icons/fa';

export default function ServiceOverviewView() {
  const { 
    customer,
    vehicles, 
    selectedVin, 
    vehicleDetails, 
    vehiclesLoading, 
    selectVehicleByVin 
  } = useCustomer();

  const group = customer?.keyloopGroup || "BMW";
  const customerNumber = customer?.customerNumber || "80496";
  const currentVehicle = vehicleDetails || (vehicles && vehicles.length > 0 ? vehicles[0] : null);
  const vin = selectedVin || currentVehicle?.vin || "WBA31HC04SFT82888";

  const [nextServiceData, setNextServiceData] = useState(null);
  const [lastServiceData, setLastServiceData] = useState(null);
  const [warrantyData, setWarrantyData] = useState(null);
  const [contractData, setContractData] = useState(null);
  const [loadingOverviewApis, setLoadingOverviewApis] = useState(false);

  const fetchOverviewData = async () => {
    if (!vin) return;
    setLoadingOverviewApis(true);
    
    // 1. Next Service Due API
    apiFetch(`/api/v1/vehicles/${group}/${vin}/next-service`).then(res => {
      if (res && res.ok && res.data) {
        setNextServiceData(res.data);
      } else {
        setNextServiceData({
          nextServiceDate: currentVehicle?.nextServiceDate || "2025-02-20",
          nextServiceOdometerKm: currentVehicle?.nextServiceOdometerKm || 1000,
          dueMileageKm: 15000,
          remainingDays: null,
          remainingKm: null
        });
      }
    }).catch(() => {
      setNextServiceData({
        nextServiceDate: currentVehicle?.nextServiceDate || "2025-02-20",
        nextServiceOdometerKm: currentVehicle?.nextServiceOdometerKm || 1000
      });
    });

    // 2. Last Service Details API
    apiFetch(`/api/v1/vehicles/${group}/${vin}/last-service`).then(res => {
      if (res && res.ok && res.data) {
        setLastServiceData(res.data);
      } else {
        setLastServiceData({
          lastServiceDate: "2024-12-19",
          lastServiceMileageKm: 2,
          branch: "Dubai Main Workshop",
          serviceType: "Vehicle Handover & Inspection",
          source: "WORKSHOP_BOOKING"
        });
      }
    }).catch(() => {
      setLastServiceData({
        lastServiceDate: "2024-12-19",
        lastServiceMileageKm: 2,
        branch: "Dubai Main Workshop",
        serviceType: "Vehicle Inspection"
      });
    });

    // 3. Warranty Status API
    apiFetch(`/api/v1/vehicles/${group}/${vin}/warranty`).then(res => {
      if (res && res.ok && res.data) {
        setWarrantyData(res.data);
      } else {
        setWarrantyData(currentVehicle?.warranty || {
          status: "ACTIVE",
          provider: "BMW Extended Warranty 3y/200,000 km",
          contractType: "A7CG",
          expiryDate: "2027-12-18"
        });
      }
    }).catch(() => {
      setWarrantyData(currentVehicle?.warranty || { status: "ACTIVE" });
    });

    // 4. Service Contract API
    apiFetch(`/api/v1/vehicles/${group}/${vin}/service-contract`).then(res => {
      if (res && res.ok && res.data) {
        setContractData(res.data);
      } else {
        setContractData(currentVehicle?.serviceContract || {
          status: "EXPIRED",
          provider: "BMW Service Inclusive",
          contractType: "SERVICEINCL",
          expiryDate: "2024-07-10"
        });
      }
    }).catch(() => {
      setContractData(currentVehicle?.serviceContract || { status: "EXPIRED" });
    }).finally(() => {
      setLoadingOverviewApis(false);
    });
  };

  useEffect(() => {
    fetchOverviewData();
  }, [group, vin]);

  if (vehiclesLoading && !currentVehicle) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-100 flex items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading vehicle service overview...
        </div>
      </div>
    );
  }

  if (!currentVehicle) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-100 text-center">
        <p className="text-gray-500 font-medium">No vehicle information found for this customer.</p>
      </div>
    );
  }

  const {
    registrationNumber,
    registrationDate,
    brand,
    model,
    variant,
    description,
    modelYear,
    fuelType,
    colour,
    mileageKm,
    deliveryDate,
    stockProgress,
    eligibility,
    offer
  } = currentVehicle;

  const activeWarranty = warrantyData || currentVehicle.warranty;
  const activeContract = contractData || currentVehicle.serviceContract;
  const isWarrantyActive = activeWarranty?.status === 'ACTIVE';
  const isServiceContractActive = activeContract?.status === 'ACTIVE';

  return (
    <div className="flex flex-col gap-4 text-xs">
      
      {/* Primary Vehicle Summary Card */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-100 flex flex-col gap-4">
        
        {/* Header & Multi-Vehicle Selector */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-gray-100 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FaCar className="text-base" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base leading-tight">
                {brand} {description || `${model} ${variant}`}
              </h2>
              <span className="text-[10px] text-gray-400 font-mono">
                Keyloop Group: {group} | Customer #{customerNumber} | VIN: {vin}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {vehicles && vehicles.length > 1 && (
              <div className="flex items-center gap-2 bg-blue-50/60 p-1.5 rounded-lg border border-blue-100">
                <span className="text-[11px] font-bold text-blue-900 uppercase">Select Vehicle:</span>
                <select
                  value={vin}
                  onChange={(e) => selectVehicleByVin(e.target.value)}
                  className="bg-white text-xs font-bold text-gray-900 border border-blue-300 rounded px-2.5 py-1 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
                >
                  {vehicles.map((v) => (
                    <option key={v.vin} value={v.vin}>
                      {v.description || `${v.brand} ${v.model}`} ({v.vin})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <button 
              onClick={fetchOverviewData}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer"
              title="Refresh Vehicle Overview"
            >
              <FaRedo className={`text-xs ${loadingOverviewApis ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Next & Last Service Banner Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Next Service Due Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 p-3.5 rounded-xl border border-blue-100 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-blue-900 font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <FaCalendarAlt className="text-blue-600" /> Next Service Due
              </span>
              <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-mono">
                {nextServiceData?.nextServiceDate || currentVehicle.nextServiceDate || 'N/A'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-gray-500 block text-[10px]">Due Odometer:</span>
                <span className="font-extrabold text-gray-900">
                  {nextServiceData?.nextServiceOdometerKm ? `${nextServiceData.nextServiceOdometerKm.toLocaleString()} KM` : '1,000 KM'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Interval Limit:</span>
                <span className="font-extrabold text-gray-900">
                  {nextServiceData?.dueMileageKm ? `${nextServiceData.dueMileageKm.toLocaleString()} KM` : '15,000 KM'}
                </span>
              </div>
            </div>
          </div>

          {/* Last Service Details Box */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50/60 p-3.5 rounded-xl border border-emerald-100 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-emerald-900 font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <FaHistory className="text-emerald-600" /> Last Service Details
              </span>
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-mono">
                {lastServiceData?.lastServiceDate || '2024-12-19'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-gray-500 block text-[10px]">Service Type:</span>
                <span className="font-bold text-gray-900 truncate block">{lastServiceData?.serviceType || 'Inspection'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Service Branch:</span>
                <span className="font-bold text-gray-900 truncate block">{lastServiceData?.branch || 'Dubai Main'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic Vehicle Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-4 text-xs pt-2">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">VIN</span>
            <span className="font-mono font-bold text-gray-900 text-[11px]">{vin || 'N/A'}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Registration Number</span>
            <span className="font-bold text-gray-900">{registrationNumber || 'N/A'}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Registration Date</span>
            <span className="font-medium text-gray-800">{registrationDate || 'N/A'}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Brand / Model / Variant</span>
            <span className="font-bold text-gray-900">{brand || 'N/A'} {model || ''} ({variant || 'N/A'})</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Description</span>
            <span className="font-medium text-gray-800">{description || 'N/A'}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Model Year</span>
            <span className="font-bold text-gray-900">{modelYear || 'N/A'}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Fuel Type</span>
            <span className="font-semibold text-gray-800">{fuelType || 'N/A'}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Colour</span>
            <span className="font-semibold text-gray-800">{colour || 'N/A'}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Current Mileage</span>
            <span className="font-black text-gray-900 text-sm">
              {mileageKm !== undefined && mileageKm !== null ? `${mileageKm.toLocaleString()} KM` : 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Delivery Date</span>
            <span className="font-medium text-gray-800">{deliveryDate || 'N/A'}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Stock Progress</span>
            <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block">
              {stockProgress || 'N/A'}
            </span>
          </div>

          {eligibility && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Eligibility</span>
              <span className="font-bold text-emerald-700">{eligibility}</span>
            </div>
          )}
        </div>

        {/* Warranty & Service Contract Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
          
          {/* Warranty Details */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
              <span className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                <FaShieldAlt className="text-blue-600" /> Warranty Information
              </span>
              {activeWarranty?.status && (
                <span className={`font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1 ${
                  isWarrantyActive 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {isWarrantyActive ? <FaCheckCircle className="text-[9px]" /> : <FaExclamationCircle className="text-[9px]" />}
                  {activeWarranty.status}
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Provider:</span>
                <span className="font-semibold text-gray-900 text-right">{activeWarranty?.provider || 'BMW Extended Warranty 3y/200,000 km'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contract Code:</span>
                <span className="font-mono font-bold text-gray-800">{activeWarranty?.contractType || 'A7CG'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Expiry Date:</span>
                <span className="font-bold text-gray-900">{activeWarranty?.expiryDate || '2027-12-18'}</span>
              </div>
            </div>
          </div>

          {/* Service Contract Details */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
              <span className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                <FaFileAlt className="text-purple-600" /> Service Contract Information
              </span>
              {activeContract?.status && (
                <span className={`font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1 ${
                  isServiceContractActive 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {isServiceContractActive ? <FaCheckCircle className="text-[9px]" /> : <FaExclamationCircle className="text-[9px]" />}
                  {activeContract.status}
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Provider:</span>
                <span className="font-semibold text-gray-900 text-right">{activeContract?.provider || 'BMW Service Inclusive'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contract Code:</span>
                <span className="font-mono font-bold text-gray-800">{activeContract?.contractType || 'SERVICEINCL'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Expiry Date:</span>
                <span className="font-bold text-gray-900">{activeContract?.expiryDate || '2024-07-10'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
