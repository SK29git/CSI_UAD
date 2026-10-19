import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
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
  FaSave
} from 'react-icons/fa';

const GROUP_OPTIONS = ['BMW', 'MINI', 'ROLLS-ROYCE', 'GEELY'];
const TITLE_OPTIONS = ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Eng.', 'Sheikh', 'Sheikha'];
const BRANCH_OPTIONS = [
  '10 - Sheikh Zayed Rd',
  '20 - Deira',
  '30 - Sharjah',
  '40 - Ras Al Khaimah',
  '50 - Fujairah',
  '60 - Al Ain',
  '70 - Dubai Investment Park'
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

export default function CustomerFormView({ mode = 'create', onClose }) {
  const { 
    customer, 
    currentMobile, 
    currentGroup, 
    createCustomer, 
    updateCustomer 
  } = useCustomer();

  const [formData, setFormData] = useState({
    group: 'BMW',
    branch: '10 - Sheikh Zayed Rd',
    titleCode: 'Mr.',
    firstName: '',
    surname: '',
    area: 'Deira',
    city: 'Dubai',
    country: 'United Arab Emirates',
    mobile: '',
    email: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (mode === 'edit' && customer) {
      setFormData({
        group: customer.keyloopGroup || currentGroup || 'BMW',
        branch: customer.preferredBranch || (customer.branchCode ? `${customer.branchCode} - Sheikh Zayed Rd` : '10 - Sheikh Zayed Rd'),
        titleCode: customer.salutation || 'Mr.',
        firstName: customer.firstName || '',
        surname: customer.surname || '',
        area: customer.location?.area || 'Deira',
        city: customer.location?.city || 'Dubai',
        country: customer.nationality || 'United Arab Emirates',
        mobile: customer.mobileRaw || (customer.mobile ? customer.mobile.replace(/\D/g, '') : (currentMobile ? currentMobile.replace(/\D/g, '') : '')),
        email: customer.email && !customer.email.includes('***') ? customer.email : ''
      });
    } else {
      setFormData({
        group: currentGroup || customer?.keyloopGroup || 'BMW',
        branch: customer?.preferredBranch || '10 - Sheikh Zayed Rd',
        titleCode: 'Mr.',
        firstName: '',
        surname: '',
        area: 'Deira',
        city: 'Dubai',
        country: 'United Arab Emirates',
        mobile: currentMobile ? currentMobile.replace(/\D/g, '') : '',
        email: ''
      });
    }
    setFeedback(null);
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
          setFeedback({
            type: 'success',
            message: `Customer ${res.customer.fullName} registered successfully with Customer ID #${res.customer.customerNumber}!`
          });
          setTimeout(() => {
            if (onClose) onClose();
          }, 1400);
        } else {
          setFeedback({ type: 'error', message: 'Failed to create customer record.' });
        }
      } else {
        const res = await updateCustomer(formData);
        if (res && res.ok) {
          setFeedback({
            type: 'success',
            message: `Customer profile updated successfully!`
          });
          setTimeout(() => {
            if (onClose) onClose();
          }, 1400);
        } else {
          setFeedback({ type: 'error', message: 'Failed to update customer record.' });
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
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
          <div className={`p-3.5 rounded-lg border text-xs flex items-center gap-2.5 ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {feedback.type === 'success' ? <FaCheck className="text-emerald-600 text-sm shrink-0" /> : <FaExclamationTriangle className="text-rose-600 text-sm shrink-0" />}
            <span className="font-semibold text-xs">{feedback.message}</span>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, group: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                  {BRANCH_OPTIONS.map(br => (
                    <option key={br} value={br}>{br}</option>
                  ))}
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
