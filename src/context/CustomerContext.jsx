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

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(PROFILE_DEMO_DATA);
  const [customerList, setCustomerList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMobile, setCurrentMobile] = useState("");
  const [currentCustomerNumber, setCurrentCustomerNumber] = useState("");
  const [agentId, setAgentId] = useState("agent.42");
  const [openComplaintsCount, setOpenComplaintsCount] = useState(3);

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
    const generalMobileParam = searchParams.get('mobile') || searchParams.get('phone');
    const customerNoParam = searchParams.get('customerNumber') || searchParams.get('customerNo') || searchParams.get('id') || searchParams.get('customer_id');
    const groupParam = searchParams.get('keyloopGroup') || searchParams.get('group') || searchParams.get('brand') || 'BMW';
    const agentParam = searchParams.get('Agentid') || searchParams.get('agentId') || searchParams.get('agentid') || searchParams.get('agent_id') || searchParams.get('agent');

    if (agentParam) {
      setAgentId(agentParam);
    }

    const activeMobile = complaintMobileParam || salesMobileParam || generalMobileParam;
    const isSales = Boolean(salesMobileParam);
    const prefix = isSales ? 'sales_' : 'complaint_';

    if (activeMobile) {
      setCurrentMobile(activeMobile);
      fetchCustomerByMobile(activeMobile, groupParam, prefix);
    } else if (customerNoParam) {
      setCurrentCustomerNumber(customerNoParam);
      fetchProfileByCustomerNumber(groupParam, customerNoParam, prefix);
    } else {
      // Check if localStorage has cached profile data
      const cachedProfileStr = localStorage.getItem(prefix + 'customer_profile_data');
      if (cachedProfileStr) {
        try {
          const cachedProfile = JSON.parse(cachedProfileStr);
          if (cachedProfile && cachedProfile.customerNumber) {
            setCustomer(cachedProfile);
            fetchOpenComplaintsCount(cachedProfile.keyloopGroup || 'BMW', cachedProfile.customerNumber);
            fetchVehiclesByCustomer(cachedProfile.keyloopGroup || 'BMW', cachedProfile.customerNumber);
            fetchCustomerExtraDetails(cachedProfile.keyloopGroup || 'BMW', cachedProfile.customerNumber);
            return;
          }
        } catch (e) {
          console.warn("Cached profile parse error:", e);
        }
      }
      fetchProfileByCustomerNumber('BMW', '80496', prefix);
    }

    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);

  const fetchVehiclesByCustomer = async (group, custNo) => {
    setVehiclesLoading(true);
    const g = group || customer?.keyloopGroup || 'BMW';
    const c = custNo || customer?.customerNumber || '80496';
    try {
      // 1. Fetch vehicle list for customer: GET /api/v1/vehicles?group={group}&customerNumber={customerNumber}
      const listUrl = `/api/v1/vehicles?group=${g}&customerNumber=${c}`;
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
        const targetVin = list[0]?.vin || list[0]?.chassisNumber;
        if (targetVin) {
          setSelectedVin(targetVin);
          await fetchSingleVehicleDetails(g, targetVin, list[0]);
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
    try {
      const g = group || customer?.keyloopGroup || 'BMW';
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
    const g = customer?.keyloopGroup || 'BMW';
    fetchSingleVehicleDetails(g, vin, found);
  };

  const fetchCustomerExtraDetails = async (group, custNo) => {
    const g = group || customer?.keyloopGroup || 'BMW';
    const c = custNo || customer?.customerNumber || '80496';

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
  };

  const fetchOpenComplaintsCount = async (group, custNo) => {
    try {
      const g = group || customer?.keyloopGroup || "BMW";
      const c = custNo || customer?.customerNumber || customer?.id || "80496";
      const apiUrl = `/api/v1/complaints?group=${g}&customerNumber=${c}&status=open`;
      
      const res = await apiFetch(apiUrl);
      if (res && res.ok && Array.isArray(res.data)) {
        setOpenComplaintsCount(res.data.length);
      }
    } catch (err) {
      console.warn("Failed to fetch open complaints count:", err);
    }
  };

  const fetchProfileByCustomerNumber = async (group, custNo, prefix = 'complaint_') => {
    setLoading(true);
    setError(null);
    try {
      const profileUrl = `/api/v1/customers/${group}/${custNo}/profile`;
      const res = await apiFetch(profileUrl);

      if (res && res.ok && res.data && typeof res.data === 'object') {
        const prof = res.data;
        setCustomer(prof);
        localStorage.setItem(prefix + 'customer_profile_data', JSON.stringify(prof));
        fetchOpenComplaintsCount(group, custNo);

        if (Array.isArray(prof.vehicles) && prof.vehicles.length > 0) {
          setVehicles(prof.vehicles);
          const vin = prof.vehicles[0].vin || prof.vehicles[0].chassisNumber;
          setSelectedVin(vin || "");
          fetchSingleVehicleDetails(group, vin, prof.vehicles[0]);
        } else if (prof.vin) {
          const vObj = { vin: prof.vin, brand: prof.keyloopGroup || group, model: prof.model || prof.description || '' };
          setVehicles([vObj]);
          setSelectedVin(prof.vin);
          fetchSingleVehicleDetails(group, prof.vin, vObj);
        } else {
          fetchVehiclesByCustomer(group, custNo);
        }

        fetchCustomerExtraDetails(group, custNo);
        return;
      }
      throw new Error(`Profile fetch status: ${res ? res.status : 'failed'}`);
    } catch (err) {
      console.warn("Profile API fetch error:", err.message);
      setError(err.message);
      fetchOpenComplaintsCount(group, custNo);
      fetchVehiclesByCustomer(group, custNo);
      fetchCustomerExtraDetails(group, custNo);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerByMobile = async (mobileNum, group = 'BMW', prefix = 'complaint_') => {
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

      const searchUrl = `/api/v1/customers?mobile=${cleanedMobile}`;
      const res = await apiFetch(searchUrl);
      
      if (res && res.ok && res.data) {
        const data = res.data;
        // Save customer search response array to localStorage with prefix
        localStorage.setItem(prefix + 'customer_search_data', JSON.stringify(data));

        let targetItem = null;
        let storedIdx = 0;
        const savedIdxStr = localStorage.getItem(prefix + 'selected_index');
        if (savedIdxStr !== null && !isNaN(Number(savedIdxStr))) {
          storedIdx = Number(savedIdxStr);
        }

        if (Array.isArray(data) && data.length > 0) {
          setCustomerList(data);
          const validIdx = storedIdx < data.length ? storedIdx : 0;
          setSelectedIndex(validIdx);
          targetItem = data[validIdx];
        } else if (typeof data === 'object' && data !== null) {
          setCustomerList([data]);
          setSelectedIndex(0);
          targetItem = data;
        }

        if (targetItem && targetItem.customerNumber) {
          const targetGroup = targetItem.keyloopGroup || group;
          await fetchProfileByCustomerNumber(targetGroup, targetItem.customerNumber, prefix);
          return;
        }
      }
      
      // Fallback profile if mobile search returned no match or error
      setCustomer(PROFILE_DEMO_DATA);
      fetchOpenComplaintsCount(group, '80496');
    } catch (err) {
      console.warn("Search mobile fallback to profile data:", err.message);
      setError(err.message);
      setCustomer(PROFILE_DEMO_DATA);
      fetchOpenComplaintsCount(group, '80496');
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
      const g = target.keyloopGroup || customer?.keyloopGroup || 'BMW';
      const c = target.customerNumber;
      if (c) {
        fetchProfileByCustomerNumber(g, c, prefix);
      }
    }
  };

  // Helper getters strictly based on profile API response fields
  const getFormattedName = () => {
    if (!customer) return 'N/A';
    if (customer.fullName && customer.fullName.trim() !== '') return customer.fullName;
    const parts = [customer.salutation, customer.firstName, customer.middleName, customer.surname].filter(Boolean);
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
    const loc = customer.location || {};
    const parts = [
      loc.flatBuilding && loc.flatBuilding !== 'N/A' && loc.flatBuilding !== 'EMPTY' ? loc.flatBuilding : null,
      loc.street && loc.street !== 'N/A' && loc.street !== 'EMPTY' ? loc.street : null,
      loc.area && loc.area !== 'EMPTY' ? loc.area : null,
      loc.city && loc.city !== 'EMPTY' ? loc.city : null,
      loc.poBox && loc.poBox !== 'N/A' && loc.poBox !== 'EMPTY' ? `P.O. ${loc.poBox}` : null
    ].filter(Boolean);

    if (parts.length > 0) return parts.join(', ');
    if (customer.nationality) return customer.nationality;
    return 'N/A';
  };

  const getBranchName = () => {
    if (!customer) return 'N/A';
    if (customer.preferredBranch && customer.preferredBranch.trim() !== '') return customer.preferredBranch;
    if (customer.branchCode) return `Branch Code ${customer.branchCode}`;
    return 'N/A';
  };

  const getLoyaltyTier = () => {
    if (!customer) return 'N/A';
    if (customer.loyaltyTier && customer.loyaltyTier.trim() !== '') return customer.loyaltyTier;
    if (customer.customerType && customer.customerType.trim() !== '') return customer.customerType;
    return 'N/A';
  };

  const getConsentsDisplay = () => {
    if (!customer || !customer.consents) return 'None';
    const active = Object.entries(customer.consents)
      .filter(([_, v]) => Boolean(v))
      .map(([k]) => k.toUpperCase());
    return active.length > 0 ? active.join(', ') : 'None';
  };

  return (
    <CustomerContext.Provider value={{
      customer,
      customerList,
      selectedIndex,
      selectCustomer,
      loading,
      error,
      currentMobile,
      currentCustomerNumber,
      agentId,
      setAgentId,
      openComplaintsCount,
      setOpenComplaintsCount,
      fetchOpenComplaintsCount,
      fetchProfileByCustomerNumber,
      fetchCustomerByMobile,
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
      fetchCustomerExtraDetails
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
