import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch, executeRpaCase } from '../utils/api';
import { getBranchesForGroup } from '../data/brandModels';
import { 
  FaSearch, 
  FaFilter, 
  FaSpinner, 
  FaRedo, 
  FaCar, 
  FaUser, 
  FaCalendarAlt, 
  FaBuilding, 
  FaFileInvoiceDollar, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaInfoCircle,
  FaArrowRight,
  FaChevronDown,
  FaChevronUp,
  FaEnvelope,
  FaIdBadge,
  FaTag,
  FaTimes,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { getFullMobileNumber } from '../utils/phoneUtils';

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      if (dateStr.includes('T') || dateStr.includes(':')) {
        return d.toLocaleString('en-GB', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return d.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  } catch (e) {}
  return String(dateStr);
};

export default function SalesEnquiriesView() {
  const { 
    customer, 
    currentMobile, 
    group: contextGroup, 
    enquiryNumber: contextEnquiryNumber, 
    enquiries: contextEnquiries 
  } = useCustomer();
  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || "BMW");
  const customerNumber = customer?.customerNumber || customer?.id || '';
  const mobile = getFullMobileNumber(customer, currentMobile);

  const customerEnquiries = (customer?.enquiries && Array.isArray(customer.enquiries) && customer.enquiries.length > 0)
    ? customer.enquiries
    : (contextEnquiries && Array.isArray(contextEnquiries) && contextEnquiries.length > 0)
      ? contextEnquiries
      : [];

  const initialEnquiryNo = customer?.enquiryNumber || contextEnquiryNumber || (customerEnquiries[0]?.enquiryNumber) || '';

  const [enquiries, setEnquiries] = useState(customerEnquiries);
  const [loading, setLoading] = useState(false);
  const [searchEnquiryNumber, setSearchEnquiryNumber] = useState(initialEnquiryNo);
  const [searchMobile, setSearchMobile] = useState(mobile);
  const [searchMake, setSearchMake] = useState(group);
  const [searchModel, setSearchModel] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedEnquiryId, setExpandedEnquiryId] = useState(null);
  const [detailCache, setDetailCache] = useState({});

  // Showroom Appointment Modal (RPA: BOOK_SHOWROOM_APPOINTMENT)
  const [showroomModalOpen, setShowroomModalOpen] = useState(false);
  const [showroomEnquiryId, setShowroomEnquiryId] = useState("");
  const [showroomDate, setShowroomDate] = useState("");
  const [showroomTime, setShowroomTime] = useState("11:00");
  const [showroomBranch, setShowroomBranch] = useState("");
  const [showroomManufacturer, setShowroomManufacturer] = useState("");
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionProgressStatus, setActionProgressStatus] = useState(null);
  const [actionToast, setActionToast] = useState(null);

  const handleOpenShowroomAppt = (enq) => {
    const enqId = String(enq?.enquiryNumber || enq?.enquiryId || enq?.id || '');
    setShowroomEnquiryId(enqId);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setShowroomDate(tomorrow);
    setShowroomTime("11:00");

    const dynamicGroup = group || enq?.make || 'BMW';
    const branches = getBranchesForGroup(dynamicGroup);
    const defBranch = branches[0] ? `${branches[0].code} - ${branches[0].name}` : '10 - Sheikh Zayed Rd';
    setShowroomBranch(defBranch);
    setShowroomManufacturer(enq?.make || dynamicGroup);

    setActionProgressStatus(null);
    setActionToast(null);
    setShowroomModalOpen(true);
  };

  const handleConfirmShowroomAppt = async (e) => {
    e.preventDefault();
    if (!showroomEnquiryId.trim()) {
      setActionToast({ isError: true, message: "Enquiry ID is required to book a showroom appointment." });
      return;
    }
    if (!showroomDate) {
      setActionToast({ isError: true, message: "Please select a valid date." });
      return;
    }

    setActionSubmitting(true);
    setActionProgressStatus('QUEUED');
    setActionToast(null);

    const dynamicGroup = group || showroomManufacturer || 'BMW';
    const requestedAt = `${showroomDate}T${showroomTime}:00`;

    const payload = {
      enquiryId: showroomEnquiryId.trim(),
      group: dynamicGroup,
      manufacturer: showroomManufacturer || dynamicGroup,
      branch: showroomBranch,
      requestedAt
    };

    try {
      const result = await executeRpaCase("BOOK_SHOWROOM_APPOINTMENT", payload, {
        createdBy: "genesys",
        callbackUrl: "http://localhost:9999/hook",
        onProgress: (status) => setActionProgressStatus(status)
      });

      setActionToast({
        isError: false,
        message: `Showroom appointment for Enquiry #${showroomEnquiryId} booked successfully!`,
        taskId: result?.taskId
      });
      setTimeout(() => {
        setShowroomModalOpen(false);
      }, 2500);
    } catch (err) {
      console.error("Showroom Appt RPA error:", err);
      setActionToast({ isError: true, message: err.message || "Failed to book showroom appointment via Keyloop RPA." });
    } finally {
      setActionSubmitting(false);
    }
  };

  const fetchEnquiries = async (overrideEnquiryNo = null) => {
    setLoading(true);
    try {
      let endpoint = '';
      const params = new URLSearchParams();
      params.set('group', group);

      const targetEnquiryNo = overrideEnquiryNo !== null ? overrideEnquiryNo : searchEnquiryNumber;

      if (targetEnquiryNo && targetEnquiryNo.trim()) {
        endpoint = `/api/v1/enquiries/${group}/${targetEnquiryNo.trim()}`;
      } else if (searchMobile && searchMobile.trim()) {
        params.set('mobile', searchMobile.trim().replace(/[^0-9]/g, ''));
        if (searchMake && searchMake.trim()) params.set('make', searchMake.trim());
        if (searchModel && searchModel.trim()) params.set('model', searchModel.trim());
        if (statusFilter !== 'all') params.set('status', statusFilter);
        endpoint = `/api/v1/enquiries?${params.toString()}`;
      } else if (customerNumber) {
        params.set('customerNumber', customerNumber);
        if (searchMake && searchMake.trim()) params.set('make', searchMake.trim());
        endpoint = `/api/v1/enquiries?${params.toString()}`;
      } else {
        params.set('status', 'open');
        endpoint = `/api/v1/enquiries?${params.toString()}`;
      }

      const res = await apiFetch(endpoint);
      if (res && res.ok && res.data) {
        const list = Array.isArray(res.data) ? res.data : [res.data];
        if (list.length > 0) {
          setEnquiries(list);
        } else if (customerEnquiries.length > 0) {
          setEnquiries(customerEnquiries);
        } else {
          setEnquiries([]);
        }
      } else if (customerEnquiries.length > 0) {
        setEnquiries(customerEnquiries);
      } else {
        setEnquiries([]);
      }
    } catch (err) {
      console.warn('Failed to fetch enquiries:', err);
      if (customerEnquiries.length > 0) {
        setEnquiries(customerEnquiries);
      } else {
        setEnquiries([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerEnquiries.length > 0) {
      setEnquiries(customerEnquiries);
    }
    const currentEnqNo = customer?.enquiryNumber || contextEnquiryNumber || customerEnquiries[0]?.enquiryNumber || '';
    if (currentEnqNo) {
      setSearchEnquiryNumber(currentEnqNo);
    }
    if (mobile) {
      setSearchMobile(mobile);
    }
    if (group) {
      setSearchMake(group);
    }
    fetchEnquiries(currentEnqNo || null);
  }, [customerNumber, group, customer?.enquiries?.length]);

  const handleToggleDetails = async (enq) => {
    const id = String(enq?.enquiryNumber || enq?.enquiryId || enq?.id || '');
    if (!id) return;
    if (expandedEnquiryId === id) {
      setExpandedEnquiryId(null);
      return;
    }
    setExpandedEnquiryId(id);

    // Fetch supplemental detail if not already cached
    if (!detailCache[id]) {
      try {
        const res = await apiFetch(`/api/v1/enquiries/${group || enq.keyloopGroup || 'BMW'}/${id}`);
        if (res && res.ok && res.data) {
          setDetailCache(prev => ({ ...prev, [id]: res.data }));
        }
      } catch (err) {
        // Fallback: enq already has all data
      }
    }
  };

  const getOutcomeBadge = (outcome, status) => {
    const o = (outcome || '').toUpperCase();
    if (o === 'WON') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <FaCheckCircle className="text-emerald-600 text-[9px]" /> WON {status ? `(${status})` : ''}
        </span>
      );
    } else if (o === 'LOST') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
          <FaTimesCircle className="text-rose-600 text-[9px]" /> LOST {status ? `(${status})` : ''}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
          <FaClock className="text-blue-600 text-[9px]" /> OPEN {status ? `(${status})` : ''}
        </span>
      );
    }
  };

  return (
    <div className="flex flex-col gap-3 text-xs font-sans">
      
      {/* Action Notification Toast */}
      {actionToast && (
        <div className={`p-3 rounded-xl flex items-center justify-between border shadow-2xs animate-fade-in ${
          actionToast.isError
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
              actionToast.isError ? 'bg-rose-600' : 'bg-emerald-600'
            }`}>
              {actionToast.isError ? '✕' : '✓'}
            </div>
            <div>
              <span className="font-bold block text-xs">{actionToast.message}</span>
              {actionToast.taskId && (
                <span className="text-[10px] font-mono text-emerald-700 block">RPA Task ID: #{actionToast.taskId}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActionToast(null)}
            className="text-xs font-bold text-gray-400 hover:text-gray-700 cursor-pointer p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Filter Bar (Fixed / Stays in view) */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs flex flex-col gap-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FaFileInvoiceDollar className="text-base" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 leading-tight">Keyloop Customer Enquiries</h2>
                {enquiries.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                    {enquiries.length} {enquiries.length === 1 ? 'Record' : 'Records'}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-gray-400 font-mono">
                Group: {group} {customerNumber ? `| Customer #${customerNumber}` : ''}
              </span>
            </div>
          </div>

          <button
            onClick={fetchEnquiries}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium cursor-pointer transition-all self-start sm:self-auto text-xs border border-gray-300"
          >
            <FaRedo className={`text-xs ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters Grid */}
        <form 
          onSubmit={(e) => { e.preventDefault(); fetchEnquiries(); }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1"
        >
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Enquiry #</label>
            <input
              type="text"
              value={searchEnquiryNumber}
              onChange={(e) => setSearchEnquiryNumber(e.target.value)}
              placeholder="e.g. 564774"
              className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 font-mono font-semibold text-xs text-gray-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Mobile #</label>
            <input
              type="text"
              value={searchMobile}
              onChange={(e) => setSearchMobile(e.target.value)}
              placeholder="e.g. 0501234567"
              className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 font-medium text-xs text-gray-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Make / Brand</label>
            <input
              type="text"
              value={searchMake}
              onChange={(e) => setSearchMake(e.target.value)}
              placeholder="e.g. BMW, MINI, GEELY"
              className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 font-medium text-xs text-gray-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Status / Outcome</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 font-medium text-xs text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Outcomes</option>
              <option value="open">Open Only</option>
              <option value="won">Won Only</option>
              <option value="lost">Lost Only</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <FaSearch className="text-xs" />
              <span>Search Enquiries</span>
            </button>
          </div>
        </form>

        {/* Customer Enquiries Quick Select Badges (from Customer Group API) */}
        {customerEnquiries.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2.5 border-t border-gray-100">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <FaFileInvoiceDollar className="text-blue-500 text-[10px]" />
              Customer Enquiries ({customerEnquiries.length}):
            </span>
            {customerEnquiries.map((item, i) => {
              const num = String(item.enquiryNumber || item.enquiryId || item.id || '');
              const isSelected = searchEnquiryNumber === num;
              return (
                <button
                  key={num || i}
                  type="button"
                  onClick={() => {
                    setSearchEnquiryNumber(num);
                    fetchEnquiries(num);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white hover:bg-blue-50 text-gray-700 border-gray-300'
                  }`}
                >
                  <span className="font-mono">#{num}</span>
                  {item.make && item.model && (
                    <span className="text-[10px] font-medium opacity-90 truncate max-w-[150px]">
                      {item.make} {item.model}
                    </span>
                  )}
                  {item.outcome && (
                    <span className={`text-[9px] px-1 py-0.2 rounded font-extrabold uppercase ${
                      item.outcome.toUpperCase() === 'WON' 
                        ? (isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800')
                        : item.outcome.toUpperCase() === 'LOST' 
                          ? (isSelected ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-800') 
                          : (isSelected ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800')
                    }`}>
                      {item.outcome}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Enquiries List Section with Internal Scrollbar (Single Page) */}
      {loading ? (
        <div className="py-16 bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2">
          <FaSpinner className="animate-spin text-2xl text-blue-600" />
          <span className="text-xs font-semibold text-gray-600">Fetching enquiries from Keyloop...</span>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300 space-y-1">
          <FaInfoCircle className="mx-auto text-2xl text-gray-400 mb-2" />
          <p className="font-bold text-xs text-gray-800">No Keyloop Enquiries Found</p>
          <p className="text-[11px] text-gray-500">
            No sales enquiries were returned for group <strong>{group}</strong> with the specified parameters.
          </p>
        </div>
      ) : (
        <div 
          className="overflow-y-auto pr-2 flex flex-col gap-3 focus:outline-none"
          style={{
            maxHeight: 'calc(100vh - 275px)',
            minHeight: '400px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#93c5fd #f1f5f9'
          }}
        >
          {enquiries.map((enq, idx) => {
            const enqId = String(enq.enquiryNumber || enq.enquiryId || enq.id || `ENQ-${idx+1}`);
            const merged = { ...enq, ...(detailCache[enqId] || detailCache[enq.enquiryId] || {}) };
            const veh = merged.vehicle || {
              make: merged.make || group,
              model: merged.model || '',
              modelYear: merged.createdDate ? String(merged.createdDate).slice(0, 4) : ''
            };
            const ord = merged.order || {
              status: merged.status || '',
              salesOrderNumber: merged.salesOrderNumber || merged.orderNumber || ''
            };
            const cust = merged.customer || {
              name: customer?.fullName || `${customer?.firstName || ''} ${customer?.surname || ''}`.trim() || 'N/A',
              customerNumber: customer?.customerNumber || customer?.id || '',
              mobile: customer?.mobile || currentMobile || ''
            };
            const adv = merged.advisor || {};
            const isExpanded = expandedEnquiryId === enqId;

            return (
              <div 
                key={enqId || idx}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 shadow-2xs flex flex-col gap-3 transition-all"
              >
                {/* Card Summary Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Enquiry #{enqId}
                    </span>
                    {getOutcomeBadge(enq.outcome, enq.status)}
                    <span className="text-xs font-bold text-gray-800">
                      {enq.make || group} {enq.model || ''}
                    </span>
                    {enq.modelCode && (
                      <span className="text-[10px] text-gray-400 font-mono">[{enq.modelCode}]</span>
                    )}
                    {enq.createdDate && (
                      <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                        <FaCalendarAlt className="text-gray-400 text-[9px]" />
                        Created: {enq.createdDate}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenShowroomAppt(enq)}
                      className="text-purple-700 hover:text-purple-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-md transition-colors shadow-2xs"
                      title="Book Showroom Appointment via Keyloop RPA"
                    >
                      <FaUser className="text-[9px]" />
                      <span>Showroom Appt</span>
                    </button>
                    <button
                      onClick={() => handleToggleDetails(enq)}
                      className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                      {isExpanded ? (
                        <FaChevronUp className="text-[9px]" />
                      ) : (
                        <FaArrowRight className="text-[9px]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Primary Summary Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Customer</span>
                    <span className="font-bold text-gray-900 block truncate">{cust.name || 'N/A'}</span>
                    <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[10px]">
                      {cust.customerNumber && (
                        <span className="bg-gray-100 text-gray-600 px-1 rounded text-[9px] font-semibold">
                          #{cust.customerNumber}
                        </span>
                      )}
                      <span className="truncate">{cust.mobile || ''}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Branch & Advisor</span>
                    <span className="font-bold text-gray-800 block truncate">
                      {enq.branchName || (enq.branchCode ? `Branch ${enq.branchCode}` : 'N/A')}
                    </span>
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-blue-700 font-semibold text-[10px] truncate">
                        {adv.name || enq.salesExecutive || (adv.code ? `Advisor: ${adv.code}` : 'N/A')}
                      </span>
                    </div>
                    {adv.email && (
                      <span className="text-gray-400 text-[9px] block truncate font-mono">{adv.email}</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Order / Invoice</span>
                    <span className="font-semibold text-gray-800 block truncate">
                      {ord.salesOrderNumber ? `Order #${ord.salesOrderNumber}` : 'No Order Placed'}
                    </span>
                    <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono">
                      {ord.invoiceNumber && (
                        <span className="text-gray-700 font-bold">Inv #{ord.invoiceNumber}</span>
                      )}
                      {ord.invoiceDate && (
                        <span className="text-emerald-700 font-semibold">({ord.invoiceDate})</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Vehicle VIN</span>
                    <span className="font-mono font-bold text-gray-800 text-[10px] block truncate" title={veh.vin}>
                      {veh.vin || 'N/A'}
                    </span>
                    <div className="text-gray-500 text-[10px] flex items-center gap-1.5 truncate">
                      {veh.colour && <span>{veh.colour}</span>}
                      {veh.modelYear && <span>• {veh.modelYear}</span>}
                      {enq.newUsed && (
                        <span className="px-1 py-0.2 bg-gray-100 text-gray-600 rounded text-[9px] font-bold">
                          {enq.newUsed === 'U' || enq.newUsed.toLowerCase() === 'used' ? 'USED' : 'NEW'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Detailed Breakdown with ALL Response Fields */}
                {isExpanded && (
                  <div className="mt-2 p-3.5 bg-slate-50/90 rounded-xl border border-blue-200/90 shadow-2xs flex flex-col gap-3">
                    {/* Expanded Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/70 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                          <FaInfoCircle className="text-blue-600 text-xs" />
                          Full Enquiry Record #{merged.enquiryNumber || merged.enquiryId || enqId}
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-mono px-2 py-0.5 rounded font-semibold border border-blue-200">
                          Group: {merged.keyloopGroup || group}
                        </span>
                        {merged.creationSource && (
                          <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded border border-gray-200">
                            Creation Source: {merged.creationSource}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => setExpandedEnquiryId(null)}
                          className="text-gray-400 hover:text-gray-700 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-gray-200/50 cursor-pointer"
                        >
                          ✕ Close
                        </button>
                      </div>
                    </div>

                    {/* 4 Detail Grid Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      
                      {/* CARD 1: Customer & Sales Advisor */}
                      <div className="bg-white rounded-lg p-3 border border-blue-100 shadow-2xs flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-blue-800 font-bold text-[11px] border-b border-blue-50 pb-1.5">
                          <FaUser className="text-blue-600 text-[10px]" />
                          <span>Customer & Advisor</span>
                        </div>
                        
                        <div className="space-y-1.5 text-[11px]">
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Customer Name</span>
                            <span className="font-bold text-gray-900">{cust.name || 'N/A'}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">Customer #</span>
                              <span className="font-mono font-semibold text-gray-800">{cust.customerNumber || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">Mobile</span>
                              <span className="font-mono text-gray-700">{cust.mobile || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-gray-100">
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Sales Advisor</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-blue-900">{adv.name || merged.salesExecutive || 'N/A'}</span>
                              {adv.code && (
                                <span className="text-[10px] bg-blue-50 text-blue-700 font-mono px-1 rounded border border-blue-100">
                                  {adv.code}
                                </span>
                              )}
                            </div>
                            {adv.email && (
                              <span className="text-[10px] text-gray-500 font-mono block truncate" title={adv.email}>
                                {adv.email}
                              </span>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Branch</span>
                            <span className="font-semibold text-gray-800">
                              {merged.branchName || (merged.branchCode ? `Branch ${merged.branchCode}` : 'N/A')}
                            </span>
                            {merged.branchCode && (
                              <span className="text-[10px] text-gray-400 font-mono block">Branch Code: {merged.branchCode}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* CARD 2: Vehicle Details */}
                      <div className="bg-white rounded-lg p-3 border border-indigo-100 shadow-2xs flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-[11px] border-b border-indigo-50 pb-1.5">
                          <FaCar className="text-indigo-600 text-[10px]" />
                          <span>Vehicle Details</span>
                        </div>

                        <div className="space-y-1.5 text-[11px]">
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Make & Model</span>
                            <span className="font-bold text-gray-900">
                              {merged.make} {merged.model}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                              {merged.modelCode && <span>Model: [{merged.modelCode}]</span>}
                              {merged.variantCode && <span>• Var: [{merged.variantCode}]</span>}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Description</span>
                            <span className="font-medium text-gray-800 text-[10px] block leading-tight">
                              {veh.description || `${merged.make} ${merged.model}`}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">VIN</span>
                              <span className="font-mono font-bold text-[10px] text-gray-800 block truncate" title={veh.vin}>
                                {veh.vin || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">Vehicle #</span>
                              <span className="font-mono text-[10px] text-gray-700">{veh.vehicleNumber || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">Year & Colour</span>
                              <span className="text-[10px] font-semibold text-gray-800">
                                {veh.modelYear || ''} {veh.colour ? `• ${veh.colour}` : ''}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">Type (New/Used)</span>
                              <span className="text-[10px] font-bold text-gray-800">
                                {merged.newUsed === 'U' || merged.newUsed?.toLowerCase() === 'used' ? 'Used (U)' : (merged.newUsed === 'N' || merged.newUsed?.toLowerCase() === 'new' ? 'New (N)' : merged.newUsed || 'N/A')}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">Registration</span>
                              <span className="font-mono text-[10px] text-gray-700">{veh.registrationNumber || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">Stock Progress</span>
                              <span className="font-bold text-[10px] text-emerald-700">{veh.stockProgress || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CARD 3: Sales Order & Invoice */}
                      <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-2xs flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px] border-b border-emerald-50 pb-1.5">
                          <FaFileInvoiceDollar className="text-emerald-600 text-[10px]" />
                          <span>Order & Invoicing</span>
                        </div>

                        <div className="space-y-1.5 text-[11px]">
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Sales Order #</span>
                            <span className="font-bold text-gray-900 font-mono">
                              {ord.salesOrderNumber ? `#${ord.salesOrderNumber}` : 'No Sales Order'}
                            </span>
                            {ord.orderConfirmedDate && (
                              <span className="text-[10px] text-gray-500 block">Confirmed: {formatDate(ord.orderConfirmedDate)}</span>
                            )}
                          </div>

                          <div className="pt-1 border-t border-gray-100">
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Invoice Details</span>
                            <span className="font-bold text-emerald-800 font-mono">
                              {ord.invoiceNumber ? `Invoice #${ord.invoiceNumber}` : 'Not Invoiced'}
                            </span>
                            {ord.invoiceDate && (
                              <span className="text-[10px] text-emerald-700 block font-mono">Date: {formatDate(ord.invoiceDate)}</span>
                            )}
                            {ord.originalInvoicedDate && ord.originalInvoicedDate !== ord.invoiceDate && (
                              <span className="text-[9px] text-gray-400 block font-mono">Original: {formatDate(ord.originalInvoicedDate)}</span>
                            )}
                          </div>

                          <div className="pt-1 border-t border-gray-100">
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Delivery Information</span>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-gray-800">
                                {formatDate(ord.deliveryDate)}
                              </span>
                              {ord.deliveryDateStatus && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                                  {ord.deliveryDateStatus}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CARD 4: Enquiry Meta & Dates */}
                      <div className="bg-white rounded-lg p-3 border border-amber-100 shadow-2xs flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[11px] border-b border-amber-50 pb-1.5">
                          <FaCalendarAlt className="text-amber-600 text-[10px]" />
                          <span>Timeline</span>
                        </div>

                        <div className="space-y-1.5 text-[11px]">
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Status & Outcome</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {getOutcomeBadge(merged.outcome, merged.status)}
                            </div>
                          </div>

                          <div className="pt-1 border-t border-gray-100">
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Created Date</span>
                            <span className="font-mono text-gray-800 block text-[10px]">{formatDate(merged.createdAt)}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Last Edit Date</span>
                            <span className="font-mono text-gray-800 block text-[10px]">{formatDate(merged.lastEditDate)}</span>
                          </div>

                          <div className="pt-1 border-t border-gray-100">
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Source of Business</span>
                            <span className="font-semibold text-gray-800 block">{merged.sourceOfBusiness || 'N/A'}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Keyloop Group</span>
                            <span className="font-bold text-gray-700 block">{merged.keyloopGroup || group}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ================================================================ */}
      {/* BOOK SHOWROOM APPOINTMENT MODAL (RPA: BOOK_SHOWROOM_APPOINTMENT) */}
      {/* ================================================================ */}
      {showroomModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget && !actionSubmitting) setShowroomModalOpen(false);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200/90 max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center font-bold shadow-2xs shrink-0">
                  <FaCalendarAlt className="text-base" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">
                      Book Showroom Appointment
                    </h3>
                    <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {group || 'BMW'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Schedule client consultation & showroom visit in Keyloop Autoline
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowroomModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmShowroomAppt} className="p-5 flex flex-col gap-4 text-xs">
              {/* Customer & Enquiry Context Snapshot */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 border border-purple-200 font-bold flex items-center justify-center text-xs shrink-0">
                    {customer?.fullName ? customer.fullName.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div className="min-w-0 truncate">
                    <span className="font-bold text-gray-900 block truncate">{customer?.fullName || 'Active Customer'}</span>
                    <span className="text-[10px] text-gray-500 font-mono truncate block">
                      Cust #{customerNumber || 'N/A'} • {mobile || 'No Phone'}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Target Enquiry</span>
                  <span className="font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded text-xs inline-block">
                    #{showroomEnquiryId || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Enquiry ID */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <FaCalendarAlt className="text-gray-400 text-xs" /> Enquiry ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={showroomEnquiryId}
                  onChange={(e) => setShowroomEnquiryId(e.target.value)}
                  placeholder="e.g. 567983"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-purple-600 focus:bg-white rounded-xl font-mono font-bold text-gray-800 text-xs focus:outline-none transition-all shadow-2xs"
                />
              </div>

              {/* Manufacturer / Brand */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <FaCar className="text-gray-400 text-xs" /> Manufacturer / Brand
                </label>
                <input
                  type="text"
                  value={showroomManufacturer}
                  onChange={(e) => setShowroomManufacturer(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-purple-600 focus:bg-white rounded-xl font-bold text-gray-800 text-xs focus:outline-none transition-all shadow-2xs"
                />
              </div>

              {/* Showroom Branch */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-gray-400 text-xs" /> Showroom Branch <span className="text-rose-500">*</span>
                </label>
                <select
                  value={showroomBranch}
                  onChange={(e) => setShowroomBranch(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-purple-600 focus:bg-white rounded-xl font-semibold text-gray-800 text-xs focus:outline-none transition-all shadow-2xs"
                >
                  {getBranchesForGroup(group || 'BMW').map(b => (
                    <option key={b.code} value={`${b.code} - ${b.name}`}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaCalendarAlt className="text-gray-400 text-xs" /> Appointment Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={showroomDate}
                    onChange={(e) => setShowroomDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-purple-600 focus:bg-white rounded-xl font-semibold text-gray-800 text-xs focus:outline-none transition-all shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaClock className="text-gray-400 text-xs" /> Requested Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={showroomTime}
                    onChange={(e) => setShowroomTime(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-purple-600 focus:bg-white rounded-xl font-semibold text-gray-800 text-xs focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              {actionSubmitting && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-3 text-xs text-purple-900 animate-pulse">
                  <FaSpinner className="animate-spin text-purple-600 text-sm shrink-0" />
                  <div className="flex-1">
                    <span className="font-bold block">
                      {actionProgressStatus === 'QUEUED' && 'Appointment case queued in Keyloop broker...'}
                      {actionProgressStatus === 'CLAIMED' && 'Autoline RPA bot scheduling showroom appointment in Keyloop...'}
                      {actionProgressStatus === 'COMPLETED' && 'Successfully scheduled!'}
                      {!actionProgressStatus && 'Submitting showroom appointment case...'}
                    </span>
                    <span className="block text-[10px] text-purple-700 font-mono">POST /api/intake/cases (BOOK_SHOWROOM_APPOINTMENT)</span>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={actionSubmitting}
                  onClick={() => setShowroomModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 active:bg-purple-900 disabled:opacity-50 text-white font-bold cursor-pointer text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  {actionSubmitting ? <FaSpinner className="animate-spin text-xs" /> : <FaCheckCircle className="text-xs" />}
                  <span>Confirm Showroom Appointment</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
