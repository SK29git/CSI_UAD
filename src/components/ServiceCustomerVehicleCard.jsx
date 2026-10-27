import React, { useState } from 'react';
import { useCustomer } from '../context/CustomerContext';
import VehicleOwnershipTransferModal from './VehicleOwnershipTransferModal';
import { 
  FaPhoneAlt, 
  FaWhatsapp, 
  FaEnvelope, 
  FaCommentAlt, 
  FaComments, 
  FaEllipsisH, 
  FaGlobe, 
  FaMapMarkerAlt,
  FaCheckCircle,
  FaEdit,
  FaCar,
  FaExternalLinkAlt,
  FaChevronRight,
  FaChevronLeft,
  FaUser,
  FaExchangeAlt
} from 'react-icons/fa';

export default function ServiceCustomerVehicleCard({ isCollapsed = false, onToggleCollapse }) {
  const { 
    customer,
    customerList,
    selectedIndex,
    selectCustomer, 
    getFormattedName, 
    getFormattedLocation, 
    getLoyaltyTier,
    getFormattedDate,
    getBranchName,
    getConsentsDisplay,
    vehicles,
    selectedVin,
    vehicleDetails,
    selectVehicleByVin,
    verificationStatus,
    openVerificationModal,
    tradeInHistory,
    group: contextGroup
  } = useCustomer();

  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || '');
  const customerName = getFormattedName();
  const loyaltyTier = getLoyaltyTier();
  const locationStr = getFormattedLocation();
  const currentVehicle = vehicleDetails || (vehicles && vehicles.length > 0 ? vehicles[0] : null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Dynamic Trade-in data strictly from API response (if present)
  const hasTradeInApi = Array.isArray(tradeInHistory) && tradeInHistory.length > 0;
  const activeTradeIn = hasTradeInApi ? tradeInHistory[0] : (currentVehicle?.tradeIn || currentVehicle?.tradeInEligibility ? currentVehicle : null);

  // Dynamic Verification data strictly from API response (if present)
  const hasVerificationApi = Boolean(
    verificationStatus && 
    typeof verificationStatus === 'object' && 
    (verificationStatus.status || verificationStatus.lastVerifiedOn || verificationStatus.lastVerifiedBy || verificationStatus.verifiedBy)
  );

  if (isCollapsed) {
    return (
      <div 
        onClick={onToggleCollapse}
        className="w-14 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-300 p-2 flex flex-col items-center gap-3 cursor-pointer hover:border-blue-500 transition-all duration-300 group py-4 select-none min-h-[300px]"
        title="Click to expand Customer & Vehicle Details"
      >
        <button
          onClick={(e) => { e.stopPropagation(); onToggleCollapse && onToggleCollapse(); }}
          className="w-9 h-9 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center transition-colors shadow-2xs"
          title="Expand Customer & Vehicle Details"
        >
          <FaChevronRight className="text-sm" />
        </button>

        <div className="w-7 h-[1px] bg-gray-200 my-1" />

        {/* Customer Initial or Brand Avatar */}
        <div 
          className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-xs"
          title={customerName ? `Customer: ${customerName}` : 'Customer & Vehicle'}
        >
          {customerName && customerName !== 'Customer' ? customerName.charAt(0).toUpperCase() : <FaUser className="text-xs text-slate-500" />}
        </div>

        {/* Vertical Panel Title */}
        <div className="flex-1 flex items-center justify-center py-6 select-none">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest [writing-mode:vertical-lr] rotate-180 group-hover:text-blue-600 transition-colors">
            Customer & Vehicle
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[310px] xl:w-[330px] flex-shrink-0 flex flex-col gap-4 transition-all duration-300">
      
      {/* 1. Customer Details 360 Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden text-xs">
        {/* Card Header Bar */}
        <div className="bg-slate-100/90 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-gray-900 text-sm">Customer Details</span>
            <span className="bg-blue-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded shadow-2xs">
              360°
            </span>
          </div>
          <div className="flex items-center gap-1">
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="w-7 h-7 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                title="Collapse Left Panel"
              >
                <FaChevronLeft className="text-xs" />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3 bg-slate-50/40">
          {/* Multi-Customer Account Selector Dropdown */}
          {customerList && customerList.length > 1 && (
            <div className="p-2.5 bg-blue-50/90 border border-blue-300 rounded-lg text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider">
                  Select Account ({customerList.length} Found)
                </span>
                <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded">
                  Active: #{customer?.customerNumber || customer?.id || ''}
                </span>
              </div>
              <select
                value={selectedIndex}
                onChange={(e) => selectCustomer(Number(e.target.value))}
                className="w-full p-1.5 bg-white border border-blue-300 rounded font-bold text-gray-900 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs text-xs"
              >
                {customerList.map((item, idx) => (
                  <option key={item?.customerNumber || idx} value={idx}>
                    {item?.fullName || `${item?.firstName || ''} ${item?.surname || ''}`.trim() || 'Customer'} (Cust ID: {item?.customerNumber})
                  </option>
                ))}
              </select>
            </div>
          )}

          {!customer ? (
            <div className="py-4 flex flex-col items-center justify-center gap-2 text-gray-500 text-xs text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                <FaUser className="text-base" />
              </div>
              <span className="font-bold text-gray-800 text-sm">No Customer Profile</span>
              <span className="text-[11px] text-gray-400">Search with a valid phone or customer ID</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-extrabold text-gray-900 text-base leading-tight truncate">{customerName}</h3>
                  {loyaltyTier && loyaltyTier !== 'N/A' && (
                    <span className="bg-purple-700 text-white text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider shadow-2xs">
                      {loyaltyTier}
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-gray-700">
                  <div className="flex items-center gap-2">
                    <FaPhoneAlt className="text-gray-400 text-[10px]" />
                    <span className="font-semibold">{customer?.mobile || customer?.mobileRaw || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-400 text-[10px]" />
                    <span className="truncate max-w-[190px] font-semibold">{customer?.email || 'N/A'}</span>
                  </div>
                  {customer?.language && (
                    <div className="flex items-center gap-2">
                      <FaGlobe className="text-gray-400 text-[10px]" />
                      <span className="font-semibold">{customer?.language}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-400 text-[10px]" />
                    <span className="truncate max-w-[190px] font-semibold">{locationStr}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Verification Footer (Only rendered when verification API returns data) */}
          {hasVerificationApi && (
            <div className="pt-3 border-t border-gray-200 text-[11px] space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-semibold">Verification Status</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    <FaCheckCircle className="text-[10px]" /> {verificationStatus.status || 'Verified'}
                  </span>
                  <button
                    type="button"
                    onClick={() => openVerificationModal && openVerificationModal()}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                    title="Customer Data Verification (RPA Intake)"
                  >
                    Verify
                  </button>
                </div>
              </div>
              {verificationStatus.lastVerifiedOn && (
                <div className="flex justify-between text-gray-600">
                  <span>Last Verified On</span>
                  <span className="font-bold text-gray-900">{verificationStatus.lastVerifiedOn}</span>
                </div>
              )}
              {(verificationStatus.lastVerifiedBy || verificationStatus.verifiedBy) && (
                <div className="flex justify-between text-gray-600">
                  <span>Last Verified By</span>
                  <span className="font-bold text-gray-900">{verificationStatus.lastVerifiedBy || verificationStatus.verifiedBy}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Customer Key Meta Data Card */}
      {customer && (
        <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden text-xs">
          <div className="p-4 bg-slate-50/40">
            <div className="grid grid-cols-2 gap-y-3 gap-x-2">
              <div>
                <span className="text-gray-500 block text-[11px] font-semibold">Customer Since</span>
                <span className="font-extrabold text-gray-900">{getFormattedDate ? getFormattedDate(customer?.customerSince) : (customer?.customerSince || 'N/A')}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px] font-semibold">Customer ID</span>
                <span className="font-extrabold text-gray-900">{customer?.customerNumber || customer?.id || 'N/A'}</span>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px] font-semibold">Group / Brand</span>
                <span className="font-extrabold text-gray-900">{customer?.keyloopGroup || ""}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px] font-semibold">Last Updated</span>
                <span className="font-extrabold text-gray-900">{getFormattedDate ? getFormattedDate(customer?.lastUpdated) : (customer?.lastUpdated || 'N/A')}</span>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px] font-semibold">Loyalty Tier</span>
                <span className="font-extrabold text-gray-900">{loyaltyTier}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px] font-semibold">Nationality</span>
                <span className="font-extrabold text-gray-900">{customer?.nationality || 'N/A'}</span>
              </div>

              <div className="col-span-2 pt-2 border-t border-gray-200">
                <span className="text-gray-500 block text-[11px] font-semibold">Branch Code / Preferred</span>
                <span className="font-extrabold text-blue-700">{getBranchName ? getBranchName() : 'N/A'}</span>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px] font-semibold">Do Not Contact</span>
                <span className={`font-extrabold ${customer?.doNotContact ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {customer?.doNotContact ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px] font-semibold">Consents</span>
                <span className="font-bold text-gray-800">{getConsentsDisplay ? getConsentsDisplay() : 'None'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Vehicle Summary Card */}
      {currentVehicle && (
        <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden text-xs">
          <div className="bg-slate-100/90 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h4 className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
              <FaCar className="text-blue-600" /> Vehicle Summary
            </h4>
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(true)}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 transition-colors shadow-2xs cursor-pointer"
                title="Transfer / Link Vehicle Ownership to Existing or New Customer"
              >
                <FaExchangeAlt className="text-[9px]" />
                <span>Transfer</span>
              </button>
              {vehicles && vehicles.length > 1 && (
                <select
                  value={selectedVin || currentVehicle.vin}
                  onChange={(e) => selectVehicleByVin(e.target.value)}
                  className="bg-blue-600 text-white text-[10px] font-extrabold rounded px-2 py-1 focus:outline-none cursor-pointer shadow-2xs"
                >
                  {vehicles.map((v) => (
                    <option key={v.vin} value={v.vin}>
                      {v.description || `${v.brand || ''} ${v.model || ''}`}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50/40 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-900 text-white font-extrabold flex items-center justify-center text-xs shadow-xs uppercase">
                {currentVehicle.brand || group || ''}
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="font-extrabold text-gray-900 text-sm leading-tight truncate">
                  {currentVehicle.brand || ''} {currentVehicle.description || `${currentVehicle.model || ''} ${currentVehicle.variant || ''}`.trim()}
                </h5>
                {currentVehicle.vin && (
                  <span className="text-[10px] text-gray-500 font-mono font-bold block truncate">
                    VIN: {currentVehicle.vin}
                  </span>
                )}
                {(currentVehicle.modelYear || currentVehicle.colour) && (
                  <span className="text-[10px] text-gray-600 font-semibold">
                    {currentVehicle.modelYear ? `Year: ${currentVehicle.modelYear}` : ''} {currentVehicle.modelYear && currentVehicle.colour ? '| ' : ''} {currentVehicle.colour ? `Color: ${currentVehicle.colour}` : ''}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-gray-200">
              {currentVehicle.mileageKm !== undefined && currentVehicle.mileageKm !== null && (
                <div>
                  <span className="text-gray-500 block text-[10px] font-semibold">Mileage</span>
                  <span className="font-extrabold text-gray-900 text-sm">
                    {currentVehicle.mileageKm.toLocaleString()} KM
                  </span>
                </div>
              )}

              {currentVehicle.warranty?.status && (
                <div>
                  <span className="text-gray-500 block text-[10px] font-semibold">Warranty Status</span>
                  <span className={`font-extrabold text-xs ${currentVehicle.warranty?.status === 'ACTIVE' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {currentVehicle.warranty.status}
                  </span>
                </div>
              )}

              {currentVehicle.warranty?.expiryDate && (
                <div>
                  <span className="text-gray-500 block text-[10px] font-semibold">Warranty Expiry</span>
                  <span className="font-bold text-gray-900">
                    {currentVehicle.warranty.expiryDate}
                  </span>
                </div>
              )}

              {(currentVehicle.serviceContract?.provider || currentVehicle.serviceContract?.status) && (
                <div>
                  <span className="text-gray-500 block text-[10px] font-semibold">Service Contract</span>
                  <span className="font-extrabold text-gray-900">
                    {currentVehicle.serviceContract.provider || currentVehicle.serviceContract.status}
                  </span>
                </div>
              )}

              {(currentVehicle.nextServiceDate || currentVehicle.nextServiceOdometerKm !== undefined) && (
                <div className="col-span-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                  <div>
                    <span className="text-gray-500 block text-[10px] font-semibold">Next Service Due</span>
                    <span className="font-extrabold text-gray-900 text-xs">
                      {currentVehicle.nextServiceDate || ''} {currentVehicle.nextServiceOdometerKm !== undefined && currentVehicle.nextServiceOdometerKm !== null ? `(${currentVehicle.nextServiceOdometerKm.toLocaleString()} KM)` : ''}
                    </span>
                  </div>
                  {currentVehicle.purchaseEnquiryNumber && (
                    <div className="text-right">
                      <span className="text-gray-500 block text-[10px] font-semibold">Enquiry #</span>
                      <span className="font-mono font-extrabold text-blue-600 text-xs">{currentVehicle.purchaseEnquiryNumber}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Trade-in Eligibility Card (Rendered strictly when API returns trade-in data) */}
      {activeTradeIn && (
        <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden text-xs">
          <div className="bg-slate-100/90 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <span className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
              <FaCar className="text-blue-600" /> Trade-in Eligibility
            </span>
            <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
              <FaCheckCircle className="text-[9px]" /> {activeTradeIn.status || 'Eligible'}
            </span>
          </div>

          <div className="p-4 bg-slate-50/40 space-y-2.5">
            {(activeTradeIn.appraisedValue || activeTradeIn.estimatedValue) && (
              <div className="flex justify-between items-baseline">
                <span className="text-gray-600 font-semibold">Estimated Value</span>
                <span className="font-black text-gray-900 text-sm">{activeTradeIn.appraisedValue || activeTradeIn.estimatedValue}</span>
              </div>
            )}

            {(activeTradeIn.expiryDate || activeTradeIn.tradeInDate) && (
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-500 font-semibold">Eligibility Expires On</span>
                <span className="font-bold text-gray-800">{activeTradeIn.expiryDate || activeTradeIn.tradeInDate}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vehicle Ownership Transfer / Link Modal */}
      <VehicleOwnershipTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        initialVin={currentVehicle?.vin || selectedVin || ''}
        initialGroup={group}
      />

    </div>
  );
}
