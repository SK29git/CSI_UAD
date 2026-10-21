import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { 
  FaThLarge,
  FaCar, 
  FaStar, 
  FaShieldAlt,
  FaHome,
  FaUserPlus,
  FaClipboardList,
  FaCarSide,
  FaTruck,
  FaUsers,
  FaHistory,
  FaBell,
  FaChevronDown,
  FaExclamationTriangle,
  FaFolderOpen,
  FaHandsHelping,
  FaUserCheck,
  FaCheckCircle,
  FaWrench,
  FaHeart,
  FaChartPie
} from 'react-icons/fa';
import { getFullMobileNumber } from '../utils/phoneUtils';

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
  const { openComplaintsCount, currentMobile, customer, agentId, group: contextGroup } = useCustomer();

  const handleNavigateModule = (targetModule) => {
    const searchParams = new URLSearchParams(window.location.search);
    
    const validMobile = getFullMobileNumber(customer, currentMobile);
    const agentVal = searchParams.get('Agentid') || searchParams.get('agentId') || searchParams.get('agentid') || searchParams.get('agent_id') || searchParams.get('agent') || agentId;
    const customerNoVal = searchParams.get('customerNumber') || searchParams.get('customerNo') || searchParams.get('id') || searchParams.get('customer_id') || customer?.customerNumber || customer?.id;
    const groupVal = searchParams.get('group') || searchParams.get('keyloopGroup') || searchParams.get('brand') || contextGroup || customer?.keyloopGroup || '';

    const newParams = new URLSearchParams();

    if (validMobile) {
      if (targetModule === 'Sales') {
        newParams.set('Sales', validMobile);
      } else if (targetModule === 'Complaints Manager') {
        newParams.set('Complaint', validMobile);
      } else {
        newParams.set('mobile', validMobile);
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
    } else if (targetModule === 'Feedback' || targetModule === 'Survey') {
      navigate(`/feedback${queryString ? '?' + queryString : ''}`);
    } else {
      navigate(`/${queryString ? '?' + queryString : ''}`);
    }
  };

  const countVal = typeof openComplaintsCount === 'number' ? openComplaintsCount : 3;

  const getSubTabIcon = (id) => {
    switch (id) {
      case 'Overview': return <FaHome className="text-xs" />;
      case 'New Lead': return <FaUserPlus className="text-xs" />;
      case 'Enquiries': return <FaClipboardList className="text-xs" />;
      case 'Test Drive': return <FaCarSide className="text-xs" />;
      case 'Vehicle Orders': return <FaTruck className="text-xs" />;
      case 'Customer Segments': return <FaUsers className="text-xs" />;
      case 'After-Sales & Follow Up': return <FaHistory className="text-xs" />;
      case 'Create Complaint': return <FaExclamationTriangle className="text-xs" />;
      case 'Open Complaints': return <FaFolderOpen className="text-xs" />;
      case 'Recovery Actions': return <FaHandsHelping className="text-xs" />;
      case 'Assign Complaint': return <FaUserCheck className="text-xs" />;
      case 'Resolve Complaint': return <FaCheckCircle className="text-xs" />;
      case 'Book Service': return <FaWrench className="text-xs" />;
      case 'Open Bookings': return <FaClipboardList className="text-xs" />;
      case 'Service History': return <FaHistory className="text-xs" />;
      case 'Warranty Claims': return <FaShieldAlt className="text-xs" />;
      case 'Service Feedback':
      case 'Customer Survey':
      case 'Service Survey': return <FaStar className="text-xs" />;
      case 'CSI': return <FaStar className="text-xs" />;
      case 'NPS': return <FaHeart className="text-xs" />;
      case 'Lost Sales Analysis': return <FaChartPie className="text-xs" />;
      default: return null;
    }
  };

  const complaintSubTabs = [
    { id: 'Overview', label: 'Overview' },
    { id: 'Create Complaint', label: 'Create Complaint' },
    { id: 'Open Complaints', label: 'Open Complaints', count: countVal },
    { id: 'Recovery Actions', label: 'Recovery Actions' },
    { id: 'Assign Complaint', label: 'Assign Complaint' },
    { id: 'Resolve Complaint', label: 'Resolve Complaint' },
  ];

  const serviceSubTabs = [
    { id: 'Overview', label: 'Overview' },
    { id: 'Book Service', label: 'Book Service' },
    { id: 'Open Bookings', label: 'Open Bookings' },
    { id: 'Service History', label: 'Service History' },
    { id: 'Warranty Claims', label: 'Warranty Claims' },
    { id: 'Service Feedback', label: 'Customer Survey' },
  ];

  const feedbackSubTabs = [
    { id: 'Overview', label: 'Overview' },
    { id: 'CSI', label: 'CSI' },
    { id: 'NPS', label: 'NPS' },
    { id: 'Lost Sales Analysis', label: 'Lost Sales Analysis' },
    { id: 'Open Bookings', label: 'Open Bookings' },
  ];

  const salesSubTabs = [
    { id: 'Overview', label: 'Overview' },
    { id: 'New Lead', label: 'New Lead' },
    { id: 'Enquiries', label: 'Enquiries' },
    { id: 'Test Drive', label: 'Test Drive' },
    { id: 'Vehicle Orders', label: 'Vehicle Orders' },
    { id: 'Customer Segments', label: 'Customer Segments' },
    { id: 'After-Sales & Follow Up', label: 'After-Sales & Follow Up' },
  ];

  let currentSubTabs = complaintSubTabs;
  if (activeModule === 'Service') currentSubTabs = serviceSubTabs;
  if (activeModule === 'Feedback' || activeModule === 'Survey') currentSubTabs = feedbackSubTabs;
  if (activeModule === 'Sales') currentSubTabs = salesSubTabs;

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 px-3.5 py-2 sm:px-5 mb-2.5 flex flex-col gap-1.5 transition-all">
      {/* ROW 1: Module Switcher Tabs */}
      <div className="flex items-center justify-center gap-6 sm:gap-10 text-xs border-b border-slate-100 pb-1.5 w-full">
        <button 
          onClick={() => handleNavigateModule('Sales')}
          className={`pb-1 flex items-center gap-2 cursor-pointer transition-all ${
            activeModule === 'Sales' 
              ? 'text-blue-600 font-extrabold border-b-2 border-blue-600' 
              : 'text-gray-600 font-semibold hover:text-gray-900'
          }`}
        >
          <FaThLarge className={`text-xs ${activeModule === 'Sales' ? 'text-blue-600' : 'text-gray-400'}`} />
          <span>Sales</span>
        </button>

        <button 
          onClick={() => handleNavigateModule('Service')}
          className={`pb-1 flex items-center gap-2 cursor-pointer transition-all ${
            activeModule === 'Service' 
              ? 'text-blue-600 font-extrabold border-b-2 border-blue-600' 
              : 'text-gray-600 font-semibold hover:text-gray-900'
          }`}
        >
          <FaCar className={`text-xs ${activeModule === 'Service' ? 'text-blue-600' : 'text-gray-400'}`} />
          <span>Service</span>
        </button>

        <button 
          onClick={() => handleNavigateModule('Feedback')}
          className={`pb-1 flex items-center gap-2 cursor-pointer transition-all ${
            activeModule === 'Feedback' || activeModule === 'Survey' 
              ? 'text-blue-600 font-extrabold border-b-2 border-blue-600' 
              : 'text-gray-600 font-semibold hover:text-gray-900'
          }`}
        >
          <FaStar className={`text-xs ${activeModule === 'Feedback' || activeModule === 'Survey' ? 'text-blue-600' : 'text-gray-400'}`} />
          <span>Survey</span>
        </button>

        <button 
          onClick={() => handleNavigateModule('Complaints Manager')}
          className={`pb-1 flex items-center gap-2 cursor-pointer transition-all ${
            activeModule === 'Complaints Manager' 
              ? 'text-blue-600 font-extrabold border-b-2 border-blue-600' 
              : 'text-gray-600 font-semibold hover:text-gray-900'
          }`}
        >
          <FaShieldAlt className={`text-xs ${activeModule === 'Complaints Manager' ? 'text-blue-600' : 'text-gray-400'}`} />
          <span>Complaints Manager</span>
        </button>
      </div>

      {/* ROW 2: Sub-Navigation Workflow Bar with Visual Pill and Icons */}
      <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto text-xs font-medium no-scrollbar py-0.5">
        {currentSubTabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          const tabIcon = getSubTabIcon(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab && setActiveSubTab(tab.id)}
              className={`px-2.5 py-1 rounded-lg relative flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all text-xs ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 border border-blue-200 font-bold shadow-2xs' 
                  : 'text-gray-600 hover:text-gray-900 font-semibold hover:bg-gray-50/80'
              }`}
            >
              {tabIcon && <span className={isActive ? 'text-blue-600' : 'text-gray-400'}>{tabIcon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-blue-600 text-white shadow-2xs' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
              {isActive && (
                <span className="absolute -bottom-1 left-2 right-2 h-[2px] bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
