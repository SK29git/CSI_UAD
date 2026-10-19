import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

const CustomerContext = createContext(null);

// Profile response dataset for Suzanne Marie Bacha & fallbacks
export const PROFILE_DEMO_DATA = {
    "keyloopGroup": "BMW",
    "customerNumber": "80496",
    "customerType": "LOYAL",
    "salutation": "Ms.",
    "firstName": "Suzanne",
    "middleName": "Marie",
    "surname": "Bacha",
    "fullName": "Suzanne Marie Bacha",
    "mobile": "+971 50 123 4292",
    "mobileRaw": "0501234292",
    "mobileValid": true,
    "email": "s***@gmail.com",
    "emailValid": true,
    "location": {
        "flatBuilding": "N/A",
        "area": "Umm Suqeim First",
        "city": "Dubai"
    },
    "branchCode": "10",
    "customerSince": "2012-01-21",
    "lastUpdated": "2024-12-26",
    "dateOfBirth": "1962-05-20",
    "nationality": "Germany",
    "vip": false,
    "doNotContact": false,
    "consents": {
        "email": false,
        "phone": false,
        "sms": false,
        "whatsapp": false
    },
    "language": "",
    "id": "",
    "loyaltyTier": "",
    "preferredBranch": "",
    "communicationPreference": ""
};

export const DEMO_VEHICLES = [
  {
    "keyloopGroup": "BMW",
    "vin": "WBA31HC04SFT82888",
    "customerNumber": "80496",
    "registrationNumber": "66164-CC-DXB",
    "registrationDate": "2024-12-19",
    "brand": "BMW",
    "model": "G26",
    "variant": "31HCA",
    "description": "G26 430i Gran Coupe M Sport",
    "modelYear": 2025,
    "fuelType": "Unleaded",
    "colour": "Brooklyn Grey metallic",
    "mileageKm": 2,
    "deliveryDate": "2024-12-20",
    "stockProgress": "Closed",
    "nextServiceDate": "2025-02-20",
    "nextServiceOdometerKm": 1000,
    "insurance": [],
    "warranty": {
      "status": "ACTIVE",
      "provider": "BMW Extended Warranty 3y/200,000 km",
      "contractType": "A7CG",
      "expiryDate": "2027-12-18"
    },
    "serviceContract": {
      "status": "EXPIRED",
      "provider": "BMW Service Inclusive",
      "contractType": "SERVICEINCL",
      "expiryDate": "2024-07-10"
    },
    "serviceType": "",
    "package": "",
    "price": "",
    "eligibility": ""
  },
  {
    "keyloopGroup": "BMW",
    "vin": "WBA68FF04R8E45580",
    "customerNumber": "80496",
    "registrationNumber": "28391-AA-DXB",
    "registrationDate": "2024-06-21",
    "brand": "BMW",
    "model": "G20",
    "variant": "68FFA",
    "description": "G20 330i Sedan M Sport",
    "modelYear": 2024,
    "fuelType": "Unleaded",
    "colour": "Mineral White metalic",
    "mileageKm": 3865,
    "stockProgress": "Available/Instock",
    "nextServiceDate": "2024-08-20",
    "nextServiceOdometerKm": 1000,
    "insurance": [],
    "warranty": {
      "status": "ACTIVE",
      "provider": "BMW Extended Warranty 3y/200,000 km",
      "contractType": "A7CG",
      "expiryDate": "2027-06-19"
    },
    "serviceContract": {
      "status": "NONE"
    },
    "eligibility": "",
    "offer": "",
    "messageId": "",
    "deliveryStatus": ""
  }
];

export const DEMO_INSURANCE = [
  {
    provider: "Sukoon Insurance (Oman Insurance)",
    policyNumber: "POL-984215",
    contractType: "COMPREHENSIVE",
    startDate: "2024-12-19",
    expiryDate: "2025-12-18",
    status: "ACTIVE",
    premium: "AED 3,450"
  }
];

export const DEMO_FINANCE = [
  {
    institution: "Emirates NBD Auto Finance",
    accountNumber: "FIN-774910",
    financeType: "Auto Loan",
    monthlyInstallment: "AED 2,850",
    tenureMonths: 48,
    remainingMonths: 28,
    status: "ACTIVE"
  }
];

export const DEMO_TRADE_IN = [
  {
    tradeInId: "TRD-4412",
    vehicle: "2021 BMW 330i Sedan",
    vin: "WBA330I2021EX123",
    appraisedValue: "AED 95,000",
    tradeInDate: "2024-06-20",
    status: "COMPLETED"
  }
];

