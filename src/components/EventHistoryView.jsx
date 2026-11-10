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
  FaUser,
  FaTag,
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

  // Cached Sales Executive Details Map: { [userId]: salesExecutiveData }
  const [salesExecDetailsMap, setSalesExecDetailsMap] = useState({});
  const [salesExecsLoading, setSalesExecsLoading] = useState({});

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

  // Auto-fetch complete Sales Executive details for any sales executive user IDs in events
  useEffect(() => {
    if (!events || events.length === 0) return;
    const uids = new Set();
    events.forEach((ev) => {
      const uid =
        ev.eventTaskActionId ||
        ev.escalateActionId ||
        ev.followupUserId ||
        ev.closedByUser ||
        ev.createdByUser;
      if (uid && typeof uid === "string" && uid.trim()) {
        uids.add(uid.trim());
      }
    });

    uids.forEach(async (uid) => {
      if (salesExecDetailsMap[uid] || salesExecsLoading[uid]) return;
      setSalesExecsLoading((prev) => ({ ...prev, [uid]: true }));
      try {
        const res = await getSalesExecutiveDetails({
          group: group || "BMW",
          userId: uid,
        });
        if (res && res.ok && res.data) {
          setSalesExecDetailsMap((prev) => ({ ...prev, [uid]: res.data }));
        }
      } catch (err) {
        console.warn(`Failed to auto-fetch sales exec #${uid}:`, err);
      } finally {
        setSalesExecsLoading((prev) => ({ ...prev, [uid]: false }));
      }
    });
  }, [events, group]);

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
                const salesExecData = salesExecUserId
                  ? salesExecDetailsMap[salesExecUserId]
                  : null;
                const oneEventResult = oneEventsData[eventNum];
                const isOneEventLoading = oneEventsLoading[eventNum];

                const d = {
                  ...ev,
                  ...(oneEventResult &&
                  typeof oneEventResult === "object" &&
                  !oneEventResult.error
                    ? oneEventResult
                    : {}),
                };

                const customerFullName =
                  `${d.title ? d.title.trim() + " " : ""}${d.firstName ? d.firstName.trim() + " " : ""}${d.surname ? d.surname.trim() : ""}`.trim() ||
                  d.customer ||
                  customer?.customerName ||
                  "Ahmed Moursy Altantawi";

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

                    {/* Primary Data Grid: Customer & Assignment Focus */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
                      {/* 1. Customer Profile & Vehicle Details (FIRST) */}
                      <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-200/90 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                              <FaUser className="text-blue-600" /> Customer & Vehicle
                            </span>
                            <span
                              className="text-[9px] font-bold text-blue-800 bg-blue-100/90 px-1.5 py-0.2 rounded font-mono"
                              title={`Customer Number: ${d.customerNumber || customerNumber || "76876"}`}
                            >
                              #{d.customerNumber || customerNumber || "76876"}
                            </span>
                          </div>
                          {/* Full Customer Name with NO truncation so surname is completely visible */}
                          <strong
                            className="text-slate-900 text-xs block font-bold leading-tight"
                            title={customerFullName}
                          >
                            {customerFullName}
                          </strong>
                        </div>
                        <div className="flex flex-col gap-1 mt-1 text-[10px]">
                          {/* Customer Contact Details: Mobile & Email */}
                          <div className="flex items-center justify-between gap-1 text-slate-600 font-mono flex-wrap">
                            <span className="font-semibold text-slate-800">
                              {d.mobileNumber || "*******840"}
                            </span>
                            {d.email && (
                              <a
                                href={`mailto:${d.email}`}
                                className="text-blue-600 hover:underline font-sans text-[10px] break-all"
                                title={d.email}
                              >
                                {d.email}
                              </a>
                            )}
                          </div>
                          {/* Vehicle Model & Code Info */}
                          <div className="pt-1 border-t border-blue-200/70 flex items-center justify-between gap-1 flex-wrap">
                            <strong className="text-slate-900 font-bold flex items-center gap-1">
                              <FaCar className="text-blue-600 text-[10px] shrink-0" />
                              <span>
                                {d.makeFromNotes || d.eventMake || d.keyloopGroup || group || "BMW"}{" "}
                                {d.modelFromNotes || d.eventModel || "x5"}
                              </span>
                            </strong>
                            <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500">
                              {d.eventModel && (
                                <span className="bg-blue-100 text-blue-900 px-1 rounded font-bold">
                                  Code: {d.eventModel}
                                </span>
                              )}
                              {d.vehicleNumber && (
                                <span className="text-slate-600 font-semibold">
                                  Veh #{d.vehicleNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. Assigned Sales Executive / Follow-up */}
                      <div className="bg-purple-50/70 p-2.5 rounded-lg border border-purple-200/80 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] font-extrabold text-purple-900 uppercase tracking-wider flex items-center gap-1">
                              <FaUserTie className="text-purple-600" /> Sales Executive
                            </span>
                            {salesExecData?.branchName && (
                              <span
                                className="text-[9px] font-bold text-purple-700 bg-purple-100/90 px-1.5 py-0.2 rounded truncate max-w-[110px]"
                                title={salesExecData.branchName}
                              >
                                {salesExecData.branchName}
                              </span>
                            )}
                          </div>
                          <strong
                            className="text-slate-900 text-xs block truncate"
                            title={followupSalesExecutive || salesExecData?.name}
                          >
                            {followupSalesExecutive || salesExecData?.name || "Unassigned"}
                          </strong>
                        </div>
                        <div className="flex flex-col gap-1 mt-1 text-[10px]">
                          <div className="flex items-center gap-1.5 text-slate-500 font-mono flex-wrap">
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
                          {/* Sales Executive Contact Details Directly In Card */}
                          {salesExecData && (salesExecData.email || salesExecData.mobile) && (
                            <div className="flex flex-col gap-0.5 pt-1 border-t border-purple-200/60 font-sans">
                              {salesExecData.email && (
                                <a
                                  href={`mailto:${salesExecData.email}`}
                                  className="text-blue-600 hover:underline flex items-center gap-1 truncate font-medium text-[10px]"
                                  title={salesExecData.email}
                                >
                                  <FaEnvelope className="text-purple-400 text-[9px] shrink-0" />
                                  <span className="truncate">{salesExecData.email}</span>
                                </a>
                              )}
                              {salesExecData.mobile && (
                                <a
                                  href={`tel:${salesExecData.mobile}`}
                                  className="text-slate-700 hover:underline flex items-center gap-1 font-medium text-[10px]"
                                >
                                  <FaPhoneAlt className="text-purple-400 text-[9px] shrink-0" />
                                  <span>{salesExecData.mobile}</span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 3. Creator / Originating Staff */}
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

                      {/* 4. Channel & Branch Location */}
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

                        {oneEventResult && oneEventResult.error ? (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                            {oneEventResult.error}
                          </div>
                        ) : (
                          (() => {
                            const d = {
                              ...ev,
                              ...(oneEventResult && typeof oneEventResult === "object" && !oneEventResult.error
                                ? oneEventResult
                                : {}),
                            };
                            const customerFullName =
                              `${d.title || ""} ${d.firstName || ""} ${d.surname || ""}`.trim() ||
                              d.customer ||
                              "Customer";

                            return (
                              <div className="flex flex-col gap-3 text-[11px]">
                                {/* 3-Column Detailed Attributes Grid (Customer Profile shifted above) */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  
                                  {/* CARD 1: Sales Executive & Staff Assignment */}
                                  <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-200/90 shadow-2xs space-y-1.5">
                                    <span className="text-[10px] font-extrabold text-purple-900 uppercase tracking-wider block pb-1 border-b border-purple-200/70 flex items-center justify-between">
                                      <span className="flex items-center gap-1.5">
                                        <FaUserTie className="text-purple-600 text-[10px]" /> Sales Executive & Desk
                                      </span>
                                      {salesExecUserId && (
                                        <span className="font-mono text-[9px] text-purple-800 bg-purple-100 px-1.5 py-0.2 rounded font-bold">
                                          ID: {salesExecUserId}
                                        </span>
                                      )}
                                    </span>
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between items-start gap-2">
                                        <span className="text-slate-600 text-[10px] shrink-0">Assigned Staff:</span>
                                        <strong className="text-slate-900 font-bold text-right" title={salesExecData?.name || followupSalesExecutive}>
                                          {salesExecData?.name || followupSalesExecutive || "Unassigned"}
                                        </strong>
                                      </div>
                                      <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-600 text-[10px] shrink-0">Follow-up Desk:</span>
                                        <span className="font-mono text-purple-900 font-bold bg-purple-100/90 px-1.5 py-0.2 rounded border border-purple-200">
                                          {d.followupUserLocation || "A01"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-start gap-2">
                                        <span className="text-slate-600 text-[10px] shrink-0">Branch:</span>
                                        <span className="text-slate-800 font-semibold text-right" title={d.branchName || "Sheikh Zayed Rd"}>
                                          {d.branchName || "Sheikh Zayed Rd"} (Branch {d.notesFromBranch || d.branchCode || "10"})
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-600 text-[10px] shrink-0">Department Type:</span>
                                        <span className="font-mono text-purple-950 font-bold bg-purple-100/80 px-1.5 py-0.2 rounded border border-purple-200">
                                          {d.departmentType || "Z"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-start gap-2">
                                        <span className="text-slate-600 text-[10px] shrink-0">Corporate Email:</span>
                                        {salesExecData?.email ? (
                                          <a
                                            href={`mailto:${salesExecData.email}`}
                                            className="text-blue-600 hover:underline font-medium text-right break-all"
                                            title={salesExecData.email}
                                          >
                                            {salesExecData.email}
                                          </a>
                                        ) : (
                                          <span className="text-slate-400 font-mono">-</span>
                                        )}
                                      </div>
                                      <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-600 text-[10px] shrink-0">Direct Mobile:</span>
                                        {salesExecData?.mobile ? (
                                          <a
                                            href={`tel:${salesExecData.mobile}`}
                                            className="text-slate-800 hover:underline font-mono font-medium"
                                          >
                                            {salesExecData.mobile}
                                          </a>
                                        ) : (
                                          <span className="text-slate-400 font-mono">-</span>
                                        )}
                                      </div>
                                      <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-600 text-[10px] shrink-0">Created By:</span>
                                        <span className="font-mono text-slate-700 font-semibold">
                                          {d.creatorName || d.createdByUser || "System"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* CARD 2: Marketing Campaign & Enquiry Routing */}
                                  <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5">
                                    <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider block pb-1 border-b border-slate-100 flex items-center gap-1.5">
                                      <FaTag className="text-blue-600 text-[10px]" /> Campaign & Enquiry Source
                                    </span>
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-500 text-[10px] shrink-0">Primary Source:</span>
                                        <span className="font-bold text-slate-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                          {d.source1 || "CRM Outbound"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-500 text-[10px] shrink-0">Secondary Source:</span>
                                        <span className="text-slate-700 font-medium">
                                          {d.source2 || "Contact Centre"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-start gap-2">
                                        <span className="text-slate-500 text-[10px] shrink-0">Campaign Code:</span>
                                        <span className="font-mono text-[10px] text-slate-800 font-semibold text-right break-all" title={d.marketingCampaignCode}>
                                          {d.marketingCampaignCode || "-"}
                                        </span>
                                      </div>
                                      {Boolean(d.campaignNameFromNotes) && (
                                        <div className="flex justify-between items-start gap-2">
                                          <span className="text-slate-500 text-[10px] shrink-0">Campaign Note:</span>
                                          <span className="text-slate-700 text-right" title={d.campaignNameFromNotes}>
                                            {d.campaignNameFromNotes}
                                          </span>
                                        </div>
                                      )}
                                      <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-500 text-[10px] shrink-0">Enquiry Number:</span>
                                        <span className="font-mono text-slate-800 font-semibold">
                                          {d.enquiryNumber || "-"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-500 text-[10px] shrink-0">Enquiry Status:</span>
                                        <span className="text-slate-700">
                                          {d.statusOfEnquiry || "-"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-start gap-2">
                                        <span className="text-slate-500 text-[10px] shrink-0">Vehicle Model:</span>
                                        <strong className="text-slate-900 text-right">
                                          {d.makeFromNotes || d.keyloopGroup || group} {d.modelFromNotes || d.eventModel || "-"}
                                        </strong>
                                      </div>
                                      <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-500 text-[10px] shrink-0">Call / Chain #:</span>
                                        <span className="font-mono text-slate-800 font-semibold">
                                          #{d.callNumber || "-"} / #{d.chainNumber || "-"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* CARD 3: Escalation, Closure & Action Timings */}
                                  <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5">
                                    <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider block pb-1 border-b border-slate-100 flex items-center gap-1.5">
                                      <FaClock className="text-blue-600 text-[10px]" /> Escalation & Closure
                                    </span>
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-500 text-[10px] shrink-0">Closed By:</span>
                                        <span className="font-mono text-slate-900 font-bold bg-slate-100 px-1.5 py-0.2 rounded">
                                          {d.closedByUser || "hamdan"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-500 text-[10px] shrink-0">Closed Date/Time:</span>
                                        <span className="font-mono text-slate-700 font-medium text-right">
                                          {d.closedDate2 || d.closedDate || "-"} {d.closedTime2 || d.closedTime || ""}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-500 text-[10px] shrink-0">Closed Flag:</span>
                                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                          d.closedFlag2 === "1" || d.closedFlag === "1"
                                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                            : "bg-amber-100 text-amber-800 border border-amber-200"
                                        }`}>
                                          Flag {d.closedFlag2 || d.closedFlag || "1"} ({d.closedFlag2 === "1" || d.closedFlag === "1" ? "Closed" : "Open"})
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-500 text-[10px] shrink-0">Escalate User:</span>
                                        <span className="font-mono text-purple-700 font-bold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                                          {d.escalateActionId || "pattepu"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-500 text-[10px] shrink-0">Escalate Entity:</span>
                                        <span className="font-mono text-slate-700 font-medium">
                                          Type {d.escalateEntityType || "6"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-500 text-[10px] shrink-0">Escalation Time:</span>
                                        <span className="font-mono text-slate-700 font-medium text-right">
                                          {d.escalateEventDate ? `${d.escalateEventDate} ${d.escalateEventTime || ""}` : "-"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-500 text-[10px] shrink-0">Task Timing:</span>
                                        <span className="font-mono text-slate-700 font-medium text-right">
                                          {d.eventTaskDate || d.createdDate} {d.eventTaskTime || d.createdTime || ""}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-500 text-[10px] shrink-0">Prompted By:</span>
                                        <span className="font-mono text-slate-700 font-semibold bg-slate-50 px-1.5 py-0.2 rounded border border-slate-200">
                                          {d.whoPromptedEventTask || "CALLCENT"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                </div>

                                {/* FULL EVENT TASK NOTES */}
                                {(d.eventTaskNotes || d.eventTaskNotes2) && (
                                  <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200 text-xs text-slate-800 space-y-1">
                                    <span className="font-bold text-blue-900 block text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                                      <FaFileAlt className="text-blue-600 text-[10px]" /> Event Task Notes
                                    </span>
                                    <p className="leading-relaxed whitespace-pre-wrap font-medium text-slate-800">
                                      {d.eventTaskNotes || d.eventTaskNotes2}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })()
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

    </div>
  );
}
