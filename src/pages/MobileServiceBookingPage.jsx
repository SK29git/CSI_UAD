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
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaSpinner,
  FaCheck,
  FaCheckCircle,
  FaTimes,
  FaWhatsapp,
  FaCarSide,
  FaShieldAlt,
  FaGlobe,
  FaChevronLeft,
  FaChevronRight,
  FaSun,
  FaCloudSun,
  FaMoon,
} from "react-icons/fa";

// Generate upcoming available calendar dates (14 working days)
function generateUpcomingDates() {
  const dates = [];
  const now = new Date();
  let dayOffset = 1;
  while (dates.length < 14 && dayOffset < 30) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
    if (d.getDay() !== 0) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      dates.push(`${yyyy}-${mm}-${dd}`);
    }
    dayOffset++;
  }
  return dates;
}

// Standard appointment slots in 15-min intervals matching reference UI
const FALLBACK_SLOTS = [
  "08:00-08:15",
  "08:15-08:30",
  "08:30-08:45",
  "08:45-09:00",
  "09:00-09:15",
  "09:15-09:30",
  "09:30-09:45",
  "09:45-10:00",
  "10:00-10:15",
  "10:15-10:30",
  "10:30-10:45",
  "10:45-11:00",
  "11:00-11:15",
  "11:15-11:30",
  "11:30-11:45",
  "13:00-13:15",
  "13:30-13:45",
  "14:00-14:15",
  "14:30-14:45",
  "15:00-15:15",
  "15:30-15:45",
  "16:00-16:15",
  "16:30-16:45",
];

/**
 * Translations Dictionary for English and Arabic
 */
