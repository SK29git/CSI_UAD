import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaFolderOpen, 
  FaExclamationCircle, 
  FaCheckCircle, 
  FaClock, 
  FaTag,
  FaSpinner,
  FaRedo
} from 'react-icons/fa';

export default function OverviewView() {
  const { customer, openComplaintsCount, setOpenComplaintsCount, group: contextGroup } = useCustomer();
  const customerNumber = customer?.customerNumber || customer?.id || "";
  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || "");

  const [summaryData, setSummaryData] = useState({
    keyloopGroup: group,
    branch: customer?.branchCode || "10",
    openComplaints: openComplaintsCount || 4,
    resolvedToday: 0,
    slaBreaches: 0
  });
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [openComplaints, setOpenComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);

  const fetchSummary = async () => {
    const g = customer?.keyloopGroup || "";
    const b = customer?.branchCode || '10';
    setSummaryLoading(true);
    try {
      const apiUrl = `/api/v1/complaints/summary?group=${g}&branch=${b}`;
      const res = await apiFetch(apiUrl);
      if (res && res.ok && res.data && typeof res.data === 'object') {
        setSummaryData(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch complaint summary:", err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchOpenComplaints = async () => {
    setComplaintsLoading(true);
    try {
      const apiUrl = `/api/v1/complaints?group=${group}&customerNumber=${customerNumber}&status=open`;
      const res = await apiFetch(apiUrl);

      if (res && res.ok && Array.isArray(res.data)) {
        setOpenComplaints(res.data);
        if (setOpenComplaintsCount) setOpenComplaintsCount(res.data.length);
      } else {
        setOpenComplaints([]);
      }
    } catch (err) {
      console.warn("Failed to fetch open complaints:", err);
      setOpenComplaints([]);
    } finally {
      setComplaintsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchOpenComplaints();
  }, [customerNumber, group]);

  return (
    <div className="flex flex-col gap-4">
      
      {/* 1. Summary Cards (Driven strictly by GET /api/v1/complaints/summary) */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-sm">Complaint Summary</h3>
            <span className="text-xs font-semibold text-gray-400">Group: {summaryData.keyloopGroup || group} | Branch: {summaryData.branch || '10'}</span>
          </div>
          <button 
            onClick={() => { fetchSummary(); fetchOpenComplaints(); }}
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Refresh Summary"
          >
            <FaRedo className={`text-xs ${summaryLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Open Complaints</span>
              <span className="text-2xl font-black text-blue-700 mt-0.5 block">
                {summaryData.openComplaints ?? openComplaintsCount ?? 0}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <FaFolderOpen />
            </div>
          </div>

          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Resolved Today</span>
              <span className="text-2xl font-black text-emerald-700 mt-0.5 block">
                {summaryData.resolvedToday ?? 0}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <FaCheckCircle />
            </div>
          </div>

          <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100 flex items-center justify-between">
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block">SLA Breaches</span>
              <span className="text-2xl font-black text-rose-700 mt-0.5 block">
                {summaryData.slaBreaches ?? 0}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
              <FaExclamationCircle />
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Active Customer</span>
              <span className="text-xs font-bold text-gray-900 mt-1 block truncate max-w-[120px]">
                Cust #{customerNumber}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
              {group}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Customer Active Complaints Table (Driven strictly by GET /api/v1/complaints?status=open) */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
          <h3 className="font-bold text-gray-900 text-sm">Customer Open Tickets</h3>
          <span className="text-xs text-gray-500 font-semibold">{openComplaints.length} Records</span>
        </div>

        {complaintsLoading ? (
          <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
            <FaSpinner className="animate-spin text-xl text-blue-600" />
            <span className="text-xs font-medium">Loading complaints...</span>
          </div>
        ) : openComplaints.length === 0 ? (
          <div className="py-8 text-center text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-xs">
            No active open complaints for customer #{customerNumber}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase text-[9px] font-bold border-b border-gray-100">
                <tr>
                  <th className="py-2.5 px-3">Complaint ID</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Open Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">SLA Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
                {openComplaints.map((item, idx) => (
                  <tr key={item.complaintId || idx} className="hover:bg-gray-50">
                    <td className="py-3 px-3 font-mono font-bold text-blue-600">{item.complaintId || `AGMC-${idx+1}`}</td>
                    <td className="py-3 px-3 font-semibold text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <FaTag className="text-gray-400 text-[10px]" />
                        <span>{item.category || 'General'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.priority === 'HIGH' || item.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.priority || 'NORMAL'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-500">{item.openDate || 'N/A'}</td>
                    <td className="py-3 px-3">
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                        {item.status || 'OPEN'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{item.slaDue || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
