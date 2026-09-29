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
  FaInfoCircle,
  FaChevronRight,
  FaChevronLeft,
  FaExclamationTriangle,
  FaUser,
  FaStickyNote,
  FaCrown,
  FaSpinner
} from 'react-icons/fa';

export default function LeftSidebar({ isCollapsed = false, onToggleCollapse }) {
  const { 
    customer, 
    customerList, 
    selectedIndex, 
    selectCustomer, 
    loading, 
    getFormattedName, 
    getFormattedDate, 
    getFormattedLocation, 
    getBranchName, 
    getLoyaltyTier,
    getConsentsDisplay
  } = useCustomer();

  const customerName = getFormattedName();
  const loyaltyTier = getLoyaltyTier();
  const customerSince = getFormattedDate(customer.customerSince);
  const locationStr = getFormattedLocation();
  const branchName = getBranchName();
  const customerId = customer.customerNumber || customer.id || 'CUS-94245';

  if (isCollapsed) {
    return (
      <div 
        onClick={onToggleCollapse}
        className="w-14 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex flex-col items-center gap-4 cursor-pointer hover:border-blue-300 transition-all duration-300 group py-4"
        title="Click to expand Left Panel"
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

        {/* VIP / Loyalty Indicator */}
        <span className={`${customer.vip ? 'bg-amber-500' : 'bg-purple-700'} text-white text-[9px] font-bold px-1 py-0.5 rounded uppercase tracking-wider`}>
          {customer.vip ? 'VIP' : loyaltyTier.slice(0, 4).toUpperCase()}
        </span>

        {/* Call Icon */}
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <FaPhoneAlt className="text-xs" />
        </div>

        {/* Verified Badge */}
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center" title="Verified Customer">
          <FaCheckCircle className="text-xs" />
        </div>

        {/* Risk Warning */}
        <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center" title="High Escalation Risk">
          <FaExclamationTriangle className="text-xs" />
        </div>

        {/* Notes Icon */}
        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center" title="Customer Notes">
          <FaStickyNote className="text-xs" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[310px] xl:w-[330px] flex-shrink-0 flex flex-col gap-4 transition-all duration-300">
      {/* 1. Profile Overview Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative">
        {/* Collapse Toggle Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-gray-100 text-gray-500 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs z-10"
            title="Collapse Left Panel"
          >
            <FaChevronLeft className="text-xs" />
          </button>
        )}

        {loading ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-gray-500 text-xs">
            <FaSpinner className="animate-spin text-blue-600 text-lg" />
            <span>Fetching Customer Details...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mb-3">
            {/* Multi-Customer Account Selector Dropdown */}
            {customerList && customerList.length > 1 && (
              <div className="p-2 bg-blue-50/80 border border-blue-200 rounded-lg text-xs mb-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider">
                    Select Account ({customerList.length} Found)
                  </span>
                  <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded">
                    Active: #{customer.customerNumber || customerId}
                  </span>
                </div>
                <select
                  value={selectedIndex}
                  onChange={(e) => selectCustomer(Number(e.target.value))}
                  className="w-full p-1.5 bg-white border border-blue-300 rounded font-bold text-gray-900 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs text-xs"
                >
                  {customerList.map((item, idx) => (
                    <option key={item.customerNumber || idx} value={idx}>
                      {item.fullName || `${item.firstName || ''} ${item.surname || ''}`.trim() || 'Customer'} (Cust ID: {item.customerNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="font-bold text-gray-900 text-base leading-tight truncate">{customerName}</h2>
                  {customer.vip === true && (
                    <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-xs">
                      <FaCrown className="text-[9px]" /> VIP
                    </span>
                  )}
                  {loyaltyTier !== 'N/A' && (
                    <span className="bg-purple-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      {loyaltyTier}
                    </span>
                  )}
                </div>
                <div className="mt-1 space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <FaPhoneAlt className="text-gray-400 text-[11px]" />
                    <span className="font-medium">{customer.mobile || customer.mobileRaw || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaEnvelope className="text-gray-400 text-[11px]" />
                    <span className="truncate max-w-[190px]">{customer.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-gray-400 text-[11px]" />
                    <span className="truncate max-w-[190px]">{locationStr}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaGlobe className="text-gray-400 text-[11px]" />
                    <span>{customer.language || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button 
            title="Call"
            className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
          >
            <FaPhoneAlt className="text-xs" />
          </button>
          <button 
            title="WhatsApp"
            className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
          >
            <FaWhatsapp className="text-sm" />
          </button>
          <button 
            title="Email"
            className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
          >
            <FaEnvelope className="text-xs" />
          </button>
          <button 
            title="SMS"
            className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
          >
            <FaCommentAlt className="text-xs" />
          </button>
          <button 
            title="Chat"
            className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
          >
            <FaComments className="text-xs" />
          </button>
          <button 
            title="More Options"
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <FaEllipsisH className="text-xs" />
          </button>
        </div>
      </div>

      {/* 2. Customer Key Meta Data Table */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-xs">
        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
          <div>
            <span className="text-gray-400 block text-[11px]">Customer Since</span>
            <span className="font-semibold text-gray-800">{customerSince}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Customer ID</span>
            <span className="font-semibold text-gray-800">{customerId}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[11px]">Group / Brand</span>
            <span className="font-semibold text-gray-800">{customer.keyloopGroup || 'BMW'}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Last Updated</span>
            <span className="font-semibold text-gray-800">{getFormattedDate(customer.lastUpdated)}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[11px]">Loyalty Tier</span>
            <span className="font-semibold text-gray-800">{loyaltyTier}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Nationality</span>
            <span className="font-semibold text-gray-800">{customer.nationality || 'N/A'}</span>
          </div>

          {customer.dateOfBirth && (
            <div>
              <span className="text-gray-400 block text-[11px]">Date of Birth</span>
              <span className="font-semibold text-gray-800">{getFormattedDate(customer.dateOfBirth)}</span>
            </div>
          )}
          <div className="col-span-2 pt-1 border-t border-gray-50">
            <span className="text-gray-400 block text-[11px]">Branch Code / Preferred</span>
            <span className="font-semibold text-gray-800">{branchName}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[11px]">Do Not Contact</span>
            <span className={`font-semibold ${customer.doNotContact ? 'text-rose-600' : 'text-emerald-600'}`}>
              {customer.doNotContact ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Consents</span>
            <span className="font-medium text-gray-700">{getConsentsDisplay()}</span>
          </div>
        </div>
      </div>

      {/* 3. Verification Status Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
          <span className="font-bold text-gray-800 flex items-center gap-1.5">
            Verification Status
          </span>
          <div className="flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
            <FaCheckCircle className="text-xs" />
            <span>Verified</span>
            <FaInfoCircle className="text-gray-400 ml-1 text-[10px]" />
          </div>
        </div>

        <div className="space-y-1.5 text-gray-600">
          <div className="flex justify-between">
            <span className="text-gray-400">Last Verified By</span>
            <span className="font-medium text-gray-800">Sara Ahmed</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Last Verified On</span>
            <span className="font-medium text-gray-800">18 May 2026, 02:14 PM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Last Edited By</span>
            <span className="font-medium text-gray-800">Sara Ahmed</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Last Edited On</span>
            <span className="font-medium text-gray-800">18 May 2026, 02:14 PM</span>
          </div>
        </div>
      </div>

      {/* 4. Customer Risk Overview Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-xs">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
          <span className="font-bold text-gray-900 text-sm">Customer Risk Overview</span>
          <FaChevronRight className="text-gray-400 text-xs cursor-pointer hover:text-gray-600" />
        </div>

        <div className="space-y-3">
          {/* Escalation Risk */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-red-100 text-red-600 flex items-center justify-center font-bold text-[10px]">
                !
              </span>
              <span className="font-medium text-gray-700">Escalation Risk</span>
            </div>
            <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[11px]">
              High
            </span>
          </div>

          {/* Repeat Complaints */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-[10px]">
                ↻
              </span>
              <span className="font-medium text-gray-700">Repeat Complaints</span>
            </div>
            <span className="font-bold text-gray-900">4 Cases</span>
          </div>

          {/* Last Complaint */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-[10px]">
                🕒
              </span>
              <span className="font-medium text-gray-700">Last Complaint</span>
            </div>
            <span className="font-bold text-gray-900">3 Days Ago</span>
          </div>

          {/* CES Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px]">
                ✓
              </span>
              <span className="font-medium text-gray-700">CES Score <span className="text-gray-400 text-[10px]">(Last 30 Days)</span></span>
            </div>
            <span className="font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">2.1 / 5</span>
          </div>

          {/* NPS Risk */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-red-100 text-red-600 flex items-center justify-center font-bold text-[10px]">
                ⚠️
              </span>
              <span className="font-medium text-gray-700">NPS Risk</span>
            </div>
            <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[11px]">
              At Risk
            </span>
          </div>
        </div>
      </div>

      {/* 5. Notes Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
          <span className="font-bold text-gray-900 text-sm">Notes</span>
          <button className="text-blue-600 font-bold text-xs hover:underline">Edit</button>
        </div>
        <div className="space-y-1 text-gray-700 text-[11px] leading-relaxed">
          <p>Prefers communication in English/Arabic.</p>
          <p className="font-semibold text-gray-900">High value customer.</p>
        </div>
      </div>
    </div>
  );
}