const translations = {
  en: {
    langBtn: "العربية",
    title: "Book your service",
    brandTitle: "AGMC",
    greeting: (name) => (name ? `Dear ${name},` : "Dear customer,"),
    greetingSubtitle: "We've filled in what we know based on your phone number.",
    customerVehicle: "Customer & Vehicle",
    branch: "Branch",
    dealershipLocation: "Dealership Location",
    branch40Title: "Sheikh Zayed Road",
    branch40Sub: "Dealership ID #40 · Dubai",
    branch240Title: "Deira",
    branch240Sub: "Dealership ID #240 · Dubai",
    addTechnicianNotes: "+ Add details for the technician",
    hideTechnicianNotes: "- Hide details for the technician",
    technicianNotesPlaceholder: "Add any specific requests or observations for the technician...",
    phoneLabel: "Mobile Phone Number",
    phonePlaceholder: "e.g. 0543408597",
    fetchingDetails: "Fetching details...",
    plateLabel: "Vehicle Plate Number",
    platePlaceholder: "e.g. 26578-20-AD",
    searchingVehicle: "Searching vehicle...",
    selectVehicle: "Select Customer Vehicle",
    dealershipLocationLabel: "Dealership Location ID",
    verifiedBadge: "VERIFIED",
    serviceAvailable: "Service Inclusive until Mar 2028",
    chassisVin: "CHASSIS / VIN",
    dateLabel: "Appointment Date",
    datesAvailable: "Dates Available",
    selectedDatePrefix: "Selected Date:",
    quickDates: "Quick Dates",
    fullCalendar: "Calendar View",
    available: "Available",
    timeLabel: "Drop-off Time",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    loadingSlots: "Loading available slots...",
    noSlots: "No available slots for this date. Please pick another date above.",
    noCategorySlots: (cat) => `No ${cat.toLowerCase()} slots available for this date. Please pick another tab or date above.`,
    additionalPreferences: "Additional Preferences (Optional)",
    serviceAdvisor: "Service Advisor",
    anyAdvisor: "Any Available Advisor (Auto-assign)",
    advisorPlaceholder: "e.g. 4031 (or leave blank)",
    customerNotes: "Customer Notes",
    notesPlaceholder: "Any specific requests or observations...",
    confirmBooking: "Confirm booking",
    confirmingBooking: "Confirming booking...",
    modalTitle: "Booking Confirmed!",
    modalDesc: "Your AGMC service booking has been successfully scheduled.",
    apptDetails: "Appointment Details",
    confirmed: "CONFIRMED",
    modalDate: "Date",
    modalTime: "Drop-off Time",
    modalPlate: "Vehicle Plate",
    modalDealership: "Dealership ID",
    modalCustomer: "Customer",
    returnToWhatsApp: "Return to WhatsApp",
    bookAnother: "Book Another Appointment",
    poweredBy: "Powered by CS Infocomm",
    monthNames: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
    weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
  ar: {
    langBtn: "English",
    title: "احجز موعد صيانتك",
    brandTitle: "AGMC",
    greeting: (name) => (name ? `عزيزي ${name}،` : "عزيزي العميل،"),
    greetingSubtitle: "لقد قمنا بتعبئة البيانات المسجلة لديك بناءً على رقم هاتفك.",
    customerVehicle: "بيانات العميل والمركبة",
    branch: "الفرع",
    dealershipLocation: "مركز الخدمة",
    branch40Title: "طريق الشيخ زايد",
    branch40Sub: "رقم الفرع #40 · دبي",
    branch240Title: "ديرة",
    branch240Sub: "رقم الفرع #240 · دبي",
    addTechnicianNotes: "+ إضافة تفاصيل للفني",
    hideTechnicianNotes: "- إخفاء تفاصيل الفني",
    technicianNotesPlaceholder: "أضف أي طلبات أو ملاحظات خاصة لفني الصيانة...",
    phoneLabel: "رقم الهاتف المتحرك",
    phonePlaceholder: "مثال: 0543408597",
    fetchingDetails: "جاري جلب البيانات...",
    plateLabel: "رقم لوحة المركبة",
    platePlaceholder: "مثال: 26578-20-AD",
    searchingVehicle: "جاري البحث عن المركبة...",
    selectVehicle: "اختر مركبة العميل",
    dealershipLocationLabel: "رقم الفرع",
    verifiedBadge: "معتمد",
    serviceAvailable: "باقة الخدمة متضمنة حتى مارس 2028",
    chassisVin: "رقم الهيكل / الشاسيه",
    dateLabel: "تاريخ الموعد",
    datesAvailable: "مواعيد متاحة",
    selectedDatePrefix: "التاريخ المختار:",
    quickDates: "مواعيد سريعة",
    fullCalendar: "عرض التقويم",
    available: "متاح",
    timeLabel: "وقت التسليم",
    morning: "الصباح",
    afternoon: "بعد الظهر",
    evening: "المساء",
    loadingSlots: "جاري تحميل الأوقات المتاحة...",
    noSlots: "لا توجد مواعيد متاحة في هذا التاريخ. يرجى اختيار تاريخ آخر أعلاه.",
    noCategorySlots: (cat) => `لا توجد مواعيد متاحة في فترة ${cat} لهذا اليوم. يرجى اختيار تبويب آخر أو تاريخ آخر أعلاه.`,
    additionalPreferences: "خيارات إضافية (اختياري)",
    serviceAdvisor: "مستشار الخدمة",
    anyAdvisor: "أي مستشار متاح (تعيين تلقائي)",
    advisorPlaceholder: "مثال: 4031 (أو اتركه فارغاً)",
    customerNotes: "ملاحظات العميل",
    notesPlaceholder: "أي طلبات أو ملاحظات خاصة بالصيانة...",
    confirmBooking: "تأكيد الحجز",
    confirmingBooking: "جاري تأكيد الحجز...",
    modalTitle: "تم تأكيد الحجز بنجاح!",
    modalDesc: "تم حجز موعد صيانة AGMC الخاص بك بنجاح.",
    apptDetails: "تفاصيل الموعد",
    confirmed: "مؤكد",
    modalDate: "التاريخ",
    modalTime: "وقت التسليم",
    modalPlate: "لوحة المركبة",
    modalDealership: "رقم الفرع",
    modalCustomer: "العميل",
    returnToWhatsApp: "العودة إلى واتساب",
    bookAnother: "حجز موعد آخر",
    poweredBy: "مشغل بواسطة CS Infocomm",
    monthNames: [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
    ],
    weekdays: ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
    days: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
  },
};

/**
 * Format slot time from API directly
 * e.g., "08:00-08:15" -> "08:00 - 08:15"
 */
function formatSlotDisplay(slotStr) {
  if (!slotStr) return "";
  const raw = typeof slotStr === "string" ? slotStr : slotStr.timeSlot || "";
  if (raw.includes("-")) {
    return raw.replace(/\s*-\s*/, " - ");
  }
  return raw;
}

/**
 * Interactive Touch Calendar (Clean Black & White Theme)
 */
function InteractiveTouchCalendar({
  availableDates = [],
  selectedDate,
  onSelectDate,
  lang = "en",
}) {
  const t = translations[lang] || translations.en;
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
    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 space-y-3">
      {/* Month Navigation */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="pill-btn w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:scale-95 text-black rounded-xl transition-all border border-gray-200 cursor-pointer"
          title="Previous Month"
        >
          <FaChevronLeft className="text-xs" />
        </button>

        <div className="text-base font-bold text-black tracking-wide">
          {t.monthNames[currentYearMonth.month]} {currentYearMonth.year}
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="pill-btn w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:scale-95 text-black rounded-xl transition-all border border-gray-200 cursor-pointer"
          title="Next Month"
        >
          <FaChevronRight className="text-xs" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
        {t.weekdays.map((w) => (
          <span key={w} className="text-xs font-semibold text-gray-500">
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
                className={`calendar-day-btn h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-bold transition-all flex flex-col items-center justify-center relative cursor-pointer active:scale-95 ${
                  cell.isSelected
                    ? "bg-black text-white border-2 border-black shadow-xs ring-2 ring-black/10"
                    : "bg-white hover:bg-gray-50 text-black border border-gray-200"
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
              className="h-10 sm:h-11 rounded-xl text-xs sm:text-sm text-gray-300 flex items-center justify-center cursor-not-allowed select-none"
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

  // Language state (support ?lang=ar or ?lang=en, defaults to en)
  const [lang, setLang] = useState(() => {
    const l = searchParams.get("lang");
    return l === "ar" || l === "arabic" ? "ar" : "en";
  });
  const t = translations[lang] || translations.en;
  const isRTL = lang === "ar";

  // Read URL parameters
  const paramMobile = (
    searchParams.get("mobilenumber") ||
    searchParams.get("mobile") ||
    searchParams.get("phone") ||
    "0543408597"
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

  // Dealership Location ID (40 & 240)
  const [locationId, setLocationId] = useState(40);

  // Standard Recommended Product ID (Periodic Maintenance)
  const [selectedProductId] = useState("07143ffd-184e-43b5-a8de-f68d63199baa");

  // Generate initial upcoming dates
  const initialUpcomingDates = useMemo(() => generateUpcomingDates(), []);

  // Appointment Dates
  const [availableDates, setAvailableDates] = useState(initialUpcomingDates);
  const [datesLoading, setDatesLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => initialUpcomingDates[0] || "");
  const [calendarViewMode, setCalendarViewMode] = useState("quick"); // 'quick' | 'full'

  // Time Slots
  const [timeSlots, setTimeSlots] = useState(FALLBACK_SLOTS);
  const [timesLoading, setTimesLoading] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("08:00-08:15");
  const [activeTimeTab, setActiveTimeTab] = useState("Morning");

  // Optional Fields
  const [mileage, setMileage] = useState("");
  const [advisorId, setAdvisorId] = useState("");
  const [advisors, setAdvisors] = useState([]);
  const [customerNotes, setCustomerNotes] = useState("");
  const [showTechnicianNotes, setShowTechnicianNotes] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Section Refs for Guided Vertical Auto-Scrolling
  const dealershipRef = useRef(null);
  const dateRef = useRef(null);
  const timeRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const hasAutoScrolledToDealership = useRef(false);

  // 1. Auto-scroll to Dealership ID 2 seconds after vehicle/plate is detected
  useEffect(() => {
    if ((vehicleData || customerVehicles.length > 0) && plateNo && plateNo.trim()) {
      if (!hasAutoScrolledToDealership.current) {
        hasAutoScrolledToDealership.current = true;
        const timer = setTimeout(() => {
          dealershipRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [vehicleData, customerVehicles, plateNo]);

  // 2. Handler when Dealership ID is selected -> scroll to Appointment Date
  const handleSelectLocation = (id) => {
    setLocationId(id);
    setTimeout(() => {
      dateRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  };

  // 3. Handler when Date is selected -> scroll to Time Slots
  const handleSelectDate = (dateStr) => {
    setSelectedDate(dateStr);
    setTimeout(() => {
      timeRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 200);
  };

  // 4. Handler when Time Slot is selected -> scroll to Confirm Booking Button
  const handleSelectTimeSlot = (slotRaw) => {
    setSelectedTimeSlot(slotRaw);
    setTimeout(() => {
      confirmButtonRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 200);
  };

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
                const detectedMileage =
                  firstV.mileage ||
                  firstV.odometer ||
                  firstV.mileageKm ||
                  firstV.odometerKm;
                if (detectedMileage) {
                  setMileage(String(detectedMileage));
                } else {
                  setMileage("");
                }

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
      if (
        res &&
        res.ok &&
        v &&
        (v.vehicleMakeCode || v.vehicleModal || v.make || v.model)
      ) {
        setVehicleData(v);
        if (v.sabVehicleId || v.vehicleId) {
          setVehicleId(v.sabVehicleId || v.vehicleId);
        }
        if (v.vehicleMakeCode || v.make) {
          setServiceMake(v.vehicleMakeCode || v.make);
        }
        const detectedMileage =
          v.mileage || v.odometer || v.mileageKm || v.odometerKm;
        if (detectedMileage) {
          setMileage(String(detectedMileage));
        }
      } else {
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
      setMileage("");
      hasAutoScrolledToDealership.current = false;
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

  // Fetch Advisors when locationId changes (guarded against duplicate calls)
  const lastAdvisorsLocationRef = useRef(null);
  useEffect(() => {
    if (!locationId || locationId === lastAdvisorsLocationRef.current) return;
    lastAdvisorsLocationRef.current = locationId;
    getServiceAdvisors(locationId)
      .then((res) => {
        if (res && res.ok && res.data) {
          const advList = res.data.result || res.data.data || res.data || [];
          if (Array.isArray(advList)) setAdvisors(advList);
        }
      })
      .catch((e) => console.warn("Advisors fetch failed:", e));
  }, [locationId]);

  // Fetch Available Appointment Dates from API (guarded against duplicate calls)
  const lastDatesFetchKeyRef = useRef("");
  useEffect(() => {
    if (!locationId || !selectedProductId) return;
    const bookingMake = "Geely";
    const fetchKey = `${locationId}_${bookingMake}_${selectedProductId}`;
    if (fetchKey === lastDatesFetchKeyRef.current) return;
    lastDatesFetchKeyRef.current = fetchKey;

    let isMounted = true;
    const fetchDates = async () => {
      setDatesLoading(true);
      try {
        const res = await getAppointmentDates({
          dealershipLocationId: locationId,
          make: bookingMake,
          serviceProductIds: [selectedProductId],
        });
        if (isMounted && res && res.ok && res.data) {
          const rawDates =
            (Array.isArray(res.data) && res.data) ||
            (Array.isArray(res.data?.result) && res.data.result) ||
            (Array.isArray(res.data?.data) && res.data.data) ||
            res.data?.result?.availableDates ||
            res.data?.result?.dates ||
            res.data?.data?.availableDates ||
            res.data?.data?.dates ||
            res.data?.availableDates ||
            res.data?.dates ||
            [];
          const normalized = (rawDates || [])
            .map((item) =>
              typeof item === "string"
                ? item
                : item?.date || item?.appointmentDate,
            )
            .filter(Boolean);
          if (Array.isArray(normalized) && normalized.length > 0) {
            setAvailableDates(normalized);
            setSelectedDate((prev) =>
              normalized.includes(prev) ? prev : normalized[0],
            );
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
  }, [locationId, selectedProductId]);

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
            (Array.isArray(res.data?.result) && res.data.result) ||
            (Array.isArray(res.data?.data) && res.data.data) ||
            res.data.result?.timeSlots ||
            res.data.data?.timeSlots ||
            res.data.timeSlots ||
            (Array.isArray(res.data) ? res.data : []);
          if (Array.isArray(rawSlots) && rawSlots.length > 0) {
            setTimeSlots(rawSlots);
            const firstSlot =
              typeof rawSlots[0] === "string"
                ? rawSlots[0]
                : rawSlots[0]?.timeSlot || "";
            setSelectedTimeSlot((prev) => (rawSlots.some((s) => (typeof s === "string" ? s : s.timeSlot) === prev) ? prev : firstSlot));

            if (rawSlots[0]?.advisorId && !advisorId) {
              setAdvisorId(String(rawSlots[0].advisorId));
            }
          } else {
            setTimeSlots(FALLBACK_SLOTS);
            setSelectedTimeSlot((prev) => prev || "08:00-08:15");
          }
        } else {
          setTimeSlots(FALLBACK_SLOTS);
          setSelectedTimeSlot((prev) => prev || "08:00-08:15");
        }
      } catch (err) {
        console.warn("Failed to fetch timeslots:", err);
        setTimeSlots(FALLBACK_SLOTS);
        setSelectedTimeSlot((prev) => prev || "08:00-08:15");
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
      else if (hour < 17) categories.Afternoon.push(slot);
      else categories.Evening.push(slot);
    });

    return categories;
  }, [timeSlots]);

  // Auto-sync activeTimeTab when slots change or when selectedTimeSlot is set
  useEffect(() => {
    if (selectedTimeSlot) {
      const match = selectedTimeSlot.match(/^(\d{1,2}):/);
      if (match) {
        const hour = parseInt(match[1], 10);
        if (hour < 12) {
          setActiveTimeTab("Morning");
          return;
        } else if (hour < 17) {
          setActiveTimeTab("Afternoon");
          return;
        } else {
          setActiveTimeTab("Evening");
          return;
        }
      }
    }

    if (
      categorizedSlots[activeTimeTab]?.length === 0 &&
      timeSlots.length > 0
    ) {
      if (categorizedSlots.Morning.length > 0) setActiveTimeTab("Morning");
      else if (categorizedSlots.Afternoon.length > 0)
        setActiveTimeTab("Afternoon");
      else if (categorizedSlots.Evening.length > 0) setActiveTimeTab("Evening");
    }
  }, [timeSlots, selectedTimeSlot]);

  // Submit Booking Handler
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!plateNo.trim() || !selectedDate || !selectedTimeSlot) {
      setBookingError(
        lang === "ar"
          ? "يرجى تحديد تاريخ الموعد ووقت التسليم."
          : "Please select an appointment date and drop-off time slot.",
      );
      return;
    }

    setSubmitting(true);
    setBookingError(null);

    const payload = {
      dealershipLocationId: Number(locationId),
      startDate: selectedDate,
      dropOffTime: selectedTimeSlot,
      licensePlateNo: plateNo.trim(),
      make: serviceMake || "Geely",
      mileage: Number(mileage) || undefined,
      mobileNumber: phone.trim() || undefined,
      advisorId: advisorId ? Number(advisorId) : undefined,
      serviceProductIds: [selectedProductId],
      transportOption: "customer_dropoff",
      isBreakdown: false,
      notes: customerNotes.trim() || undefined,
    };

    if (vehicleId) payload.vehicleId = vehicleId;
    if (customerId) payload.customerId = customerId;

    try {
      const res = await createServiceBooking(payload);
      if (res && res.ok) {
        setBookingResult({
          response: res.data,
          submittedPayload: payload,
        });
        setShowSuccessModal(true);
      } else {
        const errorMsg =
          res?.data?.message ||
          res?.data?.error ||
          res?.data?.msg ||
          "Failed to confirm booking. Please try another slot.";
        setBookingError(errorMsg);
      }
    } catch (err) {
      console.error("Booking submission error:", err);
      setBookingError("An error occurred during booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Return to WhatsApp handler
  const handleReturnToWhatsApp = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const redirectUrl =
      searchParams.get("return_url") || searchParams.get("redirect");
    window.location.href = redirectUrl || "https://wa.me/97180043359";
  };

  // Detected Vehicle Display Details
  const vehicleDisplayName = useMemo(() => {
    if (vehicleData) {
      const make =
        vehicleData.vehicleMakeCode || vehicleData.make || serviceMake || "";
      const model = vehicleData.vehicleModal || vehicleData.model || "";
      const year = vehicleData.modelYear || vehicleData.year || "";
      return `${make} ${model} ${year ? `(${year})` : ""}`.trim();
    }
    if (customerVehicles.length > 0) {
      const v = customerVehicles[0].vehicle || customerVehicles[0];
      return `${v.make || serviceMake || ""} ${v.model || ""}`.trim();
    }
    return "";
  }, [vehicleData, customerVehicles, serviceMake]);

  // Customer First Name for Greeting
  const customerFirstName = useMemo(() => {
    if (customerFound?.name && typeof customerFound.name === "string") {
      const trimmed = customerFound.name.trim();
      if (trimmed) return trimmed.split(/\s+/)[0];
    }
    if (
      customerFound?.customerName &&
      typeof customerFound.customerName === "string"
    ) {
      const trimmed = customerFound.customerName.trim();
      if (trimmed) return trimmed.split(/\s+/)[0];
    }
    return "";
  }, [customerFound]);

  // Actual Service Package / Warranty Info (Option B: only show if present from API)
  const servicePackageInfo = useMemo(() => {
    const targetV =
      vehicleData ||
      (customerVehicles.length > 0
        ? customerVehicles[0].vehicle || customerVehicles[0]
        : null);

    if (!targetV) return null;

    // 1. Packages array
    if (Array.isArray(targetV.packages) && targetV.packages.length > 0) {
      const activePkg =
        targetV.packages.find(
          (p) =>
            String(p?.status || "").toUpperCase() === "ACTIVE" ||
            p?.isActive ||
            p?.active,
        ) || targetV.packages[0];

      if (activePkg) {
        const name =
          activePkg.name ||
          activePkg.packageName ||
          activePkg.title ||
          (lang === "ar" ? "باقة الخدمة متضمنة" : "Service Inclusive");
        const expiry =
          activePkg.expiryDate || activePkg.validUntil || activePkg.endDate;
        if (expiry) {
          let formattedDate = expiry;
          try {
            const d = new Date(expiry);
            if (!isNaN(d.getTime())) {
              formattedDate = d.toLocaleDateString(
                lang === "ar" ? "ar-AE" : "en-US",
                { month: "short", year: "numeric" },
              );
            }
          } catch {}
          return lang === "ar"
            ? `${name} متضمن حتى ${formattedDate}`
            : `${name} until ${formattedDate}`;
        }
        return name;
      }
    }

    // 2. Single package object / string
    const pkgObj =
      targetV.package ||
      targetV.servicePackage ||
      targetV.serviceContract ||
      targetV.contract;
    if (pkgObj) {
      if (typeof pkgObj === "string" && pkgObj.trim()) return pkgObj.trim();
      const name =
        pkgObj.name ||
        pkgObj.packageName ||
        (lang === "ar" ? "باقة الخدمة متضمنة" : "Service Inclusive");
      const expiry = pkgObj.expiryDate || pkgObj.validUntil || pkgObj.endDate;
      if (expiry) {
        let formattedDate = expiry;
        try {
          const d = new Date(expiry);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString(
              lang === "ar" ? "ar-AE" : "en-US",
              { month: "short", year: "numeric" },
            );
          }
        } catch {}
        return lang === "ar"
          ? `${name} متضمن حتى ${formattedDate}`
          : `${name} until ${formattedDate}`;
      }
      return name;
    }

    // 3. Warranty object or status
    const warranty = targetV.warranty;
    if (warranty) {
      if (typeof warranty === "string" && warranty.trim()) {
        return warranty.trim();
      }
      if (
        warranty.status &&
        String(warranty.status).toUpperCase() === "ACTIVE"
      ) {
        const expiry =
          warranty.expiryDate || warranty.validUntil || warranty.endDate;
        if (expiry) {
          let formattedDate = expiry;
          try {
            const d = new Date(expiry);
            if (!isNaN(d.getTime())) {
              formattedDate = d.toLocaleDateString(
                lang === "ar" ? "ar-AE" : "en-US",
                { month: "short", year: "numeric" },
              );
            }
          } catch {}
          return lang === "ar"
            ? `الضمان سارٍ حتى ${formattedDate}`
            : `Warranty until ${formattedDate}`;
        }
        return lang === "ar" ? "الضمان سارٍ" : "Active Warranty";
      }
    }

    if (
      targetV.warrantyStatus &&
      String(targetV.warrantyStatus).toUpperCase() === "ACTIVE"
    ) {
      const expiry = targetV.warrantyExpiry || targetV.warrantyEndDate;
      if (expiry) {
        return lang === "ar"
          ? `الضمان سارٍ حتى ${expiry}`
          : `Warranty until ${expiry}`;
      }
      return lang === "ar" ? "الضمان سارٍ" : "Active Warranty";
    }

    return null;
  }, [vehicleData, customerVehicles, lang]);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="mobile-service-container min-h-screen bg-[#F9FAFB] text-black font-sans flex flex-col justify-between py-4 px-3 sm:px-6"
    >
      {/* MAIN CONTAINER: Clean Black & White Container */}
      <div className="w-full max-w-lg mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <main className="space-y-4">
          {/* CLIENT BRAND HEADER (AGMC | Geely Logo) & Language Switcher */}
          <div className="flex items-center justify-between pb-1">
            {/* Left Spacer to keep logo group centered */}
            <div className="w-14 sm:w-16" />

            {/* Centered Brand Title & Geely Logo */}
            <div className="flex items-center gap-3 sm:gap-3.5">
              <img
                src="/agmc-logo.png"
                alt="AGMC"
                className="h-6 sm:h-7.5 w-auto object-contain"
              />
              <span className="h-6 sm:h-7 w-[1.5px] bg-gray-300" />
              <img
                src="/geely-logo.png"
                alt="Geely"
                className="h-9 sm:h-11 w-auto object-contain"
              />
            </div>

            {/* Language Switcher Pill */}
            <div className="w-14 sm:w-16 flex justify-end">
              <button
                type="button"
                onClick={() => setLang(lang === "en" ? "ar" : "en")}
                className="pill-btn px-3 py-1 rounded-full border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 text-black transition-all shadow-2xs cursor-pointer"
              >
                {t.langBtn}
              </button>
            </div>
          </div>

          {/* SUB-HEADER: "Book your service" */}
          <div className="pt-0.5">
            <h1 className="text-black tracking-tight" style={{ fontSize: "26px", fontWeight: "700", lineHeight: "1.25" }}>
              {t.title}
            </h1>
          </div>

          {/* ERROR ALERT BANNER */}
          {bookingError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs shadow-xs animate-in fade-in">
              <FaTimes className="text-rose-500 text-sm mt-0.5 shrink-0" />
              <div className="flex-1 font-medium">{bookingError}</div>
              <button
                type="button"
                onClick={() => setBookingError(null)}
                className="text-rose-400 hover:text-rose-600 cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmitBooking} className="space-y-4">
            {/* SECTION 1: CUSTOMER GREETING & VEHICLE CARD (Matching Reference Image) */}
            <div className="bg-gray-100/75 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-gray-200/80 space-y-3">
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", lineHeight: "1.35" }}>
                  {t.greeting(customerFirstName)}
                </h2>
                <p className="mt-1" style={{ fontSize: "15px", color: "var(--ink-secondary)", fontWeight: "400", lineHeight: "1.45" }}>
                  {t.greetingSubtitle}
                </p>
              </div>

              {/* READ-ONLY VEHICLE CARD */}
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200/90 p-3.5 sm:p-4 flex items-start sm:items-center gap-3.5 shadow-2xs">
                {/* Clean Car Icon Box */}
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 text-xl shrink-0">
                  <FaCarSide />
                </div>

                {/* Vehicle Details */}
                <div className="flex-1 min-w-0">
                  <h3 style={{ fontSize: "18px", fontWeight: "700" }} className="text-black truncate tracking-tight">
                    {vehicleDisplayName || (customerVehicles.length > 0 ? "Geely COOLRAY" : "Geely Vehicle")}
                  </h3>

                  <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 border border-black rounded-lg font-mono text-black tracking-wider bg-white" style={{ fontSize: "14px", fontWeight: "700" }}>
                      Dubai {plateNo || "—"}
                    </span>
                    {mileage && Number(mileage) > 0 ? (
                      <span style={{ fontSize: "14.5px", color: "var(--ink-secondary)", fontWeight: "500" }}>
                        {Number(mileage).toLocaleString()} km
                      </span>
                    ) : null}
                  </div>

                  {/* Option B: Only display service package/warranty badge if present in API */}
                  {servicePackageInfo && (
                    <div className="mt-2.5 inline-flex items-center px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60" style={{ fontSize: "13px", fontWeight: "600" }}>
                      {servicePackageInfo}
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-Vehicle Picker if customer has more than 1 vehicle */}
              {customerVehicles.length > 1 && (
                <div className="pt-1">
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
                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
                  >
                    {customerVehicles.map((item, idx) => {
                      const v = item.vehicle || item;
                      const p = v.licensePlate || `Vehicle ${idx + 1}`;
                      const m = v.model || v.vehicleModal || "";
                      return (
                        <option key={idx} value={p}>
                          {p} {m ? `- ${m}` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>

            {/* BRANCH SELECTION (Dealership location IDs 40 & 240 described) */}
            <div ref={dealershipRef} className="space-y-2 pt-1">
              <label className="flex items-center text-black" style={{ fontSize: "16px", fontWeight: "700" }}>
                <span>{t.branch}</span>
                <span className="text-red-500 font-bold ml-1">*</span>
              </label>

              <div className="space-y-2.5">
                {[
                  {
                    id: 40,
                    name: t.branch40Title,
                    desc: t.branch40Sub,
                  },
                  {
                    id: 240,
                    name: t.branch240Title,
                    desc: t.branch240Sub,
                  },
                ].map((branch) => {
                  const isSelected = locationId === branch.id;
                  return (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => handleSelectLocation(branch.id)}
                      className={`w-full p-4 rounded-2xl border text-left rtl:text-right transition-all cursor-pointer flex items-center justify-between active:scale-[0.99] ${
                        isSelected
                          ? "bg-gray-100 border-2 border-black shadow-xs"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-black" style={{ fontSize: "17px", fontWeight: "700" }}>
                          {branch.name}
                        </h4>
                        <p style={{ fontSize: "14px", color: "var(--ink-secondary)", fontWeight: "400" }}>
                          {branch.desc}
                        </p>
                      </div>
                      <div className="shrink-0 ltr:ml-3 rtl:mr-3">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-black" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: APPOINTMENT DATE SELECTION (Calendar + Actual Dates from API) */}
            <div
              ref={dateRef}
              className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-black" style={{ fontSize: "16px", fontWeight: "700" }}>
                  <FaCalendarAlt className="text-gray-400 text-sm" />
                  <span>
                    {t.dateLabel}
                    <span className="text-red-500 font-bold ml-1">*</span>
                  </span>
                </h3>

                {datesLoading && (
                  <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                    <FaSpinner className="animate-spin text-xs" /> Loading...
                  </span>
                )}
              </div>

              {/* View Toggle: Quick Dates vs Calendar View */}
              <div className="flex items-center justify-between bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCalendarViewMode("quick")}
                  style={{ fontSize: "14px", fontWeight: "600" }}
                  className={`pill-btn flex-1 py-2 px-2.5 rounded-lg transition-all cursor-pointer ${
                    calendarViewMode === "quick"
                      ? "bg-white text-black shadow-xs font-bold"
                      : "text-gray-500 hover:text-black font-semibold"
                  }`}
                >
                  {t.quickDates}
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarViewMode("full")}
                  style={{ fontSize: "14px", fontWeight: "600" }}
                  className={`pill-btn flex-1 py-2 px-2.5 rounded-lg transition-all cursor-pointer ${
                    calendarViewMode === "full"
                      ? "bg-white text-black shadow-xs font-bold"
                      : "text-gray-500 hover:text-black font-semibold"
                  }`}
                >
                  {t.fullCalendar}
                </button>
              </div>

              {/* QUICK DATES STRIP (Only actual dates returned from API) */}
              {calendarViewMode === "quick" && (
                <div className="space-y-2">
                  {datesLoading && availableDates.length === 0 ? (
                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                      {[1, 2, 3, 4, 5, 6].map((idx) => (
                        <div
                          key={idx}
                          className="min-w-[62px] sm:min-w-[68px] h-[78px] rounded-2xl bg-gray-100 animate-pulse border border-gray-200 shrink-0"
                        />
                      ))}
                    </div>
                  ) : availableDates.length === 0 ? (
                    <div className="text-center py-4 text-xs font-medium text-gray-400">
                      No dates returned from system.
                    </div>
                  ) : (
                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                      {availableDates.map((dateStr) => {
                        const [y, m, d] = dateStr.split("-").map(Number);
                        const dateObj = new Date(y, m - 1, d);
                        const dayName = t.days[dateObj.getDay()] || "Fri";
                        const isSelected = selectedDate === dateStr;

                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => handleSelectDate(dateStr)}
                            className={`date-card-btn min-w-[64px] sm:min-w-[70px] py-3.5 px-2 rounded-2xl flex flex-col items-center justify-between text-center transition-all cursor-pointer shrink-0 active:scale-95 ${
                              isSelected
                                ? "bg-black text-white border-2 border-black shadow-xs"
                                : "bg-white border border-gray-200 hover:border-gray-400 text-black shadow-2xs"
                            }`}
                          >
                            <span
                              style={{ fontSize: "13px", fontWeight: "600" }}
                              className={isSelected ? "text-gray-300" : "text-gray-400"}
                            >
                              {dayName}
                            </span>
                            <span
                              style={{ fontSize: "24px", fontWeight: "700" }}
                              className="my-0.5 leading-tight"
                            >
                              {d}
                            </span>
                            <span
                              style={{ fontSize: "12px", fontWeight: "700" }}
                              className={isSelected ? "text-emerald-400" : "text-emerald-600"}
                            >
                              {t.available}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* FULL INTERACTIVE TOUCH CALENDAR (Actual Calendar Month) */}
              {calendarViewMode === "full" && (
                <InteractiveTouchCalendar
                  availableDates={availableDates}
                  selectedDate={selectedDate}
                  onSelectDate={(dt) => handleSelectDate(dt)}
                  lang={lang}
                />
              )}

              {/* Selected Date Indicator */}
              {selectedDate && (
                <div className="text-[11px] font-bold text-gray-500 text-center pt-0.5">
                  {t.selectedDatePrefix}{" "}
                  <span className="text-black font-extrabold bg-gray-100 px-2.5 py-0.5 rounded-md">
                    {selectedDate}
                  </span>
                </div>
              )}
            </div>

            {/* SECTION 3: TIME SELECTOR (Morning / Afternoon / Evening Tabs - Image 2) */}
            <div
              ref={timeRef}
              className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3.5"
            >
              {/* Header with light blue clock badge & Drop-off Time * */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FaClock className="text-sm" />
                  </div>
                  <h3
                    className="flex items-center gap-1 text-slate-900"
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                    }}
                  >
                    <span>{t.timeLabel}</span>
                    <span className="text-red-500 font-bold ml-0.5">*</span>
                  </h3>
                </div>

                {timesLoading && (
                  <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                    <FaSpinner className="animate-spin text-xs" /> Loading slots...
                  </span>
                )}
              </div>

              {/* MORNING / AFTERNOON / EVENING TABS CONTAINER (Image 2) */}
              <div className="bg-[#F0F5FA] border border-blue-100/70 p-1.5 rounded-2xl flex items-center gap-1.5">
                {[
                  {
                    key: "Morning",
                    label: t.morning,
                    icon: FaSun,
                    count: categorizedSlots.Morning.length,
                  },
                  {
                    key: "Afternoon",
                    label: t.afternoon,
                    icon: FaCloudSun,
                    count: categorizedSlots.Afternoon.length,
                  },
                  {
                    key: "Evening",
                    label: t.evening,
                    icon: FaMoon,
                    count: categorizedSlots.Evening.length,
                  },
                ].map((tab) => {
                  const isActive = activeTimeTab === tab.key;
                  const IconComp = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTimeTab(tab.key)}
                      className={`flex-1 py-2 sm:py-2.5 px-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 active:scale-97 ${
                        isActive
                          ? "bg-white border-2 border-black shadow-xs text-black"
                          : "bg-transparent border border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <IconComp
                          className={`text-xs ${
                            isActive ? "text-black" : "text-slate-400"
                          }`}
                        />
                        <span
                          style={{
                            fontSize: "15px",
                            fontWeight: isActive ? "700" : "600",
                          }}
                        >
                          {tab.label}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: isActive ? "700" : "500",
                        }}
                        className={isActive ? "text-black" : "text-slate-400"}
                      >
                        ({tab.count})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* SLOTS INSIDE THE SELECTED TAB */}
              {timesLoading ? (
                <div className="py-8 text-center text-xs text-gray-400 font-semibold flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin text-sm text-black" />
                  <span>{t.loadingSlots}</span>
                </div>
              ) : categorizedSlots[activeTimeTab].length === 0 ? (
                <div className="py-6 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded-xl p-4 border border-gray-200">
                  {t.noCategorySlots(
                    activeTimeTab === "Morning"
                      ? t.morning
                      : activeTimeTab === "Afternoon"
                      ? t.afternoon
                      : t.evening,
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-1">
                  {categorizedSlots[activeTimeTab].map((slot, sIdx) => {
                    const slotRaw =
                      typeof slot === "string" ? slot : slot.timeSlot;
                    const isSelected = selectedTimeSlot === slotRaw;
                    const displayTime = formatSlotDisplay(slotRaw);

                    return (
                      <button
                        key={`${activeTimeTab}-${sIdx}`}
                        type="button"
                        onClick={() => handleSelectTimeSlot(slotRaw)}
                        style={{ fontSize: "14.5px", fontWeight: "700" }}
                        className={`slot-btn py-3 px-2 rounded-xl text-center transition-all cursor-pointer active:scale-95 ${
                          isSelected
                            ? "bg-black text-white border-2 border-black shadow-xs ring-2 ring-black/10"
                            : "bg-white border border-gray-200 hover:border-gray-400 text-black shadow-2xs"
                        }`}
                      >
                        {displayTime}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TECHNICIAN NOTES (Trigger Link + Notes Textarea - Image 4) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowTechnicianNotes((prev) => !prev)}
                style={{ fontSize: "15px", fontWeight: "600" }}
                className="text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>
                  {showTechnicianNotes
                    ? t.hideTechnicianNotes
                    : t.addTechnicianNotes}
                </span>
              </button>

              {showTechnicianNotes && (
                <div className="mt-2.5 animate-in fade-in duration-200">
                  <textarea
                    rows="3"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder={t.technicianNotesPlaceholder}
                    style={{ fontSize: "14.5px" }}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 focus:border-black focus:bg-white rounded-xl font-medium text-black focus:outline-none resize-none transition-all placeholder:text-gray-400"
                  />
                </div>
              )}
            </div>

            {/* CONFIRM BOOKING BUTTON (Solid Black) */}
            <div ref={confirmButtonRef} className="pt-2">
              <button
                type="submit"
                disabled={
                  submitting ||
                  !plateNo.trim() ||
                  !selectedDate ||
                  !selectedTimeSlot
                }
                style={{ fontSize: "17px", fontWeight: "700" }}
                className="w-full py-4 px-6 bg-black hover:bg-gray-800 active:scale-[0.98] text-white rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin text-lg" />
                    <span>{t.confirmingBooking}</span>
                  </>
                ) : (
                  <span>{t.confirmBooking}</span>
                )}
              </button>
            </div>
          </form>
        </main>

        {/* Minimal Footer */}
        <footer className="py-3 text-center text-xs font-semibold text-gray-400 border-t border-gray-100">
          {t.poweredBy}
        </footer>

        {/* SUCCESS CONFIRMATION MODAL */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-200 animate-in zoom-in-95 duration-200">
              <div className="text-center space-y-2 pt-1">
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <FaCheckCircle className="text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-black tracking-tight">
                  {t.modalTitle}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {t.modalDesc}
                </p>
              </div>

              {/* Booking Summary Pass */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                    {t.apptDetails}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {t.confirmed}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                      {t.modalDate}
                    </span>
                    <span className="font-bold text-black text-xs">
                      {bookingResult?.submittedPayload?.startDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                      {t.modalTime}
                    </span>
                    <span className="font-bold text-black text-xs font-mono">
                      {formatSlotDisplay(
                        bookingResult?.submittedPayload?.dropOffTime,
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                      {t.modalPlate}
                    </span>
                    <span className="font-bold text-black font-mono text-xs">
                      {bookingResult?.submittedPayload?.licensePlateNo}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                      {t.modalDealership}
                    </span>
                    <span className="font-bold text-black text-xs">
                      #{bookingResult?.submittedPayload?.dealershipLocationId}
                    </span>
                  </div>
                </div>

                {customerFound?.name?.trim() ? (
                  <div className="pt-2.5 border-t border-gray-200">
                    <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                      {t.modalCustomer}
                    </span>
                    <span className="font-bold text-black text-xs truncate block">
                      {customerFound.name.trim()} ({phone})
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <a
                  href={
                    searchParams.get("return_url") ||
                    searchParams.get("redirect") ||
                    "https://wa.me/97180043359"
                  }
                  onClick={handleReturnToWhatsApp}
                  style={{ fontSize: "var(--font-lg)", fontWeight: "var(--weight-semibold)" }}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-97 text-white rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all border border-emerald-500 text-center"
                >
                  <FaWhatsapp className="text-xl" />
                  <span>{t.returnToWhatsApp}</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setSelectedTimeSlot("");
                  }}
                  className="pill-btn w-full py-2.5 bg-white hover:bg-gray-50 active:scale-98 text-gray-800 rounded-xl transition-all cursor-pointer border border-gray-200"
                >
                  {t.bookAnother}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
