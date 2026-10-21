import React, { useState } from 'react';
import CenterNavTabs from '../components/CenterNavTabs';
import LeftSidebar from '../components/LeftSidebar';
import ServiceBookingMainPanel from '../components/ServiceBookingMainPanel';
import ServiceOverviewView from '../components/ServiceOverviewView';
import ServiceOpenBookingsView from '../components/ServiceOpenBookingsView';
import ServiceHistoryView from '../components/ServiceHistoryView';
import ServiceWarrantyClaimsView from '../components/ServiceWarrantyClaimsView';
import ServiceFeedbackView from '../components/ServiceFeedbackView';
import ServiceActivityRightSidebar from '../components/ServiceActivityRightSidebar';
import CustomerFormView from '../components/CustomerFormView';
import { useCustomer } from '../context/CustomerContext';

export default function ServiceBookingPage() {
  const { group, customerFormMode, closeCustomerForm } = useCustomer();
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [mobileLeftSidebarOpen, setMobileLeftSidebarOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1200;
    }
    return false;
  });
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsLeftCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const search = window.location.search || '';
    const params = new URLSearchParams(search);
    if (group && !params.get('group')) {
      params.set('group', group);
      window.history.replaceState(null, '', `/service?${params.toString()}`);
    }
  }, [group]);

  const renderServiceContent = () => {
    if (customerFormMode) {
      return <CustomerFormView mode={customerFormMode} onClose={closeCustomerForm} />;
    }

    switch (activeSubTab) {
      case 'Overview':
        return <ServiceOverviewView />;
      case 'Book Service':
        return <ServiceBookingMainPanel />;
      case 'Open Bookings':
        return <ServiceOpenBookingsView />;
      case 'Service History':
        return <ServiceHistoryView />;
      case 'Warranty Claims':
        return <ServiceWarrantyClaimsView />;
      case 'Service Feedback':
      case 'Customer Survey':
        return <ServiceFeedbackView />;
      default:
        return <ServiceOverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-800 flex flex-col font-sans">
      {/* Main 3-Column Layout */}
      <div className="max-w-[1600px] w-full mx-auto p-2 sm:p-3 lg:p-5 flex-1 flex flex-row gap-2 sm:gap-3 lg:gap-4 items-start relative">
        
        {/* LEFT COLUMN: Customer Profile */}
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

        {/* Backdrop overlay for mobile sidebar when expanded */}
        {!isLeftCollapsed && (
          <div 
            onClick={() => setIsLeftCollapsed(true)} 
            className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-xs"
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
        <aside className="hidden xl:block w-auto flex-shrink-0 sticky top-5 z-10 transition-all duration-300">
          <ServiceActivityRightSidebar 
            isCollapsed={isRightCollapsed}
            onToggleCollapse={() => setIsRightCollapsed(!isRightCollapsed)}
          />
        </aside>

      </div>
    </div>
  );
}
