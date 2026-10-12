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
    getConsentsDisplay,
    riskOverview,
    verificationStatus
  } = useCustomer();

  const customerName = getFormattedName ? getFormattedName() : '';
  const loyaltyTier = getLoyaltyTier ? getLoyaltyTier() : 'N/A';
  const customerSince = getFormattedDate ? getFormattedDate(customer?.customerSince) : (customer?.customerSince || 'N/A');
  const locationStr = getFormattedLocation ? getFormattedLocation() : '';
  const branchName = getBranchName ? getBranchName() : '';
  const customerId = customer?.customerNumber || customer?.id || '';

  const hasRiskData = Boolean(
    riskOverview &&
    typeof riskOverview === 'object' &&
    (
      (riskOverview.riskLevel && String(riskOverview.riskLevel).trim() !== "") ||
      (riskOverview.riskScore !== null && riskOverview.riskScore !== undefined && String(riskOverview.riskScore).trim() !== "") ||
      (riskOverview.repeatComplaintCount !== null && riskOverview.repeatComplaintCount !== undefined && String(riskOverview.repeatComplaintCount).trim() !== "") ||
      (Array.isArray(riskOverview.repeatComplaints) ? riskOverview.repeatComplaints.length > 0 : Boolean(riskOverview.repeatComplaints && String(riskOverview.repeatComplaints).trim() !== ""))
    )
  );

  const hasVerificationData = Boolean(
    verificationStatus &&
    typeof verificationStatus === 'object' &&
    (
      verificationStatus.status ||
      verificationStatus.lastVerifiedBy ||
      verificationStatus.verifiedBy ||
      verificationStatus.lastVerifiedOn ||
      verificationStatus.lastEditedBy ||
      verificationStatus.lastEditedOn
    )
  );

  const hasNotesData = Boolean(customer?.notes && String(customer?.notes).trim() !== "");

  if (isCollapsed) {
    return (
      <div 
        onClick={onToggleCollapse}
        className="w-14 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-300 p-2 flex flex-col items-center gap-3 cursor-pointer hover:border-blue-500 transition-all duration-300 group py-4 select-none min-h-[300px]"
        title="Click to expand Customer Profile"
      >
        {/* Expand Toggle Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleCollapse && onToggleCollapse(); }}
          className="w-9 h-9 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center transition-colors shadow-2xs"
          title="Expand Customer Profile"
        >
          <FaChevronRight className="text-sm" />
        </button>

        <div className="w-7 h-[1px] bg-gray-200 my-1" />

        {/* Customer Initial Avatar */}
        <div 
          className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-xs"
          title={customerName && customerName !== 'N/A' ? `Customer: ${customerName}` : 'Customer Profile'}
        >
          {customerName && customerName !== 'Customer' && customerName !== 'N/A' ? customerName.charAt(0).toUpperCase() : <FaUser className="text-xs text-slate-500" />}
        </div>

        {/* Vertical Panel Title */}
        <div className="flex-1 flex items-center justify-center py-6 select-none">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest [writing-mode:vertical-lr] rotate-180 group-hover:text-blue-600 transition-colors">
            Customer Profile
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[310px] xl:w-[330px] flex-shrink-0 flex flex-col gap-4 transition-all duration-300">
      {/* 1. Profile Overview Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-300 relative">
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
        ) : !customer ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-gray-500 text-xs text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
              <FaUser className="text-base" />
            </div>
            <span className="font-bold text-gray-800 text-sm">No Customer Profile</span>
            <span className="text-[11px] text-gray-400">Search with a valid phone or customer ID</span>
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
                    Active: #{customer?.customerNumber || customerId}
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

            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="font-bold text-gray-900 text-base leading-tight truncate">{customerName}</h2>
                  {customer?.vip === true && (
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
                    <span className="font-medium">{customer?.mobile || customer?.mobileRaw || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaEnvelope className="text-gray-400 text-[11px]" />
                    <span className="truncate max-w-[190px]">{customer?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-gray-400 text-[11px]" />
                    <span className="truncate max-w-[190px]">{locationStr}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaGlobe className="text-gray-400 text-[11px]" />
                    <span>{customer?.language || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Customer Key Meta Data Table */}
      {customer && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-300 text-xs">
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
              <span className="font-semibold text-gray-800">{customer?.keyloopGroup || ""}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Last Updated</span>
              <span className="font-semibold text-gray-800">{getFormattedDate ? getFormattedDate(customer?.lastUpdated) : (customer?.lastUpdated || 'N/A')}</span>
            </div>

            <div>
              <span className="text-gray-400 block text-[11px]">Loyalty Tier</span>
              <span className="font-semibold text-gray-800">{loyaltyTier}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Nationality</span>
              <span className="font-semibold text-gray-800">{customer?.nationality || 'N/A'}</span>
            </div>

            {customer?.dateOfBirth && (
              <div>
                <span className="text-gray-400 block text-[11px]">Date of Birth</span>
                <span className="font-semibold text-gray-800">{getFormattedDate ? getFormattedDate(customer?.dateOfBirth) : (customer?.dateOfBirth || 'N/A')}</span>
              </div>
            )}
            <div className="col-span-2 pt-1 border-t border-gray-50">
              <span className="text-gray-400 block text-[11px]">Branch Code / Preferred</span>
              <span className="font-semibold text-gray-800">{branchName}</span>
            </div>

            <div>
              <span className="text-gray-400 block text-[11px]">Do Not Contact</span>
              <span className={`font-semibold ${customer?.doNotContact ? 'text-rose-600' : 'text-emerald-600'}`}>
                {customer?.doNotContact ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Consents</span>
              <span className="font-medium text-gray-700">{getConsentsDisplay ? getConsentsDisplay() : 'None'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Verification Status Card (Rendered strictly from GET /api/v1/customers/{group}/{customerNumber}/verification) */}
      {hasVerificationData && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-300 text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
            <span className="font-bold text-gray-800 flex items-center gap-1.5">
              Verification Status
            </span>
            <div className="flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
              <FaCheckCircle className="text-xs" />
              <span>{verificationStatus.status || 'Verified'}</span>
              <FaInfoCircle className="text-gray-400 ml-1 text-[10px]" />
            </div>
          </div>

          <div className="space-y-1.5 text-gray-600">
            {(verificationStatus.lastVerifiedBy || verificationStatus.verifiedBy) && (
              <div className="flex justify-between">
                <span className="text-gray-400">Last Verified By</span>
                <span className="font-medium text-gray-800">{verificationStatus.lastVerifiedBy || verificationStatus.verifiedBy}</span>
              </div>
            )}
            {verificationStatus.lastVerifiedOn && (
              <div className="flex justify-between">
                <span className="text-gray-400">Last Verified On</span>
                <span className="font-medium text-gray-800">{verificationStatus.lastVerifiedOn}</span>
              </div>
            )}
            {verificationStatus.lastEditedBy && (
              <div className="flex justify-between">
                <span className="text-gray-400">Last Edited By</span>
                <span className="font-medium text-gray-800">{verificationStatus.lastEditedBy}</span>
              </div>
            )}
            {verificationStatus.lastEditedOn && (
              <div className="flex justify-between">
                <span className="text-gray-400">Last Edited On</span>
                <span className="font-medium text-gray-800">{verificationStatus.lastEditedOn}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Customer Risk Overview Card (Rendered strictly from GET /api/v1/customers/{group}/{customerNumber}/risk-overview API payload) */}
      {hasRiskData && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-300 text-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
            <span className="font-bold text-gray-900 text-sm">Customer Risk Overview</span>
            <FaChevronRight className="text-gray-400 text-xs cursor-pointer hover:text-gray-600" />
          </div>

          <div className="space-y-3">
            {/* Risk Level */}
            {riskOverview.riskLevel && String(riskOverview.riskLevel).trim() !== "" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-red-100 text-red-600 flex items-center justify-center font-bold text-[10px]">
                    !
                  </span>
                  <span className="font-medium text-gray-700">Risk Level</span>
                </div>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  String(riskOverview.riskLevel).toUpperCase() === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                  String(riskOverview.riskLevel).toUpperCase() === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {riskOverview.riskLevel}
                </span>
              </div>
            )}

            {/* Risk Score */}
            {riskOverview.riskScore !== null && riskOverview.riskScore !== undefined && String(riskOverview.riskScore).trim() !== "" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                    📊
                  </span>
                  <span className="font-medium text-gray-700">Risk Score</span>
                </div>
                <span className="font-bold text-gray-900">{riskOverview.riskScore}</span>
              </div>
            )}

            {/* Repeat Complaints Count */}
            {riskOverview.repeatComplaintCount !== null && riskOverview.repeatComplaintCount !== undefined && String(riskOverview.repeatComplaintCount).trim() !== "" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-[10px]">
                    ↻
                  </span>
                  <span className="font-medium text-gray-700">Repeat Complaints</span>
                </div>
                <span className="font-bold text-gray-900">{riskOverview.repeatComplaintCount} Cases</span>
              </div>
            )}

            {/* Repeat Complaints Details */}
            {(Array.isArray(riskOverview.repeatComplaints) ? riskOverview.repeatComplaints.length > 0 : Boolean(riskOverview.repeatComplaints && String(riskOverview.repeatComplaints).trim() !== "")) && (
              <div className="flex flex-col gap-1 pt-2 border-t border-gray-100">
                <span className="font-medium text-gray-700">Repeat Complaint Details</span>
                <div className="text-[11px] text-gray-600 space-y-1">
                  {Array.isArray(riskOverview.repeatComplaints) ? (
                    riskOverview.repeatComplaints.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-1.5 rounded border border-gray-200">
                        {typeof item === 'object' ? (item.description || item.subject || JSON.stringify(item)) : String(item)}
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 p-1.5 rounded border border-gray-200">{String(riskOverview.repeatComplaints)}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Notes Card (Rendered strictly if notes exist in customer profile payload) */}
      {hasNotesData && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
            <span className="font-bold text-gray-900 text-sm">Notes</span>
            <button className="text-blue-600 font-bold text-xs hover:underline">Edit</button>
          </div>
          <div className="space-y-1 text-gray-700 text-[11px] leading-relaxed">
            <p>{customer?.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
