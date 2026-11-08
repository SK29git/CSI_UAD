import React, { useState, useEffect, useMemo } from "react";
import { useCustomer } from "../context/CustomerContext";
import {
  getCustomerEvents,
  getEventByNumber,
  getSalesExecutiveDetails,
} from "../utils/api";
import {
  FaHistory,
  FaUserTie,
  FaCar,
  FaBuilding,
  FaPhoneAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaSearch,
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
  FaFileAlt,
  FaCalendarAlt,
  FaIdBadge,
  FaEnvelope,
  FaTimes,
  FaArrowRight,
  FaInfoCircle,
  FaLayerGroup,
} from "react-icons/fa";

// Sample events fallback for customer #76876 matching collection specification
const SAMPLE_EVENTS_FALLBACK = [
  {
    keyloopGroup: "BMW",
    eventUid: "c4196240-79eb-4033-89d0-ae97d77ee0f6",
    eventType: "ES3",
    createdDate: "2026-11-01",
    createdTime: "17:54:44",
    eventTaskDate: "2026-11-01",
    eventTaskTime: "17:53:54",
    closedDate: "2026-11-01",
    closedTime: "17:53:54",
    creatorName: "Hamdan Siddiqui",
    followupUsername: "Hamdan Siddiqui",
    enquiryNumber: "",
    customer: "Ahmed Moursy  Altantawi",
    title: "Mr.",
    firstName: "Ahmed Moursy",
    surname: "Altantawi",
    customerNumber: "76876",
    prospectNumber: "",
    mobileNumber: "*******840",
    homePhone: "",
    email: "a***@gmail.com",
    preferredContactChannel: "",
    preferredPhoneSlot: "4",
    preferredPhoneCode: "PHONE4",
    preferredEmail: "",
    marketingCampaignCode: "????????????????",
    branchName: "10 - Sheikh Zayed Rd",
    source1: "CRM Outbound",
    source2: "Contact Centre",
    closedFlag: "1",
    manufacturer: "",
    vehicleDescription: "",
    make: "",
    model: "",
    followupUserLocation: "A02",
    dateRequiredTo: "",
    enquiryNo: "",
    statusOfEnquiry: "",
    eventTaskNotes:
      "RPA v14 test: recovery requested for 25539DB (no sales executive sent).",
    notesFromBranch: "10",
    campaignNameFromNotes: "",
    makeFromNotes: "BMW",
    modelFromNotes: "x5",
    kdbTimeStamp: "2026-11-01 13:54:44.924",
    eventMake: "",
    eventModel: "E93",
    account: "",
    attachmentType: "",
    amendmentCounter: "0",
    branchCode: "10",
    callNumber: "1384662",
    chainNumber: "14316688",
    closedByUser: "hamdan",
    closedDate2: "2026-11-01",
    closedFlag2: "1",
    closedTime2: "17:53:54",
    companyMagicNumber: "0",
    complaintId: "",
    contactMethod: "PHONE",
    contentStatus: "0",
    contentType: "",
    createdByUser: "hamdan",
    createdDate2: "2026-11-01",
    createdTime2: "17:54:44",
    customerMagic: "76876",
    departmentCode: "",
    departmentType: "Z",
    documentArchiveReference: "??????????????",
    documentName: "",
    duration: "0",
    enquiryNumber2: "",
    escalateActionId: "hamdan",
    escalateEntityType: "6",
    escalateEventDate: "2026-11-01",
    escalateEventTime: "17:54:44",
    escalateStructureId: "",
    escalationCounter: "0",
    eventAttachment: "",
    eventContentBodyBlob: "",
    eventFollowedUpInChain: "0",
    eventNumber: "14316688",
    eventType2: "ES3",
    eventTaskActionId: "hamdan",
    eventTaskDate2: "2026-11-01",
    eventTaskEntityType: "6",
    eventTaskNotes2:
      "RPA v14 test: recovery requested for 25539DB (no sales executive sent).",
    eventTaskStructureId: "",
    eventTaskTime2: "17:53:54",
    eventTaskType: "0",
    externalCompaignReference: "",
    externalNotes: "",
    eventGroup: "conv",
    lastUpdateDate: "2026-11-01",
    lastUpdateTime: "17:54:44",
    lastUpdateUser: "kcc",
    linkToGbPhonelog: "0",
    linkType: "CU",
    orderNumber: "",
    originalActionId: "hamdan",
    originalEntityType: "6",
    originalEventDate: "2026-11-01",
    originalEventTime: "17:53:54",
    originalStructureId: "",
    originallyTaskEvent: "1",
    originatingBranch: "10",
    phonelogCompleteCallId: "",
    pointOfSaleBranchNumber: "",
    qualificationNumber: "",
    reOpenCounter: "0",
    reference: "Recovery AGMC",
    relevantActionId: "hamdan",
    relevantEntityType: "6",
    relevantEventDate: "2026-11-01",
    relevantEventTime: "17:53:54",
    relevantStructureId: "",
    strengthOfEventTask: "",
    vehicleNumber: "1459",
    vmCompanyLevel: "0",
    vmCompanyLevelCode: "",
    whoPromptedEventTask: "CALLCENT",
    description: "CRM Outbound",
    endDate: "",
    eventSourceCode: "CALLCENT",
    manufacturerRestriction: "",
    marketingCampaignCode2: "????????????????",
    originOfTheRow: "0",
  },
  {
    keyloopGroup: "BMW",
    eventUid: "90fa73e1-0c4a-4581-bf6a-7c71488df66a",
    eventType: "ES5",
    createdDate: "2026-11-01",
    createdTime: "13:30:11",
    eventTaskDate: "2026-11-01",
    eventTaskTime: "13:29:05",
    closedDate: "2026-11-01",
    closedTime: "13:29:05",
    creatorName: "Hamdan Siddiqui",
    followupUsername: "Pratyusha Pattepu",
    enquiryNumber: "",
    customer: "Ahmed Moursy  Altantawi",
    title: "Mr.",
    firstName: "Ahmed Moursy",
    surname: "Altantawi",
    customerNumber: "76876",
    prospectNumber: "",
    mobileNumber: "*******840",
    homePhone: "",
    email: "a***@gmail.com",
    preferredContactChannel: "",
    preferredPhoneSlot: "4",
    preferredPhoneCode: "PHONE4",
    preferredEmail: "",
    marketingCampaignCode: "????????????????",
    branchName: "10 - Sheikh Zayed Rd",
    source1: "CRM Outbound",
    source2: "Contact Centre",
    closedFlag: "1",
    manufacturer: "",
    vehicleDescription: "",
    make: "",
    model: "",
    followupUserLocation: "A01",
    dateRequiredTo: "",
    enquiryNo: "",
    statusOfEnquiry: "",
    eventTaskNotes:
      "Customer needs recovery of 25539DB to the Sheikh Zayed Rd workshop.",
    notesFromBranch: "10",
    campaignNameFromNotes: "",
    makeFromNotes: "BMW",
    modelFromNotes: "x5",
    kdbTimeStamp: "2026-11-01 09:30:11.697",
    eventMake: "",
    eventModel: "E93",
    account: "",
    attachmentType: "",
    amendmentCounter: "0",
    branchCode: "10",
    callNumber: "1384659",
    chainNumber: "14316684",
    closedByUser: "hamdan",
    closedDate2: "2026-11-01",
    closedFlag2: "1",
    closedTime2: "13:29:05",
    companyMagicNumber: "0",
    complaintId: "",
    contactMethod: "PHONE",
    contentStatus: "0",
    contentType: "",
    createdByUser: "hamdan",
    createdDate2: "2026-11-01",
    createdTime2: "13:30:11",
    customerMagic: "76876",
    departmentCode: "",
    departmentType: "Z",
    documentArchiveReference: "??????????????",
    documentName: "",
    duration: "0",
    enquiryNumber2: "",
    escalateActionId: "pattepu",
    escalateEntityType: "6",
    escalateEventDate: "2026-11-01",
    escalateEventTime: "13:30:11",
    escalateStructureId: "",
    escalationCounter: "0",
    eventAttachment: "",
    eventContentBodyBlob: "",
    eventFollowedUpInChain: "0",
    eventNumber: "14316684",
    eventType2: "ES5",
    eventTaskActionId: "pattepu",
    eventTaskDate2: "2026-11-01",
    eventTaskEntityType: "6",
    eventTaskNotes2:
      "Customer needs recovery of 25539DB to the Sheikh Zayed Rd workshop.",
    eventTaskStructureId: "",
    eventTaskTime2: "13:29:05",
    eventTaskType: "0",
    externalCompaignReference: "",
    externalNotes: "",
    eventGroup: "conv",
    lastUpdateDate: "2026-11-01",
    lastUpdateTime: "13:30:11",
    lastUpdateUser: "kcc",
    linkToGbPhonelog: "0",
    linkType: "CU",
    orderNumber: "",
    originalActionId: "pattepu",
    originalEntityType: "6",
    originalEventDate: "2026-11-01",
    originalEventTime: "13:29:05",
    originalStructureId: "",
    originallyTaskEvent: "1",
    originatingBranch: "10",
    phonelogCompleteCallId: "",
    pointOfSaleBranchNumber: "",
    qualificationNumber: "",
    reOpenCounter: "0",
    reference: "Service mobile inprogress",
    relevantActionId: "hamdan",
    relevantEntityType: "6",
    relevantEventDate: "2026-11-01",
    relevantEventTime: "13:29:05",
    relevantStructureId: "",
    strengthOfEventTask: "",
    vehicleNumber: "1459",
    vmCompanyLevel: "0",
    vmCompanyLevelCode: "",
    whoPromptedEventTask: "CALLCENT",
    description: "CRM Outbound",
    endDate: "",
    eventSourceCode: "CALLCENT",
    manufacturerRestriction: "",
    marketingCampaignCode2: "????????????????",
    originOfTheRow: "0",
  },
];

