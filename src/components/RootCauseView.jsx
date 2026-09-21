import React from 'react';
import { FaChartPie, FaCogs, FaClock, FaRedo } from 'react-icons/fa';

export default function RootCauseView() {
  const breakdown = [
    { cause: 'Delayed Spare Parts Shipment', percentage: 42, count: 15, color: 'bg-rose-500' },
    { cause: 'Advisor Follow-up & Communication Delay', percentage: 28, count: 10, color: 'bg-amber-500' },
    { cause: 'Technician Resource Scheduling Bottleneck', percentage: 18, count: 6, color: 'bg-blue-500' },
    { cause: 'Third-party Warranty Approval Delay', percentage: 12, count: 4, color: 'bg-purple-500' },
  ];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FaChartPie className="text-purple-600" /> Root Cause Breakdown & Pareto Analysis
          </h2>
          <p className="text-xs text-gray-500">Categorized drivers of customer dissatisfaction for Sumedh Kamble and branch services</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pareto Progress bars */}
        <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-800 text-sm">Primary Complaint Causes (Last 90 Days)</h3>
          {breakdown.map((item) => (
            <div key={item.cause} className="space-y-1 text-xs">
              <div className="flex justify-between font-semibold text-gray-700">
                <span>{item.cause}</span>
                <span>{item.percentage}% ({item.count} cases)</span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Preventive Action Recommendations */}
        <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-1.5">
              <FaCogs className="text-blue-600" /> Systemic Improvements
            </h3>
            <ul className="space-y-2 text-xs text-gray-700 list-disc list-inside">
              <li>Enable automated SMS/WhatsApp alerts for parts shipment status.</li>
              <li>Establish guaranteed 24-hour backup stock for high-demand brake & filter components.</li>
              <li>Mandate advisor callback SLA of maximum 3 hours for high-tier customers.</li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-blue-200/60 flex justify-between items-center text-xs">
            <span className="text-gray-500 font-medium">Recurrence Risk Index</span>
            <span className="font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded">High (6 Similar)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
