import React from 'react';
import { FaUserShield, FaExclamationTriangle, FaCheckCircle, FaArrowUp, FaUsersCog } from 'react-icons/fa';

export default function EscalationsView() {
  const escalations = [
    {
      id: 'CMP-784512',
      title: 'Delayed Spare Parts - Sheikh Zayed Road Branch',
      level: 'Level 3 - Complaints Manager',
      escalatedBy: 'Sara Ahmed (Service Advisor)',
      escalatedTo: 'Complaints Desk Manager',
      date: '18 May 2026, 12:05 PM',
      risk: 'High',
      status: 'In Progress',
      note: 'Parts backordered from European warehouse, ETA updated to 2 days.'
    },
    {
      id: 'CMP-780123',
      title: 'Advisor Miscommunication on Warranty Coverage',
      level: 'Level 2 - Branch Manager',
      escalatedBy: 'Customer Support Lead',
      escalatedTo: 'Sheikh Zayed Branch Manager',
      date: '17 May 2026, 03:30 PM',
      risk: 'High',
      status: 'Under Review',
      note: 'Branch Manager negotiating 50% goodwill coverage on labor.'
    },
    {
      id: 'CMP-774102',
      title: 'Repeated AC Failure After 2 Repairs',
      level: 'Level 4 - Customer Experience Director',
      escalatedBy: 'Branch Manager',
      escalatedTo: 'Customer Experience Director',
      date: '15 May 2026, 09:15 AM',
      risk: 'Critical',
      status: 'Escalated',
      note: 'Vehicle replacement request under discussion.'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FaUserShield className="text-amber-500" /> Escalated Cases (3 Active)
          </h2>
          <p className="text-xs text-gray-500">Monitor active escalations across managerial levels and resolution paths</p>
        </div>
        <button className="bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-xs">
          + New Escalation Ticket
        </button>
      </div>

      <div className="space-y-4">
        {escalations.map((esc) => (
          <div key={esc.id} className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-black text-blue-600 text-sm">{esc.id}</span>
                <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded">
                  {esc.level}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  esc.risk === 'Critical' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700'
                }`}>
                  {esc.risk} Risk
                </span>
              </div>
              <span className="text-gray-400 text-xs font-semibold">{esc.date}</span>
            </div>

            <h3 className="font-bold text-gray-900 text-sm">{esc.title}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-gray-100">
              <div>
                <span className="text-gray-400 block text-[10px]">Escalated By</span>
                <span className="font-semibold text-gray-800">{esc.escalatedBy}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Escalated To</span>
                <span className="font-semibold text-gray-800">{esc.escalatedTo}</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 italic bg-amber-100/50 p-2 rounded">
              "{esc.note}"
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button className="text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1 rounded hover:bg-gray-50">
                Reassign Manager
              </button>
              <button className="text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">
                Take Action
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
