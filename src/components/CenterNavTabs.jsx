import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { 
  FaShoppingBag, 
  FaCar, 
  FaStar, 
  FaShieldAlt,
  FaChevronLeft,
  FaChevronRight,
  FaColumns
} from 'react-icons/fa';

export default function CenterNavTabs({ 
  activeModule, 
  activeSubTab, 
  setActiveSubTab,
  isLeftCollapsed,
  onToggleLeft,
  isRightCollapsed,
  onToggleRight
}) {
  const navigate = useNavigate();
  const { openComplaintsCount, currentMobile, customer, agentId } = useCustomer();

  const handleNavigateModule = (targetModule) => {
    const searchParams = new URLSearchParams(window.location.search);
    
    const complaintVal = searchParams.get('Complaint') || searchParams.get('complaint');
    const salesVal = searchParams.get('Sales') || searchParams.get('sales');
    const mobileVal = complaintVal || salesVal || searchParams.get('mobile') || searchParams.get('phone') || currentMobile || customer?.mobileRaw;
    const agentVal = searchParams.get('Agentid') || searchParams.get('agentId') || searchParams.get('agentid') || searchParams.get('agent_id') || searchParams.get('agent') || agentId;
    const customerNoVal = searchParams.get('customerNumber') || searchParams.get('customerNo') || searchParams.get('id') || searchParams.get('customer_id');
    const groupVal = searchParams.get('keyloopGroup') || searchParams.get('group') || searchParams.get('brand');

    const newParams = new URLSearchParams();

    if (mobileVal) {
      const cleanMobile = String(mobileVal).replace(/[^0-9]/g, '');
      const finalMobile = cleanMobile || mobileVal;
      if (targetModule === 'Sales') {
        newParams.set('Sales', finalMobile);
      } else if (targetModule === 'Complaints Manager') {
        newParams.set('Complaint', finalMobile);
      } else {
        newParams.set('mobile', finalMobile);
      }
    }

    if (agentVal) {
      newParams.set('agentId', agentVal);
    }
    if (customerNoVal) {
      newParams.set('customerNumber', customerNoVal);
    }
    if (groupVal) {
      newParams.set('group', groupVal);
    }

    const queryString = newParams.toString();
    
    if (targetModule === 'Sales') {
      navigate(`/sales${queryString ? '?' + queryString : ''}`);
    } else if (targetModule === 'Service') {
      navigate(`/service${queryString ? '?' + queryString : ''}`);
    } else if (targetModule === 'Feedback') {
      navigate(`/feedback${queryString ? '?' + queryString : ''}`);
    } else {
      navigate(`/${queryString ? '?' + queryString : ''}`);
    }
  };

  const countVal = typeof openComplaintsCount === 'number' ? openComplaintsCount : 3;

  const complaintSubTabs = [
    { id: 'Overview', label: 'Overview' },
    { id: 'Create Complaint', label: 'Create Complaint' },
    { id: 'Open Complaints', label: 'Open Complaints', count: countVal },
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
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-2.5 mb-3 flex flex-col gap-2">
      {/* ROW 1: Module Switcher Tabs */}
      <div className="flex items-center justify-center gap-6 sm:gap-8 text-xs border-b border-gray-100 pb-2">
        <button 
          onClick={() => handleNavigateModule('Sales')}
          className={`pb-1 flex items-center gap-1.5 cursor-pointer transition-colors ${
            activeModule === 'Sales' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-gray-600 font-semibold hover:text-gray-900'
          }`}
        >
          <FaShoppingBag className="text-xs" />
          <span>Sales</span>
        </button>

        <button 
          onClick={() => handleNavigateModule('Service')}
          className={`pb-1 flex items-center gap-1.5 cursor-pointer transition-colors ${
            activeModule === 'Service' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-gray-600 font-semibold hover:text-gray-900'
          }`}
        >
          <FaCar className="text-xs" />
          <span>Service</span>
        </button>

        <button 
          onClick={() => handleNavigateModule('Feedback')}
          className={`pb-1 flex items-center gap-2 cursor-pointer transition-colors ${
            activeModule === 'Feedback' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-gray-600 font-semibold hover:text-gray-900'
          }`}
        >
          <FaStar className="text-xs" />
          <span>Feedback</span>
        </button>

        <button 
          onClick={() => handleNavigateModule('Complaints Manager')}
          className={`pb-1 flex items-center gap-1.5 cursor-pointer transition-colors ${
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
