import React from 'react';
import { 
  FaCar, 
  FaCalendarAlt, 
  FaTachometerAlt, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaClock, 
  FaWrench, 
  FaGasPump, 
  FaCogs, 
  FaShieldAlt,
  FaFileAlt,
  FaPhoneVolume,
  FaInfoCircle
} from 'react-icons/fa';

export default function ServiceOverviewView() {
  return (
    <div className="flex flex-col gap-4">
      
      {/* 1. Vehicle Summary Card */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <FaCar className="text-blue-600" /> Vehicle Summary
          </h2>
          <span className="bg-blue-50 text-blue-700 font-bold text-xs px-2.5 py-0.5 rounded-full border border-blue-200">
            Primary Vehicle
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Vehicle Specs Grid (8 Cols) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px]">VIN</span>
              <span className="font-mono font-bold text-gray-800 text-[11px]">WBAXXXXXXXXXXXXXXXXX12345</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Registration No.</span>
              <span className="font-bold text-gray-900">Dubai A 12345</span>
            </div>

            <div>
              <span className="text-gray-400 block text-[10px]">Mileage</span>
              <span className="font-black text-gray-900 text-sm">38,200 KM</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Fuel Type</span>
              <span className="font-semibold text-gray-800">Petrol</span>
            </div>

            <div>
              <span className="text-gray-400 block text-[10px]">Engine</span>
              <span className="font-semibold text-gray-800">3.0L 6-Cylinder</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Transmission</span>
              <span className="font-semibold text-gray-800">Automatic</span>
            </div>

            <div>
              <span className="text-gray-400 block text-[10px]">Color</span>
              <span className="font-semibold text-gray-800">Alpine White</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">First Registration</span>
              <span className="font-semibold text-gray-800">14 Feb 2024</span>
            </div>

            <div>
              <span className="text-gray-400 block text-[10px]">Warranty Status</span>
              <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active <span className="text-gray-400 font-normal text-[9px]">(Expires 12 Feb 2027)</span>
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Service Contract</span>
              <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active <span className="text-gray-400 font-normal text-[9px]">(Expires 12 Feb 2027)</span>
              </span>
            </div>
          </div>

          {/* Quick Status Widgets (Right 4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            
            {/* Service Next Due */}
            <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-xs">
              <div className="flex items-center gap-2 mb-1 text-blue-700 font-bold">
                <FaInfoCircle className="text-xs" />
                <span>Service Next Due</span>
              </div>
              <div className="font-black text-gray-900 text-sm">12 Feb 2025 / 48,000 KM</div>
              <span className="text-[10px] font-semibold text-blue-600 block mt-0.5">(in 265 Days / 9,800 KM)</span>
            </div>

            {/* Last Service */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
              <div className="flex items-center gap-2 mb-1 text-gray-700 font-bold">
                <FaCheckCircle className="text-xs text-emerald-600" />
                <span>Last Service</span>
              </div>
              <div className="font-black text-gray-900 text-sm">12 Jan 2024 / 28,500 KM</div>
              <span className="text-[10px] font-medium text-gray-500 block mt-0.5">Sheikh Zayed Road Branch</span>
            </div>

          </div>

        </div>
      </div>

      {/* 2. Middle Row: Open Bookings & Active Cases / Roadside Assistance */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Open Bookings Table (Left 7 Cols) */}
        <div className="xl:col-span-7 bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
              <h3 className="font-bold text-gray-900 text-sm">Open Bookings</h3>
              <button className="text-blue-600 font-bold text-xs hover:underline">View All</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[9px] border-b border-gray-100">
                  <tr>
                    <th className="py-2 px-2">Booking ID</th>
                    <th className="py-2 px-2">Service Type</th>
                    <th className="py-2 px-2">Preferred Date & Time</th>
                    <th className="py-2 px-2">Branch</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2">Loan Car</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[11px] font-medium text-gray-800">
                  <tr>
                    <td className="py-3 px-2 font-bold text-blue-600">BK-634512</td>
                    <td className="py-3 px-2 font-bold text-gray-900">40K Service</td>
                    <td className="py-3 px-2">20 May 2024, 10:00 AM</td>
                    <td className="py-3 px-2">Sheikh Zayed Road</td>
                    <td className="py-3 px-2">
                      <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">
                        Confirmed
                      </span>
                    </td>
                    <td className="py-3 px-2 font-bold text-gray-800">Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Stack: Active Service Cases & Roadside Assistance (Right 5 Cols) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          
          {/* Active Service Cases */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
              <h3 className="font-bold text-gray-900 text-sm">Active Service Cases</h3>
              <button className="text-blue-600 font-bold text-xs hover:underline">View All</button>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-[9px]">
                    !
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 text-xs block">CAS-784512</span>
                    <span className="text-gray-500 text-[10px]">AC Not Cooling • Raised 10 May 2024</span>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded text-[10px]">Open</span>
              </div>

              <div className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-[9px]">
                    !
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 text-xs block">CAS-784498</span>
                    <span className="text-gray-500 text-[10px]">Oil Leak Issue • Raised 08 May 2024</span>
                  </div>
                </div>
                <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded text-[10px]">In Progress</span>
              </div>
            </div>
          </div>

          {/* Roadside Assistance */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
              <h3 className="font-bold text-gray-900 text-sm">Roadside Assistance</h3>
              <button className="text-blue-600 font-bold text-xs hover:underline">View All</button>
            </div>

            <div className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 flex justify-between items-center text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[9px]">
                  ✓
                </div>
                <div>
                  <span className="font-bold text-gray-900 text-xs block">RA-12345</span>
                  <span className="text-gray-500 text-[10px]">Battery Jump Start</span>
                </div>
              </div>
              <div className="text-right">
                <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">Completed</span>
                <span className="text-[9px] text-gray-400 block mt-0.5">15 Apr 2024, 08:30 PM</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Bottom Row: Service History Table */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
          <h3 className="font-bold text-gray-900 text-base">Service History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[9px] border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Mileage</th>
                <th className="py-2.5 px-3">Service Type</th>
                <th className="py-2.5 px-3">Branch</th>
                <th className="py-2.5 px-3">Advisor</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-3 font-semibold text-gray-900">12 Jan 2024</td>
                <td className="py-3 px-3 font-bold text-gray-900">28,500 KM</td>
                <td className="py-3 px-3 font-semibold text-gray-800">30K Service</td>
                <td className="py-3 px-3 text-gray-600">Sheikh Zayed Road</td>
                <td className="py-3 px-3 text-gray-800">Omar Hassan</td>
                <td className="py-3 px-3 text-right font-black text-gray-900">AED 1,250</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-3 font-semibold text-gray-900">14 Oct 2023</td>
                <td className="py-3 px-3 font-bold text-gray-900">18,300 KM</td>
                <td className="py-3 px-3 font-semibold text-gray-800">20K Service</td>
                <td className="py-3 px-3 text-gray-600">Sheikh Zayed Road</td>
                <td className="py-3 px-3 text-gray-800">Omar Hassan</td>
                <td className="py-3 px-3 text-right font-black text-gray-900">AED 1,150</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-3 font-semibold text-gray-900">20 Apr 2023</td>
                <td className="py-3 px-3 font-bold text-gray-900">8,500 KM</td>
                <td className="py-3 px-3 font-semibold text-gray-800">5K Service</td>
                <td className="py-3 px-3 text-gray-600">Sheikh Zayed Road</td>
                <td className="py-3 px-3 text-gray-800">Omar Hassan</td>
                <td className="py-3 px-3 text-right font-black text-gray-900">AED 950</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
