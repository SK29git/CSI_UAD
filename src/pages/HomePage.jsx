import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CenterNavTabs from '../components/CenterNavTabs';
import LeftSidebar from '../components/LeftSidebar';
import CustomerFormView from '../components/CustomerFormView';
import { useCustomer } from '../context/CustomerContext';
import {
  FaSearch,
  FaUserPlus,
  FaSpinner,
  FaTimes,
  FaUserTie
} from 'react-icons/fa';

export default function HomePage() {
  const navigate = useNavigate();
  const {
    currentGroup,
    customerFormMode,
    openCustomerForm,
    closeCustomerForm,
    searchCustomer
  } = useCustomer();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState(null);

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

  // Parse Agent Name dynamically from URL query parameters (if provided)
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const urlAgentName = searchParams.get('agentName') || 
                       searchParams.get('agent_name') || 
                       searchParams.get('AgentName') || 
                       searchParams.get('name') || 
                       searchParams.get('userName') || 
                       searchParams.get('user') || 
                       '';

  // If URL has specific module parameters (e.g. Complaint=050... or Sales=050...), route to that module
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const complaintVal = params.get('Complaint') || params.get('complaint');
    const salesVal = params.get('Sales') || params.get('sales');
    const serviceVal = params.get('service') || params.get('Service');
    const feedbackVal = params.get('feedback') || params.get('Feedback');

    if (complaintVal) {
      navigate(`/complaints?${params.toString()}`);
    } else if (salesVal) {
      navigate(`/sales?${params.toString()}`);
    } else if (serviceVal) {
      navigate(`/service?${params.toString()}`);
    } else if (feedbackVal) {
      navigate(`/feedback?${params.toString()}`);
    }
  }, [navigate]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    setSearchFeedback(null);

    try {
      const res = await searchCustomer(q, currentGroup || '', 'sales_');
      if (res && res.ok) {
        const typeLabel = res.isProspect ? 'Prospect' : 'Customer';
        const idLabel = res.customer?.prospectNumber 
          ? `Prospect #${res.customer.prospectNumber}` 
          : `ID #${res.customer?.customerNumber || q}`;
        setSearchFeedback({
          type: 'success',
          message: `Found ${typeLabel}: ${res.customer?.fullName || res.customer?.firstName || 'Account'} (${idLabel})`
        });
      } else {
        setSearchFeedback({
          type: 'error',
          message: res?.message || `No customer or prospect found for "${q}".`
        });
      }
    } catch (err) {
      setSearchFeedback({
        type: 'error',
        message: err.message || 'Search failed. Please try again.'
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-gray-800 flex flex-col font-sans relative overflow-x-hidden selection:bg-blue-500 selection:text-white">
      {/* Background Ambient Atmosphere Glow Orbs for Glassmorphism */}
      <div className="pointer-events-none fixed -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/10 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed top-1/3 -right-32 w-[32rem] h-[32rem] bg-gradient-to-bl from-indigo-400/15 via-sky-300/10 to-transparent rounded-full blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 left-1/4 w-[28rem] h-[28rem] bg-gradient-to-tr from-cyan-300/15 via-blue-500/10 to-transparent rounded-full blur-3xl" />

      {/* Main Container */}
      <div className="max-w-[1600px] w-full mx-auto p-2 sm:p-3 lg:p-5 flex-1 flex flex-row gap-2 sm:gap-3 lg:gap-4 items-start relative z-10">
        
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

        {/* Backdrop for Mobile Sidebar */}
        {!isLeftCollapsed && (
          <div 
            onClick={() => setIsLeftCollapsed(true)} 
            className="md:hidden fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-xs"
          />
        )}

        {/* CENTER COLUMN: Navigation & Glassmorphic Content */}
        <main className="flex-1 w-full min-w-0 flex flex-col transition-all duration-300">
          <CenterNavTabs 
            activeModule="Home" 
            isLeftCollapsed={isLeftCollapsed}
            onToggleLeft={() => setIsLeftCollapsed(!isLeftCollapsed)}
          />

          <div className="transition-all duration-200 flex-1 flex flex-col space-y-4">
            {/* If Customer Form is open, render Form View */}
            {customerFormMode ? (
              <CustomerFormView mode={customerFormMode} onClose={closeCustomerForm} />
            ) : (
              <div className="flex-1 flex flex-col space-y-4">
                
                {/* 1. GLASSMORPHIC HERO SEARCH & REGISTRATION DOCK */}
                <div className="backdrop-blur-2xl bg-white/75 border border-white/90 rounded-3xl p-3.5 sm:p-5 shadow-[0_10px_35px_-5px_rgba(15,23,42,0.06),0_1px_2px_rgba(255,255,255,0.8)_inset] transition-all relative overflow-hidden shrink-0">
                  {/* Subtle Top Specular Glass Reflection */}
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    
                    {/* Search Input Form (Tactile Clay Inset Style) */}
                    <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2.5">
                      <div className="relative flex-1 group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 pointer-events-none transition-transform group-focus-within:scale-110">
                          <FaSearch className="text-xs" />
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search Mobile (+971...), Email, VIN, Plate Number, Customer #, or Prospect #..."
                          className="w-full pl-12 pr-10 py-3 bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-200/80 focus:border-blue-500 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-[inset_0_2px_4px_rgba(15,23,42,0.04)] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => { setSearchQuery(''); setSearchFeedback(null); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Clear input"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        )}
                      </div>

                      {/* 3D Clay Search Button */}
                      <button
                        type="submit"
                        disabled={isSearching || !searchQuery.trim()}
                        className="px-5 sm:px-6 py-3 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-[0_6px_16px_rgba(37,99,235,0.32),inset_0_1px_1px_rgba(255,255,255,0.4)] border-t border-white/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
                      >
                        {isSearching ? (
                          <>
                            <FaSpinner className="animate-spin text-sm" />
                            <span>Searching...</span>
                          </>
                        ) : (
                          <>
                            <FaSearch className="text-xs" />
                            <span>Search</span>
                          </>
                        )}
                      </button>
                    </form>

                    {/* 3D Clay "+ Create New Customer" Action Button */}
                    <button
                      type="button"
                      onClick={() => openCustomerForm('create')}
                      className="px-5 py-3 bg-gradient-to-b from-indigo-500 via-blue-600 to-blue-700 hover:from-indigo-600 hover:to-blue-800 active:translate-y-0.5 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-[0_8px_20px_rgba(59,130,246,0.35),inset_0_2px_2px_rgba(255,255,255,0.35)] border-t border-white/25 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 group"
                      title="Register a new customer profile into Keyloop & CRM"
                    >
                      <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FaUserPlus className="text-xs" />
                      </div>
                      <span>+ Create New Customer</span>
                    </button>
                  </div>

                  {/* Search Feedback Glass Notification */}
                  {searchFeedback && (
                    <div className={`mt-3 p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in backdrop-blur-md ${
                      searchFeedback.type === 'success'
                        ? 'bg-emerald-50/90 text-emerald-800 border-emerald-200/80 shadow-[0_4px_12px_rgba(16,185,129,0.12)]'
                        : 'bg-rose-50/90 text-rose-800 border-rose-200/80 shadow-[0_4px_12px_rgba(244,63,94,0.12)]'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${searchFeedback.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{searchFeedback.message}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSearchFeedback(null)}
                        className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. AGENT PROFILE CARD - Clean Glassmorphic Style */}
                <div className="flex-1 w-full min-h-[480px] sm:min-h-[540px] lg:min-h-[calc(100vh-220px)] relative overflow-hidden rounded-3xl p-8 sm:p-14 shadow-[0_12px_40px_-5px_rgba(15,23,42,0.06),0_1px_2px_rgba(255,255,255,0.9)_inset] border border-white/90 backdrop-blur-2xl bg-white/75 sm:bg-white/80 flex flex-col items-center justify-center text-center transition-all group">
                  {/* Subtle Top Specular Glass Reflection */}
                  <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent pointer-events-none" />
                  
                  {/* Soft Ambient Inner Glows */}
                  <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col items-center gap-4">
                    {/* 3D Tactile Clay Agent Medallion with White Icon */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-600 to-indigo-700 text-white flex items-center justify-center text-3xl sm:text-4xl shadow-[0_14px_30px_rgba(59,130,246,0.35),inset_0_2px_3px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.15)] border border-white/30 backdrop-blur-md transition-transform duration-300 group-hover:scale-105 cursor-default">
                      <FaUserTie className="text-white drop-shadow-md" />
                    </div>

                    {/* Agent Name (If provided in URL) */}
                    {urlAgentName && (
                      <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
                        {urlAgentName}
                      </h2>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  );
}
