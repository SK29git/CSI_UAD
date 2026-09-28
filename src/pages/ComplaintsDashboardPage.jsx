import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GenesysTopBar from '../components/GenesysTopBar';
import CenterNavTabs from '../components/CenterNavTabs';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import OverviewView from '../components/OverviewView';
import CreateComplaintView from '../components/CreateComplaintView';
import OpenComplaintsView from '../components/OpenComplaintsView';
import EscalationsView from '../components/EscalationsView';
import SlaBreachesView from '../components/SlaBreachesView';
import RootCauseView from '../components/RootCauseView';
import RecoveryActionsView from '../components/RecoveryActionsView';
import ReportsView from '../components/ReportsView';

export default function ComplaintsDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [mobileLeftSidebarOpen, setMobileLeftSidebarOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  useEffect(() => {
    const search = window.location.search || '';
    if (search.toLowerCase().includes('salesnewlead') || search.toLowerCase().includes('sales=')) {
      navigate(`/sales${search}`, { replace: true });
    }
  }, [navigate]);

  const renderMainTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return <OverviewView />;
      case 'Create Complaint':
        return <CreateComplaintView />;
      case 'Open Complaints':
        return <OpenComplaintsView />;
      case 'Escalations':
        return <EscalationsView />;
      case 'SLA Breaches':
        return <SlaBreachesView />;
      case 'Root Cause':
        return <RootCauseView />;
      case 'Recovery Actions':
        return <RecoveryActionsView />;
      case 'Reports':
        return <ReportsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-800 flex flex-col font-sans">
      {/* Global Telephony Header */}
      <GenesysTopBar />

      {/* Main 3-Column Layout */}
      <div className="max-w-[1600px] w-full mx-auto p-3 sm:p-4 lg:p-5 flex-1 flex flex-col lg:flex-row gap-4 items-start relative">
        
        {/* LEFT COLUMN: Customer Profile & Risk Overview */}
        <aside className={`
          fixed lg:sticky lg:top-[70px] inset-y-0 left-0 z-40 lg:z-10 bg-white lg:bg-transparent p-4 lg:p-0 
          transform ${mobileLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none overflow-y-auto max-h-screen lg:max-h-none
        `}>
          <div className="flex justify-between items-center lg:hidden pb-3 mb-2 border-b border-gray-100">
            <span className="font-bold text-gray-900">Customer Profile</span>
            <button 
              onClick={() => setMobileLeftSidebarOpen(false)}
              className="text-gray-500 font-bold text-sm px-2 py-1 bg-gray-100 rounded"
            >
              ✕ Close
            </button>
          </div>
          <LeftSidebar 
            isCollapsed={isLeftCollapsed}
            onToggleCollapse={() => setIsLeftCollapsed(!isLeftCollapsed)}
          />
        </aside>

        {/* Backdrop overlay for mobile sidebar */}
        {mobileLeftSidebarOpen && (
          <div 
            onClick={() => setMobileLeftSidebarOpen(false)} 
            className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-xs"
          />
        )}

        {/* CENTER COLUMN: Navigation Div & Dashboard Views */}
        <main className="flex-1 w-full min-w-0 flex flex-col z-0 transition-all duration-300">
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
        <aside className="w-full lg:w-auto flex-shrink-0 lg:sticky lg:top-[70px] z-10 transition-all duration-300">
          <RightSidebar 
            isCollapsed={isRightCollapsed}
            onToggleCollapse={() => setIsRightCollapsed(!isRightCollapsed)}
          />
        </aside>

      </div>
    </div>
  );
}
