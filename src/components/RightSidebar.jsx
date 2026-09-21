import React, { useState, useEffect } from 'react';
import { 
  FaFilter, 
  FaPhoneAlt, 
  FaExclamationTriangle, 
  FaFileAlt, 
  FaCheckCircle, 
  FaEnvelope, 
  FaClock, 
  FaFrown,
  FaArrowUp,
  FaRobot
} from 'react-icons/fa';

export default function RightSidebar() {
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Real-time animated SLA countdown state (starting at 04 hrs 12 mins 36 secs)
  const [secondsLeft, setSecondsLeft] = useState(4 * 3600 + 12 * 60 + 36);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatHours = Math.floor(secondsLeft / 3600).toString().padStart(2, '0');
  const formatMinutes = Math.floor((secondsLeft % 3600) / 60).toString().padStart(2, '0');
  const formatSeconds = (secondsLeft % 60).toString().padStart(2, '0');

  const filterTabs = ['All', 'Calls', 'Chats', 'Emails', 'Internal Notes', 'Updates'];

  const timelineEvents = [
    {
      id: 1,
      type: 'Calls',
      time: '10:15 AM',
      title: 'Incoming Call',
      duration: '02:14',
      desc: 'Customer called regarding delay in parts',
      author: 'Sara Ahmed',
      iconBg: 'bg-emerald-500',
      icon: <FaPhoneAlt className="text-white text-xs" />,
    },
    {
      id: 2,
      type: 'Updates',
      time: '11:00 AM',
      title: 'Escalated',
      desc: 'Escalated to Branch Manager',
      author: 'Sara Ahmed',
      iconBg: 'bg-amber-500',
      icon: <FaExclamationTriangle className="text-white text-xs" />,
    },
    {
      id: 3,
      type: 'Internal Notes',
      time: '12:45 PM',
      title: 'Internal Note',
      desc: 'Parts ETA updated to 2 days',
      author: 'Omar Hassan',
      iconBg: 'bg-blue-600',
      icon: <FaFileAlt className="text-white text-xs" />,
    },
    {
      id: 4,
      type: 'Updates',
      time: '01:20 PM',
      title: 'Compensation Approved',
      desc: 'Approved 20% goodwill',
      author: 'Sara Ahmed',
      iconBg: 'bg-emerald-500',
      icon: <FaCheckCircle className="text-white text-xs" />,
    },
    {
      id: 5,
      type: 'Emails',
      time: '02:00 PM',
      title: 'Customer Contacted',
      desc: 'Customer informed about resolution',
      author: 'Sara Ahmed',
      iconBg: 'bg-purple-600',
      icon: <FaEnvelope className="text-white text-xs" />,
    },
  ];

  const filteredEvents = activeFilter === 'All' 
    ? timelineEvents 
    : timelineEvents.filter(e => e.type === activeFilter);

  return (
    <div className="w-full lg:w-[320px] xl:w-[340px] flex-shrink-0 flex flex-col gap-4">
      {/* 1. Complaint Activity Timeline Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">Complaint Activity Timeline</h3>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <FaFilter className="text-xs" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-2.5 no-scrollbar border-b border-gray-100 text-[11px] font-medium">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                activeFilter === tab
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Timeline Items List */}
        <div className="mt-3">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Today</div>

          <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
            {filteredEvents.map((evt) => (
              <div key={evt.id} className="relative flex items-start gap-3 text-xs pl-0 group">
                <div className={`w-7 h-7 rounded-lg ${evt.iconBg} flex items-center justify-center flex-shrink-0 z-10 shadow-xs group-hover:scale-105 transition-transform`}>
                  {evt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-semibold">{evt.time}</span>
                    {evt.duration && (
                      <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded">
                        {evt.duration}
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-gray-900 text-[12px]">{evt.title}</div>
                  <p className="text-gray-600 text-[11px] leading-tight my-0.5">{evt.desc}</p>
                  <span className="text-[10px] text-gray-400 block font-medium">{evt.author}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <button className="text-blue-600 text-xs font-semibold hover:underline">
              View Full Timeline
            </button>
          </div>
        </div>
      </div>

      {/* 2. SLA Countdown Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <FaClock className="text-xs" />
            </div>
            <span className="font-bold text-gray-900 text-sm">SLA Countdown</span>
          </div>
          <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[11px]">
            At Risk
          </span>
        </div>

        {/* Dynamic Digital Timer Display */}
        <div className="flex items-center justify-center gap-3 py-2 bg-red-50/60 rounded-xl border border-red-100">
          <div className="text-center">
            <div className="text-2xl font-black text-rose-600 tracking-wider font-mono">{formatHours}</div>
            <div className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">HRS</div>
          </div>
          <span className="text-2xl font-black text-rose-400 mb-3">:</span>
          <div className="text-center">
            <div className="text-2xl font-black text-rose-600 tracking-wider font-mono">{formatMinutes}</div>
            <div className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">MINS</div>
          </div>
          <span className="text-2xl font-black text-rose-400 mb-3">:</span>
          <div className="text-center">
            <div className="text-2xl font-black text-rose-600 tracking-wider font-mono">{formatSeconds}</div>
            <div className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">SECS</div>
          </div>
        </div>
      </div>

      {/* 3. Customer Sentiment Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h4 className="font-bold text-gray-900 text-xs mb-2">Customer Sentiment <span className="text-gray-400 font-normal">(Last 30 Days)</span></h4>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <FaFrown className="text-xl" />
            </div>
            <div>
              <div className="font-bold text-rose-600 text-sm leading-tight">Negative</div>
              <div className="flex items-center gap-1 text-emerald-600 text-[11px] font-semibold mt-0.5">
                <FaArrowUp className="text-[9px]" />
                <span>Improving</span>
              </div>
            </div>
          </div>

          {/* Sparkline SVG Chart */}
          <div className="w-24 h-10">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <path
                d="M 5,30 Q 25,35 45,20 T 85,10 T 95,8"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="95" cy="8" r="3" fill="#10B981" />
            </svg>
          </div>
        </div>
      </div>

      {/* 4. AI Assistant Recommendations Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded bg-purple-700 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
            AI
          </div>
          <span className="font-bold text-gray-900 text-sm">AI Assistant</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs bg-purple-50/40 p-3 rounded-xl border border-purple-100">
          <div>
            <span className="text-gray-500 text-[11px] block font-medium">Predicted Escalation Risk</span>
            <div className="text-xl font-black text-rose-600 mt-1">87%</div>
            <span className="text-[10px] font-bold text-rose-600">High Risk</span>
          </div>

          <div className="border-l border-purple-200/60 pl-3">
            <span className="text-gray-500 text-[11px] block font-medium">Recommended Next Action</span>
            <p className="text-[11px] font-semibold text-gray-800 leading-snug mt-1">
              Offer priority booking + complimentary detailing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
