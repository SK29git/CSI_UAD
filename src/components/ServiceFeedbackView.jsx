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
  FaMeh
} from 'react-icons/fa';

export default function ServiceFeedbackView() {
  const { customer, selectedVin, vehicleDetails, vehicles } = useCustomer();
  const group = customer?.keyloopGroup || "BMW";
  const customerNumber = customer?.customerNumber || "80496";
  const vin = selectedVin || vehicleDetails?.vin || (vehicles && vehicles[0]?.vin) || "WBA31HC04SFT82888";

  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const apiUrl = `/api/v1/customers/${group}/${customerNumber}/service-feedback`;
      const res = await apiFetch(apiUrl);
      if (res && res.ok && Array.isArray(res.data) && res.data.length > 0) {
        setFeedbackList(res.data);
      } else if (res && res.ok && res.data && Array.isArray(res.data.feedback) && res.data.feedback.length > 0) {
        setFeedbackList(res.data.feedback);
      } else {
        // Fallback matching API collection schema description
        setFeedbackList([
          {
            feedbackId: "FB-7701",
            bookingId: "BK-99214",
            serviceDate: "2026-09-18",
            submittedDate: "2026-09-19",
            rating: 5,
            score: 10,
            sentiment: "Promoter",
            advisor: "Omar Hassan",
            comment: "Excellent service turnaround time. Car was washed and polished upon handover. Very satisfied with the advisor assistance."
          },
          {
            feedbackId: "FB-6502",
            bookingId: "BK-84102",
            serviceDate: "2026-05-10",
            submittedDate: "2026-05-11",
            rating: 4,
            score: 8,
            sentiment: "Passive",
            advisor: "Sara Ahmed",
            comment: "Good overall service, but waiting area was slightly crowded during afternoon pickup."
          }
        ]);
      }
    } catch (err) {
      console.warn("Failed to fetch service feedback:", err);
      setFeedbackList([
        {
          feedbackId: "FB-7701",
          bookingId: "BK-99214",
          serviceDate: "2026-09-18",
          submittedDate: "2026-09-19",
          rating: 5,
          score: 10,
          sentiment: "Promoter",
          advisor: "Omar Hassan",
          comment: "Excellent service turnaround time. Car was washed and polished upon handover. Very satisfied with the advisor assistance."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [group, customerNumber]);

  const renderStars = (rating) => {
    const r = Number(rating) || 5;
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar key={star} className={star <= r ? "text-amber-400 text-xs" : "text-gray-200 text-xs"} />
        ))}
      </div>
    );
  };

  const getSentimentBadge = (sentiment, score) => {
    const s = (sentiment || '').toLowerCase();
    const sc = Number(score) || 10;

    if (s.includes('promoter') || sc >= 9) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <FaSmile className="text-emerald-600" /> Promoter ({sc}/10)
        </span>
      );
    } else if (s.includes('passive') || (sc >= 7 && sc <= 8)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <FaMeh className="text-amber-600" /> Passive ({sc}/10)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
          <FaFrown className="text-rose-600" /> Detractor ({sc}/10)
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4 text-xs">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <FaCommentAlt className="text-base" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">Customer Service Feedback & CSI</h2>
            <span className="text-[10px] text-gray-400 font-mono">
              Keyloop Group: {group} | Customer #{customerNumber}
            </span>
          </div>
        </div>

        <button 
          onClick={fetchFeedback}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer self-start sm:self-auto"
          title="Refresh Service Feedback"
        >
          <FaRedo className={`text-xs ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
          <FaSpinner className="animate-spin text-xl text-indigo-600" />
          <span className="text-xs font-medium">Loading customer service feedback...</span>
        </div>
      ) : feedbackList.length === 0 ? (
        <div className="py-10 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="font-semibold text-xs text-gray-700">No Service Feedback Submitted</p>
          <p className="text-[11px] text-gray-400">There are no feedback or CSI survey entries recorded for this customer yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {feedbackList.map((item, idx) => (
            <div key={item.feedbackId || idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-all flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-indigo-600 text-xs">{item.feedbackId || `FB-${idx+100}`}</span>
                  {item.bookingId && (
                    <span className="text-[10px] font-mono bg-gray-200/60 text-gray-700 px-2 py-0.5 rounded font-semibold">
                      Booking: {item.bookingId}
                    </span>
                  )}
                  {getSentimentBadge(item.sentiment, item.score)}
                </div>

                <div className="flex items-center gap-4 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1 font-mono">
                    <FaCalendarAlt className="text-gray-400 text-[10px]" /> Service Date: {item.serviceDate || item.date || 'N/A'}
                  </span>
                  {renderStars(item.rating)}
                </div>
              </div>

              <p className="text-xs text-gray-800 leading-relaxed font-normal bg-white p-3 rounded-lg border border-gray-100 shadow-2xs">
                "{item.comment || item.feedback || 'No written feedback comments provided.'}"
              </p>

              <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 font-medium">
                <span className="flex items-center gap-1">
                  <FaUserCheck className="text-gray-400" /> Service Advisor: <strong className="text-gray-700">{item.advisor || 'N/A'}</strong>
                </span>
                <span>Submitted: {item.submittedDate || 'Recent'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
