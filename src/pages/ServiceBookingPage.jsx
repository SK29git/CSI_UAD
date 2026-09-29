import React, { useState } from 'react';
import CenterNavTabs from '../components/CenterNavTabs';
import ServiceCustomerVehicleCard from '../components/ServiceCustomerVehicleCard';
import ServiceBookingMainPanel from '../components/ServiceBookingMainPanel';
import ServiceOverviewView from '../components/ServiceOverviewView';
import ServiceActivityRightSidebar from '../components/ServiceActivityRightSidebar';

export default function ServiceBookingPage() {
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [mobileLeftSidebarOpen, setMobileLeftSidebarOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  const renderServiceContent = () => {
    switch (activeSubTab) {
      case 'Overview':
        return <ServiceOverviewView />;
      case 'Book Service':
        return <ServiceBookingMainPanel />;
      default:
        return <ServiceOverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-800 flex flex-col font-sans">
      {/* Main 3-Column Layout */}
      <div className="max-w-[1600px] w-full mx-auto p-3 sm:p-4 lg:p-5 flex-1 flex flex-col lg:flex-row gap-4 items-start relative">
        
        {/* LEFT COLUMN: Customer 360 & Vehicle Summary */}
        <aside className={`
          fixed lg:sticky lg:top-5 inset-y-0 left-0 z-40 lg:z-10 bg-white lg:bg-transparent p-4 lg:p-0 
          transform ${mobileLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none overflow-y-auto max-h-screen lg:max-h-none
        `}>
          <div className="flex justify-between items-center lg:hidden pb-3 mb-2 border-b border-gray-100">
            <span className="font-bold text-gray-900">Customer & Vehicle Details</span>
            <button 
              onClick={() => setMobileLeftSidebarOpen(false)}
              className="text-gray-500 font-bold text-sm px-2 py-1 bg-gray-100 rounded"
            >
              ✕ Close
            </button>
          </div>
          <ServiceCustomerVehicleCard 
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

        {/* CENTER COLUMN: Navigation Div & Service Panel */}
        <main className="flex-1 w-full min-w-0 flex flex-col z-0 transition-all duration-300">
          <CenterNavTabs 
            activeModule="Service" 
            activeSubTab={activeSubTab} 
            setActiveSubTab={setActiveSubTab} 
            isLeftCollapsed={isLeftCollapsed}
            onToggleLeft={() => setIsLeftCollapsed(!isLeftCollapsed)}
            isRightCollapsed={isRightCollapsed}
            onToggleRight={() => setIsRightCollapsed(!isRightCollapsed)}
          />

          <div className="transition-all duration-200">
            {renderServiceContent()}
          </div>
        </main>

        {/* RIGHT COLUMN: Activity Log Timeline */}
        <aside className="w-full lg:w-auto flex-shrink-0 lg:sticky lg:top-5 z-10 transition-all duration-300">
          <ServiceActivityRightSidebar 
            isCollapsed={isRightCollapsed}
            onToggleCollapse={() => setIsRightCollapsed(!isRightCollapsed)}
          />
        </aside>

      </div>
    </div>
  );
}
