import React, { useState, useEffect, useRef } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { getBranchesForGroup } from '../data/brandModels';
import { getFullMobileNumber, isFullMobileNumber } from '../utils/phoneUtils';
import { 
  FaUserPlus, 
  FaEdit, 
  FaUser, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaGlobe, 
  FaLayerGroup, 
  FaCheck, 
  FaExclamationTriangle, 
  FaSpinner, 
  FaArrowLeft,
  FaSave,
  FaCopy,
  FaTimes,
  FaCheckCircle,
  FaCommentAlt,
  FaWhatsapp,
  FaIdCard
} from 'react-icons/fa';

const GROUP_OPTIONS = ['BMW', 'MINI', 'ROLLS-ROYCE', 'GEELY'];
const TITLE_OPTIONS = ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Eng.', 'Sheikh', 'Sheikha'];
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
const SOURCE_OF_INFORMATION_OPTIONS = [
  'Walk-in',
  'Phone Call',
  'Email',
  'Website',
  'Social Media',
  'Referral',
  'Event',
  'Other'
];

export default function CustomerFormView({ mode = 'create', onClose }) {
  const { 
    customer, 
    currentMobile, 
    currentGroup, 
    createCustomer, 
    updateCustomer,
    showToast,
    hideToast
  } = useCustomer();

  const [formData, setFormData] = useState({
    group: 'BMW',
    branch: '10 - Sheikh Zayed Rd',
    titleCode: 'Mr.',
    firstName: '',
    surname: '',
    sourceOfInformation: 'Walk-in',
    personalId: '',
    nationality: '',
    area: 'Deira',
    city: 'Dubai',
    country: 'United Arab Emirates',
    mobile: '',
    email: '',
    consents: {
      phone: true,
      email: false,
      sms: true,
      whatsapp: true
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [copiedTaskId, setCopiedTaskId] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const countdownIntervalRef = useRef(null);
  const autoCloseTimerRef = useRef(null);

  // Clear timers on component unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, []);

  const handleCopyTaskId = (id) => {
    if (!id) return;
    try {
      navigator.clipboard.writeText(id);
      setCopiedTaskId(true);
      setTimeout(() => setCopiedTaskId(false), 2000);
    } catch (e) {
      console.warn("Clipboard copy failed:", e);
    }
  };

  const handleDismissSuccess = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    setFeedback(null);
    if (hideToast) hideToast();
    if (onClose) onClose();
  };

  const handleGroupChange = (newGroup) => {
    const branches = getBranchesForGroup(newGroup);
    const defBranch = branches[0] ? `${branches[0].code} - ${branches[0].name}` : '10 - Sheikh Zayed Rd';
    setFormData(prev => ({ ...prev, group: newGroup, branch: defBranch }));
  };

  const currentBranches = getBranchesForGroup(formData.group);

  useEffect(() => {
    // If submission is in progress or success feedback is already shown, do NOT reset or wipe feedback
    if (isSubmitting || feedback?.type === 'success') {
      return;
    }

    if (mode === 'edit' && customer) {
      const emailVal = customer.email || customer.emailRaw || '';
      const resolvedMobile = getFullMobileNumber(customer, currentMobile) || 
        (isFullMobileNumber(customer.mobile) ? customer.mobile.replace(/\D/g, '') : 
        (isFullMobileNumber(customer.mobileRaw) ? customer.mobileRaw.replace(/\D/g, '') : ''));

      setFormData({
        group: customer.keyloopGroup || currentGroup || 'BMW',
        branch: customer.preferredBranch || (customer.branchCode ? `${customer.branchCode} - Sheikh Zayed Rd` : '10 - Sheikh Zayed Rd'),
        titleCode: customer.salutation || 'Mr.',
        firstName: customer.firstName || '',
        surname: customer.surname || '',
        sourceOfInformation: customer.sourceOfInformation || 'Walk-in',
        personalId: customer.personalId || customer.nationalId || '',
        nationality: customer.nationality || '',
        area: customer.location?.area || 'Deira',
        city: customer.location?.city || 'Dubai',
        country: customer.country || customer.nationality || 'United Arab Emirates',
        mobile: resolvedMobile,
        email: emailVal,
        consents: customer.consents || {
          phone: true,
          email: Boolean(emailVal && emailVal.includes('@')),
          sms: true,
          whatsapp: true
        }
      });
      setFeedback(null);
    } else if (mode === 'create') {
      setFormData(prev => ({
        group: currentGroup || prev.group || 'BMW',
        branch: prev.branch || '10 - Sheikh Zayed Rd',
        titleCode: prev.titleCode || 'Mr.',
        firstName: prev.firstName || '',
        surname: prev.surname || '',
        sourceOfInformation: prev.sourceOfInformation || 'Walk-in',
        personalId: prev.personalId || '',
        nationality: prev.nationality || '',
        area: prev.area || 'Deira',
        city: prev.city || 'Dubai',
        country: prev.country || 'United Arab Emirates',
        mobile: prev.mobile || (isFullMobileNumber(currentMobile) ? currentMobile.replace(/\D/g, '') : ''),
        email: prev.email || '',
        consents: prev.consents || {
          phone: true,
          email: false,
          sms: true,
          whatsapp: true
        }
      }));
    }
  }, [mode, customer, currentGroup, currentMobile]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.firstName.trim()) {
      setFeedback({ type: 'error', message: 'First name is required.' });
      return;
    }
    if (!formData.mobile.trim()) {
      setFeedback({ type: 'error', message: 'Mobile number is required.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (mode === 'create') {
        const res = await createCustomer(formData);
        if (res && res.ok) {
          const taskId = res.taskId || res.customer?.rpaTaskId;
          const custNo = res.customer?.customerNumber;
          const isConfirmed = Boolean(custNo && custNo.trim() !== '' && custNo !== 'PROSPECT');

          const toastData = {
            type: 'success',
            title: 'New customer registration successful!',
            taskId: taskId || null,
            customerNumber: isConfirmed ? custNo : null,
            customerName: res.customer?.fullName || formData.firstName,
            message: taskId 
              ? `New customer registration successful! This is your Task ID: ${taskId}` 
              : 'New customer registration successful!',
            duration: 10
          };

          setFeedback(toastData);
          if (showToast) {
            showToast(toastData);
          }

          // Stay visible for 10 seconds with real-time countdown
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
          setFeedback({ type: 'error', message: 'Failed to create customer record.' });
        }
      } else {
        const res = await updateCustomer(formData);
        if (res && res.ok) {
          const taskId = res.taskId || res.customer?.rpaTaskId;
          const toastData = {
            type: 'success',
            title: 'Customer profile updated successfully!',
            taskId: taskId || null,
            customerName: res.customer?.fullName || formData.firstName,
            message: taskId 
              ? `Customer profile updated successfully! This is your Task ID: ${taskId}` 
              : 'Customer profile updated successfully!',
            duration: taskId ? 10 : 4
          };

          setFeedback(toastData);
          if (showToast) {
            showToast(toastData);
          }

          if (taskId) {
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
            setTimeout(() => {
              if (onClose) onClose();
            }, 1500);
          }
        } else {
          setFeedback({ type: 'error', message: res?.error || 'Failed to update customer record.' });
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* 1. Header Card */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="Back to Overview"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-2xs">
            {mode === 'create' ? <FaUserPlus className="text-base" /> : <FaEdit className="text-base" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-gray-900 text-base leading-tight">
                {mode === 'create' ? 'Create New Customer' : 'Edit Customer Profile'}
              </h1>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {mode === 'create' ? 'New Registration' : `Cust #${customer?.customerNumber || ''}`}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {mode === 'create' 
                ? 'Register customer record in AGMC CCaaS and Keyloop CRM' 
                : 'Modify customer contact details, phone number, and location information'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
        >
          Back to Dashboard
        </button>
      </div>

      {/* 2. Main Form Card (Page Component) */}
      <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200 flex flex-col gap-5">
        {feedback && (
          <div className={`p-4 rounded-xl border text-xs flex flex-col gap-2.5 ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? <FaCheckCircle className="text-emerald-600 text-base shrink-0" /> : <FaExclamationTriangle className="text-rose-600 text-base shrink-0" />}
                <span className="font-bold text-sm">
                  {feedback.title || (feedback.type === 'success' ? 'New customer registration successful!' : 'Error')}
                </span>
              </div>
              {countdown !== null && countdown > 0 && (
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  Auto-closing in {countdown}s
                </span>
              )}
            </div>

            {feedback.taskId && (
              <div className="p-2.5 bg-white/90 border border-emerald-300 rounded-lg flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">This is your Task ID:</span>
                  <span className="font-mono text-xs font-bold text-emerald-950 truncate block select-all">
                    {feedback.taskId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyTaskId(feedback.taskId)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[11px] font-bold rounded flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-2xs"
                >
                  {copiedTaskId ? (
                    <>
                      <FaCheck className="text-[10px]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <FaCopy className="text-[10px]" />
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Customer Identity */}
          <div>
            <div className="pb-2 mb-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                1. Customer & Brand Identity
              </span>
              <span className="text-[11px] text-gray-400 font-medium">* Required fields</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Group */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <FaLayerGroup className="text-gray-400 text-xs" /> Keyloop Group <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.group}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer transition-colors shadow-2xs"
                >
                  {GROUP_OPTIONS.map(grp => (
                    <option key={grp} value={grp}>{grp}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <FaUser className="text-gray-400 text-xs" /> Title Code
                </label>
                <select
                  value={formData.titleCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, titleCode: e.target.value }))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer transition-colors shadow-2xs"
                >
                  {TITLE_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* First Name */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <FaUser className="text-gray-400 text-xs" /> First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="e.g. Tariq"
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
                />
              </div>

              {/* Surname */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <FaUser className="text-gray-400 text-xs" /> Surname
                </label>
                <input
                  type="text"
                  value={formData.surname}
                  onChange={(e) => setFormData(prev => ({ ...prev, surname: e.target.value }))}
                  placeholder="e.g. Bashir"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
                />
              </div>

              {/* Source of Information */}
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <FaBuilding className="text-gray-400 text-xs" /> Source of Information
                </label>
                <select
                  value={formData.sourceOfInformation}
                  onChange={(e) => setFormData(prev => ({ ...prev, sourceOfInformation: e.target.value }))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer transition-colors shadow-2xs"
                >
                  {SOURCE_OF_INFORMATION_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Personal ID */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <FaIdCard className="text-gray-400 text-xs" /> Personal ID
                </label>
                <input
                  type="text"
                  value={formData.personalId}
                  onChange={(e) => setFormData(prev => ({ ...prev, personalId: e.target.value }))}
                  placeholder="e.g. 784-200-1122334-5"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono font-semibold text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
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
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div>
            <div className="pb-2 mb-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                2. Contact Information
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mobile Number */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <FaPhoneAlt className="text-gray-400 text-xs" /> Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                  placeholder="e.g. 0561277913"
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <FaEnvelope className="text-gray-400 text-xs" /> Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    const val = e.target.value;
                    const hasValid = Boolean(val && val.includes('@'));
                    setFormData(prev => ({
                      ...prev,
                      email: val,
                      consents: {
                        ...prev.consents,
                        email: hasValid ? prev.consents.email || true : false
                      }
                    }));
                  }}
                  placeholder="e.g. tariq.bashir@example.com"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Branch & Location */}
          <div>
            <div className="pb-2 mb-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                3. Branch & Geographic Location
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Branch */}
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <FaBuilding className="text-gray-400 text-xs" /> Preferred Branch Location <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer transition-colors shadow-2xs"
                >
                  {currentBranches.map(br => {
                    const val = `${br.code} - ${br.name}`;
                    return (
                      <option key={br.code} value={val}>{val}</option>
                    );
                  })}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-gray-400 text-xs" /> City
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer transition-colors shadow-2xs"
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
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
                />
              </div>

              {/* Country */}
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <FaGlobe className="text-gray-400 text-xs" /> Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="e.g. United Arab Emirates"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Communication Consents */}
          <div>
            <div className="pb-2 mb-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                4. Communication Consents & Channel Permissions
              </span>
              <span className="text-[11px] text-gray-400">Opt-in marketing and notification channels</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center gap-2.5 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={formData.consents.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    consents: { ...prev.consents, phone: e.target.checked }
                  }))}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <div className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                  <FaPhoneAlt className="text-blue-500 text-[10px]" />
                  <span>Phone Calls</span>
                </div>
              </label>

              <label className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center gap-2.5 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={formData.consents.sms}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    consents: { ...prev.consents, sms: e.target.checked }
                  }))}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <div className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                  <FaCommentAlt className="text-blue-500 text-[10px]" />
                  <span>SMS</span>
                </div>
              </label>

              <label className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center gap-2.5 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={formData.consents.whatsapp}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    consents: { ...prev.consents, whatsapp: e.target.checked }
                  }))}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <div className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                  <FaWhatsapp className="text-emerald-500 text-xs" />
                  <span>WhatsApp</span>
                </div>
              </label>

              <label className={`p-2.5 border rounded-lg flex items-center gap-2.5 transition-all ${
                formData.email && formData.email.includes('@') 
                  ? 'bg-gray-50 hover:bg-gray-100 border-gray-200 cursor-pointer' 
                  : 'bg-gray-100/70 border-gray-200 opacity-60 cursor-not-allowed'
              }`}>
                <input
                  type="checkbox"
                  disabled={!formData.email || !formData.email.includes('@')}
                  checked={Boolean(formData.email && formData.email.includes('@') && formData.consents.email)}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    consents: { ...prev.consents, email: e.target.checked }
                  }))}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                  <FaEnvelope className="text-blue-500 text-[10px]" />
                  <span>Email {(!formData.email || !formData.email.includes('@')) && <span className="text-[10px] text-gray-400 font-normal">(N/A)</span>}</span>
                </div>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin text-xs" />
                  <span>Processing...</span>
                </>
              ) : mode === 'create' ? (
                <>
                  <FaUserPlus className="text-xs" />
                  <span>Create Customer</span>
                </>
              ) : (
                <>
                  <FaSave className="text-xs" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
