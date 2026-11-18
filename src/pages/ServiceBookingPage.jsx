import React, { useState } from 'react';
import CenterNavTabs from '../components/CenterNavTabs';
import LeftSidebar from '../components/LeftSidebar';
import ServiceBookingMainPanel from '../components/ServiceBookingMainPanel';
import ServiceOverviewView from '../components/ServiceOverviewView';
import CreateServiceView from '../components/CreateServiceView';
import ServiceOpenBookingsView from '../components/ServiceOpenBookingsView';
import ServiceHistoryView from '../components/ServiceHistoryView';
import ServiceWarrantyClaimsView from '../components/ServiceWarrantyClaimsView';
import ServiceFeedbackView from '../components/ServiceFeedbackView';
import SalesAfterSalesView from '../components/SalesAfterSalesView';
import SalesNewLeadView from '../components/SalesNewLeadView';
// import ServiceActivityRightSidebar from '../components/ServiceActivityRightSidebar';
import CustomerFormView from '../components/CustomerFormView';
import { useCustomer } from '../context/CustomerContext';
import { FaCalendarCheck, FaUserPlus, FaCheck } from 'react-icons/fa';

export default function ServiceBookingPage() {
  const { group, customerFormMode, closeCustomerForm, showToast } = useCustomer();
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [bookServiceStage, setBookServiceStage] = useState('booking'); // 'booking' | 'enquiry'
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);

  const handleBookingConfirmed = (data, payload) => {
    setBookingConfirmed(true);
    setConfirmedBookingData({ data, payload });
    // Directly route to New Enquiry stage upon API success
    setBookServiceStage('enquiry');
    if (showToast) {
      showToast({
        type: 'success',
        title: 'Booking Confirmed',
        message: 'Workshop booking confirmed successfully. Routed to New Enquiry.',
      });
    }
  };
  const [mobileLeftSidebarOpen, setMobileLeftSidebarOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1200;
    }
    return false;
  });
  // const [isRightCollapsed, setIsRightCollapsed] = useState(false);

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
    if (search.toLowerCase().includes('salesnewlead') || search.toLowerCase().includes('newenquiry') || search.toLowerCase().includes('servicenewlead') || search.toLowerCase().includes('bookaservice')) {
      setActiveSubTab('Book  service');
    }
  }, [group]);

  const renderServiceContent = () => {
    if (customerFormMode) {
      return <CustomerFormView mode={customerFormMode} onClose={closeCustomerForm} />;
    }

    switch (activeSubTab) {
      case 'Overview':
        return <ServiceOverviewView />;
      case 'Book  service':
      case 'New Enquiry':
      case 'New Lead':
      case 'Book Service':
        return (
          <div className="flex flex-col gap-4 w-full pb-12">
            {/* Chevron Stage Stepper (Pastel Colors) */}
            <div className="w-full flex items-stretch rounded-2xl overflow-hidden shadow-2xs border border-slate-200/90 bg-slate-100/70 p-1 select-none text-xs">
              {/* Segment 1: Service Booking */}
              <button
                type="button"
                onClick={() => setBookServiceStage('booking')}
                className={`relative flex-1 py-3 px-5 sm:px-8 text-left transition-all cursor-pointer flex items-center justify-between group rounded-xl ${
                  bookServiceStage === 'booking'
                    ? 'bg-gradient-to-r from-sky-100 via-blue-50 to-indigo-100/80 text-blue-950 z-10 shadow-2xs'
                    : bookingConfirmed
                      ? 'bg-emerald-50/90 hover:bg-emerald-100/70 text-emerald-950'
                      : 'bg-white/80 hover:bg-white text-slate-600'
                }`}
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)',
                }}
              >
                <div className="flex items-center gap-3 pr-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    bookServiceStage === 'booking'
                      ? 'bg-white text-blue-600 shadow-2xs border border-blue-200/80'
                      : bookingConfirmed
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300/80 shadow-2xs'
                        : 'bg-slate-100 text-slate-500 border border-slate-200/80 shadow-2xs'
                  }`}>
                    {bookingConfirmed ? <FaCheck className="text-emerald-700 text-xs" /> : <FaCalendarCheck className="text-xs" />}
                  </div>
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm tracking-wide leading-tight flex items-center gap-1.5">
                      <span className={bookServiceStage === 'booking' ? 'text-blue-950' : bookingConfirmed ? 'text-emerald-950' : 'text-slate-700'}>
                        Service Booking
                      </span>
                      {bookingConfirmed && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Confirmed ✓
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] font-medium leading-tight mt-0.5 ${
                      bookServiceStage === 'booking'
                        ? 'text-blue-700/90'
                        : bookingConfirmed
                          ? 'text-emerald-700/90'
                          : 'text-slate-400'
                    }`}>
                      Workshop Appointment Scheduling
                    </p>
                  </div>
                </div>
              </button>

              {/* Segment 2: New Enquiry */}
              <button
                type="button"
                onClick={() => setBookServiceStage('enquiry')}
                className={`relative flex-1 py-3 pl-8 sm:pl-10 pr-5 sm:pr-8 text-left transition-all cursor-pointer flex items-center justify-between -ml-3.5 group rounded-xl ${
                  bookServiceStage === 'enquiry'
                    ? 'bg-gradient-to-r from-teal-100 via-emerald-50 to-cyan-50/90 text-teal-950 z-10 shadow-2xs'
                    : 'bg-white/80 hover:bg-white text-slate-600'
                }`}
                style={{
                  clipPath: 'polygon(16px 0, 100% 0, 100% 100%, 16px 100%, 0 50%)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    bookServiceStage === 'enquiry'
                      ? 'bg-white text-teal-700 shadow-2xs border border-teal-200/80'
                      : 'bg-slate-100 text-slate-500 border border-slate-200/80 shadow-2xs'
                  }`}>
                    <FaUserPlus className="text-xs" />
                  </div>
                  <div>
                    <div className={`font-extrabold text-xs sm:text-sm tracking-wide leading-tight ${
                      bookServiceStage === 'enquiry' ? 'text-teal-950' : 'text-slate-700'
                    }`}>
                      New Enquiry
                    </div>
                    <p className={`text-[11px] font-medium leading-tight mt-0.5 ${
                      bookServiceStage === 'enquiry' ? 'text-teal-700/90' : 'text-slate-400'
                    }`}>
                      Customer Service Lead Intake
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Active Stage Content View */}
            {bookServiceStage === 'booking' ? (
              <ServiceBookingMainPanel onBookingSuccess={handleBookingConfirmed} />
            ) : (
              <SalesNewLeadView
                mode="service"
                onNavigateToEnquiries={() => setActiveSubTab('Overview')}
              />
            )}
          </div>
        );
      case 'Zofeur':
        return <CreateServiceView mode="zofeur" />;
      case 'Other Request':
      case 'Create Service':
        return <CreateServiceView mode="other_request" />;
      case 'Breakdown':
        return <CreateServiceView mode="breakdown" />;
      case 'Open Bookings':
        return <ServiceOpenBookingsView />;
      case 'Service History':
        return <ServiceHistoryView />;
      case 'Retention':
        return <SalesAfterSalesView title="Retention & Cohort" mode="service" initialTab="RetentionAlerts" retentionOnly={true} />;
      case 'Service Follow-up':
      case 'Service Follow Up':
      case 'Service Follow':
      case 'After-Sales':
        return <SalesAfterSalesView title="Service Follow Up" mode="service" />;
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
          ${!isLeftCollapsed ? 'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-[100] max-md:bg-white max-md:p-3 max-md:shadow-2xl max-md:overflow-y-auto max-md:w-[320px]' : ''}
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
            className="md:hidden fixed inset-0 bg-black/40 z-[90] backdrop-blur-xs"
          />
        )}

        {/* CENTER COLUMN: Navigation Div & Service Panel */}
        <main className="flex-1 w-full min-w-0 flex flex-col transition-all duration-300">
          <CenterNavTabs 
            activeModule="Service" 
            activeSubTab={activeSubTab} 
            setActiveSubTab={setActiveSubTab} 
            isLeftCollapsed={isLeftCollapsed}
            onToggleLeft={() => setIsLeftCollapsed(!isLeftCollapsed)}
            /* isRightCollapsed={isRightCollapsed} */
            /* onToggleRight={() => setIsRightCollapsed(!isRightCollapsed)} */
          />

          <div className="transition-all duration-200">
            {renderServiceContent()}
          </div>
        </main>

        {/* RIGHT COLUMN: Activity Log Timeline (Commented out - nothing shown in right side) */}
        {/*
        <aside className="hidden xl:block w-auto flex-shrink-0 sticky top-5 z-10 transition-all duration-300">
          <ServiceActivityRightSidebar 
            isCollapsed={isRightCollapsed}
            onToggleCollapse={() => setIsRightCollapsed(!isRightCollapsed)}
          />
        </aside>
        */}

      </div>
    </div>
  );
}
