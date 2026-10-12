import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaCheckCircle, 
  FaSpinner, 
  FaCheck, 
  FaRedo,
  FaTimes,
  FaFileAlt,
  FaShieldAlt,
  FaCalendarAlt,
  FaTag,
  FaInfoCircle
} from 'react-icons/fa';

export default function ResolveComplaintView({ complaintId: propComplaintId }) {
  const { customer, getFormattedName, group: contextGroup } = useCustomer();
  const customerName = getFormattedName();
  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || "");
  const customerNumber = customer?.customerNumber || customer?.id || "";

  const [complaintsList, setComplaintsList] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(propComplaintId || "");
  const [resolutionData, setResolutionData] = useState(null);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [loadingResolution, setLoadingResolution] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form state
  const [resolutionCode, setResolutionCode] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const resolutionCodes = [
    { code: 'Apology', label: 'Apology — Direct customer apology issued' },
    { code: 'Goodwill Gesture', label: 'Goodwill Gesture — Courtesy service or goodwill voucher' },
    { code: 'Repair Completed', label: 'Repair Completed — Vehicle inspection & repair completed' },
    { code: 'Refund / Discount', label: 'Refund / Discount — Invoice adjustment or credit' },
    { code: 'Explanation Provided', label: 'Explanation Provided — Full operational clarification' },
    { code: 'Process Correction', label: 'Process Correction — Staff coaching and process update' },
    { code: 'Customer Satisfied', label: 'Customer Satisfied — Agreed resolution and closure' },
  ];

  // 1. Fetch customer complaints from API
  const fetchCustomerComplaints = async () => {
    if (!customerNumber) {
      setComplaintsList([]);
      setSelectedComplaintId('');
      setResolutionData(null);
      setLoadingComplaints(false);
      return;
    }

    setLoadingComplaints(true);
    try {
      const res = await apiFetch(`/api/v1/complaints?group=${group}&customerNumber=${customerNumber}`);
      if (res && res.ok && Array.isArray(res.data) && res.data.length > 0) {
        setComplaintsList(res.data);
        setSelectedComplaintId(prev => {
          if (propComplaintId && res.data.some(c => c.complaintId === propComplaintId)) {
            return propComplaintId;
          }
          if (prev && res.data.some(c => c.complaintId === prev)) {
            return prev;
          }
          return res.data[0].complaintId;
        });
      } else {
        setComplaintsList([]);
        setSelectedComplaintId('');
        setResolutionData(null);
      }
    } catch (err) {
      console.warn("Failed to fetch customer complaints:", err);
      setComplaintsList([]);
      setSelectedComplaintId('');
      setResolutionData(null);
    } finally {
      setLoadingComplaints(false);
    }
  };

  // 2. Fetch resolution status for the selected complaint
  const fetchResolution = async (cid) => {
    if (!cid || !group) {
      setResolutionData(null);
      setLoadingResolution(false);
      return;
    }

    setLoadingResolution(true);
    try {
      const res = await apiFetch(`/api/v1/complaints/${group}/${cid}/resolution`);
      if (res && res.ok && res.data) {
        setResolutionData(res.data);
      } else {
        setResolutionData(null);
      }
    } catch (err) {
      console.warn("Failed to fetch complaint resolution:", err);
      setResolutionData(null);
    } finally {
      setLoadingResolution(false);
    }
  };

  useEffect(() => {
    fetchCustomerComplaints();
  }, [group, customerNumber, propComplaintId]);

  useEffect(() => {
    if (selectedComplaintId) {
      fetchResolution(selectedComplaintId);
    } else {
      setResolutionData(null);
    }
  }, [group, selectedComplaintId]);

  // 3. POST Resolve Complaint
  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedComplaintId) return;

    setSubmitting(true);
    setErrorMessage(null);
    const payload = {
      resolutionCode: resolutionCode.trim(),
      resolutionNotes: resolutionNotes.trim()
    };

    try {
      const apiUrl = `/api/v1/complaints/${group}/${selectedComplaintId}/resolve`;
      const res = await apiFetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res && res.ok) {
        const updated = res.data || {
          complaintId: selectedComplaintId,
          resolutionStatus: 'RESOLVED',
          resolutionCode: payload.resolutionCode,
          resolutionNotes: payload.resolutionNotes,
          resolvedDate: new Date().toISOString().split('T')[0]
        };
        setResolutionData(updated);
        setToastMessage(`Complaint #${selectedComplaintId} has been successfully resolved.`);
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        setErrorMessage(res?.message || 'Failed to resolve complaint');
      }
    } catch (err) {
      console.warn("Resolve complaint error:", err);
      setErrorMessage(err.message || 'Error resolving complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const isResolved = (resolutionData?.resolutionStatus || '').toUpperCase() === 'RESOLVED';

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200 flex flex-col gap-5 w-full">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FaCheckCircle className="text-emerald-600" /> Resolve Complaint
          </h2>
          <p className="text-[11px] text-gray-500">
            Record resolution closure and notes for <span className="font-semibold text-gray-800">{customerName || `#${customerNumber}`}</span>
            {selectedComplaintId && (
              <> — Complaint <span className="font-mono font-bold text-blue-600">#{selectedComplaintId}</span></>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {complaintsList.length > 1 && (
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ticket:</label>
              <select
                value={selectedComplaintId}
                onChange={(e) => setSelectedComplaintId(e.target.value)}
                className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-blue-500"
              >
                {complaintsList.map(c => (
                  <option key={c.complaintId} value={c.complaintId}>
                    #{c.complaintId} {c.category ? `— ${c.category}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => {
              fetchCustomerComplaints();
              if (selectedComplaintId) fetchResolution(selectedComplaintId);
            }}
            title="Refresh"
            className="p-1.5 text-gray-400 hover:text-gray-600 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
          >
            <FaRedo className={`text-xs ${loadingComplaints || loadingResolution ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-lg flex items-center justify-between text-xs font-semibold animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <FaTimes className="text-xs" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold animate-fade-in flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-700 cursor-pointer">
            <FaTimes className="text-xs" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {loadingComplaints || loadingResolution ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
          <FaSpinner className="animate-spin text-xl text-emerald-600" />
          <span className="text-xs font-medium">Loading resolution status from API...</span>
        </div>
      ) : complaintsList.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-gray-50/70 rounded-xl border border-dashed border-gray-300">
          <p className="font-bold text-sm text-gray-700">No Complaints on Record</p>
          <p className="text-xs text-gray-400 mt-1">There are no open or recorded complaints for customer #{customerNumber}.</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Create a complaint first before recording resolution.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
          
          {/* LEFT COLUMN: Current Resolution Status Card */}
          <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="font-bold text-gray-900 text-xs">Resolution Status</span>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  isResolved 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {resolutionData?.resolutionStatus || 'OPEN'}
                </span>
              </div>

              <div className="mt-3.5 space-y-3">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Complaint Reference</span>
                  <span className="font-mono font-bold text-blue-700 text-sm mt-0.5 block">
                    #{resolutionData?.complaintId || selectedComplaintId}
                  </span>
                </div>

                {resolutionData?.origin && (
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Ticket Origin</span>
                    <span className="font-semibold text-gray-700 text-xs mt-0.5 block">
                      {resolutionData.origin}
                    </span>
                  </div>
                )}

                {resolutionData?.resolutionCode && (
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Resolution Code</span>
                    <span className="font-bold text-gray-900 text-xs mt-0.5 block">
                      {resolutionData.resolutionCode}
                    </span>
                  </div>
                )}

                {resolutionData?.resolutionNotes && (
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Resolution Notes</span>
                    <p className="text-gray-700 text-xs mt-0.5 leading-relaxed bg-white p-2.5 rounded border border-gray-200">
                      {resolutionData.resolutionNotes}
                    </p>
                  </div>
                )}

                {resolutionData?.resolvedDate && (
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Resolved Date</span>
                    <span className="font-mono font-semibold text-gray-700 text-xs mt-0.5 block">
                      {resolutionData.resolvedDate}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {isResolved && (
              <div className="pt-3 border-t border-slate-200 flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                <FaCheckCircle className="text-sm" />
                <span>Ticket is marked as resolved</span>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Resolution Action Form or Resolved View */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200 shadow-2xs flex flex-col justify-between gap-4">
            {isResolved ? (
              <div className="py-10 px-4 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
                  <FaCheckCircle />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Complaint #{selectedComplaintId} is Resolved</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  This complaint has been formally closed with resolution code <strong className="text-gray-800">"{resolutionData?.resolutionCode || 'Resolved'}"</strong>.
                </p>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 max-w-lg mx-auto text-left">
                  <span className="font-bold block mb-1">Recorded Closure Summary:</span>
                  <p className="italic">{resolutionData?.resolutionNotes || 'No detailed closure notes recorded.'}</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Record Complaint Resolution</h3>
                    <p className="text-[11px] text-gray-500">Formally close Ticket #{selectedComplaintId} with an agreed resolution code</p>
                  </div>
                </div>

                <form onSubmit={handleResolve} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Resolution Code <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={resolutionCode}
                      onChange={(e) => setResolutionCode(e.target.value)}
                      required
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Select resolution code...</option>
                      {resolutionCodes.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Resolution Notes / Agreed Outcome <span className="text-rose-500">*</span>
                    </label>
                    <textarea 
                      rows={4}
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      required
                      placeholder="Detail how the complaint was handled, manager apologies given, or terms agreed with the customer..."
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium leading-relaxed text-gray-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                    <FaInfoCircle className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>Resolving this complaint will update its status to RESOLVED in Keyloop and record closure notes.</span>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="px-6 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {submitting ? <FaSpinner className="animate-spin text-xs" /> : <FaCheck className="text-xs" />}
                      <span>Mark Complaint #{selectedComplaintId} as Resolved</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