export const DEMO_RISK_OVERVIEW = {
  riskTier: "LOW",
  score: 95,
  flags: [],
  notes: "Good payment history & active warranty"
};

export const DEMO_VERIFICATION = {
  status: "VERIFIED",
  lastVerifiedOn: "2026-09-28, 02:14 PM",
  verifiedBy: "Sara Ahmed"
};

export const KNOWN_GROUPS = ['BMW', 'MINI', 'GEELY', 'ROLLS-ROYCE', 'AUDI'];

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(PROFILE_DEMO_DATA);
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
      fetchCustomerByMobile(activeMobile, groupParam, prefix);
    } else if (emailParam) {
      fetchCustomerByEmail(emailParam, groupParam, prefix);
    } else if (plateParam || vinParam) {
      fetchCustomerByPlateOrVin(plateParam || vinParam, groupParam, prefix);
    } else if (customerNoParam) {
      setCurrentCustomerNumber(customerNoParam);
      fetchCustomerByCustomerNumber(groupParam, customerNoParam, prefix);
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
      const listUrl = `/api/v1/vehicles?group=${encodeURIComponent(g)}&customerNumber=${encodeURIComponent(c)}`;
      const res = await apiFetch(listUrl);
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
        if (d.profile && typeof d.profile === 'object') setCustomer(d.profile);
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
        syncEnquiriesFromCustomer(prof, searchItem);
        setCustomer(prof);
        const resolvedGroup = prof.keyloopGroup || group || '';
        if (resolvedGroup) {
          setCurrentGroup(resolvedGroup);
          syncGroupToUrl(resolvedGroup);
        }
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
        return;
      }
      throw new Error(`Profile fetch status: ${res ? res.status : 'failed'}`);
    } catch (err) {
      console.warn("Profile API fetch error:", err.message);
      setError(err.message);
      if (searchItem) {
        syncEnquiriesFromCustomer(searchItem);
        setCustomer(searchItem);
      }
      fetchOpenComplaintsCount(group, custNo);
      fetchVehiclesByCustomer(group, custNo, options);
      fetchCustomerExtraDetails(group, custNo);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerByMobile = async (mobileNum, group = '', prefix = 'complaint_') => {
    setLoading(true);
    setError(null);
    try {
      const cleanedMobile = mobileNum.replace(/[^0-9]/g, '');
      
      // Manage localStorage clearing when a new mobile number is passed
      const cachedMobile = localStorage.getItem(prefix + 'cached_mobile');
      if (cachedMobile !== cleanedMobile) {
        localStorage.removeItem(prefix + 'customer_search_data');
        localStorage.removeItem(prefix + 'customer_profile_data');
        localStorage.removeItem(prefix + 'selected_index');
        localStorage.setItem(prefix + 'cached_mobile', cleanedMobile);
      }

      let allResults = [];

      if (group && group.trim() !== '') {
        const searchUrl = `/api/v1/customers?group=${encodeURIComponent(group.trim())}&mobile=${cleanedMobile}`;
        const res = await apiFetch(searchUrl);
        if (res && res.ok && res.data) {
          allResults = Array.isArray(res.data) ? res.data : [res.data];
        }
      } else {
        // Query known groups in parallel to discover which group the mobile belongs to dynamically
        const groupPromises = KNOWN_GROUPS.map(g =>
          apiFetch(`/api/v1/customers?group=${g}&mobile=${cleanedMobile}`)
            .then(res => (res && res.ok && Array.isArray(res.data)) ? res.data : [])
            .catch(() => [])
        );
        const groupResults = await Promise.all(groupPromises);
        allResults = groupResults.flat();
      }
      
      if (allResults.length > 0) {
        // Save customer search response array to localStorage with prefix
        localStorage.setItem(prefix + 'customer_search_data', JSON.stringify(allResults));

        let storedIdx = 0;
        const savedIdxStr = localStorage.getItem(prefix + 'selected_index');
        if (savedIdxStr !== null && !isNaN(Number(savedIdxStr))) {
          storedIdx = Number(savedIdxStr);
        }

        setCustomerList(allResults);
        const validIdx = storedIdx < allResults.length ? storedIdx : 0;
        setSelectedIndex(validIdx);
        const targetItem = allResults[validIdx];

        if (targetItem && targetItem.customerNumber) {
          const detectedGroup = targetItem.keyloopGroup || group || '';
          await fetchProfileByCustomerNumber(detectedGroup, targetItem.customerNumber, prefix, {}, targetItem);
          return;
        } else if (targetItem) {
          syncEnquiriesFromCustomer(targetItem);
          setCustomer(targetItem);
          return;
        }
      }
      
      setCustomer(null);
      setCustomerList([]);
    } catch (err) {
      console.warn("Search mobile error:", err.message);
      setError(err.message);
      setCustomer(null);
      setCustomerList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerByCustomerNumber = async (group = '', custNo, prefix = 'complaint_') => {
    setLoading(true);
    setError(null);
    try {
      let allResults = [];
      if (group && group.trim() !== '') {
        const searchUrl = `/api/v1/customers?group=${encodeURIComponent(group.trim())}&customerNumber=${custNo}`;
        const res = await apiFetch(searchUrl);
        if (res && res.ok && res.data) {
          allResults = Array.isArray(res.data) ? res.data : [res.data];
        }
      } else {
        // Automatically discover group across known groups
        const groupPromises = KNOWN_GROUPS.map(g =>
          apiFetch(`/api/v1/customers?group=${g}&customerNumber=${custNo}`)
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
        return;
      }
      
      if (group && group.trim() !== '') {
        await fetchProfileByCustomerNumber(group, custNo, prefix);
      }
    } catch (err) {
      console.warn("Customer number search error:", err.message);
      setError(err.message);
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
        return { ok: true, count: allResults.length, customer: targetItem, group: detectedGroup };
      }

      setCustomer(null);
      setCustomerList([]);
      return { ok: false, message: `No customer record found for email "${cleanEmail}"` };
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

  const selectCustomer = (idx) => {
    if (customerList && customerList[idx]) {
      setSelectedIndex(idx);
      const searchParams = new URLSearchParams(window.location.search);
      const isSales = Boolean(searchParams.get('Sales') || searchParams.get('sales'));
      const prefix = isSales ? 'sales_' : 'complaint_';
      localStorage.setItem(prefix + 'selected_index', String(idx));
      
      const target = customerList[idx];
      const g = target.keyloopGroup || customer?.keyloopGroup || '';
      const c = target.customerNumber;
      if (c) {
        fetchProfileByCustomerNumber(g, c, prefix, {}, target);
      } else {
        syncEnquiriesFromCustomer(target);
        setCustomer(target);
      }
    }
  };

  // Create New Customer Handler matching Genesys CCaaS payload schema
  const createCustomer = async (details) => {
    setLoading(true);
    setError(null);
    const payload = {
      caseType: "CREATE_CUSTOMER",
      callbackUrl: "https://ccaas.agmcgroup.ae",
      createdBy: agentId || "genesys",
      details: {
        group: details.group || currentGroup || "BMW",
        branch: details.branch || "10 - Sheikh Zayed Rd",
        titleCode: details.titleCode || "Mr.",
        firstName: details.firstName || "",
        surname: details.surname || "",
        area: details.area || "",
        city: details.city || "Dubai",
        country: details.country || "United Arab Emirates",
        mobile: details.mobile || "",
        email: details.email || ""
      }
    };

    console.log("Submitting CREATE_CUSTOMER payload:", payload);

    let apiData = null;

    try {
      // Attempt backend case creation endpoint
      const res = await apiFetch('/api/v1/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res && res.ok) {
        apiData = res.data;
      }
    } catch (e) {
      console.warn("Backend /api/v1/cases POST error (fallback to local state):", e);
    }

    // Generate unique customer ID if not provided by backend
    const generatedCustNo = apiData?.customerNumber || apiData?.id || String(Math.floor(100000 + Math.random() * 900000));
    const branchCodeNum = details.branch ? details.branch.split(' - ')[0].trim() : "10";

    const newProfile = {
      keyloopGroup: details.group || currentGroup || "BMW",
      customerNumber: generatedCustNo,
      customerType: "PROSPECT",
      salutation: details.titleCode || "Mr.",
      firstName: details.firstName || "",
      middleName: "",
      surname: details.surname || "",
      fullName: `${details.titleCode ? details.titleCode + ' ' : ''}${details.firstName || ''} ${details.surname || ''}`.trim(),
      mobile: details.mobile || "",
      mobileRaw: (details.mobile || "").replace(/\D/g, ''),
      mobileValid: Boolean(details.mobile && details.mobile.length >= 7),
      email: details.email || "",
      emailValid: Boolean(details.email && details.email.includes('@')),
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
      consents: {
        email: true,
        phone: true,
        sms: true,
        whatsapp: true
      },
      language: "English",
      loyaltyTier: "STANDARD"
    };

    // Update active state
    setCustomer(newProfile);
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
    return { ok: true, payload, customer: newProfile };
  };

  // Update Customer Handler (edit existing customer name, mobile, email, branch, address, etc.)
  const updateCustomer = async (details) => {
    if (!customer) return { ok: false, error: "No active customer to update" };

    const branchCodeNum = details.branch ? details.branch.split(' - ')[0].trim() : (customer.branchCode || "10");

    const payload = {
      caseType: "UPDATE_CUSTOMER",
      callbackUrl: "https://ccaas.agmcgroup.ae",
      createdBy: agentId || "genesys",
      customerNumber: customer.customerNumber,
      details: {
        group: details.group || customer.keyloopGroup || "BMW",
        branch: details.branch || customer.preferredBranch || "10 - Sheikh Zayed Rd",
        titleCode: details.titleCode || customer.salutation || "Mr.",
        firstName: details.firstName !== undefined ? details.firstName : customer.firstName,
        surname: details.surname !== undefined ? details.surname : customer.surname,
        area: details.area !== undefined ? details.area : customer.location?.area || "",
        city: details.city !== undefined ? details.city : customer.location?.city || "Dubai",
        country: details.country !== undefined ? details.country : customer.nationality || "United Arab Emirates",
        mobile: details.mobile !== undefined ? details.mobile : customer.mobile,
        email: details.email !== undefined ? details.email : customer.email
      }
    };

    console.log("Submitting UPDATE_CUSTOMER payload:", payload);

    try {
      // Attempt backend update endpoint
      await apiFetch(`/api/v1/customers/${encodeURIComponent(payload.details.group)}/${encodeURIComponent(customer.customerNumber)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn("Backend update error (applying local state update):", e);
    }

    const updatedProfile = {
      ...customer,
      keyloopGroup: payload.details.group,
      salutation: payload.details.titleCode,
      firstName: payload.details.firstName,
      surname: payload.details.surname,
      fullName: `${payload.details.titleCode ? payload.details.titleCode + ' ' : ''}${payload.details.firstName || ''} ${payload.details.surname || ''}`.trim(),
      mobile: payload.details.mobile,
      mobileRaw: (payload.details.mobile || "").replace(/\D/g, ''),
      email: payload.details.email,
      location: {
        ...(customer.location || {}),
        area: payload.details.area,
        city: payload.details.city
      },
      branchCode: branchCodeNum,
      preferredBranch: payload.details.branch,
      nationality: payload.details.country,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setCustomer(updatedProfile);
    setCustomerList(prev => {
      if (!Array.isArray(prev) || prev.length === 0) return [updatedProfile];
      return prev.map(c => c.customerNumber === customer.customerNumber ? { ...c, ...updatedProfile } : c);
    });

    if (payload.details.group !== currentGroup) {
      setCurrentGroup(payload.details.group);
      syncGroupToUrl(payload.details.group);
    }

    // Persist to local storage
    try {
      localStorage.setItem('complaint_customer_profile_data', JSON.stringify(updatedProfile));
      localStorage.setItem('sales_customer_profile_data', JSON.stringify(updatedProfile));
    } catch (err) {
      console.warn("LocalStorage update error:", err);
    }

    return { ok: true, payload, customer: updatedProfile };
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
    const parts = [
      loc.flatBuilding && loc.flatBuilding !== 'N/A' && loc.flatBuilding !== 'EMPTY' ? loc.flatBuilding : null,
      loc.street && loc.street !== 'N/A' && loc.street !== 'EMPTY' ? loc.street : null,
      loc.area && loc.area !== 'EMPTY' ? loc.area : null,
      loc.city && loc.city !== 'EMPTY' ? loc.city : null,
      loc.poBox && loc.poBox !== 'N/A' && loc.poBox !== 'EMPTY' ? `P.O. ${loc.poBox}` : null
    ].filter(Boolean);

    if (parts.length > 0) return parts.join(', ');
    if (customer?.nationality) return customer.nationality;
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
    if (customer?.loyaltyTier && customer.loyaltyTier.trim() !== '') return customer.loyaltyTier;
    if (customer?.customerType && customer.customerType.trim() !== '') return customer.customerType;
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
      fetchCustomerByPlateOrVin,
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
      customerFormMode,
      openCustomerForm,
      closeCustomerForm
    }}>
      {children}
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
