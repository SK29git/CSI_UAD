import React, { useState, useEffect, useCallback } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { getCustomerComplaintsByStatus } from '../utils/api';
import { 
  FaFolderOpen, 
  FaCheckCircle, 
  FaInbox,
  FaSpinner, 
  FaRedo,
  FaSearch,
  FaBuilding,
  FaUserTie,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTag
} from 'react-icons/fa';

export default function OverviewView() {
  const { customer, setOpenComplaintsCount, group: contextGroup } = useCustomer();
  
  // Extract customerNumber and group from customer context or URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const paramCustomer = searchParams.get('Complaint') || searchParams.get('complaint') || searchParams.get('customerNumber') || searchParams.get('customerId') || searchParams.get('customer');
  const customerNumber = customer?.customerNumber || customer?.id || paramCustomer || "178760";
  const group = contextGroup || customer?.keyloopGroup || searchParams.get('group') || "BMW";

  // 3 Complaints State Arrays (All, Open, Closed)
  const [allComplaints, setAllComplaints] = useState([]);
  const [openComplaints, setOpenComplaints] = useState([]);
  const [closedComplaints, setClosedComplaints] = useState([]);

  // Active view tab: 'all' | 'open' | 'closed'
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Fires the Complaints API 3 times:
   * 1. Blank status -> All records
   * 2. status=open -> Open records
   * 3. status=closed -> Closed records
   */
  const fetchAllComplaintStatuses = useCallback(async () => {
    if (!customerNumber) return;
    setLoading(true);

    try {
      const [allRes, openRes, closedRes] = await Promise.all([
        getCustomerComplaintsByStatus(group, customerNumber, ""),
        getCustomerComplaintsByStatus(group, customerNumber, "open"),
        getCustomerComplaintsByStatus(group, customerNumber, "closed")
      ]);

      const allData = allRes?.ok && Array.isArray(allRes.data) ? allRes.data : [];
      const openData = openRes?.ok && Array.isArray(openRes.data) ? openRes.data : [];
      const closedData = closedRes?.ok && Array.isArray(closedRes.data) ? closedRes.data : [];

      setAllComplaints(allData);
      setOpenComplaints(openData);
      setClosedComplaints(closedData);

      // Keep open complaints counter in sync in context
      if (typeof setOpenComplaintsCount === 'function') {
        setOpenComplaintsCount(openData.length);
      }

      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error("Failed to load customer complaints:", err);
    } finally {
      setLoading(false);
    }
  }, [group, customerNumber, setOpenComplaintsCount]);

  useEffect(() => {
    fetchAllComplaintStatuses();
  }, [fetchAllComplaintStatuses]);

  // Determine current active dataset based on activeTab
  const currentList = activeTab === 'open' 
    ? openComplaints 
    : activeTab === 'closed' 
      ? closedComplaints 
      : allComplaints;

  // Filter complaints by search query
  const filteredComplaints = currentList.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.complaintId && item.complaintId.toLowerCase().includes(q)) ||
      (item.department && item.department.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.owner && item.owner.toLowerCase().includes(q)) ||
      (item.raisedBy && item.raisedBy.toLowerCase().includes(q)) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      (item.resolution && item.resolution.toLowerCase().includes(q)) ||
      (item.status && item.status.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-4">
      
      {/* Top Header Card: Summary & Refresh */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-gray-100 gap-2 mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <span>Customer Complaint Summary</span>
              <span className="text-xs font-normal text-gray-500">
                (Customer #{customerNumber} &bull; {group})
              </span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Live customer complaint overview queried across All, Open, and Closed statuses
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-[11px] text-gray-400">
                Updated: {lastUpdated}
              </span>
            )}
            <button 
              onClick={fetchAllComplaintStatuses}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer disabled:opacity-50"
              title="Refresh All Complaint Statuses"
            >
              <FaRedo className={`text-xs ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards / Interactive Tabs: All, Open, Closed */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* 1. All Complaints Card */}
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`text-left p-4 rounded-xl border transition cursor-pointer relative overflow-hidden ${
              activeTab === 'all'
                ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-400/40 shadow-sm'
                : 'bg-white border-gray-200 hover:bg-gray-50/70 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider block">
                  All Complaints
                </span>
                <span className="text-2xl font-black text-gray-900 mt-1 block">
                  {loading ? '...' : allComplaints.length}
                </span>
                <span className="text-[11px] text-gray-500 mt-0.5 block">
                  Total records filed
                </span>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <FaInbox />
              </div>
            </div>
            {activeTab === 'all' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" />
            )}
          </button>

          {/* 2. Open Complaints Card */}
          <button
            type="button"
            onClick={() => setActiveTab('open')}
            className={`text-left p-4 rounded-xl border transition cursor-pointer relative overflow-hidden ${
              activeTab === 'open'
                ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-400/40 shadow-sm'
                : 'bg-white border-gray-200 hover:bg-gray-50/70 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-amber-700 text-[10px] uppercase font-bold tracking-wider block">
                  Open Complaints
                </span>
                <span className="text-2xl font-black text-amber-600 mt-1 block">
                  {loading ? '...' : openComplaints.length}
                </span>
                <span className="text-[11px] text-gray-500 mt-0.5 block">
                  Active unresolved tickets
                </span>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                activeTab === 'open' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600'
              }`}>
                <FaFolderOpen />
              </div>
            </div>
            {activeTab === 'open' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
            )}
          </button>

          {/* 3. Closed Complaints Card */}
          <button
            type="button"
            onClick={() => setActiveTab('closed')}
            className={`text-left p-4 rounded-xl border transition cursor-pointer relative overflow-hidden ${
              activeTab === 'closed'
                ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-400/40 shadow-sm'
                : 'bg-white border-gray-200 hover:bg-gray-50/70 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-emerald-700 text-[10px] uppercase font-bold tracking-wider block">
                  Closed Complaints
                </span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                  {loading ? '...' : closedComplaints.length}
                </span>
                <span className="text-[11px] text-gray-500 mt-0.5 block">
                  Resolved &amp; closed cases
                </span>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                activeTab === 'closed' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600'
              }`}>
                <FaCheckCircle />
              </div>
            </div>
            {activeTab === 'closed' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600" />
            )}
          </button>

        </div>
      </div>

      {/* Complaints Table Section */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200">
        
        {/* Table Filter Tabs & Search Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-3 mb-4">
          
          {/* Tab Selection Buttons */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Records ({allComplaints.length})
            </button>
            <button
              onClick={() => setActiveTab('open')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                activeTab === 'open'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Open ({openComplaints.length})
            </button>
            <button
              onClick={() => setActiveTab('closed')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                activeTab === 'closed'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Closed ({closedComplaints.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, department, owner..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
          </div>

        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
            <FaSpinner className="animate-spin text-2xl text-blue-600" />
            <span className="text-xs font-medium">Fetching complaints from CCaaS...</span>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="py-10 text-center text-gray-500 bg-gray-50/60 rounded-xl border border-dashed border-gray-200 text-xs">
            {searchQuery ? (
              <span>No matching records found for "{searchQuery}".</span>
            ) : (
              <span>No {activeTab !== 'all' ? activeTab : ''} complaints found for customer #{customerNumber}.</span>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-3">Complaint ID</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Owner / Raised By</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Raised Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Resolution / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
                {filteredComplaints.map((item, idx) => {
                  const isOpen = item.open === true || String(item.status).toUpperCase() === 'OPEN';
                  return (
                    <tr key={item.complaintId || idx} className="hover:bg-gray-50/80 transition-colors">
                      {/* Complaint ID */}
                      <td className="py-3 px-3 font-mono font-bold text-blue-600 whitespace-nowrap">
                        {item.complaintId || `CMP-${idx+1}`}
                      </td>

                      {/* Department */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                          <FaBuilding className="text-gray-400 text-[10px]" />
                          <span>{item.department || 'General'}</span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-3 max-w-[240px]">
                        <span className="line-clamp-2 text-gray-800" title={item.description || ''}>
                          {item.description || 'No description provided'}
                        </span>
                      </td>

                      {/* Owner / Raised By */}
                      <td className="py-3 px-3 whitespace-nowrap text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <FaUserTie className="text-gray-400 text-[10px]" />
                          <span>{item.owner || item.raisedBy || 'Unassigned'}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 whitespace-nowrap text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <FaMapMarkerAlt className="text-gray-400 text-[10px]" />
                          <span>{item.location || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Raised Date */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <FaCalendarAlt className="text-gray-400 text-[10px]" />
                          <span>{item.raisedDate || (item.createdAt ? item.createdAt.slice(0, 10) : 'N/A')}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isOpen
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {item.status || (isOpen ? 'OPEN' : 'CLOSED')}
                        </span>
                      </td>

                      {/* Resolution / Details */}
                      <td className="py-3 px-3 max-w-[220px]">
                        {item.resolution ? (
                          <div className="text-[11px] text-gray-700 bg-gray-50 p-1.5 rounded border border-gray-100">
                            <span className="font-semibold text-gray-900 block">
                              {item.resolution}
                            </span>
                            {item.closedDate && (
                              <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
                                Closed: {item.closedDate}
                              </span>
                            )}
                          </div>
                        ) : isOpen ? (
                          <span className="text-[10px] text-amber-600 font-medium">In Progress</span>
                        ) : (
                          <span className="text-gray-400 text-[10px]">&mdash;</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
