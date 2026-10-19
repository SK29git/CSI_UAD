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
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaFilter,
  FaUser
} from 'react-icons/fa';
import { getFullMobileNumber } from '../utils/phoneUtils';

export default function SalesSegmentsView() {
  const { customer, currentMobile: contextMobile, group: contextGroup } = useCustomer();
  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || '');
  const customerNumber = customer?.customerNumber || customer?.id || "";
  const customerName = customer?.fullName || `${customer?.firstName || ''} ${customer?.surname || ''}`.trim() || "Customer Record";

  // Resolve genuine unmasked customer mobile number (never use masked fragments like 574)
  const cleanMobile = getFullMobileNumber(customer, contextMobile);

  const [segmentDataMap, setSegmentDataMap] = useState({});
  const [activeSegmentTab, setActiveSegmentTab] = useState('upgrade');
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

  // Segment definitions matching updated Postman Collection folder "5. Segments" with mobile parameter
  const segmentDefinitions = useMemo(() => {
    const mobileParam = cleanMobile ? `&mobile=${cleanMobile}` : '';
    const currentMonth = new Date().getMonth() + 1;

    return [
      {
        id: 'upgrade',
        label: 'Upgrade Prospects',
        shortDesc: 'Vehicles >= 60,000 km or >= 4 yrs',
        icon: FaExchangeAlt,
        color: 'amber',
        url: `/api/v1/segments/upgrade?group=${group}&minMileageKm=60000&minAgeYears=4${mobileParam}`
      },
      {
        id: 'vip',
        label: 'VIP Customers',
        shortDesc: 'Keyloop registered VIP status',
        icon: FaCrown,
        color: 'yellow',
        url: `/api/v1/segments/vip-customers?group=${group}${mobileParam}`
      },
      {
        id: 'ev',
        label: 'EV Customers',
        shortDesc: 'Electric powertrain buyers',
        icon: FaBolt,
        color: 'emerald',
        url: `/api/v1/segments/ev-customers?group=${group}${mobileParam}`
      },
      {
        id: 'birthdays',
        label: 'Birthdays',
        shortDesc: `Birthdays in month ${currentMonth}`,
        icon: FaBirthdayCake,
        color: 'purple',
        url: `/api/v1/segments/birthdays?group=${group}&month=${currentMonth}${mobileParam}`
      },
      {
        id: 'inactive',
        label: 'Inactive Leads',
        shortDesc: 'Unconverted prospects > 30 days',
        icon: FaUserClock,
        color: 'blue',
        url: `/api/v1/segments/inactive-leads?group=${group}&olderThanDays=30${mobileParam}`
      },
      {
        id: 'insurance',
        label: 'Insurance Expiring',
        shortDesc: 'Policies expiring within 30 days',
        icon: FaShieldAlt,
        color: 'rose',
        url: `/api/v1/segments/insurance-expiring?group=${group}&withinDays=30${mobileParam}`
      }
    ];
  }, [group, cleanMobile]);

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
          // When filtering strictly for current customer and unmasked mobile wasn't available in URL/CTI,
          // filter the fetched cohort by customerNumber to see if this customer qualifies
          if (!cleanMobile && customerNumber) {
            list = list.filter(m => String(m.customerNumber || m.leadId || '') === String(customerNumber));
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

      // Default to the first segment that has data, or 'upgrade'
      const firstTabWithData = segmentDefinitions.find(
        (def) => dataMap[def.id] && dataMap[def.id].length > 0
      );
      setActiveSegmentTab(firstTabWithData ? firstTabWithData.id : 'upgrade');
    } catch (err) {
      console.warn("Failed to fetch customer segments:", err);
      setSegmentDataMap({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSegments();
  }, [group, cleanMobile, customerNumber]);

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

  // Calculate customer's qualified segments count
  const customerQualifiedCount = segmentDefinitions.filter(
    (def) => (segmentDataMap[def.id]?.length || 0) > 0
  ).length;

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4 text-xs">
      
      {/* 1. Header Bar */}
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
              Showing segment qualification for: <strong className="text-gray-800">{customerName}</strong>
              {customerNumber ? ` (#${customerNumber})` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!loading && (
            <div className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              <span>{customerQualifiedCount} Qualified Segments</span>
            </div>
          )}

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

      {/* 2. Customer Segment Status Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {segmentDefinitions.map((def) => {
          const IconComp = def.icon;
          const members = segmentDataMap[def.id] || [];
          const isQualified = members.length > 0;
          const isSelected = activeSegmentTab === def.id;

          return (
            <div
              key={def.id}
              onClick={() => {
                setActiveSegmentTab(def.id);
                setSearchFilter("");
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between min-h-[92px] ${
                isSelected 
                  ? 'border-purple-600 bg-purple-50/70 shadow-xs ring-1 ring-purple-500' 
                  : isQualified
                  ? 'border-emerald-300 bg-emerald-50/40 hover:border-emerald-400'
                  : 'border-gray-200 bg-gray-50/60 opacity-80 hover:opacity-100 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shadow-2xs ${
                  isQualified ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <IconComp className="text-xs" />
                </span>
                {isQualified ? (
                  <span className="flex items-center gap-0.5 text-emerald-700 bg-emerald-100/90 px-1.5 py-0.2 rounded font-extrabold text-[9px] border border-emerald-300">
                    <FaCheckCircle className="text-[9px]" /> QUALIFIED
                  </span>
                ) : (
                  <span className="text-gray-400 font-semibold text-[9px]">
                    Not Qualified
                  </span>
                )}
              </div>

              <div className="mt-2">
                <h4 className="font-extrabold text-gray-900 text-xs leading-tight truncate" title={def.label}>
                  {def.label}
                </h4>
                <p className="text-[10px] text-gray-500 truncate" title={def.shortDesc}>
                  {isQualified 
                    ? `${members.length} Record Match`
                    : 'Not in segment'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-gray-400 gap-2">
          <FaSpinner className="animate-spin text-2xl text-purple-600" />
          <span className="text-xs font-medium">
            Evaluating customer segment qualification...
          </span>
        </div>
      ) : (
        <>
          {/* 3. Segment Tab Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2 mt-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                <span>Active Tab:</span>
                <span className="text-purple-700 font-extrabold">
                  {segmentDefinitions.find(d => d.id === activeSegmentTab)?.label}
                </span>
                <span className="text-gray-400">({currentMembers.length} records)</span>
              </h3>
            </div>

            {/* Search Filter within Active Segment */}
            {currentMembers.length > 0 && (
              <div className="relative self-end sm:self-auto">
                <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-[10px]" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter within segment..."
                  className="pl-7 pr-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs w-48 sm:w-56 focus:outline-none focus:border-purple-500"
                />
              </div>
            )}
          </div>

          {/* 4. Segment Records Display */}
          {currentMembers.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50/80 rounded-xl border border-dashed border-gray-200 space-y-1">
              <FaUsers className="mx-auto text-2xl text-gray-300 mb-1" />
              <p className="font-bold text-gray-700 text-xs">
                Customer #{customerNumber || 'active'} does not qualify for this segment.
              </p>
              <p className="text-[11px] text-gray-400">
                Keyloop API returned 0 matching records for this customer criteria.
              </p>
            </div>
          ) : (
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
                        <th className="py-3 px-3 bg-slate-100">Spend / Purchase</th>
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
                    {activeSegmentTab === 'insurance' && (
                      <>
                        <th className="py-3 px-3 bg-slate-100">Vehicle</th>
                        <th className="py-3 px-3 bg-slate-100">Insurance Provider</th>
                        <th className="py-3 px-3 bg-slate-100">Expiry Date</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No records match the filter query.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((row, idx) => {
                      const custNo = row.customerNumber || row.leadId || `ID-${idx + 1}`;
                      const custName = row.customerName || 'Customer Record';
                      const mob = row.mobile || '';
                      const em = row.email || '';
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
                              {mob && (
                                <span className="font-mono text-gray-700 flex items-center gap-1">
                                  <FaPhoneAlt className="text-gray-400 text-[9px]" /> {mob}
                                </span>
                              )}
                              {em && (
                                <span className="text-gray-500 flex items-center gap-1 truncate max-w-[180px]" title={em}>
                                  <FaEnvelope className="text-gray-400 text-[9px]" /> {em}
                                </span>
                              )}
                              {!mob && !em && (
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
                                  {formatDisplayVal(row.vehicle)}
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
                                {row.vip ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-extrabold text-[10px] border border-amber-300">
                                    <FaCrown className="text-[9px]" /> VIP Member
                                  </span>
                                ) : (
                                  <span className="text-gray-500 text-[10px]">Standard</span>
                                )}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap text-gray-600">
                                {row.spend || row.purchaseCount 
                                  ? `Spend: ${row.spend || 'N/A'} | Orders: ${row.purchaseCount || 'N/A'}`
                                  : 'Registered VIP'}
                              </td>
                            </>
                          )}

                          {activeSegmentTab === 'ev' && (
                            <>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span className="font-medium text-gray-800 flex items-center gap-1">
                                  <FaCar className="text-gray-400 text-[10px]" />
                                  {formatDisplayVal(row.vehicle)}
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
                              <td className="py-3 px-3 whitespace-nowrap">
                                {row.doNotContact ? (
                                  <span className="text-rose-600 font-bold text-[10px]">Do Not Contact</span>
                                ) : (
                                  <span className="text-emerald-700 font-semibold text-[10px]">Contact Allowed</span>
                                )}
                              </td>
                            </>
                          )}

                          {activeSegmentTab === 'inactive' && (
                            <>
                              <td className="py-3 px-3 whitespace-nowrap text-gray-700">
                                {formatDisplayVal(row.leadSource || row.source)}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap text-gray-600 font-mono">
                                {formatDisplayVal(row.leadCreatedAt || row.createdAt ? (row.leadCreatedAt || row.createdAt).slice(0, 10) : null)}
                              </td>
                            </>
                          )}

                          {activeSegmentTab === 'insurance' && (
                            <>
                              <td className="py-3 px-3 whitespace-nowrap text-gray-800">
                                {formatDisplayVal(row.vehicle)}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap text-gray-700">
                                {formatDisplayVal(row.provider ? `${row.provider}${row.contractNumber ? ` (${row.contractNumber})` : ''}` : row.contractNumber)}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap font-mono text-rose-600 font-bold">
                                {formatDisplayVal(row.expiryDate)}
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
          )}
        </>
      )}
    </div>
  );
}
