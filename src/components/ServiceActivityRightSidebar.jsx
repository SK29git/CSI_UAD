import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaFilter, 
  FaPhoneAlt, 
  FaCheckCircle, 
  FaWhatsapp, 
  FaBell, 
  FaCar, 
  FaStar, 
  FaWrench,
  FaChevronRight,
  FaChevronLeft,
  FaHistory,
  FaTag,
  FaSpinner
} from 'react-icons/fa';

export default function ServiceActivityRightSidebar({ isCollapsed = false, onToggleCollapse }) {
  const { customer, group: contextGroup } = useCustomer();
  const customerNumber = customer?.customerNumber || customer?.id || "";
  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || "");

  const [activeTab, setActiveTab] = useState('All');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const apiUrl = `/api/v1/customers/${group}/${customerNumber}/complaints?limit=50`;
      const res = await apiFetch(apiUrl);
      if (res && res.ok && Array.isArray(res.data)) {
        setActivities(res.data);
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.warn("Failed to fetch customer activity timeline:", err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [customerNumber, group]);

  const filterTabs = ['All', 'High Priority', 'Medium Priority'];

  const filteredEvents = activeTab === 'All'
    ? activities
    : activeTab === 'High Priority'
    ? activities.filter(e => e.priority === 'HIGH' || e.priority === 'CRITICAL')
    : activities.filter(e => e.priority === 'MEDIUM');

  if (loading || !activities || activities.length === 0) {
    return null;
  }

  if (isCollapsed) {
    return (
      <div 
        onClick={onToggleCollapse}
        className="w-14 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex flex-col items-center gap-4 cursor-pointer hover:border-blue-300 transition-all duration-300 group py-4"
        title="Click to expand Customer Activity"
      >
        <button
          onClick={(e) => { e.stopPropagation(); onToggleCollapse && onToggleCollapse(); }}
          className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs"
          title="Expand Right Panel"
        >
          <FaChevronLeft className="text-sm" />
        </button>

        <div className="w-full h-[1px] bg-gray-100 my-1" />

        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform" title="Customer Activity">
          <FaHistory className="text-xs" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[310px] xl:w-[330px] flex-shrink-0 flex flex-col gap-4 transition-all duration-300 text-xs">
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 text-xs">Customer Activity Timeline</h3>
            <span className="text-[10px] text-gray-400 font-mono block">Cust #{customerNumber}</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="text-gray-400 hover:text-gray-600 p-1">
              <FaFilter className="text-[10px]" />
            </button>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="w-6 h-6 rounded bg-gray-100 text-gray-500 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors shadow-2xs ml-1"
                title="Collapse Right Panel"
              >
                <FaChevronRight className="text-xs" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 border-b border-gray-100 text-[10px] font-medium no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-0.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Activity Timeline Items */}
        <div className="mt-3">
          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
              <FaSpinner className="animate-spin text-xl text-blue-600" />
              <span className="text-xs font-medium">Loading customer activity timeline...</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-6 text-center text-gray-400 text-xs font-medium bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
              No activity timeline records found for this customer.
            </div>
          ) : (
            <div className="space-y-3.5 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
              {filteredEvents.map((evt, idx) => (
                <div key={evt.complaintId || idx} className="relative flex items-start gap-3 text-xs pl-0 group">
                  <div className={`w-7 h-7 rounded-lg ${
                    evt.priority === 'HIGH' || evt.priority === 'CRITICAL' ? 'bg-rose-600' : 'bg-blue-600'
                  } text-white flex items-center justify-center flex-shrink-0 z-10 shadow-xs`}>
                    <FaTag className="text-xs" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-blue-600">{evt.complaintId || `AGMC-${idx+1}`}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{evt.openDate || 'N/A'}</span>
                    </div>
                    <div className="font-bold text-gray-900 text-[12px]">{evt.category || 'Complaint Ticket'}</div>
                    <p className="text-gray-600 text-[11px] leading-tight my-0.5">{evt.description || `Priority: ${evt.priority || 'NORMAL'}`}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        evt.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {evt.priority || 'NORMAL'}
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono">SLA: {evt.slaDue || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