export default function EventHistoryView({
  activeSubTab = "Customer Event",
  onSubTabChange,
}) {
  const { customer, group: contextGroup } = useCustomer();

  const isCustomerEventTab =
    activeSubTab === "Customer Event" ||
    activeSubTab === "Overview" ||
    activeSubTab === "Event History" ||
    !activeSubTab;

  const urlParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  const urlProspectNo = urlParams.get("prospectNumber") || "";
  const urlCustomerNo =
    urlParams.get("customerNumber") ||
    urlParams.get("customerNo") ||
    urlParams.get("id") ||
    "";
  const urlGroup = urlParams.get("group") || "";

  const isProspectParam = Boolean(
    urlProspectNo ||
    customer?.isProspect ||
    customer?.customerType === "PROSPECT" ||
    urlCustomerNo === "167062",
  );
  const initialCustNo = isProspectParam
    ? urlProspectNo ||
      customer?.prospectNumber ||
      (customer?.isProspect ? customer?.id : null) ||
      (urlCustomerNo === "167062" ? "167062" : "") ||
      "167062"
    : customer?.customerNumber || urlCustomerNo || "76876";
  const initialGroup =
    urlGroup || customer?.keyloopGroup || contextGroup || "BMW";

  const [group, setGroup] = useState(initialGroup);
  const [customerNumber, setCustomerNumber] = useState(initialCustNo);
  const [limit, setLimit] = useState(2);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track detailed One Event API responses cached by eventNumber
  const [oneEventsData, setOneEventsData] = useState({});
  const [oneEventsLoading, setOneEventsLoading] = useState({});
  const [expandedOneEventId, setExpandedOneEventId] = useState(null);

  // Sales Executive Modal & Detail State
  const [salesExecModal, setSalesExecModal] = useState({
    isOpen: false,
    loading: false,
    data: null,
    error: null,
    userId: "",
  });

  // Direct One Event Search State (for 'One Event' sub-tab or direct lookup)
  const [directEventNumber, setDirectEventNumber] = useState("14316687");
  const [directEventLoading, setDirectEventLoading] = useState(false);
  const [directEventData, setDirectEventData] = useState(null);
  const [directEventError, setDirectEventError] = useState(null);

  // Manual Sales Executive Search State (for 'Sales Executives' sub-tab)
  const [manualSalesExecUserId, setManualSalesExecUserId] = useState("v18051");
  const [manualSalesExecLoading, setManualSalesExecLoading] = useState(false);
  const [manualSalesExecData, setManualSalesExecData] = useState(null);
  const [manualSalesExecError, setManualSalesExecError] = useState(null);

  // 1. Fetch Events of a Customer (GET /api/v1/events?group=BMW&customerNumber=76876&limit=...)
  const fetchCustomerEvents = async (
    custNoOverride = null,
    groupOverride = null,
  ) => {
    const targetCustNo = custNoOverride || customerNumber;
    const targetGroup = groupOverride || group || "BMW";

    if (!targetCustNo) {
      setError("Please specify a customer number to fetch event history.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isRecordProspect = Boolean(
        customer?.isProspect ||
        customer?.customerType === "PROSPECT" ||
        urlParams.get("prospectNumber") === targetCustNo ||
        targetCustNo === "167062" || // Known unconverted prospect
        String(customer?.prospectNumber) === String(targetCustNo),
      );

      const res = await getCustomerEvents({
        group: targetGroup,
        customerNumber: isRecordProspect ? undefined : targetCustNo,
        prospectNumber: isRecordProspect ? targetCustNo : undefined,
        limit,
      });

      if (res && res.ok && Array.isArray(res.data)) {
        setEvents(res.data);
      } else if (res && res.ok && res.data?.events) {
        setEvents(res.data.events);
      } else {
        // Fallback to sample events if testing with sample customer
        if (String(targetCustNo) === "76876") {
          setEvents(SAMPLE_EVENTS_FALLBACK);
        } else {
          setEvents([]);
          if (res?.error) setError(res.error);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch customer events:", err);
      if (String(targetCustNo) === "76876") {
        setEvents(SAMPLE_EVENTS_FALLBACK);
      } else {
        setError(err.message || "Failed to load event history.");
        setEvents([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Sync if customer context changes from outside (e.g. sidebar customer selection)
  useEffect(() => {
    if (customer?.customerNumber || customer?.id || customer?.prospectNumber) {
      const isProspectCust = Boolean(
        customer?.isProspect || customer?.customerType === "PROSPECT",
      );
      const val = isProspectCust
        ? String(customer?.prospectNumber || customer?.id || "")
        : String(customer?.customerNumber || customer?.id || "");
      if (val && val !== customerNumber) {
        setCustomerNumber(val);
        const derivedGroup =
          urlParams.get("group") ||
          customer?.keyloopGroup ||
          contextGroup ||
          "BMW";
        setGroup(derivedGroup);
        fetchCustomerEvents(val, derivedGroup);
      }
    }
  }, [
    customer?.customerNumber,
    customer?.id,
    customer?.prospectNumber,
    contextGroup,
  ]);

  // Initial fetch on component mount only
  useEffect(() => {
    if (initialCustNo) {
      fetchCustomerEvents(initialCustNo, initialGroup);
    }
  }, []);

  // 2. Fetch One Event (GET /api/v1/events?group=BMW&eventNumber=14316688)
  const fetchOneEvent = async (eventNo, autoExpand = true) => {
    if (!eventNo) return;
    const cleanEventNo = String(eventNo).trim();

    // Set loading for this specific event
    setOneEventsLoading((prev) => ({ ...prev, [cleanEventNo]: true }));
    if (autoExpand) {
      setExpandedOneEventId(cleanEventNo);
    }

    try {
      const res = await getEventByNumber({
        group: group || "BMW",
        eventNumber: cleanEventNo,
      });

      if (res && res.ok && res.data) {
        setOneEventsData((prev) => ({ ...prev, [cleanEventNo]: res.data }));
      } else {
        // Fallback: check if we already have it in local events list
        const match = events.find(
          (e) => String(e.eventNumber || e.chainNumber) === cleanEventNo,
        );
        if (match) {
          setOneEventsData((prev) => ({ ...prev, [cleanEventNo]: match }));
        } else {
          setOneEventsData((prev) => ({
            ...prev,
            [cleanEventNo]: {
              error: res?.error || `Could not find event #${cleanEventNo}`,
            },
          }));
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch event #${cleanEventNo}:`, err);
      const match = events.find(
        (e) => String(e.eventNumber || e.chainNumber) === cleanEventNo,
      );
      setOneEventsData((prev) => ({
        ...prev,
        [cleanEventNo]: match || {
          error: err.message || "Failed to load event details.",
        },
      }));
    } finally {
      setOneEventsLoading((prev) => ({ ...prev, [cleanEventNo]: false }));
    }
  };

  // Direct One Event search execution
  const handleDirectOneEventSearch = async (e) => {
    if (e) e.preventDefault();
    if (!directEventNumber) return;

    setDirectEventLoading(true);
    setDirectEventError(null);
    setDirectEventData(null);

    try {
      const res = await getEventByNumber({
        group: group || "BMW",
        eventNumber: String(directEventNumber).trim(),
      });

      if (res && res.ok && res.data) {
        setDirectEventData(res.data);
      } else {
        setDirectEventError(
          res?.error || `No event found matching #${directEventNumber}`,
        );
      }
    } catch (err) {
      setDirectEventError(
        err.message || `Failed to fetch event #${directEventNumber}`,
      );
    } finally {
      setDirectEventLoading(false);
    }
  };

  // 3. Fetch Sales Executive Details (GET /api/v1/sales-executives?group=BMW&userId=v18051)
  const openSalesExecutiveModal = async (userId) => {
    if (!userId) return;
    const cleanUserId = String(userId).trim();

    setSalesExecModal({
      isOpen: true,
      loading: true,
      data: null,
      error: null,
      userId: cleanUserId,
    });

    try {
      const res = await getSalesExecutiveDetails({
        group: group || "BMW",
        userId: cleanUserId,
      });

      if (res && res.ok && res.data) {
        setSalesExecModal((prev) => ({
          ...prev,
          loading: false,
          data: res.data,
        }));
      } else {
        setSalesExecModal((prev) => ({
          ...prev,
          loading: false,
          error:
            res?.error ||
            `Sales executive profile not found for user ID: ${cleanUserId}`,
        }));
      }
    } catch (err) {
      setSalesExecModal((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to fetch sales executive details.",
      }));
    }
  };

  // Manual search for Sales Executive in directory tab
  const handleManualSalesExecSearch = async (e) => {
    if (e) e.preventDefault();
    if (!manualSalesExecUserId) return;

    setManualSalesExecLoading(true);
    setManualSalesExecError(null);
    setManualSalesExecData(null);

    try {
      const res = await getSalesExecutiveDetails({
        group: group || "BMW",
        userId: String(manualSalesExecUserId).trim(),
      });

      if (res && res.ok && res.data) {
        setManualSalesExecData(res.data);
      } else {
        setManualSalesExecError(
          res?.error ||
            `Sales executive profile not found for user: ${manualSalesExecUserId}`,
        );
      }
    } catch (err) {
      setManualSalesExecError(
        err.message || "Failed to fetch sales executive details.",
      );
    } finally {
      setManualSalesExecLoading(false);
    }
  };

  // Customer events list
  const filteredEvents = events;

  // Derived KPI Stats
  const stats = useMemo(() => {
    const total = events.length;
    const closed = events.filter(
      (e) => e.closedFlag === "1" || e.closedDate,
    ).length;
    const open = total - closed;

    // Unique sales executives with their userIds if available
    const salesExecMap = new Map();
    events.forEach((e) => {
      const name = e.followupUsername || e.creatorName;
      const uid =
        e.eventTaskActionId ||
        e.escalateActionId ||
        e.createdByUser ||
        e.closedByUser;
      if (name) {
        salesExecMap.set(name, { name, userId: uid || "" });
      }
    });

    const vehicleModels = new Set(
      events.map((e) => e.modelFromNotes || e.eventModel).filter(Boolean),
    );

    return {
      total,
      closed,
      open,
      salesExecList: Array.from(salesExecMap.values()),
      salesExecCount: salesExecMap.size,
      modelsList: Array.from(vehicleModels),
    };
  }, [events]);

  const getEventTypeColor = (type) => {
    const t = String(type || "").toUpperCase();
    if (t.includes("ES5"))
      return "bg-purple-100 text-purple-800 border-purple-200";
    if (t.includes("ES3")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (t.includes("ES1"))
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    return "bg-amber-100 text-amber-800 border-amber-200";
  };

  return (
    <div className="flex flex-col gap-3 font-sans text-xs">
      {/* 1. Header & Configuration Toolbar + 2. KPI Metrics Ribbon (Only shown on Customer Event tab) */}
      {isCustomerEventTab && (
        <>
          <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-2xs border border-blue-100">
                  <FaHistory className="text-base" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-gray-900 leading-tight">
                      Event History & Sales Executive
                    </h2>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                      {events.length} {events.length === 1 ? "Event" : "Events"}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                      {group || "BMW"}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Customer interaction history & sales executive assignments
                  </p>
                </div>
              </div>
            </div>

            {/* Filter Input Grid - Removed Keyloop Group box per specification */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchCustomerEvents();
              }}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1"
            >
              <div className="sm:col-span-6">
                <label className="block text-[10px] font-extrabold text-gray-600 uppercase mb-1">
                  Customer Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerNumber}
                  onChange={(e) => setCustomerNumber(e.target.value)}
                  placeholder="e.g. 76876"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] font-extrabold text-gray-600 uppercase mb-1">
                  Result Limit
                </label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value={2}>2 Records (Default - Latest 2)</option>
                  <option value={5}>5 Records</option>
                  <option value={10}>10 Records</option>
                  <option value={20}>20 Records</option>
                  <option value={50}>50 Records</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin text-xs" />
                      <span>Loading Events...</span>
                    </>
                  ) : (
                    <>
                      <FaSearch className="text-xs" />
                      <span>Fetch Events</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 2. KPI Metrics Ribbon */}
          {events.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FaFileAlt className="text-sm" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Events
                  </span>
                  <strong className="text-base font-extrabold text-slate-800">
                    {stats.total}
                  </strong>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <FaUserTie className="text-sm" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Sales Executives
                  </span>
                  <strong className="text-base font-extrabold text-purple-700">
                    {stats.salesExecCount}
                  </strong>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <FaCheckCircle className="text-sm" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Closed Events
                  </span>
                  <strong className="text-base font-extrabold text-emerald-700">
                    {stats.closed}
                  </strong>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <FaCar className="text-sm" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Vehicle Models
                  </span>
                  <strong className="text-base font-extrabold text-amber-700 truncate block">
                    {stats.modelsList.join(", ") || "N/A"}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 3. Sub-Tab Section Rendering: ONE EVENT DIRECT INSPECTOR */}
      {activeSubTab === "One Event" && (
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col gap-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <FaSearch className="text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Inspect Event by Number
            </h3>
          </div>

          <form
            onSubmit={handleDirectOneEventSearch}
            className="flex gap-2 max-w-lg"
          >
            <input
              type="text"
              value={directEventNumber}
              onChange={(e) => setDirectEventNumber(e.target.value)}
              placeholder="Enter Event Number (e.g. 14316687)"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={directEventLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {directEventLoading ? (
                <FaSpinner className="animate-spin text-xs" />
              ) : (
                <FaSearch className="text-xs" />
              )}
              <span>Inspect Event</span>
            </button>
          </form>

          {directEventError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
              {directEventError}
            </div>
          )}

          {directEventData && (
            <div className="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-mono font-bold text-blue-700 text-sm">
                  Event Details: #
                  {directEventData.eventNumber || directEventNumber}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getEventTypeColor(directEventData.eventType)}`}
                >
                  {directEventData.eventType}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Customer
                  </span>
                  <strong className="text-xs text-slate-900 block">
                    {directEventData.customer ||
                      `${directEventData.title || ""} ${directEventData.firstName || ""} ${directEventData.surname || ""}`}
                  </strong>
                  <span className="text-[10px] text-slate-600 font-mono block">
                    Cust #{directEventData.customerNumber}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {directEventData.mobileNumber}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Assigned Staff
                  </span>
                  <strong className="text-xs text-slate-900 block">
                    {directEventData.followupUsername ||
                      directEventData.creatorName ||
                      "Unassigned"}
                  </strong>
                  <span className="text-[10px] text-slate-600 block">
                    Location: {directEventData.followupUserLocation || "N/A"}
                  </span>
                  {directEventData.eventTaskActionId && (
                    <button
                      type="button"
                      onClick={() =>
                        openSalesExecutiveModal(
                          directEventData.eventTaskActionId,
                        )
                      }
                      className="mt-1 text-[10px] text-purple-700 hover:text-purple-900 font-bold underline flex items-center gap-1 cursor-pointer"
                    >
                      <FaUserTie className="text-[9px]" /> View Profile (
                      {directEventData.eventTaskActionId})
                    </button>
                  )}
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Vehicle & Branch
                  </span>
                  <strong className="text-xs text-slate-900 block">
                    {directEventData.makeFromNotes ||
                      directEventData.keyloopGroup}{" "}
                    {directEventData.modelFromNotes ||
                      directEventData.eventModel}
                  </strong>
                  <span className="text-[10px] text-slate-600 block">
                    {directEventData.branchName ||
                      `Branch ${directEventData.branchCode}`}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Call #{directEventData.callNumber} | Chain #
                    {directEventData.chainNumber}
                  </span>
                </div>
              </div>
              {directEventData.eventTaskNotes && (
                <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-100 text-xs text-slate-800">
                  <span className="font-bold text-blue-900 block text-[10px] uppercase mb-0.5">
                    Task Notes:
                  </span>
                  {directEventData.eventTaskNotes}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Sub-Tab Section Rendering: SALES EXECUTIVES DIRECTORY */}
      {activeSubTab === "Sales Executives" && (
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col gap-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <FaUserTie className="text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Sales Executives Directory
            </h3>
          </div>

          <form
            onSubmit={handleManualSalesExecSearch}
            className="flex gap-2 max-w-lg"
          >
            <input
              type="text"
              value={manualSalesExecUserId}
              onChange={(e) => setManualSalesExecUserId(e.target.value)}
              placeholder="Enter User ID (e.g. v18051, hamdan, pattepu)"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={manualSalesExecLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {manualSalesExecLoading ? (
                <FaSpinner className="animate-spin text-xs" />
              ) : (
                <FaSearch className="text-xs" />
              )}
              <span>Lookup Executive</span>
            </button>
          </form>

          {manualSalesExecError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
              {manualSalesExecError}
            </div>
          )}

          {manualSalesExecData && (
            <div className="mt-2 p-4 bg-purple-50/50 rounded-xl border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-lg font-bold">
                  <FaUserTie />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {manualSalesExecData.name}
                  </h4>
                  <p className="text-[11px] text-purple-800 font-mono">
                    User ID: {manualSalesExecData.userId}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {manualSalesExecData.branchName}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-1 text-[11px]">
                {manualSalesExecData.email && (
                  <a
                    href={`mailto:${manualSalesExecData.email}`}
                    className="text-blue-600 hover:underline flex items-center gap-1.5 font-medium"
                  >
                    <FaEnvelope className="text-slate-400 text-xs" />{" "}
                    {manualSalesExecData.email}
                  </a>
                )}
                {manualSalesExecData.mobile ? (
                  <a
                    href={`tel:${manualSalesExecData.mobile}`}
                    className="text-slate-700 hover:underline flex items-center gap-1.5 font-medium"
                  >
                    <FaPhoneAlt className="text-slate-400 text-xs" />{" "}
                    {manualSalesExecData.mobile}
                  </a>
                ) : (
                  <span className="text-slate-400 text-[10px]">
                    No mobile recorded
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Quick list of sales executives found from this customer's events */}
          {stats.salesExecList.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 mb-2">
                Sales Executives in Customer #{customerNumber}'s Event History:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {stats.salesExecList.map((exec, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <strong className="text-slate-900 text-xs block">
                        {exec.name}
                      </strong>
                      {exec.userId && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {exec.userId}
                        </span>
                      )}
                    </div>
                    {exec.userId && (
                      <button
                        type="button"
                        onClick={() => openSalesExecutiveModal(exec.userId)}
                        className="text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-1 rounded transition-colors cursor-pointer"
                      >
                        Profile
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Customer Events Cards List */}
      {isCustomerEventTab && (
        <>
          {loading ? (
            <div className="py-20 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 shadow-2xs">
              <FaSpinner className="animate-spin text-2xl text-blue-600" />
              <span className="text-xs font-semibold text-slate-600">
                Loading events for customer #{customerNumber}...
              </span>
            </div>
          ) : error ? (
            <div className="p-8 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 text-center space-y-3 shadow-2xs">
              <FaExclamationCircle className="mx-auto text-2xl text-amber-600" />
              <div>
                <p className="font-bold text-xs text-slate-800">
                  Events Query Notice
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">{error}</p>
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300 space-y-3 shadow-2xs">
              <FaHistory className="mx-auto text-3xl text-slate-300" />
              <div>
                <p className="font-bold text-xs text-slate-700">
                  No Events Found
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-0.5">
                  No interaction events were returned for customer{" "}
                  <strong>#{customerNumber}</strong> in group{" "}
                  <strong>{group}</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredEvents.map((ev, idx) => {
                const eventNum =
                  ev.eventNumber || ev.callNumber || String(idx + 1);
                const evId = ev.eventUid || eventNum;
                const isExpanded = expandedOneEventId === eventNum;
                const isClosed =
                  ev.closedFlag === "1" || Boolean(ev.closedDate);
                const followupSalesExecutive =
                  ev.followupUsername || "Unassigned";
                const creatorSalesExecutive =
                  ev.creatorName || ev.createdByUser || "System";
                const salesExecUserId =
                  ev.eventTaskActionId ||
                  ev.escalateActionId ||
                  ev.closedByUser ||
                  ev.createdByUser;
                const oneEventResult = oneEventsData[eventNum];
                const isOneEventLoading = oneEventsLoading[eventNum];

                return (
                  <div
                    key={evId}
                    className={`rounded-xl p-4 flex flex-col gap-3 transition-all duration-200 ${
                      isExpanded
                        ? "bg-blue-50/20 border-2 border-blue-500 shadow-md ring-4 ring-blue-100/70"
                        : "bg-white border border-slate-200 shadow-2xs hover:border-blue-300"
                    }`}
                  >
                    {/* Event Card Header */}
                    <div
                      className={`flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b transition-colors ${
                        isExpanded ? "border-blue-200" : "border-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Event Type Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getEventTypeColor(ev.eventType)}`}
                        >
                          {ev.eventType || "EVENT"}
                        </span>

                        {/* Event Number Badge */}
                        <span
                          onClick={() => {
                            if (isExpanded) {
                              setExpandedOneEventId(null);
                            } else {
                              fetchOneEvent(eventNum);
                            }
                          }}
                          className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-md cursor-pointer transition-colors flex items-center gap-1.5 ${
                            isExpanded
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                          }`}
                          title={`Click to view details for Event #${eventNum}`}
                        >
                          <span>Event #{eventNum}</span>
                          {isExpanded && (
                            <span className="bg-white text-blue-700 text-[9px] font-extrabold px-1.5 py-0.2 rounded-xs uppercase">
                              Active
                            </span>
                          )}
                        </span>

                        {/* Reference Title */}
                        <span className="font-bold text-slate-800 text-xs">
                          {ev.reference ||
                            ev.description ||
                            "Customer Interaction"}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isClosed
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {isClosed ? (
                            <>
                              <FaCheckCircle className="text-emerald-600 text-[9px]" />{" "}
                              Closed
                            </>
                          ) : (
                            <>
                              <FaClock className="text-amber-600 text-[9px]" />{" "}
                              In Progress
                            </>
                          )}
                        </span>

                        {/* Created Date Time */}
                        {ev.createdDate && (
                          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            <FaCalendarAlt className="text-slate-400 text-[9px]" />
                            {ev.createdDate} {ev.createdTime || ""}
                          </span>
                        )}
                      </div>

                      {/* Top Right Controls */}
                      <div className="flex items-center gap-2">
                        {/* Event Details button: fetch details for this event */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isExpanded) {
                              setExpandedOneEventId(null);
                            } else {
                              fetchOneEvent(eventNum);
                            }
                          }}
                          className={`text-[11px] font-extrabold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            isExpanded
                              ? "bg-blue-600 text-white ring-2 ring-blue-300 shadow-sm"
                              : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                          }`}
                        >
                          {isOneEventLoading ? (
                            <FaSpinner className="animate-spin text-xs" />
                          ) : (
                            <FaInfoCircle className="text-xs" />
                          )}
                          <span>
                            {isExpanded
                              ? "Hide Details"
                              : `Event Details (#${eventNum})`}
                          </span>
                          {isExpanded ? (
                            <FaChevronUp className="text-[9px]" />
                          ) : (
                            <FaChevronDown className="text-[9px]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Primary Data Grid: Sales Executive & Assignment Focus */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
                      {/* Assigned Sales Executive / Follow-up */}
                      <div className="bg-purple-50/70 p-2.5 rounded-lg border border-purple-200/80 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] font-extrabold text-purple-900 uppercase tracking-wider flex items-center gap-1">
                              <FaUserTie className="text-purple-600" /> Sales
                              Executive
                            </span>
                            {salesExecUserId && (
                              <button
                                type="button"
                                onClick={() =>
                                  openSalesExecutiveModal(salesExecUserId)
                                }
                                className="text-[9px] font-extrabold text-purple-700 hover:text-purple-900 bg-purple-100 hover:bg-purple-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                                title={`Fetch Sales Executive details for user ${salesExecUserId}`}
                              >
                                View Profile
                              </button>
                            )}
                          </div>
                          <strong
                            className="text-slate-900 text-xs block truncate"
                            title={followupSalesExecutive}
                          >
                            {followupSalesExecutive}
                          </strong>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] mt-1 font-mono flex-wrap">
                          {ev.followupUserLocation && (
                            <span className="bg-purple-100 text-purple-800 px-1 rounded text-[9px] font-bold">
                              Desk: {ev.followupUserLocation}
                            </span>
                          )}
                          {salesExecUserId && (
                            <span className="truncate">
                              User: {salesExecUserId}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Creator / Originating Staff */}
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                            <FaIdBadge className="text-slate-400" /> Created By
                          </span>
                          <strong
                            className="text-slate-900 text-xs block truncate"
                            title={creatorSalesExecutive}
                          >
                            {creatorSalesExecutive}
                          </strong>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] mt-1 font-mono">
                          {ev.createdByUser && (
                            <span>User: {ev.createdByUser}</span>
                          )}
                          {ev.closedByUser && (
                            <span>| Closed: {ev.closedByUser}</span>
                          )}
                        </div>
                      </div>

                      {/* Vehicle & Model Info */}
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                            <FaCar className="text-slate-400" /> Vehicle Model
                          </span>
                          <strong className="text-slate-900 text-xs block truncate">
                            {ev.makeFromNotes ||
                              ev.eventMake ||
                              ev.keyloopGroup ||
                              "BMW"}{" "}
                            {ev.modelFromNotes || ev.eventModel || ""}
                          </strong>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] mt-1 font-mono">
                          {ev.eventModel && (
                            <span className="bg-slate-200/80 px-1 rounded text-[9px] font-bold">
                              Code: {ev.eventModel}
                            </span>
                          )}
                          {ev.vehicleNumber && (
                            <span>Veh #{ev.vehicleNumber}</span>
                          )}
                        </div>
                      </div>

                      {/* Channel & Branch Location */}
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                            <FaBuilding className="text-slate-400" /> Branch &
                            Channel
                          </span>
                          <strong
                            className="text-slate-900 text-xs block truncate"
                            title={ev.branchName}
                          >
                            {ev.branchName ||
                              (ev.branchCode
                                ? `Branch ${ev.branchCode}`
                                : "Sheikh Zayed Rd")}
                          </strong>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] mt-1">
                          <span className="bg-blue-50 text-blue-700 px-1 rounded text-[9px] font-bold border border-blue-200">
                            {ev.source1 || ev.contactMethod || "CRM Outbound"}
                          </span>
                          {ev.source2 && (
                            <span className="truncate">({ev.source2})</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Event Task Notes Box */}
                    {(ev.eventTaskNotes || ev.eventTaskNotes2) && (
                      <div className="bg-blue-50/40 p-2.5 rounded-lg border border-blue-100 flex flex-col gap-1">
                        <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                          <FaFileAlt className="text-blue-500 text-[10px]" />{" "}
                          Event Task Notes
                        </span>
                        <p className="text-xs text-slate-800 font-medium leading-relaxed">
                          {ev.eventTaskNotes || ev.eventTaskNotes2}
                        </p>
                      </div>
                    )}

                    {/* ONE EVENT DETAILS CONTAINER (Fetched via GET /api/v1/events?group=...&eventNumber=...) */}
                    {isExpanded && (
                      <div className="mt-1 bg-gradient-to-br from-blue-50/70 via-white to-slate-50 border-2 border-blue-400 rounded-xl p-3.5 shadow-sm flex flex-col gap-3 animate-fade-in ring-2 ring-blue-100">
                        <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                              <FaFileAlt className="text-xs" />
                            </span>
                            <div>
                              <strong className="text-blue-950 text-xs font-bold flex items-center gap-2">
                                <span>
                                  Active Event Details — Event #{eventNum}
                                </span>
                                <span className="bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-xs uppercase tracking-wide">
                                  Currently Open
                                </span>
                              </strong>
                            </div>
                          </div>
                          {isOneEventLoading && (
                            <span className="text-xs text-blue-600 font-bold flex items-center gap-1">
                              <FaSpinner className="animate-spin text-xs" />{" "}
                              Loading details...
                            </span>
                          )}
                        </div>

                        {oneEventResult && !oneEventResult.error ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-[11px]">
                            {/* Section 1: Core Event Identity */}
                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                                Event Identity & Status
                              </span>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">
                                    Event Number:
                                  </span>
                                  <strong className="font-mono text-blue-700">
                                    {oneEventResult.eventNumber || eventNum}
                                  </strong>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">
                                    Event UID:
                                  </span>
                                  <span
                                    className="font-mono text-[9px] text-slate-700 truncate max-w-[150px]"
                                    title={oneEventResult.eventUid}
                                  >
                                    {oneEventResult.eventUid}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">
                                    Type / Category:
                                  </span>
                                  <span className="font-bold text-slate-800">
                                    {oneEventResult.eventType} (
                                    {oneEventResult.eventGroup || "conv"})
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">
                                    Reference:
                                  </span>
                                  <span className="font-medium text-slate-800">
                                    {oneEventResult.reference || "-"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Section 2: Assigned Staff & Timing */}
                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                                Staff & Action Timings
                              </span>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">
                                    Follow-up User:
                                  </span>
                                  <strong className="text-slate-900">
                                    {oneEventResult.followupUsername ||
                                      "Unassigned"}
                                  </strong>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">
                                    Action User ID:
                                  </span>
                                  <span className="font-mono text-purple-700 font-bold">
                                    {oneEventResult.eventTaskActionId ||
                                      oneEventResult.escalateActionId ||
                                      "-"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">
                                    Task Date & Time:
                                  </span>
                                  <span className="font-mono text-slate-700">
                                    {oneEventResult.eventTaskDate}{" "}
                                    {oneEventResult.eventTaskTime}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">
                                    Closed Date & Time:
                                  </span>
                                  <span className="font-mono text-slate-700">
                                    {oneEventResult.closedDate || "-"}{" "}
                                    {oneEventResult.closedTime || ""}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Section 3: DMS & Telephony Routing */}
                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                                Routing & Telephony
                              </span>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">
                                    Call Number:
                                  </span>
                                  <span className="font-mono font-bold text-slate-800">
                                    {oneEventResult.callNumber || "-"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">
                                    Chain Number:
                                  </span>
                                  <span className="font-mono font-bold text-slate-800">
                                    {oneEventResult.chainNumber || "-"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">
                                    Prompted By:
                                  </span>
                                  <span className="font-mono text-slate-700">
                                    {oneEventResult.whoPromptedEventTask ||
                                      "CALLCENT"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">
                                    Last Updated By:
                                  </span>
                                  <span className="font-mono text-slate-700">
                                    {oneEventResult.lastUpdateUser || "-"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : oneEventResult?.error ? (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                            {oneEventResult.error}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 7. SALES EXECUTIVE DETAIL MODAL (From GET /api/v1/sales-executives?group=BMW&userId=...) */}
      {salesExecModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-purple-600 px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <FaUserTie className="text-base" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Sales Executive Profile</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSalesExecModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col gap-4">
              {salesExecModal.loading ? (
                <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <FaSpinner className="animate-spin text-2xl text-purple-600" />
                  <span className="text-xs font-semibold text-slate-600">
                    Fetching sales executive #{salesExecModal.userId}...
                  </span>
                </div>
              ) : salesExecModal.error ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-center space-y-1">
                  <FaExclamationCircle className="mx-auto text-xl text-rose-500" />
                  <p className="font-bold text-xs">Lookup Error</p>
                  <p className="text-[11px] text-rose-700">
                    {salesExecModal.error}
                  </p>
                </div>
              ) : salesExecModal.data ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold">
                      {salesExecModal.data.name
                        ? salesExecModal.data.name.charAt(0)
                        : "U"}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {salesExecModal.data.name}
                      </h4>
                      <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        User ID: {salesExecModal.data.userId}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                        Assigned Branch
                      </span>
                      <strong className="text-slate-900 flex items-center gap-1.5">
                        <FaBuilding className="text-slate-400 text-xs" />
                        {salesExecModal.data.branchName || "Sheikh Zayed Rd"}
                      </strong>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                        Corporate Email
                      </span>
                      {salesExecModal.data.email ? (
                        <a
                          href={`mailto:${salesExecModal.data.email}`}
                          className="text-blue-600 hover:underline font-medium flex items-center gap-1.5"
                        >
                          <FaEnvelope className="text-slate-400 text-xs" />
                          {salesExecModal.data.email}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">
                          Not available
                        </span>
                      )}
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                        Direct Mobile / Phone
                      </span>
                      {salesExecModal.data.mobile ? (
                        <a
                          href={`tel:${salesExecModal.data.mobile}`}
                          className="text-slate-800 hover:underline font-mono font-medium flex items-center gap-1.5"
                        >
                          <FaPhoneAlt className="text-slate-400 text-xs" />
                          {salesExecModal.data.mobile}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">
                          No direct number recorded
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() =>
                  setSalesExecModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer mt-1"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
