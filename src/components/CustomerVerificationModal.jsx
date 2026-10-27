import React, { useState, useEffect, useRef } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { getFullMobileNumber, isFullMobileNumber } from '../utils/phoneUtils';
import { 
  FaCheckDouble, 
  FaCheckCircle, 
  FaIdCard, 
  FaUser, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaGlobe, 
  FaBuilding, 
  FaSpinner, 
  FaTimes, 
  FaCopy, 
  FaCheck, 
  FaInfoCircle, 
  FaLayerGroup,
  FaShieldAlt
} from 'react-icons/fa';

const GROUP_OPTIONS = ['BMW', 'MINI', 'ROLLS-ROYCE', 'GEELY'];
const SOURCE_OPTIONS = [
  'Walk-in',
  'Customer Call',
  'Inbound Call',
  'Phone',
  'Email',
  'Showroom Visit',
  'Campaign',
  'Referral'
];
const CITY_OPTIONS = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
  'Al Ain'
];

export default function CustomerVerificationModal({ isOpen = false, onClose, customerData = null }) {
  const { 
    customer: activeCustomer, 
    currentGroup, 
    currentMobile, 
    verifyCustomer,
    showToast 
  } = useCustomer();

  const customer = customerData || activeCustomer;

  const currentMonthYear = `${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getFullYear()).slice(-2)}`;

  const [formData, setFormData] = useState({
    group: 'BMW',
    customerId: '',
    customerName: '',
    sourceOfInformation: 'Walk-in',
    personalId: '',
    dataVerified: `DV ${currentMonthYear}`,
    area: '',
    city: 'Dubai',
    country: 'United Arab Emirates',
    postcode: '',
    mobile: '',
    email: '',
    preferredPhone: '',
    preferredEmail: '',
    nationality: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [copiedTaskId, setCopiedTaskId] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const countdownIntervalRef = useRef(null);
  const autoCloseTimerRef = useRef(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, []);

  // Populate form when modal opens or customer changes
  useEffect(() => {
    if (!isOpen) {
      setFeedback(null);
      setCopiedTaskId(false);
      setCountdown(null);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      return;
    }

    if (customer) {
      const emailVal = customer.email && !customer.email.includes('***') ? customer.email : '';
      const resolvedMobile = getFullMobileNumber(customer, currentMobile) || 
        (isFullMobileNumber(customer.mobile) ? customer.mobile.replace(/\D/g, '') : 
        (isFullMobileNumber(customer.mobileRaw) ? customer.mobileRaw.replace(/\D/g, '') : ''));
      const custNo = customer.customerNumber || customer.id || '';
      const custName = customer.fullName || `${customer.firstName || ''} ${customer.surname || ''}`.trim() || 'Customer';
      const existingVerified = customer.dataVerified || 
        (customer.verificationStatus?.status ? String(customer.verificationStatus.status) : `DV ${currentMonthYear}`);

      setFormData({
        group: customer.keyloopGroup || currentGroup || 'BMW',
        customerId: String(custNo),
        customerName: custName,
        sourceOfInformation: customer.sourceOfInformation || 'Walk-in',
        personalId: customer.personalId || customer.nationalId || customer.idCardNumber || '',
        dataVerified: existingVerified,
        area: customer.location?.area || '',
        city: customer.location?.city || 'Dubai',
        country: customer.nationality || customer.country || 'United Arab Emirates',
        postcode: customer.location?.postcode || customer.postcode || '',
        mobile: resolvedMobile,
        email: emailVal,
        preferredPhone: customer.preferredPhone || resolvedMobile,
        preferredEmail: customer.preferredEmail || emailVal,
        nationality: customer.nationality || ''
      });
      setFeedback(null);
    }
  }, [isOpen, customer, currentGroup, currentMobile, currentMonthYear]);

  if (!isOpen) return null;

  const handleCopyTaskId = async (taskId) => {
    if (!taskId) return;
    try {
      await navigator.clipboard.writeText(taskId);
      setCopiedTaskId(true);
      setTimeout(() => setCopiedTaskId(false), 2500);
    } catch {
      // Fallback
      setCopiedTaskId(true);
      setTimeout(() => setCopiedTaskId(false), 2500);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.customerId.trim()) {
      setFeedback({ type: 'error', message: 'Customer ID is required.' });
      return;
    }
    if (!formData.dataVerified.trim()) {
      setFeedback({ type: 'error', message: 'Data Verified code is required (e.g. DV MM/YY).' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await verifyCustomer(formData);

      if (res && res.ok) {
        const taskId = res.taskId || res.data?.taskId;
        const toastData = {
          type: 'success',
          title: 'Customer Data Verification Submitted!',
          taskId: taskId || null,
          customerName: formData.customerName,
          message: taskId 
            ? `Customer data verification submitted successfully! Task ID: ${taskId}` 
            : 'Customer data verification submitted successfully to Keyloop CRM!',
          duration: 10
        };

        setFeedback(toastData);
        if (showToast) {
          showToast(toastData);
        }

        setCountdown(10);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownIntervalRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = setTimeout(() => {
          if (onClose) onClose();
        }, 10000);
      } else {
        setFeedback({ 
          type: 'error', 
          message: res?.error || 'Failed to submit customer data verification.' 
        });
      }
    } catch (err) {
      setFeedback({ 
        type: 'error', 
        message: err.message || 'An error occurred while submitting data verification to Keyloop.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg shrink-0">
              <FaShieldAlt />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Customer Data Verification</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  KEYLOOP CRM
                </span>
              </h2>
              <p className="text-xs text-gray-300">
                Submit customer data verification and contact updates to Keyloop
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Customer Badge Banner */}
        <div className="bg-slate-50 border-b border-gray-200 px-6 py-2.5 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-900 flex items-center gap-1.5">
              <FaUser className="text-gray-400 text-xs" />
              {formData.customerName || 'Customer'}
            </span>
            <span className="font-mono text-gray-500 bg-gray-200/80 px-2 py-0.5 rounded font-semibold text-[11px]">
              Cust ID: #{formData.customerId || '—'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {formData.group}
            </span>
            {formData.mobile && (
              <span className="text-gray-600 font-mono text-[11px]">
                {formData.mobile}
              </span>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Feedback & Task ID Banner */}
          {feedback && (
            <div 
              className={`p-4 rounded-xl border text-xs shadow-xs space-y-3 ${
                feedback.type === 'success' 
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950' 
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {feedback.type === 'success' ? (
                    <FaCheckCircle className="text-emerald-600 text-base shrink-0" />
                  ) : (
                    <FaInfoCircle className="text-rose-600 text-base shrink-0" />
                  )}
                  <span className="font-bold text-sm">
                    {feedback.title || (feedback.type === 'success' ? 'Verification Submitted!' : 'Submission Failed')}
                  </span>
                </div>
                {feedback.type === 'success' && countdown !== null && (
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Closing in {countdown}s
                  </span>
                )}
              </div>

              {feedback.taskId && (
                <div className="p-3 bg-white border border-emerald-300 rounded-lg flex items-center justify-between gap-3 shadow-2xs">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">
                      This is your Task ID:
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-950 truncate block select-all">
                      {feedback.taskId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyTaskId(feedback.taskId)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs cursor-pointer"
                  >
                    {copiedTaskId ? (
                      <>
                        <FaCheck className="text-xs" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <FaCopy className="text-xs" />
                        <span>Copy Task ID</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {feedback.message && !feedback.taskId && (
                <p className="font-medium text-xs">{feedback.message}</p>
              )}
            </div>
          )}

          <form id="customer-verification-form" onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Brand & Verification Details */}
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/80 shadow-2xs space-y-4">
              <div className="pb-2 border-b border-emerald-200 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                  <FaCheckDouble className="text-emerald-600" />
                  1. Keyloop Verification Data
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Required for Keyloop Intake
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* Brand Group */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaLayerGroup className="text-gray-400 text-xs" /> Brand Group <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData(prev => ({ ...prev, group: e.target.value }))}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-bold text-gray-800 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
                  >
                    {GROUP_OPTIONS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Customer ID */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaUser className="text-gray-400 text-xs" /> Customer ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customerId}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                    placeholder="e.g. 234566"
                    required
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-mono font-bold text-gray-900 text-xs focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>

                {/* Customer Name */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaUser className="text-gray-400 text-xs" /> Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="e.g. Hasim Jabir"
                    required
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 text-xs focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>

                {/* Data Verified Code */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaCheckCircle className="text-emerald-600 text-xs" /> Data Verified Code <span className="text-rose-500">*</span>
                  </label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={formData.dataVerified}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataVerified: e.target.value }))}
                      placeholder={`e.g. DV ${currentMonthYear}`}
                      required
                      className="w-full p-2.5 bg-white border border-emerald-400 rounded-lg font-bold text-emerald-950 text-xs focus:outline-none focus:border-emerald-600 shadow-2xs uppercase"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-gray-500 font-medium">Quick Presets:</span>
                      {[`DV ${currentMonthYear}`, `DU ${currentMonthYear}`, 'DV', 'DU', 'VERIFIED'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, dataVerified: preset }))}
                          className={`text-[10px] px-2 py-0.5 rounded border font-bold transition-all cursor-pointer ${
                            formData.dataVerified === preset 
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-emerald-50 hover:border-emerald-300'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Source of Information */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaInfoCircle className="text-gray-400 text-xs" /> Source of Information
                  </label>
                  <select
                    value={formData.sourceOfInformation}
                    onChange={(e) => setFormData(prev => ({ ...prev, sourceOfInformation: e.target.value }))}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-800 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
                  >
                    {SOURCE_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Personal ID / Emirates ID */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaIdCard className="text-gray-400 text-xs" /> Personal / Emirates ID
                  </label>
                  <input
                    type="text"
                    value={formData.personalId}
                    onChange={(e) => setFormData(prev => ({ ...prev, personalId: e.target.value }))}
                    placeholder="e.g. 784198812345671"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-mono font-semibold text-gray-900 text-xs focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>

                {/* Nationality */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaGlobe className="text-gray-400 text-xs" /> Nationality
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                    placeholder="e.g. India"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 text-xs focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* 2. Contact & Address Details */}
            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 shadow-2xs space-y-4">
              <div className="pb-2 border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <FaPhoneAlt className="text-blue-600" />
                  2. Contact & Address Details
                </span>
                <span className="text-[10px] text-gray-500">
                  Transferred in RPA payload
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Mobile */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaPhoneAlt className="text-gray-400 text-xs" /> Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                    placeholder="e.g. 050852369"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 text-xs focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* Preferred Phone */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaPhoneAlt className="text-gray-400 text-xs" /> Preferred Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.preferredPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredPhone: e.target.value }))}
                    placeholder={formData.mobile || "e.g. 050852369"}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 text-xs focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaEnvelope className="text-gray-400 text-xs" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. customer@example.com"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 text-xs focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* Preferred Email */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaEnvelope className="text-gray-400 text-xs" /> Preferred Email
                  </label>
                  <input
                    type="email"
                    value={formData.preferredEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredEmail: e.target.value }))}
                    placeholder={formData.email || "e.g. customer@example.com"}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 text-xs focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-gray-400 text-xs" /> City
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-800 text-xs focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    {CITY_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Area */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-gray-400 text-xs" /> Area / District
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    placeholder="e.g. Deira"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 text-xs focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* Postcode */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-gray-400 text-xs" /> Postcode / P.O. Box
                  </label>
                  <input
                    type="text"
                    value={formData.postcode}
                    onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
                    placeholder="e.g. 12345"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 text-xs focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaGlobe className="text-gray-400 text-xs" /> Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="e.g. United Arab Emirates"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 text-xs focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-lg border border-gray-300 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="customer-verification-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin text-xs" />
                <span>Submitting to Keyloop...</span>
              </>
            ) : (
              <>
                <FaCheckDouble className="text-xs" />
                <span>Submit Verification</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
