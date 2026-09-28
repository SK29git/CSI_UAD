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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMobile, setCurrentMobile] = useState("");
  const [currentCustomerNumber, setCurrentCustomerNumber] = useState("");
  const [openComplaintsCount, setOpenComplaintsCount] = useState(3);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const salesMobileParam = searchParams.get('Sales') || searchParams.get('sales');
    const customerNoParam = searchParams.get('customerNumber') || searchParams.get('customerNo') || searchParams.get('id') || searchParams.get('customer_id');
    const mobileParam = salesMobileParam || searchParams.get('Complaint') || searchParams.get('mobile') || searchParams.get('phone');
    const groupParam = searchParams.get('keyloopGroup') || searchParams.get('group') || searchParams.get('brand') || 'BMW';

    if (salesMobileParam || mobileParam) {
      const activeMobile = salesMobileParam || mobileParam;
      setCurrentMobile(activeMobile);
      fetchCustomerByMobile(activeMobile, groupParam);
    } else if (customerNoParam) {
      setCurrentCustomerNumber(customerNoParam);
      fetchProfileByCustomerNumber(groupParam, customerNoParam);
    } else {
      // Check if localStorage has cached profile data
      const cachedProfileStr = localStorage.getItem('sales_customer_profile_data');
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
      fetchProfileByCustomerNumber('BMW', '80496');
    }
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

  const fetchProfileByCustomerNumber = async (group, custNo) => {
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
          localStorage.setItem('sales_customer_profile_data', JSON.stringify(profileData));
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
      localStorage.setItem('sales_customer_profile_data', JSON.stringify(fallbackProfile));
      fetchOpenComplaintsCount(group, custNo);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerByMobile = async (mobileNum, group = 'BMW') => {
    setLoading(true);
    setError(null);
    try {
      const cleanedMobile = mobileNum.replace(/[^0-9]/g, '');
      
      // Manage localStorage clearing when a new mobile number is passed
      const cachedMobile = localStorage.getItem('sales_cached_mobile');
      if (cachedMobile !== cleanedMobile) {
        localStorage.removeItem('sales_customer_search_data');
        localStorage.removeItem('sales_customer_profile_data');
        localStorage.setItem('sales_cached_mobile', cleanedMobile);
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
        // Save customer search response array to localStorage
        localStorage.setItem('sales_customer_search_data', JSON.stringify(data));

        let targetItem = null;
        if (Array.isArray(data) && data.length > 0) {
          targetItem = data[0];
        } else if (typeof data === 'object' && data !== null) {
          targetItem = data;
        }

        if (targetItem && targetItem.customerNumber) {
          const targetGroup = targetItem.keyloopGroup || group;
          await fetchProfileByCustomerNumber(targetGroup, targetItem.customerNumber);
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
      loading,
      error,
      currentMobile,
      currentCustomerNumber,
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
