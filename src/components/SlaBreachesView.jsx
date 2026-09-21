import React from 'react';
import { FaExclamationCircle, FaClock, FaCalendarTimes, FaShieldAlt } from 'react-icons/fa';

export default function SlaBreachesView() {
  const breaches = [
    {
      id: 'CMP-783401',
      title: 'Warranty Claim Verification Overdue',
      breachTime: '4 Hours 12 Mins Overdue',
      originalSla: '19 May 2026, 02:00 PM',
      department: 'Finance & Claims',
      owner: 'Tariq Mansoor',
      reason: 'Awaiting secondary audit approval'
    },
    {
      id: 'CMP-779011',
      title: 'Body Shop Paint Repair Delay',
      breachTime: '1 Day 6 Hours Overdue',
      originalSla: '17 May 2026, 05:00 PM',
      department: 'Body Shop Division',
      owner: 'Khalid Al Hashmi',
      reason: 'Specialized color mix delay from supplier'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FaExclamationCircle className="text-rose-600" /> SLA Breaches (2 Active Breaches)
          </h2>
          <p className="text-xs text-gray-500">Tickets exceeding committed service level agreements requiring immediate intervention</p>
        </div>
      </div>

      <div className="space-y-4">
        {breaches.map((b) => (
          <div key={b.id} className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-black text-rose-600 text-sm">{b.id}</span>
                <span className="bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                  <FaClock className="text-[9px]" /> {b.breachTime}
                </span>
              </div>
              <span className="text-gray-500 text-xs font-medium">Original Due: {b.originalSla}</span>
            </div>

            <h3 className="font-bold text-gray-900 text-sm">{b.title}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-gray-200">
              <div>
                <span className="text-gray-400 block text-[10px]">Responsible Department</span>
                <span className="font-bold text-gray-800">{b.department}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Case Owner</span>
                <span className="font-bold text-gray-800">{b.owner}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 block text-[10px]">Primary Delay Reason</span>
                <span className="font-semibold text-rose-700">{b.reason}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button className="text-xs font-bold text-rose-700 bg-white border border-rose-200 px-3 py-1.5 rounded hover:bg-rose-50">
                Grant SLA Extension
              </button>
              <button className="text-xs font-bold text-white bg-rose-600 px-3 py-1.5 rounded hover:bg-rose-700">
                Priority Escalate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
