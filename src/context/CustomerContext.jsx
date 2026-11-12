import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, executeRpaCase, updateCustomerCase, sendCustomerSmsMessage } from '../utils/api';
import GlobalToast from '../components/GlobalToast';
import CustomerVerificationModal from '../components/CustomerVerificationModal';
import FloatingSmsWidget from '../components/FloatingSmsWidget';
import AccountResolutionModal from '../components/AccountResolutionModal';
import { isFullMobileNumber } from '../utils/phoneUtils';

const CustomerContext = createContext(null);

// Profile response dataset fallbacks (strictly populated by live API)
export const PROFILE_DEMO_DATA = null;
export const DEMO_VEHICLES = [];
export const DEMO_INSURANCE = [];
export const DEMO_FINANCE = [];
export const DEMO_TRADE_IN = [];
export const DEMO_RISK_OVERVIEW = null;
export const DEMO_VERIFICATION = null;

export const KNOWN_GROUPS = ['BMW', 'MINI', 'GEELY', 'ROLLS-ROYCE', 'AUDI'];

export const normalizeProspectRecord = (p, fallbackGroup = 'BMW', fallbackMobile = '') => {
  const g = p.keyloopGroup || fallbackGroup || 'BMW';
  const nameParts = (p.customerName || '').trim().split(/\s+/);
  const fName = p.firstName || (nameParts[0] || 'Prospect');
  const sName = p.surname || (nameParts.slice(1).join(' ') || '');
  const combinedName = p.customerName || `${fName} ${sName}`.trim() || 'Prospect Lead';
  const phone = p.mobile || fallbackMobile || '';
  const emailVal = p.email || '';
  const isConverted = Boolean(p.converted || (p.status && p.status.toUpperCase() === 'CONVERTED'));
  const custNo = p.customerNumber || (isConverted ? p.customerNumber : '') || p.prospectNumber || p.leadId || 'PROSPECT';

  return {
    keyloopGroup: g,
    customerNumber: custNo,
    prospectNumber: p.prospectNumber || p.leadId || '',
    leadId: p.leadId || '',
    customerType: 'PROSPECT',
    isProspect: true,
    isWebLead: false,
    linkType: p.linkType || 'PR',
    campaign: p.campaign || '',
    marketingCampaignCode: p.marketingCampaignCode || '',
    source: p.source || p.leadSource || '',
    channel: p.channel || '',
    salutation: p.titleCode || p.salutation || '',
    firstName: fName,
    middleName: '',
    surname: sName,
    fullName: combinedName,
    mobile: phone,
    mobileRaw: phone.replace(/\D/g, ''),
    mobileValid: Boolean(phone && phone.replace(/\D/g, '').length >= 7),
    email: emailVal,
    emailValid: Boolean(emailVal && emailVal.includes('@')),
    location: {
      flatBuilding: 'N/A',
      area: p.area || p.branchName || '',
      city: p.city || 'Dubai'
    },
    branchCode: p.branchCode || '10',
    preferredBranch: p.branchName || (p.branchCode ? `Branch ${p.branchCode}` : '10 - Sheikh Zayed Rd'),
    customerSince: p.createdAt ? p.createdAt.split('T')[0] : (p.createdDate || new Date().toISOString().split('T')[0]),
    lastUpdated: p.lastEditedDate || (p.createdAt ? p.createdAt.split('T')[0] : (p.createdDate || new Date().toISOString().split('T')[0])),
    dateOfBirth: p.dateOfBirth || p.dob || p.birthDate || p.DateOfBirth || p.date_of_birth || '',
    nationality: p.nationality || p.nation || '',
    vip: false,
    doNotContact: false,
    consents: p.consents || {
      email: Boolean(emailVal),
      phone: Boolean(phone),
      sms: true,
      whatsapp: true
    },
    leadSource: p.leadSource || p.description || 'Sales Prospect',
    status: p.status || (isConverted ? 'CONVERTED' : 'OPEN'),
    loyaltyTier: 'PROSPECT',
    notes: p.notes || ''
  };
};

export const normalizeE00MIRecord = (e, fallbackGroup = 'BMW', fallbackMobile = '') => {
  const g = e.keyloopGroup || fallbackGroup || 'BMW';
  const nameParts = (e.customerName || '').trim().split(/\s+/);
  const fName = nameParts[0] || 'Prospect';
  const sName = nameParts.slice(1).join(' ') || '';
  const combinedName = e.customerName || `${fName} ${sName}`.trim() || 'Prospect / Inquiry';
  const phone = e.mobile || fallbackMobile || '';
  const emailVal = e.email || '';
  const isCustLink = e.linkType === 'CU';
  const realProsNo = e.prospectNumber || e.leadId || '';
  const idVal = realProsNo || e.customerNumber || (e.eventKey && e.eventKey !== 'E00MI-LEAD' ? e.eventKey : '') || (isCustLink ? e.customerNumber || '' : 'E00MI-LEAD');

  return {
    keyloopGroup: g,
    customerNumber: e.customerNumber || idVal,
    prospectNumber: realProsNo,
    leadId: e.leadId || '',
    eventKey: e.eventKey || '',
    linkType: e.linkType || 'PR',
    campaign: e.campaign || '',
    marketingCampaignCode: e.marketingCampaignCode || '',
    source: e.source || e.leadSource || '',
    channel: e.channel || '',
    make: e.make || '',
    model: e.model || '',
    description: e.description || '',
    customerType: isCustLink ? 'CUSTOMER' : 'PROSPECT',
    isProspect: true,
    isWebLead: false,
    salutation: '',
    firstName: fName,
    middleName: '',
    surname: sName,
    fullName: combinedName,
    mobile: phone,
    mobileRaw: phone.replace(/\D/g, ''),
    mobileValid: Boolean(phone && phone.replace(/\D/g, '').length >= 7),
    email: emailVal,
    emailValid: Boolean(emailVal && emailVal.includes('@')),
    location: {
      flatBuilding: 'N/A',
      area: e.branchName || '',
      city: 'Dubai'
    },
    branchCode: e.branchCode || '10',
    preferredBranch: e.branchName || (e.branchCode ? `Branch ${e.branchCode}` : '10 - Sheikh Zayed Rd'),
    customerSince: e.createdDate || new Date().toISOString().split('T')[0],
    lastUpdated: e.createdDate || new Date().toISOString().split('T')[0],
    dateOfBirth: e.dateOfBirth || e.dob || e.birthDate || e.DateOfBirth || e.date_of_birth || '',
    nationality: e.nationality || '',
    vip: false,
    doNotContact: false,
    consents: {
      email: Boolean(emailVal),
      phone: Boolean(phone),
      sms: true,
      whatsapp: true
    },
    leadSource: e.description || 'Website / Leads Bridge Event',
    status: isCustLink ? 'Customer Event' : 'Prospect',
    loyaltyTier: isCustLink ? 'CUSTOMER' : 'PROSPECT',
    notes: `Event: ${e.description || 'E00MI Event'} [${e.createdDate || ''} ${e.createdTime || ''}]`
  };
};

/**
 * Checks if a customer object represents a confirmed existing Keyloop/Autoline customer
 * (as opposed to a brand-new lead, queued registration, or unconverted prospect)
 */
