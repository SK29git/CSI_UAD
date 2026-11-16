import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCustomer } from '../context/CustomerContext';
import { 
  FaPhoneAlt, 
  FaEnvelope, 
  FaComments, 
  FaEllipsisH, 
  FaGlobe, 
  FaMapMarkerAlt,
  FaCheckCircle,
  FaInfoCircle,
  FaChevronRight,
  FaChevronLeft,
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle,
  FaUser,
  FaStickyNote,
  FaCrown,
  FaSpinner,
  FaUserPlus,
  FaEdit,
  FaCheckDouble,
  FaPaperPlane,
  FaUserCheck,
  FaStar,
  FaExternalLinkAlt,
  FaTimes,
  FaCar,
  FaUserTie
} from 'react-icons/fa';
import { getFullMobileNumber, getDisplayMobileNumber } from '../utils/phoneUtils';

export const E00MI_NOTE_FIELDS = [
  { key: 'notesFromBranch', label: 'Branch Notes' },
  { key: 'eventTaskNotes', label: 'Event Task Notes' },
  { key: 'leadOriginFromNotes', label: 'Lead Origin (Notes)' },
  { key: 'leadSourceFromNotes', label: 'Lead Source (Notes)' },
  { key: 'idNumberFromNotes', label: 'ID Number (Notes)' },
  { key: 'allocateFromNotes', label: 'Allocate (Notes)' },
  { key: 'titleFromNotes', label: 'Title (Notes)' },
  { key: 'firstnameFromNotes', label: 'First Name (Notes)' },
  { key: 'surnameFromNotes', label: 'Surname (Notes)' },
  { key: 'emailFromNotes', label: 'Email (Notes)' },
  { key: 'phoneFromNotes', label: 'Phone (Notes)' },
  { key: 'mobileFromNotes', label: 'Mobile (Notes)' },
  { key: 'notesFromContactSource', label: 'Contact Source (Notes)' },
  { key: 'makeFromNotes', label: 'Make (Notes)' },
  { key: 'modelFromNotes', label: 'Model (Notes)' },
  { key: 'stockNumberFromNotes', label: 'Stock Number (Notes)' },
  { key: 'notesFromRegno', label: 'Reg No (Notes)' },
  { key: 'notesFromTradeinReg', label: 'Trade-in Reg (Notes)' },
  { key: 'notesFromTradeinMake', label: 'Trade-in Make (Notes)' },
  { key: 'notesFromTradeinModel', label: 'Trade-in Model (Notes)' },
  { key: 'notesFromTradeinMileage', label: 'Trade-in Mileage (Notes)' },
  { key: 'notesFromYear', label: 'Trade-in Year (Notes)' },
  { key: 'notesFromTradeinNotes', label: 'Trade-in Condition Notes' },
  { key: 'notesFromUpdatemkagree', label: 'Marketing Agree (Notes)' },
  { key: 'notesFromDealersms', label: 'Dealer SMS Consent' },
  { key: 'notesFromDealeremail', label: 'Dealer Email Consent' },
  { key: 'notesFromDealerletter', label: 'Dealer Letter Consent' },
  { key: 'notesFromDealerphone', label: 'Dealer Phone Consent' },
  { key: 'notesFromPartssms', label: 'Parts SMS Consent' },
  { key: 'notesFromPartsemail', label: 'Parts Email Consent' },
  { key: 'notesFromPartsletter', label: 'Parts Letter Consent' },
  { key: 'notesFromPartsphone', label: 'Parts Phone Consent' },
  { key: 'notesFromSalessms', label: 'Sales SMS Consent' },
  { key: 'notesFromSalesemail', label: 'Sales Email Consent' },
  { key: 'notesFromSalesletter', label: 'Sales Letter Consent' },
  { key: 'notesFromSalesphone', label: 'Sales Phone Consent' },
  { key: 'notesFromServicesms', label: 'Service SMS Consent' },
  { key: 'notesFromServiceemail', label: 'Service Email Consent' },
  { key: 'notesFromServiceletter', label: 'Service Letter Consent' },
  { key: 'notesFromServicephone', label: 'Service Phone Consent' },
];

const cleanNoteText = (txt) => {
  if (!txt) return '';
  const s = String(txt).trim();
  return s.replace(/\[\d{4}[^\]]*\]/g, '').replace(/^Event:\s*/, '').trim();
};

