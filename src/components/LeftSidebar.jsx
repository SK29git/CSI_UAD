import React from 'react';
import { 
  FaPhoneAlt, 
  FaWhatsapp, 
  FaEnvelope, 
  FaCommentAlt, 
  FaComments, 
  FaEllipsisH, 
  FaGlobe, 
  FaMapMarkerAlt,
  FaCheckCircle,
  FaInfoCircle,
  FaChevronRight,
  FaExclamationTriangle
} from 'react-icons/fa';

export default function LeftSidebar() {
  return (
    <div className="w-full lg:w-[310px] xl:w-[330px] flex-shrink-0 flex flex-col gap-4">
      {/* 1. Profile Overview Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <img 
              src="/profile.jpg" 
              alt="Sumedh Kamble" 
              className="w-14 h-14 rounded-full object-cover border-2 border-purple-200 shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900 text-lg leading-tight">Sumedh Kamble</h2>
              <span className="bg-purple-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                Platinum
              </span>
            </div>
            <div className="mt-1 space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <FaPhoneAlt className="text-gray-400 text-[11px]" />
                <span className="font-medium">+971 50 123 4567</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaEnvelope className="text-gray-400 text-[11px]" />
                <span className="truncate max-w-[190px]">sumedh.kamble@email.com</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-gray-400 text-[11px]" />
                <span>Dubai, UAE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaGlobe className="text-gray-400 text-[11px]" />
                <span>English (Preferred)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button 
            title="Call"
            className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
          >
            <FaPhoneAlt className="text-xs" />
          </button>
          <button 
            title="WhatsApp"
            className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
          >
            <FaWhatsapp className="text-sm" />
          </button>
          <button 
            title="Email"
            className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
          >
            <FaEnvelope className="text-xs" />
          </button>
          <button 
            title="SMS"
            className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
          >
            <FaCommentAlt className="text-xs" />
          </button>
          <button 
            title="Chat"
            className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
          >
            <FaComments className="text-xs" />
          </button>
          <button 
            title="More Options"
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <FaEllipsisH className="text-xs" />
          </button>
        </div>
      </div>

      {/* 2. Customer Key Meta Data Table */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-xs">
        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
          <div>
            <span className="text-gray-400 block text-[11px]">Customer Since</span>
            <span className="font-semibold text-gray-800">Jan 2021</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Customer ID</span>
            <span className="font-semibold text-gray-800">CUS-1002456</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[11px]">ID Type</span>
            <span className="font-semibold text-gray-800">Emirates ID</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">ID Number</span>
            <span className="font-semibold text-gray-800">784-1990-1234567-1</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[11px]">Loyalty Tier</span>
            <span className="font-semibold text-gray-800">Platinum</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Lifetime Value</span>
            <span className="font-bold text-gray-900">AED 45,750</span>
          </div>

          <div className="col-span-2 pt-1 border-t border-gray-50">
            <span className="text-gray-400 block text-[11px]">Preferred Branch</span>
            <span className="font-semibold text-gray-800">Sheikh Zayed Road</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[11px]">Open Cases</span>
            <span className="font-bold text-blue-600 text-sm">4</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Communication Preference</span>
            <span className="font-medium text-gray-700">Phone, WhatsApp, Email</span>
          </div>
        </div>
      </div>

      {/* 3. Verification Status Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
          <span className="font-bold text-gray-800 flex items-center gap-1.5">
            Verification Status
          </span>
          <div className="flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
            <FaCheckCircle className="text-xs" />
            <span>Verified</span>
            <FaInfoCircle className="text-gray-400 ml-1 text-[10px]" />
          </div>
        </div>

        <div className="space-y-1.5 text-gray-600">
          <div className="flex justify-between">
            <span className="text-gray-400">Last Verified By</span>
            <span className="font-medium text-gray-800">Sara Ahmed</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Last Verified On</span>
            <span className="font-medium text-gray-800">18 May 2026, 02:14 PM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Last Edited By</span>
            <span className="font-medium text-gray-800">Sara Ahmed</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Last Edited On</span>
            <span className="font-medium text-gray-800">18 May 2026, 02:14 PM</span>
          </div>
        </div>
      </div>

      {/* 4. Customer Risk Overview Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-xs">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
          <span className="font-bold text-gray-900 text-sm">Customer Risk Overview</span>
          <FaChevronRight className="text-gray-400 text-xs cursor-pointer hover:text-gray-600" />
        </div>

        <div className="space-y-3">
          {/* Escalation Risk */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-red-100 text-red-600 flex items-center justify-center font-bold text-[10px]">
                !
              </span>
              <span className="font-medium text-gray-700">Escalation Risk</span>
            </div>
            <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[11px]">
              High
            </span>
          </div>

          {/* Repeat Complaints */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-[10px]">
                ↻
              </span>
              <span className="font-medium text-gray-700">Repeat Complaints</span>
            </div>
            <span className="font-bold text-gray-900">4 Cases</span>
          </div>

          {/* Last Complaint */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-[10px]">
                🕒
              </span>
              <span className="font-medium text-gray-700">Last Complaint</span>
            </div>
            <span className="font-bold text-gray-900">3 Days Ago</span>
          </div>

          {/* CES Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px]">
                ✓
              </span>
              <span className="font-medium text-gray-700">CES Score <span className="text-gray-400 text-[10px]">(Last 30 Days)</span></span>
            </div>
            <span className="font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">2.1 / 5</span>
          </div>

          {/* NPS Risk */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-red-100 text-red-600 flex items-center justify-center font-bold text-[10px]">
                ⚠️
              </span>
              <span className="font-medium text-gray-700">NPS Risk</span>
            </div>
            <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[11px]">
              At Risk
            </span>
          </div>
        </div>
      </div>

      {/* 5. Notes Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
          <span className="font-bold text-gray-900 text-sm">Notes</span>
          <button className="text-blue-600 font-bold text-xs hover:underline">Edit</button>
        </div>
        <div className="space-y-1 text-gray-700 text-[11px] leading-relaxed">
          <p>Prefers communication in English/Arabic.</p>
          <p className="font-semibold text-gray-900">High value customer.</p>
        </div>
      </div>
    </div>
  );
}
