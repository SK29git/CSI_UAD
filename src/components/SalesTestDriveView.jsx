import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch, executeRpaCase } from '../utils/api';
import { getBranchesForGroup } from '../data/brandModels';
import { 
  FaCar, 
  FaClock, 
  FaUser, 
  FaRedo, 
  FaSpinner, 
  FaCheckCircle, 
  FaSearch, 
  FaInfoCircle, 
  FaMapMarkerAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaFileAlt,
  FaPaperPlane,
  FaChevronRight,
  FaBan,
  FaTimes,
  FaCalendarCheck,
  FaExclamationTriangle
} from 'react-icons/fa';

export default function SalesTestDriveView() {
  const { 
    customer, 
    group: contextGroup,
    enquiryNumber: contextEnquiryNumber,
    enquiries: contextEnquiries,
    setEnquiryNumber: setContextEnquiryNumber
  } = useCustomer();

  const group = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || 'BMW');
  const customerNumber = customer?.customerNumber || "";

  // Enquiries list from customer object or context
  const customerEnquiries = (customer?.enquiries && Array.isArray(customer.enquiries) && customer.enquiries.length > 0)
    ? customer.enquiries
    : (contextEnquiries && Array.isArray(contextEnquiries) && contextEnquiries.length > 0)
      ? contextEnquiries
      : [];

  const urlEnquiry = (new URLSearchParams(window.location.search).get('enquiryNumber') || new URLSearchParams(window.location.search).get('enquiry') || "");
  const initialEnquiry = customer?.enquiryNumber 
    || (customerEnquiries[0] && customerEnquiries[0].enquiryNumber)
    || contextEnquiryNumber 
    || urlEnquiry 
    || "";

  const [activeTab, setActiveTab] = useState("bookings"); // "bookings" | "fleet"
  const [filterMode, setFilterMode] = useState("enquiry"); // "enquiry" | "customer"
  const [selectedEnquiry, setSelectedEnquiry] = useState(initialEnquiry);
  const [searchEnquiryInput, setSearchEnquiryInput] = useState("");
  
  const [testDrives, setTestDrives] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [fleetSearch, setFleetSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Search/Lookup Booking state & Details Card
  const [searchBookingInput, setSearchBookingInput] = useState("");
  const [activeBookingDetails, setActiveBookingDetails] = useState(null);
  const [activeDetailType, setActiveDetailType] = useState('details'); // 'details' | 'confirmation'
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Active Booking for Reschedule / Cancel
  const [activeBookingForAction, setActiveBookingForAction] = useState(null);

  // Modals Open State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [showroomModalOpen, setShowroomModalOpen] = useState(false);

  // Reschedule Form Fields (RPA: RESCHEDULE_DEMO_VEHICLE)
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStartTime, setRescheduleStartTime] = useState("10:00");
  const [rescheduleEndTime, setRescheduleEndTime] = useState("10:30");
  const [rescheduleBranch, setRescheduleBranch] = useState("");
  const [rescheduleEnquiryId, setRescheduleEnquiryId] = useState("");
  const [rescheduleModel, setRescheduleModel] = useState("");

  // Cancel Form Fields (RPA: CANCEL_DEMO_VEHICLE)
  const [cancelReason, setCancelReason] = useState("Customer requested cancellation");
  const [cancelCustomReason, setCancelCustomReason] = useState("");
  const [cancelEnquiryId, setCancelEnquiryId] = useState("");

  // Book Demo Vehicle Form Fields (RPA: BOOK_DEMO_VEHICLE)
  const [bookEnquiryId, setBookEnquiryId] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [bookStartTime, setBookStartTime] = useState("10:00");
  const [bookEndTime, setBookEndTime] = useState("10:30");
  const [bookBranch, setBookBranch] = useState("");
  const [bookManufacturer, setBookManufacturer] = useState("");
  const [bookModel, setBookModel] = useState("");

  // Book Showroom Appointment Form Fields (RPA: BOOK_SHOWROOM_APPOINTMENT)
  const [showroomEnquiryId, setShowroomEnquiryId] = useState("");
  const [showroomDate, setShowroomDate] = useState("");
  const [showroomTime, setShowroomTime] = useState("11:00");
  const [showroomBranch, setShowroomBranch] = useState("");
  const [showroomManufacturer, setShowroomManufacturer] = useState("");

  // RPA Execution State & Notification Banner
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionProgressStatus, setActionProgressStatus] = useState(null);
  const [actionToast, setActionToast] = useState(null);

  // Synchronize active enquiry when customer or context updates
  useEffect(() => {
    const active = customer?.enquiryNumber 
      || (customer?.enquiries && customer.enquiries[0]?.enquiryNumber) 
      || contextEnquiryNumber 
      || urlEnquiry 
      || "";
    if (active && (!selectedEnquiry || !customerEnquiries.some(e => String(e.enquiryNumber) === String(selectedEnquiry)))) {
      setSelectedEnquiry(active);
    }
  }, [customer, contextEnquiryNumber, urlEnquiry]);

  const formatVehicleDisplay = (v) => {
    if (!v) return 'N/A';
    if (typeof v === 'string') return v;
    if (typeof v === 'object') {
      if (v.description) return v.description;
      const name = `${v.brand || ''} ${v.model || ''}`.trim();
      if (name) return name;
      if (v.vehicleNumber) return `Vehicle #${v.vehicleNumber}`;
      if (v.registrationNumber) return `Reg: ${v.registrationNumber}`;
      return 'Vehicle Details';
    }
    return String(v);
  };

  const renderSafeVal = (val, fallback = 'N/A') => {
    if (val === null || val === undefined || val === '') return fallback;
    if (typeof val === 'object') {
      if (val.name) return val.name;
      if (val.description) return val.description;
      if (val.code) return String(val.code);
      return fallback;
    }
    const str = String(val).trim();
    if (str === '{}' || str === '[]' || str === '') return fallback;
    return str;
  };

  // 1. Fetch Bookings and Fleet according to Keyloop APIs
  const fetchTestDrives = async (overrideEnquiry = null, overrideFilter = null) => {
    setLoading(true);
    const mode = overrideFilter !== null ? overrideFilter : filterMode;
    const enqToQuery = overrideEnquiry !== null 
      ? overrideEnquiry 
      : (selectedEnquiry || customer?.enquiryNumber || (customerEnquiries[0] && customerEnquiries[0].enquiryNumber) || contextEnquiryNumber || urlEnquiry || "");

    try {
      // 1.1 Fetch available demo vehicles: GET /api/v1/test-drives/vehicles?group={{group}}
      const slotsUrl = `/api/v1/test-drives/vehicles?group=${encodeURIComponent(group)}`;
      apiFetch(slotsUrl).then(res => {
        if (res && res.ok && Array.isArray(res.data)) {
          setAvailableSlots(res.data);
        } else {
          setAvailableSlots([]);
        }
      }).catch(() => setAvailableSlots([]));

      // 1.2 Fetch bookings based on active filter mode
      let bookings = [];
      if (mode === 'customer' && customerNumber) {
        const custUrl = `/api/v1/test-drives/customer/${encodeURIComponent(group)}/${encodeURIComponent(customerNumber)}`;
        const custRes = await apiFetch(custUrl);
        if (custRes && custRes.ok && Array.isArray(custRes.data)) {
          bookings = custRes.data;
        }
      } else if (enqToQuery) {
        const enqUrl = `/api/v1/test-drives/${encodeURIComponent(group)}/enquiry/${encodeURIComponent(enqToQuery)}`;
        const enqRes = await apiFetch(enqUrl);
        if (enqRes && enqRes.ok && Array.isArray(enqRes.data)) {
          bookings = enqRes.data;
        }
      }

      if (bookings.length === 0 && !enqToQuery && customerNumber) {
        const fallbackUrl = `/api/v1/test-drives/customer/${encodeURIComponent(group)}/${encodeURIComponent(customerNumber)}`;
        const custRes = await apiFetch(fallbackUrl);
        if (custRes && custRes.ok && Array.isArray(custRes.data)) {
          bookings = custRes.data;
        }
      }

      setTestDrives(bookings);
    } catch (err) {
      console.warn("Failed to fetch test drive bookings:", err);
      setTestDrives([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestDrives();
  }, [group, selectedEnquiry, customerNumber, filterMode]);

  // 2. Fetch specific Booking Details or Confirmation Communication
  const fetchBookingAction = async (bookingNo, type = 'details') => {
    if (!bookingNo) return;
    setDetailsLoading(true);
    setActiveDetailType(type);

    try {
      const url = type === 'confirmation'
        ? `/api/v1/test-drives/${encodeURIComponent(group)}/${encodeURIComponent(bookingNo)}/confirmation`
        : `/api/v1/test-drives/${encodeURIComponent(group)}/${encodeURIComponent(bookingNo)}`;
      
      const res = await apiFetch(url);
      if (res && res.ok && res.data) {
        setActiveBookingDetails({
          bookingNo,
          type,
          data: res.data,
          ok: true
        });

        // Add to local state if missing
        if (res.data.bookingId || res.data.bookingNumber) {
          setTestDrives(prev => {
            const bId = String(res.data.bookingId || res.data.bookingNumber);
            const exists = prev.some(b => String(b.bookingId || b.bookingNumber || b.id) === bId);
            return exists ? prev : [res.data, ...prev];
          });
        }
      } else {
        setActiveBookingDetails({
          bookingNo,
          type,
          error: res?.data?.message || res?.statusText || `No booking records found for #${bookingNo}`,
          ok: false
        });
      }
    } catch (err) {
      setActiveBookingDetails({
        bookingNo,
        type,
        error: err.message || "Failed to load booking information",
        ok: false
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSelectEnquiryBadge = (enquiryId) => {
    setSelectedEnquiry(enquiryId);
    setFilterMode('enquiry');
    if (setContextEnquiryNumber) setContextEnquiryNumber(enquiryId);
    fetchTestDrives(enquiryId, 'enquiry');
  };

  const handleEnquirySearchSubmit = (e) => {
    e.preventDefault();
    const clean = searchEnquiryInput.trim();
    if (clean) {
      setSelectedEnquiry(clean);
      setFilterMode('enquiry');
      if (setContextEnquiryNumber) setContextEnquiryNumber(clean);
      fetchTestDrives(clean, 'enquiry');
    }
  };

  const handleLookupBookingSubmit = (e) => {
    e.preventDefault();
    const clean = searchBookingInput.trim();
    if (clean) {
      fetchBookingAction(clean, 'details');
    }
  };

  // ------------------------------------------------------------------------
  // RPA ACTIONS HANDLERS
  // ------------------------------------------------------------------------

  // 1. Reschedule Test Drive Modal Open
  const handleOpenReschedule = (booking) => {
    setActiveBookingForAction(booking);
    const enqId = String(booking.enquiryNumber || booking.enquiryId || selectedEnquiry || (customerEnquiries[0] && customerEnquiries[0].enquiryNumber) || '');
    setRescheduleEnquiryId(enqId);
    
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const bDate = booking.slot?.startDate || booking.date || tomorrow;
    setRescheduleDate(bDate);
    
    const existingTime = booking.slot?.startAt 
      ? new Date(booking.slot.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      : (booking.time || "10:00");
    setRescheduleStartTime(existingTime);
    setRescheduleEndTime("10:30");

    const dynamicGroup = group || customer?.keyloopGroup || 'BMW';
    const branches = getBranchesForGroup(dynamicGroup);
    const bookingBranchStr = typeof booking.branch === 'object' ? (booking.branch.name || booking.branch.code || '') : String(booking.branch || '');
    const matchedBranch = branches.find(b => b.name === bookingBranchStr || b.code === bookingBranchStr || `${b.code} - ${b.name}` === bookingBranchStr);
    setRescheduleBranch(matchedBranch 
      ? `${matchedBranch.code} - ${matchedBranch.name}` 
      : (branches[0] ? `${branches[0].code} - ${branches[0].name}` : '10 - Sheikh Zayed Rd'));
    
    setRescheduleModel(booking.vehicle?.model || booking.model || '');
    setActionProgressStatus(null);
    setActionToast(null);
    setRescheduleModalOpen(true);
  };

  // Confirm Reschedule (RPA: RESCHEDULE_DEMO_VEHICLE)
  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleEnquiryId.trim()) {
      setActionToast({ isError: true, message: "Enquiry ID is required to reschedule test drive." });
      return;
    }
    if (!rescheduleDate) {
      setActionToast({ isError: true, message: "Please select a valid date." });
      return;
    }

    setActionSubmitting(true);
    setActionProgressStatus('QUEUED');
    setActionToast(null);

    const startAt = `${rescheduleDate}T${rescheduleStartTime}:00`;
    const endAt = `${rescheduleDate}T${rescheduleEndTime}:00`;
    const dynamicGroup = group || customer?.keyloopGroup || 'BMW';

    const payload = {
      enquiryId: rescheduleEnquiryId.trim(),
      group: dynamicGroup,
      startAt,
      endAt,
      branch: rescheduleBranch,
      vehicleId: "",
      manufacturer: dynamicGroup,
      model: rescheduleModel || ""
    };

    try {
      const result = await executeRpaCase("RESCHEDULE_DEMO_VEHICLE", payload, {
        createdBy: "genesys",
        callbackUrl: "http://localhost:9999/hook",
        onProgress: (status) => setActionProgressStatus(status)
      });

      setActionToast({
        isError: false,
        message: `Test drive successfully rescheduled for ${rescheduleDate} at ${rescheduleStartTime}!`,
        taskId: result?.taskId
      });

      // Update local test drive booking row
      const targetId = String(activeBookingForAction?.bookingId || activeBookingForAction?.bookingNumber || activeBookingForAction?.id);
      setTestDrives(prev => prev.map(item => {
        const id = String(item.bookingId || item.bookingNumber || item.id);
        if (id === targetId) {
          return {
            ...item,
            date: rescheduleDate,
            time: rescheduleStartTime,
            slot: {
              ...(item.slot || {}),
              startDate: rescheduleDate,
              startAt,
              endAt
            }
          };
        }
        return item;
      }));

      setTimeout(() => {
        setRescheduleModalOpen(false);
        fetchTestDrives();
      }, 1500);
    } catch (err) {
      console.error("Reschedule RPA error:", err);
      setActionToast({
        isError: true,
        message: err.message || "Failed to reschedule test drive via Keyloop RPA."
      });
    } finally {
      setActionSubmitting(false);
    }
  };

  // 2. Cancel Test Drive Modal Open
  const handleOpenCancel = (booking) => {
    setActiveBookingForAction(booking);
    const enqId = String(booking.enquiryNumber || booking.enquiryId || selectedEnquiry || (customerEnquiries[0] && customerEnquiries[0].enquiryNumber) || '');
    setCancelEnquiryId(enqId);
    setCancelReason("Customer requested cancellation");
    setCancelCustomReason("");
    setActionProgressStatus(null);
    setActionToast(null);
    setCancelModalOpen(true);
  };

  // Confirm Cancellation (RPA: CANCEL_DEMO_VEHICLE)
  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancelEnquiryId.trim()) {
      setActionToast({ isError: true, message: "Enquiry ID is required to cancel test drive." });
      return;
    }

    setActionSubmitting(true);
    setActionProgressStatus('QUEUED');
    setActionToast(null);

    const dynamicGroup = group || customer?.keyloopGroup || 'BMW';
    const finalReason = cancelReason === 'Other / Custom reason'
      ? (cancelCustomReason || 'Customer requested cancellation')
      : (cancelCustomReason ? `${cancelReason} - ${cancelCustomReason}` : cancelReason);

    const payload = {
      enquiryId: cancelEnquiryId.trim(),
      group: dynamicGroup,
      reason: finalReason
    };

    try {
      const result = await executeRpaCase("CANCEL_DEMO_VEHICLE", payload, {
        createdBy: "genesys",
        callbackUrl: "http://localhost:9999/hook",
        onProgress: (status) => setActionProgressStatus(status)
      });

      setActionToast({
        isError: false,
        message: `Test drive booking successfully cancelled in Keyloop!`,
        taskId: result?.taskId
      });

      const targetId = String(activeBookingForAction?.bookingId || activeBookingForAction?.bookingNumber || activeBookingForAction?.id);
      setTestDrives(prev => prev.map(item => {
        const id = String(item.bookingId || item.bookingNumber || item.id);
        if (id === targetId) {
          return {
            ...item,
            status: 'CANCELLED',
            outcome: 'CANCELLED'
          };
        }
        return item;
      }));

      setTimeout(() => {
        setCancelModalOpen(false);
        fetchTestDrives();
      }, 1500);
    } catch (err) {
      console.error("Cancel RPA error:", err);
      setActionToast({
        isError: true,
        message: err.message || "Failed to cancel test drive via Keyloop RPA."
      });
    } finally {
      setActionSubmitting(false);
    }
  };

  // 3. Book Demo Vehicle (RPA: BOOK_DEMO_VEHICLE)
  const handleOpenBook = (fleetSlot = null) => {
    const enqId = String(selectedEnquiry || (customerEnquiries[0] && customerEnquiries[0].enquiryNumber) || '');
    setBookEnquiryId(enqId);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setBookDate(tomorrow);
    setBookStartTime("10:00");
    setBookEndTime("10:30");

    const dynamicGroup = group || customer?.keyloopGroup || 'BMW';
    const branches = getBranchesForGroup(dynamicGroup);
    const defBranch = branches[0] ? `${branches[0].code} - ${branches[0].name}` : '10 - Sheikh Zayed Rd';
    setBookBranch(defBranch);
    setBookManufacturer(dynamicGroup);

    if (fleetSlot) {
      const veh = fleetSlot.vehicle || fleetSlot;
      setBookModel(veh.model || veh.description || '');
      if (fleetSlot.branch?.name) {
        const found = branches.find(b => b.name === fleetSlot.branch.name || b.code === fleetSlot.branch.code);
        if (found) setBookBranch(`${found.code} - ${found.name}`);
      }
    } else {
      setBookModel('');
    }

    setActionProgressStatus(null);
    setActionToast(null);
    setBookModalOpen(true);
  };

  const handleConfirmBook = async (e) => {
    e.preventDefault();
    if (!bookEnquiryId.trim()) {
      setActionToast({ isError: true, message: "Enquiry ID is required to book a demo vehicle." });
      return;
    }
    if (!bookDate) {
      setActionToast({ isError: true, message: "Please select a valid date." });
      return;
    }

    setActionSubmitting(true);
    setActionProgressStatus('QUEUED');
    setActionToast(null);

    const dynamicGroup = group || customer?.keyloopGroup || 'BMW';
    const startAt = `${bookDate}T${bookStartTime}:00`;
    const endAt = `${bookDate}T${bookEndTime}:00`;

    const payload = {
      enquiryId: bookEnquiryId.trim(),
      group: dynamicGroup,
      manufacturer: bookManufacturer || dynamicGroup,
      branch: bookBranch,
      startAt,
      endAt,
      model: bookModel || ""
    };

    try {
      const result = await executeRpaCase("BOOK_DEMO_VEHICLE", payload, {
        createdBy: "genesys",
        callbackUrl: "http://localhost:9999/hook",
        onProgress: (status) => setActionProgressStatus(status)
      });

      const bookingId = result?.result?.bookingId || result?.result?.bookingNumber || result?.taskId || `TD-${Date.now().toString().slice(-4)}`;
      const newBooking = {
        bookingId: String(bookingId),
        bookingNumber: String(bookingId),
        enquiryNumber: bookEnquiryId,
        enquiryId: bookEnquiryId,
        group: dynamicGroup,
        date: bookDate,
        time: `${bookStartTime} - ${bookEndTime}`,
        status: 'CONFIRMED',
        branch: bookBranch,
        vehicle: {
          manufacturer: bookManufacturer || dynamicGroup,
          model: bookModel || 'Demo Vehicle'
        },
        slot: {
          startDate: bookDate,
          startAt,
          endAt
        }
      };

      setTestDrives(prev => [newBooking, ...prev]);
      setActionToast({
        isError: false,
        message: `Demo vehicle booked successfully for ${bookDate} at ${bookStartTime}! (Booking #${bookingId})`,
        taskId: result?.taskId
      });
      setActiveTab('bookings');
      setTimeout(() => {
        setBookModalOpen(false);
      }, 2000);
    } catch (err) {
      console.error("Book Demo RPA error:", err);
      setActionToast({ isError: true, message: err.message || "Failed to book demo vehicle via Keyloop RPA." });
    } finally {
      setActionSubmitting(false);
    }
  };

  // 4. Book Showroom Appointment (RPA: BOOK_SHOWROOM_APPOINTMENT)
  const handleOpenShowroomAppt = (enqIdInput = null) => {
    const enqId = String(enqIdInput || selectedEnquiry || (customerEnquiries[0] && customerEnquiries[0].enquiryNumber) || '');
    setShowroomEnquiryId(enqId);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setShowroomDate(tomorrow);
    setShowroomTime("11:00");

    const dynamicGroup = group || customer?.keyloopGroup || 'BMW';
    const branches = getBranchesForGroup(dynamicGroup);
    const defBranch = branches[0] ? `${branches[0].code} - ${branches[0].name}` : '10 - Sheikh Zayed Rd';
    setShowroomBranch(defBranch);
    setShowroomManufacturer(dynamicGroup);

    setActionProgressStatus(null);
    setActionToast(null);
    setShowroomModalOpen(true);
  };

  const handleConfirmShowroomAppt = async (e) => {
    e.preventDefault();
    if (!showroomEnquiryId.trim()) {
      setActionToast({ isError: true, message: "Enquiry ID is required to book a showroom appointment." });
      return;
    }
    if (!showroomDate) {
      setActionToast({ isError: true, message: "Please select a valid date." });
      return;
    }

    setActionSubmitting(true);
    setActionProgressStatus('QUEUED');
    setActionToast(null);

    const dynamicGroup = group || customer?.keyloopGroup || 'BMW';
    const requestedAt = `${showroomDate}T${showroomTime}:00`;

    const payload = {
      enquiryId: showroomEnquiryId.trim(),
      group: dynamicGroup,
      manufacturer: showroomManufacturer || dynamicGroup,
      branch: showroomBranch,
      requestedAt
    };

    try {
      const result = await executeRpaCase("BOOK_SHOWROOM_APPOINTMENT", payload, {
        createdBy: "genesys",
        callbackUrl: "http://localhost:9999/hook",
        onProgress: (status) => setActionProgressStatus(status)
      });

      setActionToast({
        isError: false,
        message: `Showroom appointment booked successfully for ${showroomDate} at ${showroomTime}!`,
        taskId: result?.taskId
      });
      setTimeout(() => {
        setShowroomModalOpen(false);
      }, 2000);
    } catch (err) {
      console.error("Showroom Appt RPA error:", err);
      setActionToast({ isError: true, message: err.message || "Failed to book showroom appointment via Keyloop RPA." });
    } finally {
      setActionSubmitting(false);
    }
  };

  const filteredFleet = availableSlots.filter(s => {
    if (!fleetSearch) return true;
    const q = fleetSearch.toLowerCase();
    const desc = (s.vehicle?.description || s.description || '').toString().toLowerCase();
    const brand = (s.vehicle?.brand || s.brand || '').toString().toLowerCase();
    const reg = (s.vehicle?.registrationNumber || s.registrationNumber || '').toString().toLowerCase();
    const brName = (s.branch?.name || '').toString().toLowerCase();
    return desc.includes(q) || brand.includes(q) || reg.includes(q) || brName.includes(q);
  });

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4 text-xs">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <FaCar className="text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 leading-tight">Sales Test Drive & Demo Management</h2>
              <span className="bg-blue-50 text-blue-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-blue-200">
                {group}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium">
              Customer: <span className="font-bold text-gray-800">{customer?.fullName || 'Active Customer'}</span> 
              {customerNumber ? ` (#${customerNumber})` : ''}
              {selectedEnquiry ? (
                <span> | Active Enquiry: <strong className="text-blue-600 font-mono font-bold">#{selectedEnquiry}</strong></span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Enquiry Number Search Bar */}
          <form onSubmit={handleEnquirySearchSubmit} className="flex items-center gap-1.5">
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-[10px]" />
              <input
                type="text"
                value={searchEnquiryInput}
                onChange={(e) => setSearchEnquiryInput(e.target.value)}
                placeholder="Search Enquiry #..."
                className="pl-7 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs w-36 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!searchEnquiryInput.trim() || loading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              {loading ? <FaSpinner className="animate-spin text-xs" /> : 'Search'}
            </button>
          </form>

          {/* Lookup Booking Search Bar */}
          <form onSubmit={handleLookupBookingSubmit} className="flex items-center gap-1.5">
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-[10px]" />
              <input
                type="text"
                value={searchBookingInput}
                onChange={(e) => setSearchBookingInput(e.target.value)}
                placeholder="Lookup Booking #..."
                className="pl-7 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs w-36 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!searchBookingInput.trim() || detailsLoading}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              {detailsLoading ? <FaSpinner className="animate-spin text-xs" /> : 'Find'}
            </button>
          </form>

          <button
            onClick={() => fetchTestDrives()}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border border-gray-200 shadow-2xs"
            title="Refresh Test Drives"
          >
            <FaRedo className={`text-xs ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Customer Enquiries Quick Filter Bar */}
      {customerEnquiries.length > 0 && (
        <div className="bg-blue-50/60 border border-blue-100 p-2.5 rounded-xl flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
              <FaCalendarAlt className="text-xs text-blue-600" /> Customer Enquiries:
            </span>
            {customerEnquiries.map((enq, idx) => {
              const enqNo = String(enq.enquiryNumber || enq.id);
              const isSelected = String(selectedEnquiry) === enqNo;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectEnquiryBadge(enqNo)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'bg-white text-blue-800 hover:bg-blue-100 border border-blue-200'
                  }`}
                  title={`View test drives for Enquiry #${enqNo}`}
                >
                  <span>#{enqNo}</span>
                  {enq.status && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-sans uppercase font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-900'
                    }`}>
                      {enq.status}
                    </span>
                  )}
                  {enq.outcome && (
                    <span className={`text-[9px] px-1 py-0.2 rounded font-sans uppercase font-bold ${
                      isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {enq.outcome}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedEnquiry && (
            <span className="text-[11px] font-medium text-blue-900 bg-white px-2.5 py-1 rounded-lg border border-blue-200 font-mono">
              Filtered by Enquiry: <strong>#{selectedEnquiry}</strong>
            </span>
          )}
        </div>
      )}

      {/* Main Navigation Tabs & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === "bookings"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FaClock className="text-xs" />
            <span>Test Drive Bookings</span>
            {testDrives.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === "bookings" ? "bg-white/30 text-white" : "bg-blue-100 text-blue-800"
              }`}>
                {testDrives.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("fleet")}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === "fleet"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FaCar className="text-xs" />
            <span>Showroom Demo Fleet</span>
            {availableSlots.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === "fleet" ? "bg-white/30 text-white" : "bg-gray-200 text-gray-700"
              }`}>
                {availableSlots.length}
              </span>
            )}
          </button>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleOpenBook(null)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Book a new demo vehicle test drive via Keyloop RPA"
          >
            <FaCalendarAlt className="text-xs" />
            <span>+ Book Test Drive</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenShowroomAppt(selectedEnquiry)}
            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Schedule a showroom appointment via Keyloop RPA"
          >
            <FaUser className="text-xs" />
            <span>+ Showroom Appt</span>
          </button>

          {activeTab === "bookings" && (
            <div className="flex items-center gap-2 flex-wrap pl-2 border-l border-gray-200">
              <span className="text-[11px] text-gray-500 font-semibold">Filter:</span>
              {selectedEnquiry && (
                <button
                  onClick={() => { setFilterMode('enquiry'); fetchTestDrives(selectedEnquiry, 'enquiry'); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer ${
                    filterMode === 'enquiry' 
                      ? 'bg-blue-600 text-white shadow-2xs' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Enquiry #{selectedEnquiry}
                </button>
              )}
              {customerNumber && (
                <button
                  onClick={() => { setFilterMode('customer'); fetchTestDrives(null, 'customer'); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    filterMode === 'customer' 
                      ? 'bg-blue-600 text-white shadow-2xs' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Customer (#{customerNumber})
                </button>
              )}
            </div>
          )}

          {activeTab === "fleet" && (
            <div className="relative">
              <input
                type="text"
                value={fleetSearch}
                onChange={(e) => setFleetSearch(e.target.value)}
                placeholder="Search demo fleet..."
                className="pl-3 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs w-48 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: TEST DRIVE BOOKINGS */}
      {activeTab === "bookings" && (
        <div className="flex flex-col gap-4">

          {/* Action Notification Toast */}
          {actionToast && (
            <div className={`p-3 rounded-xl flex items-center justify-between border shadow-2xs animate-fade-in ${
              actionToast.isError
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  actionToast.isError ? 'bg-rose-600' : 'bg-emerald-600'
                }`}>
                  {actionToast.isError ? '✕' : '✓'}
                </div>
                <div>
                  <span className="font-bold block text-xs">{actionToast.message}</span>
                  {actionToast.taskId && (
                    <span className="text-[10px] font-mono text-emerald-700 block">RPA Task ID: #{actionToast.taskId}</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActionToast(null)}
                className="text-xs font-bold text-gray-400 hover:text-gray-700 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Single Booking Details Card */}
          {activeBookingDetails && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs">
                    {activeBookingDetails.type === 'confirmation' ? <FaPaperPlane className="text-[10px]" /> : <FaFileAlt className="text-[10px]" />}
                  </div>
                  <h3 className="font-bold text-gray-900 text-xs">
                    {activeBookingDetails.type === 'confirmation' ? 'Booking Confirmation Communication' : 'Booking Details'} — Booking #{activeBookingDetails.bookingNo}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {activeBookingDetails.ok && (
                    <div className="flex items-center bg-white rounded-lg p-0.5 border border-gray-200 shadow-2xs">
                      <button
                        onClick={() => fetchBookingAction(activeBookingDetails.bookingNo, 'details')}
                        disabled={detailsLoading}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          activeBookingDetails.type === 'details' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Details
                      </button>
                      <button
                        onClick={() => fetchBookingAction(activeBookingDetails.bookingNo, 'confirmation')}
                        disabled={detailsLoading}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          activeBookingDetails.type === 'confirmation' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Confirmation
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setActiveBookingDetails(null)}
                    className="w-6 h-6 rounded-md bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-200 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors shadow-2xs"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {activeBookingDetails.error ? (
                <div className="p-3 bg-white rounded-lg border border-rose-200 text-rose-700 text-xs font-medium">
                  {activeBookingDetails.error}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {activeBookingDetails.data.customerName && (
                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
                      <span className="text-[10px] text-gray-400 block font-bold uppercase">Customer</span>
                      <span className="font-bold text-gray-900 text-xs">{activeBookingDetails.data.customerName}</span>
                      <span className="text-[10px] text-gray-500 block">Cust #{activeBookingDetails.data.customerNumber || 'N/A'}</span>
                    </div>
                  )}

                  {activeBookingDetails.data.advisor && (
                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
                      <span className="text-[10px] text-gray-400 block font-bold uppercase">Sales Advisor</span>
                      <span className="font-bold text-gray-800 text-xs">{renderSafeVal(activeBookingDetails.data.advisor?.name || activeBookingDetails.data.advisor)}</span>
                      {activeBookingDetails.data.advisor?.email && (
                        <span className="text-[10px] text-gray-500 block truncate">{activeBookingDetails.data.advisor.email}</span>
                      )}
                    </div>
                  )}

                  <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">Booking Status</span>
                    <span className="font-bold text-emerald-700 text-xs">{renderSafeVal(activeBookingDetails.data.status || 'Active')}</span>
                    {activeBookingDetails.data.outcome && (
                      <span className="text-[10px] text-gray-500 block">Outcome: {activeBookingDetails.data.outcome}</span>
                    )}
                  </div>

                  {activeBookingDetails.data.slot && (
                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
                      <span className="text-[10px] text-gray-400 block font-bold uppercase">Scheduled Slot</span>
                      <span className="font-mono font-bold text-gray-800 text-xs">
                        {activeBookingDetails.data.slot.startDate || activeBookingDetails.data.slot.startAt?.slice(0, 10) || 'Scheduled'}
                      </span>
                      <span className="text-[10px] text-gray-500 block">Location: {activeBookingDetails.data.slot.location || 'Showroom'}</span>
                    </div>
                  )}

                  {activeBookingDetails.data.vehicle && (
                    <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs col-span-2">
                      <span className="text-[10px] text-gray-400 block font-bold uppercase">Test Drive Vehicle</span>
                      <span className="font-bold text-gray-900 text-xs block">{formatVehicleDisplay(activeBookingDetails.data.vehicle)}</span>
                      {activeBookingDetails.data.vehicle?.registrationNumber && (
                        <span className="text-[10px] font-mono text-gray-500">Reg: {activeBookingDetails.data.vehicle.registrationNumber}</span>
                      )}
                    </div>
                  )}

                  {/* Confirmation Communication Fields */}
                  {activeBookingDetails.type === 'confirmation' && (
                    <>
                      <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">Confirmation ID</span>
                        <span className="font-mono text-blue-700 font-bold text-xs">{activeBookingDetails.data.messageId || 'N/A'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">Delivery Status</span>
                        <span className="font-bold text-emerald-700 text-xs">{activeBookingDetails.data.deliveryStatus || activeBookingDetails.data.status || 'Sent'}</span>
                        <span className="text-[10px] text-gray-500 block">{activeBookingDetails.data.timestamp ? new Date(activeBookingDetails.data.timestamp).toLocaleString() : 'Delivered'}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Test Drive Bookings Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs bg-white">
            <div className="p-3 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-xs">
                {filterMode === 'customer' 
                  ? `Customer Test Drive Bookings (${testDrives.length})` 
                  : (selectedEnquiry ? `Enquiry #${selectedEnquiry} Test Drive Bookings (${testDrives.length})` : `All Test Drive Bookings (${testDrives.length})`)}
              </h3>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                <FaSpinner className="animate-spin text-2xl text-blue-600" />
                <span className="text-xs font-medium">Loading test drive bookings...</span>
              </div>
            ) : testDrives.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-white flex flex-col items-center gap-2">
                <FaCar className="text-3xl text-gray-300" />
                <span className="font-semibold text-gray-700">No Test Drive Bookings Found</span>
                <span className="text-xs text-gray-400 max-w-sm">
                  {filterMode === 'customer'
                    ? `No test drive bookings found for Customer #${customerNumber || 'N/A'}.`
                    : `No test drive bookings found for Enquiry #${selectedEnquiry || 'N/A'}.`}
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenBook(null)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <FaCalendarAlt className="text-xs" />
                    <span>Book New Demo Vehicle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenShowroomAppt(selectedEnquiry)}
                    className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <FaUser className="text-xs" />
                    <span>Book Showroom Appointment</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3 px-3 bg-slate-100">Booking #</th>
                      <th className="py-3 px-3 bg-slate-100">Enquiry #</th>
                      <th className="py-3 px-3 bg-slate-100">Demo Vehicle</th>
                      <th className="py-3 px-3 bg-slate-100">Date & Time</th>
                      <th className="py-3 px-3 bg-slate-100">Branch</th>
                      <th className="py-3 px-3 bg-slate-100">Advisor</th>
                      <th className="py-3 px-3 bg-slate-100">Status</th>
                      <th className="py-3 px-3 text-right bg-slate-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
                    {testDrives.map((row, idx) => {
                      const bookingNo = row.bookingId || row.bookingNumber || row.id || `TD-${idx+1}`;
                      const vehicleName = formatVehicleDisplay(row.vehicle || row.description || row);
                      const slotDate = row.slot?.startDate || row.date || 'N/A';
                      const slotTime = row.slot?.startAt ? new Date(row.slot.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (row.time || '');
                      const branchText = row.branch?.name || row.branch?.code || (typeof row.branch === 'string' && row.branch !== '{}' ? row.branch : '') || 'Showroom';
                      const advisorText = row.advisor?.name || row.advisor?.code || (typeof row.advisor === 'string' && row.advisor !== '{}' ? row.advisor : '') || 'Assigned Advisor';

                      return (
                        <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-blue-600">
                            <button
                              onClick={() => fetchBookingAction(String(bookingNo), 'details')}
                              className="hover:underline text-left cursor-pointer"
                              title="View Booking Details"
                            >
                              #{bookingNo}
                            </button>
                          </td>
                          <td className="py-3 px-3 font-mono">
                            {row.enquiryNumber ? (
                              <button
                                onClick={() => handleSelectEnquiryBadge(String(row.enquiryNumber))}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200 cursor-pointer font-bold text-[10px] inline-flex items-center gap-1 shadow-2xs"
                                title={`Filter by Enquiry #${row.enquiryNumber}`}
                              >
                                #{row.enquiryNumber}
                              </button>
                            ) : (
                              <span className="text-gray-400 font-normal text-[10px]">N/A</span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-bold text-gray-900 max-w-[200px] truncate" title={vehicleName}>
                            {vehicleName}
                          </td>
                          <td className="py-3 px-3 font-mono text-gray-600 whitespace-nowrap">
                            {slotDate} {slotTime}
                          </td>
                          <td className="py-3 px-3 text-gray-800 whitespace-nowrap">{renderSafeVal(branchText)}</td>
                          <td className="py-3 px-3 text-gray-800 whitespace-nowrap">{renderSafeVal(advisorText)}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.status === 'Complete' || row.status === 'CONFIRMED' || row.status === 'COMPLETED' || row.outcome === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : row.status === 'CANCELLED' || row.outcome === 'CANCELLED'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {renderSafeVal(row.status || row.outcome)}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                onClick={() => fetchBookingAction(String(bookingNo), 'details')}
                                className="px-2 py-0.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                                title="Read Booking Details"
                              >
                                Details
                              </button>
                              <button 
                                onClick={() => handleOpenReschedule(row)}
                                className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                                title="Reschedule Demo Booking via Keyloop RPA"
                              >
                                <FaClock className="text-[9px]" />
                                <span>Reschedule</span>
                              </button>
                              <button 
                                onClick={() => handleOpenCancel(row)}
                                className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[10px] font-bold cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                                title="Cancel Demo Booking via Keyloop RPA"
                              >
                                <FaBan className="text-[9px]" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: SHOWROOM DEMO FLEET VIEW */}
      {activeTab === "fleet" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
              <FaCar className="text-blue-600" /> Showroom Test Drive Demo Fleet ({filteredFleet.length} Vehicles)
            </h3>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <FaSpinner className="animate-spin text-2xl text-blue-600" />
              <span className="text-xs font-medium">Loading demo fleet...</span>
            </div>
          ) : filteredFleet.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No demo vehicles matching "{fleetSearch}".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[550px] overflow-y-auto pr-1">
              {filteredFleet.map((slot, idx) => {
                const veh = slot.vehicle || slot;
                const title = formatVehicleDisplay(veh);
                const reg = veh.registrationNumber || slot.registrationNumber;
                const vehNo = veh.vehicleNumber || slot.vehicleNumber;
                const branchName = slot.branch?.name || (slot.branch?.code ? `Branch ${slot.branch.code}` : 'Showroom');

                return (
                  <div 
                    key={idx} 
                    className="p-3.5 bg-white border border-gray-200 hover:border-blue-400 rounded-xl flex flex-col justify-between gap-2 hover:shadow-xs transition-all"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-mono font-bold border border-blue-100">
                          {slot.status || 'AVAILABLE'}
                        </span>
                        {veh.brand && (
                          <span className="text-[10px] text-gray-500 font-bold uppercase">{veh.brand}</span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-gray-900 text-xs leading-snug mt-1" title={title}>
                        {title}
                      </h4>
                      {reg && (
                        <span className="text-[10px] font-mono text-gray-600">Reg: {reg}</span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                      <span className="flex items-center gap-1 truncate" title={branchName}>
                        <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" /> 
                        <span className="truncate">{branchName}</span>
                      </span>
                      {vehNo && (
                        <span className="font-mono text-gray-400 flex-shrink-0">#{vehNo}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenBook(slot)}
                      className="w-full mt-2 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <FaCalendarAlt className="text-[10px]" />
                      <span>Book Demo Vehicle</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* 1. RESCHEDULE TEST DRIVE MODAL (Keyloop RPA: RESCHEDULE_DEMO_VEHICLE) */}
      {/* ================================================================ */}
      {rescheduleModalOpen && activeBookingForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <FaClock className="text-sm" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">Reschedule Test Drive</h3>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Booking #{activeBookingForAction.bookingId || activeBookingForAction.bookingNumber || activeBookingForAction.id} • Group: {group || 'BMW'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <form onSubmit={handleConfirmReschedule} className="p-5 flex flex-col gap-4 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Vehicle</span>
                  <span className="font-bold text-gray-900">
                    {formatVehicleDisplay(activeBookingForAction.vehicle || activeBookingForAction)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Current Slot</span>
                  <span className="font-mono text-blue-700 font-bold">
                    {activeBookingForAction.slot?.startDate || activeBookingForAction.date || 'Scheduled'} {activeBookingForAction.time || ''}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-gray-600 font-bold block mb-1">
                  Enquiry ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={rescheduleEnquiryId}
                  onChange={(e) => setRescheduleEnquiryId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-gray-600 font-bold block mb-1">
                    New Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full px-2 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-bold block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleStartTime}
                    onChange={(e) => setRescheduleStartTime(e.target.value)}
                    className="w-full px-2 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-bold block mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleEndTime}
                    onChange={(e) => setRescheduleEndTime(e.target.value)}
                    className="w-full px-2 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-600 font-bold block mb-1">
                  Branch Location <span className="text-rose-500">*</span>
                </label>
                <select
                  value={rescheduleBranch}
                  onChange={(e) => setRescheduleBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                >
                  {getBranchesForGroup(group || 'BMW').map(b => (
                    <option key={b.code} value={`${b.code} - ${b.name}`}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {actionSubmitting && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-xs text-blue-900 animate-pulse">
                  <FaSpinner className="animate-spin text-blue-600 text-sm shrink-0" />
                  <div className="flex-1">
                    <span className="font-bold">
                      {actionProgressStatus === 'QUEUED' && 'Reschedule case queued in RPA broker...'}
                      {actionProgressStatus === 'CLAIMED' && 'Autoline RPA bot updating booking in Keyloop...'}
                      {actionProgressStatus === 'COMPLETED' && 'Successfully rescheduled!'}
                      {!actionProgressStatus && 'Submitting reschedule case...'}
                    </span>
                    <span className="block text-[10px] text-blue-700">Connecting to Keyloop intake API</span>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={actionSubmitting}
                  onClick={() => setRescheduleModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold cursor-pointer text-xs shadow-2xs flex items-center gap-1.5"
                >
                  {actionSubmitting ? <FaSpinner className="animate-spin text-xs" /> : <FaCheckCircle className="text-xs" />}
                  <span>Confirm Reschedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 2. CANCEL TEST DRIVE MODAL (Keyloop RPA: CANCEL_DEMO_VEHICLE)     */}
      {/* ================================================================ */}
      {cancelModalOpen && activeBookingForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  <FaBan className="text-sm" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">Cancel Test Drive Booking</h3>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Booking #{activeBookingForAction.bookingId || activeBookingForAction.bookingNumber || activeBookingForAction.id} • Group: {group || 'BMW'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="p-5 flex flex-col gap-4 text-xs">
              <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-900">
                <FaExclamationTriangle className="text-rose-600 text-base shrink-0" />
                <span className="font-bold block">Are you sure you want to cancel this booking in Keyloop?</span>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Vehicle:</span>
                  <span className="font-bold text-gray-800">{formatVehicleDisplay(activeBookingForAction.vehicle || activeBookingForAction)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Scheduled:</span>
                  <span className="font-mono text-gray-800 font-bold">
                    {activeBookingForAction.slot?.startDate || activeBookingForAction.date || 'Scheduled'} {activeBookingForAction.time || ''}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-gray-600 font-bold block mb-1">
                  Enquiry ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={cancelEnquiryId}
                  onChange={(e) => setCancelEnquiryId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-800 focus:bg-white focus:border-rose-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-600 font-bold block mb-1">
                  Cancellation Reason <span className="text-rose-500">*</span>
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white focus:border-rose-600 focus:outline-none"
                >
                  <option value="Customer requested cancellation">Customer requested cancellation</option>
                  <option value="Customer not reachable / No show">Customer not reachable / No show</option>
                  <option value="Vehicle unavailable / Service maintenance">Vehicle unavailable / Service maintenance</option>
                  <option value="Customer decided on different vehicle">Customer decided on different vehicle</option>
                  <option value="Duplicate booking">Duplicate booking</option>
                  <option value="Other / Custom reason">Other / Custom reason</option>
                </select>
              </div>

              {cancelReason === 'Other / Custom reason' && (
                <div>
                  <label className="text-gray-600 font-bold block mb-1">
                    Custom Notes
                  </label>
                  <textarea
                    rows={2}
                    value={cancelCustomReason}
                    onChange={(e) => setCancelCustomReason(e.target.value)}
                    placeholder="Enter details for cancellation..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:bg-white focus:border-rose-600 focus:outline-none"
                  />
                </div>
              )}

              {actionSubmitting && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-900 animate-pulse">
                  <FaSpinner className="animate-spin text-rose-600 text-sm shrink-0" />
                  <div className="flex-1">
                    <span className="font-bold">
                      {actionProgressStatus === 'QUEUED' && 'Cancellation case queued in RPA broker...'}
                      {actionProgressStatus === 'CLAIMED' && 'Autoline RPA bot cancelling booking in Keyloop...'}
                      {actionProgressStatus === 'COMPLETED' && 'Successfully cancelled!'}
                      {!actionProgressStatus && 'Submitting cancellation case...'}
                    </span>
                    <span className="block text-[10px] text-rose-700">Connecting to Keyloop intake API</span>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={actionSubmitting}
                  onClick={() => setCancelModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer text-xs"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold cursor-pointer text-xs shadow-2xs flex items-center gap-1.5"
                >
                  {actionSubmitting ? <FaSpinner className="animate-spin text-xs" /> : <FaBan className="text-xs" />}
                  <span>Confirm Cancellation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 3. BOOK DEMO VEHICLE MODAL (Keyloop RPA: BOOK_DEMO_VEHICLE)       */}
      {/* ================================================================ */}
      {bookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <FaCar className="text-sm" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">Book Test Drive (Demo Vehicle)</h3>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Keyloop RPA • Group: {group || 'BMW'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBookModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <form onSubmit={handleConfirmBook} className="p-5 flex flex-col gap-4 text-xs">
              <div>
                <label className="text-gray-600 font-bold block mb-1">
                  Enquiry ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bookEnquiryId}
                  onChange={(e) => setBookEnquiryId(e.target.value)}
                  placeholder="e.g. 567984"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-600 font-bold block mb-1">
                    Manufacturer / Brand
                  </label>
                  <input
                    type="text"
                    value={bookManufacturer}
                    onChange={(e) => setBookManufacturer(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-bold block mb-1">
                    Model (Optional)
                  </label>
                  <input
                    type="text"
                    value={bookModel}
                    onChange={(e) => setBookModel(e.target.value)}
                    placeholder="e.g. X5 M (F95)"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-600 font-bold block mb-1">
                  Dealership Branch <span className="text-rose-500">*</span>
                </label>
                <select
                  value={bookBranch}
                  onChange={(e) => setBookBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                >
                  {getBranchesForGroup(group || 'BMW').map(b => (
                    <option key={b.code} value={`${b.code} - ${b.name}`}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-gray-600 font-bold block mb-1">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={bookDate}
                    onChange={(e) => setBookDate(e.target.value)}
                    className="w-full px-2 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-bold block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={bookStartTime}
                    onChange={(e) => setBookStartTime(e.target.value)}
                    className="w-full px-2 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-bold block mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={bookEndTime}
                    onChange={(e) => setBookEndTime(e.target.value)}
                    className="w-full px-2 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {actionSubmitting && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-xs text-blue-900 animate-pulse">
                  <FaSpinner className="animate-spin text-blue-600 text-sm shrink-0" />
                  <div className="flex-1">
                    <span className="font-bold">
                      {actionProgressStatus === 'QUEUED' && 'Booking case queued in RPA broker...'}
                      {actionProgressStatus === 'CLAIMED' && 'Autoline RPA bot registering demo booking in Keyloop...'}
                      {actionProgressStatus === 'COMPLETED' && 'Successfully booked!'}
                      {!actionProgressStatus && 'Submitting demo vehicle case...'}
                    </span>
                    <span className="block text-[10px] text-blue-700">Connecting to Keyloop intake API</span>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={actionSubmitting}
                  onClick={() => setBookModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold cursor-pointer text-xs shadow-2xs flex items-center gap-1.5"
                >
                  {actionSubmitting ? <FaSpinner className="animate-spin text-xs" /> : <FaCheckCircle className="text-xs" />}
                  <span>Confirm Test Drive Booking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 4. BOOK SHOWROOM APPOINTMENT MODAL (RPA: BOOK_SHOWROOM_APPT)     */}
      {/* ================================================================ */}
      {showroomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <FaUser className="text-sm" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">Book Showroom Appointment</h3>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Keyloop RPA • Group: {group || 'BMW'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowroomModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <form onSubmit={handleConfirmShowroomAppt} className="p-5 flex flex-col gap-4 text-xs">
              <div>
                <label className="text-gray-600 font-bold block mb-1">
                  Enquiry ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={showroomEnquiryId}
                  onChange={(e) => setShowroomEnquiryId(e.target.value)}
                  placeholder="e.g. 567983"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-800 focus:bg-white focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-600 font-bold block mb-1">
                  Manufacturer / Brand
                </label>
                <input
                  type="text"
                  value={showroomManufacturer}
                  onChange={(e) => setShowroomManufacturer(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:bg-white focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-600 font-bold block mb-1">
                  Showroom Branch <span className="text-rose-500">*</span>
                </label>
                <select
                  value={showroomBranch}
                  onChange={(e) => setShowroomBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white focus:border-purple-600 focus:outline-none"
                >
                  {getBranchesForGroup(group || 'BMW').map(b => (
                    <option key={b.code} value={`${b.code} - ${b.name}`}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-600 font-bold block mb-1">
                    Appointment Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={showroomDate}
                    onChange={(e) => setShowroomDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-600 font-bold block mb-1">
                    Requested Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={showroomTime}
                    onChange={(e) => setShowroomTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              {actionSubmitting && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-3 text-xs text-purple-900 animate-pulse">
                  <FaSpinner className="animate-spin text-purple-600 text-sm shrink-0" />
                  <div className="flex-1">
                    <span className="font-bold">
                      {actionProgressStatus === 'QUEUED' && 'Appointment case queued in RPA broker...'}
                      {actionProgressStatus === 'CLAIMED' && 'Autoline RPA bot scheduling showroom appointment in Keyloop...'}
                      {actionProgressStatus === 'COMPLETED' && 'Successfully scheduled!'}
                      {!actionProgressStatus && 'Submitting showroom appointment case...'}
                    </span>
                    <span className="block text-[10px] text-purple-700">Connecting to Keyloop intake API</span>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={actionSubmitting}
                  onClick={() => setShowroomModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold cursor-pointer text-xs shadow-2xs flex items-center gap-1.5"
                >
                  {actionSubmitting ? <FaSpinner className="animate-spin text-xs" /> : <FaCheckCircle className="text-xs" />}
                  <span>Confirm Showroom Appointment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
