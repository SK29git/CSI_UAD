import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { 
  FaFolderOpen, 
  FaUserShield, 
  FaExclamationCircle, 
  FaCheckCircle, 
  FaClock, 
  FaArrowUp, 
  FaCheck, 
  FaHourglassHalf,
  FaCar,
  FaTicketAlt,
  FaPhoneVolume,
  FaGift
} from 'react-icons/fa';

export default function OverviewView() {
  const { customer, openComplaintsCount } = useCustomer();
  const [escalationStep, setEscalationStep] = useState(3);
  const [showEscalatedModal, setShowEscalatedModal] = useState(false);

  const [summaryData, setSummaryData] = useState({
    keyloopGroup: "BMW",
    branch: "10",
    openComplaints: 4,
    resolvedToday: 0,
    slaBreaches: 0
  });
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      const g = customer?.keyloopGroup || 'BMW';
      const b = customer?.branchCode || '10';
      setSummaryLoading(true);
      try {
        let res;
        const apiUrl = `/api/v1/complaints/summary?group=${g}&branch=${b}`;
        const fallbackUrl = `https://ccaas.agmcgroup.ae/api/v1/complaints/summary?group=${g}&branch=${b}`;
        try {
          res = await fetch(apiUrl);
        } catch {
          res = await fetch(fallbackUrl);
        }
        if (res && res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            setSummaryData(data);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch complaint summary:", err);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummary();
  }, [customer]);

  const handleEscalateNow = () => {
    if (escalationStep < 4) {
      setEscalationStep(prev => prev + 1);
    } else {
      setShowEscalatedModal(true);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Top 5 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: Open Complaints */}
        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm">
              <FaFolderOpen />
            </div>
            <span className="text-xs font-semibold text-gray-500">Open Complaints</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-gray-900">{typeof openComplaintsCount === 'number' ? openComplaintsCount : 3}</span>
            <button className="text-blue-600 text-xs font-bold hover:underline">View All</button>
          </div>
        </div>

        {/* Card 2: Escalated Cases */}
        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center text-lg shadow-sm">
              <FaUserShield />
            </div>
            <span className="text-xs font-semibold text-gray-500">Escalated Cases</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-gray-900">3</span>
            <button className="text-blue-600 text-xs font-bold hover:underline">View All</button>
          </div>
        </div>

        {/* Card 3: SLA Breaches */}
        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center text-lg shadow-sm">
              <FaExclamationCircle />
            </div>
            <span className="text-xs font-semibold text-gray-500">SLA Breaches</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-gray-900">2</span>
            <button className="text-blue-600 text-xs font-bold hover:underline">View All</button>
          </div>
        </div>

        {/* Card 4: Resolved Today */}
        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-lg shadow-sm">
              <FaCheckCircle />
            </div>
            <span className="text-xs font-semibold text-gray-500">Resolved Today</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-gray-900">5</span>
            <button className="text-blue-600 text-xs font-bold hover:underline">View All</button>
          </div>
        </div>

        {/* Card 5: Avg Resolution Time */}
        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-purple-700 text-white flex items-center justify-center text-lg shadow-sm">
              <FaClock />
            </div>
            <span className="text-xs font-semibold text-gray-500 text-right">Avg Resolution Time</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-900">18</span>
              <span className="text-xs font-bold text-gray-500">Hrs</span>
            </div>
            <button className="text-blue-600 text-xs font-bold hover:underline">View Report</button>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Complaint Details & Escalation Tracker */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left Side: Complaint Details Card */}
        <div className="xl:col-span-7 bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-base">Complaint Details</h3>
                <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded text-[11px]">
                  Escalated
                </span>
              </div>
              <button className="text-blue-600 text-xs font-semibold hover:underline">View Full Details</button>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs mt-4">
              <div>
                <span className="text-gray-400 block text-[11px]">Complaint ID</span>
                <span className="font-bold text-gray-900 text-sm">CMP-784512</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Assigned To</span>
                <span className="font-semibold text-gray-800">Complaints Desk</span>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">Category</span>
                <span className="font-semibold text-gray-800">Service</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Branch</span>
                <span className="font-semibold text-gray-800">Sheikh Zayed Road</span>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">Subcategory</span>
                <span className="font-semibold text-gray-800">Parts Availability</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Opened On</span>
                <span className="font-medium text-gray-800">18 May 2026, 10:15 AM</span>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">Priority</span>
                <span className="font-bold text-rose-600 flex items-center gap-1">
                  <FaArrowUp className="text-[10px]" /> High
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">SLA Due</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-bold text-rose-600">20 May 2026, 05:00 PM</span>
                  <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.2 rounded">
                    At Risk
                  </span>
                </div>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">Status</span>
                <span className="font-bold text-rose-600">Escalated</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Loan Car Required</span>
                <span className="font-bold text-gray-800">Yes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Escalation Tracker Card */}
        <div className="xl:col-span-5 bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Escalation Tracker</h3>
              <button className="text-blue-600 text-xs font-semibold hover:underline">View All</button>
            </div>

            {/* Steps Timeline */}
            <div className="mt-4 space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-6 before:w-[2px] before:bg-gray-200">
              {/* Level 1 */}
              <div className="flex items-start gap-3 relative z-10 text-xs">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] flex-shrink-0 shadow-xs">
                  <FaCheck />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">Level 1</div>
                    <div className="text-gray-500 text-[11px]">Service Advisor</div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-600 font-bold text-[11px]">Completed</span>
                    <div className="text-gray-400 text-[10px]">18 May 2026, 10:30 AM</div>
                  </div>
                </div>
              </div>

              {/* Level 2 */}
              <div className="flex items-start gap-3 relative z-10 text-xs">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] flex-shrink-0 shadow-xs">
                  <FaCheck />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">Level 2</div>
                    <div className="text-gray-500 text-[11px]">Branch Manager</div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-600 font-bold text-[11px]">Completed</span>
                    <div className="text-gray-400 text-[10px]">18 May 2026, 11:20 AM</div>
                  </div>
                </div>
              </div>

              {/* Level 3 */}
              <div className="flex items-start gap-3 relative z-10 text-xs">
                <div className={`w-6 h-6 rounded-full ${escalationStep >= 3 ? 'bg-white border-2 border-amber-500 text-amber-500 font-bold' : 'bg-gray-100 border-2 border-gray-300'} flex items-center justify-center text-[10px] flex-shrink-0`}>
                  {escalationStep > 3 ? <FaCheck className="text-emerald-500" /> : <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">Level 3</div>
                    <div className="text-gray-500 text-[11px]">Complaints Manager</div>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-600 font-bold text-[11px]">In Progress</span>
                    <div className="text-gray-400 text-[10px]">18 May 2026, 12:05 PM</div>
                  </div>
                </div>
              </div>

              {/* Level 4 */}
              <div className="flex items-start gap-3 relative z-10 text-xs">
                <div className={`w-6 h-6 rounded-full ${escalationStep >= 4 ? 'bg-white border-2 border-emerald-500 text-emerald-500 font-bold' : 'bg-gray-100 border-2 border-gray-300 text-gray-400'} flex items-center justify-center text-[10px] flex-shrink-0`}>
                  {escalationStep >= 4 ? <FaCheck className="text-emerald-500" /> : null}
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">Level 4</div>
                    <div className="text-gray-500 text-[11px]">Customer Experience Director</div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 font-semibold text-[11px]">{escalationStep >= 4 ? 'Active' : 'Pending'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleEscalateNow}
            className="w-full mt-4 py-2 border border-blue-600 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-50 transition-colors shadow-xs"
          >
            Escalate Now
          </button>
        </div>
      </div>

      {/* 3. Complaint Summary */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
          <h3 className="font-bold text-gray-900 text-base">Complaint Summary</h3>
          <button className="text-blue-600 text-xs font-semibold hover:underline cursor-pointer">View Report</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-xs">
          <div>
            <span className="text-gray-400 block text-[11px]">Keyloop Group</span>
            <span className="text-xl font-black text-gray-900 mt-1 block">{summaryData.keyloopGroup || 'BMW'}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[11px]">Branch Code</span>
            <span className="text-xl font-black text-gray-900 mt-1 block">{summaryData.branch || '10'}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[11px]">Open Complaints</span>
            <span className="text-xl font-black text-blue-600 mt-1 block">{summaryData.openComplaints ?? 4}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[11px]">Resolved Today</span>
            <span className="text-xl font-black text-emerald-600 mt-1 block">{summaryData.resolvedToday ?? 0}</span>
          </div>

          <div>
            <span className="text-gray-400 block text-[11px]">SLA Breaches</span>
            <span className="text-xl font-black text-rose-600 mt-1 block">{summaryData.slaBreaches || '0'}</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Split Row: Root Cause Analysis & Recovery Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left Side: Root Cause Analysis Card */}
        <div className="xl:col-span-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base">Root Cause Analysis</h3>
            <button className="text-blue-600 text-xs font-semibold hover:underline">Edit</button>
          </div>

          <div className="space-y-3.5 text-xs mt-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Main Cause</span>
              <span className="font-semibold text-gray-900 bg-gray-50 px-2.5 py-1 rounded">Delayed Spare Parts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Secondary Cause</span>
              <span className="font-semibold text-gray-900 bg-gray-50 px-2.5 py-1 rounded">Advisor Follow-up Delay</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Repeat Issue</span>
              <span className="font-bold text-gray-900">Yes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Similar Complaints <span className="text-gray-400 text-[10px]">(Last 90 Days)</span></span>
              <span className="font-bold text-gray-900 text-sm">6</span>
            </div>
          </div>
        </div>

        {/* Right Side: Recovery Actions Card */}
        <div className="xl:col-span-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base">Recovery Actions</h3>
            <button className="text-blue-600 text-xs font-semibold hover:underline">Manage</button>
          </div>

          <div className="space-y-3 text-xs mt-3">
            {/* Item 1 */}
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <FaCar className="text-xs" />
                </div>
                <span className="font-semibold text-gray-800">Courtesy Vehicle Offered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaCheckCircle className="text-emerald-500 text-sm" />
                <span className="font-bold text-emerald-600 text-[11px]">Completed</span>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <FaTicketAlt className="text-xs" />
                </div>
                <span className="font-semibold text-gray-800">Service Voucher</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaCheckCircle className="text-emerald-500 text-sm" />
                <span className="font-bold text-emerald-600 text-[11px]">Approved</span>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded bg-amber-100 text-amber-600 flex items-center justify-center">
                  <FaPhoneVolume className="text-xs" />
                </div>
                <span className="font-semibold text-gray-800">Service Manager Callback</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaHourglassHalf className="text-amber-500 text-xs" />
                <span className="font-bold text-amber-600 text-[11px]">Pending</span>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <FaGift className="text-xs" />
                </div>
                <span className="font-semibold text-gray-800">Goodwill Compensation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaCheckCircle className="text-emerald-500 text-sm" />
                <span className="font-bold text-emerald-600 text-[11px]">Approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
