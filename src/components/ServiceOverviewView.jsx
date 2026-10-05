import React from 'react';
import { useCustomer } from '../context/CustomerContext';
import { 
  FaCar, 
  FaCalendarAlt, 
  FaTachometerAlt, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaShieldAlt,
  FaFileAlt,
  FaInfoCircle,
  FaWrench,
  FaTag
} from 'react-icons/fa';

export default function ServiceOverviewView() {
  const { 
    vehicles, 
    selectedVin, 
    vehicleDetails, 
    vehiclesLoading, 
    selectVehicleByVin 
  } = useCustomer();

  const currentVehicle = vehicleDetails || (vehicles && vehicles.length > 0 ? vehicles[0] : null);

  if (vehiclesLoading && !currentVehicle) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-100 flex items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading vehicle details...
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
    keyloopGroup,
    vin,
    customerNumber,
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
    nextServiceDate,
    nextServiceOdometerKm,
    warranty,
    serviceContract,
    eligibility,
    offer,
    serviceType,
    package: servicePackage,
    price
  } = currentVehicle;

  const isWarrantyActive = warranty?.status === 'ACTIVE';
  const isServiceContractActive = serviceContract?.status === 'ACTIVE';

  return (
    <div className="flex flex-col gap-4">
      
      {/* 1. Primary Vehicle Summary Card */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-100">
        
        {/* Header & Multi-Vehicle Selector */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-gray-100 mb-4 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FaCar className="text-base" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base leading-tight">
                {brand} {description || `${model} ${variant}`}
              </h2>
              <span className="text-[10px] text-gray-400 font-mono">
                Keyloop Group: {keyloopGroup || 'BMW'} | Customer #{customerNumber || 'N/A'}
              </span>
            </div>
          </div>

          {vehicles && vehicles.length > 1 && (
            <div className="flex items-center gap-2 bg-blue-50/60 p-1.5 rounded-lg border border-blue-100">
              <span className="text-[11px] font-bold text-blue-900 uppercase">Select Vehicle:</span>
              <select
                value={selectedVin || vin}
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
        </div>

        {/* Dynamic Vehicle Specifications Grid (Only fields from API response) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-4 text-xs mb-5">
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
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Mileage</span>
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

          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Next Service Date</span>
            <span className="font-bold text-gray-900">{nextServiceDate || 'N/A'}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Next Service Odometer</span>
            <span className="font-bold text-gray-900">
              {nextServiceOdometerKm !== undefined && nextServiceOdometerKm !== null ? `${nextServiceOdometerKm.toLocaleString()} KM` : 'N/A'}
            </span>
          </div>

          {eligibility && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Eligibility</span>
              <span className="font-bold text-emerald-700">{eligibility}</span>
            </div>
          )}

          {offer && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Offer</span>
              <span className="font-bold text-purple-700">{offer}</span>
            </div>
          )}
        </div>

        {/* 2. Warranty & Service Contract Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
          
          {/* Warranty Details */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
              <span className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                <FaShieldAlt className="text-blue-600" /> Warranty Information
              </span>
              {warranty?.status && (
                <span className={`font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1 ${
                  isWarrantyActive 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {isWarrantyActive ? <FaCheckCircle className="text-[9px]" /> : <FaExclamationCircle className="text-[9px]" />}
                  {warranty.status}
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Provider:</span>
                <span className="font-semibold text-gray-900 text-right">{warranty?.provider || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contract Type:</span>
                <span className="font-mono font-bold text-gray-800">{warranty?.contractType || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Expiry Date:</span>
                <span className="font-bold text-gray-900">{warranty?.expiryDate || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Service Contract Details */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
              <span className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                <FaFileAlt className="text-purple-600" /> Service Contract Information
              </span>
              {serviceContract?.status && (
                <span className={`font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1 ${
                  isServiceContractActive 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {isServiceContractActive ? <FaCheckCircle className="text-[9px]" /> : <FaExclamationCircle className="text-[9px]" />}
                  {serviceContract.status}
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Provider:</span>
                <span className="font-semibold text-gray-900 text-right">{serviceContract?.provider || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contract Type:</span>
                <span className="font-mono font-bold text-gray-800">{serviceContract?.contractType || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Expiry Date:</span>
                <span className="font-bold text-gray-900">{serviceContract?.expiryDate || 'N/A'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
