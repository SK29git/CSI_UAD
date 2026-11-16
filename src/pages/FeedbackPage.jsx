import React, { useState } from 'react';
import CenterNavTabs from '../components/CenterNavTabs';
import LeftSidebar from '../components/LeftSidebar';
import FeedbackOverviewView from '../components/FeedbackOverviewView';
import CustomerFormView from '../components/CustomerFormView';
import { useCustomer } from '../context/CustomerContext';

export default function FeedbackPage() {
  const { group, customerFormMode, closeCustomerForm } = useCustomer();
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [mobileLeftSidebarOpen, setMobileLeftSidebarOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1200;
    }
    return false;
  });

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
      window.history.replaceState(null, '', `/feedback?${params.toString()}`);
    }
  }, [group]);

  return (
    <div className={`bg-[#f3f4f6] text-gray-800 flex flex-col font-sans ${activeSubTab !== 'Overview' ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen'}`}>
      {/* Main 3-Column Layout */}
      <div className={`max-w-[1600px] w-full mx-auto p-2 sm:p-3 lg:p-4 flex-1 flex flex-row gap-2 sm:gap-3 lg:gap-4 relative ${activeSubTab !== 'Overview' ? 'h-full max-h-full overflow-hidden min-h-0 items-stretch' : 'items-start'}`}>
        
        {/* LEFT COLUMN: Customer Profile */}
        <aside className={`
          flex-shrink-0 transition-all duration-300 ${activeSubTab !== 'Overview' ? 'h-full max-h-full overflow-y-auto' : 'sticky top-2 sm:top-5 z-30'}
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

        {/* CENTER COLUMN: Navigation Div & Feedback Analytics Dashboard */}
        <main className={`flex-1 w-full min-w-0 flex flex-col transition-all duration-300 ${activeSubTab !== 'Overview' ? 'h-full max-h-full overflow-hidden min-h-0' : ''}`}>
          <div className="shrink-0">
            <CenterNavTabs 
              activeModule="Feedback" 
              activeSubTab={activeSubTab} 
              setActiveSubTab={setActiveSubTab} 
              isLeftCollapsed={isLeftCollapsed}
              onToggleLeft={() => setIsLeftCollapsed(!isLeftCollapsed)}
            />
          </div>

          <div className={`transition-all duration-200 ${activeSubTab !== 'Overview' ? 'flex-1 min-h-0 h-full flex flex-col overflow-hidden' : ''}`}>
            {customerFormMode ? (
              <CustomerFormView mode={customerFormMode} onClose={closeCustomerForm} />
            ) : (
              <FeedbackOverviewView activeSubTab={activeSubTab} />
            )}
          </div>
        </main>

      </div>
    </div>
  );
}
