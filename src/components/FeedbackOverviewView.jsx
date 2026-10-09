import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaStar, 
  FaChartLine, 
  FaArrowDown, 
  FaArrowUp, 
  FaCheckCircle, 
  FaCommentAlt, 
  FaEnvelope, 
  FaWhatsapp, 
  FaSms, 
  FaChartPie,
  FaSpinner,
  FaPlus,
  FaPaperPlane,
  FaExclamationTriangle,
  FaTag
} from 'react-icons/fa';

export default function FeedbackOverviewView({ activeSubTab = 'Overview' }) {
  const { customer, getFormattedName } = useCustomer();
  const customerName = getFormattedName();
  const group = customer?.keyloopGroup || "BMW";
  const customerNumber = customer?.customerNumber || "80496";

  const [csiScore, setCsiScore] = useState(null);
  const [csiResponses, setCsiResponses] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [lostSalesReasons, setLostSalesReasons] = useState([]);
  const [lostSalesDetails, setLostSalesDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submit Feedback Form State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [surveyId, setSurveyId] = useState("CSI-2026-09");
  const [type, setType] = useState("CSI");
  const [comments, setComments] = useState("Very happy with the handover and service advisor support");

  const fetchFeedbackData = async () => {
    setLoading(true);
    try {
      // 1. CSI Score: GET /api/v1/feedback/csi-score?group={group}&customerNumber={customerNumber}
      const scoreRes = await apiFetch(`/api/v1/feedback/csi-score?group=${group}&customerNumber=${customerNumber}`);
      if (scoreRes && scoreRes.ok && scoreRes.data) {
        setCsiScore(scoreRes.data);
      } else {
        setCsiScore(null);
      }

      // 2. CSI Responses: GET /api/v1/customers/{group}/{customerNumber}/csi-responses
      const respRes = await apiFetch(`/api/v1/customers/${group}/${customerNumber}/csi-responses`);
      if (respRes && respRes.ok && Array.isArray(respRes.data)) {
        setCsiResponses(respRes.data);
      } else {
        setCsiResponses([]);
      }

      // 3. Recent Feedback: GET /api/v1/customers/{group}/{customerNumber}/feedback
      const feedbackRes = await apiFetch(`/api/v1/customers/${group}/${customerNumber}/feedback?from=2026-01-01&to=2027-12-31`);
      if (feedbackRes && feedbackRes.ok && Array.isArray(feedbackRes.data) && feedbackRes.data.length > 0) {
        setRecentFeedback(feedbackRes.data);
      } else {
        setRecentFeedback([]);
      }

      // 4. Lost Sales Reasons: GET /api/v1/lost-sales/reasons?group={group}&branch={branchCode}
      const reasonsRes = await apiFetch(`/api/v1/lost-sales/reasons?group=${group}&branch=${customer?.branchCode || '10'}`);
      if (reasonsRes && reasonsRes.ok && Array.isArray(reasonsRes.data) && reasonsRes.data.length > 0) {
        setLostSalesReasons(reasonsRes.data);
      } else {
        setLostSalesReasons([]);
      }

      // 5. Lost Sales Details: GET /api/v1/lost-sales?group={group}&customerNumber={customerNumber}
      const lostDetailsRes = await apiFetch(`/api/v1/lost-sales?group=${group}&customerNumber=${customerNumber}`);
      if (lostDetailsRes && lostDetailsRes.ok && Array.isArray(lostDetailsRes.data) && lostDetailsRes.data.length > 0) {
        setLostSalesDetails(lostDetailsRes.data);
      } else {
        setLostSalesDetails([]);
      }
    } catch (err) {
      console.warn("Failed to fetch feedback endpoints:", err);
      setCsiScore(null);
      setCsiResponses([]);
      setRecentFeedback([]);
      setLostSalesReasons([]);
      setLostSalesDetails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackData();
  }, [group, customerNumber]);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      keyloopGroup: group,
      surveyId,
      customerNumber,
      type,
      comments,
      submittedDate: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await apiFetch('/api/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res && res.ok && res.data) {
        setRecentFeedback(prev => [res.data, ...prev]);
      }
      setShowSubmitModal(false);
    } catch (err) {
      console.warn("Submit feedback error:", err);
      setShowSubmitModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const displayScore = csiScore?.csiScore || csiScore?.score || 4.2;
  const displayTotal = csiScore?.totalResponses || csiScore?.count || 8;

  const displayedFeedback = recentFeedback.filter(f => {
    if (activeSubTab === 'CSI') return f.type === 'CSI';
    if (activeSubTab === 'NPS') return f.type === 'NPS';
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl p-4 shadow-xs border border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            Customer Feedback & CSI Score {activeSubTab !== 'Overview' && `(${activeSubTab})`}
          </h2>
          <p className="text-[11px] text-gray-500">
            Customer experience metrics for <span className="font-semibold text-gray-800">{customerName}</span> (Cust #{customerNumber})
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="bg-blue-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg hover:bg-blue-700 shadow-2xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <FaPlus className="text-[10px]" /> Submit CSI Feedback
        </button>
      </div>

      {/* Submit Feedback Modal / Inline Form */}
      {showSubmitModal && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs animate-fade-in space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-blue-200">
            <span className="font-bold text-blue-950 text-xs">Submit Feedback Response Payload</span>
            <button onClick={() => setShowSubmitModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
          </div>

          <form onSubmit={handleSubmitFeedback} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-700 mb-1">Survey ID</label>
              <input
                type="text"
                value={surveyId}
                onChange={(e) => setSurveyId(e.target.value)}
                required
                className="w-full p-2 bg-white border border-gray-300 rounded-lg font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-700 mb-1">Feedback Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold"
              >
                <option value="CSI">CSI</option>
                <option value="NPS">NPS</option>
                <option value="GENERAL">GENERAL</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-700 mb-1">Customer Number</label>
              <input
                type="text"
                value={customerNumber}
                disabled
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg font-mono font-semibold text-gray-600"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[10px] font-bold text-gray-700 mb-1">Comments / Customer Voice</label>
              <textarea
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                required
                className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs leading-relaxed"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-blue-200">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer"
              >
                {submitting ? <FaSpinner className="animate-spin text-xs" /> : <FaPaperPlane className="text-xs" />}
                <span>POST Feedback Response</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider block">CSI Score</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{displayScore}</span>
            <span className="text-gray-400 font-bold text-xs">/ 5</span>
          </div>
          <div className="flex text-amber-400 text-xs my-1">
            <FaStar /><FaStar /><FaStar /><FaStar /><FaStar className="opacity-40" />
          </div>
          <span className="text-[10px] text-gray-400 font-medium">Based on {displayTotal} responses</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider block">NPS Score</span>
          <div className="mt-1 text-2xl font-black text-emerald-600">+35</div>
          <div className="mt-1 text-[10px] space-y-0.5 font-semibold text-gray-600">
            <div className="flex justify-between"><span>Promoters</span><span className="text-emerald-600">60%</span></div>
            <div className="flex justify-between"><span>Detractors</span><span className="text-rose-600">25%</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider block">Lost Sales</span>
          <div className="mt-2 text-2xl font-black text-gray-900">{lostSalesDetails.length}</div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            Tracked Records
          </span>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider block">Total Feedbacks</span>
          <div className="mt-2 text-2xl font-black text-blue-600">{recentFeedback.length}</div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <FaCheckCircle className="text-[9px]" /> Synced
          </span>
        </div>
      </div>

      {/* View: Lost Sales Analysis */}
      {activeSubTab === 'Lost Sales Analysis' ? (
        <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Lost Sales Analysis & Reasons</h3>
            <span className="text-xs text-gray-500 font-semibold">{lostSalesDetails.length} Records</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reasons List */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-gray-900 block text-xs mb-1">Lost Sales Reasons</span>
              {lostSalesReasons.map((r, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded text-[10px]">{r.code || 'REASON'}</span>
                    <span className="text-gray-800 font-medium">{r.description || r.reason}</span>
                  </div>
                  {r.percentage && <span className="font-bold text-gray-900 text-xs">{r.percentage}</span>}
                </div>
              ))}
            </div>

            {/* Customer Lost Sales Table */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-gray-900 block text-xs mb-1">Customer Lost Opportunities</span>
              {lostSalesDetails.map((det, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded border border-gray-200 text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-blue-600 font-mono">{det.enquiryNumber || `ENQ-${idx+100}`}</span>
                    <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.2 rounded">LOST</span>
                  </div>
                  <div className="text-gray-900 font-semibold">{det.model || 'BMW Vehicle'}</div>
                  <div className="text-gray-500 text-[10px]">Reason: {det.reason || 'Price / Competitor'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* View: Default / CSI / NPS Feedback Table */
        <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 flex flex-col justify-between text-xs">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
              <h3 className="font-bold text-gray-900 text-sm">Feedback Payload List ({activeSubTab})</h3>
              <span className="text-xs text-gray-400 font-semibold">{displayedFeedback.length} Records</span>
            </div>

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
                <FaSpinner className="animate-spin text-xl text-blue-600" />
                <span className="text-xs font-medium">Loading feedback details...</span>
              </div>
            ) : displayedFeedback.length === 0 ? (
              <div className="py-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No feedback records found for filter: {activeSubTab}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[9px] border-b border-gray-100">
                    <tr>
                      <th className="py-2.5 px-2">Type</th>
                      <th className="py-2.5 px-2">Reference / Survey ID</th>
                      <th className="py-2.5 px-2">Score</th>
                      <th className="py-2.5 px-2">Feedback / Comments</th>
                      <th className="py-2.5 px-2">Date</th>
                      <th className="py-2.5 px-2">Channel</th>
                      <th className="py-2.5 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
                    {displayedFeedback.map((f, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-2.5 px-2">
                          <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                            f.type === 'CSI' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {f.type || 'CSI'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-mono font-bold text-gray-800">{f.surveyId || f.ref || 'CSI-2026'}</td>
                        <td className="py-2.5 px-2 font-black">
                          <span className={f.isGood !== false ? 'text-emerald-600' : 'text-rose-500'}>
                            {f.score || '4 / 5'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-gray-600 max-w-[250px] truncate">{f.comments || f.comment || 'N/A'}</td>
                        <td className="py-2.5 px-2 text-gray-400 text-[10px] font-mono">{f.submittedDate || f.date || 'N/A'}</td>
                        <td className="py-2.5 px-2 text-gray-500">{f.channel || 'SMS'}</td>
                        <td className="py-2.5 px-2">
                          <span className="bg-emerald-100 text-emerald-700 font-bold text-[10px] px-1.5 py-0.2 rounded uppercase">
                            {f.status || 'COMPLETED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
