import React from 'react';
import { 
  FaUser, 
  FaUserCheck, 
  FaStar, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaBuilding, 
  FaCar, 
  FaTimes, 
  FaCheckCircle, 
  FaArrowRight, 
  FaClock, 
  FaCrown,
  FaIdCard
} from 'react-icons/fa';

export default function AccountResolutionModal({
  isOpen,
  onClose,
  mobile,
  customerMatches = [],
  prospectMatches = [],
  activeRecord = null,
  onSelectAccount
}) {
  if (!isOpen) return null;

  const totalCount = (customerMatches?.length || 0) + (prospectMatches?.length || 0);

  const isCurrentActive = (item) => {
    if (!activeRecord || !item) return false;
    if (item.isProspect) {
      const activeId = activeRecord.prospectNumber || activeRecord.leadId;
      const itemId = item.prospectNumber || item.leadId;
      return activeRecord.isProspect && activeId && itemId && String(activeId) === String(itemId);
    } else {
      const activeCust = activeRecord.customerNumber || activeRecord.id;
      const itemCust = item.customerNumber || item.id;
      return !activeRecord.isProspect && activeCust && itemCust && String(activeCust) === String(itemCust);
    }
  };

  const handleSelect = (item) => {
    if (onSelectAccount) {
      onSelectAccount(item);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Account Selection</span>
                {mobile && (
                  <span className="font-mono text-sm px-2 py-0.5 rounded bg-white/10 text-blue-200 font-normal">
                    {mobile}
                  </span>
                )}
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                {totalCount} {totalCount === 1 ? 'Record Found' : 'Records Found'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              This mobile number matches both Customer and Prospect records. Choose which profile you want to load:
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* 2. Main Dual-Column Content */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/60">
          
          {/* LEFT COLUMN: Verified Customers */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                  <FaUserCheck />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
                  Verified Customers ({customerMatches.length})
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Keyloop DMS
              </span>
            </div>

            {customerMatches.length === 0 ? (
              <div className="p-6 bg-white rounded-xl border border-gray-200 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2 min-h-[180px]">
                <FaUser className="text-2xl text-gray-300" />
                <p className="font-semibold text-gray-600">No Verified Customer Records</p>
                <p className="text-[11px]">This number does not belong to an existing registered customer.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customerMatches.map((cust, idx) => {
                  const active = isCurrentActive(cust);
                  const name = cust.fullName || `${cust.firstName || ''} ${cust.surname || ''}`.trim() || 'Customer';
                  const custNo = cust.customerNumber || cust.id;
                  const loyalty = cust.loyaltyTier || (cust.vip ? 'VIP' : 'LOYAL');
                  const branch = cust.preferredBranch || cust.branch || 'AGMC Dubai';
                  const group = cust.keyloopGroup || 'BMW';
                  const vehiclesCount = Array.isArray(cust.vehicles) ? cust.vehicles.length : (cust.vehicleCount || 0);

                  return (
                    <div
                      key={custNo || idx}
                      onClick={() => handleSelect(cust)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative bg-white shadow-xs hover:shadow-md ${
                        active 
                          ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30' 
                          : 'border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      {active && (
                        <span className="absolute -top-2.5 right-3 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                          <FaCheckCircle className="text-[9px]" /> Currently Active
                        </span>
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900 text-sm">{name}</span>
                            <span className="bg-blue-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                              ✓ CUSTOMER
                            </span>
                            {loyalty && loyalty !== 'N/A' && (
                              <span className="bg-purple-100 text-purple-700 font-bold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                                {loyalty}
                              </span>
                            )}
                            {group && (
                              <span className="bg-gray-100 text-gray-700 font-bold text-[9px] px-1.5 py-0.5 rounded uppercase font-mono">
                                {group}
                              </span>
                            )}
                          </div>

                          <div className="mt-2 space-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <FaIdCard className="text-gray-400 text-[10px]" />
                              <span className="font-semibold text-gray-800">Customer #: {custNo}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FaPhoneAlt className="text-gray-400 text-[10px]" />
                              <span>{cust.mobile || cust.phone || mobile || '-'}</span>
                            </div>
                            {cust.email && (
                              <div className="flex items-center gap-1.5">
                                <FaEnvelope className="text-gray-400 text-[10px]" />
                                <span className="truncate max-w-[240px]">{cust.email}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <FaBuilding className="text-gray-400 text-[10px]" />
                              <span className="truncate max-w-[240px]">{branch}</span>
                            </div>
                            {vehiclesCount > 0 && (
                              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                                <FaCar className="text-[10px]" />
                                <span>{vehiclesCount} {vehiclesCount === 1 ? 'Vehicle Registered' : 'Vehicles Registered'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleSelect(cust); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            active
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                          }`}
                        >
                          <span>{active ? 'Selected (Active)' : 'Select Customer Account'}</span>
                          <FaArrowRight className="text-[10px]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sales Prospects */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                  <FaStar />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                  Sales Prospects ({prospectMatches.length})
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                CRM / Leads
              </span>
            </div>

            {prospectMatches.length === 0 ? (
              <div className="p-6 bg-white rounded-xl border border-gray-200 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2 min-h-[180px]">
                <FaStar className="text-2xl text-gray-300" />
                <p className="font-semibold text-gray-600">No Sales Prospect Leads</p>
                <p className="text-[11px]">No active leads or enquiry records found for this number.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {prospectMatches.map((pros, idx) => {
                  const active = isCurrentActive(pros);
                  const name = pros.fullName || `${pros.firstName || ''} ${pros.surname || ''}`.trim() || 'Prospect';
                  const prosNo = pros.prospectNumber || pros.leadId || `PR-${idx + 1}`;
                  const group = pros.keyloopGroup || 'BMW';
                  const advisor = pros.advisor || pros.salesAdvisor || pros.assignedStaff;
                  const enquiry = pros.enquirySummary || pros.modelOfInterest || pros.campaign || pros.leadSource;

                  return (
                    <div
                      key={prosNo || idx}
                      onClick={() => handleSelect(pros)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative bg-white shadow-xs hover:shadow-md ${
                        active 
                          ? 'border-amber-500 ring-2 ring-amber-400/20 bg-amber-50/30' 
                          : 'border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      {active && (
                        <span className="absolute -top-2.5 right-3 bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                          <FaCheckCircle className="text-[9px]" /> Currently Active
                        </span>
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900 text-sm">{name}</span>
                            <span className="bg-amber-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                              ★ PROSPECT
                            </span>
                            {group && (
                              <span className="bg-gray-100 text-gray-700 font-bold text-[9px] px-1.5 py-0.5 rounded uppercase font-mono">
                                {group}
                              </span>
                            )}
                          </div>

                          <div className="mt-2 space-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <FaIdCard className="text-gray-400 text-[10px]" />
                              <span className="font-semibold text-gray-800">Prospect #: {prosNo}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <FaPhoneAlt className="text-gray-400 text-[10px]" />
                              <span>{pros.mobile || pros.phone || mobile || '-'}</span>
                            </div>
                            {pros.email && (
                              <div className="flex items-center gap-1.5">
                                <FaEnvelope className="text-gray-400 text-[10px]" />
                                <span className="truncate max-w-[240px]">{pros.email}</span>
                              </div>
                            )}
                            {enquiry && (
                              <div className="flex items-center gap-1.5 text-amber-800 font-medium">
                                <span className="text-amber-500 font-bold">📋</span>
                                <span className="truncate max-w-[240px]">Interest: {enquiry}</span>
                              </div>
                            )}
                            {advisor && (
                              <div className="flex items-center gap-1.5 text-gray-500">
                                <span className="text-gray-400">👤</span>
                                <span className="truncate max-w-[240px]">Advisor: {advisor}</span>
                              </div>
                            )}
                            {pros.createdDate && (
                              <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                                <FaClock className="text-[9px]" />
                                <span>Created: {pros.createdDate}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleSelect(pros); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            active
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs'
                          }`}
                        >
                          <span>{active ? 'Selected (Active)' : `Select Prospect #${prosNo}`}</span>
                          <FaArrowRight className="text-[10px]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 3. Footer */}
        <div className="px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
            <span className="text-blue-600 font-bold">💡 Tip:</span>
            <span>You can toggle between Customer and Prospect views anytime using the switcher at the top of the sidebar.</span>
          </p>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
