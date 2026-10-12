import React, { useState, useEffect, useMemo } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaUsers, 
  FaCrown, 
  FaShieldAlt, 
  FaBirthdayCake, 
  FaBolt, 
  FaUserClock, 
  FaExchangeAlt,
  FaSpinner,
  FaRedo,
  FaSearch,
  FaCar,
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt
} from 'react-icons/fa';

export default function SalesSegmentsView() {
  const { customer, group: contextGroup } = useCustomer();
  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || '');
  const customerNumber = customer?.customerNumber || "";

  const [segmentDataMap, setSegmentDataMap] = useState({});
  const [activeSegmentTab, setActiveSegmentTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");

  const formatDisplayVal = (val, fallback = 'N/A') => {
    if (val === null || val === undefined || val === '') return fallback;
    if (typeof val === 'object') {
      if (val.name) return val.name;
      if (val.description) return val.description;
      return fallback;
    }
    const str = String(val).trim();
    if (str === '{}' || str === '[]' || str === '') return fallback;
    return str;
  };

  // Segment definitions matching Postman Collection folder "5. Segments"
  const segmentDefinitions = useMemo(() => [
    {
      id: 'upgrade',
      label: 'Upgrade Prospects',
      icon: FaExchangeAlt,
      url: `/api/v1/segments/upgrade?group=${group}&minMileageKm=60000&minAgeYears=4`
    },
    {
      id: 'vip',
      label: 'VIP Customers',
      icon: FaCrown,
      url: `/api/v1/segments/vip-customers?group=${group}`
    },
    {
      id: 'ev',
      label: 'EV Customers',
      icon: FaBolt,
      url: `/api/v1/segments/ev-customers?group=${group}`
    },
    {
      id: 'birthdays',
      label: 'Birthdays',
      icon: FaBirthdayCake,
      url: `/api/v1/segments/birthdays?group=${group}&month=${new Date().getMonth() + 1}`
    },
    {
      id: 'inactive',
      label: 'Inactive Leads',
      icon: FaUserClock,
      url: `/api/v1/segments/inactive-leads?group=${group}&olderThanDays=30`
    },
    {
      id: 'insurance',
      label: 'Insurance Expiring',
      icon: FaShieldAlt,
      url: `/api/v1/segments/insurance-expiring?group=${group}&withinDays=30`
    }
  ], [group]);

  const fetchAllSegments = async () => {
    setLoading(true);
    setSegmentDataMap({});

    try {
      const results = await Promise.allSettled(
        segmentDefinitions.map(async (def) => {
          const res = await apiFetch(def.url);
          let list = [];
          if (res && res.ok && res.data) {
            if (Array.isArray(res.data.members)) {
              list = res.data.members;
            } else if (Array.isArray(res.data)) {
              list = res.data;
            }
          }
          return { id: def.id, members: list };
        })
      );

      const dataMap = {};
      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value) {
          dataMap[r.value.id] = r.value.members;
        }
      });

      setSegmentDataMap(dataMap);

      // Default to the first segment that actually returned data
      const firstTabWithData = segmentDefinitions.find(
        (def) => dataMap[def.id] && dataMap[def.id].length > 0
      );

      if (firstTabWithData) {
        setActiveSegmentTab(firstTabWithData.id);
      } else {
        setActiveSegmentTab(null);
      }
    } catch (err) {
      console.warn("Failed to fetch customer segments:", err);
      setSegmentDataMap({});
      setActiveSegmentTab(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSegments();
  }, [group]);

  // Only show tabs where the API returned records (removes empty tabs like Insurance Expiring)
  const availableTabs = segmentDefinitions.filter(
    (def) => segmentDataMap[def.id] && segmentDataMap[def.id].length > 0
  );

  const currentMembers = activeSegmentTab ? (segmentDataMap[activeSegmentTab] || []) : [];

  const filteredMembers = currentMembers.filter((m) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const name = (m.customerName || '').toLowerCase();
    const no = (m.customerNumber || m.leadId || '').toString().toLowerCase();
    const veh = (m.vehicle || '').toLowerCase();
    const reg = (m.registrationNumber || '').toLowerCase();
    const mob = (m.mobile || '').toLowerCase();
    return name.includes(q) || no.includes(q) || veh.includes(q) || reg.includes(q) || mob.includes(q);
  });

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4 text-xs">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
            <FaUsers className="text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 leading-tight">Customer Segments</h2>
              <span className="bg-purple-50 text-purple-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-purple-200">
                {group}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium">
              Targeted customer cohorts from Keyloop API
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchAllSegments}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer flex items-center gap-1.5 font-medium text-xs transition-colors"
            title="Refresh Segments"
          >
            <FaRedo className={`text-xs ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-gray-400 gap-2">
          <FaSpinner className="animate-spin text-2xl text-purple-600" />
          <span className="text-xs font-medium">Fetching customer segments from Keyloop...</span>
        </div>
      ) : availableTabs.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-1">
          <FaUsers className="mx-auto text-xl text-gray-400 mb-1" />
          <p className="font-bold text-gray-700 text-xs">No active customer segments found for {group}.</p>
          <p className="text-[11px] text-gray-400">There are no records returned from the segment endpoints for this brand.</p>
        </div>
      ) : (
        <>
          {/* Segment Selector Tabs & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2">
            {/* Tabs (Only tabs with live data are rendered) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {availableTabs.map((tab) => {
                const IconComponent = tab.icon;
                const count = segmentDataMap[tab.id]?.length || 0;
                const isActive = activeSegmentTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveSegmentTab(tab.id);
                      setSearchFilter("");
                    }}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                      isActive 
                        ? 'bg-purple-600 text-white shadow-2xs' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <IconComponent className="text-xs" />
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white/30 text-white' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Filter */}
            <div className="relative self-end sm:self-auto">
              <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-[10px]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search name, vehicle, mobile..."
                className="pl-7 pr-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs w-48 sm:w-56 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Table Container with Frozen Header (sticky top-0) and Internal Scroll */}
          <div className="border border-gray-200 rounded-xl overflow-x-auto overflow-y-auto max-h-[460px] shadow-2xs relative bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-gray-700 font-extrabold uppercase text-[9px] sticky top-0 z-10 shadow-2xs">
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-3 bg-slate-100">Cust / Lead #</th>
                  <th className="py-3 px-3 bg-slate-100">Customer Name</th>
                  <th className="py-3 px-3 bg-slate-100">Contact Details</th>
                  {activeSegmentTab === 'upgrade' && (
                    <>
                      <th className="py-3 px-3 bg-slate-100">Delivered Vehicle</th>
                      <th className="py-3 px-3 bg-slate-100">Mileage</th>
                      <th className="py-3 px-3 bg-slate-100">Next Service</th>
                    </>
                  )}
                  {activeSegmentTab === 'vip' && (
                    <>
                      <th className="py-3 px-3 bg-slate-100">VIP Status</th>
                      <th className="py-3 px-3 bg-slate-100">Contact Preference</th>
                    </>
                  )}
                  {activeSegmentTab === 'ev' && (
                    <>
                      <th className="py-3 px-3 bg-slate-100">Electric Vehicle</th>
                      <th className="py-3 px-3 bg-slate-100">Powertrain</th>
                      <th className="py-3 px-3 bg-slate-100">Mileage</th>
                    </>
                  )}
                  {activeSegmentTab === 'birthdays' && (
                    <>
                      <th className="py-3 px-3 bg-slate-100">Date of Birth</th>
                      <th className="py-3 px-3 bg-slate-100">VIP Status</th>
                      <th className="py-3 px-3 bg-slate-100">Contact Preference</th>
                    </>
                  )}
                  {activeSegmentTab === 'inactive' && (
                    <>
                      <th className="py-3 px-3 bg-slate-100">Lead Source</th>
                      <th className="py-3 px-3 bg-slate-100">Created Date</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No members match the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((row, idx) => {
                    const custNo = row.customerNumber || row.leadId || `ID-${idx + 1}`;
                    const custName = row.customerName || 'Customer Record';
                    const mobile = row.mobile || '';
                    const email = row.email || '';
                    const isThisCustomer = customerNumber && String(custNo) === String(customerNumber);

                    return (
                      <tr 
                        key={idx} 
                        className={`transition-colors ${
                          isThisCustomer ? 'bg-purple-50/80 font-bold' : 'hover:bg-purple-50/40'
                        }`}
                      >
                        {/* Cust / Lead # */}
                        <td className="py-3 px-3 font-mono font-bold text-purple-700 whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            #{custNo}
                            {isThisCustomer && (
                              <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.2 rounded uppercase">
                                Current
                              </span>
                            )}
                          </span>
                        </td>

                        {/* Customer Name */}
                        <td className="py-3 px-3 font-bold text-gray-900 whitespace-nowrap max-w-[200px] truncate" title={custName}>
                          {custName}
                        </td>

                        {/* Contact Details */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5 text-[10px]">
                            {mobile && (
                              <span className="font-mono text-gray-700 flex items-center gap-1">
                                <FaPhoneAlt className="text-gray-400 text-[9px]" /> {mobile}
                              </span>
                            )}
                            {email && (
                              <span className="text-gray-500 flex items-center gap-1 truncate max-w-[180px]" title={email}>
                                <FaEnvelope className="text-gray-400 text-[9px]" /> {email}
                              </span>
                            )}
                            {!mobile && !email && (
                              <span className="text-gray-400 italic">No contact details</span>
                            )}
                          </div>
                        </td>

                        {/* Segment-Specific Columns */}
                        {activeSegmentTab === 'upgrade' && (
                          <>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className="font-medium text-gray-800 flex items-center gap-1">
                                <FaCar className="text-gray-400 text-[10px]" />
                                {formatDisplayVal(row.vehicle, 'Vehicle on Record')}
                              </span>
                              {row.registrationNumber && (
                                <span className="font-mono text-[10px] text-gray-500 block">
                                  {row.registrationNumber}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                {typeof row.mileageKm === 'number' 
                                  ? `${row.mileageKm.toLocaleString()} KM` 
                                  : formatDisplayVal(row.mileageKm)}
                              </span>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap text-gray-600">
                              {formatDisplayVal(row.nextServiceDate)}
                            </td>
                          </>
                        )}

                        {activeSegmentTab === 'vip' && (
                          <>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-extrabold text-[10px] border border-amber-300">
                                <FaCrown className="text-[9px]" /> VIP Member
                              </span>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap text-gray-600">
                              {formatDisplayVal(row.contactPreference, 'Any')}
                            </td>
                          </>
                        )}

                        {activeSegmentTab === 'ev' && (
                          <>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className="font-medium text-gray-800 flex items-center gap-1">
                                <FaCar className="text-gray-400 text-[10px]" />
                                {formatDisplayVal(row.vehicle, 'Electric Vehicle')}
                              </span>
                              {row.vin && (
                                <span className="font-mono text-[9px] text-gray-400 block truncate max-w-[140px]" title={row.vin}>
                                  VIN: {row.vin}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px] border border-emerald-300">
                                <FaBolt className="text-[9px]" /> {formatDisplayVal(row.fuelType, 'Electric')}
                              </span>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap text-gray-700 font-mono">
                              {typeof row.mileageKm === 'number' ? `${row.mileageKm.toLocaleString()} KM` : formatDisplayVal(row.mileageKm)}
                            </td>
                          </>
                        )}

                        {activeSegmentTab === 'birthdays' && (
                          <>
                            <td className="py-3 px-3 whitespace-nowrap font-medium text-gray-800">
                              <span className="flex items-center gap-1">
                                <FaCalendarAlt className="text-purple-400 text-[10px]" />
                                {formatDisplayVal(row.dateOfBirth)}
                              </span>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              {row.vip ? (
                                <span className="text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded text-[10px] font-bold">
                                  VIP
                                </span>
                              ) : (
                                <span className="text-gray-500 text-[10px]">Standard</span>
                              )}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap text-gray-600">
                              {formatDisplayVal(row.contactPreference, 'Phone / Email')}
                            </td>
                          </>
                        )}

                        {activeSegmentTab === 'inactive' && (
                          <>
                            <td className="py-3 px-3 whitespace-nowrap text-gray-700">
                              {formatDisplayVal(row.source, 'Direct / Walk-in')}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap text-gray-600">
                              {formatDisplayVal(row.createdAt ? row.createdAt.slice(0, 10) : null)}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
