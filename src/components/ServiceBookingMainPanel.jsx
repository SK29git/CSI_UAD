import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { 
  apiFetch,
  findServiceCustomer,
  getServiceCustomerDetail,
  getServiceCustomerVehicles,
  getServiceVehicleDetails,
  getServiceLocations,
  getServiceRecommendedServices,
  getServiceAdvisors,
  getAppointmentDates,
  getAppointmentTimes,
  createServiceBooking
} from '../utils/api';
import { 
  FaCar, 
  FaUser, 
  FaLayerGroup, 
  FaPaperPlane, 
  FaSpinner, 
  FaCheckCircle, 
  FaCalendarCheck,
  FaIdBadge,
  FaSearch,
  FaBell,
  FaFileContract,
  FaClipboardList,
  FaExclamationCircle,
  FaRedo,
  FaMagic,
  FaClock,
  FaMapMarkerAlt,
  FaWrench,
  FaTimes,
  FaCalendarAlt,
  FaCheck,
  FaArrowRight
} from 'react-icons/fa';

export default function ServiceBookingMainPanel() {
  const { customer, agentId, getFormattedName, selectedVin, vehicles, group: contextGroup } = useCustomer();

  const customerName = getFormattedName();
  const initialCustomerNo = customer?.customerNumber || customer?.id || "";
  const initialGroup = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || "");
  const initialCreatedBy = agentId || "agent.42";
  const initialVin = selectedVin || customer?.vin || (vehicles && vehicles.length > 0 ? vehicles[0].vin : "") || "";

  const [keyloopGroup, setKeyloopGroup] = useState(initialGroup);
  const [customerNumber, setCustomerNumber] = useState(initialCustomerNo);
  const [vin, setVin] = useState(initialVin);
  const [createdBy, setCreatedBy] = useState(initialCreatedBy);
  const [wipNumber, setWipNumber] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  // Tools state for other Service Booking screen features
  const [activeToolTab, setActiveToolTab] = useState('CreateBooking');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [requestKind, setRequestKind] = useState("REQUEST");

  // Customer complaints/requests list state (GET /api/v1/customers/{group}/{customerNumber}/requests)
  const [customerRequests, setCustomerRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Sync state when customer profile or selected vehicle changes
  useEffect(() => {
    if (customer) {
      if (customer?.keyloopGroup) setKeyloopGroup(customer?.keyloopGroup);
      if (customer?.customerNumber || customer?.id) setCustomerNumber(customer?.customerNumber || customer?.id);
    }
  }, [customer]);

  useEffect(() => {
    if (selectedVin) {
      setVin(selectedVin);
    } else if (vehicles && vehicles.length > 0) {
      setVin(vehicles[0].vin);
    }
  }, [selectedVin, vehicles]);

  useEffect(() => {
    if (agentId) setCreatedBy(agentId);
  }, [agentId]);

  // =========================================================================
  // UNIVERSAL SERVICE BOOKING FLOW STATE & HANDLERS (Multi-Brand DMS REST APIs)
  // Supports: BMW, MINI, Rolls-Royce, Geely, Lotus, etc.
  // =========================================================================
  const [bookingMode, setBookingMode] = useState('SERVICE_ENGINE'); // 'SERVICE_ENGINE' (AGMC Universal Flow) or 'KEYLOOP' (Legacy)

  const normalizeBrand = (b) => {
    if (!b) return 'BMW';
    const upper = String(b).toUpperCase();
    if (upper.includes('GEELY')) return 'Geely';
    if (upper.includes('MINI')) return 'MINI';
    if (upper.includes('ROLLS')) return 'Rolls-Royce';
    if (upper.includes('BMW')) return 'BMW';
    return b;
  };

  const detectedMake = vehicles?.[0]?.brand || customer?.brand || contextGroup || customer?.keyloopGroup || 'BMW';
  const [serviceMake, setServiceMake] = useState(() => normalizeBrand(detectedMake));

  const [geelyPhone, setGeelyPhone] = useState(customer?.mobileRaw || customer?.mobile || '0543408597');
  const [geelyCustomerId, setGeelyCustomerId] = useState(customer?.id || '');
  const [geelyCustomerSearching, setGeelyCustomerSearching] = useState(false);
  const [geelyCustomerFound, setGeelyCustomerFound] = useState(null);

  const [geelyPlateNo, setGeelyPlateNo] = useState(vehicles?.[0]?.registrationNumber || '240153');
  const [geelyVehicleSearching, setGeelyVehicleSearching] = useState(false);
  const [geelyVehicleData, setGeelyVehicleData] = useState(null);
  const [geelyVehicleId, setGeelyVehicleId] = useState(15);

  const [geelyLocations, setGeelyLocations] = useState([]);
  const [geelyLocationsLoading, setGeelyLocationsLoading] = useState(false);
  const [geelyLocationId, setGeelyLocationId] = useState(40);

  const [geelyServices, setGeelyServices] = useState([]);
  const [geelyServicesLoading, setGeelyServicesLoading] = useState(false);
  const [geelySelectedProductId, setGeelySelectedProductId] = useState('07143ffd-184e-43b5-a8de-f68d63199baa');

  const [geelyAvailableDates, setGeelyAvailableDates] = useState([]);
  const [geelyDatesLoading, setGeelyDatesLoading] = useState(false);
  const [geelySelectedDate, setGeelySelectedDate] = useState('2026-11-17');

  const [geelyTimeSlots, setGeelyTimeSlots] = useState([]);
  const [geelyTimesLoading, setGeelyTimesLoading] = useState(false);
  const [geelySelectedTimeSlot, setGeelySelectedTimeSlot] = useState('10:15-10:30');

  const [geelyAdvisors, setGeelyAdvisors] = useState([]);
  const [geelyAdvisorId, setGeelyAdvisorId] = useState('');

  const [geelyMileage, setGeelyMileage] = useState(5000);
  const [geelyMileageUnit, setGeelyMileageUnit] = useState('KM');
  const [geelyCustomerNotes, setGeelyCustomerNotes] = useState('');

  const [geelySubmitting, setGeelySubmitting] = useState(false);
  const [geelyBookingResult, setGeelyBookingResult] = useState(null);
  const [geelyBookingError, setGeelyBookingError] = useState(null);

  // Sync phone, plate, and make from active customer when available
  useEffect(() => {
    if (customer?.mobileRaw || customer?.mobile) {
      setGeelyPhone(customer?.mobileRaw || customer?.mobile);
    }
    if (vehicles && vehicles.length > 0 && vehicles[0].registrationNumber) {
      setGeelyPlateNo(vehicles[0].registrationNumber);
    }
    const make = vehicles?.[0]?.brand || customer?.brand || contextGroup || customer?.keyloopGroup;
    if (make) {
      setServiceMake(normalizeBrand(make));
    }
  }, [customer, vehicles, contextGroup]);

  // Load Service Locations & Recommended Services on mount or mode switch
  useEffect(() => {
    let isMounted = true;
    const fetchInitialServiceMeta = async () => {
      setGeelyLocationsLoading(true);
      setGeelyServicesLoading(true);
      try {
        const [locRes, srvRes] = await Promise.allSettled([
          getServiceLocations('workshop'),
          getServiceRecommendedServices('workshop')
        ]);

        if (isMounted) {
          if (locRes.status === 'fulfilled' && locRes.value?.ok) {
            const locList = locRes.value.data?.data || locRes.value.data?.result || locRes.value.data || [];
            if (Array.isArray(locList) && locList.length > 0) {
              setGeelyLocations(locList);
              if (!locList.some(l => l.id === 40)) {
                setGeelyLocationId(locList[0].id);
              }
            }
          }

          if (srvRes.status === 'fulfilled' && srvRes.value?.ok) {
            const srvList = srvRes.value.data?.result || srvRes.value.data?.data || srvRes.value.data || [];
            if (Array.isArray(srvList) && srvList.length > 0) {
              setGeelyServices(srvList);
              if (!srvList.some(s => s.serviceProductId === '07143ffd-184e-43b5-a8de-f68d63199baa')) {
                setGeelySelectedProductId(srvList[0].serviceProductId);
              }
            }
          }
        }
      } catch (err) {
        console.warn("Universal service initial metadata fetch failed:", err);
      } finally {
        if (isMounted) {
          setGeelyLocationsLoading(false);
          setGeelyServicesLoading(false);
        }
      }
    };

    fetchInitialServiceMeta();
    return () => { isMounted = false; };
  }, []);

  // Fetch available dates dynamically based on selected brand (BMW, MINI, Rolls-Royce, Geely)
  useEffect(() => {
    if (!geelyLocationId || !geelySelectedProductId) return;
    let isMounted = true;
    const fetchDates = async () => {
      setGeelyDatesLoading(true);
      try {
        const res = await getAppointmentDates({
          dealershipLocationId: geelyLocationId,
          make: serviceMake || 'BMW',
          serviceProductIds: [geelySelectedProductId]
        });
        if (isMounted && res && res.ok && res.data) {
          const rawDates = res.data.result?.availableDates || res.data.availableDates || [];
          if (Array.isArray(rawDates) && rawDates.length > 0) {
            setGeelyAvailableDates(rawDates);
            if (!rawDates.includes(geelySelectedDate)) {
              setGeelySelectedDate(rawDates[0]);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch appointment dates:", err);
      } finally {
        if (isMounted) setGeelyDatesLoading(false);
      }
    };

    fetchDates();
    return () => { isMounted = false; };
  }, [geelyLocationId, geelySelectedProductId, serviceMake]);

  // Fetch available timeslots when date changes
  useEffect(() => {
    if (!geelyLocationId || !geelySelectedProductId || !geelySelectedDate) return;
    let isMounted = true;
    const fetchTimes = async () => {
      setGeelyTimesLoading(true);
      try {
        const res = await getAppointmentTimes({
          selectedDate: geelySelectedDate,
          dealershipLocationId: geelyLocationId,
          serviceProductIds: [geelySelectedProductId]
        });
        if (isMounted && res && res.ok && res.data) {
          const rawSlots = res.data.result?.timeSlots || res.data.timeSlots || [];
          if (Array.isArray(rawSlots) && rawSlots.length > 0) {
            setGeelyTimeSlots(rawSlots);
            const firstSlot = rawSlots[0]?.timeSlot || '10:15-10:30';
            setGeelySelectedTimeSlot(firstSlot);
            if (rawSlots[0]?.advisorId) {
              setGeelyAdvisorId(String(rawSlots[0].advisorId));
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch timeslots:", err);
      } finally {
        if (isMounted) setGeelyTimesLoading(false);
      }
    };

    fetchTimes();
    return () => { isMounted = false; };
  }, [geelyLocationId, geelySelectedProductId, geelySelectedDate]);

  // Fetch Advisors for selected location
  useEffect(() => {
    if (!geelyLocationId) return;
    getServiceAdvisors(geelyLocationId).then(res => {
      if (res && res.ok && res.data) {
        const advList = res.data.result || res.data.data || res.data || [];
        if (Array.isArray(advList)) setGeelyAdvisors(advList);
      }
    }).catch(e => console.warn("Advisors fetch failed:", e));
  }, [geelyLocationId]);

  // Find Customer by phone
  const handleFindGeelyCustomer = async () => {
    if (!geelyPhone.trim()) return;
    setGeelyCustomerSearching(true);
    setGeelyCustomerFound(null);
    try {
      const res = await findServiceCustomer(geelyPhone.trim());
      if (res && res.ok && res.data?.result) {
        const firstCust = Array.isArray(res.data.result) ? res.data.result[0] : res.data.result;
        if (firstCust) {
          setGeelyCustomerFound(firstCust);
          if (firstCust.customerId) {
            setGeelyCustomerId(firstCust.customerId);
            // Also fetch customer vehicles
            getServiceCustomerVehicles(firstCust.customerId).then(vRes => {
              if (vRes && vRes.ok && vRes.data?.result) {
                const vList = Array.isArray(vRes.data.result) ? vRes.data.result : [vRes.data.result];
                if (vList.length > 0) {
                  const firstV = vList[0].vehicle || vList[0];
                  if (firstV.licensePlate) setGeelyPlateNo(firstV.licensePlate);
                  if (firstV.vehicleId) setGeelyVehicleId(firstV.vehicleId);
                  if (firstV.make || firstV.brand) setServiceMake(normalizeBrand(firstV.make || firstV.brand));
                }
              }
            }).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.warn("Find service customer error:", err);
    } finally {
      setGeelyCustomerSearching(false);
    }
  };

  // Lookup Vehicle by Plate
  const handleLookupGeelyVehicle = async () => {
    if (!geelyPlateNo.trim()) return;
    setGeelyVehicleSearching(true);
    setGeelyVehicleData(null);
    try {
      const res = await getServiceVehicleDetails(geelyPlateNo.trim());
      if (res && res.ok && res.data?.data) {
        setGeelyVehicleData(res.data.data);
        if (res.data.data.sabVehicleId) {
          setGeelyVehicleId(res.data.data.sabVehicleId);
        }
        if (res.data.data.vehicleMakeCode) {
          setServiceMake(normalizeBrand(res.data.data.vehicleMakeCode));
        }
      }
    } catch (err) {
      console.warn("Lookup service vehicle error:", err);
    } finally {
      setGeelyVehicleSearching(false);
    }
  };

  // Submit Service Booking (POST /api/service)
  const handleSubmitGeelyBooking = async (e) => {
    e.preventDefault();
    if (!geelySelectedDate || !geelySelectedTimeSlot) return;

    setGeelySubmitting(true);
    setGeelyBookingResult(null);
    setGeelyBookingError(null);

    const payload = {
      advisorId: geelyAdvisorId || "",
      customerNotes: geelyCustomerNotes || "",
      dealershipLocationId: Number(geelyLocationId) || 40,
      dropOffTime: geelySelectedTimeSlot,
      licensePlateNo: geelyPlateNo,
      mileage: Number(geelyMileage) || 5000,
      mileageUnit: geelyMileageUnit || "KM",
      serviceProductIds: [geelySelectedProductId],
      startDate: geelySelectedDate,
      vehicleId: Number(geelyVehicleId) || 15
    };

    try {
      const res = await createServiceBooking(payload);
      if (res && res.ok && res.data) {
        setGeelyBookingResult({
          success: true,
          data: res.data.result?.data || res.data.result || res.data,
          submittedPayload: payload
        });
      } else {
        setGeelyBookingError(res?.statusText || res?.data?.msg || "Failed to create service booking");
      }
    } catch (err) {
      console.error("Universal service booking error:", err);
      setGeelyBookingError(err.message || "Failed to submit booking");
    } finally {
      setGeelySubmitting(false);
    }
  };


  // Fetch list of customer complaints and requests (GET /api/v1/customers/{group}/{customerNumber}/requests)
  const fetchCustomerRequests = async () => {
    if (!customerNumber) return;
    setRequestsLoading(true);
    try {
      const res = await apiFetch(`/api/v1/customers/${keyloopGroup}/${customerNumber}/requests`);
      if (res && res.ok && Array.isArray(res.data)) {
        setCustomerRequests(res.data);
      } else {
        setCustomerRequests([]);
      }
    } catch (err) {
      console.warn("Failed to fetch customer requests list:", err);
      setCustomerRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (activeToolTab === 'Requests' && customerNumber) {
      fetchCustomerRequests();
    }
  }, [activeToolTab, keyloopGroup, customerNumber]);

  // 1. Create Service Booking (POST /api/v1/service-bookings)
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!customerNumber || !vin) return;
    setSubmitting(true);
    setApiResponse(null);

    const payload = {
      keyloopGroup,
      customerNumber,
      vin,
      createdBy: createdBy || "agent.42"
    };

    try {
      const res = await apiFetch('/api/v1/service-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res && res.ok && res.data) {
        setApiResponse({ ok: true, data: res.data });
      } else {
        setApiResponse({ ok: false, error: res?.statusText || "Unable to save service booking request" });
      }
    } catch (err) {
      console.warn("Service booking submission error:", err);
      setApiResponse({ ok: false, error: err.message || "Service booking submission failed" });
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Check Service Eligibility (GET /api/v1/vehicles/{group}/{vin}/service-eligibility)
  const handleCheckEligibility = async () => {
    if (!vin) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await apiFetch(`/api/v1/vehicles/${keyloopGroup}/${vin}/service-eligibility`);
      if (res && res.ok && res.data) {
        setLookupResult({ type: 'eligibility', ok: true, data: res.data });
      } else {
        setLookupResult({ type: 'eligibility', ok: false, error: res?.statusText || "No eligibility data returned for this VIN" });
      }
    } catch (err) {
      setLookupResult({ type: 'eligibility', ok: false, error: err.message || "Failed to fetch eligibility" });
    } finally {
      setLookupLoading(false);
    }
  };

  // 3. Lookup Booking by WIP Number (GET /api/v1/service-bookings/{group}/{wipNumber})
  const handleLookupWip = async () => {
    if (!wipNumber.trim()) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await apiFetch(`/api/v1/service-bookings/${keyloopGroup}/${wipNumber.trim()}`);
      if (res && res.ok && res.data) {
        setLookupResult({ type: 'wip', ok: true, data: res.data });
      } else {
        setLookupResult({ type: 'wip', ok: false, error: res?.statusText || `No booking found for WIP #${wipNumber}` });
      }
    } catch (err) {
      setLookupResult({ type: 'wip', ok: false, error: err.message || "Failed to fetch WIP booking" });
    } finally {
      setLookupLoading(false);
    }
  };

  // 4. Save Request/Complaint (POST /api/v1/customers/{group}/{customerNumber}/requests)
  const handleSaveRequest = async (e) => {
    e.preventDefault();
    if (!customerNumber || !requestText.trim()) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const payload = {
        kind: requestKind,
        text: requestText.trim(),
        vin: vin,
        createdBy: createdBy || "agent.42"
      };
      const res = await apiFetch(`/api/v1/customers/${keyloopGroup}/${customerNumber}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res && res.ok && res.data) {
        setLookupResult({ type: 'request', ok: true, data: res.data });
        setRequestText("");
        fetchCustomerRequests();
      } else {
        setLookupResult({ type: 'request', ok: false, error: res?.statusText || "Failed to save request" });
      }
    } catch (err) {
      setLookupResult({ type: 'request', ok: false, error: err.message || "Failed to save request" });
    } finally {
      setLookupLoading(false);
    }
  };

  // 5. Check Confirmation (GET /api/v1/service-bookings/{group}/{wipNumber}/confirmation)
  const handleCheckConfirmation = async () => {
    if (!wipNumber.trim()) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await apiFetch(`/api/v1/service-bookings/${keyloopGroup}/${wipNumber.trim()}/confirmation`);
      if (res && res.ok && res.data) {
        setLookupResult({ type: 'confirmation', ok: true, data: res.data });
      } else {
        setLookupResult({ type: 'confirmation', ok: false, error: res?.statusText || `No confirmation details for WIP #${wipNumber}` });
      }
    } catch (err) {
      setLookupResult({ type: 'confirmation', ok: false, error: err.message || "Failed to check confirmation" });
    } finally {
      setLookupLoading(false);
    }
  };

  // 6. Check Service Reminder (GET /api/v1/service-bookings/{group}/{wipNumber}/reminder)
  const handleCheckReminder = async () => {
    if (!wipNumber.trim()) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await apiFetch(`/api/v1/service-bookings/${keyloopGroup}/${wipNumber.trim()}/reminder`);
      if (res && res.ok && res.data) {
        setLookupResult({ type: 'reminder', ok: true, data: res.data });
      } else {
        setLookupResult({ type: 'reminder', ok: false, error: res?.statusText || `No reminder details for WIP #${wipNumber}` });
      }
    } catch (err) {
      setLookupResult({ type: 'reminder', ok: false, error: err.message || "Failed to check reminder" });
    } finally {
      setLookupLoading(false);
    }
  };

  // 7. AI Service Recommendation (GET /api/v1/vehicles/{group}/{vin}/service-recommendation)
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  const handleCheckRecommendation = async () => {
    if (!vin.trim()) return;
    setRecommendationLoading(true);
    setRecommendationResult(null);
    try {
      const res = await apiFetch(`/api/v1/vehicles/${keyloopGroup}/${vin.trim()}/service-recommendation`);
      if (res && res.ok && res.data) {
        setRecommendationResult({ ok: true, data: res.data });
      } else {
        setRecommendationResult({ ok: false, error: res?.statusText || "No recommendation inputs returned by API" });
      }
    } catch (err) {
      setRecommendationResult({ ok: false, error: err.message || "Failed to fetch recommendation inputs" });
    } finally {
      setRecommendationLoading(false);
    }
  };

  // Helper component to render rich booking fields grid dynamically from API response object
  const renderBookingFieldsGrid = (data) => {
    if (!data || typeof data !== 'object') return null;

    const bookingRef = data.bookingId || data.wipNumber || data.jobNumber || data.reference;
    const branchName = typeof data.branch === 'object' ? (data.branch.name || data.branch.code) : (data.branch || '');
    const vehicleDesc = data.vehicle ? `${data.brand || ''} ${data.vehicle}`.trim() : (data.brand || '');
    const dateTimeStr = [data.date, data.time ? `@ ${data.time}` : null].filter(Boolean).join(' ');

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {bookingRef && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Booking ID / WIP</span>
            <span className="font-mono font-extrabold text-blue-700 text-xs">{bookingRef}</span>
          </div>
        )}

        {data.status && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Booking Status</span>
            <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 inline-block text-xs">
              {data.status} {data.statusCode ? `(${data.statusCode})` : ''}
            </span>
          </div>
        )}

        {vehicleDesc && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Vehicle</span>
            <span className="font-bold text-gray-900">{vehicleDesc}</span>
          </div>
        )}

        {data.vin && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Vehicle VIN</span>
            <span className="font-mono font-bold text-gray-900 uppercase">{data.vin}</span>
          </div>
        )}

        {(data.batteryId || data.batteryID || data.battery_id || data.battery || data.vehicle?.batteryId || data.vehicle?.batteryID) && (
          <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-blue-700 uppercase block">Battery ID</span>
            <span className="font-mono font-extrabold text-blue-900 text-xs">
              {data.batteryId || data.batteryID || data.battery_id || data.battery || data.vehicle?.batteryId || data.vehicle?.batteryID}
            </span>
          </div>
        )}

        {dateTimeStr && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Booking Date & Time</span>
            <span className="font-bold text-gray-900">{dateTimeStr}</span>
          </div>
        )}

        {data.dueOutDate && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Due Out Date</span>
            <span className="font-bold text-gray-900">{data.dueOutDate}</span>
          </div>
        )}

        {branchName && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Branch Location</span>
            <span className="font-bold text-blue-700">{branchName}</span>
          </div>
        )}

        {data.bookedBy && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Booked By (Staff ID)</span>
            <span className="font-bold text-gray-900">{data.bookedBy}</span>
          </div>
        )}

        {data.odometerKm !== undefined && data.odometerKm !== null && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Odometer Reading</span>
            <span className="font-extrabold text-gray-900">{Number(data.odometerKm).toLocaleString()} KM</span>
          </div>
        )}

        {data.nextServiceDate && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Next Service Date</span>
            <span className="font-bold text-gray-900">{data.nextServiceDate}</span>
          </div>
        )}

        {data.createdDate && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Created Date</span>
            <span className="font-semibold text-gray-700">{data.createdDate}</span>
          </div>
        )}

        {data.lastUpdatedDate && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Last Updated</span>
            <span className="font-semibold text-gray-700">{data.lastUpdatedDate}</span>
          </div>
        )}

        {data.keyloopGroup && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Keyloop Group</span>
            <span className="font-bold text-gray-900">{data.keyloopGroup}</span>
          </div>
        )}

        {data.customerNumber && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Customer Number</span>
            <span className="font-bold text-gray-900">{data.customerNumber}</span>
          </div>
        )}

        {data.open !== undefined && (
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Workshop Status</span>
            <span className={`font-extrabold px-2 py-0.5 rounded text-[11px] inline-block ${data.open ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
              {data.open ? 'Open Job' : 'Closed Job'}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-5 text-xs">
      
      {/* Tool Navigation Selector Bar */}
      <div className="bg-gray-100/90 rounded-xl p-2 shadow-2xs border border-gray-200 flex items-center justify-between overflow-x-auto gap-2 text-[11px] font-semibold no-scrollbar">
        <button
          onClick={() => { setActiveToolTab('CreateBooking'); setLookupResult(null); }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeToolTab === 'CreateBooking' 
              ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 font-semibold'
          }`}
        >
          <FaPaperPlane className="text-xs" />
          <span>1. Book Service</span>
        </button>

        <button
          onClick={() => { setActiveToolTab('Eligibility'); setLookupResult(null); }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeToolTab === 'Eligibility' 
              ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 font-semibold'
          }`}
        >
          <FaFileContract className="text-xs" />
          <span>2. Service Eligibility</span>
        </button>

        <button
          onClick={() => { setActiveToolTab('ModifyWip'); setLookupResult(null); }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeToolTab === 'ModifyWip' 
              ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 font-semibold'
          }`}
        >
          <FaSearch className="text-xs" />
          <span>3. Lookup WIP Booking</span>
        </button>

        <button
          onClick={() => { setActiveToolTab('Requests'); setLookupResult(null); }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeToolTab === 'Requests' 
              ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 font-semibold'
          }`}
        >
          <FaClipboardList className="text-xs" />
          <span>4. Save Request</span>
        </button>

        <button
          onClick={() => { setActiveToolTab('Confirmation'); setLookupResult(null); }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeToolTab === 'Confirmation' 
              ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 font-semibold'
          }`}
        >
          <FaCheckCircle className="text-xs" />
          <span>5. Confirmation & Reminder</span>
        </button>

        <button
          onClick={() => { setActiveToolTab('Recommendation'); setLookupResult(null); }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
            activeToolTab === 'Recommendation' 
              ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 font-semibold'
          }`}
        >
          <FaMagic className="text-xs" />
          <span>6. AI Recommendation</span>
        </button>
      </div>

      {/* 1. CREATE SERVICE BOOKING FORM */}
      {activeToolTab === 'CreateBooking' && (
        <div className="flex flex-col gap-4">

          {/* Integration Mode Switcher Bar */}
          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
                <FaCar className="text-sm" />
              </div>
              <div>
                <span className="font-bold text-gray-900 text-xs block">Service Engine Integration Flow</span>
                <span className="text-[10px] text-gray-500 font-medium">Select backend service provider API</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setBookingMode('SERVICE_ENGINE')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  bookingMode === 'SERVICE_ENGINE' || bookingMode === 'GEELY'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>AGMC Universal Service Engine (Direct DMS)</span>
              </button>
              <button
                type="button"
                onClick={() => setBookingMode('KEYLOOP')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  bookingMode === 'KEYLOOP'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>Keyloop RPA Flow</span>
              </button>
            </div>
          </div>

          {/* ================================================================ */}
          {/* UNIVERSAL SERVICE BOOKING FORM (DIRECT DMS REST APIS)            */}
          {/* ================================================================ */}
          {(bookingMode === 'SERVICE_ENGINE' || bookingMode === 'GEELY') && (
            <div className="flex flex-col gap-4">

              {/* Service Success Result Card */}
              {geelyBookingResult && (
                <div className="bg-white rounded-xl border border-emerald-300 shadow-sm overflow-hidden text-xs animate-fade-in">
                  <div className="px-4 py-2.5 bg-emerald-600 text-white flex items-center justify-between font-bold">
                    <span className="flex items-center gap-2 text-sm">
                      <FaCheckCircle /> Service Booking Confirmed ({serviceMake})!
                    </span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase font-mono font-extrabold">
                      APPOINTMENT #{geelyBookingResult.data?.appointmentId || 'CONFIRMED'}
                    </span>
                  </div>

                  <div className="p-4 bg-emerald-50/40 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Appointment ID</span>
                        <span className="font-mono font-extrabold text-emerald-800 text-xs">
                          {geelyBookingResult.data?.appointmentId || 'Success'}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Scheduled Date & Time</span>
                        <span className="font-bold text-gray-900 text-xs">
                          {geelyBookingResult.submittedPayload?.startDate} @ {geelyBookingResult.submittedPayload?.dropOffTime}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Vehicle Plate</span>
                        <span className="font-mono font-bold text-blue-700 text-xs">
                          {geelyBookingResult.submittedPayload?.licensePlateNo}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Dealership Location</span>
                        <span className="font-bold text-gray-800 text-xs">
                          Location ID #{geelyBookingResult.submittedPayload?.dealershipLocationId}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveToolTab('OpenBookings')}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <span>View in Open Bookings</span>
                        <FaArrowRight className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Error Banner */}
              {geelyBookingError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-900">
                  <FaExclamationCircle className="text-rose-600 text-base shrink-0" />
                  <div className="flex-1">
                    <span className="font-bold block">Failed to Create Service Booking</span>
                    <span className="text-[11px] text-rose-700">{geelyBookingError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeelyBookingError(null)}
                    className="text-rose-400 hover:text-rose-700 font-bold p-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Universal Service Booking Form Card */}
              <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
                <div className="bg-slate-100/80 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white shadow-xs flex items-center justify-center font-bold">
                      <FaCalendarCheck className="text-lg" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-extrabold text-gray-900 text-sm leading-tight">AGMC Universal Service Booking</h2>
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Multi-Brand DMS Engine: {serviceMake}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
                        Direct Workshop Management System • Automated Appointment Scheduling
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmitGeelyBooking} className="p-6 space-y-6 text-xs bg-slate-50/40">
                  
                  {/* STEP 0: Vehicle Brand / Make Selector Strip */}
                  <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-extrabold text-gray-800 flex items-center gap-1.5">
                        <FaCar className="text-blue-600 text-xs" /> Target Brand / Make <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <span className="text-[10px] text-gray-500 font-medium">
                        Selected: <span className="font-bold text-blue-700">{serviceMake}</span> (Used for DMS availability & routing)
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {['BMW', 'MINI', 'Rolls-Royce', 'Geely'].map((br) => (
                        <button
                          key={br}
                          type="button"
                          onClick={() => setServiceMake(br)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            serviceMake.toUpperCase() === br.toUpperCase()
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {br}
                        </button>
                      ))}
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="text-[10px] text-gray-500 font-semibold">Other:</span>
                        <input
                          type="text"
                          value={serviceMake}
                          onChange={(e) => setServiceMake(e.target.value)}
                          placeholder="Brand name"
                          className="p-1 px-2.5 bg-gray-50 border border-gray-300 rounded-md text-xs font-bold w-28 text-gray-800 focus:bg-white focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* STEP 1: Customer Phone & License Plate */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Customer Phone + Quick Lookup */}
                    <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1.5">
                      <label className="text-[11px] font-extrabold text-gray-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <FaUser className="text-blue-600 text-xs" /> Customer Phone Number <span className="text-rose-500 font-bold">*</span>
                        </span>
                        {geelyCustomerFound && (
                          <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                            <FaCheck className="text-[9px]" /> Verified Customer
                          </span>
                        )}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={geelyPhone}
                          onChange={(e) => setGeelyPhone(e.target.value)}
                          placeholder="e.g. 0543408597"
                          required
                          className="flex-1 p-2 bg-gray-50 border border-gray-300 rounded-md font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleFindGeelyCustomer}
                          disabled={geelyCustomerSearching || !geelyPhone}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-md cursor-pointer transition-colors shrink-0 disabled:opacity-50"
                        >
                          {geelyCustomerSearching ? <FaSpinner className="animate-spin text-xs" /> : 'Find Customer'}
                        </button>
                      </div>
                      {geelyCustomerFound && (
                        <div className="text-[10px] text-gray-500 font-medium pt-1 border-t border-gray-100 flex items-center justify-between">
                          <span>{geelyCustomerFound.name || 'Found'} ({geelyCustomerFound.reference || 'Ref'})</span>
                          <span className="font-mono text-purple-700 font-bold">{geelyCustomerId.slice(0, 8)}...</span>
                        </div>
                      )}
                    </div>

                    {/* License Plate + Vehicle Lookup */}
                    <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1.5">
                      <label className="text-[11px] font-extrabold text-gray-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <FaCar className="text-blue-600 text-xs" /> Vehicle License Plate No <span className="text-rose-500 font-bold">*</span>
                        </span>
                        {geelyVehicleData && (
                          <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                            <FaCheck className="text-[9px]" /> Vehicle Identified
                          </span>
                        )}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={geelyPlateNo}
                          onChange={(e) => setGeelyPlateNo(e.target.value)}
                          placeholder="e.g. 240153"
                          required
                          className="flex-1 p-2 bg-gray-50 border border-gray-300 rounded-md font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all text-xs uppercase"
                        />
                        <button
                          type="button"
                          onClick={handleLookupGeelyVehicle}
                          disabled={geelyVehicleSearching || !geelyPlateNo}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-md cursor-pointer transition-colors shrink-0 disabled:opacity-50"
                        >
                          {geelyVehicleSearching ? <FaSpinner className="animate-spin text-xs" /> : 'Lookup Vehicle'}
                        </button>
                      </div>
                      {geelyVehicleData && (
                        <div className="text-[10px] text-gray-500 font-medium pt-1 border-t border-gray-100 flex items-center justify-between">
                          <span>{geelyVehicleData.vehicleMakeCode} {geelyVehicleData.vehicleModal} ({geelyVehicleData.modalYear})</span>
                          <span className="font-mono text-blue-700 font-bold">{geelyVehicleData.chassisNumber || 'No VIN'}</span>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* STEP 2: Dealership Workshop Location & Recommended Service */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Dealership Workshop Location (GET /api/service-locations?type=workshop) */}
                    <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1.5">
                      <label className="text-[11px] font-extrabold text-gray-800 flex items-center gap-1.5">
                        <FaMapMarkerAlt className="text-blue-600 text-xs" /> Dealership Workshop Location <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <select
                        value={geelyLocationId}
                        onChange={(e) => setGeelyLocationId(Number(e.target.value))}
                        disabled={geelyLocationsLoading}
                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all text-xs"
                      >
                        {geelyLocations.length > 0 ? (
                          geelyLocations.map(loc => (
                            <option key={loc.id} value={loc.id}>
                              {loc.id} - {loc.name} {loc.city ? `(${loc.city})` : ''}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="40">40 - AGMC Service Center - Deira</option>
                            <option value="10">10 - AGMC Service Center - Sheikh Zayed Rd</option>
                            <option value="20">20 - AGMC Service Center - Sharjah</option>
                            <option value="30">30 - AGMC Service Center - Ras Al Khaimah</option>
                            <option value="50">50 - AGMC Service Center - Fujairah</option>
                            <option value="80">80 - AGMC Service Center - Abu Dhabi</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Recommended Service Package (GET /api/service/recommended-services?type=workshop) */}
                    <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1.5">
                      <label className="text-[11px] font-extrabold text-gray-800 flex items-center gap-1.5">
                        <FaWrench className="text-blue-600 text-xs" /> Recommended Service Package <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <select
                        value={geelySelectedProductId}
                        onChange={(e) => setGeelySelectedProductId(e.target.value)}
                        disabled={geelyServicesLoading}
                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all text-xs"
                      >
                        {geelyServices.length > 0 ? (
                          geelyServices.map(srv => (
                            <option key={srv.serviceProductId} value={srv.serviceProductId}>
                              {srv.serviceCategory?.description || 'Service'}: {srv.description} {srv.price ? `• AED ${srv.price}` : ''}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="07143ffd-184e-43b5-a8de-f68d63199baa">Periodic Maintenance: 5,000 KM</option>
                            <option value="6dc62a95-a90c-49a8-a967-49be58de3e86">Periodic Maintenance: 12,000 KM</option>
                            <option value="8c202060-c231-4d55-be89-3771fad1acfb">Periodic Maintenance: 20,000 KM</option>
                          </>
                        )}
                      </select>
                    </div>

                  </div>

                  {/* STEP 3: Real-Time Appointment Date & Timeslots */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Appointment Date (POST /api/service/appointment-dates) */}
                    <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1.5">
                      <label className="text-[11px] font-extrabold text-gray-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <FaCalendarAlt className="text-blue-600 text-xs" /> Appointment Date <span className="text-rose-500 font-bold">*</span>
                        </span>
                        {geelyDatesLoading && (
                          <span className="text-gray-400 font-medium text-[10px] flex items-center gap-1">
                            <FaSpinner className="animate-spin text-[10px]" /> Fetching dates...
                          </span>
                        )}
                      </label>
                      <input
                        type="date"
                        required
                        value={geelySelectedDate}
                        onChange={(e) => setGeelySelectedDate(e.target.value)}
                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all text-xs"
                      />
                      {geelyAvailableDates.length > 0 && (
                        <div className="pt-1.5 flex flex-wrap gap-1">
                          <span className="text-[10px] text-gray-400 font-bold block w-full">Available Dates:</span>
                          {geelyAvailableDates.slice(0, 5).map(dt => (
                            <button
                              key={dt}
                              type="button"
                              onClick={() => setGeelySelectedDate(dt)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                geelySelectedDate === dt
                                  ? 'bg-blue-600 text-white shadow-2xs'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              {dt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Appointment Timeslots (POST /api/service/appointment-time) */}
                    <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1.5">
                      <label className="text-[11px] font-extrabold text-gray-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <FaClock className="text-blue-600 text-xs" /> Drop-off Timeslot <span className="text-rose-500 font-bold">*</span>
                        </span>
                        {geelyTimesLoading && (
                          <span className="text-gray-400 font-medium text-[10px] flex items-center gap-1">
                            <FaSpinner className="animate-spin text-[10px]" /> Fetching slots...
                          </span>
                        )}
                      </label>
                      <div className="flex flex-wrap gap-1.5 min-h-[38px] items-center">
                        {(geelyTimeSlots.length > 0 ? geelyTimeSlots : [
                          { timeSlot: "08:00-08:15", advisorId: "4031" },
                          { timeSlot: "08:15-08:30", advisorId: "4031" },
                          { timeSlot: "10:15-10:30", advisorId: "4031" },
                          { timeSlot: "11:45-12:00", advisorId: "4031" }
                        ]).map((slot, sIdx) => (
                          <button
                            key={slot.timeSlot || sIdx}
                            type="button"
                            onClick={() => {
                              setGeelySelectedTimeSlot(slot.timeSlot);
                              if (slot.advisorId) setGeelyAdvisorId(String(slot.advisorId));
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                              geelySelectedTimeSlot === slot.timeSlot
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                            }`}
                          >
                            {slot.timeSlot}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* STEP 4: Mileage, Advisor, Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    {/* Mileage */}
                    <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1">
                      <label className="text-[11px] font-extrabold text-gray-800 flex items-center gap-1.5">
                        <FaClock className="text-gray-400 text-xs" /> Current Mileage (KM) <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={geelyMileage}
                        onChange={(e) => setGeelyMileage(e.target.value)}
                        placeholder="e.g. 5000"
                        required
                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all text-xs"
                      />
                    </div>

                    {/* Service Advisor (GET /api/service/advisors) */}
                    <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1">
                      <label className="text-[11px] font-extrabold text-gray-800 flex items-center gap-1.5">
                        <FaUser className="text-gray-400 text-xs" /> Service Advisor (Optional)
                      </label>
                      <input
                        type="text"
                        value={geelyAdvisorId}
                        onChange={(e) => setGeelyAdvisorId(e.target.value)}
                        placeholder="e.g. 4031 (or auto)"
                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all text-xs"
                      />
                    </div>

                    {/* Customer Notes */}
                    <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1">
                      <label className="text-[11px] font-extrabold text-gray-800 flex items-center gap-1.5">
                        <FaClipboardList className="text-gray-400 text-xs" /> Customer Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={geelyCustomerNotes}
                        onChange={(e) => setGeelyCustomerNotes(e.target.value)}
                        placeholder="e.g. Regular 5,000 KM service"
                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all text-xs"
                      />
                    </div>

                  </div>

                  {/* Submit Button Bar */}
                  <div className="flex items-center justify-center pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={geelySubmitting || !geelySelectedDate || !geelySelectedTimeSlot}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 min-w-[240px]"
                    >
                      {geelySubmitting ? (
                        <>
                          <FaSpinner className="animate-spin text-sm" />
                          <span>Booking via AGMC Service Engine...</span>
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="text-sm" />
                          <span>Confirm & Create Service Booking ({serviceMake})</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>

            </div>
          )}

          {/* ================================================================ */}
          {/* KEYLOOP (BMW) SERVICE BOOKING FORM                               */}
          {/* ================================================================ */}
          {bookingMode === 'KEYLOOP' && (
            <div className="flex flex-col gap-4">
              {/* Response Formatted UI Card */}
              {apiResponse && (
                <div className="bg-white rounded-xl border border-emerald-300 shadow-sm overflow-hidden text-xs">
                  <div className={`px-4 py-2.5 text-white flex items-center justify-between font-bold ${apiResponse.ok ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                    <span className="flex items-center gap-2 text-sm">
                      {apiResponse.ok ? <FaCheckCircle /> : <FaExclamationCircle />}
                      {apiResponse.ok ? 'Service Booking Confirmation' : 'Submission Error'}
                    </span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase font-mono font-extrabold">
                      {apiResponse.ok ? 'SUCCESS' : 'FAILED'}
                    </span>
                  </div>

                  {apiResponse.error ? (
                    <div className="p-4 bg-rose-50 text-rose-800 font-semibold">{apiResponse.error}</div>
                  ) : (
                    <div className="p-4 bg-slate-50/50">
                      {renderBookingFieldsGrid(apiResponse.data)}
                    </div>
                  )}
                </div>
              )}

              {/* Form Card */}
              <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden">
                <div className="bg-slate-100/80 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white shadow-xs flex items-center justify-center font-bold">
                      <FaCalendarCheck className="text-lg" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-gray-900 text-sm leading-tight">Create Service Booking (BMW Keyloop)</h2>
                      <p className="text-[11px] font-semibold text-gray-500">
                        Request service booking for <span className="text-blue-700 font-bold">{customerName || `Customer #${customerNumber || 'N/A'}`}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmitBooking} className="p-6 space-y-6 text-xs bg-slate-50/40">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Field 1: Keyloop Group */}
                    <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1">
                      <label className="text-[11px] font-extrabold text-gray-800 flex items-center gap-1.5">
                        <FaLayerGroup className="text-blue-600 text-xs" /> Keyloop Group <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <select 
                        value={keyloopGroup}
                        onChange={(e) => setKeyloopGroup(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      >
                        <option value="BMW">BMW</option>
                        <option value="MINI">MINI</option>
                        <option value="Motorrad">Motorrad</option>
                        <option value="Rolls-Royce">Rolls-Royce</option>
                      </select>
                    </div>

                    {/* Field 2: Customer Number */}
                    <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1">
                      <label className="text-[11px] font-extrabold text-gray-800 flex items-center gap-1.5">
                        <FaUser className="text-blue-600 text-xs" /> Customer Number <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input 
                        type="text"
                        value={customerNumber}
                        onChange={(e) => setCustomerNumber(e.target.value)}
                        placeholder="Enter Customer Number..."
                        required
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>

                    {/* Field 3: Vehicle VIN */}
                    <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1">
                      <label className="text-[11px] font-extrabold text-gray-800 flex items-center gap-1.5">
                        <FaCar className="text-blue-600 text-xs" /> Vehicle VIN <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input 
                        type="text"
                        value={vin}
                        onChange={(e) => setVin(e.target.value)}
                        placeholder="Enter Vehicle VIN..."
                        required
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all uppercase"
                      />
                    </div>

                    {/* Field 4: Created By */}
                    <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1">
                      <label className="text-[11px] font-extrabold text-gray-800 flex items-center gap-1.5">
                        <FaIdBadge className="text-blue-600 text-xs" /> Created By (Agent ID) <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input 
                        type="text"
                        value={createdBy}
                        onChange={(e) => setCreatedBy(e.target.value)}
                        placeholder="e.g. agent.42"
                        required
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>

                  </div>

                  <div className="flex items-center justify-center pt-4 border-t border-gray-300">
                    <button 
                      type="submit" 
                      disabled={submitting || !customerNumber || !vin}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 min-w-[220px]"
                    >
                      {submitting ? (
                        <>
                          <FaSpinner className="animate-spin text-sm" />
                          <span>Submitting Booking...</span>
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="text-sm" />
                          <span>Book Service</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 2. SERVICE ELIGIBILITY CHECK */}
      {activeToolTab === 'Eligibility' && (
        <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden flex flex-col">
          <div className="bg-slate-100/80 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
              <FaFileContract className="text-blue-600" /> Service Eligibility Check
            </h3>
          </div>

          <div className="p-6 bg-slate-50/40 flex flex-col gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-2xs flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[11px] font-extrabold text-gray-800 mb-1 block">Vehicle VIN</label>
                <input 
                  type="text"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  placeholder="Enter Vehicle VIN..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all uppercase"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleCheckEligibility}
                  disabled={lookupLoading || !vin}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg cursor-pointer flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {lookupLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />} Check Eligibility
                </button>
              </div>
            </div>

            {/* Formatted Eligibility UI Card */}
            {lookupResult?.type === 'eligibility' && (
              <div className="bg-white rounded-xl border border-blue-300 shadow-sm overflow-hidden text-xs">
                <div className={`px-4 py-2.5 text-white flex items-center justify-between font-bold ${lookupResult.ok ? 'bg-blue-600' : 'bg-rose-600'}`}>
                  <span className="flex items-center gap-2 text-sm">
                    {lookupResult.ok ? <FaCheckCircle /> : <FaExclamationCircle />} Eligibility Check Result
                  </span>
                  <span className="bg-blue-800 text-white font-mono px-2 py-0.5 rounded text-[10px] font-extrabold">
                    VIN: #{lookupResult.data?.vin || vin}
                  </span>
                </div>

                {lookupResult.error ? (
                  <div className="p-4 bg-rose-50 text-rose-800 font-semibold">{lookupResult.error}</div>
                ) : (
                  <div className="p-4 bg-slate-50/50 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      
                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Vehicle VIN</span>
                        <span className="font-mono font-bold text-gray-900 text-xs">{lookupResult.data?.vin || vin}</span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Keyloop Group</span>
                        <span className="font-bold text-gray-900">{lookupResult.data?.keyloopGroup || keyloopGroup}</span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Current Mileage</span>
                        <span className="font-bold text-gray-900">
                          {lookupResult.data?.mileageKm !== undefined ? `${lookupResult.data.mileageKm.toLocaleString()} KM` : 'N/A'}
                        </span>
                      </div>

                      {(lookupResult.data?.batteryId || lookupResult.data?.batteryID || lookupResult.data?.battery_id) && (
                        <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-2xs space-y-1">
                          <span className="text-[10px] font-extrabold text-blue-700 uppercase block">Battery ID</span>
                          <span className="font-mono font-extrabold text-blue-900 text-xs">
                            {lookupResult.data.batteryId || lookupResult.data.batteryID || lookupResult.data.battery_id}
                          </span>
                        </div>
                      )}

                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Warranty Status</span>
                        <span className={`inline-block font-extrabold text-xs px-2 py-0.5 rounded ${
                          lookupResult.data?.warrantyStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {lookupResult.data?.warrantyStatus || 'N/A'}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Warranty Coverage</span>
                        <span className="font-semibold text-gray-800">{lookupResult.data?.warrantyCoverage || 'N/A'}</span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Warranty Expiry Date</span>
                        <span className="font-semibold text-gray-900">{lookupResult.data?.warrantyExpiryDate || 'N/A'}</span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Service Contract Status</span>
                        <span className={`inline-block font-extrabold text-xs px-2 py-0.5 rounded ${
                          lookupResult.data?.serviceContractStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {lookupResult.data?.serviceContractStatus || 'EXPIRED'}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Contract Package Type</span>
                        <span className="font-bold text-gray-900">{lookupResult.data?.serviceContractType || 'N/A'}</span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Contract Expiry Date</span>
                        <span className="font-semibold text-gray-900">{lookupResult.data?.serviceContractExpiryDate || 'N/A'}</span>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. LOOKUP WIP BOOKING */}
      {activeToolTab === 'ModifyWip' && (
        <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden flex flex-col">
          <div className="bg-slate-100/80 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
              <FaSearch className="text-blue-600" /> Modify / Reschedule / Lookup WIP Booking
            </h3>
          </div>

          <div className="p-6 bg-slate-50/40 flex flex-col gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-2xs flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[11px] font-extrabold text-gray-800 mb-1 block">WIP Number</label>
                <input 
                  type="text"
                  value={wipNumber}
                  onChange={(e) => setWipNumber(e.target.value)}
                  placeholder="Enter WIP Number (e.g. WIP-10294)..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all uppercase"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleLookupWip}
                  disabled={lookupLoading || !wipNumber.trim()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg cursor-pointer flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {lookupLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />} Fetch WIP Booking
                </button>
              </div>
            </div>

            {/* Formatted WIP Booking UI Card */}
            {lookupResult?.type === 'wip' && (
              <div className="bg-white rounded-xl border border-indigo-300 shadow-sm overflow-hidden text-xs">
                <div className={`px-4 py-2.5 text-white flex items-center justify-between font-bold ${lookupResult.ok ? 'bg-indigo-600' : 'bg-rose-600'}`}>
                  <span className="flex items-center gap-2 text-sm">
                    {lookupResult.ok ? <FaCheckCircle /> : <FaExclamationCircle />} Booking Details for WIP #{wipNumber}
                  </span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono font-extrabold">
                    {lookupResult.ok ? 'FOUND' : 'NOT FOUND'}
                  </span>
                </div>

                {lookupResult.error ? (
                  <div className="p-4 bg-rose-50 text-rose-800 font-semibold">{lookupResult.error}</div>
                ) : (
                  <div className="p-4 bg-slate-50/50 space-y-3">
                    {renderBookingFieldsGrid(lookupResult.data)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SAVE REQUEST / COMPLAINT */}
      {activeToolTab === 'Requests' && (
        <div className="flex flex-col gap-5">
          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden flex flex-col">
            <div className="bg-slate-100/80 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                <FaClipboardList className="text-blue-600" /> Save Customer Complaint / Request
              </h3>
            </div>

            <form onSubmit={handleSaveRequest} className="p-6 bg-slate-50/40 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1">
                  <label className="text-[11px] font-extrabold text-gray-800 block">Request Type / Kind</label>
                  <select 
                    value={requestKind}
                    onChange={(e) => setRequestKind(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="REQUEST">REQUEST</option>
                    <option value="COMPLAINT">COMPLAINT</option>
                    <option value="SERVICE_BOOKING">SERVICE_BOOKING</option>
                  </select>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1">
                  <label className="text-[11px] font-extrabold text-gray-800 block">Vehicle VIN</label>
                  <input 
                    type="text"
                    value={vin}
                    onChange={(e) => setVin(e.target.value)}
                    placeholder="Enter Vehicle VIN..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 uppercase"
                  />
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs space-y-1">
                <label className="text-[11px] font-extrabold text-gray-800 block">
                  Request Details / Notes <span className="text-rose-500 font-bold">*</span>
                </label>
                <textarea 
                  rows="3"
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  placeholder="Describe customer request or complaint notes..."
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-medium text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-center pt-2">
                <button 
                  type="submit" 
                  disabled={lookupLoading || !customerNumber || !requestText.trim()}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 min-w-[200px]"
                >
                  {lookupLoading ? <FaSpinner className="animate-spin text-sm" /> : <FaClipboardList className="text-sm" />} Save Request
                </button>
              </div>
            </form>

            {/* Formatted Request Save UI Card */}
            {lookupResult?.type === 'request' && (
              <div className="p-6 pt-0">
                <div className="bg-white rounded-xl border border-emerald-300 shadow-sm overflow-hidden text-xs">
                  <div className={`px-4 py-2.5 text-white flex items-center justify-between font-bold ${lookupResult.ok ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                    <span className="flex items-center gap-2 text-sm">
                      {lookupResult.ok ? <FaCheckCircle /> : <FaExclamationCircle />}
                      {lookupResult.ok ? 'Customer Request Saved Successfully' : 'Save Error'}
                    </span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono font-extrabold">
                      {requestKind}
                    </span>
                  </div>

                  {lookupResult.error ? (
                    <div className="p-4 bg-rose-50 text-rose-800 font-semibold">{lookupResult.error}</div>
                  ) : (
                    <div className="p-4 bg-slate-50/50 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                          <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Request Reference ID</span>
                          <span className="font-mono font-extrabold text-emerald-700 text-xs">{lookupResult.data?.requestId || lookupResult.data?.id || 'SAVED'}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                          <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Request Type</span>
                          <span className="font-bold text-gray-900">{requestKind}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                          <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Vehicle VIN</span>
                          <span className="font-mono font-bold text-gray-900 uppercase">{vin || 'N/A'}</span>
                        </div>
                      </div>
                      {lookupResult.data?.text && (
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                          <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Request Notes</span>
                          <p className="font-medium text-gray-800 text-xs">{lookupResult.data.text}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* List of Saved Customer Complaints & Requests (GET /api/v1/customers/{group}/{customerNumber}/requests) */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden flex flex-col">
            <div className="bg-slate-100/80 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaClipboardList className="text-blue-600" />
                <h3 className="font-extrabold text-gray-900 text-sm">
                  Saved Customer Complaints & Requests ({customerRequests.length})
                </h3>
              </div>
              <button 
                onClick={fetchCustomerRequests}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                title="Refresh Requests List"
              >
                <FaRedo className={`text-xs ${requestsLoading ? 'animate-spin' : ''}`} /> Refresh List
              </button>
            </div>

            <div className="p-6 bg-slate-50/40">
              {requestsLoading ? (
                <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <FaSpinner className="animate-spin text-lg text-blue-600" />
                  <span className="text-xs font-semibold">Loading saved complaints & requests...</span>
                </div>
              ) : customerRequests.length === 0 ? (
                <div className="p-6 text-center text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                  <p className="font-bold text-gray-700 text-xs">No Complaints or Requests Found</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">There are currently no saved complaints or requests returned for Customer #{customerNumber}.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-2xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-gray-600 font-extrabold uppercase text-[10px] border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4"># / Request ID</th>
                        <th className="py-3 px-4">Type / Kind</th>
                        <th className="py-3 px-4">Request Description / Details</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Saved Date / Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-medium text-gray-800 text-xs">
                      {customerRequests.map((req, idx) => (
                        <tr key={req.requestId || req.id || idx} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">
                            {req.requestId || req.id || `REQ-${idx + 1}`}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                              req.kind === 'COMPLAINT' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                              req.kind === 'SERVICE_BOOKING' ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                              'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}>
                              {req.kind || 'REQUEST'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-900 max-w-md">
                            {req.text || req.description || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                              req.status === 'RESOLVED' || req.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              req.status === 'OPEN' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}>
                              {req.status || 'OPEN'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 font-mono">
                            {req.savedTimestamp || req.createdDate || req.date || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. CONFIRMATION & REMINDER */}
      {activeToolTab === 'Confirmation' && (
        <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden flex flex-col">
          <div className="bg-slate-100/80 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
              <FaCheckCircle className="text-blue-600" /> Booking Confirmation & Service Reminder
            </h3>
          </div>

          <div className="p-6 bg-slate-50/40 flex flex-col gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div className="flex-1">
                <label className="text-[11px] font-extrabold text-gray-800 mb-1 block">WIP Number</label>
                <input 
                  type="text"
                  value={wipNumber}
                  onChange={(e) => setWipNumber(e.target.value)}
                  placeholder="Enter WIP Number..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-md font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all uppercase"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCheckConfirmation}
                  disabled={lookupLoading || !wipNumber.trim()}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  <FaCheckCircle /> Get Confirmation
                </button>

                <button
                  onClick={handleCheckReminder}
                  disabled={lookupLoading || !wipNumber.trim()}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
                >
                  <FaBell /> Get Reminder
                </button>
              </div>
            </div>

            {/* Formatted Confirmation / Reminder UI Card */}
            {lookupResult && (lookupResult.type === 'confirmation' || lookupResult.type === 'reminder') && (
              <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden text-xs">
                <div className={`px-4 py-2.5 text-white flex items-center justify-between font-bold ${lookupResult.ok ? 'bg-slate-700' : 'bg-rose-600'}`}>
                  <span className="flex items-center gap-2 text-sm">
                    {lookupResult.ok ? <FaCheckCircle /> : <FaExclamationCircle />}
                    {lookupResult.type === 'confirmation' ? 'Booking Confirmation Details' : 'Service Reminder Details'}
                  </span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono font-extrabold">
                    WIP #{wipNumber}
                  </span>
                </div>

                {lookupResult.error ? (
                  <div className="p-4 bg-rose-50 text-rose-800 font-semibold">{lookupResult.error}</div>
                ) : (
                  <div className="p-4 bg-slate-50/50 space-y-3">
                    {renderBookingFieldsGrid(lookupResult.data)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. AI SERVICE RECOMMENDATION PANEL (GET /api/v1/vehicles/{group}/{vin}/service-recommendation) */}
      {activeToolTab === 'Recommendation' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden text-xs">
          <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                <FaMagic className="text-indigo-600" /> AI Service Recommendation Inputs
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Inputs and machine learning recommendation features for vehicle maintenance
              </p>
            </div>

            <button
              onClick={handleCheckRecommendation}
              disabled={recommendationLoading || !vin.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm transition-all"
            >
              {recommendationLoading ? <FaSpinner className="animate-spin" /> : <FaMagic />}
              <span>Get AI Recommendation</span>
            </button>
          </div>

          <div className="p-5 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Group / Brand</label>
                <input
                  type="text"
                  value={keyloopGroup}
                  onChange={(e) => setKeyloopGroup(e.target.value.toUpperCase())}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 font-bold text-gray-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Vehicle VIN</label>
                <input
                  type="text"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  placeholder="Enter 17-digit VIN"
                  className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 font-mono font-bold text-gray-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Customer Number</label>
                <input
                  type="text"
                  value={customerNumber}
                  onChange={(e) => setCustomerNumber(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 font-bold text-gray-800"
                />
              </div>
            </div>

            {recommendationLoading ? (
              <div className="py-10 flex flex-col items-center justify-center text-gray-400 gap-2">
                <FaSpinner className="animate-spin text-2xl text-indigo-600" />
                <span className="text-xs font-semibold">Fetching AI recommendation inputs...</span>
              </div>
            ) : recommendationResult ? (
              recommendationResult.ok ? (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Vehicle</span>
                      <span className="font-bold text-gray-900">{recommendationResult.data.vehicle || 'N/A'}</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-extrabold text-gray-500 uppercase block">VIN</span>
                      <span className="font-mono font-bold text-indigo-700">{recommendationResult.data.vin}</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Recorded Mileage</span>
                      <span className="font-extrabold text-gray-900">
                        {recommendationResult.data.mileageKm !== undefined && recommendationResult.data.mileageKm !== null 
                          ? `${Number(recommendationResult.data.mileageKm).toLocaleString()} KM` 
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Customer #</span>
                      <span className="font-bold text-gray-900">{recommendationResult.data.customerNumber || customerNumber}</span>
                    </div>
                  </div>

                  {/* Only show Recommendation Details if the API actually returns non-empty values - no dummy data */}
                  {(Boolean(recommendationResult.data.recommendedPackage?.trim()) || 
                    Boolean(recommendationResult.data.recommendationReason?.trim()) || 
                    Boolean(recommendationResult.data.recommendationType?.trim())) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {Boolean(recommendationResult.data.recommendedPackage?.trim()) && (
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                          <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Recommended Package</span>
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                            {recommendationResult.data.recommendedPackage}
                          </span>
                        </div>
                      )}
                      {Boolean(recommendationResult.data.recommendationReason?.trim()) && (
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                          <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Recommendation Reason</span>
                          <span className="font-semibold text-gray-800">
                            {recommendationResult.data.recommendationReason}
                          </span>
                        </div>
                      )}
                      {Boolean(recommendationResult.data.recommendationType?.trim()) && (
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs space-y-1">
                          <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Recommendation Type</span>
                          <span className="font-semibold text-blue-700">
                            {recommendationResult.data.recommendationType}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-rose-50 text-rose-800 rounded-lg border border-rose-200 font-semibold">
                  {recommendationResult.error}
                </div>
              )
            ) : (
              <div className="p-6 text-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                Click <strong>"Get AI Recommendation"</strong> to fetch ML recommendation inputs for this vehicle.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
