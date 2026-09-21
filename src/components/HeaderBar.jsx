import React, { useState } from 'react';
import { FaSearch, FaBell, FaUserCircle, FaBars, FaChevronDown, FaHeadset } from 'react-icons/fa';

export default function HeaderBar({ onToggleMobileSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 py-2.5 shadow-sm">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        
        {/* Left Brand / Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleMobileSidebar}
            className="lg:hidden text-gray-600 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100"
          >
            <FaBars className="text-lg" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
              <FaHeadset />
            </div>
            <div>
              <h1 className="font-extrabold text-gray-900 text-sm tracking-tight leading-none">
                Dubai Althba CRM
              </h1>
              <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
                Customer Complaints Center
              </span>
            </div>
          </div>
        </div>

        {/* Center Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4 relative">
          <FaSearch className="absolute left-3 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Search Customer Name, Mobile, Emirates ID, or Complaint ID..."
            className="w-full pl-9 pr-4 py-1.5 bg-gray-100 text-xs text-gray-800 rounded-full border border-transparent focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* Right Tools & User Info */}
        <div className="flex items-center gap-3">
          {/* Notifications button */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaBell className="text-base" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-gray-100 font-bold text-gray-900 flex justify-between">
                  <span>Notifications</span>
                  <span className="text-[10px] text-blue-600 cursor-pointer">Mark all as read</span>
                </div>
                <div className="divide-y divide-gray-50 max-h-56 overflow-y-auto">
                  <div className="p-2.5 hover:bg-gray-50 cursor-pointer">
                    <span className="font-bold text-rose-600 block text-[11px]">SLA Warning</span>
                    <span className="text-gray-600 block text-[11px]">Complaint CMP-784512 has 4 hrs remaining</span>
                  </div>
                  <div className="p-2.5 hover:bg-gray-50 cursor-pointer">
                    <span className="font-bold text-emerald-600 block text-[11px]">Goodwill Approved</span>
                    <span className="text-gray-600 block text-[11px]">20% Service Voucher approved by Sara Ahmed</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Current Agent Info */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100"
              alt="Sara Ahmed"
              className="w-8 h-8 rounded-full object-cover border border-blue-500"
            />
            <div className="hidden sm:block text-left">
              <span className="font-bold text-gray-900 text-xs block leading-none">Sara Ahmed</span>
              <span className="text-[10px] text-gray-400 font-medium">Service Advisor</span>
            </div>
            <FaChevronDown className="text-gray-400 text-[10px] hidden sm:block" />
          </div>
        </div>

      </div>
    </header>
  );
}
