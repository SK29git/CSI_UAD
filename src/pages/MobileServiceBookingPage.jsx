import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  findServiceCustomer,
  getServiceCustomerVehicles,
  getServiceVehicleDetails,
  getServiceLocations,
  getServiceRecommendedServices,
  getServiceAdvisors,
  getAppointmentDates,
  getAppointmentTimes,
  createServiceBooking,
} from "../utils/api";
import {
  FaCar,
  FaUser,
  FaCalendarCheck,
  FaClock,
  FaMapMarkerAlt,
  FaWrench,
  FaClipboardList,
  FaExclamationCircle,
  FaCheck,
  FaCalendarAlt,
  FaSpinner,
  FaPaperPlane,
  FaSun,
  FaCloudSun,
  FaMoon,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaCheckCircle,
  FaRedo,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";

/**
 * Mobile-First Touch-Friendly Calendar Component
 */
function MobileTouchCalendar({
  availableDates = [],
  selectedDate,
  onSelectDate,
  loading = false,
}) {
  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);

  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    const seed = selectedDate || availableDates[0] || new Date().toISOString().split("T")[0];
    const [y, m] = seed.split("-").map(Number);
    return { year: y || 2026, month: m ? m - 1 : 10 };
  });

  useEffect(() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      const [y, m] = selectedDate.split("-").map(Number);
      if (y && m) {
        setCurrentYearMonth({ year: y, month: m - 1 });
      }
    } else if (availableDates.length > 0) {
      const [y, m] = availableDates[0].split("-").map(Number);
      if (y && m) {
        setCurrentYearMonth({ year: y, month: m - 1 });
      }
    }
  }, [selectedDate, availableDates]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const handlePrevMonth = () => {
    setCurrentYearMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentYearMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const calendarDays = useMemo(() => {
    const { year, month } = currentYearMonth;
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, dateStr: null, isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(month + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      const dateStr = `${year}-${mm}-${dd}`;
      days.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
        isAvailable: availableSet.has(dateStr),
        isSelected: dateStr === selectedDate,
      });
    }
    return days;
  }, [currentYearMonth, availableSet, selectedDate]);

  return (
    <div className="flex flex-col bg-slate-50/80 p-3 rounded-xl border border-slate-200">
      {/* Month Navigation */}
      <div className="flex items-center justify-between px-1 mb-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-lg transition-colors cursor-pointer"
          title="Previous Month"
        >
          <FaChevronLeft className="text-xs" />
        </button>
        <div className="text-sm font-bold text-slate-800 tracking-wide">
          {monthNames[currentYearMonth.month]} {currentYearMonth.year}
        </div>
        <button
          type="button"
          onClick={handleNextMonth}
          className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-lg transition-colors cursor-pointer"
          title="Next Month"
        >
          <FaChevronRight className="text-xs" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((w) => (
          <span key={w} className="text-[11px] font-bold text-slate-400">
            {w}
          </span>
        ))}
      </div>

      {/* Days Grid - Large touch target min-h-[38px] */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarDays.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return <div key={`empty-${idx}`} className="h-9" />;
          }

          if (cell.isAvailable) {
            return (
              <button
                key={cell.dateStr}
                type="button"
                onClick={() => onSelectDate(cell.dateStr)}
                className={`h-9 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center relative cursor-pointer active:scale-95 ${
                  cell.isSelected
                    ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-300"
                    : "bg-white hover:bg-blue-50 text-blue-900 border border-blue-200"
                }`}
              >
                <span>{cell.day}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                    cell.isSelected ? "bg-white" : "bg-emerald-500"
                  }`}
                />
              </button>
            );
          }

          return (
            <div
              key={cell.dateStr}
              className="h-9 rounded-lg text-xs text-slate-300 flex items-center justify-center cursor-not-allowed select-none bg-slate-100/40"
            >
              {cell.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MobileServiceBookingPage() {
  const [searchParams] = useSearchParams();

  // Read URL parameters
  const paramMobile =
    searchParams.get("mobilenumber") ||
    searchParams.get("mobile") ||
    searchParams.get("phone") ||
    "";
  const paramGroup = searchParams.get("group") || "Geely";
  const paramPlate = searchParams.get("plate") || searchParams.get("plateNo") || "";

  // Core Form State
  const [phone, setPhone] = useState(paramMobile);
  const [customerSearching, setCustomerSearching] = useState(false);
  const [customerFound, setCustomerFound] = useState(null);
  const [customerId, setCustomerId] = useState("");

  const [customerVehicles, setCustomerVehicles] = useState([]);
  const [plateNo, setPlateNo] = useState(paramPlate);
  const [vehicleSearching, setVehicleSearching] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [vehicleId, setVehicleId] = useState(15);
  const [serviceMake, setServiceMake] = useState(paramGroup || "Geely");

  // Dealership Location (ID 40 is standard default)
  const [locationId, setLocationId] = useState(40);
  const [locations, setLocations] = useState([
    { id: 40, name: "AGMC Sharjah Workshop (ID 40)" },
    { id: 240, name: "AGMC Dubai Workshop (ID 240)" },
  ]);
  const [locationsLoading, setLocationsLoading] = useState(false);

  // Service Product / Package (defaults to valid UUID required by backend)
  const [selectedProductId, setSelectedProductId] = useState(
    "07143ffd-184e-43b5-a8de-f68d63199baa"
  );
  const [servicesList, setServicesList] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Appointment Dates
  const [availableDates, setAvailableDates] = useState([]);
  const [datesLoading, setDatesLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2026-11-02");

  // Time Slots
  const [timeSlots, setTimeSlots] = useState([]);
  const [timesLoading, setTimesLoading] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [activePeriodTab, setActivePeriodTab] = useState("Morning");

  // Optional Fields
  const [mileage, setMileage] = useState(5000);
  const [advisorId, setAdvisorId] = useState("");
  const [advisors, setAdvisors] = useState([]);
  const [customerNotes, setCustomerNotes] = useState("");

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // 1. Initial Load of Metadata (Locations & Services)
  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = async () => {
      setLocationsLoading(true);
      setServicesLoading(true);
      try {
        const [locRes, srvRes] = await Promise.allSettled([
          getServiceLocations("workshop"),
          getServiceRecommendedServices("workshop"),
        ]);

        if (isMounted) {
          if (locRes.status === "fulfilled" && locRes.value?.ok) {
            const rawLocs =
              locRes.value.data?.data ||
              locRes.value.data?.result ||
              locRes.value.data ||
              [];
            if (Array.isArray(rawLocs) && rawLocs.length > 0) {
              setLocations(
                rawLocs.map((l) => ({
                  id: l.dealershipLocationId || l.id || l.locationId,
                  name: l.dealershipLocationName || l.locationName || l.name || `Location ${l.id}`,
                }))
              );
            }
          }

          if (srvRes.status === "fulfilled" && srvRes.value?.ok) {
            const rawSrv =
              srvRes.value.data?.result ||
              srvRes.value.data?.data ||
              srvRes.value.data ||
              [];
            if (Array.isArray(rawSrv) && rawSrv.length > 0) {
              setServicesList(rawSrv);
              const firstId = rawSrv[0]?.serviceProductId || rawSrv[0]?.id;
              if (firstId) {
                setSelectedProductId(firstId);
              }
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch initial locations or services:", err);
      } finally {
        if (isMounted) {
          setLocationsLoading(false);
          setServicesLoading(false);
        }
      }
    };

    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Advisors for selected location
  useEffect(() => {
    if (!locationId) return;
    getServiceAdvisors(locationId)
      .then((res) => {
        if (res && res.ok && res.data) {
          const advList = res.data.result || res.data.data || res.data || [];
          if (Array.isArray(advList)) setAdvisors(advList);
        }
      })
      .catch((e) => console.warn("Advisors fetch failed:", e));
  }, [locationId]);

  // 3. Auto-Lookup Customer when paramMobile is passed in URL
  const lookupCustomer = async (mobileToSearch) => {
    if (!mobileToSearch || !mobileToSearch.trim()) return;
    setCustomerSearching(true);
    setCustomerFound(null);
    try {
      const res = await findServiceCustomer(mobileToSearch.trim());
      if (res && res.ok && res.data?.result) {
        const cust = Array.isArray(res.data.result)
          ? res.data.result[0]
          : res.data.result;
        if (cust) {
          setCustomerFound(cust);
          const cId = cust.customerId || cust.id;
          if (cId) {
            setCustomerId(cId);
            // Fetch customer's vehicles automatically
            const vRes = await getServiceCustomerVehicles(cId);
            if (vRes && vRes.ok && vRes.data?.result) {
              const vList = Array.isArray(vRes.data.result)
                ? vRes.data.result
                : [vRes.data.result];
              setCustomerVehicles(vList);
              if (vList.length > 0) {
                const firstV = vList[0].vehicle || vList[0];
                if (firstV.licensePlate) setPlateNo(firstV.licensePlate);
                if (firstV.vehicleId) setVehicleId(firstV.vehicleId);
                if (firstV.make || firstV.brand) setServiceMake(firstV.make || firstV.brand);
                // Also trigger detailed specs
                lookupVehicle(firstV.licensePlate);
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn("Auto find customer error:", err);
    } finally {
      setCustomerSearching(false);
    }
  };

  // Lookup Vehicle Details
  const lookupVehicle = async (plateToSearch) => {
    if (!plateToSearch || !plateToSearch.trim()) return;
    setVehicleSearching(true);
    try {
      const res = await getServiceVehicleDetails(plateToSearch.trim());
      if (res && res.ok && res.data?.data) {
        setVehicleData(res.data.data);
        if (res.data.data.sabVehicleId) {
          setVehicleId(res.data.data.sabVehicleId);
        }
        if (res.data.data.vehicleMakeCode) {
          setServiceMake(res.data.data.vehicleMakeCode);
        }
      }
    } catch (err) {
      console.warn("Lookup vehicle details error:", err);
    } finally {
      setVehicleSearching(false);
    }
  };

  // Run initial URL parameter lookup once on mount
  useEffect(() => {
    if (paramMobile) {
      lookupCustomer(paramMobile);
    } else if (paramPlate) {
      lookupVehicle(paramPlate);
    }
  }, []);

  // 4. Fetch available appointment dates whenever location or service product changes
  useEffect(() => {
    if (!locationId || !selectedProductId) return;
    let isMounted = true;
    const fetchDates = async () => {
      setDatesLoading(true);
      try {
        const res = await getAppointmentDates({
          dealershipLocationId: locationId,
          make: serviceMake || "Geely",
          serviceProductIds: [selectedProductId],
        });
        if (isMounted && res && res.ok && res.data) {
          const rawDates = Array.isArray(res.data.result)
            ? res.data.result
            : res.data.result?.availableDates ||
              res.data.result?.dates ||
              res.data.availableDates ||
              res.data.dates ||
              [];
          const normalized = rawDates
            .map((item) =>
              typeof item === "string" ? item : item?.date || item?.appointmentDate
            )
            .filter(Boolean);
          if (Array.isArray(normalized) && normalized.length > 0) {
            setAvailableDates(normalized);
            if (!normalized.includes(selectedDate)) {
              setSelectedDate(normalized[0]);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch available dates:", err);
      } finally {
        if (isMounted) setDatesLoading(false);
      }
    };

    fetchDates();
    return () => {
      isMounted = false;
    };
  }, [locationId, selectedProductId, serviceMake]);

  // 5. Fetch available timeslots when selectedDate changes
  useEffect(() => {
    if (!locationId || !selectedProductId || !selectedDate) return;
    let isMounted = true;
    const fetchTimes = async () => {
      setTimesLoading(true);
      try {
        const res = await getAppointmentTimes({
          selectedDate,
          dealershipLocationId: locationId,
          serviceProductIds: [selectedProductId],
        });
        if (isMounted && res && res.ok && res.data) {
          const rawSlots = res.data.result?.timeSlots || res.data.timeSlots || [];
          if (Array.isArray(rawSlots) && rawSlots.length > 0) {
            setTimeSlots(rawSlots);
            const firstSlot = rawSlots[0]?.timeSlot || "10:15-10:30";
            setSelectedTimeSlot(firstSlot);

            // Auto-select Morning/Afternoon/Evening tab based on hour
            const match = firstSlot.match(/^(\d{1,2}):/);
            const firstHour = match ? parseInt(match[1], 10) : 9;
            if (firstHour >= 16) setActivePeriodTab("Evening");
            else if (firstHour >= 12) setActivePeriodTab("Afternoon");
            else setActivePeriodTab("Morning");

            if (rawSlots[0]?.advisorId && !advisorId) {
              setAdvisorId(String(rawSlots[0].advisorId));
            }
          } else {
            setTimeSlots([]);
            setSelectedTimeSlot("");
          }
        }
      } catch (err) {
        console.warn("Failed to fetch timeslots:", err);
        setTimeSlots([]);
      } finally {
        if (isMounted) setTimesLoading(false);
      }
    };

    fetchTimes();
    return () => {
      isMounted = false;
    };
  }, [locationId, selectedProductId, selectedDate]);

  // Group slots into Morning / Afternoon / Evening
  const categorizedSlots = useMemo(() => {
    const categories = {
      Morning: [],
      Afternoon: [],
      Evening: [],
    };

    timeSlots.forEach((slot) => {
      const slotTime = typeof slot === "string" ? slot : slot?.timeSlot || "";
      const match = slotTime.match(/^(\d{1,2}):/);
      if (!match) {
        categories.Morning.push(slot);
        return;
      }
      const hour = parseInt(match[1], 10);
      if (hour < 12) categories.Morning.push(slot);
      else if (hour < 16) categories.Afternoon.push(slot);
      else categories.Evening.push(slot);
    });

    return categories;
  }, [timeSlots]);

  // Form Submit Handler
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!plateNo.trim() || !selectedDate || !selectedTimeSlot) {
      setBookingError("Please select an appointment date and time slot.");
      return;
    }

    setSubmitting(true);
    setBookingResult(null);
    setBookingError(null);

    const payload = {
      advisorId: advisorId ? String(advisorId) : "",
      customerNotes: customerNotes ? String(customerNotes) : "",
      dealershipLocationId: Number(locationId) || 40,
      dropOffTime: selectedTimeSlot,
      licensePlateNo: plateNo.trim(),
      mileage: Number(mileage) || 0,
      mileageUnit: "KM",
      serviceProductIds: [selectedProductId],
      startDate: selectedDate,
      vehicleId: Number(vehicleId) || 15,
    };

    try {
      const res = await createServiceBooking(payload);
      if (res && res.ok && res.data) {
        setBookingResult({
          success: true,
          data: res.data.result?.data || res.data.result || res.data,
          submittedPayload: payload,
        });
      } else {
        setBookingError(
          res?.statusText ||
            res?.data?.msg ||
            res?.error ||
            "Failed to create service booking"
        );
      }
    } catch (err) {
      console.error("Mobile service booking error:", err);
      setBookingError(err.message || "Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetBooking = () => {
    setBookingResult(null);
    setBookingError(null);
    setSelectedTimeSlot("");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-start items-center text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* Mobile Screen Container - constrained to standard phone width max-w-md (390px-440px) */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-lg flex flex-col relative pb-10">
        
        {/* App Top Bar */}
        <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-4 py-3.5 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center font-bold text-white shadow-xs">
              <FaCalendarCheck className="text-lg" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  AGMC Service Booking
                </span>
                <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded text-white uppercase tracking-wider">
                  {serviceMake}
                </span>
              </div>
              <p className="text-[11px] text-blue-100 font-medium">
                Official Workshop Scheduling
              </p>
            </div>
          </div>

          {bookingResult && (
            <button
              onClick={handleResetBooking}
              className="text-xs bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1"
            >
              <FaRedo className="text-[10px]" />
              <span>New</span>
            </button>
          )}
        </header>

        {/* Content Body */}
        <main className="p-3.5 sm:p-4 space-y-4 flex-1">
          
          {/* SUCCESS SCREEN */}
          {bookingResult && (
            <div className="bg-gradient-to-b from-emerald-50 to-white rounded-2xl border border-emerald-200 p-5 shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center space-y-1.5">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl mx-auto flex items-center justify-center shadow-md shadow-emerald-500/30">
                  <FaCheckCircle className="text-3xl" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Booking Confirmed!
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Your service appointment has been successfully scheduled with AGMC.
                </p>
              </div>

              {/* Digital Pass Card */}
              <div className="bg-white rounded-xl border border-emerald-100 shadow-xs p-4 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Appointment Details
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Date & Time
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {bookingResult.submittedPayload?.startDate}
                    </span>
                    <span className="block text-blue-600 font-bold text-[11px]">
                      {bookingResult.submittedPayload?.dropOffTime}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Vehicle Plate
                    </span>
                    <span className="font-extrabold text-slate-900 font-mono">
                      {bookingResult.submittedPayload?.licensePlateNo}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      ID: #{bookingResult.submittedPayload?.vehicleId}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Location
                    </span>
                    <span className="font-bold text-slate-800">
                      Workshop ID #{bookingResult.submittedPayload?.dealershipLocationId}
                    </span>
                  </div>

                  {bookingResult.submittedPayload?.advisorId && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Service Advisor
                      </span>
                      <span className="font-bold text-slate-800">
                        {bookingResult.submittedPayload.advisorId}
                      </span>
                    </div>
                  )}
                </div>

                {customerFound?.name && (
                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Customer
                    </span>
                    <span className="font-bold text-slate-800">
                      {customerFound.name} ({phone})
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleResetBooking}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaRedo className="text-xs" />
                <span>Book Another Service</span>
              </button>
            </div>
          )}

          {/* ERROR ALERT BANNER */}
          {bookingError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-900 shadow-xs">
              <FaExclamationCircle className="text-rose-600 text-sm mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="font-bold block">Booking Notice</span>
                <span className="text-[11px] text-rose-700">{bookingError}</span>
              </div>
              <button
                type="button"
                onClick={() => setBookingError(null)}
                className="text-rose-400 hover:text-rose-700 p-0.5 font-bold"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {/* MAIN BOOKING FORM */}
          {!bookingResult && (
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              
              {/* SECTION 1: Customer & Vehicle Information */}
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <FaUser className="text-blue-600 text-xs" />
                    <span>Customer & Vehicle</span>
                  </span>
                  {customerFound && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <FaCheck className="text-[8px]" /> Verified
                    </span>
                  )}
                </div>

                {/* Mobile Phone Number Input (Auto-prefilled from query parameter or editable) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex justify-between">
                    <span>Mobile Phone Number *</span>
                    {customerSearching && (
                      <span className="text-blue-600 font-normal flex items-center gap-1">
                        <FaSpinner className="animate-spin text-[10px]" /> Checking...
                      </span>
                    )}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0543408597"
                      required
                      className="w-full h-10 px-3 pr-20 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl font-bold text-slate-900 text-base focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                    />
                    <button
                      type="button"
                      onClick={() => lookupCustomer(phone)}
                      disabled={customerSearching || !phone.trim()}
                      className="absolute right-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <FaSearch className="text-[9px]" />
                      <span>Verify</span>
                    </button>
                  </div>
                  {customerFound && (
                    <p className="text-[11px] text-emerald-800 font-semibold px-1 pt-0.5">
                      {customerFound.name || "Customer Found"} {customerFound.reference ? `• Ref: ${customerFound.reference}` : ""}
                    </p>
                  )}
                </div>

                {/* Multiple Vehicles Selector (if customer has more than 1 vehicle registered) */}
                {customerVehicles.length > 1 && (
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Select Customer Vehicle
                    </label>
                    <select
                      value={plateNo}
                      onChange={(e) => {
                        const selectedPlate = e.target.value;
                        setPlateNo(selectedPlate);
                        const matchV = customerVehicles.find(
                          (v) => (v.vehicle?.licensePlate || v.licensePlate) === selectedPlate
                        );
                        if (matchV) {
                          const vObj = matchV.vehicle || matchV;
                          if (vObj.vehicleId) setVehicleId(vObj.vehicleId);
                          lookupVehicle(selectedPlate);
                        }
                      }}
                      className="w-full h-10 px-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl font-bold text-slate-900 text-sm focus:outline-none"
                    >
                      {customerVehicles.map((item, idx) => {
                        const v = item.vehicle || item;
                        return (
                          <option key={idx} value={v.licensePlate}>
                            Plate: {v.licensePlate} ({v.make || "Geely"} {v.model || ""})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Vehicle License Plate Input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex justify-between">
                    <span>Vehicle Plate Number *</span>
                    {vehicleSearching && (
                      <span className="text-blue-600 font-normal flex items-center gap-1">
                        <FaSpinner className="animate-spin text-[10px]" /> Searching...
                      </span>
                    )}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={plateNo}
                      onChange={(e) => setPlateNo(e.target.value)}
                      placeholder="e.g. 240153"
                      required
                      className="w-full h-10 px-3 pr-20 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl font-mono font-bold text-slate-900 text-base focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-normal uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => lookupVehicle(plateNo)}
                      disabled={vehicleSearching || !plateNo.trim()}
                      className="absolute right-1.5 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-800 active:scale-95 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <FaSearch className="text-[9px]" />
                      <span>Lookup</span>
                    </button>
                  </div>

                  {/* Vehicle Details Card */}
                  {vehicleData && (
                    <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1 text-xs mt-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-blue-900">
                          {vehicleData.vehicleMakeCode} {vehicleData.vehicleModal} ({vehicleData.modalYear})
                        </span>
                        <span className="text-[10px] font-bold bg-blue-200/70 text-blue-900 px-1.5 py-0.5 rounded">
                          ID: #{vehicleId}
                        </span>
                      </div>
                      <p className="text-[10px] text-blue-700 font-mono truncate">
                        VIN: {vehicleData.chassisNumber || "N/A"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: Dealership Location & Service Package */}
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-blue-600 text-xs" />
                    <span>Workshop & Service Package</span>
                  </span>
                </div>

                {/* Dealership Location */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    Dealership Workshop Location *
                  </label>
                  <select
                    value={locationId}
                    onChange={(e) => setLocationId(Number(e.target.value))}
                    disabled={locationsLoading}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl font-bold text-slate-900 text-sm focus:outline-none transition-all cursor-pointer"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service Package (Pre-selected by default or selectable) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex justify-between">
                    <span>Service Package (Pre-selected)</span>
                    <span className="text-[10px] text-emerald-600 font-bold">Recommended</span>
                  </label>
                  {servicesList.length > 0 ? (
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      disabled={servicesLoading}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl font-bold text-slate-900 text-xs focus:outline-none cursor-pointer"
                    >
                      {servicesList.map((srv, idx) => {
                        const pId = srv.serviceProductId || srv.id || `srv-${idx}`;
                        const pName = srv.serviceProductName || srv.name || srv.description || "Periodic Maintenance";
                        return (
                          <option key={pId} value={pId}>
                            {pName}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        Periodic Maintenance Service (Standard)
                      </span>
                      <FaCheck className="text-emerald-600 text-xs" />
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: Appointment Date Selection */}
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <FaCalendarAlt className="text-blue-600 text-xs" />
                    <span>Select Appointment Date *</span>
                  </span>
                  {datesLoading ? (
                    <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                      <FaSpinner className="animate-spin text-[10px]" /> Loading...
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {availableDates.length} Dates Available
                    </span>
                  )}
                </div>

                {/* Interactive Touch Calendar */}
                <MobileTouchCalendar
                  availableDates={availableDates}
                  selectedDate={selectedDate}
                  onSelectDate={(dt) => setSelectedDate(dt)}
                  loading={datesLoading}
                />
                <div className="text-[11px] font-bold text-slate-600 text-center pt-0.5">
                  Selected Date: <span className="text-blue-700 font-extrabold">{selectedDate}</span>
                </div>
              </div>

              {/* SECTION 4: Available Time Slots */}
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <FaClock className="text-blue-600 text-xs" />
                    <span>Select Drop-off Time *</span>
                  </span>
                  {timesLoading && (
                    <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                      <FaSpinner className="animate-spin text-[10px]" /> Loading slots...
                    </span>
                  )}
                </div>

                {/* Period Tabs: Morning / Afternoon / Evening */}
                <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: "Morning", label: "Morning", icon: FaSun },
                    { id: "Afternoon", label: "Afternoon", icon: FaCloudSun },
                    { id: "Evening", label: "Evening", icon: FaMoon },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const count = categorizedSlots[tab.id]?.length || 0;
                    const isActive = activePeriodTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActivePeriodTab(tab.id)}
                        className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                          isActive
                            ? "bg-white text-blue-700 shadow-xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <Icon className="text-[11px]" />
                          <span>{tab.label}</span>
                        </div>
                        <span className={`text-[10px] font-normal ${isActive ? "text-blue-600" : "text-slate-400"}`}>
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Slot Chips Grid - touch target min-h-[44px] */}
                {timesLoading ? (
                  <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                    <FaSpinner className="animate-spin text-lg text-blue-600" />
                    <span>Fetching available slots for {selectedDate}...</span>
                  </div>
                ) : categorizedSlots[activePeriodTab]?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {categorizedSlots[activePeriodTab].map((slot, sIdx) => {
                      const slotStr = typeof slot === "string" ? slot : slot?.timeSlot || "";
                      const isSelected = selectedTimeSlot === slotStr;
                      return (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => {
                            setSelectedTimeSlot(slotStr);
                            if (slot.advisorId) {
                              setAdvisorId(String(slot.advisorId));
                            }
                          }}
                          className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer active:scale-95 ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-300"
                              : "bg-slate-50 hover:bg-blue-50 text-slate-800 border-slate-200"
                          }`}
                        >
                          <span className="font-mono">{slotStr}</span>
                          {isSelected && <FaCheck className="text-xs" />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    No {activePeriodTab.toLowerCase()} slots available for this date.
                  </div>
                )}
              </div>

              {/* SECTION 5: Additional Optional Details (Current Mileage, Advisor, Notes) */}
              <details className="group bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
                <summary className="text-xs font-extrabold text-slate-700 flex items-center justify-between cursor-pointer select-none">
                  <span className="flex items-center gap-1.5">
                    <FaWrench className="text-slate-400 text-xs" />
                    <span>Additional Details (Optional)</span>
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>

                <div className="space-y-3 pt-3 mt-2 border-t border-slate-100">
                  {/* Mileage (Optional) */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 flex justify-between">
                      <span>Current Mileage (KM)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={mileage}
                      onChange={(e) => setMileage(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl font-bold text-slate-900 text-base focus:outline-none"
                    />
                  </div>

                  {/* Service Advisor (Optional) */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 flex justify-between">
                      <span>Service Advisor</span>
                      <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                    </label>
                    {advisors.length > 0 ? (
                      <select
                        value={advisorId}
                        onChange={(e) => setAdvisorId(e.target.value)}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl font-bold text-slate-900 text-xs focus:outline-none"
                      >
                        <option value="">Any Available Advisor (Auto-assign)</option>
                        {advisors.map((adv, aIdx) => (
                          <option key={aIdx} value={adv.id || adv.advisorId}>
                            {adv.name || adv.advisorName || `Advisor #${adv.id}`}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={advisorId}
                        onChange={(e) => setAdvisorId(e.target.value)}
                        placeholder="e.g. 4031 (or leave blank)"
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl font-semibold text-slate-900 text-base focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Customer Notes (Optional) */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 flex justify-between">
                      <span>Customer Notes</span>
                      <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                    </label>
                    <textarea
                      rows="2"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="Any specific requests or observations..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl font-medium text-slate-900 text-xs focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </details>

              {/* SUBMIT BUTTON - Large touch-friendly target */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !plateNo.trim() ||
                    !selectedDate ||
                    !selectedTimeSlot
                  }
                  className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin text-base" />
                      <span>Confirming Service Booking...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="text-sm" />
                      <span>Confirm & Book Service</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </main>

        {/* Minimal Footer */}
        <footer className="px-4 py-3 text-center text-[10px] text-slate-400 border-t border-slate-100 bg-slate-50/50">
          Powered by AGMC Direct Workshop Management System
        </footer>

      </div>
    </div>
  );
}
