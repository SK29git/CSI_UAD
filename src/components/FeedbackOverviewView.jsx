import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  FaComments,
  FaEye,
  FaTimes,
  FaInfoCircle,
  FaWrench,
  FaCar,
  FaChartPie,
  FaClipboardList,
  FaFilter,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdCard,
  FaBuilding,
  FaCalendarAlt,
  FaTools
} from 'react-icons/fa';

// Standard Automotive Customer Survey Categories and Subcategories
export const SURVEY_STRUCTURE = {
  'Aftersales Survey': {
    label: 'Aftersales Survey',
    icon: FaWrench,
    subcategories: [
      { id: 'all', label: 'All Aftersales Surveys' },
      { id: 'workshop_quality', label: 'Workshop & Repair Quality', typeMatch: ['SERVICE', 'WORKSHOP', 'REPAIR'] },
      { id: 'service_advisor', label: 'Service Advisor Experience', typeMatch: ['ADVISOR', 'STAFF'] },
      { id: 'parts_availability', label: 'Parts & Accessories', typeMatch: ['PARTS'] },
      { id: 'timeliness_delivery', label: 'Timeliness & Vehicle Handover', typeMatch: ['DELIVERY', 'TIME'] },
      { id: 'service_csi', label: 'Service CSI', typeMatch: ['CSI', 'SERVICE_CSI'] },
    ]
  },
  'Sales Survey': {
    label: 'Sales Survey',
    icon: FaCar,
    subcategories: [
      { id: 'all', label: 'All Sales Surveys' },
      { id: 'showroom_experience', label: 'Showroom & Reception', typeMatch: ['SHOWROOM', 'SALES'] },
      { id: 'sales_executive', label: 'Sales Consultant Consultation', typeMatch: ['EXECUTIVE', 'CONSULTANT'] },
      { id: 'test_drive_feedback', label: 'Test Drive Feedback', typeMatch: ['TEST_DRIVE'] },
      { id: 'vehicle_delivery', label: 'New Vehicle Delivery (CSI)', typeMatch: ['DELIVERY', 'SALES_CSI'] },
      { id: 'lost_sales_survey', label: 'Lost Sales & Cancellation', typeMatch: ['LOST_SALE', 'CANCELLATION'] },
    ]
  },
  'Marketing Research': {
    label: 'Marketing Research',
    icon: FaChartPie,
    subcategories: [
      { id: 'all', label: 'All Marketing Research' },
      { id: 'brand_perception', label: 'Brand Perception & Loyalty', typeMatch: ['BRAND', 'LOYALTY'] },
      { id: 'nps_study', label: 'Net Promoter Score (NPS) Study', typeMatch: ['NPS'] },
      { id: 'campaign_awareness', label: 'Campaign & Media Awareness', typeMatch: ['CAMPAIGN', 'MEDIA'] },
      { id: 'competitor_benchmark', label: 'Competitive Benchmarking', typeMatch: ['COMPETITOR', 'BENCHMARK'] },
      { id: 'product_interest', label: 'Product Interest & EV Transition', typeMatch: ['PRODUCT', 'EV'] },
    ]
  }
};

