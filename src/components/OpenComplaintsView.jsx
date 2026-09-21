import React, { useState } from 'react';
import { FaSearch, FaFilter, FaExclamationTriangle, FaEye } from 'react-icons/fa';

export default function OpenComplaintsView() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const openComplaints = [
    { id: 'CMP-784512', category: 'Service', subcategory: 'Parts Availability', priority: 'High', status: 'Escalated', assigned: 'Complaints Desk', due: '20 May 2026, 05:00 PM', slaStatus: 'At Risk' },
    { id: 'CMP-784910', category: 'Maintenance', subcategory: 'Oil Change Delay', priority: 'Medium', status: 'In Progress', assigned: 'Service Desk A', due: '21 May 2026, 11:00 AM', slaStatus: 'On Track' },
    { id: 'CMP-783401', category: 'Billing', subcategory: 'Warranty Claim', priority: 'High', status: 'Under Review', assigned: 'Finance Dept', due: '19 May 2026, 02:00 PM', slaStatus: 'Overdue' },
    { id: 'CMP-782110', category: 'Body Shop', subcategory: 'Paint Quality', priority: 'Low', status: 'Assigned', assigned: 'Body Repair Team', due: '24 May 2026, 04:00 PM', slaStatus: 'On Track' },
    { id: 'CMP-781992', category: 'Service', subcategory: 'AC Cooling', priority: 'Medium', status: 'In Progress', assigned: 'Technician Team 3', due: '22 May 2026, 10:00 AM', slaStatus: 'On Track' },
    { id: 'CMP-780123', category: 'Customer Relations', subcategory: 'Advisor Conduct', priority: 'High', status: 'Escalated', assigned: 'Branch Manager', due: '20 May 2026, 06:00 PM', slaStatus: 'At Risk' },
    { id: 'CMP-779841', category: 'Parts', subcategory: 'Brake Pad Backorder', priority: 'Medium', status: 'Pending Customer', assigned: 'Inventory Manager', due: '23 May 2026, 01:00 PM', slaStatus: 'On Track' },
    { id: 'CMP-778210', category: 'Electrical', subcategory: 'Battery Drain', priority: 'Low', status: 'In Progress', assigned: 'Diag Specialist', due: '25 May 2026, 03:00 PM', slaStatus: 'On Track' },
  ];

  const filtered = openComplaints.filter(c => 
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subcategory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Open Complaints (8 Active)</h2>
          <p className="text-xs text-gray-500">Filtered list of active complaints registered for Sumedh Kamble</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
            <input 
              type="text" 
              placeholder="Search by ID or Category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 w-56"
            />
          </div>
          <button className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-200">
            <FaFilter className="text-[10px]" /> Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-[10px] tracking-wider border-b border-gray-200">
            <tr>
              <th className="py-2.5 px-3">Complaint ID</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Subcategory</th>
              <th className="py-2.5 px-3">Priority</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Assigned To</th>
              <th className="py-2.5 px-3">SLA Due</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                <td className="py-3 px-3 font-bold text-blue-600">{item.id}</td>
                <td className="py-3 px-3">{item.category}</td>
                <td className="py-3 px-3 text-gray-600">{item.subcategory}</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.priority === 'High' ? 'bg-rose-100 text-rose-700' :
                    item.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {item.priority}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'Escalated' ? 'bg-red-100 text-red-700' :
                    item.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-gray-800 font-semibold">{item.assigned}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <span>{item.due}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      item.slaStatus === 'At Risk' ? 'bg-rose-100 text-rose-700' :
                      item.slaStatus === 'Overdue' ? 'bg-red-600 text-white' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.slaStatus}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  <button className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 ml-auto">
                    <FaEye className="text-xs" /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
