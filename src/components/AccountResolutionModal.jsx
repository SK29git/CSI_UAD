import React from 'react';
import { 
  FaUserCheck, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaBuilding, 
  FaCar, 
  FaTimes, 
  FaCheckCircle, 
  FaArrowRight, 
  FaIdCard,
  FaMapMarkerAlt
} from 'react-icons/fa';

export default function AccountResolutionModal({
  isOpen,
  onClose,
  mobile,
  customerMatches = [],
  activeRecord = null,
  onSelectAccount
}) {
  if (!isOpen) return null;

  const count = customerMatches?.length || 0;

  const isCurrentActive = (item) => {
    if (!activeRecord || !item) return false;
    const activeCust = activeRecord.customerNumber || activeRecord.id;
    const itemCust = item.customerNumber || item.id;
    return !activeRecord.isProspect && activeCust && itemCust && String(activeCust) === String(itemCust);
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
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Customer Account Selection</span>
                {mobile && (
                  <span className="font-mono text-sm px-2 py-0.5 rounded bg-white/10 text-blue-200 font-normal">
                    {mobile}
                  </span>
                )}
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                {count} {count === 1 ? 'Customer Profile' : 'Customer Profiles'} Found
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Multiple customer profiles are registered with this mobile number. Select which profile you want to load:
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

        {/* 2. Customer Profile Cards (Prospects removed from modal) */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/70">
          {customerMatches.length === 0 ? (
            <div className="p-8 bg-white rounded-xl border border-gray-200 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
              <FaUserCheck className="text-3xl text-gray-300" />
              <p className="font-semibold text-gray-600 text-sm">No Customer Profiles Found</p>
              <p className="text-xs text-gray-400">No registered Keyloop DMS customer accounts match this number.</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${customerMatches.length > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
              {customerMatches.map((cust, idx) => {
                const active = isCurrentActive(cust);
                const name = cust.fullName || `${cust.firstName || ''} ${cust.surname || ''}`.trim() || 'Customer';
                const custNo = cust.customerNumber || cust.id;
                const loyalty = cust.loyaltyTier || (cust.vip ? 'VIP' : 'LOYAL');
                const branch = cust.preferredBranch || cust.branch || 'AGMC Dubai';
                const group = cust.keyloopGroup || 'BMW';
                const vehiclesCount = Array.isArray(cust.vehicles) ? cust.vehicles.length : (cust.vehicleCount || 0);
                const cityArea = [cust.location?.area || cust.area, cust.location?.city || cust.city].filter(Boolean).join(', ');

                return (
                  <div
                    key={custNo || idx}
                    onClick={() => handleSelect(cust)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative bg-white shadow-xs hover:shadow-md flex flex-col justify-between ${
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

                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
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

                      <div className="space-y-1.5 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <FaIdCard className="text-gray-400 text-[11px]" />
                          <span className="font-semibold text-gray-800">Customer #: {custNo}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FaPhoneAlt className="text-gray-400 text-[11px]" />
                          <span>{cust.mobile || cust.phone || mobile || '-'}</span>
                        </div>
                        {cust.email && (
                          <div className="flex items-center gap-1.5">
                            <FaEnvelope className="text-gray-400 text-[11px]" />
                            <span className="truncate max-w-[260px]">{cust.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <FaBuilding className="text-gray-400 text-[11px]" />
                          <span className="truncate max-w-[260px]">{branch}</span>
                        </div>
                        {cityArea && (
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <FaMapMarkerAlt className="text-gray-400 text-[11px]" />
                            <span className="truncate max-w-[260px]">{cityArea}</span>
                          </div>
                        )}
                        {vehiclesCount > 0 && (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold pt-1">
                            <FaCar className="text-[11px]" />
                            <span>{vehiclesCount} {vehiclesCount === 1 ? 'Vehicle Registered' : 'Vehicles Registered'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSelect(cust); }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
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

        {/* 3. Footer */}
        <div className="px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
            <span className="text-blue-600 font-bold">💡 Tip:</span>
            <span>Selecting a customer account will load their full profile, service history, and registered vehicles.</span>
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
