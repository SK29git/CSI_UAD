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
    updateCustomer
  } = useCustomer();

  const isProspect = customer?.isProspect === true || customer?.customerType === 'PROSPECT' || customer?.profileType === 'PROSPECT';

  const getUrlParamMobile = () => {
    if (typeof window === 'undefined') return '';
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const candidates = [
        searchParams.get('mobile'),
        searchParams.get('Mobile'),
        searchParams.get('Complaint'),
        searchParams.get('complaint'),
        searchParams.get('Sales'),
        searchParams.get('sales'),
        searchParams.get('phone'),
        searchParams.get('Phone'),
        searchParams.get('ani'),
        searchParams.get('ANI'),
        searchParams.get('callerId'),
        searchParams.get('callerid'),
        searchParams.get('msisdn'),
        searchParams.get('MSISDN')
      ];
      for (const c of candidates) {
        if (c && !String(c).includes('*')) {
          const digits = String(c).replace(/[^0-9]/g, '');
          if (digits.length >= 7) return digits;
        }
      }
    } catch (e) {
      console.warn("Could not read mobile from URL params:", e);
    }
    return '';
  };

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

    const urlMobile = getUrlParamMobile();
    let resolvedMobile = getFullMobileNumber(customer, currentMobile);
    if (!resolvedMobile) {
      if (urlMobile) {
        resolvedMobile = urlMobile;
      } else if (currentMobile && !String(currentMobile).includes('*')) {
        resolvedMobile = String(currentMobile).replace(/\D/g, '');
      } else if (customer) {
        const directNumbers = [customer.mobilePhone, customer.mobile, customer.mobileRaw, customer.phone, customer.telephone];
        for (const num of directNumbers) {
          if (num && !String(num).includes('*')) {
            const digits = String(num).replace(/[^0-9]/g, '');
            if (digits.length >= 7) {
              resolvedMobile = digits;
              break;
            }
          }
        }
      }
    }
    if (!resolvedMobile && typeof window !== 'undefined') {
      const cached = localStorage.getItem('complaint_cached_mobile') || localStorage.getItem('sales_cached_mobile');
      if (cached && !cached.includes('*')) {
        resolvedMobile = cached.replace(/\D/g, '');
      }
    }

    if (mode === 'edit' && customer) {
      const emailVal = customer.email || customer.emailRaw || '';

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
        mobile: resolvedMobile || '',
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
        mobile: prev.mobile || resolvedMobile || urlMobile || (currentMobile && !String(currentMobile).includes('*') ? currentMobile.replace(/\D/g, '') : ''),
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
          if (onClose) onClose();
        } else {
          setFeedback({ type: 'error', message: res?.error || 'Failed to create customer record.' });
        }
      } else {
        const res = await updateCustomer(formData);
        if (res && res.ok) {
          if (onClose) onClose();
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
    <div className="space-y-3 relative">
      {/* 1. Header Card */}
      <div className="bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Back to Overview"
          >
            <FaArrowLeft className="text-xs" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold">
            {mode === 'create' ? <FaUserPlus className="text-sm" /> : <FaEdit className="text-sm" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-gray-900 text-sm leading-tight">
                {mode === 'create' ? 'Create New Customer' : 'Edit Customer Profile'}
              </h1>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                {mode === 'create' ? 'New Registration' : `Cust #${customer?.customerNumber || ''}`}
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              {mode === 'create' 
                ? 'Register customer record in AGMC CCaaS and Keyloop CRM' 
                : 'Modify customer name and contact details'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>

      {/* 2. Main Form Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col gap-3.5">
        {feedback && feedback.type === 'error' && (
          <div className="p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 bg-rose-50 text-rose-900 border-rose-200">
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="text-rose-600 text-sm shrink-0" />
              <span className="font-semibold text-xs">{feedback.message || 'Operation failed'}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-rose-600 hover:text-rose-800 text-xs font-bold px-1"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Editable Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Title Code */}
            <div>
              <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <FaUser className="text-gray-400 text-[10px]" /> Title Code
              </label>
              <select
                value={formData.titleCode}
                onChange={(e) => setFormData(prev => ({ ...prev, titleCode: e.target.value }))}
                className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md font-medium text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer transition-colors"
              >
                {TITLE_OPTIONS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* First Name */}
            <div>
              <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <FaUser className="text-gray-400 text-[10px]" /> First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="e.g. Tariq"
                required
                className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md font-medium text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Surname */}
            <div>
              <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <FaUser className="text-gray-400 text-[10px]" /> Surname
              </label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => setFormData(prev => ({ ...prev, surname: e.target.value }))}
                placeholder="e.g. Bashir"
                className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md font-medium text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <FaPhoneAlt className="text-gray-400 text-[10px]" /> Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder="e.g. 0561277913"
                required
                className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md font-medium text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Read-Only Profile Information */}
          <div className="pt-2 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Source of Information */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <FaBuilding className="text-gray-400 text-[10px]" /> Source of Information
                </label>
                <div className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium text-gray-700 truncate" title={formData.sourceOfInformation || customer?.sourceOfInformation || 'Walk-in'}>
                  {formData.sourceOfInformation || customer?.sourceOfInformation || 'Walk-in'}
                </div>
              </div>

              {/* Keyloop Group */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <FaLayerGroup className="text-gray-400 text-[10px]" /> Keyloop Group
                </label>
                <div className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium text-gray-700 truncate">
                  {formData.group || 'BMW'}
                </div>
              </div>

              {/* Preferred Branch Location */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <FaBuilding className="text-gray-400 text-[10px]" /> Preferred Branch Location
                </label>
                <div className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium text-gray-700 truncate" title={formData.branch || '10 - Sheikh Zayed Rd'}>
                  {formData.branch || '10 - Sheikh Zayed Rd'}
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <FaEnvelope className="text-gray-400 text-[10px]" /> Email Address
                </label>
                <div className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium text-gray-700 truncate" title={formData.email || customer?.email || 'N/A'}>
                  {formData.email || customer?.email || 'N/A'}
                </div>
              </div>

              {/* Personal ID */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <FaIdCard className="text-gray-400 text-[10px]" /> Personal / Emirates ID
                </label>
                <div className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-mono font-medium text-gray-700 truncate">
                  {formData.personalId || customer?.personalId || customer?.nationalId || 'N/A'}
                </div>
              </div>

              {/* Nationality */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <FaGlobe className="text-gray-400 text-[10px]" /> Nationality
                </label>
                <div className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium text-gray-700 truncate">
                  {formData.nationality || customer?.nationality || 'N/A'}
                </div>
              </div>

              {/* City & Area */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <FaMapMarkerAlt className="text-gray-400 text-[10px]" /> City & Area
                </label>
                <div className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium text-gray-700 truncate" title={`${formData.city || 'Dubai'}, ${formData.area || 'Deira'}`}>
                  {formData.city || 'Dubai'}, {formData.area || 'Deira'}
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <FaGlobe className="text-gray-400 text-[10px]" /> Country
                </label>
                <div className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium text-gray-700 truncate">
                  {formData.country || 'United Arab Emirates'}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
