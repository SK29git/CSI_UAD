import React from 'react';
import { FaFileDownload, FaChartLine, FaPercentage, FaMoneyBillWave, FaSmile } from 'react-icons/fa';

export default function ReportsView() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-5">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FaChartLine className="text-blue-600" /> Complaint Analytics & Branch Performance Report
          </h2>
          <p className="text-xs text-gray-500">Monthly resolution rate, cost impact, and customer satisfaction metrics</p>
        </div>

        <button className="bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1.5">
          <FaFileDownload className="text-xs" /> Export PDF / CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
          <span className="text-gray-400 block font-semibold text-[11px]">Monthly Total Volume</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">36 Cases</span>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
            ↓ 12% vs last month
          </span>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
          <span className="text-gray-400 block font-semibold text-[11px]">SLA Compliance Rate</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">88%</span>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
            ↑ 4% improvement
          </span>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
          <span className="text-gray-400 block font-semibold text-[11px]">First Contact Resolution</span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">64%</span>
          <span className="text-[10px] text-gray-400 font-medium mt-1 block">Target: 70%</span>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
          <span className="text-gray-400 block font-semibold text-[11px]">Total Goodwill Paid</span>
          <span className="text-2xl font-black text-purple-700 mt-1 block">AED 12,450</span>
          <span className="text-[10px] text-gray-400 font-medium mt-1 block">Across 5 cases</span>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
        <h3 className="font-bold text-gray-800 text-xs mb-3">Complaints Trend & SLA Compliance (Jan - May 2026)</h3>
        
        <div className="h-44 flex items-end justify-between gap-4 pt-6 px-4">
          {[
            { month: 'Jan', count: 48, sla: '82%' },
            { month: 'Feb', count: 42, sla: '85%' },
            { month: 'Mar', count: 39, sla: '84%' },
            { month: 'Apr', count: 41, sla: '86%' },
            { month: 'May', count: 36, sla: '88%' },
          ].map((bar) => (
            <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div className="w-full max-w-[48px] bg-blue-600/80 rounded-t-md hover:bg-blue-600 transition-all relative group" style={{ height: `${(bar.count / 50) * 100}%` }}>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                  {bar.count} cases ({bar.sla} SLA)
                </span>
              </div>
              <span className="text-[11px] font-bold text-gray-600">{bar.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
