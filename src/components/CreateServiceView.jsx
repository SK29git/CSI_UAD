import React, { useState, useEffect } from "react";
import { useCustomer } from "../context/CustomerContext";
import { createServiceRequestNotes } from "../utils/api";
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
} from "react-icons/fa";

export const SERVICE_REQUEST_REFERENCES = [
  { type: "IPE", label: "Inbound Parts Enq." },
  { type: "CMO", label: "Inbound other service Enq." },
  { type: "CMQ", label: "Inbound Quote - No Booking" },
  { type: "ES3", label: "Recovery AGMC" },
  { type: "ES5", label: "Service mobile inprogress" },
  { type: "ES9", label: "Recovery AAA" },
  { type: "CALL0001", label: "Connected Drive" },
  { type: "CALL0002", label: "Service Contract" },
  { type: "CDRN", label: "CD Motorshow Renewal" },
  { type: "Z0000142", label: "A/C System Heath Check" },
  { type: "Z0000149", label: "Zofeur Pick Up / Drop Off" },
  { type: "DSCi", label: "DSCi Campaigns" },
];

export default function CreateServiceView() {
  const {
    customer,
    currentGroup,
    group: contextGroup,
    getFormattedName,
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
    customer?.customerNumber ||
    customer?.id ||
    customer?.customerId ||
    "";

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
    customer?.branchCode ||
    customer?.branch ||
    customer?.branch_code ||
    "10";

  const advisorId =
    customer?.salesExecutiveId ||
    customer?.advisorId ||
    customer?.serviceAdvisorId ||
    null;

  // Editable fields state
  const [reference, setReference] = useState("ES5");
  const [notes, setNotes] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!reference) {
      setErrorMsg("Please select a Reference.");
      return;
    }

    if (!notes.trim()) {
      setErrorMsg("Please enter notes for the service request.");
      return;
    }

    setIsSubmitting(true);
    setIsProcessing(true);

    try {
      const payload = {
        group: String(group || "BMW").trim(),
        customerId: String(customerId || "").trim(),
        customerName: String(customerName || "").trim(),
        eventType: reference, // Sent as eventType to RPA API
        branchCode: String(branchCode || "10").trim(),
        salesExecutiveId: advisorId ? String(advisorId).trim() : null,
        notes: notes.trim(),
      };

      const result = await createServiceRequestNotes(payload);

      if (result && result.ok !== false) {
        // Show processing state without showing any success popups or alerts
        setTimeout(() => {
          setIsSubmitting(false);
          setNotes("");
          setTimeout(() => {
            setIsProcessing(false);
          }, 3500);
        }, 1500);
      } else {
        setIsSubmitting(false);
        setIsProcessing(false);
        setErrorMsg(
          result?.error ||
            result?.errorMessage ||
            "Failed to submit service request notes."
        );
      }
    } catch (err) {
      console.error("Error submitting service request notes:", err);
      setIsSubmitting(false);
      setIsProcessing(false);
      setErrorMsg(
        err?.message || "An unexpected error occurred while submitting."
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
              Other Request
            </h2>
            <p className="text-[10px] text-gray-400 font-medium">
              Create other request notes for{" "}
              <span className="font-semibold text-gray-700">
                {customerName || (customerId ? `Customer #${customerId}` : "Customer")}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-2.5">
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

          {/* 5. Reference Dropdown (width kept small/compact) */}
          <div className="w-full max-w-[280px]">
            <label className="text-[11px] font-bold text-gray-700 mb-0.5 flex items-center gap-1">
              Reference <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="w-full h-8 px-2 bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100/70 rounded-lg shadow-2xs flex items-center transition-all">
              <div className="w-5 h-5 rounded bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 text-[10px] mr-1.5">
                <FaListUl />
              </div>
              <select
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-full bg-transparent border-0 focus:outline-none font-semibold text-gray-800 text-xs cursor-pointer truncate"
              >
                <option value="" disabled>-- Select Reference --</option>
                {SERVICE_REQUEST_REFERENCES.map((item) => (
                  <option key={item.type} value={item.type}>
                    {item.label} ({item.type})
                  </option>
                ))}
              </select>
            </div>
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
            <span>Processing...</span>
          </div>
        )}

        {/* Actions Bar (Submit to Center) */}
        <div className="flex items-center justify-center gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              setNotes("");
              setErrorMsg("");
            }}
            disabled={isSubmitting || !notes}
            className="px-4 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Notes
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
                <span>Submit Other Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
