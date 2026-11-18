import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  findServiceCustomer,
  getServiceCustomerVehicles,
  getServiceVehicleDetails,
  getAppointmentDates,
  getAppointmentTimes,
  getServiceAdvisors,
  createServiceBooking,
} from "../utils/api";
import {
  FaUser,
  FaCalendarCheck,
  FaClock,
  FaMapMarkerAlt,
  FaWrench,
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
  FaCheckCircle,
  FaTimes,
  FaWhatsapp,
  FaCarSide,
  FaShieldAlt,
} from "react-icons/fa";

/**
 * Touch Calendar Component using Exact Color System:
 * Primary/Selected: #87BFFF, Soft Blue: #E3F1FF, Card: #FFFFFF, Border: #D6E8FA, Text: #2B3655, Success: #42B978
 */
function MobileTouchCalendar({
  availableDates = [],
  selectedDate,
  onSelectDate,
  loading = false,
}) {
  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);

  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    const seed =
      selectedDate ||
      availableDates[0] ||
      new Date().toISOString().split("T")[0];
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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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
    <div className="flex flex-col bg-[#FFFFFF] p-3.5 sm:p-4 rounded-2xl border border-[#D6E8FA] shadow-[inset_0_1px_3px_rgba(255,255,255,0.9),0_6px_16px_rgba(23,43,77,0.03)]">
      {/* Month Navigation */}
      <div className="flex items-center justify-between px-1 mb-2.5">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="w-9 h-9 flex items-center justify-center bg-[#F0F7FF] hover:bg-[#E3F1FF] active:scale-95 text-[#2B3655] rounded-xl transition-all border border-[#D6E8FA] shadow-xs cursor-pointer"
          title="Previous Month"
        >
          <FaChevronLeft className="text-xs" />
        </button>
        <div className="text-sm font-black text-[#2B3655] tracking-wide">
          {monthNames[currentYearMonth.month]} {currentYearMonth.year}
        </div>
        <button
          type="button"
          onClick={handleNextMonth}
          className="w-9 h-9 flex items-center justify-center bg-[#F0F7FF] hover:bg-[#E3F1FF] active:scale-95 text-[#2B3655] rounded-xl transition-all border border-[#D6E8FA] shadow-xs cursor-pointer"
          title="Next Month"
        >
          <FaChevronRight className="text-xs" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center mb-1.5">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((w) => (
          <span key={w} className="text-[11px] font-bold text-[#2B3655]/50">
            {w}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
        {calendarDays.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return <div key={`empty-${idx}`} className="h-10 sm:h-11" />;
          }

          if (cell.isAvailable) {
            return (
              <button
                key={cell.dateStr}
                type="button"
                onClick={() => onSelectDate(cell.dateStr)}
                className={`h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-black transition-all flex flex-col items-center justify-center relative cursor-pointer active:scale-92 ${
                  cell.isSelected
                    ? "bg-[#87BFFF] text-[#2B3655] border border-[#87BFFF] shadow-[0_6px_14px_rgba(135,191,255,0.5),inset_0_2px_3px_rgba(255,255,255,0.6)] ring-2 ring-[#87BFFF]/50"
                    : "bg-[#FFFFFF] hover:bg-[#E3F1FF] text-[#2B3655] border border-[#D6E8FA] shadow-[0_2px_5px_rgba(23,43,77,0.03),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:scale-102"
                }`}
              >
                <span>{cell.day}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                    cell.isSelected ? "bg-[#2B3655]" : "bg-[#42B978] shadow-2xs"
                  }`}
                />
              </button>
            );
          }

          return (
            <div
              key={cell.dateStr}
              className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm text-[#2B3655]/30 flex items-center justify-center cursor-not-allowed select-none bg-[#F0F7FF]/50"
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
  const paramMobile = (
    searchParams.get("mobilenumber") ||
    searchParams.get("mobile") ||
    searchParams.get("phone") ||
    ""
  )
    .replace(/\D/g, "")
    .slice(0, 15);
  const paramGroup = searchParams.get("group") || "Geely";
  const paramPlate =
    searchParams.get("plate") || searchParams.get("plateNo") || "";

  // Core Form State
  const [phone, setPhone] = useState(paramMobile);
  const [customerSearching, setCustomerSearching] = useState(false);
  const [customerFound, setCustomerFound] = useState(null);
  const [customerId, setCustomerId] = useState("");

  const [customerVehicles, setCustomerVehicles] = useState([]);
  const [plateNo, setPlateNo] = useState(paramPlate);
  const [vehicleSearching, setVehicleSearching] = useState(false);
  const [vehicleData, setVehicleData] = useState(null);
  const [vehicleId, setVehicleId] = useState(null);
  const [serviceMake, setServiceMake] = useState(paramGroup || "Geely");

  // Dealership Location ID (Main application: 40 & 240)
  const [locationId, setLocationId] = useState(40);

  // Standard Recommended Product ID (Periodic Maintenance)
  const [selectedProductId] = useState("07143ffd-184e-43b5-a8de-f68d63199baa");

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Auto-fetch Customer & Vehicle details based on phone
  const autoFetchCustomerAndVehicles = async (mobileNumber) => {
    if (!mobileNumber || !mobileNumber.trim()) return;
    setCustomerSearching(true);
    try {
      const res = await findServiceCustomer(mobileNumber.trim());
      if (res && res.ok && res.data?.result) {
        const cust = Array.isArray(res.data.result)
          ? res.data.result[0]
          : res.data.result;
        if (cust) {
          setCustomerFound(cust);
          const cId = cust.customerId || cust.id;
          if (cId) {
            setCustomerId(cId);
            setVehicleSearching(true);
            const vRes = await getServiceCustomerVehicles(cId);
            if (vRes && vRes.ok && vRes.data?.result) {
              const vList = Array.isArray(vRes.data.result)
                ? vRes.data.result
                : [vRes.data.result];
              setCustomerVehicles(vList);
              if (vList.length > 0) {
                const firstV = vList[0].vehicle || vList[0];
                const initialPlate = firstV.licensePlate || "";
                if (initialPlate) setPlateNo(initialPlate);
                if (firstV.vehicleId) setVehicleId(firstV.vehicleId);
                if (firstV.make || firstV.brand)
                  setServiceMake(firstV.make || firstV.brand);

                if (initialPlate) {
                  autoFetchVehicleSpecs(initialPlate);
                }
              } else {
                setCustomerVehicles([]);
                setPlateNo("");
                setVehicleData(null);
                setVehicleId(null);
              }
            } else {
              setCustomerVehicles([]);
              setPlateNo("");
              setVehicleData(null);
              setVehicleId(null);
            }
            setVehicleSearching(false);
          }
        } else {
          setCustomerFound(null);
          setCustomerId("");
          setCustomerVehicles([]);
          setPlateNo("");
          setVehicleData(null);
          setVehicleId(null);
        }
      } else {
        setCustomerFound(null);
        setCustomerId("");
        setCustomerVehicles([]);
        setPlateNo("");
        setVehicleData(null);
        setVehicleId(null);
      }
    } catch (err) {
      console.warn("Auto-fetch customer & vehicle details error:", err);
      setCustomerFound(null);
      setCustomerVehicles([]);
      setVehicleData(null);
    } finally {
      setCustomerSearching(false);
    }
  };

  // Auto-fetch Vehicle Specs from API - No hardcoded fallback
  const autoFetchVehicleSpecs = async (plate) => {
    const cleanPlate = (plate || "").trim();
    if (!cleanPlate) {
      setVehicleData(null);
      return;
    }
    setVehicleSearching(true);
    try {
      const res = await getServiceVehicleDetails(cleanPlate);
      const v = res?.data?.data || res?.data?.result;
      if (res && res.ok && v && (v.vehicleMakeCode || v.vehicleModal || v.make || v.model)) {
        setVehicleData(v);
        if (v.sabVehicleId || v.vehicleId) {
          setVehicleId(v.sabVehicleId || v.vehicleId);
        }
        if (v.vehicleMakeCode || v.make) {
          setServiceMake(v.vehicleMakeCode || v.make);
        }
      } else {
        // Not found in API - DO NOT show card or hardcode
        setVehicleData(null);
      }
    } catch (err) {
      console.warn("Auto-fetch vehicle specs error:", err);
      setVehicleData(null);
    } finally {
      setVehicleSearching(false);
    }
  };

  // Debounce vehicle plate lookup - clear card immediately if plate changes or is invalid
  const lastFetchedPlateRef = useRef("");

  useEffect(() => {
    const cleanPlate = plateNo.trim();
    if (!cleanPlate) {
      setVehicleData(null);
      lastFetchedPlateRef.current = "";
      return;
    }

    if (cleanPlate === lastFetchedPlateRef.current) return;

    // Immediately clear stale vehicle card while typing a new plate
    setVehicleData(null);

    if (cleanPlate.length >= 3) {
      const timer = setTimeout(() => {
        lastFetchedPlateRef.current = cleanPlate;
        autoFetchVehicleSpecs(cleanPlate);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [plateNo]);

  // Auto-fetch Customer & Vehicle details when phone changes, and clear old details immediately
  const isFirstMount = useRef(true);
  const lastFetchedPhoneRef = useRef("");

  useEffect(() => {
    const cleanDigits = phone.replace(/\D/g, "").slice(0, 15);

    // Initial mount from URL query param
    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (cleanDigits.length >= 8) {
        lastFetchedPhoneRef.current = cleanDigits;
        autoFetchCustomerAndVehicles(cleanDigits);
      } else if (paramPlate) {
        autoFetchVehicleSpecs(paramPlate);
      }
      return;
    }

    // When phone changes to a different number, clear old fetched details immediately
    if (cleanDigits !== lastFetchedPhoneRef.current) {
      setCustomerFound(null);
      setCustomerId("");
      setCustomerVehicles([]);
      setPlateNo("");
      setVehicleData(null);
      setVehicleId(null);
    }

    // Auto-fetch details for the newly entered number once it reaches at least 8 digits
    if (
      cleanDigits.length >= 8 &&
      cleanDigits !== lastFetchedPhoneRef.current
    ) {
      const timer = setTimeout(() => {
        lastFetchedPhoneRef.current = cleanDigits;
        autoFetchCustomerAndVehicles(cleanDigits);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phone]);

  // Fetch Advisors when locationId changes
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

  // Fetch Available Appointment Dates
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
              typeof item === "string"
                ? item
                : item?.date || item?.appointmentDate,
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

  // Fetch Available Time Slots
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
          const rawSlots =
            res.data.result?.timeSlots || res.data.timeSlots || [];
          if (Array.isArray(rawSlots) && rawSlots.length > 0) {
            setTimeSlots(rawSlots);
            const firstSlot = rawSlots[0]?.timeSlot || "10:15-10:30";
            setSelectedTimeSlot(firstSlot);

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

  // Submit Booking Handler
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!plateNo.trim() || !selectedDate || !selectedTimeSlot) {
      setBookingError(
        "Please select an appointment date and drop-off time slot.",
      );
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
      vehicleId: vehicleId ? Number(vehicleId) : 0,
    };

    try {
      const res = await createServiceBooking(payload);
      if (res && res.ok && res.data) {
        const resultInfo = {
          success: true,
          data: res.data.result?.data || res.data.result || res.data,
          submittedPayload: payload,
        };
        setBookingResult(resultInfo);
        setShowSuccessModal(true);
      } else {
        setBookingError(
          res?.statusText ||
            res?.data?.msg ||
            res?.error ||
            "Failed to create service booking",
        );
      }
    } catch (err) {
      console.error("Mobile service booking error:", err);
      setBookingError(err.message || "Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
  };

  // Return to WhatsApp handler
  const handleReturnToWhatsApp = () => {
    const redirectUrl =
      searchParams.get("return_url") || searchParams.get("redirect");
    if (redirectUrl) {
      window.location.href = redirectUrl;
      return;
    }

    try {
      window.location.href = "whatsapp://";
      setTimeout(() => {
        if (window.opener) {
          window.close();
        }
      }, 1200);
    } catch (e) {
      window.location.href = "https://wa.me/";
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col justify-start items-center text-[#2B3655] font-sans selection:bg-[#87BFFF] selection:text-[#2B3655] w-full relative overflow-x-hidden">
      {/* Decorative Ambient Color Mesh using #87BFFF, #E3F1FF, #D6E8FA */}
      <div className="pointer-events-none fixed -top-24 -left-20 w-80 h-80 rounded-full bg-[#87BFFF]/20 blur-3xl" />
      <div className="pointer-events-none fixed top-1/3 -right-24 w-88 h-88 rounded-full bg-[#E3F1FF]/60 blur-3xl" />
      <div className="pointer-events-none fixed bottom-10 left-10 w-80 h-80 rounded-full bg-[#D6E8FA]/50 blur-3xl" />

      {/* Main Container - Full-width on mobile, max-w-2xl on tablets */}
      <div className="w-full max-w-2xl min-h-screen flex flex-col relative pb-14 sm:my-3 sm:rounded-3xl bg-[#FFFFFF] shadow-[0_20px_50px_rgba(23,43,77,0.06)] sm:border sm:border-[#87BFFF]/45">
        {/* Header Bar using Primary #87BFFF and Text #2B3655 */}
        <header className="sticky top-0 z-40 bg-gradient-to-r from-[#87BFFF] via-[#9ecaff] to-[#87BFFF] text-[#2B3655] px-4 sm:px-6 py-4 shadow-[0_4px_20px_rgba(135,191,255,0.25)] flex items-center justify-between sm:rounded-t-3xl border-b border-[#D6E8FA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/40 border border-white/60 flex items-center justify-center font-bold text-[#2B3655] shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_4px_10px_rgba(23,43,77,0.08)]">
              <FaCalendarCheck className="text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-base tracking-tight text-[#2B3655]">
                  AGMC Service Booking
                </span>
                <span className="text-[10px] font-extrabold bg-white/45 px-2 py-0.5 rounded-full text-[#2B3655] uppercase tracking-wider border border-white/60 shadow-2xs">
                  {serviceMake}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 relative z-10">
          {/* Error Notice Banner */}
          {bookingError && (
            <div className="p-4 bg-rose-50/90 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900 shadow-xs">
              <FaExclamationCircle className="text-rose-600 text-base mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="font-extrabold block text-sm">
                  Booking Notice
                </span>
                <span className="text-[11px] text-rose-700">
                  {bookingError}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setBookingError(null)}
                className="text-rose-400 hover:text-rose-700 p-1 font-bold active:scale-90 transition-transform"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmitBooking}
            className="space-y-4 sm:space-y-5"
          >
            {/* SECTION 1: Customer & Vehicle Information (Border: #87BFFF, Lighter Shade Inside Card) */}
            <div className="bg-gradient-to-b from-[#F8FBFF] via-[#F2F8FF] to-[#EAF4FF] rounded-3xl border border-[#87BFFF]/75 p-4 sm:p-5 shadow-[0_10px_28px_rgba(135,191,255,0.16),inset_0_1px_3px_rgba(255,255,255,0.9)] space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#D6E8FA]/70 pb-2.5">
                <span className="text-xs font-black text-[#2B3655] flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#E3F1FF] text-[#2B3655] flex items-center justify-center text-xs shadow-2xs">
                    <FaUser />
                  </div>
                  <span>Customer & Vehicle</span>
                </span>
                {customerFound?.name?.trim() ? (
                  <span className="text-[11px] font-bold text-[#2B3655] truncate max-w-[200px] bg-[#E3F1FF] px-2.5 py-0.5 rounded-full border border-[#D6E8FA]">
                    {customerFound.name.trim()}
                  </span>
                ) : null}
              </div>

              {/* Mobile Phone Number (15-digit numeric restriction, Text: #2B3655, Focus: #87BFFF) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#2B3655] flex justify-between">
                  <span>Mobile Phone Number *</span>
                  {customerSearching && (
                    <span className="text-[#2B3655]/70 font-semibold flex items-center gap-1 text-[10px]">
                      <FaSpinner className="animate-spin text-[10px]" />{" "}
                      Fetching details...
                    </span>
                  )}
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={15}
                  value={phone}
                  onChange={(e) => {
                    const numericOnly = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 15);
                    setPhone(numericOnly);
                  }}
                  placeholder="e.g. 0543408597"
                  required
                  className="w-full h-11 px-3.5 bg-[#FFFFFF] border border-[#D6E8FA] focus:border-[#87BFFF] focus:bg-white rounded-2xl font-bold text-[#2B3655] text-base focus:outline-none transition-all shadow-[inset_0_2px_4px_rgba(23,43,77,0.02)] focus:ring-4 focus:ring-[#87BFFF]/25 placeholder:text-[#2B3655]/40 placeholder:font-normal"
                />
              </div>

              {/* Multi-Vehicle Picker if customer has more than 1 vehicle */}
              {customerVehicles.length > 1 && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-[#2B3655]">
                    Select Customer Vehicle
                  </label>
                  <select
                    value={plateNo}
                    onChange={(e) => {
                      const selectedPlate = e.target.value;
                      setPlateNo(selectedPlate);
                      const matchV = customerVehicles.find(
                        (v) =>
                          (v.vehicle?.licensePlate || v.licensePlate) ===
                          selectedPlate,
                      );
                      if (matchV) {
                        const vObj = matchV.vehicle || matchV;
                        if (vObj.vehicleId) setVehicleId(vObj.vehicleId);
                        autoFetchVehicleSpecs(selectedPlate);
                      }
                    }}
                    className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#D6E8FA] focus:border-[#87BFFF] focus:bg-white rounded-2xl font-bold text-[#2B3655] text-sm focus:outline-none shadow-xs cursor-pointer"
                  >
                    {customerVehicles.map((item, idx) => {
                      const v = item.vehicle || item;
                      return (
                        <option key={idx} value={v.licensePlate}>
                          Plate: {v.licensePlate} ({v.make || "Geely"}{" "}
                          {v.model || ""})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Vehicle License Plate */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#2B3655] flex justify-between">
                  <span>Vehicle Plate Number *</span>
                  {vehicleSearching && (
                    <span className="text-[#2B3655]/70 font-semibold flex items-center gap-1 text-[10px]">
                      <FaSpinner className="animate-spin text-[10px]" /> Loading
                      vehicle...
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={plateNo}
                  onChange={(e) => {
                    const newPlate = e.target.value;
                    setPlateNo(newPlate);
                    // Clear car card immediately when user modifies plate
                    setVehicleData(null);
                  }}
                  placeholder="e.g. 26570-20-AD"
                  required
                  className="w-full h-11 px-3.5 bg-[#FFFFFF] border border-[#D6E8FA] focus:border-[#87BFFF] focus:bg-white rounded-2xl font-mono font-bold text-[#2B3655] text-base focus:outline-none transition-all shadow-[inset_0_2px_4px_rgba(23,43,77,0.02)] focus:ring-4 focus:ring-[#87BFFF]/25 placeholder:text-[#2B3655]/40 placeholder:font-normal uppercase"
                />

                {/* Vehicle Passport Card (Soft Blue #E3F1FF, Border #D6E8FA, Text #2B3655, Success #42B978) */}
                {vehicleData && (
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#E3F1FF] via-[#F0F7FF] to-[#E3F1FF] border border-[#D6E8FA] p-4 text-[#2B3655] shadow-[0_8px_20px_rgba(135,191,255,0.18),inset_0_1px_2px_rgba(255,255,255,0.9)] mt-2">
                    <div className="flex items-center gap-3.5 relative z-10">
                      {/* 3D Vehicle Avatar Badge with #87BFFF */}
                      <div className="w-13 h-13 rounded-2xl bg-[#87BFFF] border border-white/80 flex items-center justify-center text-[#2B3655] shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_6px_14px_rgba(135,191,255,0.35)] shrink-0">
                        <FaCarSide className="text-2xl text-[#2B3655] drop-shadow-xs" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#42B978] flex items-center gap-1">
                            <FaShieldAlt className="text-[10px]" />{" "}
                            {vehicleData.vehicleMakeCode || serviceMake}{" "}
                            Verified
                          </span>
                          <span className="text-[10px] font-black bg-[#FFFFFF] px-2 py-0.5 rounded-full border border-[#D6E8FA] text-[#2B3655] font-mono shadow-2xs">
                            ID #{vehicleId}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-[#2B3655] tracking-tight truncate">
                          {vehicleData.vehicleMakeCode}{" "}
                          {vehicleData.vehicleModal}
                        </h4>
                        <p className="text-[11px] text-[#2B3655]/75 font-semibold">
                          Model Year:{" "}
                          <span className="font-black text-[#2B3655]">
                            {vehicleData.modalYear || "Latest"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Chassis / VIN Row */}
                    {vehicleData.chassisNumber && (
                      <div className="mt-3 pt-2.5 border-t border-[#D6E8FA] flex items-center justify-between text-[11px] relative z-10">
                        <span className="text-[#2B3655]/70 text-[10px] font-bold uppercase tracking-wider">
                          Chassis / VIN
                        </span>
                        <span className="font-mono text-[#2B3655] font-black tracking-wider text-[11px] bg-[#FFFFFF] px-2.5 py-0.5 rounded-md border border-[#D6E8FA] shadow-2xs">
                          {vehicleData.chassisNumber}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 2: Dealership ID (Border: #87BFFF, Lighter Shade Inside Card) */}
            <div className="bg-gradient-to-b from-[#F8FBFF] via-[#F2F8FF] to-[#EAF4FF] rounded-3xl border border-[#87BFFF]/75 p-4 sm:p-5 shadow-[0_10px_28px_rgba(135,191,255,0.16),inset_0_1px_3px_rgba(255,255,255,0.9)] space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#D6E8FA]/70 pb-2.5">
                <span className="text-xs font-black text-[#2B3655] flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#E3F1FF] text-[#2B3655] flex items-center justify-center text-xs shadow-2xs">
                    <FaMapMarkerAlt />
                  </div>
                  <span>Dealership Location</span>
                </span>
                <span className="text-[10px] font-black text-[#2B3655] bg-[#E3F1FF] px-2.5 py-0.5 rounded-full border border-[#D6E8FA]">
                  Selected: #{locationId}
                </span>
              </div>

              {/* 3D Tactile Buttons using Selected state: #87BFFF */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#2B3655]">
                  Dealership Location ID *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLocationId(40)}
                    className={`h-12 px-3 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                      locationId === 40
                        ? "bg-[#87BFFF] text-[#2B3655] border border-[#87BFFF] shadow-[0_8px_18px_rgba(135,191,255,0.45),inset_0_2px_3px_rgba(255,255,255,0.5)] ring-2 ring-[#87BFFF]/50"
                        : "bg-[#FFFFFF] hover:bg-[#E3F1FF]/60 text-[#2B3655] border border-[#D6E8FA] shadow-xs"
                    }`}
                  >
                    <span>ID 40</span>
                    {locationId === 40 && (
                      <FaCheck className="text-xs text-[#2B3655]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocationId(240)}
                    className={`h-12 px-3 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                      locationId === 240
                        ? "bg-[#87BFFF] text-[#2B3655] border border-[#87BFFF] shadow-[0_8px_18px_rgba(135,191,255,0.45),inset_0_2px_3px_rgba(255,255,255,0.5)] ring-2 ring-[#87BFFF]/50"
                        : "bg-[#FFFFFF] hover:bg-[#E3F1FF]/60 text-[#2B3655] border border-[#D6E8FA] shadow-xs"
                    }`}
                  >
                    <span>ID 240</span>
                    {locationId === 240 && (
                      <FaCheck className="text-xs text-[#2B3655]" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 3: Appointment Date Selection (Border: #87BFFF, Lighter Shade Inside Card) */}
            <div className="bg-gradient-to-b from-[#F8FBFF] via-[#F2F8FF] to-[#EAF4FF] rounded-3xl border border-[#87BFFF]/75 p-4 sm:p-5 shadow-[0_10px_28px_rgba(135,191,255,0.16),inset_0_1px_3px_rgba(255,255,255,0.9)] space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#2B3655] flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#E3F1FF] text-[#2B3655] flex items-center justify-center text-xs shadow-2xs">
                    <FaCalendarAlt />
                  </div>
                  <span>Appointment Date *</span>
                </span>
                {datesLoading ? (
                  <span className="text-[10px] text-[#2B3655]/70 font-bold flex items-center gap-1">
                    <FaSpinner className="animate-spin text-[10px]" />{" "}
                    Loading...
                  </span>
                ) : (
                  <span className="text-[10px] font-black text-[#2B3655] bg-[#E3F1FF] px-2.5 py-0.5 rounded-full border border-[#D6E8FA]">
                    {availableDates.length} Dates Available
                  </span>
                )}
              </div>

              {/* Interactive Calendar */}
              <MobileTouchCalendar
                availableDates={availableDates}
                selectedDate={selectedDate}
                onSelectDate={(dt) => setSelectedDate(dt)}
                loading={datesLoading}
              />
              <div className="text-[11px] font-bold text-[#2B3655]/80 text-center pt-0.5">
                Selected Date:{" "}
                <span className="text-[#2B3655] font-black bg-[#E3F1FF] px-2 py-0.5 rounded-md border border-[#D6E8FA]">
                  {selectedDate}
                </span>
              </div>
            </div>

            {/* SECTION 4: Available Time Slots (Border: #87BFFF, Lighter Shade Inside Card) */}
            <div className="bg-gradient-to-b from-[#F8FBFF] via-[#F2F8FF] to-[#EAF4FF] rounded-3xl border border-[#87BFFF]/75 p-4 sm:p-5 shadow-[0_10px_28px_rgba(135,191,255,0.16),inset_0_1px_3px_rgba(255,255,255,0.9)] space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#2B3655] flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#E3F1FF] text-[#2B3655] flex items-center justify-center text-xs shadow-2xs">
                    <FaClock />
                  </div>
                  <span>Drop-off Time *</span>
                </span>
                {timesLoading && (
                  <span className="text-[10px] text-[#2B3655]/70 font-bold flex items-center gap-1">
                    <FaSpinner className="animate-spin text-[10px]" /> Loading
                    slots...
                  </span>
                )}
              </div>

              {/* Period Tabs: Morning / Afternoon / Evening (Soft Blue #E3F1FF background) */}
              <div className="grid grid-cols-3 gap-1.5 bg-[#F0F7FF] p-1 rounded-2xl border border-[#D6E8FA]">
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
                      className={`py-2 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-0.5 cursor-pointer active:scale-95 ${
                        isActive
                          ? "bg-[#FFFFFF] text-[#2B3655] border border-[#D6E8FA] shadow-xs"
                          : "text-[#2B3655]/60 hover:text-[#2B3655]"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Icon className="text-[11px]" />
                        <span>{tab.label}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold ${isActive ? "text-[#2B3655]" : "text-[#2B3655]/40"}`}
                      >
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Slot Chips Grid using Selected state #87BFFF */}
              {timesLoading ? (
                <div className="py-8 flex flex-col items-center justify-center text-[#2B3655]/50 text-xs gap-2">
                  <FaSpinner className="animate-spin text-lg text-[#87BFFF]" />
                  <span>Fetching available slots for {selectedDate}...</span>
                </div>
              ) : categorizedSlots[activePeriodTab]?.length > 0 ? (
                <div className="grid grid-cols-2 min-[380px]:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5">
                  {categorizedSlots[activePeriodTab].map((slot, sIdx) => {
                    const slotStr =
                      typeof slot === "string" ? slot : slot?.timeSlot || "";
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
                        className={`min-h-[44px] h-11 px-2.5 py-1.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border cursor-pointer active:scale-95 ${
                          isSelected
                            ? "bg-[#87BFFF] text-[#2B3655] border-[#87BFFF] shadow-[0_6px_16px_rgba(135,191,255,0.45),inset_0_2px_3px_rgba(255,255,255,0.5)] ring-2 ring-[#87BFFF]/50"
                            : "bg-[#FFFFFF] hover:bg-[#E3F1FF]/60 text-[#2B3655] border-[#D6E8FA] shadow-xs"
                        }`}
                      >
                        <span className="font-mono text-[11px] sm:text-xs truncate">
                          {slotStr}
                        </span>
                        {isSelected && (
                          <FaCheck className="text-[10px] shrink-0 text-[#2B3655]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-[#2B3655]/50 text-xs">
                  No {activePeriodTab.toLowerCase()} slots available for this
                  date.
                </div>
              )}
            </div>

            {/* SECTION 5: Additional Optional Details (Border: #87BFFF, Lighter Shade Inside Card) */}
            <details className="group bg-gradient-to-b from-[#F8FBFF] via-[#F2F8FF] to-[#EAF4FF] rounded-3xl border border-[#87BFFF]/75 p-4 sm:p-5 shadow-[0_10px_28px_rgba(135,191,255,0.16),inset_0_1px_3px_rgba(255,255,255,0.9)]">
              <summary className="text-xs font-black text-[#2B3655] flex items-center justify-between cursor-pointer select-none">
                <span className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#E3F1FF] text-[#2B3655] flex items-center justify-center text-xs shadow-2xs">
                    <FaWrench />
                  </div>
                  <span>Additional Details (Optional)</span>
                </span>
                <span className="text-[10px] text-[#2B3655] font-bold group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>

              <div className="space-y-3.5 pt-3.5 mt-2 border-t border-[#D6E8FA]">
                {/* Mileage (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#2B3655] flex justify-between">
                    <span>Current Mileage (KM)</span>
                    <span className="text-[10px] text-[#2B3655]/40 font-normal">
                      Optional
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full h-11 px-3.5 bg-[#FFFFFF] border border-[#D6E8FA] focus:border-[#87BFFF] focus:bg-white rounded-2xl font-bold text-[#2B3655] text-base focus:outline-none shadow-[inset_0_2px_4px_rgba(23,43,77,0.02)]"
                  />
                </div>

                {/* Service Advisor (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#2B3655] flex justify-between">
                    <span>Service Advisor</span>
                    <span className="text-[10px] text-[#2B3655]/40 font-normal">
                      Optional
                    </span>
                  </label>
                  {advisors.length > 0 ? (
                    <select
                      value={advisorId}
                      onChange={(e) => setAdvisorId(e.target.value)}
                      className="w-full h-11 px-3 bg-[#FFFFFF] border border-[#D6E8FA] focus:border-[#87BFFF] focus:bg-white rounded-2xl font-bold text-[#2B3655] text-xs focus:outline-none shadow-xs"
                    >
                      <option value="">
                        Any Available Advisor (Auto-assign)
                      </option>
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
                      className="w-full h-11 px-3.5 bg-[#FFFFFF] border border-[#D6E8FA] focus:border-[#87BFFF] focus:bg-white rounded-2xl font-semibold text-[#2B3655] text-base focus:outline-none shadow-xs"
                    />
                  )}
                </div>

                {/* Customer Notes (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#2B3655] flex justify-between">
                    <span>Customer Notes</span>
                    <span className="text-[10px] text-[#2B3655]/40 font-normal">
                      Optional
                    </span>
                  </label>
                  <textarea
                    rows="2"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Any specific requests or observations..."
                    className="w-full p-3 bg-[#FFFFFF] border border-[#D6E8FA] focus:border-[#87BFFF] focus:bg-white rounded-2xl font-medium text-[#2B3655] text-xs focus:outline-none shadow-[inset_0_2px_4px_rgba(23,43,77,0.02)] resize-none"
                  />
                </div>
              </div>
            </details>

            {/* Primary Submit Button using Primary #87BFFF and Text #2B3655 */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  submitting ||
                  !plateNo.trim() ||
                  !selectedDate ||
                  !selectedTimeSlot
                }
                className="w-full h-13 bg-gradient-to-r from-[#87BFFF] via-[#94c6ff] to-[#87BFFF] hover:brightness-105 active:scale-97 text-[#2B3655] font-black text-sm sm:text-base rounded-2xl shadow-[0_12px_28px_-6px_rgba(135,191,255,0.55),inset_0_2px_4px_rgba(255,255,255,0.6)] flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 border border-[#87BFFF]"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin text-lg text-[#2B3655]" />
                    <span>Confirming Service Booking...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="text-base text-[#2B3655]" />
                    <span>Confirm & Book Service</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </main>

        {/* Minimal Footer */}
        <footer className="px-4 py-3.5 text-center text-[10px] font-semibold text-[#2B3655]/60 border-t border-[#D6E8FA] bg-[#FFFFFF] sm:rounded-b-3xl">
          Powered by CS Infocomm
        </footer>

        {/* SUCCESS CONFIRMATION MODAL (Card: #FFFFFF, Border: #D6E8FA, Success: #42B978) */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B3655]/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-[#FFFFFF] w-full max-w-sm rounded-3xl p-6 shadow-[0_25px_60px_-15px_rgba(23,43,77,0.25)] space-y-4 border border-[#D6E8FA] animate-in zoom-in-95 duration-200">
              {/* Header Icon & Title */}
              <div className="text-center space-y-2 pt-1">
                <div className="w-16 h-16 bg-[#42B978] text-white rounded-3xl mx-auto flex items-center justify-center shadow-[0_10px_25px_rgba(66,185,120,0.35),inset_0_2px_4px_rgba(255,255,255,0.5)]">
                  <FaCheckCircle className="text-3xl" />
                </div>
                <h3 className="text-xl font-black text-[#2B3655] tracking-tight">
                  Booking Confirmed!
                </h3>
                <p className="text-xs text-[#2B3655]/70 font-medium">
                  Your AGMC service booking has been successfully scheduled.
                </p>
              </div>

              {/* Booking Summary Pass (Border: #87BFFF, Lighter Shade Inside Card) */}
              <div className="bg-gradient-to-b from-[#F8FBFF] to-[#EAF4FF] rounded-2xl p-4 border border-[#87BFFF]/60 space-y-3 text-xs shadow-xs">
                <div className="flex justify-between items-center pb-2 border-b border-[#D6E8FA]">
                  <span className="text-[10px] uppercase font-black tracking-wider text-[#2B3655]/60">
                    Appointment Details
                  </span>
                  <span className="text-[10px] font-black text-[#42B978] bg-[#42B978]/15 px-2.5 py-0.5 rounded-full border border-[#42B978]/30 shadow-2xs">
                    CONFIRMED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#2B3655]/60 font-bold block uppercase">
                      Date
                    </span>
                    <span className="font-extrabold text-[#2B3655] text-xs">
                      {bookingResult?.submittedPayload?.startDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#2B3655]/60 font-bold block uppercase">
                      Drop-off Time
                    </span>
                    <span className="font-black text-[#2B3655] text-xs font-mono">
                      {bookingResult?.submittedPayload?.dropOffTime}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#2B3655]/60 font-bold block uppercase">
                      Vehicle Plate
                    </span>
                    <span className="font-extrabold text-[#2B3655] font-mono text-xs">
                      {bookingResult?.submittedPayload?.licensePlateNo}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#2B3655]/60 font-bold block uppercase">
                      Dealership ID
                    </span>
                    <span className="font-extrabold text-[#2B3655] text-xs">
                      #{bookingResult?.submittedPayload?.dealershipLocationId}
                    </span>
                  </div>
                </div>

                {customerFound?.name?.trim() ? (
                  <div className="pt-2.5 border-t border-[#D6E8FA]">
                    <span className="text-[10px] text-[#2B3655]/60 font-bold block uppercase">
                      Customer
                    </span>
                    <span className="font-bold text-[#2B3655] text-xs truncate block">
                      {customerFound.name.trim()} ({phone})
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Action Buttons: Return to WhatsApp (Success: #42B978) & Book Another */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleReturnToWhatsApp}
                  className="w-full py-3.5 bg-[#42B978] hover:bg-[#37a368] active:scale-97 text-white font-black text-sm rounded-2xl shadow-[0_10px_24px_-4px_rgba(66,185,120,0.45),inset_0_2px_4px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all border border-[#42B978]"
                >
                  <FaWhatsapp className="text-xl" />
                  <span>Return to WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setSelectedTimeSlot("");
                  }}
                  className="w-full py-2.5 bg-[#FFFFFF] hover:bg-[#F0F7FF] active:scale-98 text-[#2B3655] font-bold text-xs rounded-xl transition-all cursor-pointer border border-[#D6E8FA] shadow-2xs"
                >
                  Book Another Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
