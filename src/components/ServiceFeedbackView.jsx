import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaStar, 
  FaCommentAlt, 
  FaSpinner, 
  FaRedo, 
  FaUserCheck, 
  FaCalendarAlt, 
  FaSmile,
  FaFrown,
  FaMeh,
  FaInfoCircle,
  FaTag
} from 'react-icons/fa';

export default function ServiceFeedbackView() {
  const { customer, group: contextGroup } = useCustomer();
  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || "");
  const customerNumber = customer?.customerNumber || customer?.id || "";

  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    if (!customerNumber) {
      setFeedbackList([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const apiUrl = `/api/v1/customers/${group}/${customerNumber}/service-feedback`;
      const res = await apiFetch(apiUrl);
      if (res && res.ok && Array.isArray(res.data)) {
        setFeedbackList(res.data);
      } else if (res && res.ok && res.data && Array.isArray(res.data.feedback)) {
        setFeedbackList(res.data.feedback);
      } else {
        setFeedbackList([]);
      }
    } catch (err) {
      console.warn("Failed to fetch service feedback:", err);
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [group, customerNumber]);

  const renderStars = (rating) => {
    if (rating === undefined || rating === null || rating === '' || isNaN(Number(rating))) {
      return null;
    }
    const r = Number(rating);
    if (r <= 0) return null;

    return (
      <div className="flex items-center gap-0.5 text-amber-400" title={`Rating: ${r}/5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar key={star} className={star <= r ? "text-amber-400 text-xs" : "text-gray-200 text-xs"} />
        ))}
      </div>
    );
  };

  const getSentimentBadge = (sentiment, score) => {
    const hasScore = score !== undefined && score !== null && score !== '' && !isNaN(Number(score));
    const sc = hasScore ? Number(score) : null;
    const s = (sentiment || '').toLowerCase();

    if (sc !== null) {
      if (s.includes('promoter') || sc >= 9) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <FaSmile className="text-emerald-600" /> Promoter ({sc}/10)
          </span>
        );
      } else if (s.includes('passive') || (sc >= 7 && sc <= 8)) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <FaMeh className="text-amber-600" /> Passive ({sc}/10)
          </span>
        );
      } else {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <FaFrown className="text-rose-600" /> Detractor ({sc}/10)
          </span>
        );
      }
    }

    if (s) {
      if (s.includes('promoter') || s.includes('positive')) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <FaSmile className="text-emerald-600" /> Positive Feedback
          </span>
        );
      } else if (s.includes('passive') || s.includes('neutral')) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <FaMeh className="text-amber-600" /> Neutral Feedback
          </span>
        );
      } else if (s.includes('detractor') || s.includes('negative')) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <FaFrown className="text-rose-600" /> Negative Feedback
          </span>
        );
      }
    }

    // Default neutral tag when score/sentiment is omitted in API response
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
        <FaTag className="text-blue-500 text-[9px]" /> Service Feedback
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-200 flex flex-col gap-4 text-xs">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100">
            <FaCommentAlt className="text-base" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 leading-tight">Customer Service Feedback & CSI</h2>
              {feedbackList.length > 0 && (
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-indigo-200">
                  {feedbackList.length} {feedbackList.length === 1 ? 'Record' : 'Records'}
                </span>
              )}
            </div>
            <span className="text-[11px] text-gray-500 font-mono block mt-0.5">
              Keyloop Group: <strong className="text-gray-700">{group}</strong> {customerNumber ? `| Customer #${customerNumber}` : ''}
            </span>
          </div>
        </div>

        <button 
          onClick={fetchFeedback}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium cursor-pointer transition-all self-start sm:self-auto text-xs border border-gray-300"
          title="Refresh Service Feedback"
        >
          <FaRedo className={`text-xs ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
          <FaSpinner className="animate-spin text-2xl text-indigo-600" />
          <span className="text-xs font-medium text-gray-600">Fetching customer service feedback from API...</span>
        </div>
      ) : feedbackList.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300 space-y-1">
          <FaInfoCircle className="mx-auto text-2xl text-gray-400 mb-2" />
          <p className="font-bold text-xs text-gray-800">No Service Feedback Found</p>
          <p className="text-[11px] text-gray-500 max-w-md mx-auto">
            There are no CSI feedback entries or service survey submissions recorded for customer <strong className="font-mono">#{customerNumber}</strong> in group <strong className="font-mono">{group}</strong>.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {feedbackList.map((item, idx) => {
            const hasBooking = item.bookingId && String(item.bookingId).trim() !== '';
            const advisor = item.advisor || item.serviceAdvisor;
            const hasAdvisor = advisor && advisor !== 'N/A' && String(advisor).trim() !== '';
            const submittedDate = item.submittedDate || item.createdDate || item.createdAt;

            return (
              <div 
                key={item.feedbackId || idx} 
                className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-all flex flex-col gap-2.5 shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-indigo-600 text-xs bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {item.feedbackId || `FB-${idx+1}`}
                    </span>
                    
                    {hasBooking && (
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                        Booking ID: #{item.bookingId}
                      </span>
                    )}

                    {getSentimentBadge(item.sentiment, item.score)}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1 font-mono text-gray-600 font-medium">
                      <FaCalendarAlt className="text-gray-400 text-[11px]" /> Service Date: <strong className="text-gray-800">{item.date || item.serviceDate || 'N/A'}</strong>
                    </span>
                    {renderStars(item.rating)}
                  </div>
                </div>

                <p className="text-xs text-gray-900 leading-relaxed font-normal bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs">
                  "{item.feedback || item.comment || 'No written feedback comments provided.'}"
                </p>

                {(hasAdvisor || submittedDate) && (
                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5 font-medium">
                    {hasAdvisor ? (
                      <span className="flex items-center gap-1">
                        <FaUserCheck className="text-gray-400" /> Service Advisor: <strong className="text-gray-800">{advisor}</strong>
                      </span>
                    ) : <span />}
                    
                    {submittedDate ? (
                      <span>Submitted: {submittedDate}</span>
                    ) : <span />}
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

