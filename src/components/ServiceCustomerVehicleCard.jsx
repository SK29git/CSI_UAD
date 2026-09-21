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
  FaEdit,
  FaCar,
  FaExternalLinkAlt
} from 'react-icons/fa';

export default function ServiceCustomerVehicleCard() {
  return (
    <div className="w-full lg:w-[310px] xl:w-[330px] flex-shrink-0 flex flex-col gap-3.5">
      
      {/* 1. Customer Details 360 Card */}
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 text-xs">
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-900 text-sm">Customer Details</span>
            <span className="bg-blue-50 text-blue-600 font-extrabold text-[10px] px-1.5 py-0.2 rounded border border-blue-200">
              360°
            </span>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <FaEdit className="text-xs" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <img 
              src="/profile.jpg" 
              alt="Sumedh Kamble" 
              className="w-13 h-13 rounded-full object-cover border-2 border-purple-200 shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-gray-900 text-base leading-tight">Sumedh Kamble</h3>
              <span className="bg-purple-700 text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                Platinum
              </span>
            </div>
            <div className="mt-1 space-y-0.5 text-[11px] text-gray-600">
              <div className="flex items-center gap-1.5">
                <FaPhoneAlt className="text-gray-400 text-[10px]" />
                <span>+971 50 123 4567</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaEnvelope className="text-gray-400 text-[10px]" />
                <span className="truncate max-w-[170px]">sumedh.kamble@email.com</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaGlobe className="text-gray-400 text-[10px]" />
                <span>English (Preferred)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-gray-400 text-[10px]" />
                <span>Dubai, UAE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Icon Row */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
          <button className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100">
            <FaPhoneAlt className="text-[10px]" />
          </button>
          <button className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100">
            <FaWhatsapp className="text-xs" />
          </button>
          <button className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100">
            <FaEnvelope className="text-[10px]" />
          </button>
          <button className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100">
            <FaCommentAlt className="text-[10px]" />
          </button>
          <button className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100">
            <FaComments className="text-[10px]" />
          </button>
          <button className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200">
            <FaEllipsisH className="text-[10px]" />
          </button>
        </div>

        {/* Verification Footer */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Verification Status</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded">
              <FaCheckCircle className="text-[10px]" /> Verified
            </span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Last Verified On</span>
            <span className="font-semibold text-gray-800">18 May 2026, 02:14 PM</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Last Verified By</span>
            <span className="font-semibold text-gray-800">Sara Ahmed</span>
          </div>
        </div>
      </div>

      {/* 2. Vehicle Summary Card */}
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 text-xs space-y-3">
        <div className="pb-2 border-b border-gray-100">
          <h4 className="font-bold text-gray-900 text-xs">Vehicle Summary</h4>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gray-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
            BMW
          </div>
          <div>
            <h5 className="font-black text-gray-900 text-sm leading-tight">BMW X5 xDrive40i</h5>
            <span className="text-[10px] text-gray-400 font-mono block">VIN: WBAXU710X0LK12345</span>
            <span className="text-[10px] text-gray-500 font-medium">Year: 2023 | Color: Black Sapphire</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 pt-2 border-t border-gray-100">
          <div>
            <span className="text-gray-400 block text-[10px]">Mileage</span>
            <span className="font-bold text-gray-900 text-sm">64,250 KM</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px]">Warranty Status</span>
            <span className="font-bold text-emerald-600 text-xs">Active</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[10px]">Warranty Expiry</span>
            <span className="font-semibold text-gray-800">15 Nov 2026</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px]">Service Contract</span>
            <span className="font-bold text-gray-900">Premium Plus</span>
          </div>

          <div className="col-span-2 pt-1 border-t border-gray-50">
            <span className="text-gray-400 block text-[10px]">Next Service Due</span>
            <span className="font-bold text-gray-900 text-xs">12,500 KM / 15 Aug 2026</span>
          </div>
        </div>
      </div>

      {/* 3. Trade-in Eligibility Card */}
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 text-xs space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-gray-100">
          <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
            <FaCar className="text-blue-600" /> Trade-in Eligibility
          </span>
          <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
            <FaCheckCircle className="text-[9px]" /> Eligible
          </span>
        </div>

        <div className="flex justify-between items-baseline pt-1">
          <span className="text-gray-500">Estimated Value</span>
          <span className="font-black text-gray-900 text-sm">AED 145,000</span>
        </div>

        <div className="flex justify-between items-center text-[11px]">
          <span className="text-gray-400">Eligibility Expires On</span>
          <span className="font-medium text-gray-700">15 Nov 2026</span>
        </div>

        <button className="text-blue-600 font-bold text-[11px] hover:underline flex items-center gap-1 pt-1">
          <span>View Details</span>
          <FaExternalLinkAlt className="text-[9px]" />
        </button>
      </div>

    </div>
  );
}
