import React, { useState, useMemo } from 'react';
import { 
  FaBoxes, 
  FaSearch, 
  FaTimes, 
  FaCar, 
  FaTag, 
  FaShieldAlt, 
  FaWrench, 
  FaSlidersH,
  FaCheckCircle,
  FaCalendarAlt
} from 'react-icons/fa';

export default function VehiclePackagesModal({ isOpen, onClose, vehicle }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const packages = useMemo(() => {
    if (!vehicle || !Array.isArray(vehicle.packages)) return [];
    return vehicle.packages;
  }, [vehicle]);

  // Helper to categorize packages for filtering
  const categorizePackage = (desc = '') => {
    const d = desc.toLowerCase();
    if (d.includes('(removable)')) return 'REMOVABLE';
    if (d.includes('warranty') || d.includes('warr') || d.includes('bsi') || d.includes('insurance') || d.includes('service')) {
      return 'SERVICE_WARRANTY';
    }
    if (d.includes('wheel') || d.includes('trim') || d.includes('leather') || d.includes('sensatec') || d.includes('finishers') || d.includes('upholstery')) {
      return 'WHEELS_TRIM';
    }
    if (d.includes('sound') || d.includes('cockpit') || d.includes('display') || d.includes('connected') || d.includes('camera') || d.includes('assistant') || d.includes('parking') || d.includes('recorder') || d.includes('esim')) {
      return 'TECH_ELECTRONICS';
    }
    if (d.includes('sport') || d.includes('steering') || d.includes('engine') || d.includes('transmission') || d.includes('cruise') || d.includes('led') || d.includes('lights')) {
      return 'PERFORMANCE_LIGHTING';
    }
    return 'OTHER';
  };

  // Counts for each category
  const counts = useMemo(() => {
    const c = {
      ALL: packages.length,
      REMOVABLE: 0,
      SERVICE_WARRANTY: 0,
      TECH_ELECTRONICS: 0,
      WHEELS_TRIM: 0,
      PERFORMANCE_LIGHTING: 0,
    };
    packages.forEach(p => {
      const cat = categorizePackage(p.packageDescription);
      if (c[cat] !== undefined) c[cat]++;
    });
    return c;
  }, [packages]);

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter(item => {
      const desc = item.packageDescription || '';
      const matchesSearch = !searchQuery.trim() || 
        desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.vehicleNumber && String(item.vehicleNumber).includes(searchQuery));

      if (!matchesSearch) return false;

      if (filterCategory === 'ALL') return true;
      return categorizePackage(desc) === filterCategory;
    });
  }, [packages, searchQuery, filterCategory]);

  if (!isOpen) return null;

  const vehicleTitle = vehicle?.description || `${vehicle?.brand || ''} ${vehicle?.model || ''}`.trim() || 'Vehicle';
  const vin = vehicle?.vin || '';
  const regNo = vehicle?.registrationNumber || vehicle?.plateNumber || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <FaBoxes className="text-lg" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-gray-900 text-base leading-tight truncate">
                  Vehicle Packages &amp; Factory Equipment
                </h3>
                <span className="bg-blue-100 text-blue-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                  {packages.length} Packages
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">
                <span className="font-bold text-gray-800">{vehicleTitle}</span>
                {vin && <span className="font-mono text-gray-500"> &bull; VIN: {vin}</span>}
                {regNo && <span> &bull; Plate: {regNo}</span>}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-200/80 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-3 sm:p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search package description, option, wheel, BSI..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 focus:border-blue-500 rounded-lg text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none transition shadow-2xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs p-0.5"
              >
                &times;
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs">
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition whitespace-nowrap cursor-pointer ${
                filterCategory === 'ALL'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({counts.ALL})
            </button>
            {counts.REMOVABLE > 0 && (
              <button
                onClick={() => setFilterCategory('REMOVABLE')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition whitespace-nowrap cursor-pointer ${
                  filterCategory === 'REMOVABLE'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                Removable ({counts.REMOVABLE})
              </button>
            )}
            {counts.SERVICE_WARRANTY > 0 && (
              <button
                onClick={() => setFilterCategory('SERVICE_WARRANTY')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition whitespace-nowrap cursor-pointer ${
                  filterCategory === 'SERVICE_WARRANTY'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                Warranty &amp; Service ({counts.SERVICE_WARRANTY})
              </button>
            )}
            {counts.TECH_ELECTRONICS > 0 && (
              <button
                onClick={() => setFilterCategory('TECH_ELECTRONICS')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition whitespace-nowrap cursor-pointer ${
                  filterCategory === 'TECH_ELECTRONICS'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                Tech &amp; Media ({counts.TECH_ELECTRONICS})
              </button>
            )}
            {counts.WHEELS_TRIM > 0 && (
              <button
                onClick={() => setFilterCategory('WHEELS_TRIM')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition whitespace-nowrap cursor-pointer ${
                  filterCategory === 'WHEELS_TRIM'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Wheels &amp; Trim ({counts.WHEELS_TRIM})
              </button>
            )}
          </div>
        </div>

        {/* Package Items Grid/List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50/50">
          {filteredPackages.length === 0 ? (
            <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200 text-xs">
              <FaBoxes className="mx-auto text-3xl text-gray-300 mb-2" />
              <p className="font-semibold text-gray-700">No packages match your search criteria</p>
              {searchQuery && (
                <p className="text-[11px] text-gray-400 mt-1">
                  Try clearing the search query "{searchQuery}"
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredPackages.map((pkg, idx) => {
                const desc = pkg.packageDescription || 'Standard Option';
                const isRemovable = desc.includes('(Removable)');
                const isWarranty = desc.toLowerCase().includes('warranty') || desc.toLowerCase().includes('warr') || desc.toLowerCase().includes('bsi') || desc.toLowerCase().includes('insurance');
                const isTech = desc.toLowerCase().includes('cockpit') || desc.toLowerCase().includes('connected') || desc.toLowerCase().includes('sound') || desc.toLowerCase().includes('assistant');
                const cleanDesc = desc.replace(/\s*\(Removable\)\s*/i, '').trim();

                return (
                  <div
                    key={idx}
                    className="p-3 bg-white hover:bg-blue-50/40 rounded-xl border border-gray-200 hover:border-blue-300 transition-all flex flex-col justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-gray-900 text-xs block leading-snug">
                          {cleanDesc}
                        </span>
                        
                        {/* Tags */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                          {isRemovable && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-amber-200">
                              Removable
                            </span>
                          )}
                          {isWarranty && (
                            <span className="bg-purple-100 text-purple-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-purple-200 flex items-center gap-1">
                              <FaShieldAlt className="text-[8px]" /> Protection / BSI
                            </span>
                          )}
                          {isTech && (
                            <span className="bg-indigo-100 text-indigo-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-indigo-200">
                              Connected / Digital
                            </span>
                          )}
                          {pkg.sequenceNumber && pkg.sequenceNumber !== "0" && (
                            <span className="text-[9px] font-mono text-gray-400">
                              Seq: {pkg.sequenceNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metadata Footer if present */}
                    {(pkg.vehicleNumber || pkg.registrationDate) && (
                      <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                        {pkg.vehicleNumber && <span>Veh #{pkg.vehicleNumber}</span>}
                        {pkg.registrationDate && <span>Reg: {pkg.registrationDate}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-100 bg-white flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            Showing <strong className="text-gray-900">{filteredPackages.length}</strong> of {packages.length} packages
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
