import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CenterNavTabs from '../components/CenterNavTabs';
import LeftSidebar from '../components/LeftSidebar';
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
import { FaPlusCircle, FaCheck, FaExternalLinkAlt, FaRedo } from 'react-icons/fa';

export default function ComplaintsDashboardPage() {
  const navigate = useNavigate();
  const { group, customerFormMode, closeCustomerForm } = useCustomer();
  const [activeTab, setActiveTab] = useState('Overview');
  const [complaintStage, setComplaintStage] = useState('complaint'); // 'complaint' | 'cxpulse'
  const [complaintCreated, setComplaintCreated] = useState(false);
  const [lastComplaintResult, setLastComplaintResult] = useState(null);
  const [iframeKey, setIframeKey] = useState(0);

  const handleComplaintSuccess = (resultData) => {
    setComplaintCreated(true);
    setLastComplaintResult(resultData);
    // Directly route to CXPulse Portal stage upon API success
    setComplaintStage('cxpulse');
  };
  const [mobileLeftSidebarOpen, setMobileLeftSidebarOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1200;
    }
    return false;
  });

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
      window.history.replaceState(null, '', `/complaints?${params.toString()}`);
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
        return (
          <div className="flex flex-col gap-4 w-full pb-12">
            {/* Chevron Stage Stepper (Pastel Colors) */}
            <div className="w-full flex items-stretch rounded-2xl overflow-hidden shadow-2xs border border-slate-200/90 bg-slate-100/70 p-1 select-none text-xs">
              {/* Segment 1: Create Complaint */}
              <button
                type="button"
                onClick={() => setComplaintStage('complaint')}
                className={`relative flex-1 py-3 px-5 sm:px-8 text-left transition-all cursor-pointer flex items-center justify-between group rounded-xl ${
                  complaintStage === 'complaint'
                    ? 'bg-gradient-to-r from-sky-100 via-blue-50 to-indigo-100/80 text-blue-950 z-10 shadow-2xs'
                    : complaintCreated
                      ? 'bg-emerald-50/90 hover:bg-emerald-100/70 text-emerald-950'
                      : 'bg-white/80 hover:bg-white text-slate-600'
                }`}
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)',
                }}
              >
                <div className="flex items-center gap-3 pr-4">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      complaintStage === 'complaint'
                        ? 'bg-white text-blue-600 shadow-2xs border border-blue-200/80'
                        : complaintCreated
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300/80 shadow-2xs'
                          : 'bg-slate-100 text-slate-500 border border-slate-200/80 shadow-2xs'
                    }`}
                  >
                    {complaintCreated ? <FaCheck className="text-emerald-700 text-xs" /> : <FaPlusCircle className="text-xs" />}
                  </div>
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm tracking-wide leading-tight flex items-center gap-1.5">
                      <span
                        className={
                          complaintStage === 'complaint'
                            ? 'text-blue-950'
                            : complaintCreated
                              ? 'text-emerald-950'
                              : 'text-slate-700'
                        }
                      >
                        Create Complaint
                      </span>
                      {complaintCreated && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Logged ✓
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[11px] font-medium leading-tight mt-0.5 ${
                        complaintStage === 'complaint'
                          ? 'text-blue-700/90'
                          : complaintCreated
                            ? 'text-emerald-700/90'
                            : 'text-slate-400'
                      }`}
                    >
                      Customer Grievance & Ticket Logging
                    </p>
                  </div>
                </div>
              </button>

              {/* Segment 2: CXPulse Portal */}
              <button
                type="button"
                onClick={() => setComplaintStage('cxpulse')}
                className={`relative flex-1 py-3 pl-8 sm:pl-10 pr-5 sm:pr-8 text-left transition-all cursor-pointer flex items-center justify-between -ml-3.5 group rounded-xl ${
                  complaintStage === 'cxpulse'
                    ? 'bg-gradient-to-r from-teal-100 via-emerald-50 to-cyan-50/90 text-teal-950 z-10 shadow-2xs'
                    : 'bg-white/80 hover:bg-white text-slate-600'
                }`}
                style={{
                  clipPath: 'polygon(16px 0, 100% 0, 100% 100%, 16px 100%, 0 50%)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      complaintStage === 'cxpulse'
                        ? 'bg-white text-teal-700 shadow-2xs border border-teal-200/80'
                        : 'bg-slate-100 text-slate-500 border border-slate-200/80 shadow-2xs'
                    }`}
                  >
                    <FaExternalLinkAlt className="text-xs" />
                  </div>
                  <div>
                    <div
                      className={`font-extrabold text-xs sm:text-sm tracking-wide leading-tight ${
                        complaintStage === 'cxpulse' ? 'text-teal-950' : 'text-slate-700'
                      }`}
                    >
                      CXPulse Portal
                    </div>
                    <p
                      className={`text-[11px] font-medium leading-tight mt-0.5 ${
                        complaintStage === 'cxpulse' ? 'text-teal-700/90' : 'text-slate-400'
                      }`}
                    >
                      AGMC CXPulse Ticket Management
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Active Stage Content View */}
            {complaintStage === 'complaint' ? (
              <CreateComplaintView onComplaintSuccess={handleComplaintSuccess} />
            ) : (
              <div className="flex flex-col gap-3 w-full animate-fadeIn">
                {/* CXPulse Header Toolbar */}
                <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 shadow-2xs font-bold text-xs">
                      CX
                    </div>
                    <div>
                      <div className="flex items-center gap-2 font-bold text-slate-800 text-xs sm:text-sm">
                        <span>AGMC CXPulse Portal</span>
                        {lastComplaintResult?.returnedRef && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Ref: {lastComplaintResult.returnedRef}
                          </span>
                        )}
                        {lastComplaintResult?.cxTicketId && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            Ticket: {lastComplaintResult.cxTicketId}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        https://cxpulse.agmcgroup.ae/login
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIframeKey((prev) => prev + 1)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Reload Portal"
                    >
                      <FaRedo className="text-[11px] text-slate-500" />
                      <span>Refresh</span>
                    </button>
                    <a
                      href="https://cxpulse.agmcgroup.ae/login"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-lg shadow-2xs shadow-teal-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <FaExternalLinkAlt className="text-[11px]" />
                      <span>Open in New Tab</span>
                    </a>
                  </div>
                </div>

                {/* Embedded Iframe Container */}
                <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden h-[780px]">
                  <iframe
                    key={iframeKey}
                    src="https://cxpulse.agmcgroup.ae/login"
                    title="AGMC CXPulse Portal"
                    className="w-full h-full border-0"
                    allow="clipboard-write; fullscreen"
                  />
                </div>
              </div>
            )}
          </div>
        );
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
          />

          <div className="transition-all duration-200">
            {renderMainTabContent()}
          </div>
        </main>

      </div>
    </div>
  );
}
