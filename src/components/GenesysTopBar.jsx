import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { 
  FaPause, 
  FaMicrophoneSlash, 
  FaExchangeAlt, 
  FaUsers, 
  FaPhoneSlash, 
  FaPhoneAlt, 
  FaChevronDown,
  FaPaperclip
} from 'react-icons/fa';

export default function GenesysTopBar() {
  const navigate = useNavigate();
  const { customer, getFormattedName } = useCustomer();

  const customerName = getFormattedName();
  const customerMobile = customer.mobile || customer.mobileRaw || '+971 50 123 4567';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 py-2.5 px-4 shadow-2xs">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* 1. Genesys Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <span className="w-4 h-4 rounded-full bg-[#FF4500] inline-block shadow-2xs"></span>
          <span className="font-black text-gray-800 text-lg tracking-wide uppercase">GENESYS</span>
        </div>

        {/* 2. On Queue Dropdown Card Box */}
        <div className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-2xs cursor-pointer hover:border-gray-300 transition-colors">
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div>
            <span className="font-bold text-gray-900 text-xs block leading-tight">On Queue</span>
            <span className="text-[10px] text-gray-400 font-mono font-medium block leading-tight">00:02:46</span>
          </div>
          <FaChevronDown className="text-gray-400 text-[10px] ml-1" />
        </div>

        {/* 3. Active Voice Call Info Box */}
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-1.5 flex items-center gap-4 shadow-2xs text-xs">
          <div className="flex items-center gap-2">
            <FaPhoneAlt className="text-gray-800 text-xs" />
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-xs leading-tight">Voice Call</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span className="w-2.5 h-[2px] bg-blue-500"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span className="w-2.5 h-[2px] bg-blue-500"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              </div>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-gray-200"></div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-xs">{customerName}</span>
            <FaPaperclip className="text-gray-400 text-[11px]" />
            <span className="text-gray-500 text-xs">{customerMobile}</span>
          </div>

          <div className="h-6 w-[1px] bg-gray-200"></div>

          <span className="font-mono font-bold text-gray-800 text-xs">02:14</span>
        </div>

        {/* 4. Action Control Buttons Row (Individual Box Cards with Icons & Text Labels Below) */}
        <div className="flex items-center gap-2">
          {/* Hold */}
          <button className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 flex flex-col items-center justify-center hover:bg-gray-50 text-[10px] font-semibold text-gray-700 min-w-[54px] shadow-2xs cursor-pointer transition-colors">
            <FaPause className="text-xs text-gray-800 mb-0.5" />
            <span>Hold</span>
          </button>

          {/* Mute */}
          <button className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 flex flex-col items-center justify-center hover:bg-gray-50 text-[10px] font-semibold text-gray-700 min-w-[54px] shadow-2xs cursor-pointer transition-colors">
            <FaMicrophoneSlash className="text-xs text-gray-800 mb-0.5" />
            <span>Mute</span>
          </button>

          {/* Transfer */}
          <button className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 flex flex-col items-center justify-center hover:bg-gray-50 text-[10px] font-semibold text-gray-700 min-w-[54px] shadow-2xs cursor-pointer transition-colors">
            <FaExchangeAlt className="text-xs text-gray-800 mb-0.5" />
            <span>Transfer</span>
          </button>

          {/* Conference */}
          <button className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 flex flex-col items-center justify-center hover:bg-gray-50 text-[10px] font-semibold text-gray-700 min-w-[54px] shadow-2xs cursor-pointer transition-colors">
            <FaUsers className="text-xs text-gray-800 mb-0.5" />
            <span>Conference</span>
          </button>

          {/* End Call Button */}
          <button className="bg-[#EA4335] hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-xs shadow-xs transition-colors cursor-pointer">
            <FaPhoneSlash className="text-xs" />
            <span>End Call</span>
          </button>
        </div>

        {/* 5. Wrap-up Dropdown Card Box */}
        <div className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 flex items-center justify-between gap-3 shadow-2xs cursor-pointer hover:border-gray-300 transition-colors">
          <div>
            <span className="font-bold text-gray-900 text-xs block leading-tight">Wrap-up</span>
            <span className="text-[10px] text-gray-400 font-mono font-medium block leading-tight">00:45</span>
          </div>
          <FaChevronDown className="text-gray-400 text-[10px]" />
        </div>

        {/* 6. Agent Profile */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100"
              alt="Sara Ahmed"
              className="w-8 h-8 rounded-full object-cover border border-emerald-500 shadow-2xs"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-gray-900 text-xs block leading-none">Sara Ahmed</span>
            <span className="text-[10px] text-gray-400 font-medium leading-none block mt-0.5">Service Advisor</span>
          </div>
        </div>

      </div>
    </header>
  );
}
