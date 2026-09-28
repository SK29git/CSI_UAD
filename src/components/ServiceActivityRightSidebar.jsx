import React, { useState } from 'react';
import { 
  FaFilter, 
  FaPhoneAlt, 
  FaCheckCircle, 
  FaWhatsapp, 
  FaBell, 
  FaCar, 
  FaStar, 
  FaPaperclip, 
  FaWrench,
  FaFileAlt,
  FaChevronRight,
  FaChevronLeft,
  FaHistory
} from 'react-icons/fa';

export default function ServiceActivityRightSidebar({ isCollapsed = false, onToggleCollapse }) {
  const [activeTab, setActiveTab] = useState('All');

  const filterTabs = ['All', 'Calls', 'Chats', 'Emails', 'Service', 'Notes'];

  if (isCollapsed) {
    return (
      <div 
        onClick={onToggleCollapse}
        className="w-14 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex flex-col items-center gap-4 cursor-pointer hover:border-blue-300 transition-all duration-300 group py-4"
        title="Click to expand Customer Activity"
      >
        {/* Expand Toggle Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleCollapse && onToggleCollapse(); }}
          className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
          title="Expand Right Panel"
        >
          <FaChevronLeft className="text-sm" />
        </button>

        <div className="w-full h-[1px] bg-gray-100 my-1" />

        {/* Activity Icon */}
        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform" title="Customer Activity">
          <FaHistory className="text-xs" />
        </div>

        {/* WhatsApp Icon */}
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center" title="WhatsApp Message History">
          <FaWhatsapp className="text-xs" />
        </div>

        {/* Service Wrench Icon */}
        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center" title="Repair & Service Updates">
          <FaWrench className="text-xs" />
        </div>

        {/* CSI Star Rating Icon */}
        <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center" title="CSI Feedback 4.7/5">
          <FaStar className="text-xs" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[310px] xl:w-[330px] flex-shrink-0 flex flex-col gap-4 transition-all duration-300">
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-xs">Customer Activity</h3>
          <div className="flex items-center gap-1">
            <button className="text-gray-400 hover:text-gray-600 p-1">
              <FaFilter className="text-[10px]" />
            </button>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="w-6 h-6 rounded bg-gray-100 text-gray-500 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs ml-1"
                title="Collapse Right Panel"
              >
                <FaChevronRight className="text-xs" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 border-b border-gray-100 text-[10px] font-medium no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-0.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Activity Timeline Items */}
        <div className="mt-3 space-y-4 text-xs">
          
          {/* Section: Today */}
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Today</span>
            
            <div className="space-y-3.5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
              
              {/* Event 1 */}
              <div className="relative flex items-start gap-2.5 pl-0">
                <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 z-10 shadow-xs">
                  <FaPhoneAlt className="text-[10px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span className="font-semibold">09:15 AM</span>
                    <span className="bg-gray-50 px-1 rounded">02:14</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-[11px]">Incoming Call</h4>
                  <p className="text-gray-600 text-[10px] leading-tight">Regarding delay in parts delivery</p>
                  <span className="text-[9px] text-gray-400 font-medium">Sara Ahmed</span>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative flex items-start gap-2.5 pl-0">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 z-10 shadow-xs">
                  <FaCheckCircle className="text-[10px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span className="font-semibold">11:30 AM</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-[11px]">Booking Confirmed</h4>
                  <p className="text-gray-600 text-[10px] leading-tight">Service booking BK-1002456 confirmed at Sheikh Zayed Road</p>
                </div>
              </div>

              {/* Event 3 */}
              <div className="relative flex items-start gap-2.5 pl-0">
                <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center flex-shrink-0 z-10 shadow-xs">
                  <FaWrench className="text-[10px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span className="font-semibold">01:20 PM</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-[11px]">Repair Update</h4>
                  <p className="text-gray-600 text-[10px] leading-tight">Parts received. Repair in progress.</p>
                  <span className="text-[9px] text-gray-400 font-medium">Omar Hassan</span>
                </div>
              </div>

            </div>
          </div>

          {/* Section: Yesterday */}
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Yesterday</span>
            
            <div className="space-y-3.5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
              
              {/* WhatsApp Event */}
              <div className="relative flex items-start gap-2.5 pl-0">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 z-10 shadow-xs">
                  <FaWhatsapp className="text-xs" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span className="font-semibold">04:32 PM</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-[11px]">WhatsApp</h4>
                  <p className="text-gray-600 text-[10px] leading-tight">Shared service estimate</p>
                  <span className="text-[9px] text-gray-400 block">Sara Ahmed</span>
                  
                  <div className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold bg-blue-50/60 px-1.5 py-0.5 rounded mt-1 border border-blue-100 w-max">
                    <FaPaperclip className="text-[9px]" /> Estimate_BK-1002456.pdf
                  </div>
                </div>
              </div>

              {/* Service Reminder Event */}
              <div className="relative flex items-start gap-2.5 pl-0">
                <div className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center flex-shrink-0 z-10 shadow-xs">
                  <FaBell className="text-[10px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span className="font-semibold">10:10 AM</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-[11px]">Service Reminder</h4>
                  <p className="text-gray-600 text-[10px] leading-tight">Reminder for upcoming service system</p>
                </div>
              </div>

            </div>
          </div>

          {/* Section: 18 May 2026 */}
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">18 May 2026</span>
            
            <div className="space-y-3.5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
              
              <div className="relative flex items-start gap-2.5 pl-0">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 z-10 shadow-xs">
                  <FaCar className="text-[10px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span className="font-semibold">03:15 PM</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-[11px]">Previous Service</h4>
                  <p className="text-gray-600 text-[10px] leading-tight">Regular Service Completed (Mileage: 48,500 KM)</p>
                </div>
              </div>

              <div className="relative flex items-start gap-2.5 pl-0">
                <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 z-10 shadow-xs">
                  <FaStar className="text-[10px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span className="font-semibold">05:30 PM</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-[11px]">CSI Feedback</h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="font-bold text-gray-800 text-[10px]">Rating: 4.7 / 5</span>
                    <div className="flex text-amber-400 text-[9px]">
                      <FaStar /><FaStar /><FaStar /><FaStar /><FaStar className="opacity-50" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        <div className="mt-4 pt-2.5 border-t border-gray-100 text-center">
          <button className="w-full py-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold rounded-lg transition-colors">
            View Full Activity Timeline
          </button>
        </div>

      </div>
    </div>
  );
}
