import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaStar, 
  FaCheckCircle, 
  FaSpinner, 
  FaPlus, 
  FaPaperPlane,
  FaChartLine,
  FaTag,
  FaComments
} from 'react-icons/fa';

export default function FeedbackOverviewView({ activeSubTab = 'Overview' }) {
  const { customer, getFormattedName } = useCustomer();
  const customerName = getFormattedName();
  const group = customer?.keyloopGroup || "";
  const customerNumber = customer?.customerNumber || customer?.id || "";

  const [csiScore, setCsiScore] = useState(null);
  const [csiResponses, setCsiResponses] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [lostSalesReasons, setLostSalesReasons] = useState([]);
  const [lostSalesDetails, setLostSalesDetails] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submit Feedback Form State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [surveyId, setSurveyId] = useState("CSI-2026-01");
  const [type, setType] = useState("CSI");
  const [comments, setComments] = useState("");

  const fetchFeedbackData = async () => {
    if (!customerNumber) {
      setLoading(false);
      return;
    }
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
      if (feedbackRes && feedbackRes.ok && Array.isArray(feedbackRes.data)) {
        setRecentFeedback(feedbackRes.data);
      } else {
        setRecentFeedback([]);
      }

      // 4. Lost Sales Reasons: GET /api/v1/lost-sales/reasons?group={group}&branch={branchCode}
      const reasonsRes = await apiFetch(`/api/v1/lost-sales/reasons?group=${group}&branch=${customer?.branchCode || '10'}`);
      const reasonsArray = Array.isArray(reasonsRes?.data) 
        ? reasonsRes.data 
        : (Array.isArray(reasonsRes?.data?.reasons) ? reasonsRes.data.reasons : []);
      setLostSalesReasons(reasonsArray);

      // 5. Lost Sales Details: GET /api/v1/lost-sales?group={group}&customerNumber={customerNumber}
      const lostDetailsRes = await apiFetch(`/api/v1/lost-sales?group=${group}&customerNumber=${customerNumber}`);
      if (lostDetailsRes && lostDetailsRes.ok && Array.isArray(lostDetailsRes.data)) {
        setLostSalesDetails(lostDetailsRes.data);
      } else {
        setLostSalesDetails([]);
      }

      // 6. Service Bookings: GET /api/v1/customers/{group}/{customerNumber}/service-bookings?from=2026-01-01&to=2026-12-31
      const bookingsRes = await apiFetch(`/api/v1/customers/${group}/${customerNumber}/service-bookings?from=2026-01-01&to=2026-12-31`);
      if (bookingsRes && bookingsRes.ok && Array.isArray(bookingsRes.data)) {
        setBookings(bookingsRes.data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.warn("Failed to fetch feedback endpoints:", err);
      setCsiScore(null);
      setCsiResponses([]);
      setRecentFeedback([]);
      setLostSalesReasons([]);
      setLostSalesDetails([]);
      setBookings([]);
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
      setComments("");
    } catch (err) {
      console.warn("Submit feedback error:", err);
      setShowSubmitModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  // CSI Score calculation - strictly from API, no fake fallbacks
  const hasCsiScore = csiScore?.csiScore !== undefined && 
                      csiScore?.csiScore !== null && 
                      csiScore?.csiScore !== '' && 
                      !isNaN(Number(csiScore?.csiScore));
  const numericCsiScore = hasCsiScore ? Number(csiScore.csiScore) : null;

  const hasResponseCount = csiScore?.responseCount !== undefined && 
                           csiScore?.responseCount !== null && 
                           csiScore?.responseCount !== '' && 
                           !isNaN(Number(csiScore?.responseCount));
  const responseCount = hasResponseCount ? Number(csiScore.responseCount) : csiResponses.length;

  // NPS Score calculation - strictly from API records, no hardcoded +35
  const npsRecords = recentFeedback.filter(f => 
    (f.type || '').toUpperCase() === 'NPS' || 
    (f.npsScore !== undefined && f.npsScore !== null && f.npsScore !== '')
  );
  const hasNps = npsRecords.length > 0;
  let npsScoreDisplay = '-';
  let promotersPct = 0;
  let detractorsPct = 0;
  if (hasNps) {
    const scores = npsRecords
      .map(f => Number(f.npsScore || f.score || 0))
      .filter(s => !isNaN(s));
    if (scores.length > 0) {
      const promoters = scores.filter(s => s >= 9).length;
      const detractors = scores.filter(s => s <= 6).length;
      promotersPct = Math.round((promoters / scores.length) * 100);
      detractorsPct = Math.round((detractors / scores.length) * 100);
      const npsVal = promotersPct - detractorsPct;
      npsScoreDisplay = npsVal > 0 ? `+${npsVal}` : `${npsVal}`;
    }
  }

  // Combined feedback list for tables
  const allFeedback = [
    ...recentFeedback,
    ...csiResponses.map(cr => ({
      type: 'CSI',
      surveyId: cr.responseId || cr.id || cr.surveyId || '—',
      score: cr.score || '',
      comments: cr.comments || cr.comment || '—',
      submittedDate: cr.date || cr.submittedDate || '—',
      channel: cr.channel || '—',
      status: cr.status || 'RECORDED',
      origin: 'KEYLOOP'
    }))
  ];

  const displayedFeedback = allFeedback.filter(f => {
    if (activeSubTab === 'CSI') return (f.type || '').toUpperCase() === 'CSI';
    if (activeSubTab === 'NPS') return (f.type || '').toUpperCase() === 'NPS' || f.npsScore !== undefined;
    return true;
  });

  const displayedBookings = bookings;

  const getSubTabHeading = () => {
    switch (activeSubTab) {
      case 'CSI': return 'CSI Survey Responses';
      case 'NPS': return 'Net Promoter Score (NPS) Responses';
      case 'Lost Sales Analysis': return 'Lost Sales Analysis & Reasons';
      case 'Open Bookings': return 'Open Workshop Bookings';
      default: return 'Customer Feedback';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            {getSubTabHeading()}
          </h2>
          <p className="text-[11px] text-gray-500">
            Customer experience metrics for <span className="font-semibold text-gray-800">{customerName || 'Customer'}</span> (Cust #{customerNumber || 'N/A'})
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="bg-blue-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg hover:bg-blue-700 shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <FaPlus className="text-[10px]" /> Submit Feedback
        </button>
      </div>

      {/* Submit Feedback Modal / Inline Form */}
      {showSubmitModal && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs animate-fade-in space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-blue-200">
            <span className="font-bold text-blue-950 text-xs">Submit Feedback Response Payload</span>
            <button onClick={() => setShowSubmitModal(false)} className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer">✕</button>
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
                placeholder="Enter feedback comments..."
                className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs leading-relaxed"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-blue-200">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? <FaSpinner className="animate-spin text-xs" /> : <FaPaperPlane className="text-xs" />}
                <span>POST Feedback Response</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Top Metric Cards - Shown ONLY on Overview Tab */}
      {activeSubTab === 'Overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CSI Score Card */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-bold text-[11px] uppercase tracking-wider block">CSI Score</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-2xs">
                  <FaStar className="text-xs" />
                </div>
              </div>

              <div className="mt-2.5 flex items-baseline gap-2">
                {hasCsiScore ? (
                  <>
                    <span className="text-2xl sm:text-3xl font-black text-gray-900">{numericCsiScore.toFixed(1)}</span>
                    <span className="text-gray-400 font-bold text-xs">/ 5</span>
                  </>
                ) : (
                  <span className="text-2xl sm:text-3xl font-black text-gray-400">-</span>
                )}
                {csiScore?.trend && (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 ml-auto">
                    {csiScore.trend}
                  </span>
                )}
              </div>

              {hasCsiScore && (
                <div className="flex text-amber-400 text-xs my-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={star <= Math.round(numericCsiScore) ? 'text-amber-400' : 'text-gray-200'}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span className="font-medium">
                {responseCount > 0 ? `Based on ${responseCount} response${responseCount === 1 ? '' : 's'}` : '0 responses recorded'}
              </span>
            </div>
          </div>

          {/* NPS Score Card */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-bold text-[11px] uppercase tracking-wider block">NPS Score</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
                  <FaChartLine className="text-xs" />
                </div>
              </div>

              <div className="mt-2.5 flex items-baseline gap-2">
                {hasNps ? (
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600">{npsScoreDisplay}</span>
                ) : (
                  <span className="text-2xl sm:text-3xl font-black text-gray-400">-</span>
                )}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-500">
              {hasNps ? (
                <div className="space-y-0.5 font-semibold text-gray-600">
                  <div className="flex justify-between"><span>Promoters</span><span className="text-emerald-600">{promotersPct}%</span></div>
                  <div className="flex justify-between"><span>Detractors</span><span className="text-rose-600">{detractorsPct}%</span></div>
                </div>
              ) : (
                <span className="font-medium">0 responses recorded</span>
              )}
            </div>
          </div>

          {/* Lost Sales Card */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-bold text-[11px] uppercase tracking-wider block">Lost Sales</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shadow-2xs">
                  <FaTag className="text-xs" />
                </div>
              </div>

              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-gray-900">{lostSalesDetails.length}</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span className="font-medium text-gray-600">Tracked Records</span>
              {lostSalesDetails.length > 0 && (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                  Keyloop
                </span>
              )}
            </div>
          </div>

          {/* Total Feedbacks Card */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-bold text-[11px] uppercase tracking-wider block">Total Feedbacks</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
                  <FaComments className="text-xs" />
                </div>
              </div>

              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-blue-600">{allFeedback.length}</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                <FaCheckCircle className="text-[10px] text-emerald-600" /> Synced from Keyloop
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area based on activeSubTab */}
      {activeSubTab === 'Lost Sales Analysis' ? (
        /* View: Lost Sales Analysis */
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Lost Sales Analysis & Reasons</h3>
            <span className="text-xs text-gray-500 font-semibold">{lostSalesDetails.length} Records</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reasons List */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-gray-900 block text-xs mb-1">Lost Sales Reasons</span>
              {lostSalesReasons.length === 0 ? (
                <div className="py-6 text-center text-gray-400 italic text-xs">No lost sales reasons found for branch</div>
              ) : (
                <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                  {lostSalesReasons.map((r, idx) => {
                    const code = Array.isArray(r.reasonCodes) ? r.reasonCodes.join(', ') : (r.code || '');
                    return (
                      <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 text-xs">
                        <div className="flex items-center gap-2">
                          {code && <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded text-[10px]">{code}</span>}
                          <span className="text-gray-800 font-medium">{r.reason || r.description}</span>
                        </div>
                        {r.percentage ? <span className="font-bold text-gray-900 text-xs">{r.percentage}</span> : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Customer Lost Sales Opportunities */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-gray-900 block text-xs mb-1">Customer Lost Opportunities</span>
              {lostSalesDetails.length === 0 ? (
                <div className="py-6 text-center text-gray-400 italic text-xs">No lost sales records for this customer</div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {lostSalesDetails.map((det, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded border border-gray-200 text-xs space-y-1.5 shadow-2xs">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-blue-600 font-mono text-[11px]">Lead #{det.leadId || det.enquiryNumber || 'N/A'}</span>
                        <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.2 rounded font-bold">LOST</span>
                      </div>
                      <div className="text-gray-900 font-bold">{det.model || 'N/A'}</div>
                      <div className="text-gray-600 text-[11px]">
                        <span className="text-gray-400">Reason: </span>
                        <span className="font-medium">{det.reason || 'N/A'}</span>
                        {det.reasonCode && <span className="ml-1 text-[10px] font-mono text-gray-500 font-bold">({det.reasonCode})</span>}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-100 pt-1">
                        <span>Date: <span className="font-mono text-gray-600">{det.date || 'N/A'}</span></span>
                        <span>Branch: <span className="text-gray-600">{det.branch || 'N/A'}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeSubTab === 'Open Bookings' ? (
        /* View: Service Bookings from /service-bookings */
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200 flex flex-col justify-between text-xs">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
              <h3 className="font-bold text-gray-900 text-sm">{getSubTabHeading()}</h3>
              <span className="text-xs text-gray-400 font-semibold">{displayedBookings.length} Records</span>
            </div>

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
                <FaSpinner className="animate-spin text-xl text-blue-600" />
                <span className="text-xs font-medium">Loading bookings...</span>
              </div>
            ) : displayedBookings.length === 0 ? (
              <div className="py-10 text-center text-gray-400 bg-gray-50/70 rounded-xl border border-dashed border-gray-300 font-medium">
                No {activeSubTab.toLowerCase()} found for this customer.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[9px] border-b border-gray-100">
                    <tr>
                      <th className="py-2.5 px-2">WIP / Booking #</th>
                      <th className="py-2.5 px-2">Date</th>
                      <th className="py-2.5 px-2">Vehicle / VIN</th>
                      <th className="py-2.5 px-2">Service Advisor</th>
                      <th className="py-2.5 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
                    {displayedBookings.map((b, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-2.5 px-2 font-mono font-bold text-blue-600">{b.wipNumber || b.bookingId || b.id || '—'}</td>
                        <td className="py-2.5 px-2 font-mono text-gray-500">{b.date || b.bookingDate || '—'}</td>
                        <td className="py-2.5 px-2 font-semibold text-gray-900">{b.vehicle || b.vin || '—'}</td>
                        <td className="py-2.5 px-2 text-gray-600">{b.advisor || b.serviceAdvisor || '—'}</td>
                        <td className="py-2.5 px-2">
                          <span className={`font-bold text-[10px] px-1.5 py-0.2 rounded uppercase ${
                            (b.status || '').toLowerCase().includes('cancel') 
                              ? 'bg-rose-100 text-rose-700' 
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {b.status || 'ACTIVE'}
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
      ) : (
        /* View: Default / CSI / NPS Feedback Table */
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200 flex flex-col justify-between text-xs">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
              <h3 className="font-bold text-gray-900 text-sm">{getSubTabHeading()}</h3>
              <span className="text-xs text-gray-400 font-semibold">{displayedFeedback.length} Records</span>
            </div>

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
                <FaSpinner className="animate-spin text-xl text-blue-600" />
                <span className="text-xs font-medium">Loading feedback details...</span>
              </div>
            ) : displayedFeedback.length === 0 ? (
              <div className="py-10 text-center text-gray-400 bg-gray-50/70 rounded-xl border border-dashed border-gray-300 font-medium">
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
                            (f.type || '').toUpperCase() === 'CSI' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {f.type || 'FEEDBACK'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-mono font-bold text-gray-800">
                          {f.surveyId || f.ref || f.feedbackId || f.responseId || '—'}
                        </td>
                        <td className="py-2.5 px-2 font-black">
                          {f.score ? (
                            <span className={Number(f.score) >= 3 ? 'text-emerald-600' : 'text-rose-500'}>
                              {f.score} / 5
                            </span>
                          ) : (
                            <span className="text-gray-400 font-normal">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-gray-600 max-w-[250px] truncate">
                          {f.comments || f.comment || '—'}
                        </td>
                        <td className="py-2.5 px-2 text-gray-400 text-[10px] font-mono">
                          {f.submittedDate || f.date || '—'}
                        </td>
                        <td className="py-2.5 px-2 text-gray-500">
                          {f.channel || '—'}
                        </td>
                        <td className="py-2.5 px-2">
                          <span className="bg-emerald-100 text-emerald-700 font-bold text-[10px] px-1.5 py-0.2 rounded uppercase">
                            {f.status || 'RECORDED'}
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
