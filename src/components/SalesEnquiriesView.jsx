import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
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
  FaTag
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
  const { customer, currentMobile, group: contextGroup } = useCustomer();
  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || "");
  const customerNumber = customer?.customerNumber || customer?.id || '';
  const mobile = getFullMobileNumber(customer, currentMobile);

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMobile, setSearchMobile] = useState(mobile);
  const [searchMake, setSearchMake] = useState(group);
  const [searchModel, setSearchModel] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedEnquiryId, setExpandedEnquiryId] = useState(null);
  const [detailCache, setDetailCache] = useState({});

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      const params = new URLSearchParams();
      params.set('group', group);

      if (searchMobile.trim()) {
        params.set('mobile', searchMobile.trim().replace(/[^0-9]/g, ''));
        if (searchMake.trim()) params.set('make', searchMake.trim());
        if (searchModel.trim()) params.set('model', searchModel.trim());
        if (statusFilter !== 'all') params.set('status', statusFilter);
        endpoint = `/api/v1/enquiries?${params.toString()}`;
      } else if (customerNumber) {
        params.set('customerNumber', customerNumber);
        if (searchMake.trim()) params.set('make', searchMake.trim());
        endpoint = `/api/v1/enquiries?${params.toString()}`;
      } else {
        params.set('status', 'open');
        endpoint = `/api/v1/enquiries?${params.toString()}`;
      }

      const res = await apiFetch(endpoint);
      if (res && res.ok && Array.isArray(res.data)) {
        setEnquiries(res.data);
      } else {
        setEnquiries([]);
      }
    } catch (err) {
      console.warn('Failed to fetch enquiries:', err);
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [group, customerNumber]);

  const handleToggleDetails = async (enq) => {
    const id = enq.enquiryId;
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
          className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1"
        >
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
            const merged = { ...enq, ...(detailCache[enq.enquiryId] || {}) };
            const veh = merged.vehicle || {};
            const ord = merged.order || {};
            const cust = merged.customer || {};
            const adv = merged.advisor || {};
            const isExpanded = expandedEnquiryId === enq.enquiryId;

            return (
              <div 
                key={enq.enquiryId || idx}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 shadow-2xs flex flex-col gap-3 transition-all"
              >
                {/* Card Summary Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Enquiry #{enq.enquiryId}
                    </span>
                    {getOutcomeBadge(enq.outcome, enq.status)}
                    <span className="text-xs font-bold text-gray-800">
                      {enq.make} {enq.model}
                    </span>
                    {enq.modelCode && (
                      <span className="text-[10px] text-gray-400 font-mono">[{enq.modelCode}]</span>
                    )}
                  </div>

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
                          Full Enquiry Record #{merged.enquiryId}
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

    </div>
  );
}
