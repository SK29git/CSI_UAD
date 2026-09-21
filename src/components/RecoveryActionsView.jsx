import React, { useState } from 'react';
import { FaCar, FaTicketAlt, FaPhoneVolume, FaGift, FaCheckCircle, FaPlus, FaClock } from 'react-icons/fa';

export default function RecoveryActionsView() {
  const [actions, setActions] = useState([
    { id: 1, title: 'Courtesy Vehicle Offered (SUV Class)', type: 'Vehicle', status: 'Completed', cost: 'AED 350 / day', date: '18 May 2026', icon: <FaCar /> },
    { id: 2, title: 'Service Voucher (20% Off Next Maintenance)', type: 'Voucher', status: 'Approved', cost: 'AED 450', date: '18 May 2026', icon: <FaTicketAlt /> },
    { id: 3, title: 'Service Manager Direct Callback', type: 'Communication', status: 'Pending', cost: 'N/A', date: '19 May 2026', icon: <FaPhoneVolume /> },
    { id: 4, title: 'Goodwill Compensation (Parts Discount)', type: 'Compensation', status: 'Approved', cost: 'AED 1,200', date: '18 May 2026', icon: <FaGift /> },
  ]);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FaGift className="text-emerald-600" /> Customer Recovery & Goodwill Management
          </h2>
          <p className="text-xs text-gray-500">Track and dispatch compensation vouchers, courtesy cars, and executive callbacks</p>
        </div>

        <button className="bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1">
          <FaPlus className="text-[10px]" /> Add Action
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((act) => (
          <div key={act.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
                  {act.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xs">{act.title}</h3>
                  <span className="text-[10px] text-gray-400 font-medium">{act.date} • {act.cost}</span>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                act.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                act.status === 'Approved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {act.status === 'Completed' && <FaCheckCircle className="text-[9px]" />}
                {act.status === 'Pending' && <FaClock className="text-[9px]" />}
                {act.status}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200/60">
              <button className="text-[11px] font-bold text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded hover:bg-gray-50">
                View Receipt
              </button>
              {act.status === 'Pending' && (
                <button className="text-[11px] font-bold text-white bg-emerald-600 px-2.5 py-1 rounded hover:bg-emerald-700">
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
