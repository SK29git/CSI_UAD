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
  FaArrowRight
} from 'react-icons/fa';
import { getFullMobileNumber } from '../utils/phoneUtils';

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
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  const handleViewDetails = async (enquiryId) => {
    setDetailLoading(true);
    try {
      const res = await apiFetch(`/api/v1/enquiries/${group}/${enquiryId}`);
      if (res && res.ok && res.data) {
        setSelectedEnquiry(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch enquiry detail:', err);
    } finally {
      setDetailLoading(false);
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
    <div className="flex flex-col gap-4 text-xs font-sans">
      
      {/* Header & Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs flex flex-col gap-3">
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
              className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 font-medium text-xs text-gray-800"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Make / Brand</label>
            <input
              type="text"
              value={searchMake}
              onChange={(e) => setSearchMake(e.target.value)}
              placeholder="e.g. BMW, MINI"
              className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 font-medium text-xs text-gray-800"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Status / Outcome</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 font-medium text-xs text-gray-800"
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
              className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <FaSearch className="text-xs" />
              <span>Search Enquiries</span>
            </button>
          </div>
        </form>
      </div>

      {/* Enquiries List */}
      {loading ? (
        <div className="py-12 bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2">
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
        <div className="grid grid-cols-1 gap-3">
          {enquiries.map((enq, idx) => {
            const veh = enq.vehicle || {};
            const ord = enq.order || {};
            const cust = enq.customer || {};

            return (
              <div 
                key={enq.enquiryId || idx}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 shadow-2xs flex flex-col gap-3 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Enquiry #{enq.enquiryId}
                    </span>
                    {getOutcomeBadge(enq.outcome, enq.status)}
                    <span className="text-[11px] font-semibold text-gray-700">
                      {enq.make} {enq.model}
                    </span>
                  </div>

                  <button
                    onClick={() => handleViewDetails(enq.enquiryId)}
                    className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Details</span>
                    <FaArrowRight className="text-[9px]" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Customer</span>
                    <span className="font-bold text-gray-900">{cust.name || 'N/A'}</span>
                    <span className="text-gray-500 font-mono text-[10px] block">{cust.mobile || ''}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Branch & Advisor</span>
                    <span className="font-bold text-gray-800">{enq.branchName || `Branch ${enq.branchCode}`}</span>
                    <span className="text-gray-500 text-[10px] block">{enq.salesExecutive || 'N/A'}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Order / Invoice</span>
                    <span className="font-semibold text-gray-800">
                      {ord.salesOrderNumber ? `Order #${ord.salesOrderNumber}` : 'No Order Placed'}
                    </span>
                    {ord.invoiceDate && (
                      <span className="text-emerald-700 text-[10px] block font-mono">Inv: {ord.invoiceDate}</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Vehicle VIN</span>
                    <span className="font-mono font-bold text-gray-800 text-[10px]">{veh.vin || 'N/A'}</span>
                    {veh.colour && (
                      <span className="text-gray-500 text-[10px] block">{veh.colour}</span>
                    )}
                  </div>
                </div>

                {/* Expanded Modal / Detail Card */}
                {selectedEnquiry && selectedEnquiry.enquiryId === enq.enquiryId && (
                  <div className="mt-2 p-3 bg-blue-50/50 rounded-lg border border-blue-200 text-xs flex flex-col gap-2">
                    <div className="flex items-center justify-between font-bold text-blue-900 text-xs">
                      <span>Full Enquiry Record #{selectedEnquiry.enquiryId}</span>
                      <button 
                        onClick={() => setSelectedEnquiry(null)}
                        className="text-gray-400 hover:text-gray-700 text-xs font-bold"
                      >
                        ✕ Close
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div>
                        <span className="text-gray-500 text-[10px] block">Created Date</span>
                        <strong className="font-mono text-gray-800">{selectedEnquiry.createdAt || 'N/A'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 text-[10px] block">Last Edit Date</span>
                        <strong className="font-mono text-gray-800">{selectedEnquiry.lastEditDate || 'N/A'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 text-[10px] block">Source of Business</span>
                        <strong className="text-gray-800">{selectedEnquiry.sourceOfBusiness || 'N/A'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 text-[10px] block">Stock Progress</span>
                        <strong className="text-gray-800">{selectedEnquiry.vehicle?.stockProgress || 'N/A'}</strong>
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
