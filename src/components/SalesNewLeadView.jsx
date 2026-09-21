import React, { useState } from 'react';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaFilter, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaStickyNote, 
  FaUsers, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaCalendarCheck,
  FaRedo,
  FaCheck
} from 'react-icons/fa';

export default function SalesNewLeadView() {
  const [contactMethod, setContactMethod] = useState('Phone');
  const [createFollowup, setCreateFollowup] = useState(true);
  const [activeFollowupTab, setActiveFollowupTab] = useState('My Follow Ups');
  const [activeActivityTab, setActiveActivityTab] = useState('All');
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  const followups = [
    { customer: 'Sumedh Kamble', model: 'BMW X5 xDrive40i', datetime: '14 May 2024, 10:00 AM', assignee: 'Omar Hassan', status: 'Scheduled', statusColor: 'bg-emerald-100 text-emerald-700' },
    { customer: 'Fatima Al Mansoori', model: 'Mercedes GLC 300', datetime: '14 May 2024, 02:30 PM', assignee: 'Sara Ahmed', status: 'Scheduled', statusColor: 'bg-emerald-100 text-emerald-700' },
    { customer: 'Mohammed Raza', model: 'Audi Q7', datetime: '13 May 2024, 11:00 AM', assignee: 'Sara Ahmed', status: 'Overdue', statusColor: 'bg-rose-100 text-rose-700' },
    { customer: 'Noora Al Falasi', model: 'BMW 520i', datetime: '15 May 2024, 09:30 AM', assignee: 'Sara Ahmed', status: 'Scheduled', statusColor: 'bg-emerald-100 text-emerald-700' },
    { customer: 'Yousef Ibrahim', model: 'Toyota Land Cruiser', datetime: '15 May 2024, 04:00 PM', assignee: 'Omar Hassan', status: 'Scheduled', statusColor: 'bg-emerald-100 text-emerald-700' },
  ];

  const activities = [
    { type: 'Outbound Call', icon: <FaPhoneAlt className="text-emerald-600" />, customer: 'Sumedh Kamble', desc: 'Discussed BMW X5 and test drive', by: 'Sara Ahmed', datetime: '12 May 2024, 10:24 AM' },
    { type: 'Email', icon: <FaEnvelope className="text-blue-600" />, customer: 'Sumedh Kamble', desc: 'Sent brochure for BMW X5', by: 'Sara Ahmed', datetime: '12 May 2024, 09:15 AM' },
    { type: 'Note', icon: <FaStickyNote className="text-amber-500" />, customer: 'Sumedh Kamble', desc: 'Customer interested in trade-in', by: 'Omar Hassan', datetime: '11 May 2024, 04:30 PM' },
    { type: 'Meeting', icon: <FaUsers className="text-purple-600" />, customer: 'Sumedh Kamble', desc: 'Test drive completed', by: 'Omar Hassan', datetime: '10 May 2024, 11:00 AM' },
  ];

  const handleSaveLead = (e) => {
    e.preventDefault();
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3500);
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* 1. Create New Lead Form & Lead Summary Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Left Form: Create New Lead (8 Cols) */}
        <div className="xl:col-span-8 bg-white rounded-xl p-4 shadow-xs border border-gray-100">
          <h2 className="font-bold text-gray-900 text-sm pb-3 border-b border-gray-100 mb-3">
            Create New Lead
          </h2>

          <form onSubmit={handleSaveLead} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Lead Source <span className="text-rose-500">*</span>
                </label>
                <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500">
                  <option>Website</option>
                  <option>Referral</option>
                  <option>Walk-in</option>
                  <option>Phone Call</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Interested In <span className="text-rose-500">*</span>
                </label>
                <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500">
                  <option>BMW X5 xDrive40i</option>
                  <option>BMW X6 xDrive40i</option>
                  <option>BMW X7 xDrive40i</option>
                  <option>BMW 520i Sedan</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Lead Type <span className="text-rose-500">*</span>
                </label>
                <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500">
                  <option>Purchase</option>
                  <option>Lease</option>
                  <option>Trade-in Upgrade</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Priority</label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-rose-600">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  <span>High</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  defaultValue="Sumedh Kamble"
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  defaultValue="+971 50 123 4567"
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Email Address</label>
                <input 
                  type="email" 
                  defaultValue="sumedh.kamble@email.com"
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Preferred Branch</label>
                <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500">
                  <option>Sheikh Zayed Road</option>
                  <option>Dubai Festival City</option>
                  <option>Al Quoz Showroom</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Preferred Contact Method</label>
                <div className="flex items-center gap-1.5 pt-0.5">
                  {['Phone', 'WhatsApp', 'Email'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setContactMethod(m)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                        contactMethod === m ? 'bg-blue-600 text-white shadow-2xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Best Time to Contact</label>
                <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500">
                  <option>Morning (9AM - 12PM)</option>
                  <option>Afternoon (12PM - 4PM)</option>
                  <option>Evening (4PM - 7PM)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Additional Notes</label>
                <textarea 
                  rows={1}
                  defaultValue="Interested in premium SUV with trade-in option. Prefers test drive on weekends."
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Follow-up Checkbox Section */}
            <div className="pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 text-xs">
                <input 
                  type="checkbox" 
                  checked={createFollowup} 
                  onChange={(e) => setCreateFollowup(e.target.checked)} 
                  className="rounded text-blue-600 focus:ring-blue-500" 
                />
                <span>Create Follow-up</span>
              </label>

              {createFollowup && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold block mb-0.5">Follow-up Date</span>
                    <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800">
                      <span>14 May 2024</span>
                      <FaCalendarAlt className="text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold block mb-0.5">Follow-up Time</span>
                    <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800">
                      <span>10:00 AM</span>
                      <FaClock className="text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold block mb-0.5">Assign To</span>
                    <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 focus:outline-none focus:border-blue-500">
                      <option>Omar Hassan</option>
                      <option>Sara Ahmed</option>
                      <option>Ali Khalid</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Form Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button 
                type="reset" 
                className="px-4 py-2 border border-gray-200 text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
              >
                Save Lead
              </button>
            </div>
          </form>
        </div>

        {/* Right Card: Lead Summary (4 Cols) */}
        <div className="xl:col-span-4 bg-white rounded-xl p-4 shadow-xs border border-gray-100 text-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-gray-100 mb-3">
              Lead Summary
            </h3>

            {/* Score Box */}
            <div className="flex items-center gap-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 mb-3">
              <div className="w-11 h-11 rounded-full bg-emerald-500 text-white font-black text-base flex items-center justify-center shadow-2xs">
                85
              </div>
              <div>
                <span className="font-bold text-emerald-700 text-sm block leading-tight">High Potential</span>
                <span className="text-[10px] text-gray-500 font-medium">Verified Intent & Budget</span>
              </div>
            </div>

            {/* Lead Attributes Grid */}
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 text-xs p-3 bg-gray-50/60 rounded-xl border border-gray-100">
              <div>
                <span className="text-gray-400 block text-[10px]">Interest</span>
                <span className="font-bold text-gray-900">High</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Budget Range / Timeline</span>
                <span className="font-bold text-gray-900">1 - 3 Months</span>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px]">Buying Power</span>
                <span className="font-black text-gray-900">AED 250K - 350K</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Test Drive - Deferred</span>
                <span className="font-bold text-gray-900">Yes</span>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px]">Trade-in</span>
                <span className="font-bold text-emerald-600">Yes</span>
              </div>
            </div>

            {/* Car Preview Image */}
            <div className="mt-3 flex flex-col items-center justify-center p-2 bg-gray-50/40 rounded-xl border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400" 
                alt="BMW X5 xDrive40i" 
                className="w-full h-24 object-contain rounded-lg"
              />
            </div>
          </div>

          {/* Recommended Next Step Box */}
          <div className="mt-3 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <FaCalendarCheck className="text-blue-600 text-xs" />
              <span className="font-bold text-blue-900 text-xs">Schedule test drive</span>
            </div>
            <p className="text-gray-600 text-[10px] leading-tight">
              Increase engagement by scheduling a test drive.
            </p>
          </div>
        </div>

      </div>

      {/* 2. Follow Up Table Card */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-sm">Follow Up</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <FaFilter className="text-[10px]" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1">
              {['My Follow Ups (5)', 'Team Follow Ups (15)', 'Overdue (3)'].map((tab) => {
                const label = tab.split(' ')[0] + ' Follow Ups';
                const isSelected = activeFollowupTab.startsWith(tab.split(' ')[0]);
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveFollowupTab(label)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <button className="text-blue-600 font-bold text-[11px] hover:underline hidden sm:block">
              View Calendar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 uppercase text-[9px] font-bold border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Lead / Interested In</th>
                <th className="py-2.5 px-3">Follow-up Date & Time</th>
                <th className="py-2.5 px-3">Assigned To</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
              {followups.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-3 px-3 font-bold text-gray-900">{row.customer}</td>
                  <td className="py-3 px-3 text-gray-800">{row.model}</td>
                  <td className="py-3 px-3 text-gray-600">{row.datetime}</td>
                  <td className="py-3 px-3 text-gray-800">{row.assignee}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button className="text-emerald-600 hover:text-emerald-800 p-1">
                      <FaPhoneAlt className="text-xs" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. All Activities Log Card */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 mb-3">
          <h3 className="font-bold text-gray-900 text-sm">All Activities</h3>

          {/* Category Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {['All (28)', 'Calls (12)', 'Emails (6)', 'Meetings (4)', 'Notes (6)'].map((tab) => {
              const name = tab.split(' ')[0];
              const isSelected = activeActivityTab === name;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveActivityTab(name)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 uppercase text-[9px] font-bold border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3">Activity</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">By</th>
                <th className="py-2.5 px-3 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
              {activities.map((act, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-3 px-3">
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                      {act.icon}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-bold text-gray-900">{act.customer}</td>
                  <td className="py-3 px-3 font-semibold text-gray-800">{act.type}</td>
                  <td className="py-3 px-3 text-gray-600">{act.desc}</td>
                  <td className="py-3 px-3 text-gray-800">{act.by}</td>
                  <td className="py-3 px-3 text-right text-gray-400 text-[10px]">{act.datetime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 pt-2 border-t border-gray-100 text-center">
          <button className="text-blue-600 font-bold text-xs hover:underline">
            View All Activities
          </button>
        </div>
      </div>

      {/* Save Success Toast Popup */}
      {saveSuccessToast && (
        <div className="fixed bottom-5 right-5 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 text-xs animate-in slide-in-from-bottom">
          <FaCheckCircle className="text-emerald-400 text-base" />
          <div>
            <span className="font-bold block">Lead Saved Successfully!</span>
            <span className="text-gray-300 text-[10px]">New lead for Sumedh Kamble has been recorded.</span>
          </div>
        </div>
      )}

    </div>
  );
}
