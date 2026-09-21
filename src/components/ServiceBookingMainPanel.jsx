import React, { useState } from 'react';
import { 
  FaWrench, 
  FaSnowflake, 
  FaCheckCircle, 
  FaCalendarAlt, 
  FaClock, 
  FaCar, 
  FaShieldAlt, 
  FaBatteryFull, 
  FaCircle, 
  FaExclamationCircle, 
  FaCheck, 
  FaInfoCircle, 
  FaEdit, 
  FaTrashAlt, 
  FaEye,
  FaRobot,
  FaCalendarCheck
} from 'react-icons/fa';
import { GiCarWheel } from 'react-icons/gi';

export default function ServiceBookingMainPanel() {
  const [selectedServiceType, setSelectedServiceType] = useState('Regular Service');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM');
  const [pickupRequired, setPickupRequired] = useState(true);
  const [loanCarRequired, setLoanCarRequired] = useState(true);
  const [contactMethod, setContactMethod] = useState('Phone');
  const [selectedPackage, setSelectedPackage] = useState('Advanced Care');
  const [complaintText, setComplaintText] = useState(
    'Customer mentioned slight vibration while braking and AC not cooling properly.'
  );

  const [bookingConfirmedModal, setBookingConfirmedModal] = useState(false);

  const serviceTypes = [
    { id: 'Regular Service', label: 'Regular Service', icon: <FaWrench /> },
    { id: 'Major Service', label: 'Major Service', icon: <FaWrench /> },
    { id: 'AC Repair', label: 'AC Repair', icon: <FaSnowflake /> },
    { id: 'Brake Service', label: 'Brake Service', icon: <FaCar /> },
    { id: 'Tire Replacement', label: 'Tire Replacement', icon: <GiCarWheel /> },
    { id: 'Battery Check', label: 'Battery Check', icon: <FaBatteryFull /> },
    { id: 'Warranty Repair', label: 'Warranty Repair', icon: <FaShieldAlt /> },
  ];

  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

  const packages = [
    { id: 'Essential Care', title: 'Essential Care', price: 'AED 1,250', desc: 'Includes: Engine Oil, Oil Filter, Vehicle Check' },
    { id: 'Advanced Care', title: 'Advanced Care', price: 'AED 1,650', desc: 'Includes: Essential Care + AC Check, Brake Inspection', recommended: true },
    { id: 'Premium Care', title: 'Premium Care', price: 'AED 2,250', desc: 'Includes: Advanced Care + Premium Wash' },
  ];

  return (
    <div className="flex-1 flex flex-col gap-4">
      
      {/* 1. Select Service Details Card */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <h2 className="font-bold text-gray-900 text-base">1. Select Service Details</h2>

          {/* Parts Availability & Workshop Capacity Quick Status */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <FaCheckCircle className="text-xs" />
              <span>All parts available</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium text-[11px]">Workshop Capacity:</span>
              <div className="flex items-center gap-1.5">
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-[80%] h-full bg-blue-600 rounded-full"></div>
                </div>
                <span className="font-bold text-blue-600 text-[11px]">High (80%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Selection Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Service Types Selector Grid (Left 6 Cols) */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <label className="text-xs font-bold text-gray-700 block">
              Service Type <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-4 gap-2 text-xs">
              {serviceTypes.map((type) => {
                const isSelected = selectedServiceType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedServiceType(type.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center relative ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold shadow-xs'
                        : 'border-gray-200 bg-gray-50/50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`text-base ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                      {type.icon}
                    </div>
                    <span className="text-[10px] leading-tight font-medium">{type.label}</span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-blue-600 flex items-center justify-center">
                        <FaCheck className="text-[7px] text-white" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Customer Complaints Textarea */}
            <div className="mt-2 text-xs space-y-1">
              <div className="flex justify-between items-center text-gray-700 font-semibold">
                <span>Customer Complaints / Requests</span>
                <span className="text-gray-400 font-normal text-[10px]">{complaintText.length}/500</span>
              </div>
              <textarea
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                placeholder="Enter customer complaints or special instructions..."
              />
            </div>
          </div>

          {/* Form Controls & Toggles (Right 6 Cols) */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">
                Preferred Branch <span className="text-rose-500">*</span>
              </label>
              <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500">
                <option>Sheikh Zayed Road</option>
                <option>Dubai Festival City</option>
                <option>Al Quoz Service Center</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">
                Service Advisor <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800">
                <span>Omar Hassan</span>
                <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-1 bg-emerald-50 px-1.5 py-0.2 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Available
                </span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">
                Preferred Date <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800">
                <span>20 May 2026</span>
                <FaCalendarAlt className="text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">
                Preferred Time <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-300 rounded-lg font-bold text-blue-700">
                <span>10:00 AM</span>
                <FaClock className="text-blue-500" />
              </div>
            </div>

            {/* Toggles */}
            <div className="col-span-2 grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-semibold text-gray-800">Vehicle Pick-up Required</span>
                <button 
                  onClick={() => setPickupRequired(!pickupRequired)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${pickupRequired ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${pickupRequired ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-semibold text-gray-800">Loan Car Required</span>
                <button 
                  onClick={() => setLoanCarRequired(!loanCarRequired)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${loanCarRequired ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${loanCarRequired ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </button>
              </div>
            </div>

            {/* Preferred Contact Method Pills */}
            <div className="col-span-2 flex items-center justify-between pt-1">
              <span className="font-bold text-gray-700 text-[11px]">Preferred Contact Method</span>
              <div className="flex items-center gap-1.5">
                {['Phone', 'WhatsApp', 'Email'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setContactMethod(method)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      contactMethod === method
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-2 flex justify-between items-center text-xs bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
              <div>
                <span className="text-gray-500 block text-[10px]">Estimated Duration</span>
                <span className="font-bold text-gray-900">2.5 - 3 Hours</span>
              </div>
              <div className="text-right">
                <span className="text-gray-500 block text-[10px]">Estimated Cost (Incl. VAT)</span>
                <span className="font-black text-blue-600">AED 1,250 - 1,450</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 2. Available Slots & Recommended Packages Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Left: Available Slots on 20 May 2026 (4 Cols) */}
        <div className="xl:col-span-4 bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 text-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-xs pb-2 border-b border-gray-100 mb-3">
              Available Slots on 20 May 2026
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-gray-400 font-bold text-[10px] uppercase block mb-1">Morning</span>
                <div className="flex flex-wrap gap-1.5">
                  <button className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-medium text-[11px]">09:00 AM</button>
                  <button className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-bold text-[11px] shadow-xs">10:00 AM</button>
                  <button className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-medium text-[11px]">11:00 AM</button>
                </div>
              </div>

              <div>
                <span className="text-gray-400 font-bold text-[10px] uppercase block mb-1">Afternoon</span>
                <div className="flex flex-wrap gap-1.5">
                  <button className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-medium text-[11px]">01:00 PM</button>
                  <button className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-medium text-[11px]">02:00 PM</button>
                  <button className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-medium text-[11px]">03:00 PM</button>
                  <button className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-medium text-[11px]">04:00 PM</button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] pt-3 border-t border-gray-100 text-gray-500">
            <span className="flex items-center gap-1"><FaCircle className="text-emerald-500 text-[6px]" /> Available</span>
            <span className="flex items-center gap-1"><FaCircle className="text-amber-500 text-[6px]" /> Limited</span>
            <span className="flex items-center gap-1"><FaCircle className="text-rose-500 text-[6px]" /> Fully Booked</span>
          </div>
        </div>

        {/* Middle: Recommended Service Packages (5 Cols) */}
        <div className="xl:col-span-5 bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 text-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-xs pb-2 border-b border-gray-100 mb-3">
              Recommended Service Packages
            </h3>

            <div className="space-y-2">
              {packages.map((pkg) => {
                const isSelected = selectedPackage === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 text-blue-900 font-semibold shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="service_pkg" 
                          checked={isSelected} 
                          onChange={() => setSelectedPackage(pkg.id)}
                          className="text-blue-600 focus:ring-blue-500" 
                        />
                        <span className="font-bold text-gray-900">{pkg.title}</span>
                      </div>
                      <span className="font-black text-gray-900">{pkg.price}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 pl-6 mt-0.5">{pkg.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Recommendation Banner */}
          <div className="mt-3 p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 text-[11px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-900 flex items-center gap-1">
                <FaRobot className="text-purple-600" /> AI Recommendation
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                High Value
              </span>
            </div>
            <p className="text-gray-700 text-[10px] leading-tight">
              Based on vehicle usage and history, we recommend Advanced Care package for optimal performance and safety.
            </p>
            <button className="text-blue-600 font-bold text-[10px] hover:underline block pt-0.5">
              View Recommendation Details
            </button>
          </div>
        </div>

        {/* Right: Total Estimated Cost & Confirmation Action (3 Cols) */}
        <div className="xl:col-span-3 bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 text-xs flex flex-col justify-between">
          <div>
            <span className="text-gray-400 block text-[11px] font-semibold">Total Estimated Cost</span>
            <div className="text-2xl font-black text-blue-600 mt-0.5">AED 1,650</div>
            <span className="text-gray-400 text-[10px]">Includes VAT</span>
          </div>

          <div className="space-y-2 mt-4">
            <button 
              onClick={() => setBookingConfirmedModal(true)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
            >
              Confirm Booking
            </button>

            <button className="w-full py-2 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs rounded-lg shadow-xs transition-colors">
              Save & Send Estimate
            </button>

            <button className="w-full text-center text-rose-600 text-xs font-semibold hover:underline block py-1">
              Cancel Booking
            </button>
          </div>
        </div>

      </div>

      {/* 3. Booking Journey (Interactive 7-Step Timeline) */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100">
        <h3 className="font-bold text-gray-900 text-xs mb-3">Booking Journey</h3>

        <div className="flex items-center justify-between text-xs relative before:absolute before:left-4 before:right-4 before:top-3 before:h-[2px] before:bg-gray-200 z-0">
          {[
            { step: 1, label: 'Booking Created', date: '20 May 2026, 10:00 AM', active: true },
            { step: 2, label: 'Advisor Assigned', date: 'Pending', active: false },
            { step: 3, label: 'Vehicle Received', date: 'Pending', active: false },
            { step: 4, label: 'Diagnosis', date: 'Pending', active: false },
            { step: 5, label: 'Repair', date: 'Pending', active: false },
            { step: 6, label: 'Quality Check', date: 'Pending', active: false },
            { step: 7, label: 'Ready for Delivery', date: 'Pending', active: false },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center text-center relative z-10">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                s.active ? 'bg-blue-600 text-white' : 'bg-white border-2 border-gray-300 text-gray-400'
              }`}>
                {s.active ? <FaCheck /> : s.step}
              </div>
              <span className={`text-[10px] mt-1 font-bold ${s.active ? 'text-gray-900' : 'text-gray-500'}`}>{s.label}</span>
              <span className="text-[9px] text-gray-400">{s.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Tables: Open Bookings (3) & Upcoming Appointments (2) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Open Bookings (3) */}
        <div className="xl:col-span-7 bg-white rounded-xl p-4 shadow-xs border border-gray-100 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
            <h3 className="font-bold text-gray-900 text-xs">Open Bookings (3)</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 uppercase text-[9px] font-bold border-b border-gray-100">
                <tr>
                  <th className="py-2 px-2">Booking ID</th>
                  <th className="py-2 px-2">Service Type</th>
                  <th className="py-2 px-2">Branch</th>
                  <th className="py-2 px-2">Date & Time</th>
                  <th className="py-2 px-2">Advisor</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[11px] font-medium text-gray-700">
                <tr>
                  <td className="py-2.5 px-2 font-bold text-blue-600">BK-1002456</td>
                  <td className="py-2.5 px-2">Regular Service</td>
                  <td className="py-2.5 px-2">Sheikh Zayed Road</td>
                  <td className="py-2.5 px-2">20 May 2026, 10:00 AM</td>
                  <td className="py-2.5 px-2">Omar Hassan</td>
                  <td className="py-2.5 px-2"><span className="bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.2 rounded text-[10px]">Confirmed</span></td>
                  <td className="py-2.5 px-2 text-right flex items-center justify-end gap-1.5">
                    <button title="View" className="text-gray-400 hover:text-blue-600"><FaEye className="text-[11px]" /></button>
                    <button title="Edit" className="text-gray-400 hover:text-blue-600"><FaEdit className="text-[11px]" /></button>
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-2 font-bold text-blue-600">BK-1002789</td>
                  <td className="py-2.5 px-2">AC Repair</td>
                  <td className="py-2.5 px-2">Sheikh Zayed Road</td>
                  <td className="py-2.5 px-2">27 May 2026, 10:00 AM</td>
                  <td className="py-2.5 px-2">Sara Ahmed</td>
                  <td className="py-2.5 px-2"><span className="bg-amber-100 text-amber-700 font-bold px-1.5 py-0.2 rounded text-[10px]">Pending</span></td>
                  <td className="py-2.5 px-2 text-right flex items-center justify-end gap-1.5">
                    <button title="View" className="text-gray-400 hover:text-blue-600"><FaEye className="text-[11px]" /></button>
                    <button title="Edit" className="text-gray-400 hover:text-blue-600"><FaEdit className="text-[11px]" /></button>
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-2 font-bold text-blue-600">BK-1003125</td>
                  <td className="py-2.5 px-2">Major Service</td>
                  <td className="py-2.5 px-2">Dubai Festival City</td>
                  <td className="py-2.5 px-2">05 Jun 2026, 11:00 AM</td>
                  <td className="py-2.5 px-2">Ali Khalid</td>
                  <td className="py-2.5 px-2"><span className="bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded text-[10px]">Scheduled</span></td>
                  <td className="py-2.5 px-2 text-right flex items-center justify-end gap-1.5">
                    <button title="View" className="text-gray-400 hover:text-blue-600"><FaEye className="text-[11px]" /></button>
                    <button title="Edit" className="text-gray-400 hover:text-blue-600"><FaEdit className="text-[11px]" /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Appointments (2) */}
        <div className="xl:col-span-5 bg-white rounded-xl p-4 shadow-xs border border-gray-100 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
            <h3 className="font-bold text-gray-900 text-xs">Upcoming Appointments (2)</h3>
            <button className="text-blue-600 font-bold text-[10px] hover:underline">View Calendar</button>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <span className="font-bold text-gray-900 block">20 May 2026, 10:00 AM</span>
                <span className="text-gray-500 text-[10px]">Regular Service • Sheikh Zayed Road (Omar Hassan)</span>
              </div>
              <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">Confirmed</span>
            </div>

            <div className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <span className="font-bold text-gray-900 block">27 May 2026, 02:30 PM</span>
                <span className="text-gray-500 text-[10px]">AC Repair • Sheikh Zayed Road (Sara Ahmed)</span>
              </div>
              <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded text-[10px]">Pending</span>
            </div>
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {bookingConfirmedModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl animate-in fade-in zoom-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto">
              <FaCalendarCheck />
            </div>

            <h3 className="text-xl font-extrabold text-gray-900">Service Booking Confirmed!</h3>
            <p className="text-xs text-gray-600">
              Booking <strong className="text-blue-600">BK-1002456</strong> for <strong>Sumedh Kamble</strong> has been successfully booked for <strong>20 May 2026 at 10:00 AM</strong> at Sheikh Zayed Road Branch.
            </p>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Service Package:</span>
                <span className="font-bold text-gray-800">{selectedPackage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Estimate:</span>
                <span className="font-bold text-blue-600">AED 1,650</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service Advisor:</span>
                <span className="font-bold text-gray-800">Omar Hassan</span>
              </div>
            </div>

            <button 
              onClick={() => setBookingConfirmedModal(false)}
              className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
