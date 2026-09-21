import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaShoppingBag, 
  FaCar, 
  FaStar, 
  FaShieldAlt 
} from 'react-icons/fa';

export default function CenterNavTabs({ activeModule, activeSubTab, setActiveSubTab }) {
  const navigate = useNavigate();

  const complaintSubTabs = [
    { id: 'Overview', label: 'Overview' },
    { id: 'Open Complaints', label: 'Open Complaints', count: 8 },
    { id: 'Escalations', label: 'Escalations', count: 3 },
    { id: 'SLA Breaches', label: 'SLA Breaches', count: 2 },
    { id: 'Root Cause', label: 'Root Cause' },
    { id: 'Recovery Actions', label: 'Recovery Actions' },
    { id: 'Reports', label: 'Reports' },
  ];

  const serviceSubTabs = [
    { id: 'Overview', label: 'Overview' },
    { id: 'Book Service', label: 'Book Service' },
    { id: 'Service History', label: 'Service History' },
    { id: 'Open Bookings', label: 'Open Bookings' },
    { id: 'Cancelled Bookings', label: 'Cancelled Bookings' },
    { id: 'Roadside Assistance', label: 'Roadside Assistance' },
    { id: 'Warranty', label: 'Warranty' },
    { id: 'Documents', label: 'Documents' },
  ];

  const feedbackSubTabs = [
    { id: 'Overview', label: 'Overview' },
    { id: 'CSI', label: 'CSI' },
    { id: 'NPS', label: 'NPS' },
    { id: 'Lost Sales Analysis', label: 'Lost Sales Analysis' },
    { id: 'Open Bookings', label: 'Open Bookings' },
    { id: 'Cancelled Bookings', label: 'Cancelled Bookings' },
  ];

  const salesSubTabs = [
    { id: 'Overview', label: 'Overview' },
    { id: 'New Lead', label: 'New Lead' },
    { id: 'Follow Up', label: 'Follow Up' },
    { id: 'All Activities', label: 'All Activities' },
  ];

  let currentSubTabs = complaintSubTabs;
  if (activeModule === 'Service') currentSubTabs = serviceSubTabs;
  if (activeModule === 'Feedback') currentSubTabs = feedbackSubTabs;
  if (activeModule === 'Sales') currentSubTabs = salesSubTabs;

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-3 mb-4 flex flex-col gap-2.5">
      {/* ROW 1: Module Switcher Tabs */}
      <div className="flex items-center justify-center gap-8 text-xs border-b border-gray-100 pb-2">
        <button 
          onClick={() => navigate('/sales')}
          className={`pb-1 flex items-center gap-2 cursor-pointer transition-colors ${
            activeModule === 'Sales' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-gray-600 font-semibold hover:text-gray-900'
          }`}
        >
          <FaShoppingBag className="text-xs" />
          <span>Sales</span>
        </button>

        <button 
          onClick={() => navigate('/service')}
          className={`pb-1 flex items-center gap-2 cursor-pointer transition-colors ${
            activeModule === 'Service' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-gray-600 font-semibold hover:text-gray-900'
          }`}
        >
          <FaCar className="text-xs" />
          <span>Service</span>
        </button>

        <button 
          onClick={() => navigate('/feedback')}
          className={`pb-1 flex items-center gap-2 cursor-pointer transition-colors ${
            activeModule === 'Feedback' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-gray-600 font-semibold hover:text-gray-900'
          }`}
        >
          <FaStar className="text-xs" />
          <span>Feedback</span>
        </button>

        <button 
          onClick={() => navigate('/')}
          className={`pb-1 flex items-center gap-2 cursor-pointer transition-colors ${
            activeModule === 'Complaints Manager' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-gray-600 font-semibold hover:text-gray-900'
          }`}
        >
          <FaShieldAlt className="text-xs" />
          <span>Complaints Manager</span>
        </button>
      </div>

      {/* ROW 2: Sub-Navigation Workflow Bar */}
      <div className="flex items-center justify-center gap-6 overflow-x-auto text-xs font-medium no-scrollbar pt-1">
        {currentSubTabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab && setActiveSubTab(tab.id)}
              className={`pb-1.5 relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                isActive ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