export default function LeftSidebar({ isCollapsed = false, onToggleCollapse }) {
  const { 
    customer, 
    currentMobile,
    currentGroup,
    customerList, 
    selectedIndex, 
    selectCustomer, 
    loading, 
    getFormattedName, 
    getFormattedDate, 
    getFormattedLocation, 
    getBranchName, 
    getLoyaltyTier,
    getConsentsDisplay,
    riskOverview,
    verificationStatus,
    openCustomerForm,
    openVerificationModal,
    openSmsWidget,
    fetchCustomerByPlateOrVin,
    fetchCustomerByEmail,
    fetchCustomerByCustomerNumber,
    searchCustomer,
    customerMatches = [],
    prospectMatches = [],
    openAccountResolutionModal,
    selectAccount
  } = useCustomer();

  const customerName = getFormattedName ? getFormattedName() : '';
  const loyaltyTier = getLoyaltyTier ? getLoyaltyTier() : 'N/A';
  const customerSince = getFormattedDate ? getFormattedDate(customer?.customerSince) : (customer?.customerSince || 'N/A');
  const locationStr = getFormattedLocation ? getFormattedLocation() : '';
  const branchName = getBranchName ? getBranchName() : '';
  const customerId = customer?.customerNumber || customer?.id || '';
  const dobValue = customer?.dateOfBirth || customer?.dob || customer?.birthDate || customer?.DateOfBirth || customer?.date_of_birth || customer?.birth_date || customer?.individual?.dateOfBirth || customer?.personalDetails?.dateOfBirth;

  // Filter and deduplicate active phone numbers (never show null / empty)
  const activePhones = (() => {
    if (!customer) return [];
    const list = [];
    const seenDigits = new Set();

    const cleanCandidate = (currentMobile || '').replace(/\D/g, '');

    const resolveSlotValue = (raw) => {
      if (!raw || raw === 'null' || raw === 'N/A' || raw === '-' || !String(raw).trim()) return '';
      const str = String(raw).trim();
      const rawDigits = str.replace(/\D/g, '');
      if (str.includes('*') && cleanCandidate && rawDigits.length >= 2 && cleanCandidate.endsWith(rawDigits)) {
        return cleanCandidate;
      }
      return str;
    };

    const add = (label, raw) => {
      const str = resolveSlotValue(raw);
      if (!str) return;
      const digits = str.replace(/\D/g, '');
      const key = digits.length >= 7 ? digits.slice(-7) : (str.includes('*') ? digits : str);
      if (key && !seenDigits.has(key)) {
        seenDigits.add(key);
        list.push({ label, value: str });
      }
    };

    const p1 = resolveSlotValue(customer?.phone1 || customer?.telephoneNumber1 || customer?.mobile);
    const p2 = resolveSlotValue(customer?.phone2 || customer?.telephoneNumber2 || customer?.homePhone);
    const p3 = resolveSlotValue(customer?.phone3 || customer?.telephoneNumber3 || customer?.workPhone);
    const p4 = resolveSlotValue(customer?.phone4 || customer?.telephoneNumber4);

    const matchingSearched = [p1, p2, p3, p4].find(p => p === cleanCandidate);
    const primary = matchingSearched || p1 || customer?.mobile || customer?.mobileRaw;
    if (primary) {
      add('Primary', primary);
    }
    if (p1) add('Phone 1', p1);
    if (p2) add('Phone 2', p2);
    if (p3) add('Phone 3', p3);
    if (p4) add('Phone 4', p4);
    return list;
  })();

  // Filter and deduplicate active email addresses (never show null / empty)
  const activeEmails = (() => {
    if (!customer) return [];
    const list = [];
    const seenEmails = new Set();

    const add = (label, raw) => {
      if (!raw || raw === 'null' || raw === 'N/A' || raw === '-' || !String(raw).trim() || !String(raw).includes('@')) return;
      const str = String(raw).trim();
      const key = str.toLowerCase();
      if (!seenEmails.has(key)) {
        seenEmails.add(key);
        list.push({ label, value: str });
      }
    };

    if (customer?.email) add('Primary', customer.email);
    if (customer?.homeEmail) add(customer.homeEmailDescription || 'Home', customer.homeEmail);
    if (customer?.workEmail) add(customer.workEmailDescription || 'Work', customer.workEmail);
    if (customer?.otherEmail1) add(customer.otherEmail1Description || 'Other 1', customer.otherEmail1);
    if (customer?.otherEmail2) add(customer.otherEmail2Description || 'Other 2', customer.otherEmail2);
    return list;
  })();

  const hasRiskData = Boolean(
    riskOverview &&
    typeof riskOverview === 'object' &&
    (
      (riskOverview.riskLevel && String(riskOverview.riskLevel).trim() !== "") ||
      (riskOverview.riskScore !== null && riskOverview.riskScore !== undefined && String(riskOverview.riskScore).trim() !== "") ||
      (riskOverview.repeatComplaintCount !== null && riskOverview.repeatComplaintCount !== undefined && String(riskOverview.repeatComplaintCount).trim() !== "") ||
      (Array.isArray(riskOverview.repeatComplaints) ? riskOverview.repeatComplaints.length > 0 : Boolean(riskOverview.repeatComplaints && String(riskOverview.repeatComplaints).trim() !== ""))
    )
  );

  const hasVerificationData = Boolean(
    verificationStatus &&
    typeof verificationStatus === 'object' &&
    (
      verificationStatus.status ||
      verificationStatus.lastVerifiedBy ||
      verificationStatus.verifiedBy ||
      verificationStatus.lastVerifiedOn ||
      verificationStatus.lastEditedBy ||
      verificationStatus.lastEditedOn
    )
  );

  const hasNotesData = Boolean(
    customer?.isProspect ||
    (customer?.notes && String(customer?.notes).trim() !== "") ||
    E00MI_NOTE_FIELDS.some(f => Boolean(customer?.[f.key] && String(customer[f.key]).trim() !== ""))
  );

  // Notes Modal State & Computations
  const [showNotesModal, setShowNotesModal] = useState(false);

  const allModalNotes = (() => {
    const list = E00MI_NOTE_FIELDS.map(({ key, label }) => {
      const val = customer?.[key];
      const hasVal = val !== undefined && val !== null && String(val).trim() !== '';
      return { key, label, val, hasVal };
    });

    if (customer?.description && !customer.description.startsWith('Event:') && !customer.description.includes('E00MI')) {
      list.unshift({
        key: 'description',
        label: 'Event Description',
        val: customer.description,
        hasVal: true
      });
    }

    if (customer?.notes && !customer.isProspect) {
      const cleaned = cleanNoteText(customer.notes);
      list.unshift({
        key: 'generalNotes',
        label: 'Customer Notes',
        val: cleaned,
        hasVal: Boolean(cleaned)
      });
    }

    return list;
  })();

  const displayedModalNotes = allModalNotes;

  if (isCollapsed) {
    return (
      <div 
        onClick={onToggleCollapse}
        className="w-14 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-300 p-2 flex flex-col items-center gap-3 cursor-pointer hover:border-blue-500 transition-all duration-300 group py-4 select-none min-h-[300px]"
        title="Click to expand Customer Profile"
      >
        {/* Expand Toggle Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleCollapse && onToggleCollapse(); }}
          className="w-9 h-9 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center transition-colors shadow-2xs"
          title="Expand Customer Profile"
        >
          <FaChevronRight className="text-sm" />
        </button>

        <div className="w-7 h-[1px] bg-gray-200 my-1" />

        {/* Customer Initial Avatar */}
        <div 
          className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-xs"
          title={customerName && customerName !== 'N/A' ? `Customer: ${customerName}` : 'Customer Profile'}
        >
          {customerName && customerName !== 'Customer' && customerName !== 'N/A' ? customerName.charAt(0).toUpperCase() : <FaUser className="text-xs text-slate-500" />}
        </div>

        {/* Vertical Panel Title */}
        <div className="flex-1 flex items-center justify-center py-6 select-none">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest [writing-mode:vertical-lr] rotate-180 group-hover:text-blue-600 transition-colors">
            Customer Profile
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full sm:w-[260px] lg:w-[275px] xl:w-[295px] flex-shrink-0 flex flex-col gap-2.5 transition-all duration-300">
      {/* 1. Profile Overview Card */}
      <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200/90 relative">
        {/* Collapse Toggle Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-md bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-400 flex items-center justify-center transition-colors shadow-2xs z-10 cursor-pointer"
            title="Collapse Left Panel"
          >
            <FaChevronLeft className="text-[10px]" />
          </button>
        )}

        {loading ? (
          <div className="py-4 flex flex-col items-center justify-center gap-1.5 text-gray-500 text-xs">
            <FaSpinner className="animate-spin text-blue-600 text-base" />
            <span className="text-[11px]">Fetching Customer Details...</span>
          </div>
        ) : !customer ? (
          <div className="py-3 px-1 flex flex-col items-center justify-center gap-1 text-gray-500 text-xs text-center">
            <div className="w-8 h-8 rounded-full bg-blue-50/80 border border-blue-100/70 flex items-center justify-center text-blue-500 mb-0.5 shadow-2xs">
              <FaUser className="text-xs" />
            </div>
            <span className="font-bold text-gray-900 text-xs">No Customer Profile</span>
            <span className="text-[10px] text-gray-400 max-w-[210px] leading-tight">
              Use the Home tab to search or create a new customer.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mb-3">
            {/* Return to Customer Switcher (ONLY shown when currently viewing a prospect) */}
            {customer?.isProspect && customerMatches && customerMatches.length > 0 && (
              <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs mb-1 shadow-2xs animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-200/80 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      if (customerMatches.length > 0 && selectAccount) {
                        selectAccount(customerMatches[0], true);
                      }
                    }}
                    className="py-1 px-2 rounded-md text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-gray-700 hover:bg-white hover:text-blue-700 hover:shadow-2xs"
                    title="Go back to Verified Customer Profile"
                  >
                    <FaUserCheck className="text-[10px] text-blue-600" />
                    <span>Customer {customerMatches.length > 1 ? `(${customerMatches.length})` : ''}</span>
                  </button>

                  <div
                    className="py-1 px-2 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 bg-amber-600 text-white shadow-xs"
                    title="Currently viewing prospect"
                  >
                    <FaStar className="text-[10px]" />
                    <span>Prospects ({prospectMatches.length})</span>
                  </div>
                </div>
              </div>
            )}

            {/* Multi-Customer Account Switcher (only shown if viewing customer AND multiple customer accounts exist) */}
            {!customer?.isProspect && customerMatches && customerMatches.length > 1 && (
              <div className="p-2 bg-blue-50/70 border border-blue-200 rounded-xl text-xs mb-1 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                    <FaUserCheck className="text-blue-600" />
                    <span>Customer Accounts ({customerMatches.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => openAccountResolutionModal && openAccountResolutionModal()}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                    title="Open customer selection modal"
                  >
                    <span>Switch</span>
                    <FaExternalLinkAlt className="text-[8px]" />
                  </button>
                </div>

                <select
                  value={customer?.customerNumber || customer?.id || ''}
                  onChange={(e) => {
                    const found = customerMatches.find(c => String(c.customerNumber || c.id) === String(e.target.value));
                    if (found && selectAccount) selectAccount(found, true);
                  }}
                  className="w-full bg-white border border-blue-300 rounded-lg px-2 py-1 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {customerMatches.map((c, idx) => (
                    <option key={c.customerNumber || idx} value={c.customerNumber || c.id}>
                      {c.fullName || `${c.firstName || ''} ${c.surname || ''}`.trim() || 'Customer'} (#{c.customerNumber || c.id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="font-bold text-gray-900 text-base leading-tight truncate">{customerName}</h2>
                  <button
                    type="button"
                    onClick={() => openCustomerForm('edit')}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 transition-colors shadow-2xs"
                    title="Edit Customer Profile (Mobile, Name, Email, Address, etc.)"
                  >
                    <FaEdit className="text-[10px]" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openVerificationModal && openVerificationModal()}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-300 transition-colors shadow-2xs"
                    title="Customer Data Verification (RPA Intake)"
                  >
                    <FaCheckDouble className="text-[10px]" />
                    <span>Verify</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openSmsWidget && openSmsWidget()}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 border border-indigo-300 transition-colors shadow-2xs"
                    title="Send SMS via AGMC Gateway"
                  >
                    <FaPaperPlane className="text-[9px]" />
                    <span>SMS</span>
                  </button>

                  {customer?.status === 'Processing' || customer?.rpaStatus === 'Processing' || customer?.rpaTaskId ? (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                      <FaSpinner className="animate-spin text-[9px]" /> Processing
                    </span>
                  ) : customer?.isProspect ? (
                    <span className="bg-amber-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                      <span>★</span> PROSPECT
                    </span>
                  ) : (
                    <>
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                        <span>✓</span> {customer?.isNewRegistration || !customer?.customerNumber ? 'NEW CUSTOMER' : 'CUSTOMER'}
                      </span>
                      {customer?.vip === true && (
                        <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-xs">
                          <FaCrown className="text-[9px]" /> VIP
                        </span>
                      )}
                      {loyaltyTier !== 'N/A' && loyaltyTier !== 'NEW' && loyaltyTier !== 'PROSPECT' && (
                        <span className="bg-purple-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                          {loyaltyTier}
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div className="mt-1 space-y-1 text-xs text-gray-600">
                  {/* Phone Numbers - Only show non-null */}
                  {activePhones.length > 0 ? (
                    activePhones.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <FaPhoneAlt className="text-gray-400 text-[11px] shrink-0" />
                        <span className="font-medium truncate" title={`${p.label}: ${p.value}`}>
                          {activePhones.length > 1 && idx > 0 && (
                            <span className="text-[10px] text-gray-400 font-normal mr-1">{p.label}:</span>
                          )}
                          {p.value}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <FaPhoneAlt className="text-gray-400 text-[11px]" />
                      <span className="font-medium truncate">-</span>
                    </div>
                  )}

                  {/* Emails - Only show non-null */}
                  {activeEmails.length > 0 ? (
                    activeEmails.map((e, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <FaEnvelope className="text-gray-400 text-[11px] shrink-0" />
                        <span className="truncate max-w-[190px]" title={`${e.label}: ${e.value}`}>
                          {activeEmails.length > 1 && idx > 0 && (
                            <span className="text-[10px] text-gray-400 font-normal mr-1">{e.label}:</span>
                          )}
                          {e.value}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <FaEnvelope className="text-gray-400 text-[11px]" />
                      <span className="truncate max-w-[190px]">-</span>
                    </div>
                  )}
                  <div className="flex items-start gap-1.5">
                    <FaMapMarkerAlt className="text-gray-400 text-[11px] shrink-0 mt-0.5" />
                    <span 
                      className="text-xs text-gray-600 line-clamp-2 break-words leading-tight flex-1"
                      title={locationStr && locationStr !== 'N/A' ? locationStr.replace(/[\uFFFD\u0000-\u001F\u007F-\u009F]/g, '').trim() : ''}
                    >
                      {locationStr && locationStr !== 'N/A' ? locationStr.replace(/[\uFFFD\u0000-\u001F\u007F-\u009F]/g, '').trim() : '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaGlobe className="text-gray-400 text-[11px]" />
                    <span>{customer?.language || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 1.1 Sales Prospects Section (Buttons + Details) */}
      {prospectMatches && prospectMatches.length > 0 && (
        <div className="bg-white rounded-xl p-3 shadow-xs border border-amber-200/90 text-xs">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-amber-100">
            <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-[11px] uppercase tracking-wider">
              <FaStar className="text-amber-500 text-xs" />
              <span>Sales Prospects ({prospectMatches.length})</span>
            </div>
          </div>

          {/* Prospect Buttons 2-Column Grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {prospectMatches.map((pros, idx) => {
              const rawNo = pros.prospectNumber || (pros.isProspect ? (pros.customerNumber !== 'PROSPECT' ? pros.customerNumber : '') || pros.leadId || pros.enquiryNo : '') || '';
              const pNo = (rawNo && rawNo !== 'PROSPECT' && rawNo !== 'E00MI-LEAD' && !String(rawNo).startsWith('PR-')) ? String(rawNo) : '';
              
              // Only highlight this button if the active view is specifically this prospect
              const isSelected = Boolean(
                customer?.isProspect && (
                  (pros.leadId && String(customer.leadId) === String(pros.leadId)) ||
                  (pros.prospectNumber && String(customer.prospectNumber) === String(pros.prospectNumber)) ||
                  (pNo && (String(customer.prospectNumber) === pNo || String(customer.leadId) === pNo))
                )
              );

              return (
                <button
                  key={pros.prospectNumber || pros.leadId || idx}
                  type="button"
                  onClick={() => {
                    if (selectAccount) {
                      selectAccount(pros, true);
                    }
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-between gap-1 shadow-2xs ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-400/40'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 hover:border-amber-300'
                  }`}
                  title={`Open Prospect ${idx + 1} in Edit Profile`}
                >
                  <div className="flex items-center gap-1 truncate">
                    <FaStar className={`text-[9px] shrink-0 ${isSelected ? 'text-amber-200' : 'text-amber-500'}`} />
                    <span className="truncate">Prospect {idx + 1}</span>
                  </div>
                  {pNo && (
                    <span className={`text-[9px] font-mono shrink-0 ${isSelected ? 'text-amber-100' : 'text-amber-700'}`}>
                      #{pNo}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Customer Key Meta Data Table */}
      {customer && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-300 text-xs">
          <div className="max-h-[380px] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            <div>
              <span className="text-gray-400 block text-[11px]">
                {customer?.isProspect ? 'Prospect Since' : 'Customer Since'}
              </span>
              <span className="font-semibold text-gray-800">{customerSince}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">
                {customer?.isProspect ? 'Prospect ID' : 'Customer ID'}
              </span>
              <span className="font-semibold text-gray-800">
                {customer?.customerNumber && customer.customerNumber !== 'PROSPECT'
                  ? customer.customerNumber 
                  : (customer?.rpaTaskId || customer?.status === 'Processing' || customer?.isNewRegistration ? 'Processing' : (customer?.prospectNumber || customerId || '-'))}
              </span>
            </div>

            <div>
              <span className="text-gray-400 block text-[11px]">Initials</span>
              <span className="font-semibold text-gray-800">{customer?.initials || '-'}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Personal ID</span>
              <span className="font-semibold text-gray-800">{customer?.personalId || customer?.idCardNumber || '-'}</span>
            </div>

            <div>
              <span className="text-gray-400 block text-[11px]">Group / Brand</span>
              <span className="font-semibold text-gray-800">{customer?.keyloopGroup || "-"}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Last Updated</span>
              <span className="font-semibold text-gray-800">{getFormattedDate ? getFormattedDate(customer?.lastUpdated) : (customer?.lastUpdated || '-')}</span>
            </div>

            <div>
              <span className="text-gray-400 block text-[11px]">Address ID</span>
              <span className="font-mono font-semibold text-gray-800">{customer?.addressId || '-'}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Data Verification</span>
              <span className="font-semibold text-gray-800">{customer?.dataVerified || '-'}</span>
            </div>

            {customer?.isProspect ? (
              <>
                <div>
                  <span className="text-gray-400 block text-[11px]">Lead Source</span>
                  <span className="font-semibold text-indigo-700 truncate block">{customer?.leadSource || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Lead Status</span>
                  <span className="font-semibold text-amber-700">{customer?.status || '-'}</span>
                </div>
              </>
            ) : (customer?.isNewRegistration || !customer?.customerNumber || customer?.rpaTaskId || customer?.status === 'Processing') ? (
              <>
                <div>
                  <span className="text-gray-400 block text-[11px]">Registration Source</span>
                  <span className="font-semibold text-indigo-700 truncate block">
                    {customer?.leadSource && !customer.leadSource.toLowerCase().includes('agent inbound') ? customer.leadSource : 'Inbound'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Account Status</span>
                  <span className="font-semibold text-amber-600 flex items-center gap-1">
                    {customer?.rpaTaskId || customer?.status === 'Processing' || customer?.status === 'QUEUED' ? 'Processing' : (customer?.status || 'Active')}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-gray-400 block text-[11px]">Loyalty Tier</span>
                  <span className="font-semibold text-gray-800">{loyaltyTier !== 'N/A' ? loyaltyTier : '-'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Nationality</span>
                  <span className="font-semibold text-gray-800">{customer?.nationality || '-'}</span>
                </div>
              </>
            )}

            <div>
              <span className="text-gray-400 block text-[11px]">Date of Birth</span>
              <span className="font-semibold text-gray-800">{dobValue ? (getFormattedDate ? getFormattedDate(dobValue) : dobValue) : '-'}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Branch Code</span>
              <span className="font-semibold text-gray-800">{branchName || '-'}</span>
            </div>

            <div>
              <span className="text-gray-400 block text-[11px]">Do Not Contact</span>
              <span className={`font-semibold ${customer?.doNotContact ? 'text-rose-600' : 'text-emerald-600'}`}>
                {customer?.doNotContact ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Consents</span>
              <span className="font-medium text-gray-700">{getConsentsDisplay ? getConsentsDisplay() : 'None'}</span>
            </div>

            {customer?.isProspect && (
              <>
                <div>
                  <span className="text-gray-400 block text-[11px]">Link Type</span>
                  <span className="font-semibold text-gray-800">{customer?.linkType || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Prospect Number</span>
                  <span className="font-semibold text-gray-800">
                    {customer?.prospectNumber || (customer?.isProspect ? (customer?.customerNumber !== 'PROSPECT' ? customer?.customerNumber : null) || customer?.leadId || customer?.enquiryNo : null) || '-'}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Enquiry Number</span>
                  <span className="font-mono font-semibold text-blue-700">{customer?.enquiryNo || customer?.enquiryNumber || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Enquiry Status</span>
                  <span className="font-semibold text-amber-700">{customer?.statusOfEnquiry || customer?.status || '-'}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Assigned Advisor</span>
                  <span className="font-semibold text-gray-800 truncate block" title={customer?.followupUsername ? `${customer.followupUsername} ${customer.followupUserLocation ? `(${customer.followupUserLocation})` : ''}` : '-'}>
                    {customer?.followupUsername ? `${customer.followupUsername} ${customer.followupUserLocation ? `(${customer.followupUserLocation})` : ''}` : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Vehicle of Interest</span>
                  <span className="font-semibold text-blue-900 truncate block" title={customer?.vehicleDescription || [customer?.make, customer?.model].filter(Boolean).join(' ') || '-'}>
                    {customer?.vehicleDescription || [customer?.make, customer?.model].filter(Boolean).join(' ') || '-'}
                  </span>
                </div>

                {customer?.dateRequiredTo && (
                  <div>
                    <span className="text-gray-400 block text-[11px]">Date Required</span>
                    <span className="font-semibold text-gray-800">{customer.dateRequiredTo}</span>
                  </div>
                )}

                {customer?.eventTaskDate && (
                  <div className="col-span-2 pt-1 border-t border-gray-100">
                    <span className="text-gray-400 block text-[11px]">Scheduled Follow-Up</span>
                    <span className="font-semibold text-indigo-700">
                      {[customer.eventTaskDate, customer.eventTaskTime].filter(Boolean).join(' ')}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-gray-400 block text-[11px]">Campaign</span>
                  <span className="font-semibold text-gray-800 truncate block" title={customer?.campaign || '-'}>{customer?.campaign || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Marketing Campaign Code</span>
                  <span className="font-semibold text-gray-800 truncate block" title={customer?.marketingCampaignCode || '-'}>{customer?.marketingCampaignCode || '-'}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Source</span>
                  <span className="font-semibold text-gray-800 truncate block" title={customer?.source || customer?.leadSource || '-'}>{customer?.source || customer?.leadSource || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Channel</span>
                  <span className="font-semibold text-gray-800 truncate block" title={customer?.channel || '-'}>{customer?.channel || '-'}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Event Key</span>
                  <span className="font-mono text-gray-800 text-[11px] truncate block" title={customer?.eventKey || '-'}>{customer?.eventKey || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Event Type</span>
                  <span className="font-semibold text-gray-800">{customer?.eventType || '-'}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Created Date</span>
                  <span className="font-semibold text-gray-800">{customer?.createdDate ? `${customer.createdDate} ${customer.createdTime || ''}`.trim() : '-'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Creator Name</span>
                  <span className="font-semibold text-gray-800 truncate block" title={customer?.creatorName || '-'}>{customer?.creatorName || '-'}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Closed Date</span>
                  <span className="font-semibold text-gray-800">{customer?.closedDate ? `${customer.closedDate} ${customer.closedTime || ''}`.trim() : '-'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Closed Flag</span>
                  <span className="font-semibold text-gray-800">{customer?.closedFlag || '-'}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Manufacturer</span>
                  <span className="font-semibold text-gray-800 truncate block" title={customer?.manufacturer || '-'}>{customer?.manufacturer || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Vehicle Make / Model</span>
                  <span className="font-semibold text-gray-800 truncate block" title={[customer?.make, customer?.model].filter(Boolean).join(' ') || '-'}>
                    {[customer?.make, customer?.model].filter(Boolean).join(' ') || '-'}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Preferred Phone</span>
                  <span className="font-mono font-semibold text-gray-800">{customer?.preferredPhone || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Preferred Phone 2</span>
                  <span className="font-mono font-semibold text-gray-800">{customer?.preferredPhone2 || '-'}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">Preferred Email</span>
                  <span className="font-semibold text-gray-800 truncate block" title={customer?.preferredEmail || '-'}>{customer?.preferredEmail || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Home Phone</span>
                  <span className="font-mono font-semibold text-gray-800">{customer?.homePhone || '-'}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px]">KDB Timestamp</span>
                  <span className="font-mono text-gray-800 text-[10px] truncate block" title={customer?.kdbTimeStamp || '-'}>{customer?.kdbTimeStamp || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Advisor Location</span>
                  <span className="font-semibold text-gray-800 truncate block" title={customer?.followupUserLocation || '-'}>{customer?.followupUserLocation || '-'}</span>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      )}

      {/* 2b. Prospect Trade-In Vehicle Card (if present) */}
      {customer?.isProspect && customer?.hasTradeIn && (
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-amber-200 text-xs">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-amber-100">
            <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
              <FaCar className="text-amber-600 text-xs" />
              <span>Trade-In Vehicle</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Appraisal
            </span>
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-[11px]">
            <div className="col-span-2">
              <span className="text-gray-400 block text-[10px]">Vehicle</span>
              <span className="font-bold text-gray-800">
                {[customer.tradeInMake, customer.tradeInModel, customer.tradeInYear].filter(Boolean).join(' ') || 'Trade-in Record'}
              </span>
            </div>
            {customer.tradeInReg && (
              <div>
                <span className="text-gray-400 block text-[10px]">Plate / Reg</span>
                <span className="font-mono font-semibold text-gray-800">{customer.tradeInReg}</span>
              </div>
            )}
            {customer.tradeInMileage && (
              <div>
                <span className="text-gray-400 block text-[10px]">Mileage</span>
                <span className="font-semibold text-gray-800">{customer.tradeInMileage} KM</span>
              </div>
            )}
            {customer.tradeInNotes && (
              <div className="col-span-2 pt-1 border-t border-gray-100">
                <span className="text-gray-400 block text-[10px]">Notes</span>
                <span className="text-gray-700 italic text-[10px]">{customer.tradeInNotes}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Verification Status Card (Rendered strictly from GET /api/v1/customers/{group}/{customerNumber}/verification) */}
      {hasVerificationData && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-300 text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
            <span className="font-bold text-gray-800 flex items-center gap-1.5">
              Verification Status
            </span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                <FaCheckCircle className="text-xs" />
                <span>{verificationStatus.status || 'Verified'}</span>
              </div>
              <button
                type="button"
                onClick={() => openVerificationModal && openVerificationModal()}
                title="Customer Data Verification (RPA Intake)"
                className="text-emerald-700 hover:text-emerald-800 px-1.5 py-0.5 rounded hover:bg-emerald-50 border border-emerald-300 transition-colors flex items-center gap-1 text-[11px]"
              >
                <FaCheckDouble className="text-[10px]" />
                <span className="font-bold">Verify</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5 text-gray-600">
            {(verificationStatus.lastVerifiedBy || verificationStatus.verifiedBy) && (
              <div className="flex justify-between">
                <span className="text-gray-400">Last Verified By</span>
                <span className="font-medium text-gray-800">{verificationStatus.lastVerifiedBy || verificationStatus.verifiedBy}</span>
              </div>
            )}
            {verificationStatus.lastVerifiedOn && (
              <div className="flex justify-between">
                <span className="text-gray-400">Last Verified On</span>
                <span className="font-medium text-gray-800">{verificationStatus.lastVerifiedOn}</span>
              </div>
            )}
            {verificationStatus.lastEditedBy && (
              <div className="flex justify-between">
                <span className="text-gray-400">Last Edited By</span>
                <span className="font-medium text-gray-800">{verificationStatus.lastEditedBy}</span>
              </div>
            )}
            {verificationStatus.lastEditedOn && (
              <div className="flex justify-between">
                <span className="text-gray-400">Last Edited On</span>
                <span className="font-medium text-gray-800">{verificationStatus.lastEditedOn}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Customer Risk Overview Card (Rendered strictly from GET /api/v1/customers/{group}/{customerNumber}/risk-overview API payload) */}
      {hasRiskData && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-300 text-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
            <span className="font-bold text-gray-900 text-sm">Customer Risk Overview</span>
            <FaChevronRight className="text-gray-400 text-xs cursor-pointer hover:text-gray-600" />
          </div>

          <div className="space-y-3">
            {/* Risk Level */}
            {riskOverview.riskLevel && String(riskOverview.riskLevel).trim() !== "" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-red-100 text-red-600 flex items-center justify-center font-bold text-[10px]">
                    !
                  </span>
                  <span className="font-medium text-gray-700">Risk Level</span>
                </div>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  String(riskOverview.riskLevel).toUpperCase() === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                  String(riskOverview.riskLevel).toUpperCase() === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {riskOverview.riskLevel}
                </span>
              </div>
            )}

            {/* Risk Score */}
            {riskOverview.riskScore !== null && riskOverview.riskScore !== undefined && String(riskOverview.riskScore).trim() !== "" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                    📊
                  </span>
                  <span className="font-medium text-gray-700">Risk Score</span>
                </div>
                <span className="font-bold text-gray-900">{riskOverview.riskScore}</span>
              </div>
            )}

            {/* Repeat Complaints Count */}
            {riskOverview.repeatComplaintCount !== null && riskOverview.repeatComplaintCount !== undefined && String(riskOverview.repeatComplaintCount).trim() !== "" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-[10px]">
                    ↻
                  </span>
                  <span className="font-medium text-gray-700">Repeat Complaints</span>
                </div>
                <span className="font-bold text-gray-900">{riskOverview.repeatComplaintCount} Cases</span>
              </div>
            )}

            {/* Repeat Complaints Details */}
            {(Array.isArray(riskOverview.repeatComplaints) ? riskOverview.repeatComplaints.length > 0 : Boolean(riskOverview.repeatComplaints && String(riskOverview.repeatComplaints).trim() !== "")) && (
              <div className="flex flex-col gap-1 pt-2 border-t border-gray-100">
                <span className="font-medium text-gray-700">Repeat Complaint Details</span>
                <div className="text-[11px] text-gray-600 space-y-1">
                  {Array.isArray(riskOverview.repeatComplaints) ? (
                    riskOverview.repeatComplaints.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-1.5 rounded border border-gray-200">
                        {typeof item === 'object' ? (item.description || item.subject || item.title || 'Complaint Record') : String(item)}
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 p-1.5 rounded border border-gray-200">{String(riskOverview.repeatComplaints)}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Notes Card (Scrollable API Notes with Labels) */}
      {(hasNotesData || customer?.isProspect) && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-300 text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
            <span className="font-bold text-gray-900 text-sm">Notes</span>
            <button
              type="button"
              onClick={() => setShowNotesModal(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-0.5 rounded border border-blue-200 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              title="Open Notes Modal"
            >
              <span>View</span>
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto pr-1">
            {customer?.isProspect ? (
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px]">
                {E00MI_NOTE_FIELDS.map(({ key, label }) => {
                  const val = customer?.[key];
                  const hasVal = val !== undefined && val !== null && String(val).trim() !== '';
                  return (
                    <div key={key} className="min-w-0">
                      <span className="text-gray-400 block text-[11px] leading-tight truncate font-medium" title={label}>
                        {label}
                      </span>
                      <span className={`font-semibold block break-words text-xs ${hasVal ? 'text-gray-800' : 'text-gray-400'}`}>
                        {hasVal ? String(val).trim() : '-'}
                      </span>
                    </div>
                  );
                })}
                {/* General / Description notes from API if present and non-synthetic */}
                {Boolean(customer?.description && !customer.description.startsWith('Event:') && !customer.description.includes('E00MI')) && (
                  <div className="col-span-2 pt-1 border-t border-gray-100">
                    <span className="text-gray-400 block text-[11px]">Description</span>
                    <span className="font-semibold text-gray-800 text-xs block break-words">{customer.description}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1 text-gray-700 text-[11px] leading-relaxed">
                <p>{cleanNoteText(customer?.notes) || '-'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. View All Notes Modal */}
      {showNotesModal && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNotesModal(false);
          }}
          className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 text-xs animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-sm shadow-2xs">
                  <FaStickyNote />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    Notes Details
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {customerName || 'Customer'} (Cust #{customerId || customer?.prospectNumber || '-'})
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowNotesModal(false)}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer text-xs font-bold"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Scrollable Cards for Notes */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 bg-slate-50/50">
              {displayedModalNotes.length > 0 ? (
                displayedModalNotes.map(({ key, label, val, hasVal }) => (
                  <div
                    key={key}
                    className={`p-3 rounded-xl border transition-all ${
                      hasVal
                        ? 'bg-white border-blue-200 shadow-2xs'
                        : 'bg-white/60 border-gray-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-gray-100">
                      <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${hasVal ? 'bg-blue-600' : 'bg-gray-300'}`} />
                        <span>{label}</span>
                      </span>
                    </div>
                    <div className="text-xs leading-relaxed text-gray-800 break-words whitespace-pre-wrap font-medium">
                      {hasVal ? String(val).trim() : '-'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-gray-400 text-xs">
                  No notes available.
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
