import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const fetchOpenComplaintsCount = async (group, custNo) => {
    try {
      const g = group || customer?.keyloopGroup || "BMW";
      const c = custNo || customer?.customerNumber || customer?.id || "80496";
      const apiUrl = `/api/v1/complaints?group=${g}&customerNumber=${c}&status=open`;
      const fallbackUrl = `https://ccaas.agmcgroup.ae/api/v1/complaints?group=${g}&customerNumber=${c}&status=open`;
      
      let res;
      try {
        res = await fetch(apiUrl);
      } catch {
        res = await fetch(fallbackUrl);
      }
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOpenComplaintsCount(data.length);
        }
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
      let res;
      try {
        res = await fetch(profileUrl);
      } catch {
        res = await fetch(`https://ccaas.agmcgroup.ae${profileUrl}`);
      }

      if (res && res.ok) {
        const profileData = await res.json();
        if (profileData && typeof profileData === 'object') {
          setCustomer(profileData);
          localStorage.setItem(prefix + 'customer_profile_data', JSON.stringify(profileData));
          fetchOpenComplaintsCount(group, custNo);
          return;
        }
      }
      throw new Error(`Profile fetch status: ${res ? res.status : 'failed'}`);
    } catch (err) {
      console.warn("Profile API fetch error, fallback to demo profile data:", err.message);
      setError(err.message);
      const fallbackProfile = {
        ...PROFILE_DEMO_DATA,
        customerNumber: custNo || PROFILE_DEMO_DATA.customerNumber,
        keyloopGroup: group || PROFILE_DEMO_DATA.keyloopGroup
      };
      setCustomer(fallbackProfile);
      localStorage.setItem(prefix + 'customer_profile_data', JSON.stringify(fallbackProfile));
      fetchOpenComplaintsCount(group, custNo);
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

      let response;
      const searchUrl = `/api/v1/customers?mobile=${cleanedMobile}`;
      const fallbackSearchUrl = `https://ccaas.agmcgroup.ae/api/v1/customers?mobile=${cleanedMobile}`;

      try {
        response = await fetch(searchUrl);
      } catch {
        response = await fetch(fallbackSearchUrl);
      }
      
      if (response && response.ok) {
        const data = await response.json();
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
      getConsentsDisplay
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
