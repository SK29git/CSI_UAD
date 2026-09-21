import React from 'react';
import { 
  FaStar, 
  FaChartLine, 
  FaArrowDown, 
  FaArrowUp, 
  FaCheckCircle, 
  FaCommentAlt, 
  FaEnvelope, 
  FaWhatsapp, 
  FaSms, 
  FaChartPie 
} from 'react-icons/fa';

export default function FeedbackOverviewView() {
  const feedbacks = [
    { type: 'CSI', ref: 'JOB-784512', score: '4 / 5', isGood: false, comment: 'Service advisor was helpful but waiting time was long.', date: '12 May 2024', channel: 'SMS', status: 'Completed' },
    { type: 'NPS', ref: 'NPS-10234', score: '9', isGood: true, comment: 'Very satisfied with the service experience.', date: '10 May 2024', channel: 'WhatsApp', status: 'Completed' },
    { type: 'CSI', ref: 'JOB-784498', score: '2 / 5', isGood: false, comment: 'Issue not resolved in first visit.', date: '08 May 2024', channel: 'SMS', status: 'Completed' },
    { type: 'NPS', ref: 'NPS-10198', score: '6', isGood: false, comment: 'Good service overall.', date: '02 May 2024', channel: 'SMS', status: 'Completed' },
    { type: 'CSI', ref: 'JOB-783210', score: '5 / 5', isGood: true, comment: 'Excellent service and support.', date: '28 Apr 2024', channel: 'Email', status: 'Completed' },
  ];

  return (
    <div className="flex flex-col gap-4">
      
      {/* 1. Top 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* CSI Score Card */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider block">CSI Score (Overall)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">4.2</span>
            <span className="text-gray-400 font-bold text-xs">/ 5</span>
          </div>
          <div className="flex text-amber-400 text-xs my-1">
            <FaStar /><FaStar /><FaStar /><FaStar /><FaStar className="opacity-40" />
          </div>
          <span className="text-[10px] text-gray-400 font-medium">Based on 8 responses</span>
        </div>

        {/* NPS Score Card */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider block">NPS Score</span>
          <div className="mt-1 text-2xl font-black text-emerald-600">+35</div>
          <div className="mt-1 text-[10px] space-y-0.5 font-semibold text-gray-600">
            <div className="flex justify-between"><span>Promoters</span><span className="text-emerald-600">60%</span></div>
            <div className="flex justify-between"><span>Detractors</span><span className="text-rose-600">25%</span></div>
            <div className="flex justify-between"><span>Passives</span><span className="text-gray-400">15%</span></div>
          </div>
        </div>

        {/* Lost Sales Card */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider block">Lost Sales</span>
          <div className="mt-2 text-2xl font-black text-gray-900">12</div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <FaArrowDown className="text-[9px]" /> 8% vs Last Month
          </span>
        </div>

        {/* Open Bookings Card */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider block">Open Bookings</span>
          <div className="mt-2 text-2xl font-black text-gray-900">5</div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <FaArrowUp className="text-[9px]" /> 25% vs Last Month
          </span>
        </div>

        {/* Cancelled Bookings Card */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider block">Cancelled Bookings</span>
          <div className="mt-2 text-2xl font-black text-gray-900">3</div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <FaArrowDown className="text-[9px]" /> 10% vs Last Month
          </span>
        </div>

      </div>

      {/* 2. Middle Row: Recent Feedback Table & NPS Trend / Lost Sales Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Left Side: Recent Feedback Table (7 Cols) */}
        <div className="xl:col-span-7 bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
              <h3 className="font-bold text-gray-900 text-sm">Recent Feedback</h3>
              <button className="text-blue-600 font-bold text-xs hover:underline">View All Feedback</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[9px] border-b border-gray-100">
                  <tr>
                    <th className="py-2.5 px-2">Type</th>
                    <th className="py-2.5 px-2">Reference</th>
                    <th className="py-2.5 px-2">Score</th>
                    <th className="py-2.5 px-2">Feedback / Comments</th>
                    <th className="py-2.5 px-2">Date</th>
                    <th className="py-2.5 px-2">Channel</th>
                    <th className="py-2.5 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
                  {feedbacks.map((f, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-2.5 px-2">
                        <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                          f.type === 'CSI' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {f.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-bold text-gray-800">{f.ref}</td>
                      <td className="py-2.5 px-2 font-black">
                        <span className={f.isGood ? 'text-emerald-600' : 'text-rose-500'}>
                          {f.score}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-gray-600 max-w-[200px] truncate">{f.comment}</td>
                      <td className="py-2.5 px-2 text-gray-400 text-[10px]">{f.date}</td>
                      <td className="py-2.5 px-2 text-gray-500">{f.channel}</td>
                      <td className="py-2.5 px-2">
                        <span className="bg-emerald-100 text-emerald-700 font-bold text-[10px] px-1.5 py-0.2 rounded">
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side Stack: NPS Trend & Lost Sales Donut Chart (5 Cols) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          
          {/* NPS Trend Line Chart */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 text-xs">
            <h3 className="font-bold text-gray-900 text-xs mb-2">NPS Trend</h3>
            
            <div className="h-28 w-full pt-2">
              <svg viewBox="0 0 300 80" className="w-full h-full">
                {/* Grid line */}
                <line x1="0" y1="40" x2="300" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                {/* Line Path */}
                <path
                  d="M 20,60 L 70,40 L 120,50 L 170,30 L 220,40 L 270,15"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                />
                {/* Dots & Labels */}
                {[
                  { x: 20, y: 60, val: '10', m: 'Dec 23' },
                  { x: 70, y: 40, val: '20', m: 'Jan 24' },
                  { x: 120, y: 50, val: '15', m: 'Feb 24' },
                  { x: 170, y: 30, val: '25', m: 'Mar 24' },
                  { x: 220, y: 40, val: '20', m: 'Apr 24' },
                  { x: 270, y: 15, val: '35', m: 'May 24' },
                ].map((p, idx) => (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r="3.5" fill="#2563EB" />
                    <text x={p.x} y={p.y - 7} fontSize="8" fill="#1e293b" textAnchor="middle" fontWeight="bold">{p.val}</text>
                    <text x={p.x} y="78" fontSize="8" fill="#94a3b8" textAnchor="middle">{p.m}</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Lost Sales Analysis (This Month) Donut Chart */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 text-xs">
            <h3 className="font-bold text-gray-900 text-xs mb-2">Lost Sales Analysis <span className="text-gray-400 font-normal">(This Month)</span></h3>

            <div className="flex items-center gap-4">
              {/* Donut Graphic */}
              <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2563EB" strokeWidth="4" strokeDasharray="42, 100" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#06B6D4" strokeWidth="4" strokeDasharray="25, 100" strokeDashoffset="-42" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="17, 100" strokeDashoffset="-67" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#6366F1" strokeWidth="4" strokeDasharray="16, 100" strokeDashoffset="-84" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-base font-black text-gray-900 block leading-none">12</span>
                  <span className="text-[8px] text-gray-400 font-bold block">Total</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1 text-[11px] flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Price</span>
                  <span className="font-bold text-gray-800">5 (42%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Went to Competitor</span>
                  <span className="font-bold text-gray-800">3 (25%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Not Interested</span>
                  <span className="font-bold text-gray-800">2 (17%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Product Not Available</span>
                  <span className="font-bold text-gray-800">2 (16%)</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Bottom Footer Summary Row */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 text-xs flex justify-between items-center">
        <div>
          <span className="text-gray-400 font-semibold text-[11px] block">Open Bookings Summary</span>
          <span className="font-bold text-gray-800">By Value: 3 • Pending: 1 • Rescheduled: 1</span>
        </div>
        <div className="text-right">
          <span className="text-gray-400 font-semibold text-[11px] block">Cancelled Bookings Summary</span>
          <span className="font-bold text-gray-800">Customer Cancelled: 2 • Dealer Cancelled: 1</span>
        </div>
      </div>

    </div>
  );
}
