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
  FaIdCard,
  FaCalendarAlt,
  FaBullhorn
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

// Exact Sources requested from both CRM Channels and Contact Sources
export const CRM_SOURCES = [
  'CRM Inbound',
  'CRM Outbound',
  'CRM Digital Media / Online Enquiries',
  'CRM Service Booking Lead'
];

export const CONTACT_SOURCES = [
  'Customer Call',
  'Customer Walk-in',
  'Email',
  'AGMC BMW Website',
  'BMW Middle East',
  'CSI',
  'DED',
  'Feedback Form',
  'Happiness Counter',
  'OCMS',
  'Social Media',
  'VOC'
];

export const CUSTOMER_SOURCE_OPTIONS = [
  ...CRM_SOURCES,
  ...CONTACT_SOURCES
];

// Helper to map Source selection to Keyloop RPA's strict sourceOfInformation enum
export function mapSourceToSourceOfInfo(src) {
  switch (src) {
    case 'Customer Walk-in': return 'Walk-in';
    case 'Customer Call': return 'CRM Outbound Calls';
    case 'Email': return 'E-Mail';
    case 'AGMC BMW Website':
    case 'BMW Middle East':
    case 'CRM Digital Media / Online Enquiries':
    case 'Feedback Form':
    case 'OCMS': return 'Website';
    case 'Social Media': return 'Facebook';
    case 'CRM Service Booking Lead': return 'Service Department';
    case 'CRM Inbound': return 'Walk-in';
    case 'CRM Outbound': return 'CRM Outbound Calls';
    case 'CSI':
    case 'VOC': return 'Referrals';
    case 'Happiness Counter':
    case 'DED': return 'Walk-in';
    default: return 'Walk-in';
  }
}

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
    source: 'CRM Inbound',
    sourceOfInformation: 'Walk-in',
    personalId: '',
    nationality: '',
    dob: '',
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

  const handleSourceChange = (newSource) => {
    setFormData(prev => ({
      ...prev,
      source: newSource,
      sourceOfInformation: mapSourceToSourceOfInfo(newSource)
    }));
  };

  const currentBranches = getBranchesForGroup(formData.group);

  useEffect(() => {
    // If submission is in progress or success feedback is already shown, do NOT reset
    if (isSubmitting || feedback?.type === 'success') {
      return;
    }

    const urlMobile = getUrlParamMobile();
    let resolvedMobile = getFullMobileNumber(customer, currentMobile);

    if (!resolvedMobile) {
      // Direct unmasked on customer
      const directCandidates = [
        customer?.mobileRaw,
        customer?.mobile,
        customer?.mobilePhone,
        customer?.phone,
        customer?.telephone,
        customer?.phoneNumber,
        customer?.contactNumber
      ];
      for (const num of directCandidates) {
        if (num && !String(num).includes('*')) {
          const digits = String(num).replace(/[^0-9]/g, '');
          if (digits.length >= 7) {
            resolvedMobile = digits;
            break;
          }
        }
      }
    }

    if (!resolvedMobile) {
      if (urlMobile) {
        resolvedMobile = urlMobile;
      } else if (currentMobile && !String(currentMobile).includes('*')) {
        resolvedMobile = String(currentMobile).replace(/\D/g, '');
      }
    }

    if (!resolvedMobile && typeof window !== 'undefined') {
      const cached = localStorage.getItem('complaint_cached_mobile') || 
                     localStorage.getItem('sales_cached_mobile') ||
                     localStorage.getItem('last_searched_mobile');
      if (cached && !cached.includes('*')) {
        resolvedMobile = cached.replace(/\D/g, '');
      }
    }

    // Fallback: If customer HAS a mobile number (even if formatted or masked by DMS, e.g. +971... or +*********574)
    // NEVER leave the mobile field empty when a customer mobile is present!
    if (!resolvedMobile && customer) {
      const anyCandidate = [
        customer.mobileRaw,
        customer.mobile,
        customer.mobilePhone,
        customer.phone,
        customer.telephone,
        customer.phoneNumber,
        currentMobile
      ];
      for (const c of anyCandidate) {
        if (c && String(c).trim() && String(c).trim() !== 'N/A') {
          resolvedMobile = String(c).trim();
          break;
        }
      }
    }

    if (mode === 'edit' && customer) {
      const emailVal = customer.email || customer.emailRaw || '';
      const initialGrp = customer.keyloopGroup || currentGroup || 'BMW';
      const branches = getBranchesForGroup(initialGrp);
      const matchingBranch = branches.find(b => customer.branchCode && String(b.code) === String(customer.branchCode));
      const defBranch = matchingBranch ? `${matchingBranch.code} - ${matchingBranch.name}` : (customer.preferredBranch || '10 - Sheikh Zayed Rd');
      const initialSource = customer.source || customer.leadSource || '';

      setFormData({
        group: initialGrp,
        branch: defBranch,
        titleCode: customer.salutation || 'Mr.',
        firstName: customer.firstName || '',
        surname: customer.surname || '',
        source: initialSource,
        sourceOfInformation: customer.sourceOfInformation || mapSourceToSourceOfInfo(initialSource),
        personalId: customer.personalId || customer.nationalId || '',
        nationality: customer.nationality || '',
        dob: customer.dateOfBirth || customer.dob || '',
        area: customer.location?.area || 'Deira',
        city: customer.location?.city || 'Dubai',
        country: customer.country || customer.nationality || 'United Arab Emirates',
        mobile: resolvedMobile || customer.mobile || customer.mobileRaw || customer.mobilePhone || customer.phone || customer.telephone || currentMobile || '',
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
      const initialGrp = currentGroup || 'BMW';
      const branches = getBranchesForGroup(initialGrp);
      const defBranch = branches[0] ? `${branches[0].code} - ${branches[0].name}` : '10 - Sheikh Zayed Rd';
      const initialSource = customer?.leadSource || customer?.source || 'CRM Inbound';

      setFormData(prev => ({
        group: initialGrp,
        branch: defBranch,
        titleCode: prev.titleCode || 'Mr.',
        firstName: prev.firstName || (customer?.isProspect ? customer?.firstName || '' : ''),
        surname: prev.surname || (customer?.isProspect ? customer?.surname || '' : ''),
        source: prev.source || initialSource,
        sourceOfInformation: mapSourceToSourceOfInfo(prev.source || initialSource),
        personalId: prev.personalId || customer?.personalId || '',
        nationality: prev.nationality || customer?.nationality || '',
        dob: prev.dob || customer?.dateOfBirth || customer?.dob || '',
        area: prev.area || customer?.location?.area || 'Deira',
        city: prev.city || customer?.location?.city || 'Dubai',
        country: prev.country || customer?.country || 'United Arab Emirates',
        mobile: prev.mobile || resolvedMobile || customer?.mobile || customer?.mobileRaw || urlMobile || (currentMobile && !String(currentMobile).includes('*') ? currentMobile.replace(/\D/g, '') : ''),
        email: prev.email || (customer?.email || ''),
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
    if (!formData.surname.trim()) {
      setFeedback({ type: 'error', message: 'Surname is required.' });
      return;
    }
    if (!formData.mobile.trim()) {
      setFeedback({ type: 'error', message: 'Mobile number is required.' });
      return;
    }
    if (!formData.area.trim()) {
      setFeedback({ type: 'error', message: 'Area is required.' });
      return;
    }
    if (!formData.city.trim()) {
      setFeedback({ type: 'error', message: 'City is required.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const submissionPayload = {
      ...formData,
      sourceOfInformation: mapSourceToSourceOfInfo(formData.source)
    };

    try {
      if (mode === 'create') {
        const res = await createCustomer(submissionPayload);
        if (res && res.ok) {
          if (onClose) onClose();
        } else {
          setFeedback({ type: 'error', message: res?.error || 'Failed to create customer record.' });
        }
      } else {
        const res = await updateCustomer(submissionPayload);
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
                : 'Modify customer profile and contact details'}
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
          {/* SECTION 1: Personal & Contact Information */}
          <div>
            <div className="flex items-center justify-between pb-1.5 mb-2.5 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <FaUser className="text-blue-600 text-[11px]" /> Personal & Contact Information
              </h3>
              <span className="text-[10px] text-gray-400 font-medium">* Required fields</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Title Code */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <FaUser className="text-gray-400 text-[10px]" /> Title Code <span className="text-rose-500">*</span>
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
                  <FaUser className="text-gray-400 text-[10px]" /> Surname <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.surname}
                  onChange={(e) => setFormData(prev => ({ ...prev, surname: e.target.value }))}
                  placeholder="e.g. Bashir"
                  required
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
                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md font-medium text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <FaEnvelope className="text-gray-400 text-[10px]" /> Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="e.g. customer@example.com"
                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md font-medium text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Personal / Emirates ID */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <FaIdCard className="text-gray-400 text-[10px]" /> Personal / Emirates ID
                </label>
                <input
                  type="text"
                  value={formData.personalId}
                  onChange={(e) => setFormData(prev => ({ ...prev, personalId: e.target.value }))}
                  placeholder="e.g. 784-1990-1234567-1"
                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md font-medium text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>

              {/* Nationality */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <FaGlobe className="text-gray-400 text-[10px]" /> Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                  placeholder="e.g. United Arab Emirates"
                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md font-medium text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <FaCalendarAlt className="text-gray-400 text-[10px]" /> Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md font-medium text-gray-800 text-xs focus:bg-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Organization, Branch & Location (Non-editable) */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between pb-1.5 mb-2.5 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <FaBuilding className="text-blue-600 text-[11px]" /> Organization, Branch & Location
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {/* Keyloop Group */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <FaLayerGroup className="text-gray-400 text-[10px]" /> Keyloop Group
                </label>
                <input
                  type="text"
                  value={formData.group}
                  readOnly
                  disabled
                  className="w-full px-2.5 py-1.5 bg-gray-100 border border-gray-200 rounded-md font-semibold text-gray-700 text-xs cursor-not-allowed select-none"
                />
              </div>

              {/* Preferred Branch Location */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <FaBuilding className="text-gray-400 text-[10px]" /> Preferred Branch
                </label>
                <input
                  type="text"
                  value={formData.branch}
                  readOnly
                  disabled
                  title={formData.branch}
                  className="w-full px-2.5 py-1.5 bg-gray-100 border border-gray-200 rounded-md font-semibold text-gray-700 text-xs cursor-not-allowed select-none truncate"
                />
              </div>

              {/* City */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <FaMapMarkerAlt className="text-gray-400 text-[10px]" /> City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  readOnly
                  disabled
                  className="w-full px-2.5 py-1.5 bg-gray-100 border border-gray-200 rounded-md font-semibold text-gray-700 text-xs cursor-not-allowed select-none"
                />
              </div>

              {/* Area */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <FaMapMarkerAlt className="text-gray-400 text-[10px]" /> Area
                </label>
                <input
                  type="text"
                  value={formData.area}
                  readOnly
                  disabled
                  className="w-full px-2.5 py-1.5 bg-gray-100 border border-gray-200 rounded-md font-semibold text-gray-700 text-xs cursor-not-allowed select-none"
                />
              </div>

              {/* Country */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <FaGlobe className="text-gray-400 text-[10px]" /> Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  readOnly
                  disabled
                  className="w-full px-2.5 py-1.5 bg-gray-100 border border-gray-200 rounded-md font-semibold text-gray-700 text-xs cursor-not-allowed select-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Campaign & Channel Details (From Prospects / E00MI API) */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between pb-1.5 mb-2.5 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <FaBullhorn className="text-blue-600 text-[11px]" /> Campaign & Channel Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Link Type */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  Link Type
                </label>
                <div className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-semibold text-gray-700">
                  {customer?.linkType || '-'}
                </div>
              </div>

              {/* Prospect Number */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  Prospect Number
                </label>
                <div className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-semibold text-gray-700 font-mono">
                  {customer?.prospectNumber || '-'}
                </div>
              </div>

              {/* Campaign */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  Campaign
                </label>
                <div className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-semibold text-gray-700">
                  {customer?.campaign || '-'}
                </div>
              </div>

              {/* Marketing Campaign Code */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  Marketing Campaign Code
                </label>
                <div className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-semibold text-gray-700 font-mono">
                  {customer?.marketingCampaignCode || '-'}
                </div>
              </div>

              {/* Source */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  Source
                </label>
                <div className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-semibold text-gray-700">
                  {customer?.source || customer?.leadSource || formData.source || '-'}
                </div>
              </div>

              {/* Channel */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  Channel
                </label>
                <div className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-semibold text-gray-700">
                  {customer?.channel || '-'}
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