export default function FeedbackOverviewView({ activeSubTab = 'Overview' }) {
  const { customer, vehicles, getFormattedName, group: contextGroup } = useCustomer();
  const customerName = getFormattedName();
  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || "");
  const customerNumber = customer?.customerNumber || customer?.id || "";

  const [csiScore, setCsiScore] = useState(null);
  const [csiResponses, setCsiResponses] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [serviceFeedback, setServiceFeedback] = useState([]);
  const [lostSalesReasons, setLostSalesReasons] = useState([]);
  const [lostSalesDetails, setLostSalesDetails] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Subcategory State (per main tab)
  const [selectedSubcategories, setSelectedSubcategories] = useState({
    'Aftersales Survey': 'all',
    'Sales Survey': 'all',
    'Marketing Research': 'all',
  });

  const currentCategoryDef = SURVEY_STRUCTURE[activeSubTab] || null;
  const currentSubcatId = currentCategoryDef ? (selectedSubcategories[activeSubTab] || 'all') : 'all';

  // Feedback Details Modal State (Postman API 4)
  const [selectedFeedbackDetails, setSelectedFeedbackDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

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

      // 5. Lost Sales Details: GET /api/v1/lost-sales?group={group}&customerNumber={customerNumber}&from=2012-01-01&to=2026-12-31
      const lostDetailsRes = await apiFetch(`/api/v1/lost-sales?group=${group}&customerNumber=${customerNumber}&from=2012-01-01&to=2026-12-31`);
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

      // 7. Service Feedback: GET /api/v1/customers/{group}/{customerNumber}/service-feedback
      const serviceFeedbackRes = await apiFetch(`/api/v1/customers/${group}/${customerNumber}/service-feedback`);
      if (serviceFeedbackRes && serviceFeedbackRes.ok && Array.isArray(serviceFeedbackRes.data)) {
        setServiceFeedback(serviceFeedbackRes.data);
      } else {
        setServiceFeedback([]);
      }
    } catch (err) {
      console.warn("Failed to fetch feedback endpoints:", err);
      setCsiScore(null);
      setCsiResponses([]);
      setRecentFeedback([]);
      setServiceFeedback([]);
      setLostSalesReasons([]);
      setLostSalesDetails([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFeedbackDetails = async (f) => {
    const fId = f.feedbackId || f.id;
    if (!fId || String(fId).startsWith('SF-') || String(fId).startsWith('CR-')) {
      setSelectedFeedbackDetails(f);
      return;
    }
    setDetailsLoading(true);
    try {
      const res = await apiFetch(`/api/v1/feedback/${group}/${fId}`);
      if (res && res.ok && res.data) {
        setSelectedFeedbackDetails(res.data);
      } else {
        setSelectedFeedbackDetails(f);
      }
    } catch {
      setSelectedFeedbackDetails(f);
    } finally {
      setDetailsLoading(false);
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

  // Combined feedback list for tables from Keyloop API
  const allFeedback = [
    ...recentFeedback.map(rf => ({
      ...rf,
      feedbackId: rf.feedbackId || rf.id || '',
      type: rf.type || 'GENERAL',
      surveyId: rf.feedbackId || rf.survey || rf.surveyId || '—',
      score: rf.score || '',
      comments: rf.comments || rf.comment || '—',
      submittedDate: rf.date || rf.submittedDate || '—',
      channel: rf.channel || '—',
      status: rf.status || 'RECORDED',
      origin: rf.origin || 'DESKTOP'
    })),
    ...csiResponses.map((cr, idx) => ({
      feedbackId: cr.responseId || `CR-${idx + 1}`,
      type: 'CSI',
      surveyId: cr.responseId || cr.id || cr.surveyId || 'CSI Survey',
      score: cr.score || '',
      comments: cr.comments || cr.comment || '—',
      submittedDate: cr.date || cr.submittedDate || '—',
      channel: cr.channel || '—',
      status: cr.status || 'RECORDED',
      origin: cr.origin || 'KEYLOOP'
    })),
    ...serviceFeedback.map((sf, idx) => ({
      feedbackId: sf.bookingId ? `SF-${sf.bookingId}` : `SF-${idx + 1}`,
      type: 'SERVICE',
      surveyId: sf.bookingId ? `Booking #${sf.bookingId}` : 'Service CSI',
      score: sf.score || sf.rating || '',
      comments: sf.feedback || sf.comments || '—',
      submittedDate: sf.date || '—',
      channel: 'Workshop',
      status: 'RECORDED',
      origin: 'KEYLOOP'
    }))
  ];

  const displayedFeedback = allFeedback.filter(f => {
    const fType = String(f.type || '').toUpperCase();
    const commentsUpper = String(f.comments || '').toUpperCase();
    const surveyIdUpper = String(f.surveyId || '').toUpperCase();

    if (activeSubTab === 'Aftersales Survey') {
      const isAftersales = fType === 'SERVICE' || fType === 'CSI' || f.origin === 'KEYLOOP' || commentsUpper.includes('SERVICE') || commentsUpper.includes('WORKSHOP') || commentsUpper.includes('REPAIR');
      if (!isAftersales && fType !== 'GENERAL') return false;

      if (currentSubcatId && currentSubcatId !== 'all') {
        const sub = currentCategoryDef?.subcategories.find(s => s.id === currentSubcatId);
        if (sub?.typeMatch) {
          const match = sub.typeMatch.some(m => fType.includes(m) || commentsUpper.includes(m) || surveyIdUpper.includes(m));
          return match;
        }
      }
      return true;
    }

    if (activeSubTab === 'Sales Survey') {
      const isSales = fType === 'SALES' || commentsUpper.includes('SALES') || commentsUpper.includes('SHOWROOM') || commentsUpper.includes('TEST DRIVE') || commentsUpper.includes('DELIVERY') || fType === 'GENERAL';
      if (!isSales) return false;

      if (currentSubcatId && currentSubcatId !== 'all') {
        const sub = currentCategoryDef?.subcategories.find(s => s.id === currentSubcatId);
        if (sub?.typeMatch) {
          const match = sub.typeMatch.some(m => fType.includes(m) || commentsUpper.includes(m) || surveyIdUpper.includes(m));
          return match;
        }
      }
      return true;
    }

    if (activeSubTab === 'Marketing Research') {
      const isMktg = fType === 'NPS' || f.npsScore !== undefined || commentsUpper.includes('BRAND') || commentsUpper.includes('CAMPAIGN') || commentsUpper.includes('MARKETING') || fType === 'GENERAL';
      if (!isMktg) return false;

      if (currentSubcatId && currentSubcatId !== 'all') {
        const sub = currentCategoryDef?.subcategories.find(s => s.id === currentSubcatId);
        if (sub?.typeMatch) {
          const match = sub.typeMatch.some(m => fType.includes(m) || commentsUpper.includes(m) || surveyIdUpper.includes(m));
          return match;
        }
      }
      return true;
    }

    return true;
  });

  const displayedBookings = bookings;

  const getSubTabHeading = () => {
    switch (activeSubTab) {
      case 'Aftersales Survey': return 'Aftersales Survey & Service Feedback';
      case 'Sales Survey': return 'Sales Experience & Delivery Survey';
      case 'Marketing Research': return 'Marketing Research & Brand Perception';
      default: return 'Customer Survey';
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
            Customer experience metrics for <span className="font-semibold text-gray-800">{customerName || '-'}</span> (Cust #{customerNumber || '-'})
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="bg-blue-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg hover:bg-blue-700 shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <FaPlus className="text-[10px]" /> Submit Survey
        </button>
      </div>

      {/* Submit Feedback Modal / Inline Form */}
      {showSubmitModal && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs animate-fade-in space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-blue-200">
            <span className="font-bold text-blue-950 text-xs">Submit Survey Response</span>
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
              <label className="block text-[10px] font-bold text-gray-700 mb-1">Survey Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold"
              >
                <option value="AFTERSALES">Aftersales Survey</option>
                <option value="SALES">Sales Survey</option>
                <option value="MARKETING">Marketing Research</option>
                <option value="CSI">CSI</option>
                <option value="NPS">NPS</option>
                <option value="GENERAL">General</option>
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
                <span>POST Survey Response</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Top Metric Cards removed per user request */}

      {/* OVERVIEW TAB: Split Section - Left Customer Details & Right Vehicle Details */}
      {activeSubTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* LEFT SECTION: Full Customer Details from API */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-200 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-xs">
                  {customer?.initials || <FaUser />}
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-xs sm:text-sm">Customer Profile Details</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Complete record retrieved from customer profile API</p>
                </div>
              </div>
              <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Cust #{customerNumber || '-'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Full Name</span>
                <span className="font-extrabold text-gray-800 text-xs block truncate" title={customerName || customer?.fullName || '-'}>
                  {customerName || customer?.fullName || [customer?.firstName, customer?.middleName, customer?.surname].filter(Boolean).join(" ") || '-'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Initials</span>
                <span className="font-mono font-bold text-gray-800 text-xs block">
                  {customer?.initials || '-'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Customer / Prospect ID</span>
                <span className="font-mono font-bold text-gray-800 text-xs block">
                  {customerNumber || customer?.prospectNumber || customer?.id || '-'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Personal ID</span>
                <span className="font-mono font-bold text-gray-800 text-xs block">
                  {customer?.personalId || customer?.idCardNumber || '-'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Salutation / Type</span>
                <span className="font-bold text-gray-800 text-xs block">
                  {[customer?.salutation, customer?.customerType || (customer?.isProspect ? 'Prospect' : null)].filter(Boolean).join(' • ') || '-'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Mobile Number</span>
                <span className="font-mono font-bold text-gray-800 text-xs flex items-center gap-1.5">
                  <FaPhoneAlt className="text-gray-400 text-[10px]" />
                  <span>{customer?.mobile || customer?.mobileRaw || '-'}</span>
                </span>
              </div>

              {/* Secondary Phones (Only if non-null and not duplicate of primary) */}
              {(() => {
                const secondary = [
                  customer?.phone2 && customer.phone2 !== customer?.mobile ? `P2: ${customer.phone2}` : null,
                  customer?.phone3 && customer.phone3 !== customer?.mobile ? `P3: ${customer.phone3}` : null,
                  customer?.phone4 && customer.phone4 !== customer?.mobile && !String(customer?.mobile || '').endsWith(String(customer.phone4).slice(-4)) ? `P4: ${customer.phone4}` : null,
                  customer?.homePhone && customer.homePhone !== customer?.mobile ? `Home: ${customer.homePhone}` : null,
                  customer?.workPhone && customer.workPhone !== customer?.mobile ? `Work: ${customer.workPhone}` : null
                ].filter(Boolean);
                const uniqueSec = Array.from(new Set(secondary));
                if (uniqueSec.length === 0) return null;
                return (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Other Phone Numbers</span>
                    <span className="font-semibold text-gray-800 text-xs block truncate" title={uniqueSec.join(' | ')}>
                      {uniqueSec.join(' | ')}
                    </span>
                  </div>
                );
              })()}

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Primary Email</span>
                <span className="font-bold text-gray-800 text-xs flex items-center gap-1.5 truncate">
                  <FaEnvelope className="text-gray-400 text-[10px]" />
                  <span className="truncate">{customer?.email || '-'}</span>
                </span>
              </div>

              {/* Secondary Emails (Only if non-null and not duplicate of primary) */}
              {(() => {
                const secondary = [
                  customer?.homeEmail && customer.homeEmail.toLowerCase() !== String(customer?.email || '').toLowerCase() ? `${customer.homeEmailDescription || 'Home'}: ${customer.homeEmail}` : null,
                  customer?.workEmail && customer.workEmail.toLowerCase() !== String(customer?.email || '').toLowerCase() ? `${customer.workEmailDescription || 'Work'}: ${customer.workEmail}` : null,
                  customer?.otherEmail1 && customer.otherEmail1.toLowerCase() !== String(customer?.email || '').toLowerCase() ? `${customer.otherEmail1Description || 'Other 1'}: ${customer.otherEmail1}` : null,
                  customer?.otherEmail2 && customer.otherEmail2.toLowerCase() !== String(customer?.email || '').toLowerCase() ? `${customer.otherEmail2Description || 'Other 2'}: ${customer.otherEmail2}` : null
                ].filter(Boolean);
                const uniqueSec = Array.from(new Set(secondary));
                if (uniqueSec.length === 0) return null;
                return (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Other Emails</span>
                    <span className="font-semibold text-gray-800 text-xs block truncate" title={uniqueSec.join(' | ')}>
                      {uniqueSec.join(' | ')}
                    </span>
                  </div>
                );
              })()}

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Keyloop Group</span>
                <span className="font-bold text-blue-700 text-xs flex items-center gap-1.5">
                  <FaBuilding className="text-blue-500 text-[10px]" />
                  <span>{group || customer?.keyloopGroup || '-'}</span>
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Branch Code</span>
                <span className="font-mono font-bold text-gray-800 text-xs block">
                  {customer?.branchCode || customer?.branch || '-'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Address ID</span>
                <span className="font-mono font-bold text-gray-800 text-xs block">
                  {customer?.addressId || '-'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">City, Area & Address</span>
                <span className="font-bold text-gray-800 text-xs flex items-center gap-1.5 truncate">
                  <FaMapMarkerAlt className="text-gray-400 text-[10px] shrink-0" />
                  <span className="truncate">
                    {[
                      customer?.address2 && customer?.address2 !== 'N/A' ? customer?.address2 : null,
                      customer?.location?.flatBuilding && customer?.location?.flatBuilding !== 'N/A' ? customer?.location?.flatBuilding : null,
                      customer?.address4 || customer?.location?.area || customer?.area,
                      customer?.address5 || customer?.location?.city || customer?.city
                    ].filter(Boolean).join(', ') || '-'}
                  </span>
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Date of Birth</span>
                <span className="font-bold text-gray-800 text-xs block">
                  {customer?.dateOfBirth ? String(customer.dateOfBirth).split('T')[0] : '-'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Nationality</span>
                <span className="font-bold text-gray-800 text-xs block">
                  {customer?.nationality || '-'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Customer Since</span>
                <span className="font-mono font-bold text-gray-800 text-xs block">
                  {customer?.customerSince ? String(customer.customerSince).split('T')[0] : '-'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Last Profile Update</span>
                <span className="font-mono font-bold text-gray-800 text-xs block">
                  {customer?.lastUpdated ? String(customer.lastUpdated).split('T')[0] : '-'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">VIP & Do Not Contact</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${customer?.vip ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                    {customer?.vip ? 'VIP Member' : 'Standard'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${customer?.doNotContact ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {customer?.doNotContact ? 'Do Not Contact' : 'Contactable'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Data Verification</span>
                <span className="font-semibold text-gray-800 text-xs block">
                  {customer?.dataVerified || '-'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 sm:col-span-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Contact Consents</span>
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {customer?.consents ? (
                    Object.entries(customer.consents).map(([k, v]) => (
                      <span key={k} className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${v ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {k}: {v ? 'YES' : 'NO'}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 font-medium">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: Full Vehicle Details from API */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-200 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  <FaCar />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-xs sm:text-sm">Registered Vehicle Details</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Complete vehicle specification and workshop data</p>
                </div>
              </div>
              <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {(vehicles && vehicles.length) || 0} Registered
              </span>
            </div>

            {vehicles && vehicles.length > 0 ? (
              <div className="flex flex-col gap-3 max-h-[560px] overflow-y-auto pr-1">
                {vehicles.map((v, vIdx) => {
                  const plate = v.registrationNumber || v.plateNumber || v.licensePlate || '-';
                  const model = v.description || v.model || v.vehicleModel || `${v.brand || ''} Vehicle`.trim() || '-';
                  const vin = v.vin || v.chassisNumber || '-';
                  const year = v.modelYear || v.year || '-';
                  const extColor = v.colourDescription || v.colour || v.color || v.exteriorColor || '-';
                  const intColor = v.trimDescription || v.interiorColor || v.upholstery || '-';
                  const rawMileage = v.mileageKm !== undefined && v.mileageKm !== null ? v.mileageKm : (v.lastOdometer || v.odometerReading?.value || v.mileage || v.lastOdometerReading?.value);
                  const mileage = rawMileage !== undefined && rawMileage !== null && rawMileage !== '' ? rawMileage : '-';
                  const mileageUnit = v.odometerType === 'K' ? 'KM' : (v.odometerReading?.unit || v.mileageUnit || 'KM');
                  const engineNo = v.engineNumber || '-';
                  const engineCap = v.engineCapacity ? `${v.engineCapacity} cc` : '-';
                  const rawTrans = v.transmission || v.genericTransmissionCode || v.transmissionType || '';
                  const transmission = rawTrans === 'A' ? 'Automatic' : (rawTrans === 'M' ? 'Manual' : (rawTrans || '-'));
                  const fuel = v.fuelType || (v.fuelTypeCode === 'U' ? 'Unleaded' : '-');
                  const bodyType = [v.bodyStyle, v.variantClass].filter(Boolean).join(' • ') || '-';
                  const doorsSteering = `${v.numberOfDoors ? `${v.numberOfDoors} Doors` : '-'} • ${v.driverSide === 'L' ? 'LHD' : (v.driverSide || '-')}`;
                  const regDate = v.registrationDate || v.deliveryDate || v.firstRegistrationDate || '-';
                  const nextService = v.nextServiceDate 
                    ? `${String(v.nextServiceDate).split('T')[0]}${v.nextServiceOdometerKm || v.nextServiceOdometer ? ` (${Number(v.nextServiceOdometerKm || v.nextServiceOdometer).toLocaleString()} KM)` : ''}`
                    : '-';
                  const lastWorkDate = v.dateOfLastWork ? String(v.dateOfLastWork).split('T')[0] : '-';
                  const pdiDate = v.pdiCompleted ? String(v.pdiCompleted).split('T')[0] : '-';
                  const rtaExpiry = v.roadSafetyTestExpiryDate ? String(v.roadSafetyTestExpiryDate).split('T')[0] : '-';
                  const dmsVehNo = v.vehicleNumber ? `#${v.vehicleNumber}` : '-';
                  const dmsLoc = v.locationDescription || v.locationCode || '-';
                  const stockProg = v.progressName || v.stockProgress || '-';
                  const enqNum = v.purchaseEnquiryNumber ? `#${v.purchaseEnquiryNumber}` : '-';

                  return (
                    <div key={v.id || vin || vIdx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 space-y-2.5 shadow-2xs">
                      {/* Vehicle Header */}
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                        <div className="flex items-center gap-2 font-extrabold text-gray-900 text-xs sm:text-sm">
                          <div className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                            <FaCar />
                          </div>
                          <span>{model}</span>
                        </div>
                        <span className="font-mono text-[11px] font-extrabold text-slate-800 bg-white px-2.5 py-0.5 rounded-md border border-slate-300 shadow-2xs">
                          {plate}
                        </span>
                      </div>

                      {/* Simple Uniform Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">VIN / Chassis</span>
                          <span className="font-mono font-bold text-blue-700 block truncate" title={vin}>{vin}</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Model Year</span>
                          <span className="font-bold text-gray-800 block">{year}</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Current Mileage</span>
                          <span className="font-mono font-bold text-emerald-700 block">{mileage !== '-' ? `${mileage} ${mileageUnit}` : '-'}</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Exterior Color</span>
                          <span className="font-bold text-gray-800 block truncate" title={extColor}>{extColor}</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200/70 sm:col-span-2">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Interior Trim</span>
                          <span className="font-bold text-gray-800 block truncate" title={intColor}>{intColor}</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Engine Number</span>
                          <span className="font-mono font-bold text-gray-800 block truncate" title={engineNo}>{engineNo}</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Engine Capacity</span>
                          <span className="font-bold text-gray-800 block">{engineCap}</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Transmission & Fuel</span>
                          <span className="font-bold text-gray-800 block truncate">{transmission} • {fuel}</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Body / Class</span>
                          <span className="font-bold text-gray-800 block">{bodyType}</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Doors & Steering</span>
                          <span className="font-bold text-gray-800 block">{doorsSteering}</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Registration Date</span>
                          <span className="font-mono font-bold text-gray-800 block">{regDate !== '-' ? String(regDate).split('T')[0] : '-'}</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Next Service Due</span>
                          <span className="font-bold text-blue-800 block truncate">{nextService}</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Last Workshop Work</span>
                          <span className="font-bold text-gray-800 block">{lastWorkDate}</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">PDI Completed</span>
                          <span className="font-bold text-gray-800 block">{pdiDate}</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Road Safety Expiry</span>
                          <span className="font-bold text-gray-800 block">{rtaExpiry}</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">DMS Vehicle #</span>
                          <span className="font-mono font-bold text-gray-800 block">{dmsVehNo}</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Stock Progress</span>
                          <span className="font-bold text-gray-800 block truncate">{stockProg}</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Location</span>
                          <span className="font-bold text-gray-800 block truncate">{dmsLoc}</span>
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Linked Enquiry</span>
                          <span className="font-mono font-bold text-indigo-700 block">{enqNum}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ): (
              <div className="py-16 flex flex-col items-center justify-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-gray-400 gap-1.5">
                <FaCar className="text-2xl text-gray-300" />
                <span className="text-xs font-semibold text-gray-600">No vehicles recorded for this customer</span>
                <span className="text-[10px] text-gray-400">Vehicles linked to this profile in Keyloop will appear here</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* SURVEY TYPES: Aftersales Survey, Sales Survey, Marketing Research -> UNDER DEVELOPMENT */}
      {activeSubTab !== 'Overview' && (
        <div className="bg-white rounded-xl p-8 sm:p-12 shadow-xs border border-gray-200 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-2xl shadow-xs">
            <FaTools />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">
              {activeSubTab}
            </h3>
            <span className="inline-block bg-amber-100 text-amber-900 font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">
              Under Development
            </span>
          </div>
          <p className="text-xs text-gray-500 max-w-md leading-relaxed">
            The <strong className="text-gray-700">{activeSubTab}</strong> workflow and its subcategories are currently under development. Detailed surveys and analytics will be enabled here soon.
          </p>
        </div>
      )}

      {/* Survey Details Modal (Postman API 4: GET /api/v1/feedback/{group}/{feedbackId}) */}
      {selectedFeedbackDetails && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedFeedbackDetails(null);
          }}
          className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-gray-200/90 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <FaInfoCircle className="text-sm" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    Survey Details #{selectedFeedbackDetails.feedbackId || selectedFeedbackDetails.id || selectedFeedbackDetails.surveyId || 'Record'}
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono">Keyloop Group: {group}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedFeedbackDetails(null)} 
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
                <FaSpinner className="animate-spin text-xl text-blue-600" />
                <span>Loading survey record...</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5 bg-gray-50 p-3 rounded-lg border border-gray-200 text-[11px]">
                  <div>
                    <span className="text-gray-400 text-[10px] block font-semibold uppercase">Survey Type</span>
                    <span className="font-bold text-gray-800">{selectedFeedbackDetails.type || 'GENERAL'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block font-semibold uppercase">Origin / Source</span>
                    <span className="font-mono text-gray-700 font-semibold">{selectedFeedbackDetails.origin || 'DESKTOP'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block font-semibold uppercase">Customer Number</span>
                    <span className="font-mono text-purple-700 font-bold">#{selectedFeedbackDetails.customerNumber || customerNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block font-semibold uppercase">Survey ID</span>
                    <span className="font-mono text-gray-800">{selectedFeedbackDetails.survey || selectedFeedbackDetails.surveyId || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block font-semibold uppercase">Recorded Date</span>
                    <span className="font-mono text-gray-700">{selectedFeedbackDetails.date || selectedFeedbackDetails.submittedDate || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block font-semibold uppercase">Channel</span>
                    <span className="text-gray-700">{selectedFeedbackDetails.channel || 'Direct / Portal'}</span>
                  </div>
                  {selectedFeedbackDetails.interactionId && (
                    <div className="col-span-2">
                      <span className="text-gray-400 text-[10px] block font-semibold uppercase">Interaction ID (Genesys)</span>
                      <span className="font-mono text-blue-700 font-bold">{selectedFeedbackDetails.interactionId}</span>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-gray-500 font-bold text-[11px] block mb-1">Customer Comments / Voice</span>
                  <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-gray-800 text-xs leading-relaxed font-medium">
                    "{selectedFeedbackDetails.comments || selectedFeedbackDetails.feedback || selectedFeedbackDetails.comment || 'No comments provided'}"
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedFeedbackDetails(null)}
                    className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
