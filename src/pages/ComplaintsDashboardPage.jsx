import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CenterNavTabs from '../components/CenterNavTabs';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import OverviewView from '../components/OverviewView';
import CreateComplaintView from '../components/CreateComplaintView';
import OpenComplaintsView from '../components/OpenComplaintsView';
import EscalationsView from '../components/EscalationsView';
import SlaBreachesView from '../components/SlaBreachesView';
import RecoveryActionsView from '../components/RecoveryActionsView';
import AssignComplaintView from '../components/AssignComplaintView';
import ResolveComplaintView from '../components/ResolveComplaintView';
import CustomerFormView from '../components/CustomerFormView';
import { useCustomer } from '../context/CustomerContext';

export default function ComplaintsDashboardPage() {
  const navigate = useNavigate();
  const { group, customerFormMode, closeCustomerForm } = useCustomer();
  const [activeTab, setActiveTab] = useState('Overview');
  const [mobileLeftSidebarOpen, setMobileLeftSidebarOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1200;
    }
    return false;
  });
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsLeftCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const search = window.location.search || '';
    const params = new URLSearchParams(search);
    const salesVal = params.get('Sales') || params.get('sales');
    let modified = false;
    if (salesVal && !params.get('Complaint') && !params.get('complaint')) {
      params.set('Complaint', salesVal.replace(/[^0-9]/g, '') || salesVal);
      params.delete('Sales');
      params.delete('sales');
      modified = true;
    }
    if (group && !params.get('group')) {
      params.set('group', group);
      modified = true;
    }
    if (modified) {
      window.history.replaceState(null, '', `/?${params.toString()}`);
    }
  }, [group]);

  const renderMainTabContent = () => {
    if (customerFormMode) {
      return <CustomerFormView mode={customerFormMode} onClose={closeCustomerForm} />;
    }

    switch (activeTab) {
      case 'Overview':
        return <OverviewView />;
      case 'Create Complaint':
        return <CreateComplaintView />;
      case 'Open Complaints':
        return <OpenComplaintsView />;
      case 'Recovery Actions':
        return <RecoveryActionsView />;
      case 'Assign Complaint':
        return <AssignComplaintView />;
      case 'Resolve Complaint':
        return <ResolveComplaintView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-800 flex flex-col font-sans">
      {/* Main 3-Column Layout */}
      <div className="max-w-[1600px] w-full mx-auto p-2 sm:p-3 lg:p-5 flex-1 flex flex-row gap-2 sm:gap-3 lg:gap-4 items-start relative">
        
        {/* LEFT COLUMN: Customer Profile & Risk Overview */}
        <aside className={`
          flex-shrink-0 sticky top-2 sm:top-5 z-30 transition-all duration-300
          ${!isLeftCollapsed ? 'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:bg-white max-md:p-3 max-md:shadow-2xl max-md:overflow-y-auto max-md:w-[320px]' : ''}
        `}>
          {!isLeftCollapsed && (
            <div className="md:hidden flex justify-between items-center pb-2 mb-2 border-b border-gray-100">
              <span className="font-bold text-gray-900 text-xs">Customer Profile</span>
              <button 
                onClick={() => setIsLeftCollapsed(true)}
                className="text-gray-500 font-bold text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
          )}
          <LeftSidebar 
            isCollapsed={isLeftCollapsed}
            onToggleCollapse={() => setIsLeftCollapsed(!isLeftCollapsed)}
          />
        </aside>

        {/* Backdrop overlay for mobile sidebar */}
        {!isLeftCollapsed && (
          <div 
            onClick={() => setIsLeftCollapsed(true)} 
            className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-xs"
          />
        )}

        {/* CENTER COLUMN: Navigation Div & Dashboard Views */}
        <main className="flex-1 w-full min-w-0 flex flex-col transition-all duration-300">
          <CenterNavTabs 
            activeModule="Complaints Manager" 
            activeSubTab={activeTab} 
            setActiveSubTab={setActiveTab} 
            isLeftCollapsed={isLeftCollapsed}
            onToggleLeft={() => setIsLeftCollapsed(!isLeftCollapsed)}
            isRightCollapsed={isRightCollapsed}
            onToggleRight={() => setIsRightCollapsed(!isRightCollapsed)}
          />

          <div className="transition-all duration-200">
            {renderMainTabContent()}
          </div>
        </main>

        {/* RIGHT COLUMN: Complaint Activity Timeline */}
        <aside className="hidden xl:block w-auto flex-shrink-0 sticky top-5 z-10 transition-all duration-300">
          <RightSidebar 
            isCollapsed={isRightCollapsed}
            onToggleCollapse={() => setIsRightCollapsed(!isRightCollapsed)}
          />
        </aside>

      </div>
    </div>
  );
}
