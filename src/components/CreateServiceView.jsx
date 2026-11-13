import React, { useState, useEffect } from "react";
import { useCustomer } from "../context/CustomerContext";
import {
  createServiceRequestNotes,
  generateZofeurToken,
  createZofeurVendorBooking
} from "../utils/api";
import {
  FaWrench,
  FaFileAlt,
  FaPaperPlane,
  FaSpinner,
  FaExclamationCircle,
  FaBuilding,
  FaUserCheck,
  FaIdCard,
  FaCodeBranch,
  FaListUl,
  FaCar,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaHashtag,
  FaSyncAlt,
  FaCheckCircle,
} from "react-icons/fa";

export const SERVICE_REQUEST_REFERENCES = [
  { type: "IPE", label: "Inbound Parts Enq." },
  { type: "CMO", label: "Inbound other service Enq." },
  { type: "CMQ", label: "Inbound Quote - No Booking" },
  { type: "CALL0001", label: "Connected Drive" },
  { type: "CALL0002", label: "Service Contract" },
  { type: "CDRN", label: "CD Motorshow Renewal" },
  { type: "Z0000142", label: "A/C System Heath Check" },
  { type: "Z0000149", label: "Zofeur Pick Up / Drop Off" },
  { type: "DSCi", label: "DSCi Campaigns" },
];

export const BREAKDOWN_REFERENCES = [
  { type: "ES5", label: "Service mobile in progress" },
  { type: "ES3", label: "Recovery AGMC" },
  { type: "ES9", label: "Recovery AAA" },
];

