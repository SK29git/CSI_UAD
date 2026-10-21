import React, { useState, useEffect } from 'react';
import CenterNavTabs from '../components/CenterNavTabs';
import LeftSidebar from '../components/LeftSidebar';
import SalesOverviewView from '../components/SalesOverviewView';
import SalesNewLeadView from '../components/SalesNewLeadView';
import SalesTestDriveView from '../components/SalesTestDriveView';
import SalesVehicleOrdersView from '../components/SalesVehicleOrdersView';
import SalesSegmentsView from '../components/SalesSegmentsView';
import SalesAfterSalesView from '../components/SalesAfterSalesView';
import SalesEnquiriesView from '../components/SalesEnquiriesView';
import RightSidebar from '../components/RightSidebar';
import CustomerFormView from '../components/CustomerFormView';
import { useCustomer, isExistingCustomer } from '../context/CustomerContext';

export default function SalesPage() {
  const { customer, group, customerFormMode, closeCustomerForm } = useCustomer();
  const hasCustomer = isExistingCustomer(customer);
  const [activeSubTab, setActiveSubTab] = useState(() => (hasCustomer ? 'New Enquiry' : 'New Lead'));
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
    const complaintVal = params.get('Complaint') || params.get('complaint');
    let modified = false;
    if (complaintVal && !params.get('Sales') && !params.get('sales')) {
      params.set('Sales', complaintVal.replace(/[^0-9]/g, '') || complaintVal);
      params.delete('Complaint');
      params.delete('complaint');
      modified = true;
    }
    if (group && !params.get('group')) {
      params.set('group', group);
      modified = true;
    }
    if (modified) {
      window.history.replaceState(null, '', `/sales?${params.toString()}`);
    }
    if (search.toLowerCase().includes('salesnewlead') || search.toLowerCase().includes('newenquiry')) {
      setActiveSubTab(hasCustomer ? 'New Enquiry' : 'New Lead');
    }
  }, [group, hasCustomer]);

  useEffect(() => {
    if (activeSubTab === 'New Enquiry' || activeSubTab === 'New Lead') {
      setActiveSubTab(hasCustomer ? 'New Enquiry' : 'New Lead');
    }
  }, [hasCustomer]);

  const renderSalesContent = () => {
    if (customerFormMode) {
      return <CustomerFormView mode={customerFormMode} onClose={closeCustomerForm} />;
    }

    switch (activeSubTab) {
      case 'Overview':
        return <SalesOverviewView />;
      case 'New Enquiry':
      case 'New Lead':
        return <SalesNewLeadView />;
      case 'Enquiries':
        return <SalesEnquiriesView />;
      case 'Test Drive':
        return <SalesTestDriveView />;
      case 'Vehicle Orders':
        return <SalesVehicleOrdersView />;
      case 'Customer Segments':
        return <SalesSegmentsView />;
      case 'After-Sales & Follow Up':
        return <SalesAfterSalesView />;
      default:
        return <SalesNewLeadView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-800 flex flex-col font-sans">
      {/* Main 3-Column Layout */}
      <div className="max-w-[1600px] w-full mx-auto p-2 sm:p-2.5 lg:p-3 flex-1 flex flex-row gap-2 sm:gap-2.5 lg:gap-3 items-start relative">
        
        {/* LEFT COLUMN: Customer Profile & Risk Overview & Notes */}
        <aside className={`
          flex-shrink-0 sticky top-2 sm:top-3 z-30 transition-all duration-300
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

        {/* CENTER COLUMN: Navigation Div & Sales Agent Dashboard */}
        <main className="flex-1 w-full min-w-0 flex flex-col z-0 transition-all duration-300">
          <CenterNavTabs 
            activeModule="Sales" 
            activeSubTab={activeSubTab} 
            setActiveSubTab={setActiveSubTab} 
            isLeftCollapsed={isLeftCollapsed}
            onToggleLeft={() => setIsLeftCollapsed(!isLeftCollapsed)}
            isRightCollapsed={isRightCollapsed}
            onToggleRight={() => setIsRightCollapsed(!isRightCollapsed)}
          />

          <div className="transition-all duration-200">
            {renderSalesContent()}
          </div>
        </main>

        {/* RIGHT COLUMN: Activity Log Timeline */}
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