export const isExistingCustomer = (c) => {
  if (!c) return false;
  const custNo = String(c.customerNumber || '').trim();
  if (!custNo || custNo === 'PROSPECT' || custNo === 'null' || custNo === 'undefined') return false;
  if (c.isProspect) return false;
  if (c.customerType === 'PROSPECT' || c.customerType === 'NEW_CUSTOMER') return false;
  if (c.isNewRegistration && !custNo) return false;
  return true;
};

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [customerList, setCustomerList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMobile, setCurrentMobile] = useState("");
  const [currentCustomerNumber, setCurrentCustomerNumber] = useState("");
  const [agentId, setAgentId] = useState("agent.42");
  const [openComplaintsCount, setOpenComplaintsCount] = useState(0);
  const [customerFormMode, setCustomerFormMode] = useState(null); // 'create' | 'edit' | null
  const openCustomerForm = (mode = 'create') => setCustomerFormMode(mode);
  const closeCustomerForm = () => setCustomerFormMode(null);

  // Dual-Pane Account Resolution Modal (Customer vs Prospect split)
  const [customerMatches, setCustomerMatches] = useState([]);
  const [prospectMatches, setProspectMatches] = useState([]);
  const [isAccountResolutionModalOpen, setIsAccountResolutionModalOpen] = useState(false);
  const openAccountResolutionModal = () => setIsAccountResolutionModalOpen(true);
  const closeAccountResolutionModal = () => setIsAccountResolutionModalOpen(false);

  // Customer Data Verification Modal (RPA UPDATE_CUSTOMER)
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const openVerificationModal = () => setIsVerificationModalOpen(true);
  const closeVerificationModal = () => setIsVerificationModalOpen(false);

  // Floating SMS Dispatcher Widget (AGMC SMS Gateway)
  const [isSmsWidgetOpen, setIsSmsWidgetOpen] = useState(false);
  const [isSmsWidgetMinimized, setIsSmsWidgetMinimized] = useState(false);
  const openSmsWidget = () => {
    setIsSmsWidgetOpen(true);
    setIsSmsWidgetMinimized(false);
  };
  const closeSmsWidget = () => setIsSmsWidgetOpen(false);
  const toggleMinimizeSmsWidget = () => setIsSmsWidgetMinimized(prev => !prev);

  const sendSms = async (smsData) => {
    return await sendCustomerSmsMessage(smsData);
  };

  // App-wide floating toast notification (persists across views/modals)
  const [toastNotification, setToastNotification] = useState(null);
  const showToast = (toast) => setToastNotification(toast);
  const hideToast = () => setToastNotification(null);

  // Group state from URL or detected customer
  const [currentGroup, setCurrentGroup] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('group') || searchParams.get('keyloopGroup') || searchParams.get('brand') || '';
  });

  const syncGroupToUrl = (grp) => {
    if (!grp) return;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('group') !== grp) {
        searchParams.set('group', grp);
        window.history.replaceState(null, '', `${window.location.pathname}?${searchParams.toString()}`);
      }
    } catch (e) {
      console.warn("Could not sync group to URL:", e);
    }
  };

  const syncCustomerToUrl = (cust, grp = null, searchedMobile = null) => {
    if (typeof window === 'undefined') return;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      let changed = false;

      // 1. Group
      const resolvedGroup = grp || cust?.keyloopGroup || currentGroup;
      if (resolvedGroup && searchParams.get('group') !== resolvedGroup) {
        searchParams.set('group', resolvedGroup);
        changed = true;
      }

      // 2. Customer Number
      const custNo = cust?.customerNumber || cust?.id;
      if (custNo) {
        if (searchParams.get('customerNumber') !== String(custNo)) {
          searchParams.set('customerNumber', String(custNo));
          changed = true;
        }
      }

      // 3. Mobile Number
      const fullMobile = searchedMobile || 
        (isFullMobileNumber(cust?.mobile) ? String(cust.mobile).replace(/\D/g, '') : null) ||
        (isFullMobileNumber(cust?.mobilePhone) ? String(cust.mobilePhone).replace(/\D/g, '') : null) ||
        (isFullMobileNumber(cust?.phone) ? String(cust.phone).replace(/\D/g, '') : null);

      if (fullMobile) {
        if (searchParams.get('mobile') !== fullMobile) {
          searchParams.set('mobile', fullMobile);
          changed = true;
        }
      } else {
        // Stale URL mobile check: if URL has mobile, verify if it belongs to this customer
        const currentUrlMobile = searchParams.get('mobile') || searchParams.get('Complaint') || searchParams.get('Sales');
        if (currentUrlMobile) {
          const maskedStr = [cust?.mobile, cust?.mobileRaw, cust?.phone, cust?.telephone].filter(Boolean).join(' ');
          const suffixMatch = maskedStr.match(/(\d{2,6})(?:\D*)$/);
          const suffix = suffixMatch ? suffixMatch[1] : '';
          
          const cleanUrl = currentUrlMobile.replace(/\D/g, '');
          if (!suffix || !cleanUrl.endsWith(suffix)) {
            searchParams.delete('mobile');
            if (searchParams.has('Complaint')) searchParams.delete('Complaint');
            if (searchParams.has('Sales')) searchParams.delete('Sales');
            changed = true;
          }
        }
      }

      if (changed) {
        window.history.replaceState(null, '', `${window.location.pathname}?${searchParams.toString()}`);
      }
    } catch (e) {
      console.warn("Could not sync customer to URL:", e);
    }
  };

  // Vehicle summary state from API
  const [vehicles, setVehicles] = useState([]);
  const [selectedVin, setSelectedVin] = useState("");
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);

  // Extra customer detail state
  const [insurance, setInsurance] = useState([]);
  const [finance, setFinance] = useState([]);
  const [tradeInHistory, setTradeInHistory] = useState([]);
  const [riskOverview, setRiskOverview] = useState(null);
  const [salesSummary, setSalesSummary] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);

  // Enquiry state from customer search or profile
  const [enquiryNumber, setEnquiryNumber] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('enquiryNumber') || searchParams.get('enquiryNo') || searchParams.get('enquiry') || '';
  });
  const [enquiries, setEnquiries] = useState([]);

  const syncEnquiriesFromCustomer = (custObj, searchItem = null) => {
    if (!custObj && !searchItem) return '';
    const list = (custObj && Array.isArray(custObj.enquiries) && custObj.enquiries.length > 0)
      ? custObj.enquiries
      : (searchItem && Array.isArray(searchItem.enquiries) && searchItem.enquiries.length > 0)
        ? searchItem.enquiries
        : (custObj?.enquiries || []);

    const primaryEnquiry = (list[0] && list[0].enquiryNumber)
      || custObj?.enquiryNumber
      || (searchItem && (searchItem.enquiryNumber || (searchItem.enquiries && searchItem.enquiries[0]?.enquiryNumber)))
      || '';

    if (custObj) {
      custObj.enquiries = list;
      custObj.enquiryNumber = primaryEnquiry;
    }
    setEnquiries(list);
    if (primaryEnquiry) {
      setEnquiryNumber(primaryEnquiry);
    }
    return primaryEnquiry;
  };

  useEffect(() => {
    // Clear localStorage when window/tab is closed
    const handleTabClose = () => {
      localStorage.removeItem('complaint_cached_mobile');
      localStorage.removeItem('complaint_customer_search_data');
      localStorage.removeItem('complaint_customer_profile_data');
      localStorage.removeItem('complaint_selected_index');
      localStorage.removeItem('sales_cached_mobile');
      localStorage.removeItem('sales_customer_search_data');
      localStorage.removeItem('sales_customer_profile_data');
      localStorage.removeItem('sales_selected_index');
    };
    window.addEventListener('beforeunload', handleTabClose);

    const searchParams = new URLSearchParams(window.location.search);
    const complaintMobileParam = searchParams.get('Complaint') || searchParams.get('complaint');
    const salesMobileParam = searchParams.get('Sales') || searchParams.get('sales');
    const generalMobileParam = searchParams.get('mobile') || 
                               searchParams.get('Mobile') || 
                               searchParams.get('phone') || 
                               searchParams.get('Phone') || 
                               searchParams.get('ani') || 
                               searchParams.get('ANI') || 
                               searchParams.get('callerId') || 
                               searchParams.get('callerid') || 
                               searchParams.get('msisdn') || 
                               searchParams.get('MSISDN');
    const customerNoParam = searchParams.get('customerNumber') || searchParams.get('customerNo') || searchParams.get('id') || searchParams.get('customer_id');
    const prospectNoParam = searchParams.get('prospectNumber') || searchParams.get('prospectNo') || searchParams.get('prospect') || searchParams.get('leadId');
    const emailParam = searchParams.get('email') || searchParams.get('Email');
    const enquiryNoParam = searchParams.get('enquiryNumber') || searchParams.get('enquiryNo') || searchParams.get('enquiry');
    if (enquiryNoParam) {
      setEnquiryNumber(enquiryNoParam);
    }

    const groupParam = searchParams.get('group') || searchParams.get('keyloopGroup') || searchParams.get('brand') || '';
    if (groupParam) {
      setCurrentGroup(groupParam);
      syncGroupToUrl(groupParam);
    }
    const agentParam = searchParams.get('Agentid') || searchParams.get('agentId') || searchParams.get('agentid') || searchParams.get('agent_id') || searchParams.get('agent');

    if (agentParam) {
      setAgentId(agentParam);
    }

    const activeMobile = complaintMobileParam || salesMobileParam || generalMobileParam;
    const plateParam = searchParams.get('plate') || searchParams.get('Plate');
    const vinParam = searchParams.get('vin') || searchParams.get('Vin') || searchParams.get('VIN');
    const isSales = Boolean(salesMobileParam);
    const prefix = isSales ? 'sales_' : 'complaint_';

    if (activeMobile) {
      setCurrentMobile(activeMobile);
      fetchCustomerByMobile(activeMobile, groupParam, prefix).then(res => {
        if (res && res.ok && (!res.customerMatches || res.customerMatches.length <= 1)) {
          openCustomerForm('edit');
        }
      });
    } else if (emailParam) {
      fetchCustomerByEmail(emailParam, groupParam, prefix).then(res => {
        if (res && res.ok) openCustomerForm('edit');
      });
    } else if (prospectNoParam) {
      fetchCustomerByProspectNumber(prospectNoParam, groupParam, prefix).then(res => {
        if (res && res.ok) openCustomerForm('edit');
      });
    } else if (plateParam || vinParam) {
      fetchCustomerByPlateOrVin(plateParam || vinParam, groupParam, prefix).then(res => {
        if (res && res.ok) openCustomerForm('edit');
      });
    } else if (customerNoParam) {
      setCurrentCustomerNumber(customerNoParam);
      fetchCustomerByCustomerNumber(groupParam, customerNoParam, prefix).then(res => {
        if (res && res.ok) openCustomerForm('edit');
      });
    } else {
      // Check if localStorage has cached profile data
      const cachedProfileStr = localStorage.getItem(prefix + 'customer_profile_data');
      if (cachedProfileStr) {
        try {
          const cachedProfile = JSON.parse(cachedProfileStr);
          if (cachedProfile && cachedProfile.customerNumber) {
            syncEnquiriesFromCustomer(cachedProfile);
            setCustomer(cachedProfile);
            const g = cachedProfile.keyloopGroup || '';
            if (g) {
              fetchOpenComplaintsCount(g, cachedProfile.customerNumber);
              fetchVehiclesByCustomer(g, cachedProfile.customerNumber);
              fetchCustomerExtraDetails(g, cachedProfile.customerNumber);
              return;
            }
          }
        } catch (e) {
          console.warn("Cached profile parse error:", e);
        }
      }
      // Discover customer dynamically across groups without hardcoding BMW
      fetchCustomerByCustomerNumber(groupParam, '80496', prefix);
    }

    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);

  const fetchVehiclesByCustomer = async (group, custNo, options = {}) => {
    setVehiclesLoading(true);
    const g = group || customer?.keyloopGroup || '';
    const c = custNo || customer?.customerNumber || '';
    if (!g || !c) {
      setVehicles([]);
      setSelectedVin("");
      setVehicleDetails(null);
      setVehiclesLoading(false);
      return;
    }
    try {
      // 1. Fetch vehicle list for customer: GET /api/v1/vehicles?group={group}&customerNumber={customerNumber}
      const primaryUrl = `/api/v1/customers/${encodeURIComponent(g)}/${encodeURIComponent(c)}/vehicles`;
      let res = await apiFetch(primaryUrl);
      if (!res || !res.ok || !res.data || (Array.isArray(res.data) && res.data.length === 0)) {
        const fallbackUrl = `/api/v1/vehicles?group=${encodeURIComponent(g)}&customerNumber=${encodeURIComponent(c)}`;
        const fallbackRes = await apiFetch(fallbackUrl);
        if (fallbackRes && fallbackRes.ok && fallbackRes.data) {
          res = fallbackRes;
        }
      }
      let list = [];
      if (res && res.ok && res.data) {
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res.data.vehicles)) {
          list = res.data.vehicles;
        } else if (Array.isArray(res.data.data)) {
          list = res.data.data;
        } else if (typeof res.data === 'object' && (res.data.vin || res.data.chassisNumber)) {
          list = [res.data];
        }
      }
      
      if (list.length > 0) {
        setVehicles(list);
        let selectedItem = list[0];
        if (options?.targetVin) {
          const matchVin = list.find(v => (v.vin || v.chassisNumber || '').toUpperCase() === options.targetVin.toUpperCase());
          if (matchVin) selectedItem = matchVin;
        } else if (options?.targetPlate) {
          const cleanTarget = options.targetPlate.toUpperCase().replace(/[^A-Z0-9]/g, '');
          const matchPlate = list.find(v => {
            const reg = (v.registrationNumber || v.plateNumber || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
            return reg && (reg.includes(cleanTarget) || cleanTarget.includes(reg));
          });
          if (matchPlate) selectedItem = matchPlate;
        }

        const targetVin = selectedItem?.vin || selectedItem?.chassisNumber;
        if (targetVin) {
          setSelectedVin(targetVin);
          await fetchSingleVehicleDetails(g, targetVin, selectedItem);
        } else {
          setSelectedVin("");
          setVehicleDetails(null);
        }
      } else {
        setVehicles([]);
        setSelectedVin("");
        setVehicleDetails(null);
      }
    } catch (err) {
      console.warn("Error fetching vehicles list:", err);
      setVehicles([]);
      setSelectedVin("");
      setVehicleDetails(null);
    } finally {
      setVehiclesLoading(false);
    }
  };

  const fetchSingleVehicleDetails = async (group, vin, fallbackObj = null) => {
    if (!vin) {
      setVehicleDetails(null);
      return;
    }
    const g = group || customer?.keyloopGroup || '';
    if (!g) {
      if (fallbackObj) setVehicleDetails(fallbackObj);
      else setVehicleDetails(null);
      return;
    }
    try {
      const singleUrl = `/api/v1/vehicles/${g}/${vin}`;
      const res = await apiFetch(singleUrl);
      if (res && res.ok && res.data && typeof res.data === 'object') {
        setVehicleDetails(res.data);
        return;
      }
      if (fallbackObj) setVehicleDetails(fallbackObj);
      else setVehicleDetails(null);
    } catch (err) {
      console.warn("Error fetching single vehicle details:", err);
      if (fallbackObj) setVehicleDetails(fallbackObj);
      else setVehicleDetails(null);
    }
  };

  const selectVehicleByVin = (vin) => {
    setSelectedVin(vin);
    const found = vehicles.find(v => v.vin === vin);
    const g = customer?.keyloopGroup || '';
    fetchSingleVehicleDetails(g, vin, found);
  };

  const fetchCustomerExtraDetails = async (group, custNo) => {
    const g = group || customer?.keyloopGroup || '';
    const c = custNo || customer?.customerNumber || '';
    if (!g || !c) return;

    // 0. Primary Composite API: GET /api/v1/customers/{group}/{customerNumber}/sales-screen
    apiFetch(`/api/v1/customers/${g}/${c}/sales-screen`).then(res => {
      if (res && res.ok && res.data && typeof res.data === 'object') {
        const d = res.data;
        if (d.profile && typeof d.profile === 'object') {
          setCustomer(prev => {
            if (!prev) return d.profile;
            return {
              ...prev,
              ...d.profile,
              dateOfBirth: d.profile.dateOfBirth || d.profile.dob || d.profile.birthDate || d.profile.DateOfBirth || d.profile.date_of_birth || prev.dateOfBirth || prev.dob || prev.birthDate || '',
              nationality: d.profile.nationality || prev.nationality || '',
              customerNumber: d.profile.customerNumber || prev.customerNumber || '',
              keyloopGroup: d.profile.keyloopGroup || prev.keyloopGroup || '',
              consents: d.profile.consents || prev.consents
            };
          });
        }
        if (Array.isArray(d.vehicles)) setVehicles(d.vehicles);
        if (Array.isArray(d.insurance)) setInsurance(d.insurance);
        if (Array.isArray(d.finance)) setFinance(d.finance);
        if (Array.isArray(d.tradeInHistory)) setTradeInHistory(d.tradeInHistory);
        if (d.riskOverview && typeof d.riskOverview === 'object') setRiskOverview(d.riskOverview);
        if (d.salesSummary && typeof d.salesSummary === 'object') setSalesSummary(d.salesSummary);
      }
    }).catch(e => console.warn("sales-screen composite API fetch fallback:", e));

    // 1. Insurance Details
    apiFetch(`/api/v1/customers/${g}/${c}/insurance`).then(res => {
      if (res && res.ok && res.data) {
        setInsurance(Array.isArray(res.data) ? res.data : [res.data]);
      }
    }).catch(e => console.warn("Insurance fetch fallback:", e));

    // 2. Finance Details
    apiFetch(`/api/v1/customers/${g}/${c}/finance`).then(res => {
      if (res && res.ok && res.data) {
        setFinance(Array.isArray(res.data) ? res.data : [res.data]);
      }
    }).catch(e => console.warn("Finance fetch fallback:", e));

    // 3. Trade-in History
    apiFetch(`/api/v1/customers/${g}/${c}/trade-in-history`).then(res => {
      if (res && res.ok && res.data) {
        setTradeInHistory(Array.isArray(res.data) ? res.data : [res.data]);
      }
    }).catch(e => console.warn("Trade-in history fetch fallback:", e));

    // 4. Risk Overview
    apiFetch(`/api/v1/customers/${g}/${c}/risk-overview`).then(res => {
      if (res && res.ok && res.data && typeof res.data === 'object') {
        setRiskOverview(res.data);
      } else {
        setRiskOverview(null);
      }
    }).catch(e => {
      console.warn("Risk overview fetch fallback:", e);
      setRiskOverview(null);
    });

    // 5. Verification Status
    apiFetch(`/api/v1/customers/${g}/${c}/verification`).then(res => {
      if (res && res.ok && res.data && typeof res.data === 'object') {
        setVerificationStatus(res.data);
      } else {
        setVerificationStatus(null);
      }
    }).catch(e => {
      console.warn("Verification fetch fallback:", e);
      setVerificationStatus(null);
    });

    // 6. Sales Summary (GET /api/v1/customers/{group}/{customerNumber}/sales-summary)
    apiFetch(`/api/v1/customers/${g}/${c}/sales-summary`).then(res => {
      if (res && res.ok && res.data && typeof res.data === 'object') {
        setSalesSummary(res.data);
      } else {
        setSalesSummary(null);
      }
    }).catch(e => {
      console.warn("Sales summary fetch fallback:", e);
      setSalesSummary(null);
    });
  };

  const fetchOpenComplaintsCount = async (group, custNo) => {
    const g = group || customer?.keyloopGroup || "";
    const c = custNo || customer?.customerNumber || customer?.id || "";
    if (!g || !c) return;
    try {
      const apiUrl = `/api/v1/complaints?group=${g}&customerNumber=${c}&status=open`;
      
      const res = await apiFetch(apiUrl);
      if (res && res.ok && Array.isArray(res.data)) {
        setOpenComplaintsCount(res.data.length);
      }
    } catch (err) {
      console.warn("Failed to fetch open complaints count:", err);
    }
  };

  const fetchProfileByCustomerNumber = async (group, custNo, prefix = 'complaint_', options = {}, searchItem = null) => {
    setLoading(true);
    setError(null);
    try {
      const profileUrl = `/api/v1/customers/${group}/${custNo}/profile`;
      const res = await apiFetch(profileUrl);

      if (res && res.ok && res.data && typeof res.data === 'object') {
        const prof = res.data;
        const normalizedDob = prof.dateOfBirth || prof.dob || prof.birthDate || prof.DateOfBirth || prof.date_of_birth || searchItem?.dateOfBirth || searchItem?.dob || searchItem?.birthDate || '';
        const mergedProf = {
          ...(searchItem || {}),
          ...prof,
          dateOfBirth: normalizedDob,
          nationality: prof.nationality || searchItem?.nationality || ''
        };
        syncEnquiriesFromCustomer(mergedProf, searchItem);
        setCustomer(mergedProf);
        const resolvedGroup = prof.keyloopGroup || group || '';
        if (resolvedGroup) {
          setCurrentGroup(resolvedGroup);
        }
        if (custNo) {
          setCurrentCustomerNumber(String(custNo));
        }
        const resolvedMobile = options?.searchedMobile || 
          (isFullMobileNumber(prof.mobile) ? prof.mobile : null) ||
          (isFullMobileNumber(prof.mobileRaw) ? prof.mobileRaw : null) ||
          (isFullMobileNumber(prof.mobilePhone) ? prof.mobilePhone : null) ||
          prof.mobile || 
          prof.mobileRaw || 
          prof.phone || 
          prof.telephone || 
          '';
        if (resolvedMobile) {
          setCurrentMobile(resolvedMobile);
        }
        syncCustomerToUrl(prof, resolvedGroup, options?.searchedMobile);
        localStorage.setItem(prefix + 'customer_profile_data', JSON.stringify(prof));
        fetchOpenComplaintsCount(group, custNo);

        if (Array.isArray(prof.vehicles) && prof.vehicles.length > 0) {
          setVehicles(prof.vehicles);
          let selectedItem = prof.vehicles[0];
          if (options?.targetVin) {
            const matchVin = prof.vehicles.find(v => (v.vin || v.chassisNumber || '').toUpperCase() === options.targetVin.toUpperCase());
            if (matchVin) selectedItem = matchVin;
          } else if (options?.targetPlate) {
            const cleanTarget = options.targetPlate.toUpperCase().replace(/[^A-Z0-9]/g, '');
            const matchPlate = prof.vehicles.find(v => {
              const reg = (v.registrationNumber || v.plateNumber || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
              return reg && (reg.includes(cleanTarget) || cleanTarget.includes(reg));
            });
            if (matchPlate) selectedItem = matchPlate;
          }
          const vin = selectedItem.vin || selectedItem.chassisNumber;
          setSelectedVin(vin || "");
          fetchSingleVehicleDetails(group, vin, selectedItem);
        } else if (prof.vin) {
          const vObj = { vin: prof.vin, brand: prof.keyloopGroup || group, model: prof.model || prof.description || '' };
          setVehicles([vObj]);
          setSelectedVin(prof.vin);
          fetchSingleVehicleDetails(group, prof.vin, vObj);
        } else {
          fetchVehiclesByCustomer(group, custNo, options);
        }

        fetchCustomerExtraDetails(group, custNo);
        return { ok: true, customer: prof };
      }
      throw new Error(`Profile fetch status: ${res ? res.status : 'failed'}`);
    } catch (err) {
      console.warn("Profile API fetch error:", err.message);
      setError(err.message);
      if (searchItem) {
        syncEnquiriesFromCustomer(searchItem);
        setCustomer(searchItem);
        if (searchItem.customerNumber || custNo) {
          setCurrentCustomerNumber(String(searchItem.customerNumber || custNo));
        }
        const resolvedMobile = options?.searchedMobile || 
          searchItem.mobile || 
          searchItem.mobileRaw || 
          searchItem.phone || 
          '';
        if (resolvedMobile) {
          setCurrentMobile(resolvedMobile);
        }
        syncCustomerToUrl(searchItem, group, options?.searchedMobile);
      }
      fetchOpenComplaintsCount(group, custNo);
      fetchVehiclesByCustomer(group, custNo, options);
      fetchCustomerExtraDetails(group, custNo);
      return { ok: Boolean(searchItem), customer: searchItem, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerByMobile = async (mobileNum, group = '', prefix = 'complaint_') => {
    setLoading(true);
    setError(null);
    try {
      const cleanedMobile = (mobileNum || '').replace(/[^0-9]/g, '');
      if (!cleanedMobile) {
        setLoading(false);
        return { ok: false, message: 'Please enter a valid mobile number' };
      }
      
      // Manage localStorage clearing when a new mobile number is passed
      const cachedMobile = localStorage.getItem(prefix + 'cached_mobile');
      if (cachedMobile !== cleanedMobile) {
        localStorage.removeItem(prefix + 'customer_search_data');
        localStorage.removeItem(prefix + 'customer_profile_data');
        localStorage.removeItem(prefix + 'selected_index');
        localStorage.setItem(prefix + 'cached_mobile', cleanedMobile);
      }

      let allResults = [];
      const activeGroup = group || currentGroup || '';

      // 1. Concurrently query Customers and Prospects APIs in parallel
      const customerPromise = (async () => {
        try {
          if (activeGroup && activeGroup.trim() !== '') {
            const res = await apiFetch(`/api/v1/customers?group=${encodeURIComponent(activeGroup.trim())}&mobile=${cleanedMobile}`);
            return (res && res.ok && res.data) ? (Array.isArray(res.data) ? res.data : [res.data]) : [];
          } else {
            const groupPromises = KNOWN_GROUPS.map(g =>
              apiFetch(`/api/v1/customers?group=${g}&mobile=${cleanedMobile}`)
                .then(res => (res && res.ok && Array.isArray(res.data)) ? res.data : [])
                .catch(() => [])
            );
            const results = await Promise.all(groupPromises);
            return results.flat();
          }
        } catch (e) {
          console.warn("Customer mobile query error:", e);
          return [];
        }
      })();

      const prospectPromise = (async () => {
        try {
          if (activeGroup && activeGroup.trim() !== '') {
            const res = await apiFetch(`/api/v1/prospects?group=${encodeURIComponent(activeGroup.trim())}&mobile=${cleanedMobile}`);
            return (res && res.ok && Array.isArray(res.data)) ? res.data : [];
          } else {
            const groupPromises = KNOWN_GROUPS.map(g =>
              apiFetch(`/api/v1/prospects?group=${g}&mobile=${cleanedMobile}`)
                .then(res => (res && res.ok && Array.isArray(res.data)) ? res.data : [])
                .catch(() => [])
            );
            const results = await Promise.all(groupPromises);
            return results.flat();
          }
        } catch (e) {
          console.warn("Prospect mobile query error:", e);
          return [];
        }
      })();

      const [rawCustomers, rawProspects] = await Promise.all([
        customerPromise,
        prospectPromise
      ]);

      // Deduplicate customers by customerNumber
      const seenCustIds = new Set();
      const uniqueCustomers = [];
      for (const c of rawCustomers) {
        const id = String(c.customerNumber || c.id || '').trim();
        if (id) {
          if (seenCustIds.has(id)) continue;
          seenCustIds.add(id);
        }
        uniqueCustomers.push(c);
      }

      // Deduplicate prospects by leadId / prospectNumber to prevent cross-group duplicate records
      const seenProspectIds = new Set();
      const uniqueProspects = [];
      for (const p of rawProspects) {
        const id = String(p.leadId || p.prospectNumber || p.id || '').trim();
        if (id) {
          if (seenProspectIds.has(id)) continue;
          seenProspectIds.add(id);
        }
        uniqueProspects.push(p);
      }

      // Normalize Customers
      const normalizedCustomers = uniqueCustomers.map(c => ({
        ...c,
        isProspect: false,
        customerType: c.customerType || 'CUSTOMER'
      }));

      // Normalize Prospects strictly from /api/v1/prospects response
      const normalizedProspects = uniqueProspects.map(p => 
        normalizeProspectRecord(p, p.keyloopGroup || activeGroup, cleanedMobile)
      );

      setCustomerMatches(normalizedCustomers);
      setProspectMatches(normalizedProspects);

      const allMatches = [...normalizedCustomers, ...normalizedProspects];
      setCustomerList(allMatches);
      localStorage.setItem(prefix + 'customer_search_data', JSON.stringify(allMatches));

      const totalMatches = allMatches.length;

      if (totalMatches === 0) {
        setCustomer(null);
        setCustomerList([]);
        setIsAccountResolutionModalOpen(false);
        return { ok: false, message: `No prospect or customer found for mobile "${mobileNum}"` };
      }

      // Check whether multiple customer accounts exist:
      const hasMultipleCustomers = normalizedCustomers.length > 1;

      // Select initial active record: prefer verified customer if available, else first prospect
      let activeItem = normalizedCustomers.length > 0 ? normalizedCustomers[0] : normalizedProspects[0];
      const activeIdx = allMatches.indexOf(activeItem);
      setSelectedIndex(activeIdx !== -1 ? activeIdx : 0);

      const detectedGroup = activeItem.keyloopGroup || activeGroup || 'BMW';
      if (detectedGroup) setCurrentGroup(detectedGroup);
      setCurrentMobile(cleanedMobile);

      if (activeItem.isProspect) {
        setCustomer(activeItem);
        setCurrentCustomerNumber(activeItem.prospectNumber || activeItem.customerNumber || '');
        syncCustomerToUrl(activeItem, detectedGroup, cleanedMobile);
        setVehicles([]);
        setSelectedVin("");
        setVehicleDetails(null);
        setRiskOverview(null);
        setVerificationStatus(null);
      } else {
        const custNo = activeItem.customerNumber || activeItem.id;
        if (custNo) {
          setCurrentCustomerNumber(String(custNo));
          syncCustomerToUrl(activeItem, detectedGroup, cleanedMobile);
          await fetchProfileByCustomerNumber(detectedGroup, custNo, prefix, { searchedMobile: cleanedMobile }, activeItem);
        } else {
          syncEnquiriesFromCustomer(activeItem);
          setCustomer(activeItem);
          syncCustomerToUrl(activeItem, detectedGroup, cleanedMobile);
        }
      }

      // If multiple CUSTOMER profiles found, pop up the Customer Account Selection Modal!
      // (Prospects are shown separately in sidebar buttons after the customer profile)
      if (hasMultipleCustomers) {
        setIsAccountResolutionModalOpen(true);
      } else {
        setIsAccountResolutionModalOpen(false);
        openCustomerForm('edit');
      }

      return {
        ok: true,
        count: totalMatches,
        customer: activeItem,
        group: detectedGroup,
        isProspect: activeItem.isProspect,
        customerMatches: normalizedCustomers,
        prospectMatches: normalizedProspects
      };
    } catch (err) {
      console.warn("Search mobile error:", err.message);
      setError(err.message);
      setCustomer(null);
      setCustomerList([]);
      return { ok: false, message: err.message || 'Mobile search failed' };
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerByCustomerNumber = async (group = '', custNo, prefix = 'complaint_') => {
    setLoading(true);
    setError(null);
    try {
      const cleanCustNo = String(custNo || '').trim();
      if (!cleanCustNo) {
        setLoading(false);
        return { ok: false, message: 'Please enter a valid customer number' };
      }

      let allResults = [];
      if (group && group.trim() !== '') {
        const searchUrl = `/api/v1/customers?group=${encodeURIComponent(group.trim())}&customerNumber=${encodeURIComponent(cleanCustNo)}`;
        const res = await apiFetch(searchUrl);
        if (res && res.ok && res.data) {
          allResults = Array.isArray(res.data) ? res.data : [res.data];
        }
      } else {
        // Automatically discover group across known groups
        const groupPromises = KNOWN_GROUPS.map(g =>
          apiFetch(`/api/v1/customers?group=${g}&customerNumber=${encodeURIComponent(cleanCustNo)}`)
            .then(res => (res && res.ok && Array.isArray(res.data)) ? res.data : [])
            .catch(() => [])
        );
        const groupResults = await Promise.all(groupPromises);
        allResults = groupResults.flat();
      }

      if (allResults.length > 0) {
        setCustomerList(allResults);
        setSelectedIndex(0);
        const detectedGroup = allResults[0].keyloopGroup || group || '';
        await fetchProfileByCustomerNumber(detectedGroup, allResults[0].customerNumber, prefix, {}, allResults[0]);
        return { ok: true, count: allResults.length, customer: allResults[0], group: detectedGroup, isProspect: false };
      }
      
      if (group && group.trim() !== '') {
        const profRes = await fetchProfileByCustomerNumber(group, cleanCustNo, prefix);
        if (profRes && profRes.ok) {
          return { ok: true, count: 1, customer: profRes.customer, group, isProspect: false };
        }
      }

      // Check /api/v1/prospects?customerNumber={custNo} fallback
      const activeGroup = group || currentGroup || 'BMW';
      const prosRes = await apiFetch(`/api/v1/prospects?group=${encodeURIComponent(activeGroup)}&customerNumber=${encodeURIComponent(cleanCustNo)}`);
      if (prosRes && prosRes.ok && Array.isArray(prosRes.data) && prosRes.data.length > 0) {
        const normalized = prosRes.data.map(p => normalizeProspectRecord(p, activeGroup, ''));
        localStorage.setItem(prefix + 'customer_search_data', JSON.stringify(normalized));
        localStorage.setItem(prefix + 'customer_profile_data', JSON.stringify(normalized[0]));
        setCustomerList(normalized);
        setSelectedIndex(0);
        setCustomer(normalized[0]);
        return { ok: true, count: normalized.length, customer: normalized[0], group: activeGroup, isProspect: true };
      }

      return { ok: false, message: `Customer #${cleanCustNo} not found` };
    } catch (err) {
      console.warn("Customer number search error:", err.message);
      setError(err.message);
      return { ok: false, message: err.message || 'Search failed' };
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerByProspectNumber = async (prospectNo, group = '', prefix = 'complaint_') => {
    setLoading(true);
    setError(null);
    const cleanNo = String(prospectNo || '').trim().replace(/^pr[-_\s]?/i, '');
    if (!cleanNo) {
      setLoading(false);
      return { ok: false, message: 'Please enter a valid prospect number' };
    }

    try {
      let results = [];
      const activeGroup = group || currentGroup || '';
      if (activeGroup && activeGroup.trim() !== '') {
        const url = `/api/v1/prospects?group=${encodeURIComponent(activeGroup.trim())}&prospectNumber=${encodeURIComponent(cleanNo)}`;
        const res = await apiFetch(url);
        if (res && res.ok && Array.isArray(res.data) && res.data.length > 0) {
          results = res.data;
        } else {
          // Also check by customerNumber in prospects API
          const url2 = `/api/v1/prospects?group=${encodeURIComponent(activeGroup.trim())}&customerNumber=${encodeURIComponent(cleanNo)}`;
          const res2 = await apiFetch(url2);
          if (res2 && res2.ok && Array.isArray(res2.data) && res2.data.length > 0) {
            results = res2.data;
          }
        }
      } else {
        const promises = KNOWN_GROUPS.map(async (g) => {
          const res = await apiFetch(`/api/v1/prospects?group=${g}&prospectNumber=${encodeURIComponent(cleanNo)}`).catch(() => null);
          if (res && res.ok && Array.isArray(res.data) && res.data.length > 0) return res.data;
          const res2 = await apiFetch(`/api/v1/prospects?group=${g}&customerNumber=${encodeURIComponent(cleanNo)}`).catch(() => null);
          if (res2 && res2.ok && Array.isArray(res2.data)) return res2.data;
          return [];
        });
        const groupResults = await Promise.all(promises);
        results = groupResults.flat();
      }

      if (results.length > 0) {
        const normalized = results.map(p => normalizeProspectRecord(p, activeGroup, ''));
        localStorage.setItem(prefix + 'customer_search_data', JSON.stringify(normalized));
        localStorage.setItem(prefix + 'customer_profile_data', JSON.stringify(normalized[0]));
        setCustomerList(normalized);
        setSelectedIndex(0);
        setCustomer(normalized[0]);
        const mob = normalized[0].mobile || normalized[0].mobileRaw || '';
        if (mob) setCurrentMobile(mob);
        setCurrentCustomerNumber(normalized[0].prospectNumber || normalized[0].customerNumber || '');
        const detectedGroup = normalized[0].keyloopGroup || activeGroup || 'BMW';
        if (detectedGroup) {
          setCurrentGroup(detectedGroup);
        }
        syncCustomerToUrl(normalized[0], detectedGroup);
        setVehicles([]);
        setSelectedVin("");
        setVehicleDetails(null);
        setRiskOverview(null);
        setVerificationStatus(null);
        return { 
          ok: true, 
          count: normalized.length, 
          customer: normalized[0], 
          group: detectedGroup, 
          isProspect: true, 
          type: normalized[0].customerType 
        };
      }

      return { ok: false, message: `No prospect record found for Prospect #${cleanNo}` };
    } catch (err) {
      console.warn("fetchCustomerByProspectNumber error:", err);
      return { ok: false, message: err.message || 'Prospect lookup failed' };
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerByEmail = async (email, group = '', prefix = 'complaint_') => {
    setLoading(true);
    setError(null);
    const cleanEmail = (email || '').trim();
    if (!cleanEmail) {
      setLoading(false);
      return { ok: false, message: 'Please enter a valid email address' };
    }

    try {
      let allResults = [];
      const activeGroup = group || currentGroup || customer?.keyloopGroup || '';
      
      // 1. Primary Query: Prospects API (/api/v1/prospects?group={group}&email={email})
      let prospectResults = [];
      if (activeGroup && activeGroup.trim() !== '') {
        const pUrl = `/api/v1/prospects?group=${encodeURIComponent(activeGroup.trim())}&email=${encodeURIComponent(cleanEmail)}`;
        const pRes = await apiFetch(pUrl);
        if (pRes && pRes.ok && Array.isArray(pRes.data) && pRes.data.length > 0) {
          prospectResults = pRes.data;
        }
      } else {
        const pPromises = KNOWN_GROUPS.map(g =>
          apiFetch(`/api/v1/prospects?group=${g}&email=${encodeURIComponent(cleanEmail)}`)
            .then(res => (res && res.ok && Array.isArray(res.data)) ? res.data : [])
            .catch(() => [])
        );
        const pResults = await Promise.all(pPromises);
        prospectResults = pResults.flat();
      }

      if (prospectResults.length > 0) {
        const normalized = prospectResults.map(p => normalizeProspectRecord(p, activeGroup, ''));
        localStorage.setItem(prefix + 'customer_search_data', JSON.stringify(normalized));
        localStorage.setItem(prefix + 'customer_profile_data', JSON.stringify(normalized[0]));
        setCustomerList(normalized);
        setSelectedIndex(0);
        setCustomer(normalized[0]);
        const mob = normalized[0].mobile || normalized[0].mobileRaw || '';
        if (mob) setCurrentMobile(mob);
        setCurrentCustomerNumber(normalized[0].prospectNumber || normalized[0].customerNumber || '');
        const detectedGroup = normalized[0].keyloopGroup || activeGroup || 'BMW';
        if (detectedGroup) {
          setCurrentGroup(detectedGroup);
        }
        syncCustomerToUrl(normalized[0], detectedGroup);
        setVehicles([]);
        setSelectedVin("");
        setVehicleDetails(null);
        setRiskOverview(null);
        setVerificationStatus(null);
        return { 
          ok: true, 
          count: normalized.length, 
          customer: normalized[0], 
          group: detectedGroup, 
          isProspect: true,
          type: normalized[0].customerType
        };
      }

      // 2. Secondary Query: E00MI Inbound Events API (/api/v1/e00mi?group={group}&email={email})
      let e00miResults = [];
      if (activeGroup && activeGroup.trim() !== '') {
        const eUrl = `/api/v1/e00mi?group=${encodeURIComponent(activeGroup.trim())}&email=${encodeURIComponent(cleanEmail)}`;
        const eRes = await apiFetch(eUrl);
        if (eRes && eRes.ok && Array.isArray(eRes.data) && eRes.data.length > 0) {
          e00miResults = eRes.data;
        }
      } else {
        const ePromises = KNOWN_GROUPS.map(g =>
          apiFetch(`/api/v1/e00mi?group=${g}&email=${encodeURIComponent(cleanEmail)}`)
            .then(res => (res && res.ok && Array.isArray(res.data)) ? res.data : [])
            .catch(() => [])
        );
        const eResults = await Promise.all(ePromises);
        e00miResults = eResults.flat();
      }

      if (e00miResults.length > 0) {
        const normalized = e00miResults.map(e => normalizeE00MIRecord(e, activeGroup, ''));
        localStorage.setItem(prefix + 'customer_search_data', JSON.stringify(normalized));
        localStorage.setItem(prefix + 'customer_profile_data', JSON.stringify(normalized[0]));
        setCustomerList(normalized);
        setSelectedIndex(0);
        setCustomer(normalized[0]);
        const mob = normalized[0].mobile || normalized[0].mobileRaw || '';
        if (mob) setCurrentMobile(mob);
        setCurrentCustomerNumber(normalized[0].prospectNumber || normalized[0].customerNumber || '');
        const detectedGroup = normalized[0].keyloopGroup || activeGroup || 'BMW';
        if (detectedGroup) {
          setCurrentGroup(detectedGroup);
        }
        syncCustomerToUrl(normalized[0], detectedGroup);
        setVehicles([]);
        setSelectedVin("");
        setVehicleDetails(null);
        setRiskOverview(null);
        setVerificationStatus(null);
        return { 
          ok: true, 
          count: normalized.length, 
          customer: normalized[0], 
          group: detectedGroup, 
          isProspect: true,
          isWebLead: false,
          type: 'PROSPECT'
        };
      }

      // 3. Fallback Query: Customers API (/api/v1/customers?group={group}&email={email})
      if (activeGroup && activeGroup.trim() !== '') {
        const searchUrl = `/api/v1/customers?group=${encodeURIComponent(activeGroup.trim())}&email=${encodeURIComponent(cleanEmail)}`;
        const res = await apiFetch(searchUrl);
        if (res && res.ok && res.data) {
          allResults = Array.isArray(res.data) ? res.data : [res.data];
        }
      } else {
        const groupPromises = KNOWN_GROUPS.map(g =>
          apiFetch(`/api/v1/customers?group=${g}&email=${encodeURIComponent(cleanEmail)}`)
            .then(res => (res && res.ok && Array.isArray(res.data)) ? res.data : [])
            .catch(() => [])
        );
        const groupResults = await Promise.all(groupPromises);
        allResults = groupResults.flat();
      }

      if (allResults.length > 0) {
        localStorage.setItem(prefix + 'customer_search_data', JSON.stringify(allResults));
        setCustomerList(allResults);
        setSelectedIndex(0);
        const targetItem = allResults[0];
        const detectedGroup = targetItem.keyloopGroup || activeGroup || 'BMW';
        if (targetItem.customerNumber) {
          await fetchProfileByCustomerNumber(detectedGroup, targetItem.customerNumber, prefix, {}, targetItem);
        } else {
          syncEnquiriesFromCustomer(targetItem);
          setCustomer(targetItem);
        }
        return { ok: true, count: allResults.length, customer: targetItem, group: detectedGroup, isProspect: false };
      }

      setCustomer(null);
      setCustomerList([]);
      return { ok: false, message: `No prospect or customer found for email "${cleanEmail}"` };
    } catch (err) {
      console.warn("Search email error:", err.message);
      setError(err.message);
      setCustomer(null);
      setCustomerList([]);
      return { ok: false, message: err.message || 'Search failed' };
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerByPlateOrVin = async (query, group = '', prefix = 'complaint_') => {
    setLoading(true);
    setError(null);
    const trimmed = (query || '').trim();
    if (!trimmed) {
      setLoading(false);
      return { ok: false, message: 'Please enter a Plate or VIN number' };
    }

    const activeGroup = group || currentGroup || customer?.keyloopGroup || 'BMW';
    const groupsToTry = [activeGroup, ...KNOWN_GROUPS.filter(g => g !== activeGroup)];

    // Check if query is likely a VIN (11-17 alphanumeric characters without spaces/hyphens)
    const isLikelyVin = /^[A-HJ-NPR-Z0-9]{11,17}$/i.test(trimmed.replace(/\s+/g, ''));

    try {
      let allResults = [];
      let detectedGroup = activeGroup;
      let matchedType = isLikelyVin ? 'vin' : 'plate';

      for (const g of groupsToTry) {
        if (isLikelyVin) {
          // 1. Try VIN endpoint: /api/v1/customers?group={group}&vin={vin}
          const resVin = await apiFetch(`/api/v1/customers?group=${encodeURIComponent(g)}&vin=${encodeURIComponent(trimmed.replace(/\s+/g, ''))}`);
          if (resVin && resVin.ok && Array.isArray(resVin.data) && resVin.data.length > 0) {
            allResults = resVin.data;
            detectedGroup = g;
            matchedType = 'vin';
            break;
          }
          // 2. Fallback to Plate: /api/v1/customers?group={group}&plate={plate}
          const resPlate = await apiFetch(`/api/v1/customers?group=${encodeURIComponent(g)}&plate=${encodeURIComponent(trimmed)}`);
          if (resPlate && resPlate.ok && Array.isArray(resPlate.data) && resPlate.data.length > 0) {
            allResults = resPlate.data;
            detectedGroup = g;
            matchedType = 'plate';
            break;
          }
        } else {
          // 1. Try Plate endpoint: /api/v1/customers?group={group}&plate={plate}
          const resPlate = await apiFetch(`/api/v1/customers?group=${encodeURIComponent(g)}&plate=${encodeURIComponent(trimmed)}`);
          if (resPlate && resPlate.ok && Array.isArray(resPlate.data) && resPlate.data.length > 0) {
            allResults = resPlate.data;
            detectedGroup = g;
            matchedType = 'plate';
            break;
          }
          // 2. Fallback to VIN
          const resVin = await apiFetch(`/api/v1/customers?group=${encodeURIComponent(g)}&vin=${encodeURIComponent(trimmed.replace(/\s+/g, ''))}`);
          if (resVin && resVin.ok && Array.isArray(resVin.data) && resVin.data.length > 0) {
            allResults = resVin.data;
            detectedGroup = g;
            matchedType = 'vin';
            break;
          }
        }
      }

      if (allResults.length > 0) {
        localStorage.setItem(prefix + 'customer_search_data', JSON.stringify(allResults));
        localStorage.setItem(prefix + 'selected_index', '0');

        setCustomerList(allResults);
        setSelectedIndex(0);

        const targetItem = allResults[0];
        const finalGroup = targetItem.keyloopGroup || detectedGroup;
        if (finalGroup) {
          setCurrentGroup(finalGroup);
          syncGroupToUrl(finalGroup);
        }

        // Sync URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('customerNumber', targetItem.customerNumber);
        urlParams.set('group', finalGroup);
        if (matchedType === 'plate') {
          urlParams.set('plate', trimmed);
          urlParams.delete('vin');
        } else {
          urlParams.set('vin', trimmed);
          urlParams.delete('plate');
        }
        window.history.replaceState(null, '', `${window.location.pathname}?${urlParams.toString()}`);

        await fetchProfileByCustomerNumber(finalGroup, targetItem.customerNumber, prefix, {
          targetPlate: matchedType === 'plate' ? trimmed : null,
          targetVin: matchedType === 'vin' ? trimmed : null
        }, targetItem);

        return { 
          ok: true, 
          count: allResults.length, 
          customer: allResults[0], 
          matchedType,
          group: finalGroup 
        };
      }

      return { 
        ok: false, 
        message: `No customer record found matching ${isLikelyVin ? 'VIN' : 'Plate'} "${trimmed}".` 
      };
    } catch (err) {
      console.warn("fetchCustomerByPlateOrVin error:", err);
      setError(err.message);
      return { ok: false, message: err.message || 'Search failed' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Unified Smart Search:
   * Handles Mobile/Phone, Email, Prospect ID, Customer Number, Plate, and VIN.
   * Leverages /api/v1/customers, /api/v1/prospects, and /api/v1/e00mi.
   */
  const searchCustomer = async (query, group = '', prefix = 'complaint_') => {
    const q = (query || '').trim();
    if (!q) return { ok: false, message: 'Please enter a search query' };

    const activeGroup = group || currentGroup || customer?.keyloopGroup || '';
    let res = null;

    // 1. Email check
    if (q.includes('@')) {
      res = await fetchCustomerByEmail(q, activeGroup, prefix);
    } else {
      // 2. Mobile / Phone number check
      const digitsOnly = q.replace(/\D/g, '');
      const isPhoneLike = /^(?:\+?971|00971|05)\d{7,10}$/.test(q.replace(/[\s-]/g, '')) || 
                          (digitsOnly.length >= 9 && digitsOnly.length <= 13 && /^(?:971|05|5)\d+/.test(digitsOnly));

      if (isPhoneLike) {
        res = await fetchCustomerByMobile(q, activeGroup, prefix);
      } else if (/^(?:pr|lead)[-_\s]?\d+/i.test(q)) {
        res = await fetchCustomerByProspectNumber(digitsOnly, activeGroup, prefix);
      } else if (/^\d{4,8}$/.test(q)) {
        res = await fetchCustomerByProspectNumber(q, activeGroup, prefix);
        if (!res || !res.ok) {
          res = await fetchCustomerByCustomerNumber(activeGroup, q, prefix);
        }
        if (!res || !res.ok) {
          res = await fetchCustomerByMobile(q, activeGroup, prefix);
        }
        if (!res || !res.ok) {
          res = await fetchCustomerByPlateOrVin(q, activeGroup, prefix);
        }
      } else {
        res = await fetchCustomerByPlateOrVin(q, activeGroup, prefix);
        if ((!res || !res.ok) && digitsOnly) {
          res = await fetchCustomerByProspectNumber(digitsOnly, activeGroup, prefix);
        }
      }
    }

    if (res && res.ok) {
      if (!res.customerMatches || res.customerMatches.length <= 1) {
        openCustomerForm('edit');
      }
      return res;
    }

    return res || { ok: false, message: `No customer, prospect, or lead found matching "${q}"` };
  };

  const selectCustomer = (idx) => {
    if (customerList && customerList[idx]) {
      selectAccount(customerList[idx]);
    }
  };

  const selectAccount = async (record, openEdit = false) => {
    if (!record) return;
    const searchParams = new URLSearchParams(window.location.search);
    const isSales = Boolean(searchParams.get('Sales') || searchParams.get('sales'));
    const prefix = isSales ? 'sales_' : 'complaint_';

    const idx = customerList.findIndex(item => {
      if (record.isProspect) {
        return item.isProspect && (item.prospectNumber === record.prospectNumber || item.leadId === record.leadId);
      } else {
        return !item.isProspect && (item.customerNumber === record.customerNumber);
      }
    });
    if (idx !== -1) {
      setSelectedIndex(idx);
      localStorage.setItem(prefix + 'selected_index', String(idx));
    }

    const g = record.keyloopGroup || currentGroup || 'BMW';
    const c = record.customerNumber;
    const mob = record.mobile || record.mobileRaw || currentMobile || '';
    if (mob) setCurrentMobile(mob);

    // Set active customer immediately so Edit form and UI load without delay
    setCustomer(record);
    setIsAccountResolutionModalOpen(false);

    if (openEdit) {
      openCustomerForm('edit');
    }

    if (record.isProspect) {
      setCurrentCustomerNumber(record.prospectNumber || record.leadId || '');
      syncCustomerToUrl(record, g, mob);
      setVehicles([]);
      setSelectedVin("");
      setVehicleDetails(null);
      setRiskOverview(null);
      setVerificationStatus(null);
    } else if (c) {
      setCurrentCustomerNumber(String(c));
      syncCustomerToUrl(record, g, mob);
      await fetchProfileByCustomerNumber(g, c, prefix, { searchedMobile: mob }, record);
    } else {
      syncEnquiriesFromCustomer(record);
      syncCustomerToUrl(record, g, mob);
    }
  };

  // Create New Customer Handler matching Keyloop RPA / CCaaS payload schema
  const createCustomer = async (details, onProgress = null) => {
    setLoading(true);
    setError(null);
    const grp = details.group || currentGroup || "BMW";
    const caseDetails = {
      group: grp,
      branch: details.branch || (grp.toUpperCase().includes('GEELY') ? "10 - Geely Group - SZR" : "10 - Sheikh Zayed Rd"),
      titleCode: details.titleCode || "Mr.",
      firstName: details.firstName || "",
      surname: details.surname || "",
      area: details.area || "Deira",
      city: details.city || "Dubai",
      country: details.country || "United Arab Emirates",
      mobile: details.mobile || "",
      phone1: details.phone1 || "",
      phone2: details.phone2 || details.homePhone || "",
      phone3: details.phone3 || details.workPhone || "",
      phone4: details.phone4 || "",
      telephoneNumber1: details.phone1 || "",
      telephoneNumber2: details.phone2 || details.homePhone || "",
      telephoneNumber3: details.phone3 || details.workPhone || "",
      telephoneNumber4: details.phone4 || "",
      homePhone: details.homePhone || details.phone2 || "",
      workPhone: details.workPhone || details.phone3 || "",
      email: details.email || "",
      homeEmail: details.homeEmail || "",
      workEmail: details.workEmail || "",
      otherEmail1: details.otherEmail1 || "",
      otherEmail2: details.otherEmail2 || "",
      source: details.source || "CRM Inbound",
      sourceOfInformation: details.sourceOfInformation || "Walk-in",
      personalId: details.personalId || "",
      nationality: details.nationality || "",
      ...(details.dob ? { dob: details.dob } : {})
    };

    console.log("Submitting RPA CREATE_CUSTOMER payload:", caseDetails);

    let rpaResult = null;
    let rpaTaskId = null;

    try {
      const res = await executeRpaCase("CREATE_CUSTOMER", caseDetails, {
        createdBy: agentId || "genesys",
        callbackUrl: "http://localhost:9999/hook",
        onProgress: (status, taskData) => {
          if (taskData?.taskId) rpaTaskId = taskData.taskId;
          if (onProgress) onProgress(status, taskData);
        }
      });
      if (res && res.ok) {
        rpaResult = res.result;
        if (res.taskId) rpaTaskId = res.taskId;
      }
    } catch (e) {
      console.warn("RPA CREATE_CUSTOMER error (fallback to local state):", e);
    }

    // Capture customerId and enquiryId returned by RPA (never fabricate fake numbers)
    const autolineCustNo = rpaResult?.customerId || rpaResult?.customerNumber || rpaResult?.id || "";
    const generatedEnquiryId = rpaResult?.enquiryId || rpaResult?.enquiryNumber || null;
    const branchCodeNum = details.branch ? details.branch.split(' - ')[0].trim() : "10";

    const hasEmail = Boolean(details.email && details.email.trim() && details.email.includes('@'));
    const hasMobile = Boolean(details.mobile && details.mobile.replace(/\D/g, '').length >= 7);

    const userConsents = details.consents || {};
    const resolvedConsents = {
      phone: userConsents.phone !== undefined ? Boolean(userConsents.phone) : hasMobile,
      sms: userConsents.sms !== undefined ? Boolean(userConsents.sms) : hasMobile,
      whatsapp: userConsents.whatsapp !== undefined ? Boolean(userConsents.whatsapp) : hasMobile,
      email: userConsents.email !== undefined ? Boolean(userConsents.email && hasEmail) : hasEmail
    };

    const newProfile = {
      keyloopGroup: grp,
      customerNumber: autolineCustNo,
      enquiryNumber: generatedEnquiryId,
      customerType: autolineCustNo ? "CUSTOMER" : "NEW_CUSTOMER",
      isProspect: false,
      isNewRegistration: !autolineCustNo,
      rpaTaskId: rpaTaskId || null,
      rpaStatus: autolineCustNo ? 'COMPLETED' : 'Processing',
      leadSource: details.leadSource || "Inbound",
      status: autolineCustNo ? "ACTIVE" : "Processing",
      salutation: details.titleCode || "Mr.",
      firstName: details.firstName || "",
      middleName: "",
      surname: details.surname || "",
      fullName: `${details.titleCode ? details.titleCode + ' ' : ''}${details.firstName || ''} ${details.surname || ''}`.trim(),
      mobile: details.mobile || "",
      mobileRaw: (details.mobile || "").replace(/\D/g, ''),
      mobileValid: hasMobile,
      phone1: details.phone1 || "",
      phone2: details.phone2 || details.homePhone || "",
      phone3: details.phone3 || details.workPhone || "",
      phone4: details.phone4 || "",
      telephoneNumber1: details.phone1 || "",
      telephoneNumber2: details.phone2 || details.homePhone || "",
      telephoneNumber3: details.phone3 || details.workPhone || "",
      telephoneNumber4: details.phone4 || "",
      homePhone: details.homePhone || details.phone2 || "",
      workPhone: details.workPhone || details.phone3 || "",
      email: details.email || "",
      emailValid: hasEmail,
      homeEmail: details.homeEmail || "",
      workEmail: details.workEmail || "",
      otherEmail1: details.otherEmail1 || "",
      otherEmail2: details.otherEmail2 || "",
      idCardNumber: details.personalId || "",
      personalId: details.personalId || "",
      sourceOfInformation: details.sourceOfInformation || "Walk-in",
      nationality: details.nationality || "",
      location: {
        flatBuilding: "N/A",
        area: details.area || "Deira",
        city: details.city || "Dubai"
      },
      branchCode: branchCodeNum,
      preferredBranch: details.branch || "10 - Sheikh Zayed Rd",
      customerSince: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      dateOfBirth: "",
      nationality: details.country || "United Arab Emirates",
      vip: false,
      doNotContact: false,
      consents: resolvedConsents,
      language: "English",
      loyaltyTier: autolineCustNo ? "STANDARD" : "NEW",
      vehicles: [],
      enquiries: generatedEnquiryId ? [{
        enquiryNumber: generatedEnquiryId,
        date: new Date().toISOString().split('T')[0],
        status: "Open",
        brand: grp,
        branch: details.branch || "10 - Sheikh Zayed Rd"
      }] : []
    };

    // Update active state
    setCustomer(newProfile);
    if (generatedEnquiryId) {
      setEnquiryNumber(generatedEnquiryId);
    }
    setCustomerList(prev => [newProfile, ...(prev || [])]);
    setSelectedIndex(0);
    setCurrentGroup(newProfile.keyloopGroup);
    syncGroupToUrl(newProfile.keyloopGroup);
    setVehicles([]);
    setSelectedVin("");
    setVehicleDetails(null);

    // Save to local storage
    try {
      localStorage.setItem('complaint_customer_profile_data', JSON.stringify(newProfile));
      localStorage.setItem('sales_customer_profile_data', JSON.stringify(newProfile));
    } catch (err) {
      console.warn("LocalStorage save error:", err);
    }

    setLoading(false);
    return { 
      ok: true, 
      payload: caseDetails, 
      customer: newProfile,
      rpaResult,
      taskId: rpaTaskId,
      status: autolineCustNo ? 'COMPLETED' : 'QUEUED'
    };
  };

  // Update Customer Handler using CREATE_CUSTOMER RPA Intake Case
  const updateCustomer = async (details, onProgress = null) => {
    if (!customer) return { ok: false, error: "No active customer to update" };

    const branchCodeNum = details.branch ? details.branch.split(' - ')[0].trim() : (customer.branchCode || "10");
    const grp = details.group || customer.keyloopGroup || currentGroup || "BMW";

    const caseDetails = {
      group: grp,
      branch: details.branch || customer.preferredBranch || (grp.toUpperCase().includes('GEELY') ? "10 - Geely Group - SZR" : "10 - Sheikh Zayed Rd"),
      titleCode: details.titleCode || customer.salutation || "Mr.",
      firstName: details.firstName !== undefined ? details.firstName : (customer.firstName || ""),
      surname: details.surname !== undefined ? details.surname : (customer.surname || ""),
      area: details.area !== undefined ? details.area : (customer.location?.area || "Deira"),
      city: details.city !== undefined ? details.city : (customer.location?.city || "Dubai"),
      country: details.country !== undefined ? details.country : (customer.country || customer.nationality || "United Arab Emirates"),
      mobile: details.mobile !== undefined ? details.mobile : (customer.mobile || ""),
      phone1: details.phone1 !== undefined ? details.phone1 : (customer.phone1 || customer.telephoneNumber1 || ""),
      phone2: details.phone2 !== undefined ? details.phone2 : (customer.phone2 || customer.telephoneNumber2 || customer.homePhone || ""),
      phone3: details.phone3 !== undefined ? details.phone3 : (customer.phone3 || customer.telephoneNumber3 || customer.workPhone || ""),
      phone4: details.phone4 !== undefined ? details.phone4 : (customer.phone4 || customer.telephoneNumber4 || ""),
      telephoneNumber1: details.phone1 !== undefined ? details.phone1 : (customer.telephoneNumber1 || customer.phone1 || ""),
      telephoneNumber2: details.phone2 !== undefined ? details.phone2 : (customer.telephoneNumber2 || customer.phone2 || ""),
      telephoneNumber3: details.phone3 !== undefined ? details.phone3 : (customer.telephoneNumber3 || customer.phone3 || ""),
      telephoneNumber4: details.phone4 !== undefined ? details.phone4 : (customer.telephoneNumber4 || customer.phone4 || ""),
      homePhone: details.homePhone !== undefined ? details.homePhone : (details.phone2 || customer.homePhone || customer.homeTelephone || ""),
      workPhone: details.workPhone !== undefined ? details.workPhone : (details.phone3 || customer.workPhone || customer.businessPhone || customer.officePhone || ""),
      email: details.email !== undefined ? details.email : (customer.email || ""),
      homeEmail: details.homeEmail !== undefined ? details.homeEmail : (customer.homeEmail || ""),
      workEmail: details.workEmail !== undefined ? details.workEmail : (customer.workEmail || customer.businessEmail || customer.officeEmail || ""),
      otherEmail1: details.otherEmail1 !== undefined ? details.otherEmail1 : (customer.otherEmail1 || ""),
      otherEmail2: details.otherEmail2 !== undefined ? details.otherEmail2 : (customer.otherEmail2 || ""),
      source: details.source !== undefined ? details.source : (customer.source || customer.leadSource || "CRM Inbound"),
      sourceOfInformation: details.sourceOfInformation !== undefined ? details.sourceOfInformation : (customer.sourceOfInformation || "Walk-in"),
      personalId: details.personalId !== undefined ? details.personalId : (customer.personalId || ""),
      nationality: details.nationality !== undefined ? details.nationality : (customer.nationality || ""),
      ...(details.dob ? { dob: details.dob } : (customer?.dateOfBirth || customer?.dob ? { dob: customer.dateOfBirth || customer.dob } : {}))
    };

    console.log("Submitting RPA CREATE_CUSTOMER on customer edit:", caseDetails);

    let rpaResult = null;
    let rpaTaskId = null;

    try {
      const res = await executeRpaCase("CREATE_CUSTOMER", caseDetails, {
        createdBy: agentId || "genesys",
        callbackUrl: "http://localhost:9999/hook",
        onProgress: (status, taskData) => {
          if (taskData?.taskId) rpaTaskId = taskData.taskId;
          if (onProgress) onProgress(status, taskData);
        }
      });
      if (res && res.ok) {
        rpaResult = res.result;
        if (res.taskId) rpaTaskId = res.taskId;
      }
    } catch (e) {
      console.warn("RPA CREATE_CUSTOMER on edit error (applying local state update):", e);
    }

    const updatedCustNo = rpaResult?.customerId || rpaResult?.customerNumber || customer.customerNumber;

    const updatedProfile = {
      ...customer,
      keyloopGroup: grp,
      customerNumber: updatedCustNo,
      salutation: caseDetails.titleCode,
      firstName: caseDetails.firstName,
      surname: caseDetails.surname,
      fullName: `${caseDetails.titleCode ? caseDetails.titleCode + ' ' : ''}${caseDetails.firstName || ''} ${caseDetails.surname || ''}`.trim(),
      mobile: caseDetails.mobile,
      mobileRaw: (caseDetails.mobile || "").replace(/\D/g, ''),
      phone1: caseDetails.phone1,
      phone2: caseDetails.phone2,
      phone3: caseDetails.phone3,
      phone4: caseDetails.phone4,
      telephoneNumber1: caseDetails.telephoneNumber1,
      telephoneNumber2: caseDetails.telephoneNumber2,
      telephoneNumber3: caseDetails.telephoneNumber3,
      telephoneNumber4: caseDetails.telephoneNumber4,
      homePhone: caseDetails.homePhone,
      workPhone: caseDetails.workPhone,
      email: caseDetails.email,
      homeEmail: caseDetails.homeEmail,
      workEmail: caseDetails.workEmail,
      otherEmail1: caseDetails.otherEmail1,
      otherEmail2: caseDetails.otherEmail2,
      personalId: caseDetails.personalId || customer.personalId,
      sourceOfInformation: caseDetails.sourceOfInformation,
      nationality: caseDetails.nationality,
      location: {
        ...(customer.location || {}),
        area: caseDetails.area,
        city: caseDetails.city
      },
      branchCode: branchCodeNum,
      preferredBranch: caseDetails.branch,
      country: caseDetails.country,
      lastUpdated: new Date().toISOString().split('T')[0],
      rpaTaskId: rpaTaskId || customer.rpaTaskId
    };

    setCustomer(updatedProfile);
    setCustomerList(prev => {
      if (!Array.isArray(prev) || prev.length === 0) return [updatedProfile];
      return prev.map(c => c.customerNumber === customer.customerNumber ? { ...c, ...updatedProfile } : c);
    });

    if (grp !== currentGroup) {
      setCurrentGroup(grp);
      syncGroupToUrl(grp);
    }

    // Persist to local storage
    try {
      localStorage.setItem('complaint_customer_profile_data', JSON.stringify(updatedProfile));
      localStorage.setItem('sales_customer_profile_data', JSON.stringify(updatedProfile));
    } catch (err) {
      console.warn("LocalStorage update error:", err);
    }

    return { 
      ok: true, 
      payload: caseDetails, 
      customer: updatedProfile, 
      rpaResult, 
      taskId: rpaTaskId 
    };
  };

  // Submit Customer Data Verification via RPA Intake (caseType: "UPDATE_CUSTOMER")
  const verifyCustomer = async (details) => {
    if (!customer && !details.customerId) return { ok: false, error: "No active customer to verify" };

    const cleanGroup = details.group || customer?.keyloopGroup || currentGroup || "BMW";
    const custNo = details.customerId || customer?.customerNumber || customer?.id || "";
    const fullName = details.customerName || 
      customer?.fullName || 
      `${customer?.firstName || ''} ${customer?.surname || ''}`.trim() || 
      "Customer";

    const currentMonthYear = `${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getFullYear()).slice(-2)}`;
    const verifiedCode = details.dataVerified || `DV ${currentMonthYear}`;

    // Schema matching POST /api/intake/cases (caseType: "UPDATE_CUSTOMER")
    const caseDetails = {
      group: cleanGroup,
      customerId: String(custNo).trim(),
      customerName: String(fullName).trim(),
      sourceOfInformation: String(details.sourceOfInformation || details.source || "Walk-in").trim(),
      personalId: String(details.personalId || details.idCardNumber || customer?.personalId || customer?.idCardNumber || customer?.nationalId || "").trim(),
      dataVerified: String(verifiedCode).trim(),
      area: String(details.area !== undefined ? details.area : (customer?.location?.area || "")).trim(),
      city: String(details.city !== undefined ? details.city : (customer?.location?.city || "Dubai")).trim(),
      country: String(details.country !== undefined ? details.country : (customer?.country || customer?.location?.country || "")).trim(),
      postcode: String(details.postcode !== undefined ? details.postcode : (customer?.location?.postcode || "")).trim(),
      mobile: String(details.mobile !== undefined ? details.mobile : (customer?.mobile || "")).trim(),
      homePhone: String(details.homePhone !== undefined ? details.homePhone : (customer?.homePhone || customer?.homeTelephone || "")).trim(),
      workPhone: String(details.workPhone !== undefined ? details.workPhone : (customer?.workPhone || customer?.businessPhone || customer?.officePhone || "")).trim(),
      email: String(details.email !== undefined ? details.email : (customer?.email || "")).trim(),
      homeEmail: String(details.homeEmail !== undefined ? details.homeEmail : (customer?.homeEmail || "")).trim(),
      workEmail: String(details.workEmail !== undefined ? details.workEmail : (customer?.workEmail || customer?.businessEmail || customer?.officeEmail || "")).trim(),
      preferredPhone: String(details.preferredPhone !== undefined ? details.preferredPhone : (details.mobile || customer?.mobile || "")).trim(),
      preferredEmail: String(details.preferredEmail !== undefined ? details.preferredEmail : (details.email || customer?.email || "")).trim(),
      nationality: String(details.nationality !== undefined ? details.nationality : (customer?.nationality || "")).trim()
    };

    console.log("Submitting UPDATE_CUSTOMER RPA intake payload:", caseDetails);

    const rpaRes = await updateCustomerCase(caseDetails, {
      createdBy: agentId || "genesys",
      callbackUrl: "http://localhost:9999/hook"
    });

    const updatedVerification = {
      ...(customer?.verificationStatus || {}),
      status: caseDetails.dataVerified,
      lastVerifiedOn: new Date().toISOString().split('T')[0],
      lastVerifiedBy: agentId || "genesys",
      lastEditedOn: new Date().toISOString().split('T')[0],
      lastEditedBy: agentId || "genesys"
    };

    if (customer) {
      const updatedProfile = {
        ...customer,
        personalId: caseDetails.personalId,
        dataVerified: caseDetails.dataVerified,
        sourceOfInformation: caseDetails.sourceOfInformation,
        nationality: caseDetails.nationality || customer.nationality,
        mobile: caseDetails.mobile || customer.mobile,
        mobileRaw: (caseDetails.mobile || customer.mobile || "").replace(/\D/g, ''),
        homePhone: caseDetails.homePhone !== undefined ? caseDetails.homePhone : (customer.homePhone || ""),
        workPhone: caseDetails.workPhone !== undefined ? caseDetails.workPhone : (customer.workPhone || ""),
        email: caseDetails.email || customer.email,
        homeEmail: caseDetails.homeEmail !== undefined ? caseDetails.homeEmail : (customer.homeEmail || ""),
        workEmail: caseDetails.workEmail !== undefined ? caseDetails.workEmail : (customer.workEmail || ""),
        preferredPhone: caseDetails.preferredPhone,
        preferredEmail: caseDetails.preferredEmail,
        location: {
          ...(customer.location || {}),
          area: caseDetails.area,
          city: caseDetails.city,
          postcode: caseDetails.postcode
        },
        verificationStatus: updatedVerification,
        lastUpdated: new Date().toISOString().split('T')[0]
      };

      setCustomer(updatedProfile);
      setCustomerList(prev => {
        if (!Array.isArray(prev) || prev.length === 0) return [updatedProfile];
        return prev.map(c => (c.customerNumber === custNo || c.id === custNo) ? { ...c, ...updatedProfile } : c);
      });

      try {
        localStorage.setItem('complaint_customer_profile_data', JSON.stringify(updatedProfile));
        localStorage.setItem('sales_customer_profile_data', JSON.stringify(updatedProfile));
      } catch (err) {
        console.warn("LocalStorage update error:", err);
      }
    }

    if (setVerificationStatus) {
      setVerificationStatus(updatedVerification);
    }

    return { ok: true, data: rpaRes, taskId: rpaRes?.taskId };
  };

  // Helper getters strictly based on profile API response fields
  const getFormattedName = () => {
    if (!customer) return 'N/A';
    if (customer?.fullName && customer.fullName.trim() !== '') return customer.fullName;
    const parts = [customer?.salutation, customer?.firstName, customer?.middleName, customer?.surname].filter(Boolean);
    return parts.join(' ').trim() || 'N/A';
  };

  const getFormattedDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getFormattedLocation = () => {
    if (!customer) return 'N/A';
    const loc = customer?.location || {};
    const sanitize = (val) => {
      if (!val || val === 'N/A' || val === 'EMPTY') return null;
      const cleaned = String(val).replace(/[\uFFFD\u0000-\u001F\u007F-\u009F]/g, '').trim();
      return cleaned || null;
    };
    const parts = [
      sanitize(loc.flatBuilding),
      sanitize(loc.street),
      sanitize(loc.area),
      sanitize(loc.city),
      loc.poBox && loc.poBox !== 'N/A' && loc.poBox !== 'EMPTY' ? `P.O. ${sanitize(loc.poBox)}` : null
    ].filter(Boolean);

    if (parts.length > 0) return parts.join(', ');
    if (customer?.nationality) return sanitize(customer.nationality) || 'N/A';
    return 'N/A';
  };

  const getBranchName = () => {
    if (!customer) return 'N/A';
    if (customer?.preferredBranch && customer.preferredBranch.trim() !== '') return customer.preferredBranch;
    if (customer?.branchCode) return `Branch Code ${customer.branchCode}`;
    return 'N/A';
  };

  const getLoyaltyTier = () => {
    if (!customer) return 'N/A';
    if (customer?.isProspect) return 'PROSPECT';
    const tier = customer?.loyaltyTier?.trim();
    if (tier) {
      if (tier.toUpperCase() === 'WEB LEAD' || tier.toUpperCase() === 'WEB_LEAD') return 'PROSPECT';
      return tier;
    }
    const cType = customer?.customerType?.trim();
    if (cType) {
      if (cType.toUpperCase() === 'WEB_LEAD' || cType.toUpperCase() === 'WEB LEAD') return 'PROSPECT';
      return cType;
    }
    return 'N/A';
  };

  const getConsentsDisplay = () => {
    if (!customer || !customer?.consents) return 'None';
    const active = Object.entries(customer.consents)
      .filter(([_, v]) => Boolean(v))
      .map(([k]) => k.toUpperCase());
    return active.length > 0 ? active.join(', ') : 'None';
  };

  return (
    <CustomerContext.Provider value={{
      customer,
      group: currentGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || ''),
      currentGroup,
      setCurrentGroup,
      setGroup: setCurrentGroup,
      syncGroupToUrl,
      syncCustomerToUrl,
      customerList,
      selectedIndex,
      selectCustomer,
      loading,
      error,
      currentMobile,
      currentCustomerNumber,
      agentId,
      setAgentId,
      enquiryNumber,
      setEnquiryNumber,
      enquiries,
      setEnquiries,
      openComplaintsCount,
      setOpenComplaintsCount,
      fetchOpenComplaintsCount,
      fetchProfileByCustomerNumber,
      fetchCustomerByMobile,
      fetchCustomerByEmail,
      fetchCustomerByCustomerNumber,
      fetchCustomerByProspectNumber,
      fetchCustomerByPlateOrVin,
      searchCustomer,
      getFormattedName,
      getFormattedDate,
      getFormattedLocation,
      getBranchName,
      getLoyaltyTier,
      getConsentsDisplay,
      vehicles,
      selectedVin,
      vehicleDetails,
      vehiclesLoading,
      selectVehicleByVin,
      fetchVehiclesByCustomer,
      insurance,
      finance,
      tradeInHistory,
      riskOverview,
      salesSummary,
      verificationStatus,
      fetchCustomerExtraDetails,
      createCustomer,
      updateCustomer,
      verifyCustomer,
      customerFormMode,
      openCustomerForm,
      closeCustomerForm,
      isVerificationModalOpen,
      openVerificationModal,
      closeVerificationModal,
      isSmsWidgetOpen,
      isSmsWidgetMinimized,
      openSmsWidget,
      closeSmsWidget,
      toggleMinimizeSmsWidget,
      sendSms,
      toastNotification,
      showToast,
      hideToast,
      customerMatches,
      prospectMatches,
      isAccountResolutionModalOpen,
      openAccountResolutionModal,
      closeAccountResolutionModal,
      selectAccount
    }}>
      {children}
      <GlobalToast notification={toastNotification} onClose={hideToast} />
      <AccountResolutionModal 
        isOpen={isAccountResolutionModalOpen}
        onClose={closeAccountResolutionModal}
        mobile={currentMobile}
        customerMatches={customerMatches}
        prospectMatches={prospectMatches}
        activeRecord={customer}
        onSelectAccount={(item) => selectAccount(item, true)}
      />
      <CustomerVerificationModal 
        isOpen={isVerificationModalOpen} 
        onClose={closeVerificationModal} 
      />
      <FloatingSmsWidget />
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}
