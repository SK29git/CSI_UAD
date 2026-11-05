import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { linkVehicleToCustomer, submitCustomerDataVerification, apiFetch } from '../utils/api';
import { 
  FaCar, 
  FaExchangeAlt, 
  FaUserCheck, 
  FaUserPlus, 
  FaIdCard, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaGlobe, 
  FaMapMarkerAlt, 
  FaBuilding, 
  FaCalendarAlt, 
  FaSpinner, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaTimes, 
  FaSearch,
  FaFileContract,
  FaShieldAlt
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
  'Umm Al Quwain'
];
const AUTHORITY_OPTIONS = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
  'Federal'
];
const VERIFIED_OPTIONS_EXISTING = ['DU', 'DV', 'VERIFIED', 'NOT_VERIFIED'];
const VERIFIED_OPTIONS_NEW = ['DV', 'DU', 'VERIFIED', 'NOT_VERIFIED'];

export default function VehicleOwnershipTransferModal({ 
  isOpen = false, 
  onClose, 
  initialVin = '', 
  initialGroup = '', 
  onSuccess 
}) {
  const { 
    customer, 
    vehicles = [], 
    selectedVin, 
    agentId, 
    group: contextGroup 
  } = useCustomer();

  // Mode: 'EXISTING' = Transfer to existing customer | 'NEW' = Link to new customer
  const [transferMode, setTransferMode] = useState('EXISTING');

  // Common Header State
  const defaultGroup = initialGroup || contextGroup || customer?.keyloopGroup || 'BMW';
  const defaultVin = initialVin || selectedVin || (vehicles.length > 0 ? (vehicles[0].vin || vehicles[0].chassisNumber) : '') || '';
  
  const [group, setGroup] = useState(defaultGroup);
  const [vin, setVin] = useState(defaultVin);

  // Mode A: Existing Customer State (Payload 1)
  const [existingCustomerId, setExistingCustomerId] = useState('');
  const [existingCustomerName, setExistingCustomerName] = useState('');
  const [existingNationality, setExistingNationality] = useState('');
  const [existingDataVerified, setExistingDataVerified] = useState('DU');
  const [existingDataVerifiedPeriod, setExistingDataVerifiedPeriod] = useState('');
  const [previousRegNo, setPreviousRegNo] = useState('');
  const [previousRegDate, setPreviousRegDate] = useState('');

  // Mode A Quick Search State
  const [lookupQuery, setLookupQuery] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupFeedback, setLookupFeedback] = useState(null);

  // Mode B: New Customer State (Payload 2)
  const [newTitleCode, setNewTitleCode] = useState('Mr.');
  const [newFirstName, setNewFirstName] = useState('');
  const [newSurname, setNewSurname] = useState('');
  const [newArea, setNewArea] = useState('Deira');
  const [newCity, setNewCity] = useState('Dubai');
  const [newCountry, setNewCountry] = useState('United Arab Emirates');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNationality, setNewNationality] = useState('');
  const [newIdCardNumber, setNewIdCardNumber] = useState('');
  const [newIdIssuingAuthority, setNewIdIssuingAuthority] = useState('Dubai');
  const [newIdExpiryDate, setNewIdExpiryDate] = useState('');
  const [newDataVerified, setNewDataVerified] = useState('DV');

  // Submission & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Customer Data Verification State (CUSTOMER_DATA_VERIFICATION)
  const [documentsVerified, setDocumentsVerified] = useState('Yes');
  const [trackEmiratesIdVerification, setTrackEmiratesIdVerification] = useState('Yes');
  const [trackMulkiyaVerification, setTrackMulkiyaVerification] = useState('No');
  const [isVerifyingData, setIsVerifyingData] = useState(false);
  const [isDataVerified, setIsDataVerified] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState(null);

  // Reset or initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      setGroup(initialGroup || contextGroup || customer?.keyloopGroup || 'BMW');
      setVin(initialVin || selectedVin || (vehicles.length > 0 ? (vehicles[0].vin || vehicles[0].chassisNumber) : '') || '');
      
      if (customer && !existingCustomerId) {
        const cNum = customer.customerNumber || customer.customerId || '';
        const cName = customer.fullName || `${customer.firstName || ''} ${customer.surname || ''}`.trim() || '';
        const cNat = customer.nationality || '';
        if (cNum) setExistingCustomerId(String(cNum));
        if (cName) setExistingCustomerName(cName);
        if (cNat) setExistingNationality(cNat);
      }

      setFeedback(null);
      setLookupFeedback(null);
      setVerificationFeedback(null);
      setIsDataVerified(false);
    }
  }, [isOpen, initialVin, initialGroup, contextGroup, customer, selectedVin, vehicles]);

  if (!isOpen) return null;

  // Quick lookup customer by Customer ID or Mobile
  const handleLookupExistingCustomer = async (e) => {
    if (e) e.preventDefault();
    const q = lookupQuery.trim();
    if (!q) return;

    setIsLookingUp(true);
    setLookupFeedback(null);

    try {
      let cust = null;
      // 1. Try customer number lookup
      if (/^\d{3,10}$/.test(q)) {
        const url = `/api/v1/customers?group=${encodeURIComponent(group)}&customerNumber=${encodeURIComponent(q)}`;
        const res = await apiFetch(url);
        if (res && res.ok && res.data) {
          const list = Array.isArray(res.data) ? res.data : [res.data];
          if (list.length > 0) cust = list[0];
        }
      }

      // 2. Try mobile lookup fallback
      if (!cust) {
        const cleanDigits = q.replace(/\D/g, '');
        if (cleanDigits.length >= 7) {
          const url = `/api/v1/customers?group=${encodeURIComponent(group)}&mobile=${encodeURIComponent(cleanDigits)}`;
          const res = await apiFetch(url);
          if (res && res.ok && res.data) {
            const list = Array.isArray(res.data) ? res.data : [res.data];
            if (list.length > 0) cust = list[0];
          }
        }
      }

      // 3. Fallback to Profile API directly if query looks like customer number
      if (!cust && /^\d+$/.test(q)) {
        const profRes = await apiFetch(`/api/v1/customers/${encodeURIComponent(group)}/${encodeURIComponent(q)}/profile`);
        if (profRes && profRes.ok && profRes.data) {
          cust = profRes.data;
        }
      }

      if (cust) {
        const foundId = cust.customerNumber || cust.id || q;
        const foundName = cust.fullName || `${cust.firstName || ''} ${cust.surname || ''}`.trim() || cust.name || '';
        const foundNat = cust.nationality || '';

        setExistingCustomerId(foundId);
        setExistingCustomerName(foundName);
        if (foundNat) setExistingNationality(foundNat);

        setLookupFeedback({
          type: 'success',
          message: `Customer found: ${foundName} (#${foundId})`
        });
      } else {
        setLookupFeedback({
          type: 'error',
          message: `No customer record found for "${q}" in ${group}`
        });
      }
    } catch (err) {
      setLookupFeedback({
        type: 'error',
        message: err.message || 'Lookup failed'
      });
    } finally {
      setIsLookingUp(false);
    }
  };

  // Independent Customer Data Verification Submission (CUSTOMER_DATA_VERIFICATION)
  const handleVerifyCustomerData = async (e) => {
    if (e) e.preventDefault();
    if (isDataVerified || isVerifyingData) return;
    setVerificationFeedback(null);

    const targetCustomerId = transferMode === 'EXISTING'
      ? (existingCustomerId.trim() || customer?.customerNumber || customer?.customerId || '')
      : (customer?.customerNumber || customer?.customerId || '');

    const targetCustomerName = transferMode === 'EXISTING'
      ? (existingCustomerName.trim() || customer?.fullName || `${customer?.firstName || ''} ${customer?.surname || ''}`.trim() || '')
      : `${newFirstName || ''} ${newSurname || ''}`.trim() || customer?.fullName || '';

    if (!targetCustomerId) {
      setVerificationFeedback({
        type: 'error',
        message: 'Customer ID is required for data verification.'
      });
      return;
    }

    if (!targetCustomerName) {
      setVerificationFeedback({
        type: 'error',
        message: 'Customer Name is required for data verification.'
      });
      return;
    }

    setIsVerifyingData(true);
    try {
      const payload = {
        group: group.trim() || 'BMW',
        customerId: String(targetCustomerId).trim(),
        customerName: String(targetCustomerName).trim(),
        documentsVerified: String(documentsVerified).trim(),
        trackEmiratesIdVerification: String(trackEmiratesIdVerification).trim(),
        trackMulkiyaVerification: String(trackMulkiyaVerification).trim()
      };

      const res = await submitCustomerDataVerification(payload, {
        createdBy: agentId || 'genesys'
      });

      if (res && (res.ok || res.taskId)) {
        setIsDataVerified(true);
        setVerificationFeedback(null);
      } else {
        throw new Error(res?.error || res?.errorMessage || 'Data verification failed');
      }
    } catch (err) {
      console.warn("Customer data verification error:", err);
      setIsDataVerified(false);
      setVerificationFeedback({
        type: 'error',
        message: err.message || 'Failed to submit data verification.'
      });
    } finally {
      setIsVerifyingData(false);
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    const cleanVin = String(vin || '').trim().toUpperCase();
    if (!cleanVin) {
      setFeedback({ type: 'error', message: 'Vehicle VIN is required.' });
      return;
    }

    if (!group) {
      setFeedback({ type: 'error', message: 'Brand Group is required.' });
      return;
    }

    setIsSubmitting(true);

    try {
      let details = {};

      if (transferMode === 'EXISTING') {
        // Payload 1: Vehicle transfer ownership to an existing customer
        if (!existingCustomerId.trim()) {
          setIsSubmitting(false);
          setFeedback({ type: 'error', message: 'Target Customer ID is required.' });
          return;
        }
        if (!existingCustomerName.trim()) {
          setIsSubmitting(false);
          setFeedback({ type: 'error', message: 'Target Customer Name is required.' });
          return;
        }

        details = {
          group: group.trim(),
          vin: cleanVin,
          customerId: existingCustomerId.trim(),
          customerName: existingCustomerName.trim(),
          dataVerified: existingDataVerified.trim() || "DU",
          dataVerifiedPeriod: existingDataVerifiedPeriod.trim(),
          nationality: existingNationality.trim(),
          previousRegistrationNumber: previousRegNo.trim(),
          previousRegistrationDate: previousRegDate.trim()
        };
      } else {
        // Payload 2: Vehicle Link ownership to a new customer
        if (!newFirstName.trim()) {
          setIsSubmitting(false);
          setFeedback({ type: 'error', message: 'First Name is required.' });
          return;
        }
        if (!newSurname.trim()) {
          setIsSubmitting(false);
          setFeedback({ type: 'error', message: 'Surname is required.' });
          return;
        }
        if (!newMobile.trim()) {
          setIsSubmitting(false);
          setFeedback({ type: 'error', message: 'Mobile Number is required.' });
          return;
        }

        details = {
          group: group.trim(),
          vin: cleanVin,
          titleCode: newTitleCode.trim() || "Mr.",
          firstName: newFirstName.trim(),
          surname: newSurname.trim(),
          area: newArea.trim() || "Deira",
          city: newCity.trim() || "Dubai",
          country: newCountry.trim() || "United Arab Emirates",
          mobile: newMobile.trim(),
          email: newEmail.trim(),
          nationality: newNationality.trim(),
          idCardNumber: newIdCardNumber.trim(),
          idIssuingAuthority: newIdIssuingAuthority.trim() || "Dubai",
          idExpiryDate: newIdExpiryDate.trim(),
          dataVerified: newDataVerified.trim() || "DV"
        };
      }

      const res = await linkVehicleToCustomer(details, {
        createdBy: agentId || "genesys"
      });

      // 2. Submit Customer Data Verification Case (CUSTOMER_DATA_VERIFICATION) if not already verified
      const targetCustId = transferMode === 'EXISTING' ? existingCustomerId.trim() : (customer?.customerNumber || '');
      const targetCustName = transferMode === 'EXISTING' ? existingCustomerName.trim() : `${newFirstName} ${newSurname}`.trim();
      
      if (!isDataVerified && targetCustId && targetCustName) {
        try {
          await submitCustomerDataVerification({
            group: group.trim() || 'BMW',
            customerId: String(targetCustId).trim(),
            customerName: String(targetCustName).trim(),
            documentsVerified: String(documentsVerified).trim(),
            trackEmiratesIdVerification: String(trackEmiratesIdVerification).trim(),
            trackMulkiyaVerification: String(trackMulkiyaVerification).trim()
          }, {
            createdBy: agentId || 'genesys'
          });
          setIsDataVerified(true);
        } catch (verifErr) {
          console.warn("Background data verification submission failed:", verifErr);
        }
      }

      if (res && res.ok) {
        setFeedback({
          type: 'success',
          message: transferMode === 'EXISTING'
            ? 'Vehicle ownership successfully transferred to existing customer!'
            : 'Vehicle ownership successfully linked to new customer!'
        });

        if (onSuccess) {
          onSuccess({ details, result: res });
        }

        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        throw new Error(res?.errorMessage || 'Vehicle ownership transfer request failed.');
      }
    } catch (err) {
      console.warn("Ownership transfer submission error:", err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to submit vehicle ownership transfer.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl overflow-hidden flex flex-col my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-300 flex items-center justify-center font-bold shadow-xs">
              <FaExchangeAlt className="text-lg" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-wide flex items-center gap-2">
                Vehicle Ownership Transfer
              </h3>
              <p className="text-[11px] text-blue-200/80 font-normal">
                Link or transfer vehicle ownership in Keyloop DMS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Feedback Alert Bar */}
        {feedback && (
          <div className={`px-5 py-2.5 text-xs font-semibold flex items-center gap-2 border-b ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            {feedback.type === 'success' ? (
              <FaCheckCircle className="text-emerald-600 shrink-0 text-sm" />
            ) : (
              <FaExclamationTriangle className="text-rose-600 shrink-0 text-sm" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs max-h-[82vh] overflow-y-auto">
          
          {/* Section 1: Vehicle & Brand Association */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                <FaCar className="text-blue-600" /> Target Vehicle Information
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                {group} DMS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Group / Brand Selector */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <FaBuilding className="text-gray-400 text-[10px]" /> Brand / Group <span className="text-rose-500">*</span>
                </label>
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  className="w-full p-2 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
                  required
                >
                  {GROUP_OPTIONS.map((grp) => (
                    <option key={grp} value={grp}>{grp}</option>
                  ))}
                </select>
              </div>

              {/* VIN Input */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <FaCar className="text-gray-400 text-[10px]" /> Vehicle VIN / Chassis <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    placeholder="e.g. WBAFG8102BL286693"
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-600 shadow-2xs uppercase"
                    required
                  />
                  {vehicles && vehicles.length > 1 && (
                    <div className="mt-1 flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-gray-400">Fleet Quick Pick:</span>
                      {vehicles.slice(0, 3).map((v) => {
                        const vVin = v.vin || v.chassisNumber;
                        if (!vVin) return null;
                        return (
                          <button
                            key={vVin}
                            type="button"
                            onClick={() => setVin(vVin)}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono hover:bg-blue-100 cursor-pointer"
                          >
                            {vVin.slice(-6)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Mode Toggle Tabs */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 mb-1.5 block uppercase tracking-wider">
              Transfer Ownership Destination
            </label>
            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setTransferMode('EXISTING')}
                className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  transferMode === 'EXISTING'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <FaUserCheck className="text-sm" />
                <span>Existing Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setTransferMode('NEW')}
                className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  transferMode === 'NEW'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <FaUserPlus className="text-sm" />
                <span>New Customer</span>
              </button>
            </div>
          </div>

          {/* Section 3A: Existing Customer Form */}
          {transferMode === 'EXISTING' && (
            <div className="flex flex-col gap-3.5 bg-blue-50/40 p-4 rounded-xl border border-blue-200/80 animate-in fade-in duration-200">
              
              {/* Quick Customer Lookup Search Bar */}
              <div className="bg-white p-2.5 rounded-lg border border-blue-200 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase text-blue-900 block mb-1.5">
                  Quick Customer Lookup (Optional)
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      placeholder="Enter Customer ID or Mobile (e.g. 462486)..."
                      className="w-full pl-7 pr-3 py-1.5 bg-gray-50 hover:bg-white focus:bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-600"
                    />
                    <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-[10px]" />
                  </div>
                  <button
                    type="button"
                    onClick={handleLookupExistingCustomer}
                    disabled={isLookingUp || !lookupQuery.trim()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold rounded-md shadow-2xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    {isLookingUp ? <FaSpinner className="animate-spin text-xs" /> : <FaSearch className="text-xs" />}
                    <span>Lookup</span>
                  </button>
                </div>
                {lookupFeedback && (
                  <div className={`mt-2 text-[11px] font-semibold flex items-center gap-1.5 ${
                    lookupFeedback.type === 'success' ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {lookupFeedback.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                    <span>{lookupFeedback.message}</span>
                  </div>
                )}
              </div>

              {/* Mode A Primary Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Customer ID */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    Customer ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={existingCustomerId}
                    onChange={(e) => setExistingCustomerId(e.target.value)}
                    placeholder="e.g. 462486"
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-blue-600 shadow-2xs"
                    required
                  />
                </div>

                {/* Customer Full Name */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={existingCustomerName}
                    onChange={(e) => setExistingCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Verma"
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-blue-600 shadow-2xs"
                    required
                  />
                </div>

                {/* Nationality */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaGlobe className="text-gray-400 text-[10px]" /> Nationality
                  </label>
                  <input
                    type="text"
                    value={existingNationality}
                    onChange={(e) => setExistingNationality(e.target.value)}
                    placeholder="e.g. India"
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-blue-600 shadow-2xs"
                  />
                </div>

                {/* Data Verified Code */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    Data Verified Status
                  </label>
                  <select
                    value={existingDataVerified}
                    onChange={(e) => setExistingDataVerified(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
                  >
                    {VERIFIED_OPTIONS_EXISTING.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Data Verified Period */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    Verification Period
                  </label>
                  <input
                    type="text"
                    value={existingDataVerifiedPeriod}
                    onChange={(e) => setExistingDataVerifiedPeriod(e.target.value)}
                    placeholder="e.g. 1 Year / Q1"
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-blue-600 shadow-2xs"
                  />
                </div>

                {/* Previous Registration Number (Plate) */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    Previous Registration # (Plate)
                  </label>
                  <input
                    type="text"
                    value={previousRegNo}
                    onChange={(e) => setPreviousRegNo(e.target.value.toUpperCase())}
                    placeholder="e.g. DXB A12345"
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-blue-600 shadow-2xs uppercase"
                  />
                </div>

                {/* Previous Registration Date */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaCalendarAlt className="text-gray-400 text-[10px]" /> Previous Registration Date
                  </label>
                  <input
                    type="date"
                    value={previousRegDate}
                    onChange={(e) => setPreviousRegDate(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-blue-600 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3B: New Customer Form */}
          {transferMode === 'NEW' && (
            <div className="flex flex-col gap-3.5 bg-emerald-50/40 p-4 rounded-xl border border-emerald-200/80 animate-in fade-in duration-200">
              <span className="text-[11px] font-extrabold uppercase text-emerald-900 block">
                New Customer Profile & Identification
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Title */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 block">
                    Title
                  </label>
                  <select
                    value={newTitleCode}
                    onChange={(e) => setNewTitleCode(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
                  >
                    {TITLE_OPTIONS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* First Name */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 block">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="e.g. Hammad"
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                    required
                  />
                </div>

                {/* Surname */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 block">
                    Surname <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSurname}
                    onChange={(e) => setNewSurname(e.target.value)}
                    placeholder="e.g. Test"
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Mobile */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaPhoneAlt className="text-gray-400 text-[10px]" /> Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                    placeholder="e.g. 050852369"
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaEnvelope className="text-gray-400 text-[10px]" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. customer@example.com"
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                  />
                </div>

                {/* Nationality */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaGlobe className="text-gray-400 text-[10px]" /> Nationality
                  </label>
                  <input
                    type="text"
                    value={newNationality}
                    onChange={(e) => setNewNationality(e.target.value)}
                    placeholder="e.g. India"
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                  />
                </div>

                {/* Area */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-gray-400 text-[10px]" /> Area
                  </label>
                  <input
                    type="text"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    placeholder="e.g. Deira"
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 block">
                    City
                  </label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
                  >
                    {CITY_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 block">
                    Country
                  </label>
                  <input
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* Identity Details Card */}
              <div className="bg-white p-3 rounded-lg border border-emerald-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Emirates ID Card Number */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaIdCard className="text-gray-400 text-[10px]" /> ID Card # (Emirates ID)
                  </label>
                  <input
                    type="text"
                    value={newIdCardNumber}
                    onChange={(e) => setNewIdCardNumber(e.target.value)}
                    placeholder="e.g. 784200012345612"
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-mono font-semibold text-gray-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                  />
                </div>

                {/* Issuing Authority */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 block">
                    Issuing Authority
                  </label>
                  <select
                    value={newIdIssuingAuthority}
                    onChange={(e) => setNewIdIssuingAuthority(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
                  >
                    {AUTHORITY_OPTIONS.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                {/* ID Expiry Date */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                    <FaCalendarAlt className="text-gray-400 text-[10px]" /> ID Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newIdExpiryDate}
                    onChange={(e) => setNewIdExpiryDate(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
                  />
                </div>

                {/* Data Verified */}
                <div className="sm:col-span-3 pt-1 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-700">Verification Code:</span>
                  <select
                    value={newDataVerified}
                    onChange={(e) => setNewDataVerified(e.target.value)}
                    className="p-1.5 bg-gray-50 border border-gray-300 rounded font-bold text-gray-900 text-xs focus:outline-none cursor-pointer"
                  >
                    {VERIFIED_OPTIONS_NEW.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Customer Data Verification (RPA Intake) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shadow-2xs">
                  <FaShieldAlt />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    Customer Data Verification
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Verify documents, Emirates ID, and Mulkiya registration for Keyloop CRM
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isDataVerified ? (
                  <button
                    type="button"
                    disabled
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 text-white border border-emerald-600 shadow-2xs flex items-center gap-1.5 cursor-default select-none transition-all"
                    title="Customer data has been verified and case is queued"
                  >
                    <FaCheckCircle className="text-white text-[10px]" />
                    <span>Data Verified</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleVerifyCustomerData}
                    disabled={isVerifyingData}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    title="Submit data verification case"
                  >
                    {isVerifyingData ? <FaSpinner className="animate-spin text-[10px]" /> : <FaCheckCircle className="text-[10px]" />}
                    <span>{isVerifyingData ? 'Verifying...' : 'Verify Data Now'}</span>
                  </button>
                )}
              </div>
            </div>

            {verificationFeedback && verificationFeedback.type === 'error' && (
              <div className="p-2 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-200">
                <FaExclamationTriangle className="text-rose-600 shrink-0 text-xs" />
                <span>{verificationFeedback.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-0.5">
              
              {/* 1. Documents Verified */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between gap-2">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <FaFileContract className="text-blue-600 text-xs" />
                  <span>Documents Verified <span className="text-rose-500">*</span></span>
                </label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="documentsVerified"
                      value="Yes"
                      checked={documentsVerified === 'Yes'}
                      onChange={(e) => setDocumentsVerified(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className={documentsVerified === 'Yes' ? 'text-emerald-700 font-bold' : ''}>Yes</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="documentsVerified"
                      value="No"
                      checked={documentsVerified === 'No'}
                      onChange={(e) => setDocumentsVerified(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className={documentsVerified === 'No' ? 'text-rose-700 font-bold' : ''}>No</span>
                  </label>
                </div>
              </div>

              {/* 2. Track Emirates ID Verification */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between gap-2">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <FaIdCard className="text-indigo-600 text-xs" />
                  <span>Track Emirates ID <span className="text-rose-500">*</span></span>
                </label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="trackEmiratesIdVerification"
                      value="Yes"
                      checked={trackEmiratesIdVerification === 'Yes'}
                      onChange={(e) => setTrackEmiratesIdVerification(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className={trackEmiratesIdVerification === 'Yes' ? 'text-emerald-700 font-bold' : ''}>Yes</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="trackEmiratesIdVerification"
                      value="No"
                      checked={trackEmiratesIdVerification === 'No'}
                      onChange={(e) => setTrackEmiratesIdVerification(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className={trackEmiratesIdVerification === 'No' ? 'text-rose-700 font-bold' : ''}>No</span>
                  </label>
                </div>
              </div>

              {/* 3. Track Mulkiya Verification */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between gap-2">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <FaCar className="text-emerald-600 text-xs" />
                  <span>Track Mulkiya <span className="text-rose-500">*</span></span>
                </label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="trackMulkiyaVerification"
                      value="Yes"
                      checked={trackMulkiyaVerification === 'Yes'}
                      onChange={(e) => setTrackMulkiyaVerification(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className={trackMulkiyaVerification === 'Yes' ? 'text-emerald-700 font-bold' : ''}>Yes</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="trackMulkiyaVerification"
                      value="No"
                      checked={trackMulkiyaVerification === 'No'}
                      onChange={(e) => setTrackMulkiyaVerification(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className={trackMulkiyaVerification === 'No' ? 'text-rose-700 font-bold' : ''}>No</span>
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* Modal Action Buttons Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 rounded-xl text-white font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                transferMode === 'EXISTING'
                  ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                  : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400'
              }`}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin text-sm" />
                  <span>Submitting Case...</span>
                </>
              ) : (
                <>
                  <FaExchangeAlt className="text-xs" />
                  <span>
                    {transferMode === 'EXISTING'
                      ? 'Submit Transfer Ownership'
                      : 'Submit Link Ownership'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
