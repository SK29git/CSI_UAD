import React from 'react';
import { useCustomer } from '../context/CustomerContext';
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
  FaChevronLeft
} from 'react-icons/fa';

export default function ServiceCustomerVehicleCard({ isCollapsed = false, onToggleCollapse }) {
  const { 
    customer,
    customerList,
    selectedIndex,
    selectCustomer, 
    getFormattedName, 
    getFormattedLocation, 
    getLoyaltyTier 
  } = useCustomer();

  const customerName = getFormattedName();
  const loyaltyTier = getLoyaltyTier();
  const locationStr = getFormattedLocation();

  if (isCollapsed) {
    return (
      <div 
        onClick={onToggleCollapse}
        className="w-14 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex flex-col items-center gap-4 cursor-pointer hover:border-blue-300 transition-all duration-300 group py-4"
        title="Click to expand Customer & Vehicle Details"
      >
        {/* Expand Toggle Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleCollapse && onToggleCollapse(); }}
          className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
          title="Expand Left Panel"
        >
          <FaChevronRight className="text-sm" />
        </button>

        <div className="w-full h-[1px] bg-gray-100 my-1" />

        {/* BMW Badge Icon */}
        <div className="w-8 h-8 rounded-lg bg-gray-900 text-white font-bold flex items-center justify-center text-[10px] shadow-xs" title="BMW X5 xDrive40i">
          BMW
        </div>

        {/* Verified Badge */}
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center" title="Verified Customer">
          <FaCheckCircle className="text-xs" />
        </div>

        {/* Trade-in Icon */}
        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center" title="Trade-in Eligible">
          <FaCar className="text-xs" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[310px] xl:w-[330px] flex-shrink-0 flex flex-col gap-3.5 transition-all duration-300">
      
      {/* 1. Customer Details 360 Card */}
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 text-xs relative">
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-900 text-sm">Customer Details</span>
            <span className="bg-blue-50 text-blue-600 font-extrabold text-[10px] px-1.5 py-0.2 rounded border border-blue-200">
              360°
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button className="text-gray-400 hover:text-gray-600 p-1">
              <FaEdit className="text-xs" />
            </button>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="w-6 h-6 rounded bg-gray-100 text-gray-500 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs ml-1"
                title="Collapse Left Panel"
              >
                <FaChevronLeft className="text-xs" />
              </button>
            )}
          </div>
        </div>

        {/* Multi-Customer Account Selector Dropdown */}
        {customerList && customerList.length > 1 && (
          <div className="p-2 bg-blue-50/80 border border-blue-200 rounded-lg text-xs mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider">
                Select Account ({customerList.length} Found)
              </span>
              <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded">
                Active: #{customer.customerNumber || 'CUS-94245'}
              </span>
            </div>
            <select
              value={selectedIndex}
              onChange={(e) => selectCustomer(Number(e.target.value))}
              className="w-full p-1 bg-white border border-blue-300 rounded font-bold text-gray-900 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs text-xs"
            >
              {customerList.map((item, idx) => (
                <option key={item.customerNumber || idx} value={idx}>
                  {item.fullName || `${item.firstName || ''} ${item.surname || ''}`.trim() || 'Customer'} (Cust ID: {item.customerNumber})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{customerName}</h3>
              <span className="bg-purple-700 text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                {loyaltyTier}
              </span>
            </div>
            <div className="mt-1 space-y-0.5 text-[11px] text-gray-600">
              <div className="flex items-center gap-1.5">
                <FaPhoneAlt className="text-gray-400 text-[10px]" />
                <span>{customer.mobile || customer.mobileRaw || '+971 50 123 4567'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaEnvelope className="text-gray-400 text-[10px]" />
                <span className="truncate max-w-[170px]">{customer.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaGlobe className="text-gray-400 text-[10px]" />
                <span>{customer.language || 'English (Preferred)'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-gray-400 text-[10px]" />
                <span className="truncate max-w-[170px]">{locationStr}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Icon Row */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
          <button className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100">
            <FaPhoneAlt className="text-[10px]" />
          </button>
          <button className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100">
            <FaWhatsapp className="text-xs" />
          </button>
          <button className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100">
            <FaEnvelope className="text-[10px]" />
          </button>
          <button className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100">
            <FaCommentAlt className="text-[10px]" />
          </button>
          <button className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100">
            <FaComments className="text-[10px]" />
          </button>
          <button className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200">
            <FaEllipsisH className="text-[10px]" />
          </button>
        </div>

        {/* Verification Footer */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Verification Status</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded">
              <FaCheckCircle className="text-[10px]" /> Verified
            </span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Last Verified On</span>
            <span className="font-semibold text-gray-800">18 May 2026, 02:14 PM</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Last Verified By</span>
            <span className="font-semibold text-gray-800">Sara Ahmed</span>
          </div>
        </div>
      </div>

      {/* 2. Vehicle Summary Card */}
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 text-xs space-y-3">
        <div className="pb-2 border-b border-gray-100">
          <h4 className="font-bold text-gray-900 text-xs">Vehicle Summary</h4>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gray-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
            BMW
          </div>
          <div>
            <h5 className="font-black text-gray-900 text-sm leading-tight">BMW X5 xDrive40i</h5>
            <span className="text-[10px] text-gray-400 font-mono block">VIN: WBAXU710X0LK12345</span>
            <span className="text-[10px] text-gray-500 font-medium">Year: 2023 | Color: Black Sapphire</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 pt-2 border-t border-gray-100">
          <div>
            <span className="text-gray-400 block text-[10px]">Mileage</span>
            <span className="font-bold text-gray-900 text-sm">64,250 KM</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px]">Warranty Status</span>
            <span className="font-bold text-emerald-600 text-xs">Active</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px]">Warranty Expiry</span>
            <span className="font-semibold text-gray-800">15 Nov 2026</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px]">Service Contract</span>
            <span className="font-bold text-gray-900">Premium Plus</span>
          </div>

          <div className="col-span-2 pt-1 border-t border-gray-50">
            <span className="text-gray-400 block text-[10px]">Next Service Due</span>
            <span className="font-bold text-gray-900 text-xs">12,500 KM / 15 Aug 2026</span>
          </div>
        </div>
      </div>

      {/* 3. Trade-in Eligibility Card */}
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 text-xs space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-gray-100">
          <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
            <FaCar className="text-blue-600" /> Trade-in Eligibility
          </span>
          <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
            <FaCheckCircle className="text-[9px]" /> Eligible
          </span>
        </div>

        <div className="flex justify-between items-baseline pt-1">
          <span className="text-gray-500">Estimated Value</span>
          <span className="font-black text-gray-900 text-sm">AED 145,000</span>
        </div>

        <div className="flex justify-between items-center text-[11px]">
          <span className="text-gray-400">Eligibility Expires On</span>
          <span className="font-medium text-gray-700">15 Nov 2026</span>
        </div>

        <button className="text-blue-600 font-bold text-[11px] hover:underline flex items-center gap-1 pt-1">
          <span>View Details</span>
          <FaExternalLinkAlt className="text-[9px]" />
        </button>
      </div>

    </div>
  );
}
