import React, { useState, useEffect } from 'react';
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
  FaSyncAlt,
  FaInfoCircle
} from 'react-icons/fa';

export default function SalesSegmentsView() {
  const { customer } = useCustomer();
  const group = customer?.keyloopGroup || "BMW";

  const [activeSegmentTab, setActiveSegmentTab] = useState('Upgrade');
  const [segmentData, setSegmentData] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatDisplayVal = (val, fallback = 'N/A') => {
    if (val === null || val === undefined || val === '') return fallback;
    if (typeof val === 'object') {
      if (val.name) return val.name;
      if (val.description) return val.description;
      return JSON.stringify(val);
    }
    return String(val);
  };

  const fetchSegment = async (segmentType) => {
    setActiveSegmentTab(segmentType);
    setLoading(true);
    setSegmentData([]);

    try {
      let endpoint = `/api/v1/segments/upgrade?group=${group}&minMileageKm=60000&minAgeYears=4`;
      if (segmentType === 'InsuranceExpiring') endpoint = `/api/v1/segments/insurance-expiring?group=${group}&withinDays=30`;
      if (segmentType === 'Renewal') endpoint = `/api/v1/segments/insurance-expiring?group=${group}&withinDays=30`;
      if (segmentType === 'Birthdays') {
        const currentMonth = new Date().getMonth() + 1;
        endpoint = `/api/v1/segments/birthdays?group=${group}&month=${currentMonth}`;
      }
      if (segmentType === 'EV') endpoint = `/api/v1/segments/ev-customers?group=${group}`;
      if (segmentType === 'Inactive') endpoint = `/api/v1/segments/inactive-leads?group=${group}&olderThanDays=30`;
      if (segmentType === 'VIP') endpoint = `/api/v1/segments/vip-customers?group=${group}`;

      const res = await apiFetch(endpoint);
      if (res && res.ok && Array.isArray(res.data)) {
        setSegmentData(res.data);
      } else {
        setSegmentData([]);
      }
    } catch (err) {
      console.warn("Failed to fetch segment data:", err);
      setSegmentData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegment('Upgrade');
  }, [group]);

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
              <h2 className="text-base font-bold text-gray-900 leading-tight">Customer Segments & Targeting</h2>
              <span className="bg-purple-50 text-purple-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-purple-200">
                {group}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium">
              Dynamic customer segment extraction & opportunity targeting
            </p>
          </div>
        </div>

        <button 
          onClick={() => fetchSegment(activeSegmentTab)}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer flex items-center gap-1 font-medium text-xs self-start sm:self-auto"
          title="Refresh Segment"
        >
          <FaRedo className={`text-xs ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Segment Selector Tabs - Covering all 7 Postman Segment Endpoints */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => fetchSegment('Upgrade')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
            activeSegmentTab === 'Upgrade' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaExchangeAlt className="text-xs" /> Upgrade Prospects
        </button>

        <button
          onClick={() => fetchSegment('InsuranceExpiring')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
            activeSegmentTab === 'InsuranceExpiring' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaShieldAlt className="text-xs" /> Insurance Expiring
        </button>

        <button
          onClick={() => fetchSegment('Renewal')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
            activeSegmentTab === 'Renewal' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaSyncAlt className="text-xs" /> Push Renewals
        </button>

        <button
          onClick={() => fetchSegment('Birthdays')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
            activeSegmentTab === 'Birthdays' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaBirthdayCake className="text-xs" /> Birthdays
        </button>

        <button
          onClick={() => fetchSegment('EV')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
            activeSegmentTab === 'EV' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaBolt className="text-xs" /> EV Customers
        </button>

        <button
          onClick={() => fetchSegment('Inactive')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
            activeSegmentTab === 'Inactive' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaUserClock className="text-xs" /> Inactive Leads
        </button>

        <button
          onClick={() => fetchSegment('VIP')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
            activeSegmentTab === 'VIP' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaCrown className="text-xs" /> VIP Customers
        </button>
      </div>

      {/* Segment Data Table */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
          <FaSpinner className="animate-spin text-2xl text-purple-600" />
          <span className="text-xs font-medium">Extracting customer segment data...</span>
        </div>
      ) : segmentData.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-1">
          <FaInfoCircle className="mx-auto text-xl text-gray-300 mb-1" />
          <p className="font-bold text-gray-700 text-xs">No customer records returned for this segment.</p>
          <p className="text-[11px] text-gray-400">There are currently no active records matching the selected segment criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[9px] border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3">Cust #</th>
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Segment Detail / Vehicle</th>
                <th className="py-2.5 px-3">Key Metric</th>
                <th className="py-2.5 px-3">Targeting Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
              {segmentData.map((row, idx) => {
                const custNo = row.customerNumber || row.prospectNumber || row.id || `CUST-${idx+1}`;
                const custName = row.fullName || row.name || row.customerName || 'Customer Record';
                const detail = row.vehicle || row.description || row.model || row.policyNumber || row.lastEnquiry || 'Vehicle / Segment Info';
                const keyMetric = row.mileageKm ? `${row.mileageKm.toLocaleString()} KM` : (row.expiryDate || row.dob || row.lastContact || row.tier || row.ageYears ? `${row.ageYears} Yrs` : 'Eligible');
                const statusLabel = row.likelihood || row.status || row.targetingStatus || 'MATCHED';

                return (
                  <tr key={idx} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-purple-700">{formatDisplayVal(custNo)}</td>
                    <td className="py-3 px-3 font-bold text-gray-900">{formatDisplayVal(custName)}</td>
                    <td className="py-3 px-3 text-gray-800">{formatDisplayVal(detail)}</td>
                    <td className="py-3 px-3 font-semibold text-gray-900">{formatDisplayVal(keyMetric)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 uppercase">
                        {formatDisplayVal(statusLabel)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
