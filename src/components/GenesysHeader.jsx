import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaPause, 
  FaMicrophoneSlash, 
  FaExchangeAlt, 
  FaUsers, 
  FaPhoneSlash, 
  FaPhoneAlt, 
  FaShoppingBag, 
  FaCar, 
  FaStar, 
  FaShieldAlt 
} from 'react-icons/fa';

export default function GenesysHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [activeSubTab, setActiveSubTab] = useState('Book Service');

  const isServiceModule = currentPath === '/service' || currentPath === '/service-booking' || currentPath === '/sales' || currentPath === '/feedback';

  const subTabs = [
    'Overview',
    'Book Service',
    'Pick-up & Drop-off',
    'Loan Car',
    'Estimate Approval',
    'Confirmation'
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-2xs">
      {/* Container wrapper matching main content max width */}
      <div className="max-w-[1600px] mx-auto w-full">
        
        {/* ROW 1: Genesys Telephony Bar */}
        <div className="px-4 lg:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-gray-100">
          
          {/* Far Left: Genesys Brand & Queue Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => navigate('/')}>
              <span className="w-3.5 h-3.5 rounded-full bg-[#FF4500] inline-block shadow-2xs"></span>
              <span className="font-black text-gray-900 text-base tracking-wider uppercase">GENESYS</span>
            </div>

            <div className="flex items-center gap-2 bg-[#E6F4EA] text-[#137333] font-semibold px-3 py-1 rounded-full border border-[#CEEAD6] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse"></span>
              <span>On Queue</span>
              <span className="text-gray-400 font-mono text-[11px] font-normal ml-0.5">00:02:46</span>
            </div>
          </div>

          {/* Center: Floating Telephony Call Control Pill */}
          <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-2xs text-xs">
            
            {/* Voice Call & Waveform Nodes */}
            <div className="flex items-center gap-2 font-bold text-gray-800">
              <FaPhoneAlt className="text-blue-600 text-xs" />
              <span>Voice Call</span>
              
              {/* Dotted Node Waveform Line */}
              <div className="hidden sm:flex items-center gap-1 mx-1 text-blue-500">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span className="w-2 h-[2px] bg-blue-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span className="w-2 h-[2px] bg-blue-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              </div>
            </div>

            <div className="h-4 w-[1px] bg-gray-200"></div>

            {/* Caller Details & Active Timer */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">Sumedh Kamble</span>
              <span className="text-gray-400 text-[11px] font-normal">+971 50 123 4567</span>
              <span className="font-mono text-gray-700 text-[11px] font-medium bg-gray-100 px-1.5 py-0.2 rounded">02:14</span>
            </div>

            <div className="h-4 w-[1px] bg-gray-200"></div>

            {/* Call Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button title="Hold" className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <FaPause className="text-[11px]" />
              </button>
              <button title="Mute" className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <FaMicrophoneSlash className="text-[11px]" />
              </button>
              <button title="Transfer" className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <FaExchangeAlt className="text-[11px]" />
              </button>
              <button title="Conference" className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <FaUsers className="text-[11px]" />
              </button>
              <button title="End Call" className="flex items-center gap-1 bg-[#EA4335] hover:bg-red-700 text-white font-bold text-[11px] px-3 py-1 rounded-full shadow-2xs transition-colors cursor-pointer ml-1">
                <FaPhoneSlash className="text-[10px]" />
                <span>End Call</span>
              </button>
            </div>

          </div>

          {/* Far Right: Wrap-Up & Agent Info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-gray-400 text-[9px] uppercase tracking-wider font-bold block leading-none">WRAP-UP</span>
              <span className="font-mono font-bold text-gray-800 text-xs leading-tight mt-0.5 block">00:45</span>
            </div>

            <div className="h-6 w-[1px] bg-gray-200"></div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100"
                  alt="Sara Ahmed"
                  className="w-8 h-8 rounded-full object-cover border border-emerald-500 shadow-2xs"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-gray-900 text-xs block leading-none">Sara Ahmed</span>
                <span className="text-[10px] text-gray-400 font-medium leading-none block mt-0.5">Service Advisor</span>
              </div>
            </div>
          </div>

        </div>

        {/* ROW 2: Main Module Navigation Tabs */}
        <div className="py-1.5 flex items-center justify-center gap-10 text-xs border-b border-gray-100 bg-white">
          <button 
            onClick={() => navigate('/sales')}
            className={`py-1 px-2 flex items-center gap-2 transition-colors cursor-pointer ${
              currentPath === '/sales' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-gray-600 font-medium hover:text-gray-900'
            }`}
          >
            <FaShoppingBag className="text-xs" />
            <span>Sales</span>
          </button>

          <button 
            onClick={() => navigate('/service')}
            className={`py-1 px-2 flex items-center gap-2 transition-colors cursor-pointer ${
              isServiceModule ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-gray-600 font-medium hover:text-gray-900'
            }`}
          >
            <FaCar className="text-xs" />
            <span>Service</span>
          </button>

          <button 
            onClick={() => navigate('/feedback')}
            className={`py-1 px-2 flex items-center gap-2 transition-colors cursor-pointer ${
              currentPath === '/feedback' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-gray-600 font-medium hover:text-gray-900'
            }`}
          >
            <FaStar className="text-xs" />
            <span>Feedback</span>
          </button>

          <button 
            onClick={() => navigate('/')}
            className={`py-1 px-2 flex items-center gap-2 transition-colors cursor-pointer ${
              currentPath === '/' || currentPath === '/complaints' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-gray-600 font-medium hover:text-gray-900'
            }`}
          >
            <FaShieldAlt className="text-xs" />
            <span>Complaints Manager</span>
          </button>
        </div>

        {/* ROW 3: Sub-Workflow Navigation Tabs (Service Module) */}
        {isServiceModule && (
          <div className="py-1 px-4 bg-white flex items-center justify-center gap-8 text-[11px] font-medium text-gray-500 overflow-x-auto no-scrollbar">
            {subTabs.map((tab) => {
              const isActive = activeSubTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`pb-0.5 cursor-pointer whitespace-nowrap transition-colors ${
                    isActive ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'hover:text-gray-800'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        )}

      </div>
    </header>
  );
}
