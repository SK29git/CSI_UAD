import React from 'react';
import { 
  FaCar, 
  FaCheckCircle, 
  FaCalculator, 
  FaShieldAlt, 
  FaExchangeAlt, 
  FaFileAlt, 
  FaTag, 
  FaCheck, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaChevronDown,
  FaArrowRight
} from 'react-icons/fa';

export default function SalesOverviewView() {
  const salesActivities = [
    {
      id: 1,
      date: 'Today, 09:15 AM',
      type: 'Outbound Call',
      desc: 'Follow up on X5 upgrade offer',
      author: 'Sara Ahmed',
      status: 'Completed',
      statusColor: 'text-emerald-600 bg-emerald-50',
      icon: <FaPhoneAlt className="text-emerald-600 text-xs" />
    },
    {
      id: 2,
      date: 'Yesterday, 04:20 PM',
      type: 'Email Sent',
      desc: 'Sent exclusive offer for BMW X6',
      author: 'Sara Ahmed',
      status: 'Opened',
      statusColor: 'text-blue-600 bg-blue-50',
      icon: <FaEnvelope className="text-amber-500 text-xs" />
    },
    {
      id: 3,
      date: '2 Days Ago, 11:00 AM',
      type: 'Test Drive Booked',
      desc: 'Test drive for BMW X7',
      author: 'Online Booking',
      status: 'Completed',
      statusColor: 'text-emerald-600 bg-emerald-50',
      icon: <FaCalendarAlt className="text-blue-600 text-xs" />
    },
    {
      id: 4,
      date: '1 Week Ago, 03:30 PM',
      type: 'Lead Created',
      desc: 'Interested in new SUV',
      author: 'Website',
      status: 'Converted',
      statusColor: 'text-emerald-600 bg-emerald-50',
      icon: <FaTag className="text-purple-600 text-xs" />
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      
      {/* 1. Vehicle Details Card */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 text-base">Vehicle Details</h2>
            <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-2.5 py-0.5 rounded-full border border-emerald-200">
              Primary Vehicle
            </span>
          </div>

          <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
            <FaCheckCircle className="text-xs" /> VIN Verified
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          
          {/* Car Image (Left 4 Cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-2 bg-gray-50/60 rounded-xl border border-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600" 
              alt="BMW X5 xDrive40i" 
              className="w-full h-36 object-contain rounded-lg"
            />
            <div className="mt-2 text-center">
              <h3 className="font-extrabold text-gray-900 text-base leading-tight">BMW X5 xDrive40i</h3>
              <span className="text-xs text-gray-500 font-semibold">2024 Model</span>
            </div>
          </div>

          {/* Vehicle Specs Grid (Middle 8 Cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px]">VIN Number</span>
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
                <span className="text-emerald-600 font-bold text-[11px]">Active <span className="text-gray-400 text-[9px] font-normal">(Expires 12 Feb 2027)</span></span>
              </div>
            </div>

            <button className="w-full mt-2 py-2 border border-blue-600 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-50 transition-colors shadow-2xs">
              View Full Vehicle Profile
            </button>
          </div>

        </div>

        {/* 5 Quick Action Pill Buttons Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-4 mt-4 border-t border-gray-100 text-xs">
          <button className="p-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-colors">
            <FaCalculator className="text-gray-500" />
            <span>Finance Details</span>
          </button>
          <button className="p-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-colors">
            <FaShieldAlt className="text-gray-500" />
            <span>Insurance Details</span>
          </button>
          <button className="p-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-colors">
            <FaExchangeAlt className="text-gray-500" />
            <span>Trade-in History</span>
          </button>
          <button className="p-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-colors">
            <FaFileAlt className="text-gray-500" />
            <span>Documents</span>
          </button>
          <button className="p-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-colors">
            <FaTag className="text-gray-500" />
            <span>Accessories</span>
          </button>
        </div>
      </div>

      {/* 2. Trade-in Eligibility Card */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-sm">Trade-in Eligibility</h3>
            <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded">
              Eligible
            </span>
          </div>

          <span className="text-gray-400 font-semibold text-[11px]">Eligibility Criteria</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Left Values (7 Cols) */}
          <div className="md:col-span-7 grid grid-cols-3 gap-3 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
            <div>
              <span className="text-gray-400 block text-[10px] font-semibold">Eligibility Rule</span>
              <span className="font-bold text-emerald-700 text-xs">Meets criteria</span>
            </div>

            <div>
              <span className="text-gray-400 block text-[10px] font-semibold">Vehicle Age</span>
              <span className="font-bold text-gray-900 text-xs">2 Years 4 Months</span>
            </div>

            <div>
              <span className="text-gray-400 block text-[10px] font-semibold">Mileage</span>
              <span className="font-black text-gray-900 text-xs">38,200 KM</span>
            </div>
          </div>

          {/* Right Criteria Checklist (5 Cols) */}
          <div className="md:col-span-5 flex items-center justify-between pl-2">
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-2 text-gray-700">
                <FaCheck className="text-emerald-500 text-[10px]" />
                <span>Above 3 years</span>
                <span className="font-bold text-gray-900 ml-auto">No</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <FaCheck className="text-emerald-500 text-[10px]" />
                <span>Exceeds 60,000 KMS</span>
                <span className="font-bold text-gray-900 ml-auto">No</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center pl-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <FaCheck className="text-base" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 mt-1">Meets Trade-in Criteria</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Sales Summary Card */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 text-xs">
        <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-gray-100 mb-3">Sales Summary</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
            <span className="text-gray-400 block text-[10px] font-semibold">Total Leads</span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">8</span>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
            <span className="text-gray-400 block text-[10px] font-semibold">Open Leads</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block">2</span>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
            <span className="text-gray-400 block text-[10px] font-semibold">Won Deals</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">3</span>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
            <span className="text-gray-400 block text-[10px] font-semibold">Lost Deals</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">2</span>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center col-span-2 sm:col-span-1">
            <span className="text-gray-400 block text-[10px] font-semibold">Last Purchase</span>
            <span className="text-base font-black text-gray-900 mt-2 block">14 Feb 2024</span>
          </div>
        </div>
      </div>

      {/* 4. Recent Sales Activities Card */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
          <h3 className="font-bold text-gray-900 text-sm">Recent Sales Activities</h3>
          <button className="text-blue-600 font-bold text-xs hover:underline">View All</button>
        </div>

        <div className="space-y-3">
          {salesActivities.map((act) => (
            <div key={act.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-2xs flex-shrink-0">
                  {act.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-xs">{act.type}</span>
                    <span className="text-gray-400 text-[10px] font-medium">{act.date}</span>
                  </div>
                  <p className="text-gray-600 text-[11px] leading-tight my-0.5">{act.desc}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px]">
                <span className="text-gray-400 font-medium">{act.author}</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${act.statusColor}`}>
                  {act.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 py-2 border border-gray-200 text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1 transition-colors">
          <span>Load More Activities</span>
          <FaChevronDown className="text-[10px]" />
        </button>
      </div>

    </div>
  );
}