export default function CreateServiceView({ mode = "other_request" }) {
  const isBreakdown = mode === "breakdown";
  const title = isBreakdown ? "Breakdown" : "Other Request";
  const activeReferences = isBreakdown ? BREAKDOWN_REFERENCES : SERVICE_REQUEST_REFERENCES;
  const {
    customer,
    currentGroup,
    group: contextGroup,
    getFormattedName,
    selectedVin,
    vehicleDetails,
    vehicles,
    currentMobile,
  } = useCustomer();

  // Prefilled customer details
  const group =
    contextGroup ||
    currentGroup ||
    customer?.keyloopGroup ||
    customer?.group ||
    new URLSearchParams(window.location.search).get("group") ||
    "BMW";

  const customerId =
    customer?.customerNumber || customer?.id || customer?.customerId || "";

  // Properly retrieve customer name using getFormattedName() or fallback fields
  const formattedName = getFormattedName ? getFormattedName() : "";
  const customerName =
    formattedName && formattedName !== "N/A" && formattedName !== "Unknown"
      ? formattedName
      : customer?.fullName ||
        [customer?.firstName, customer?.surname].filter(Boolean).join(" ") ||
        customer?.name ||
        customer?.customerName ||
        "";

  const branchCode =
    customer?.branchCode || customer?.branch || customer?.branch_code || "10";

  const advisorId =
    customer?.salesExecutiveId ||
    customer?.advisorId ||
    customer?.serviceAdvisorId ||
    null;

  // Editable fields state
  const [selectedReferences, setSelectedReferences] = useState([]);
  const [notes, setNotes] = useState("");

  const toggleReference = (type) => {
    setSelectedReferences((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  // Helper to extract clean mobile without country prefix
  const getCleanMobile = () => {
    const raw =
      currentMobile ||
      customer?.mobileRaw ||
      customer?.mobile ||
      customer?.mobilePhone ||
      customer?.phone ||
      new URLSearchParams(window.location.search).get("mobile") ||
      "";
    const digits = String(raw).replace(/\D/g, "");
    if (digits.startsWith("971")) return digits.slice(3);
    if (digits.startsWith("0")) return digits.slice(1);
    return digits;
  };

  // Helper to generate fresh random 6-digit booking ID for Zofeur
  const generateNewBookingId = () => Math.floor(100000 + Math.random() * 900000);

  // Breakdown fields
  const [zofeurCountryCode, setZofeurCountryCode] = useState("+971");
  const [zofeurPhoneNo, setZofeurPhoneNo] = useState(getCleanMobile);
  const [zofeurChassis, setZofeurChassis] = useState(() => {
    return selectedVin || vehicleDetails?.vin || vehicles?.[0]?.vin || customer?.vin || "";
  });
  const [zofeurPlate, setZofeurPlate] = useState(() => {
    return vehicleDetails?.registrationNumber || vehicles?.[0]?.registrationNumber || customer?.plateNumber || customer?.licensePlate || "";
  });
  const [zofeurBookingId, setZofeurBookingId] = useState(generateNewBookingId);

  // Latitudes and longitudes - kept blank for agent to input
  const [zofeurPickupLat, setZofeurPickupLat] = useState("");
  const [zofeurPickupLong, setZofeurPickupLong] = useState("");
  const [zofeurDropoffLat, setZofeurDropoffLat] = useState("");
  const [zofeurDropoffLong, setZofeurDropoffLong] = useState("");

  // Keep fields synced when customer/vehicle loads
  useEffect(() => {
    const cleanPhone = getCleanMobile();
    if (cleanPhone) {
      setZofeurPhoneNo(cleanPhone);
    }
    const vin = selectedVin || vehicleDetails?.vin || vehicles?.[0]?.vin || customer?.vin || "";
    if (vin) {
      setZofeurChassis(vin);
    }
    const plate = vehicleDetails?.registrationNumber || vehicles?.[0]?.registrationNumber || customer?.plateNumber || customer?.licensePlate || "";
    if (plate) {
      setZofeurPlate(plate);
    }
  }, [customer, currentMobile, selectedVin, vehicleDetails, vehicles]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successResult, setSuccessResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessResult(null);

    if (selectedReferences.length === 0) {
      setErrorMsg("Please select at least one Reference.");
      return;
    }

    if (!notes.trim()) {
      setErrorMsg("Please enter notes for the service request.");
      return;
    }

    if (isBreakdown) {
      if (!String(zofeurPhoneNo).trim()) {
        setErrorMsg("Phone number is required for breakdown recovery.");
        return;
      }
      if (!String(zofeurChassis).trim()) {
        setErrorMsg("Chassis number (VIN) is required for breakdown recovery.");
        return;
      }
      if (!String(zofeurPlate).trim()) {
        setErrorMsg("License plate number is required for breakdown recovery.");
        return;
      }
      if (!String(zofeurPickupLat).trim() || isNaN(parseFloat(zofeurPickupLat))) {
        setErrorMsg("Please enter a valid Pickup Latitude.");
        return;
      }
      if (!String(zofeurPickupLong).trim() || isNaN(parseFloat(zofeurPickupLong))) {
        setErrorMsg("Please enter a valid Pickup Longitude.");
        return;
      }
      if (!String(zofeurDropoffLat).trim() || isNaN(parseFloat(zofeurDropoffLat))) {
        setErrorMsg("Please enter a valid Dropoff Latitude.");
        return;
      }
      if (!String(zofeurDropoffLong).trim() || isNaN(parseFloat(zofeurDropoffLong))) {
        setErrorMsg("Please enter a valid Dropoff Longitude.");
        return;
      }
      if (!zofeurBookingId) {
        setErrorMsg("A unique booking ID is required.");
        return;
      }
    }

    setIsSubmitting(true);
    setIsProcessing(true);

    try {
      // 1. Submit Keyloop Service Request Notes
      const primaryEventType = selectedReferences[0];
      const additionalEventTypes = selectedReferences.slice(1);

      const notesPromise = createServiceRequestNotes({
        group: String(group || "BMW").trim(),
        customerId: String(customerId || "").trim(),
        customerName: String(customerName || "").trim(),
        eventType: primaryEventType,
        eventTypes: additionalEventTypes,
        branchCode: String(branchCode || "10").trim(),
        salesExecutiveId: advisorId ? String(advisorId).trim() : null,
        notes: notes.trim(),
      });

      // 2. Submit Zofeur Recovery / Ride Dispatch if breakdown
      let zofeurPromise = Promise.resolve(null);
      if (isBreakdown) {
        zofeurPromise = (async () => {
          // A. Generate Bearer Token via POST https://api.zofeur.app/api/v1/auth/generate-token
          const tokenRes = await generateZofeurToken();
          if (!tokenRes || !tokenRes.ok || !tokenRes.token) {
            throw new Error(tokenRes?.error || "Failed to generate Zofeur auth token");
          }

          // B. Create Vendor Booking via POST https://api.zofeur.app/api/v1/booking/vendor/AGMC%20Call%20Center/create
          const payload = {
            phone_no: String(zofeurPhoneNo).trim(),
            country_code: String(zofeurCountryCode).trim() || "+971",
            pickup_lat: parseFloat(zofeurPickupLat),
            pickup_long: parseFloat(zofeurPickupLong),
            dropoff_lat: parseFloat(zofeurDropoffLat),
            dropoff_long: parseFloat(zofeurDropoffLong),
            booking_id: parseInt(zofeurBookingId, 10),
            ride_custom_field: {
              "0": String(zofeurChassis).trim(),
              "1": String(zofeurPlate).trim(),
            },
          };

          const zRes = await createZofeurVendorBooking(payload, tokenRes.token);
          if (!zRes.ok) {
            const errDetail =
              zRes.data?.message ||
              zRes.data?.msg ||
              zRes.error ||
              "Zofeur booking request rejected";
            throw new Error(`Zofeur Error: ${errDetail}`);
          }
          return zRes;
        })();
      }

      // Execute both APIs at the same time
      const [notesResult, zofeurResult] = await Promise.all([
        notesPromise,
        zofeurPromise,
      ]);

      const isNotesError = notesResult && notesResult.ok === false;
      if (isNotesError) {
        throw new Error(
          notesResult?.error ||
            notesResult?.errorMessage ||
            "Failed to submit service request notes to Keyloop.",
        );
      }

      // Both succeeded
      setSuccessResult({
        bookingId: zofeurBookingId,
        zofeurData: zofeurResult?.data,
        message: isBreakdown
          ? `Breakdown request & Zofeur ride booking #${zofeurBookingId} created successfully!`
          : "Service request notes submitted successfully!",
      });

      setNotes("");
      setSelectedReferences([]);
      // Immediately regenerate a new unique booking ID for the next submission
      setZofeurBookingId(generateNewBookingId());

      setTimeout(() => {
        setIsProcessing(false);
        setIsSubmitting(false);
      }, 1500);
    } catch (err) {
      console.error("Error submitting service request:", err);
      setIsSubmitting(false);
      setIsProcessing(false);
      setErrorMsg(
        err?.message || "An unexpected error occurred while submitting.",
      );
    }
  };

  return (
    <div className="bg-white rounded-xl p-2.5 sm:p-4 shadow-xs border border-slate-200/90 flex flex-col gap-3 text-xs transition-all w-full">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shadow-xs shrink-0">
            <FaWrench />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight">
              {title}
            </h2>
            <p className="text-[10px] text-gray-400 font-medium">
              Create {title.toLowerCase()} notes for{" "}
              <span className="font-semibold text-gray-700">
                {customerName ||
                  (customerId ? `Customer #${customerId}` : "Customer")}
              </span>
            </p>
          </div>
        </div>

        {/* Right Group / Customer Badge */}
        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
          <span className="text-[10px] text-gray-500 font-medium">
            Group : <span className="font-bold text-gray-700">{group}</span> |{" "}
            <span className="font-bold text-gray-700">
              {customerId ? `Customer #${customerId}` : "Service"}
            </span>
          </span>
          <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shadow-2xs shrink-0">
            <FaCar className="text-[10px]" />
          </div>
        </div>
      </div>

      {/* Main Form: 3x3 Grid Layout */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* 1. Customer Name */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
              Customer Name
            </label>
            <div className="w-full h-8 px-2 bg-slate-50 border border-slate-200/90 rounded-lg shadow-2xs flex items-center transition-all">
              <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                <FaUserCheck />
              </div>
              <input
                type="text"
                value={customerName}
                disabled
                readOnly
                className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-700 text-xs cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* 2. Customer ID */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
              Customer ID
            </label>
            <div className="w-full h-8 px-2 bg-slate-50 border border-slate-200/90 rounded-lg shadow-2xs flex items-center transition-all">
              <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                <FaIdCard />
              </div>
              <input
                type="text"
                value={customerId}
                disabled
                readOnly
                className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-700 text-xs font-mono cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* 3. Group */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
              Group
            </label>
            <div className="w-full h-8 px-2 bg-slate-50 border border-slate-200/90 rounded-lg shadow-2xs flex items-center transition-all">
              <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                <FaBuilding />
              </div>
              <input
                type="text"
                value={group}
                disabled
                readOnly
                className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-700 text-xs cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* 4. Branch Code */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
              Branch Code
            </label>
            <div className="w-full h-8 px-2 bg-slate-50 border border-slate-200/90 rounded-lg shadow-2xs flex items-center transition-all">
              <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                <FaCodeBranch />
              </div>
              <input
                type="text"
                value={branchCode}
                disabled
                readOnly
                className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-700 text-xs font-mono cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* Breakdown specific fields in the same grid */}
          {isBreakdown && (
            <>
              {/* 5. Mobile Number */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  Mobile Number <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                  <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                    <FaPhoneAlt />
                  </div>
                  <span className="text-xs font-semibold text-gray-400 mr-1 select-none">+971</span>
                  <input
                    type="text"
                    value={zofeurPhoneNo}
                    onChange={(e) => setZofeurPhoneNo(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g. 504321353"
                    className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs"
                  />
                </div>
              </div>

              {/* 6. Chassis Number (VIN) */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  Chassis Number (VIN) <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                  <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                    <FaCar />
                  </div>
                  <input
                    type="text"
                    value={zofeurChassis}
                    onChange={(e) => setZofeurChassis(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Enter chassis / VIN..."
                    className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold font-mono text-gray-800 text-xs uppercase"
                  />
                </div>
              </div>

              {/* 7. Plate Number */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  Plate Number <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                  <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                    <FaHashtag />
                  </div>
                  <input
                    type="text"
                    value={zofeurPlate}
                    onChange={(e) => setZofeurPlate(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Enter plate number..."
                    className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs uppercase"
                  />
                </div>
              </div>

              {/* 8. Booking ID */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    Booking ID <span className="text-rose-500 font-bold">*</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setZofeurBookingId(generateNewBookingId())}
                    disabled={isSubmitting}
                    title="Generate new unique booking ID"
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5 cursor-pointer"
                  >
                    <FaSyncAlt className="text-[9px]" /> New
                  </button>
                </label>
                <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                  <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                    <FaHashtag />
                  </div>
                  <input
                    type="number"
                    value={zofeurBookingId}
                    onChange={(e) => setZofeurBookingId(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g. 170552"
                    className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold font-mono text-gray-800 text-xs"
                  />
                </div>
              </div>

              {/* 9. Pickup Latitude */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  Pickup Latitude <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                  <div className="w-5 h-5 rounded bg-rose-50/80 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0 text-[10px] mr-1.5">
                    <FaMapMarkerAlt />
                  </div>
                  <input
                    type="text"
                    value={zofeurPickupLat}
                    onChange={(e) => setZofeurPickupLat(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Enter pickup latitude..."
                    className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold font-mono text-gray-800 text-xs"
                  />
                </div>
              </div>

              {/* 10. Pickup Longitude */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  Pickup Longitude <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                  <div className="w-5 h-5 rounded bg-rose-50/80 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0 text-[10px] mr-1.5">
                    <FaMapMarkerAlt />
                  </div>
                  <input
                    type="text"
                    value={zofeurPickupLong}
                    onChange={(e) => setZofeurPickupLong(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Enter pickup longitude..."
                    className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold font-mono text-gray-800 text-xs"
                  />
                </div>
              </div>

              {/* 11. Dropoff Latitude */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  Dropoff Latitude <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                  <div className="w-5 h-5 rounded bg-emerald-50/80 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0 text-[10px] mr-1.5">
                    <FaMapMarkerAlt />
                  </div>
                  <input
                    type="text"
                    value={zofeurDropoffLat}
                    onChange={(e) => setZofeurDropoffLat(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Enter dropoff latitude..."
                    className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold font-mono text-gray-800 text-xs"
                  />
                </div>
              </div>

              {/* 12. Dropoff Longitude */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
                  Dropoff Longitude <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
                  <div className="w-5 h-5 rounded bg-emerald-50/80 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0 text-[10px] mr-1.5">
                    <FaMapMarkerAlt />
                  </div>
                  <input
                    type="text"
                    value={zofeurDropoffLong}
                    onChange={(e) => setZofeurDropoffLong(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Enter dropoff longitude..."
                    className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold font-mono text-gray-800 text-xs"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Reference Selection - Multi-Select Checkboxes */}
        <div className="w-full bg-slate-50/60 p-3 rounded-xl border border-slate-200/90 flex flex-col gap-2">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-1.5 border-b border-slate-200/60">
            <label className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
              <FaListUl className="text-blue-500 text-[11px]" />
              <span>Reference Types</span>
              <span className="text-rose-500 font-bold">*</span>
              <span className="text-[10px] font-normal text-gray-500">
                (Select one or multiple)
              </span>
            </label>

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                  selectedReferences.length > 0
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }`}
              >
                {selectedReferences.length} Selected
              </span>
              <button
                type="button"
                onClick={() => {
                  if (
                    selectedReferences.length ===
                    activeReferences.length
                  ) {
                    setSelectedReferences([]);
                  } else {
                    setSelectedReferences(
                      activeReferences.map((r) => r.type),
                    );
                  }
                }}
                disabled={isSubmitting}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline disabled:opacity-50"
              >
                {selectedReferences.length === activeReferences.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-0.5">
            {activeReferences.map((item) => {
              const isChecked = selectedReferences.includes(item.type);
              return (
                <label
                  key={item.type}
                  className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer text-xs select-none ${
                    isChecked
                      ? "bg-blue-50/80 border-blue-400 text-blue-950 font-semibold shadow-2xs ring-1 ring-blue-300"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-gray-700 font-medium"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={item.type}
                    checked={isChecked}
                    onChange={() => toggleReference(item.type)}
                    disabled={isSubmitting}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer accent-blue-600 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="truncate block">{item.label}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* 6. Notes Textarea (Small) */}
        <div className="w-full">
          <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
            Notes <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="w-full bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs p-2 transition-all">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              placeholder="Enter service request notes..."
              rows={2}
              className="w-full bg-transparent border-0 focus:outline-none text-gray-800 text-xs resize-y min-h-[50px]"
            />
          </div>
        </div>

        {/* Inline Success Message */}
        {successResult && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-900 text-xs shadow-2xs animate-fadeIn">
            <FaCheckCircle className="text-emerald-500 text-base shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-emerald-950">{successResult.message}</div>
              {successResult.zofeurData && (
                <div className="text-[11px] text-emerald-700 mt-0.5 flex flex-wrap gap-2">
                  <span>Status: {successResult.zofeurData.message || "Confirmed"}</span>
                  {successResult.bookingId && (
                    <span>• Booking ID: #{successResult.bookingId}</span>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSuccessResult(null)}
              className="text-emerald-600 hover:text-emerald-800 text-xs font-bold px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Inline Error Message */}
        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-800 text-xs font-medium">
            <FaExclamationCircle className="text-rose-500 text-sm shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Centered Processing Indicator */}
        {isProcessing && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center gap-2 text-blue-800 text-xs font-semibold animate-pulse">
            <FaSpinner className="animate-spin text-blue-600 text-xs shrink-0" />
            <span>Processing breakdown & dispatching ride...</span>
          </div>
        )}

        {/* Actions Bar (Submit to Center) */}
        <div className="flex items-center justify-center gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              setNotes("");
              setSelectedReferences([]);
              setErrorMsg("");
              setSuccessResult(null);
              if (isBreakdown) {
                setZofeurPickupLat("");
                setZofeurPickupLong("");
                setZofeurDropoffLat("");
                setZofeurDropoffLong("");
                setZofeurBookingId(generateNewBookingId());
              }
            }}
            disabled={
              isSubmitting || (!notes && selectedReferences.length === 0 && !successResult)
            }
            className="px-4 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isProcessing}
            className={`px-6 py-1.5 text-xs font-bold text-white rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              isSubmitting || isProcessing
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-98"
            }`}
          >
            {isSubmitting || isProcessing ? (
              <>
                <FaSpinner className="animate-spin text-xs" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FaPaperPlane className="text-xs" />
                <span>Submit {title}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
