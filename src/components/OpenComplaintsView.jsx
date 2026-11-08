import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { getCustomerComplaintsByStatus, apiFetch } from '../utils/api';
import { 
  FaSearch, 
  FaFilter, 
  FaSpinner, 
  FaRedo, 
  FaExclamationTriangle, 
  FaEye,
  FaCalendarAlt,
  FaDesktop,
  FaTag,
  FaBuilding,
  FaUserTie,
  FaMapMarkerAlt
} from 'react-icons/fa';

export default function OpenComplaintsView() {
  const { customer, getFormattedName, setOpenComplaintsCount, group: contextGroup } = useCustomer();
  const customerName = getFormattedName();
  
  const customerNumber = customer?.customerNumber || customer?.id || "";
  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || "");

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Primary: Detailed Customer Complaints endpoint
      // GET /api/v1/complaints/{group}/customers/{customerNumber}?status=open
      const statusRes = await getCustomerComplaintsByStatus(group || 'BMW', customerNumber, 'open');

      if (statusRes && statusRes.ok && Array.isArray(statusRes.data) && statusRes.data.length > 0) {
        setComplaints(statusRes.data);
        if (setOpenComplaintsCount) setOpenComplaintsCount(statusRes.data.length);
        return;
      }

      // 2. Fallback: Query-param endpoint
      // GET /api/v1/complaints?group={group}&customerNumber={customerNumber}&status=open
      const apiUrl = `/api/v1/complaints?group=${group || 'BMW'}&customerNumber=${customerNumber}&status=open`;
      const res = await apiFetch(apiUrl);

      if (res && res.ok && Array.isArray(res.data)) {
        setComplaints(res.data);
        if (setOpenComplaintsCount) setOpenComplaintsCount(res.data.length);
      } else {
        setComplaints([]);
        if (setOpenComplaintsCount) setOpenComplaintsCount(0);
      }
    } catch (err) {
      console.warn("Failed to fetch open complaints:", err);
      setComplaints([]);
      if (setOpenComplaintsCount) setOpenComplaintsCount(0);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [customerNumber, group]);

  const filtered = complaints.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      (item.complaintId && item.complaintId.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query)) ||
      (item.department && item.department.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.raisedBy && item.raisedBy.toLowerCase().includes(query)) ||
      (item.location && String(item.location).toLowerCase().includes(query)) ||
      (item.source && item.source.toLowerCase().includes(query)) ||
      (item.origin && item.origin.toLowerCase().includes(query)) ||
      (item.status && item.status.toLowerCase().includes(query)) ||
      (item.raisedDate && item.raisedDate.toLowerCase().includes(query))
    );
  });

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200 flex flex-col gap-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-900">Open Complaints</h2>
            <span className="bg-rose-50 text-rose-600 border border-rose-200 font-bold text-[10px] px-2 py-0.5 rounded-full">
              {complaints.length} Active
            </span>
          </div>
          <p className="text-[11px] text-gray-500">
            Active complaints for customer <span className="font-semibold text-gray-800">{customerName || `#${customerNumber}`}</span> ({group} / {customerNumber})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
            <input 
              type="text" 
              placeholder="Search complaint ID or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 w-60"
            />
          </div>

          <button 
            onClick={fetchComplaints}
            title="Refresh Complaints"
            className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-gray-200 cursor-pointer"
          >
            <FaRedo className={`text-[10px] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
          <FaSpinner className="animate-spin text-xl text-blue-600" />
          <span className="text-xs font-medium">Loading open complaints...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <FaExclamationTriangle className="mx-auto text-gray-400 mb-2 text-base" />
          <p className="font-semibold text-xs text-gray-700">No Open Complaints Found</p>
          <p className="text-[11px] text-gray-400">No active escalation records match the selected customer filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-2xs">
          <table className="w-full text-center text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-3 text-center">Complaint ID</th>
                <th className="py-3 px-3 text-center">Category</th>
                <th className="py-3 px-3 text-center">Department</th>
                <th className="py-3 px-3 text-center">Description</th>
                <th className="py-3 px-3 text-center">Raised By</th>
                <th className="py-3 px-3 text-center">Location</th>
                <th className="py-3 px-3 text-center">Origin / Source</th>
                <th className="py-3 px-3 text-center">Raised Date</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filtered.map((item, idx) => (
                <tr key={item.complaintId || idx} className="hover:bg-blue-50/40 transition-colors">
                  {/* Complaint ID */}
                  <td className="py-3.5 px-3 text-center align-middle whitespace-nowrap">
                    <span className="font-mono font-bold text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-200 inline-block text-xs">
                      {item.complaintId || '-'}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-3 text-center align-middle font-semibold text-gray-900 whitespace-nowrap">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <FaTag className="text-gray-400 text-[10px]" />
                      <span>{item.category || '-'}</span>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-3.5 px-3 text-center align-middle font-semibold text-gray-800 whitespace-nowrap">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <FaBuilding className="text-gray-400 text-[10px]" />
                      <span>{item.department || '-'}</span>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-3 text-center align-middle text-gray-700 text-xs min-w-[200px] max-w-sm">
                    <div className="inline-block text-center leading-relaxed" title={item.description || ''}>
                      {item.description || '-'}
                    </div>
                  </td>

                  {/* Raised By */}
                  <td className="py-3.5 px-3 text-center align-middle text-gray-700 font-mono text-[11px] whitespace-nowrap">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <FaUserTie className="text-gray-400 text-[10px]" />
                      <span>{item.raisedBy || item.owner || '-'}</span>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-3 text-center align-middle text-gray-600 whitespace-nowrap">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <FaMapMarkerAlt className="text-gray-400 text-[10px]" />
                      <span>{item.location || '-'}</span>
                    </div>
                  </td>

                  {/* Origin / Source */}
                  <td className="py-3.5 px-3 text-center align-middle text-gray-600 uppercase font-semibold text-[10px] whitespace-nowrap">
                    <div className="inline-flex items-center justify-center gap-1 text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                      <FaDesktop className="text-[10px]" />
                      <span>{item.source || item.origin || '-'}</span>
                    </div>
                  </td>

                  {/* Raised Date */}
                  <td className="py-3.5 px-3 text-center align-middle text-gray-600 font-mono text-[11px] whitespace-nowrap">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <FaCalendarAlt className="text-gray-400 text-[10px]" />
                      <span>{item.raisedDate || (item.createdAt ? item.createdAt.slice(0, 10) : item.openDate || '-')}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 text-center align-middle whitespace-nowrap">
                    <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                      {item.status || 'OPEN'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
