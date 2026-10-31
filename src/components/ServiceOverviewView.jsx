import React, { useState, useEffect, useMemo } from "react";
import { useCustomer } from "../context/CustomerContext";
import { apiFetch } from "../utils/api";
import {
  FaCar,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaShieldAlt,
  FaFileAlt,
  FaHistory,
  FaRedo,
  FaExchangeAlt,
  FaBoxes,
  FaSearch,
  FaWrench,
  FaStickyNote,
  FaClipboardList,
  FaMapMarkerAlt,
  FaUserTie,
} from "react-icons/fa";
import VehicleOwnershipTransferModal from "./VehicleOwnershipTransferModal";
import VehiclePackagesModal from "./VehiclePackagesModal";

export default function ServiceOverviewView() {
  const {
    customer,
    vehicles,
    selectedVin,
    vehicleDetails,
    vehiclesLoading,
    selectVehicleByVin,
    group: contextGroup,
  } = useCustomer();

  const group =
    contextGroup ||
    customer?.keyloopGroup ||
    new URLSearchParams(window.location.search).get("group") ||
    "";
  const customerNumber = customer?.customerNumber || "";

  // 1. Vehicle Summaries by Customer ID State: GET /api/v1/vehicles?group={group}&customerNumber={customerNumber}
  const [customerVehicleList, setCustomerVehicleList] = useState([]);
  const [vehicleListLoading, setVehicleListLoading] = useState(false);

  // 2. Vehicle Summary by Vehicle ID State: GET /api/v1/vehicles/{group}/{vin}
  const [vehicleSummaryData, setVehicleSummaryData] = useState(null);

  // 3. Service Intervals, Contracts, Bookings & Eligibility States
  const [nextServiceData, setNextServiceData] = useState(null);
  const [lastServiceData, setLastServiceData] = useState(null);
  const [warrantyData, setWarrantyData] = useState(null);
  const [contractData, setContractData] = useState(null);
  const [serviceEligibilityData, setServiceEligibilityData] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [bookingBatteryId, setBookingBatteryId] = useState("");
  const [loadingOverviewApis, setLoadingOverviewApis] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isPackagesModalOpen, setIsPackagesModalOpen] = useState(false);
  const [isPackagesInlineExpanded, setIsPackagesInlineExpanded] =
    useState(false);
  const [packageInlineFilter, setPackageInlineFilter] = useState("");

  // Combined vehicle list prioritizing the direct API response
  const allVehicles =
    customerVehicleList.length > 0 ? customerVehicleList : vehicles || [];
  const currentVehicle =
    vehicleSummaryData ||
    allVehicles.find((v) => v.vin === selectedVin) ||
    vehicleDetails ||
    (allVehicles.length > 0 ? allVehicles[0] : null);
  const vin = selectedVin || currentVehicle?.vin || "";

  // Packages list from current vehicle or summary data
  const packagesList = useMemo(() => {
    if (currentVehicle?.packages && Array.isArray(currentVehicle.packages)) {
      return currentVehicle.packages;
    }
    if (
      vehicleSummaryData?.packages &&
      Array.isArray(vehicleSummaryData.packages)
    ) {
      return vehicleSummaryData.packages;
    }
    return [];
  }, [currentVehicle, vehicleSummaryData]);

  const filteredInlinePackages = useMemo(() => {
    return packagesList.filter((p) => {
      if (!packageInlineFilter.trim()) return true;
      return (p.packageDescription || "")
        .toLowerCase()
        .includes(packageInlineFilter.toLowerCase());
    });
  }, [packagesList, packageInlineFilter]);

  const displayedInlinePackages =
    isPackagesInlineExpanded || packageInlineFilter.trim()
      ? filteredInlinePackages
      : filteredInlinePackages.slice(0, 8);

  // Fetch Vehicle Summaries by Customer ID (GET /api/v1/vehicles?group={group}&customerNumber={customerNumber})
  const fetchCustomerVehicleSummaries = async () => {
    if (!customerNumber || !group) return;
    setVehicleListLoading(true);
    try {
      const res = await apiFetch(
        `/api/v1/vehicles?group=${encodeURIComponent(group)}&customerNumber=${encodeURIComponent(customerNumber)}`,
      );
      let list = [];
      if (res && res.ok && res.data) {
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res.data.vehicles)) {
          list = res.data.vehicles;
        } else if (Array.isArray(res.data.data)) {
          list = res.data.data;
        } else if (
          typeof res.data === "object" &&
          (res.data.vin || res.data.chassisNumber)
        ) {
          list = [res.data];
        }
      }
      setCustomerVehicleList(list);

      // If no vehicle is selected yet, automatically select the first vehicle from the customer's fleet
      if (list.length > 0 && !selectedVin) {
        const firstVin = list[0].vin || list[0].chassisNumber;
        if (firstVin) {
          selectVehicleByVin(firstVin);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch customer vehicle summaries:", err);
      setCustomerVehicleList([]);
    } finally {
      setVehicleListLoading(false);
    }
  };

  // Fetch specific Vehicle Summary by VIN + service intervals & contracts
  const fetchOverviewData = async () => {
    if (!vin) return;
    setLoadingOverviewApis(true);

    // Reset data
    setNextServiceData(null);
    setLastServiceData(null);
    setWarrantyData(null);
    setContractData(null);
    setServiceEligibilityData(null);
    setActiveBooking(null);
    setBookingBatteryId("");

    // A. Vehicle Summary by Vehicle ID (VIN) API: GET /api/v1/vehicles/{group}/{vin}
    apiFetch(`/api/v1/vehicles/${group}/${vin}`)
      .then((res) => {
        if (res && res.ok && res.data && typeof res.data === "object") {
          setVehicleSummaryData(res.data);
        } else {
          setVehicleSummaryData(null);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch vehicle summary by VIN:", err);
        setVehicleSummaryData(null);
      });

    // B. Service Eligibility API: GET /api/v1/vehicles/{group}/{vin}/service-eligibility
    apiFetch(`/api/v1/vehicles/${group}/${vin}/service-eligibility`)
      .then((res) => {
        if (res && res.ok && res.data && typeof res.data === "object") {
          setServiceEligibilityData(res.data);
          const bId =
            res.data.batteryId ||
            res.data.batteryID ||
            res.data.battery_id ||
            "";
          if (bId) setBookingBatteryId(bId);
        } else {
          setServiceEligibilityData(null);
        }
      })
      .catch(() => {
        setServiceEligibilityData(null);
      });

    // C. Next Service Due API: GET /api/v1/vehicles/{group}/{vin}/next-service
    apiFetch(`/api/v1/vehicles/${group}/${vin}/next-service`)
      .then((res) => {
        if (res && res.ok && res.data) {
          setNextServiceData(res.data);
        } else {
          setNextServiceData(null);
        }
      })
      .catch(() => {
        setNextServiceData(null);
      });

    // D. Last Service Details API: GET /api/v1/vehicles/{group}/{vin}/last-service
    apiFetch(`/api/v1/vehicles/${group}/${vin}/last-service`)
      .then((res) => {
        if (res && res.ok && res.data) {
          setLastServiceData(res.data);
        } else {
          setLastServiceData(null);
        }
      })
      .catch(() => {
        setLastServiceData(null);
      });

    // E. Warranty Status API: GET /api/v1/vehicles/{group}/{vin}/warranty
    apiFetch(`/api/v1/vehicles/${group}/${vin}/warranty`)
      .then((res) => {
        if (
          res &&
          res.ok &&
          res.data &&
          typeof res.data === "object" &&
          Object.keys(res.data).length > 0
        ) {
          setWarrantyData(res.data);
        } else {
          setWarrantyData(null);
        }
      })
      .catch(() => {
        setWarrantyData(null);
      });

    // F. Service Contract API: GET /api/v1/vehicles/{group}/{vin}/service-contract
    apiFetch(`/api/v1/vehicles/${group}/${vin}/service-contract`)
      .then((res) => {
        if (
          res &&
          res.ok &&
          res.data &&
          typeof res.data === "object" &&
          Object.keys(res.data).length > 0
        ) {
          setContractData(res.data);
        } else {
          setContractData(null);
        }
      })
      .catch(() => {
        setContractData(null);
      })
      .finally(() => {
        setLoadingOverviewApis(false);
      });

    // G. Open Service Bookings API (to retrieve Active Booking & Battery ID)
    apiFetch(`/api/v1/vehicles/${group}/${vin}/service-bookings`)
      .then((res) => {
        let list = [];
        if (res && res.ok && res.data) {
          list = Array.isArray(res.data) ? res.data : [res.data];
        }
        if (list.length > 0) {
          setActiveBooking(list[0]);
          const match = list.find(
            (b) =>
              b.batteryId ||
              b.batteryID ||
              b.battery_id ||
              b.vehicle?.batteryId ||
              b.vehicle?.batteryID,
          );
          const bId =
            match?.batteryId ||
            match?.batteryID ||
            match?.battery_id ||
            match?.vehicle?.batteryId ||
            match?.vehicle?.batteryID ||
            list[0]?.batteryId ||
            "";
          if (bId) setBookingBatteryId(bId);
        } else if (customerNumber) {
          apiFetch(`/api/v1/customers/${group}/${customerNumber}/service-bookings`)
            .then((cRes) => {
              let cList = [];
              if (cRes && cRes.ok && cRes.data) {
                cList = Array.isArray(cRes.data) ? cRes.data : [cRes.data];
              }
              const cMatch = cList.find(
                (item) => (item.vin && vin && item.vin === vin) || item.batteryId || item.batteryID,
              );
              if (cMatch) {
                setActiveBooking(cMatch);
                const bId =
                  cMatch.batteryId ||
                  cMatch.batteryID ||
                  cMatch.battery_id ||
                  cMatch.vehicle?.batteryId ||
                  "";
                if (bId) setBookingBatteryId(bId);
              } else if (cList.length > 0) {
                setActiveBooking(cList[0]);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (customerNumber) {
          apiFetch(`/api/v1/customers/${group}/${customerNumber}/service-bookings`)
            .then((cRes) => {
              let cList = [];
              if (cRes && cRes.ok && cRes.data) {
                cList = Array.isArray(cRes.data) ? cRes.data : [cRes.data];
              }
              const cMatch = cList.find(
                (item) => (item.vin && vin && item.vin === vin) || item.batteryId || item.batteryID,
              );
              if (cMatch) {
                setActiveBooking(cMatch);
                const bId =
                  cMatch.batteryId ||
                  cMatch.batteryID ||
                  cMatch.battery_id ||
                  cMatch.vehicle?.batteryId ||
                  "";
                if (bId) setBookingBatteryId(bId);
              } else if (cList.length > 0) {
                setActiveBooking(cList[0]);
              }
            })
            .catch(() => {});
        }
      });
  };

  useEffect(() => {
    fetchCustomerVehicleSummaries();
  }, [group, customerNumber]);

  useEffect(() => {
    fetchOverviewData();
  }, [group, vin]);

  const handleRefreshAll = () => {
    fetchCustomerVehicleSummaries();
    fetchOverviewData();
  };

  const isGlobalLoading =
    (vehiclesLoading || vehicleListLoading) && !currentVehicle;

  if (isGlobalLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-100 flex items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
          <svg
            className="animate-spin h-5 w-5 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading vehicle summaries for customer...
        </div>
      </div>
    );
  }

  if (!currentVehicle) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-xs border border-gray-100 text-center text-xs text-gray-500 font-medium">
        No vehicle summaries found for customer #{customerNumber || "N/A"}.
      </div>
    );
  }

  const registrationNumber =
    currentVehicle?.registrationNumber ||
    currentVehicle?.plateNumber ||
    currentVehicle?.plate ||
    "";
  const registrationDate = currentVehicle?.registrationDate || "";
  const brand = currentVehicle?.brand || currentVehicle?.make || "";
  const model = currentVehicle?.model || "";
  const variant = currentVehicle?.variant || "";
  const description =
    currentVehicle?.description ||
    currentVehicle?.vehicle ||
    `${brand} ${model} ${variant}`.trim();
  const modelYear = currentVehicle?.modelYear || currentVehicle?.year || "";
  const fuelType = currentVehicle?.fuelType || "";
  const colour = currentVehicle?.colour || currentVehicle?.color || "";
  const mileageKm =
    currentVehicle?.mileageKm !== undefined
      ? currentVehicle.mileageKm
      : currentVehicle?.mileage !== undefined
        ? currentVehicle.mileage
        : currentVehicle?.odometerKm;
  const deliveryDate = currentVehicle?.deliveryDate || "";
  const stockProgress = currentVehicle?.stockProgress || "";
  const eligibility = currentVehicle?.eligibility || "";
  const batteryId =
    bookingBatteryId ||
    currentVehicle?.batteryId ||
    currentVehicle?.batteryID ||
    currentVehicle?.battery_id ||
    "";
  const vehicleContracts =
    currentVehicle?.contracts ||
    currentVehicle?.insuranceContracts ||
    (Array.isArray(currentVehicle?.insurance)
      ? currentVehicle.insurance
      : null);

  const isWarrantyActive = warrantyData?.status === "ACTIVE";
  const isServiceContractActive = contractData?.status === "ACTIVE";

  // Fallbacks: if nextServiceData or lastServiceData standalone endpoint is empty, use values from Vehicle Summary API
  const nextServiceDate =
    nextServiceData?.nextServiceDate ||
    currentVehicle?.nextServiceDate ||
    currentVehicle?.nextServiceDue;
  const hasNextService = Boolean(
    nextServiceDate ||
    (nextServiceData &&
      (nextServiceData.nextServiceOdometerKm !== undefined ||
        nextServiceData.dueMileageKm !== undefined)),
  );

  const lastServiceDate =
    lastServiceData?.lastServiceDate || currentVehicle?.lastServiceDate;
  const lastServiceOdometer =
    lastServiceData?.lastServiceOdometerKm !== undefined &&
    lastServiceData?.lastServiceOdometerKm !== null
      ? lastServiceData.lastServiceOdometerKm
      : lastServiceData?.lastServiceMileageKm !== undefined &&
          lastServiceData?.lastServiceMileageKm !== null
        ? lastServiceData.lastServiceMileageKm
        : lastServiceData?.mileageKm !== undefined &&
            lastServiceData?.mileageKm !== null
          ? lastServiceData.mileageKm
          : currentVehicle?.lastServiceOdometerKm !== undefined
            ? currentVehicle.lastServiceOdometerKm
            : null;

  const hasLastService = Boolean(
    lastServiceDate ||
    lastServiceOdometer !== null ||
    (lastServiceData &&
      (lastServiceData.serviceType || lastServiceData.branch)),
  );

  const hasWarranty = Boolean(
    warrantyData &&
    typeof warrantyData === "object" &&
    (warrantyData.status ||
      warrantyData.provider ||
      warrantyData.expiryDate ||
      warrantyData.contractType),
  );
  const hasContract = Boolean(
    contractData &&
    typeof contractData === "object" &&
    (contractData.status ||
      contractData.provider ||
      contractData.expiryDate ||
      contractData.contractType),
  );
  const hasInsurance = Boolean(
    vehicleContracts &&
    (Array.isArray(vehicleContracts)
      ? vehicleContracts.length > 0
      : Object.keys(vehicleContracts).length > 0),
  );

  return (
    <div className="flex flex-col gap-4 text-xs font-sans">
      {/* Primary Vehicle Summary Card */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-100 flex flex-col gap-4">
        {/* Header & Multi-Vehicle Selector */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-gray-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FaCar className="text-base" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-900 text-base leading-tight">
                  {brand || ""}{" "}
                  {description || `${model || ""} ${variant || ""}`.trim()}
                </h2>
                {allVehicles.length > 1 && (
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                    {allVehicles.length} Vehicles in Fleet
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                Keyloop Group: {group}{" "}
                {customerNumber ? `| Customer #${customerNumber}` : ""}{" "}
                {vin ? `| VIN: ${vin}` : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {allVehicles.length > 1 && (
              <div className="flex items-center gap-2 bg-blue-50/60 p-1.5 rounded-lg border border-blue-100">
                <span className="text-[11px] font-bold text-blue-900 uppercase">
                  Select Vehicle:
                </span>
                <select
                  value={vin}
                  onChange={(e) => selectVehicleByVin(e.target.value)}
                  className="bg-white text-xs font-bold text-gray-900 border border-blue-300 rounded px-2.5 py-1 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
                >
                  {allVehicles.map((v) => {
                    const vVin = v.vin || v.chassisNumber;
                    const vPlate =
                      v.registrationNumber || v.plateNumber || v.plate;
                    const vDesc =
                      v.description ||
                      `${v.brand || ""} ${v.model || ""}`.trim() ||
                      "Vehicle";
                    return (
                      <option key={vVin} value={vVin}>
                        {vDesc} {vPlate ? `(${vPlate})` : `(${vVin})`}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Transfer / Link Vehicle Ownership to Existing or New Customer"
            >
              <FaExchangeAlt className="text-[11px]" />
              <span className="hidden sm:inline">Transfer Ownership</span>
            </button>

            <button
              onClick={handleRefreshAll}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer transition-colors"
              title="Refresh Vehicle Summaries"
            >
              <FaRedo
                className={`text-xs ${loadingOverviewApis || vehicleListLoading ? "animate-spin text-blue-600" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Multi-Vehicle Garage Strip (Rendered when customer owns multiple cars) */}
        {allVehicles.length > 1 && (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar border-b border-gray-100 pb-3">
            <span className="text-[10px] font-extrabold uppercase text-gray-400 shrink-0">
              Garage ({allVehicles.length}):
            </span>
            {allVehicles.map((v) => {
              const vVin = v.vin || v.chassisNumber;
              const isSelected = vVin === vin;
              const vPlate = v.registrationNumber || v.plateNumber || v.plate;
              const vTitle =
                v.description ||
                `${v.brand || ""} ${v.model || ""}`.trim() ||
                "Vehicle";
              const vOdo = v.mileageKm !== undefined ? v.mileageKm : v.mileage;

              return (
                <button
                  key={vVin}
                  type="button"
                  onClick={() => selectVehicleByVin(vVin)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-left transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-2xs font-bold"
                      : "bg-slate-50 hover:bg-slate-100 text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <FaCar
                    className={`text-xs ${isSelected ? "text-white" : "text-blue-600"}`}
                  />
                  <div>
                    <span className="font-bold text-xs block leading-tight">
                      {vTitle}
                    </span>
                    <span
                      className={`text-[10px] font-mono block ${isSelected ? "text-blue-100" : "text-gray-400"}`}
                    >
                      {vPlate ? `Plate: ${vPlate}` : ""}{" "}
                      {vVin ? `• VIN: ${vVin.slice(-6)}` : ""}{" "}
                      {vOdo ? `• ${Number(vOdo).toLocaleString()} KM` : ""}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 1. Open Booking Summary Card (Change 29) with Battery ID (Change 28) */}
        {activeBooking ? (
          <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/80 p-4 rounded-xl border border-blue-200 flex flex-col gap-2.5 shadow-2xs">
            <div className="flex items-center justify-between text-blue-900 font-bold text-xs flex-wrap gap-1 border-b border-blue-100 pb-2">
              <span className="flex items-center gap-2">
                <FaWrench className="text-blue-600" />
                <span>Open Workshop Booking #{activeBooking.bookingId || activeBooking.jobNumber || activeBooking.wipNumber || 'Active'}</span>
              </span>
              <span className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wide">
                {activeBooking.status || 'Booked'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <span className="text-gray-500 block text-[10px] font-semibold uppercase">Booking Date & Time</span>
                <span className="font-bold text-gray-900 flex items-center gap-1">
                  <FaCalendarAlt className="text-blue-500 text-[10px]" />
                  {activeBooking.date || activeBooking.createdDate || 'Scheduled'} {activeBooking.time ? `at ${activeBooking.time}:00` : ''}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] font-semibold uppercase">Service Branch</span>
                <span className="font-bold text-gray-900 flex items-center gap-1 truncate" title={activeBooking.branch?.name || (typeof activeBooking.branch === 'string' ? activeBooking.branch : 'AGMC Service Centre')}>
                  <FaMapMarkerAlt className="text-blue-500 text-[10px] shrink-0" />
                  <span className="truncate">{activeBooking.branch?.name || (typeof activeBooking.branch === 'string' ? activeBooking.branch : 'AGMC Service Centre')}</span>
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] font-semibold uppercase">Service Advisor</span>
                <span className="font-bold text-gray-900 flex items-center gap-1 truncate">
                  <FaUserTie className="text-blue-500 text-[10px] shrink-0" />
                  <span className="truncate">{activeBooking.advisor?.name || activeBooking.advisor || activeBooking.bookedBy || 'Assigned Advisor'}</span>
                </span>
              </div>
              <div>
                <span className="text-blue-900 block text-[10px] font-bold uppercase">Battery ID</span>
                <span className="font-mono font-bold text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-300 inline-block text-[11px]">
                  {batteryId || activeBooking.batteryId || activeBooking.batteryID || 'N/A'}
                </span>
              </div>
            </div>
            {(activeBooking.serviceType || activeBooking.description || activeBooking.odometerKm) && (
              <div className="pt-2 border-t border-blue-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="text-gray-400">Service Type:</span>
                  <span className="font-semibold text-gray-800">{activeBooking.serviceType || activeBooking.description || 'Periodic Maintenance / Inspection'}</span>
                </span>
                {activeBooking.odometerKm && (
                  <span className="flex items-center gap-1 font-mono">
                    <span className="text-gray-400">Booking Mileage:</span>
                    <span className="font-bold text-gray-900">{Number(activeBooking.odometerKm).toLocaleString()} KM</span>
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50/80 p-3 rounded-xl border border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <FaWrench className="text-gray-400 text-sm" />
              <div>
                <span className="font-bold text-gray-800 text-xs">Open Workshop Booking Summary:</span>
                <span className="ml-1 text-gray-600">No active workshop bookings currently scheduled.</span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-gray-200/80 text-gray-600 px-2 py-0.5 rounded uppercase">
              No Open Bookings
            </span>
          </div>
        )}

        {/* 2. Next & Last Service Banner Grid */}
        {(hasNextService || hasLastService) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Next Service Due Box */}
            {hasNextService && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 p-3.5 rounded-xl border border-blue-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-blue-900 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <FaCalendarAlt className="text-blue-600" /> Next Service Due
                  </span>
                  {nextServiceDate && (
                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-mono">
                      {nextServiceDate}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  {nextServiceData?.nextServiceOdometerKm !== undefined &&
                    nextServiceData?.nextServiceOdometerKm !== null && (
                      <div>
                        <span className="text-gray-500 block text-[10px]">
                          Due Odometer:
                        </span>
                        <span className="font-extrabold text-gray-900">
                          {nextServiceData.nextServiceOdometerKm.toLocaleString()}{" "}
                          KM
                        </span>
                      </div>
                    )}
                  {nextServiceData?.dueMileageKm !== undefined &&
                    nextServiceData?.dueMileageKm !== null && (
                      <div>
                        <span className="text-gray-500 block text-[10px]">
                          Interval Limit:
                        </span>
                        <span className="font-extrabold text-gray-900">
                          {nextServiceData.dueMileageKm.toLocaleString()} KM
                        </span>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Last Service Details Box */}
            {hasLastService && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50/60 p-3.5 rounded-xl border border-emerald-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-emerald-900 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <FaHistory className="text-emerald-600" /> Last Service
                    Details
                  </span>
                  {lastServiceDate && (
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-mono">
                      {lastServiceDate}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                  {lastServiceOdometer !== null && (
                    <div>
                      <span className="text-gray-500 block text-[10px]">
                        Service Odometer:
                      </span>
                      <span className="font-extrabold text-gray-900">
                        {Number(lastServiceOdometer).toLocaleString()} KM
                      </span>
                    </div>
                  )}
                  {lastServiceData?.serviceType && (
                    <div>
                      <span className="text-gray-500 block text-[10px]">
                        Service Type:
                      </span>
                      <span
                        className="font-bold text-gray-900 truncate block"
                        title={lastServiceData.serviceType}
                      >
                        {lastServiceData.serviceType}
                      </span>
                    </div>
                  )}
                  {lastServiceData?.branch && (
                    <div>
                      <span className="text-gray-500 block text-[10px]">
                        Service Branch:
                      </span>
                      <span
                        className="font-bold text-gray-900 truncate block"
                        title={lastServiceData.branch}
                      >
                        {lastServiceData.branch}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Dynamic Vehicle Specifications Grid (with Battery ID - Change 28 & Service Eligibility - Change 26) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-4 text-xs pt-2">
          {vin && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">
                VIN
              </span>
              <span className="font-mono font-bold text-gray-900 text-[11px]">
                {vin}
              </span>
            </div>
          )}

          {registrationNumber && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">
                Registration Number
              </span>
              <span className="font-bold text-gray-900">
                {registrationNumber}
              </span>
            </div>
          )}

          {registrationDate && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">
                Registration Date
              </span>
              <span className="font-medium text-gray-800">
                {registrationDate}
              </span>
            </div>
          )}

          {(brand || model || variant) && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">
                Brand / Model / Variant
              </span>
              <span className="font-bold text-gray-900">
                {brand || ""} {model || ""} ({variant || "N/A"})
              </span>
            </div>
          )}

          {description && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">
                Description
              </span>
              <span className="font-medium text-gray-800">{description}</span>
            </div>
          )}

          {modelYear && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">
                Model Year
              </span>
              <span className="font-bold text-gray-900">{modelYear}</span>
            </div>
          )}

          {fuelType && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">
                Fuel Type
              </span>
              <span className="font-semibold text-gray-800">{fuelType}</span>
            </div>
          )}

          {colour && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">
                Colour
              </span>
              <span className="font-semibold text-gray-800">{colour}</span>
            </div>
          )}

          {mileageKm !== undefined && mileageKm !== null && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">
                Current Mileage
              </span>
              <span className="font-black text-gray-900 text-sm">
                {Number(mileageKm).toLocaleString()} KM
              </span>
            </div>
          )}

          {deliveryDate && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">
                Delivery Date
              </span>
              <span className="font-medium text-gray-800">{deliveryDate}</span>
            </div>
          )}

          {stockProgress && (
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">
                Stock Progress
              </span>
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block">
                {stockProgress}
              </span>
            </div>
          )}

          {/* Service Eligibility in Specs (Change 26) */}
          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">
              Service Eligibility
            </span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block text-[11px]">
              {serviceEligibilityData?.status || serviceEligibilityData?.eligibility || eligibility || "ELIGIBLE"}
            </span>
          </div>

          {/* Battery ID in Specs (Change 28) */}
          <div>
            <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">
              Battery ID
            </span>
            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block text-[11px]">
              {batteryId || "N/A"}
            </span>
          </div>
        </div>

        {/* 4. Service Eligibility Section (Change 26) */}
        <div className="bg-gradient-to-r from-emerald-50/70 to-teal-50/50 p-4 rounded-xl border border-emerald-200 flex flex-col gap-2.5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                <FaCheckCircle />
              </div>
              <div>
                <h3 className="font-bold text-emerald-950 text-xs leading-tight">Service Eligibility</h3>
                <p className="text-[10px] text-emerald-700">Vehicle service program, warranty validity and DMS coverage</p>
              </div>
            </div>
            <span className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
              (serviceEligibilityData?.status === 'ELIGIBLE' || serviceEligibilityData?.eligibility?.toUpperCase().includes('ELIGIBLE') || eligibility?.toUpperCase().includes('ELIGIBLE') || isServiceContractActive || isWarrantyActive)
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              {serviceEligibilityData?.status || serviceEligibilityData?.eligibility || eligibility || (isServiceContractActive || isWarrantyActive ? 'ELIGIBLE' : 'STANDARD')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
              <span className="text-[10px] font-semibold text-gray-500 block uppercase">Eligibility Status</span>
              <span className="font-bold text-emerald-800 text-xs">
                {serviceEligibilityData?.status || serviceEligibilityData?.eligibility || eligibility || 'Eligible for Service'}
              </span>
            </div>

            <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
              <span className="text-[10px] font-semibold text-gray-500 block uppercase">Service Contract</span>
              <span className={`font-bold text-xs ${isServiceContractActive || serviceEligibilityData?.serviceContractStatus === 'ACTIVE' ? 'text-emerald-700' : 'text-gray-700'}`}>
                {serviceEligibilityData?.serviceContractStatus || contractData?.status || (hasContract ? 'ACTIVE' : 'STANDARD')}
              </span>
            </div>

            <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
              <span className="text-[10px] font-semibold text-gray-500 block uppercase">Warranty Eligibility</span>
              <span className={`font-bold text-xs ${isWarrantyActive || serviceEligibilityData?.warrantyStatus === 'ACTIVE' ? 'text-emerald-700' : 'text-gray-700'}`}>
                {serviceEligibilityData?.warrantyStatus || warrantyData?.status || (hasWarranty ? 'ACTIVE' : 'ACTIVE FACTORY')}
              </span>
            </div>

            <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
              <span className="text-[10px] font-semibold text-gray-500 block uppercase">Valid Until / Expiry</span>
              <span className="font-bold text-gray-900 text-xs">
                {serviceEligibilityData?.serviceContractExpiryDate || serviceEligibilityData?.warrantyExpiryDate || contractData?.expiryDate || warrantyData?.expiryDate || nextServiceDate || 'Standard Period'}
              </span>
            </div>
          </div>
        </div>

        {/* 5. Warranty Details Section (Change 27) & Service Contract Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100 text-xs">
          {/* Dedicated Warranty Details Card (Change 27) */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-200">
                  <FaShieldAlt />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xs leading-tight">Warranty Details</h3>
                  <p className="text-[10px] text-gray-500">Official manufacturer and extended warranty coverage</p>
                </div>
              </div>
              <span className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border ${
                isWarrantyActive || serviceEligibilityData?.warrantyStatus === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}>
                <FaCheckCircle className="text-[9px]" />
                {warrantyData?.status || serviceEligibilityData?.warrantyStatus || (hasWarranty ? 'ACTIVE' : 'ACTIVE FACTORY')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Warranty Provider</span>
                <span className="font-bold text-gray-900 text-xs">
                  {warrantyData?.provider || currentVehicle?.warrantyProvider || brand || 'AGMC / Keyloop DMS'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Contract Code / Type</span>
                <span className="font-mono font-bold text-gray-900 text-xs">
                  {warrantyData?.contractType || serviceEligibilityData?.warrantyCoverage || 'Manufacturer Standard (BSI)'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Expiry Date</span>
                <span className="font-bold text-gray-900 text-xs">
                  {warrantyData?.expiryDate || serviceEligibilityData?.warrantyExpiryDate || currentVehicle?.warrantyExpiryDate || 'Standard Term'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Coverage Status</span>
                <span className="font-semibold text-emerald-700 text-xs block">
                  {serviceEligibilityData?.warrantyCoverage || warrantyData?.coverage || 'Full Mechanical & Electrical'}
                </span>
              </div>
            </div>
          </div>

          {/* Service Contract Information */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold border border-purple-200">
                  <FaFileAlt />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xs leading-tight">Service Contract Information</h3>
                  <p className="text-[10px] text-gray-500">Service package package maintenance and inclusive plans</p>
                </div>
              </div>
              <span className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border ${
                isServiceContractActive || serviceEligibilityData?.serviceContractStatus === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-purple-50 text-purple-800 border-purple-200'
              }`}>
                <FaCheckCircle className="text-[9px]" />
                {contractData?.status || serviceEligibilityData?.serviceContractStatus || (hasContract ? 'ACTIVE' : 'STANDARD')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Provider</span>
                <span className="font-bold text-gray-900 text-xs">
                  {contractData?.provider || 'AGMC Service Contract'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Contract Code / Package</span>
                <span className="font-mono font-bold text-gray-900 text-xs">
                  {contractData?.contractType || serviceEligibilityData?.serviceContractType || 'Service Inclusive Standard'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Expiry Date</span>
                <span className="font-bold text-gray-900 text-xs">
                  {contractData?.expiryDate || serviceEligibilityData?.serviceContractExpiryDate || 'Periodic Maintenance'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Package Status</span>
                <span className="font-semibold text-purple-700 text-xs block">
                  {contractData?.status || serviceEligibilityData?.serviceContractStatus || 'Active Coverage'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Vehicle Notes / Workshop Notes Section (Change 30) */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-bold border border-amber-200">
                <FaStickyNote />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-xs leading-tight">Vehicle Notes / Workshop Notes</h3>
                <p className="text-[10px] text-gray-500">Service remarks, workshop special instructions, and vehicle comments</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded uppercase">
              DMS Remarks
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
            {/* Workshop Notes Card */}
            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                <FaWrench className="text-blue-500 text-[10px]" /> Workshop Notes & Special Handling
              </span>
              <p className="text-xs text-gray-800 leading-relaxed font-medium">
                {currentVehicle?.workshopNotes ||
                  vehicleSummaryData?.workshopNotes ||
                  activeBooking?.workshopNotes ||
                  activeBooking?.instructions ||
                  currentVehicle?.specialInstructions ||
                  "Standard workshop procedures apply. No special handling constraints reported."}
              </p>
            </div>

            {/* Vehicle Remarks & Customer Notes Card */}
            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                <FaClipboardList className="text-amber-500 text-[10px]" /> Vehicle Remarks & Customer Requests
              </span>
              <p className="text-xs text-gray-800 leading-relaxed font-medium">
                {currentVehicle?.vehicleNotes ||
                  currentVehicle?.notes ||
                  vehicleSummaryData?.vehicleNotes ||
                  vehicleSummaryData?.notes ||
                  customer?.notes ||
                  "No adverse vehicle remarks or open alerts recorded in Keyloop Autoline."}
              </p>
            </div>
          </div>
        </div>

        {/* 7. Vehicle Insurance / Policy Contracts from Vehicle Summary API */}
        {hasInsurance && (
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                <FaFileAlt className="text-emerald-600" /> Vehicle Insurance / Policy Contracts
              </span>
              <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-[11px]">
              {Array.isArray(vehicleContracts) ? (
                vehicleContracts.map((c, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-2.5 bg-slate-50 rounded-lg border border-gray-200 space-y-1"
                  >
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">
                        {c.provider || c.insuranceCompany || "Policy"}:
                      </span>
                      <span className="font-bold text-gray-900">
                        {c.contractNumber ||
                          c.policyNumber ||
                          c.number ||
                          `Policy #${cIdx + 1}`}
                      </span>
                    </div>
                    {c.type && (
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-400">Type:</span>
                        <span className="font-mono text-gray-700">
                          {c.type}
                        </span>
                      </div>
                    )}
                    {c.expiryDate && (
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-400">Expires:</span>
                        <span className="font-semibold text-gray-800">
                          {c.expiryDate}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-2 bg-slate-50 rounded border border-gray-200">
                  <span className="font-semibold text-gray-800">
                    {String(vehicleContracts)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vehicle Packages & Factory Options Section */}
        {packagesList.length > 0 && (
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                  <FaBoxes className="text-blue-600" /> Vehicle Packages
                </span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                  {packagesList.length} Packages
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPackagesModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 transition cursor-pointer shadow-2xs"
                >
                  <FaBoxes className="text-[10px]" />
                  <span>View All Packages ({packagesList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setIsPackagesInlineExpanded(!isPackagesInlineExpanded)
                  }
                  className="text-xs text-gray-500 hover:text-gray-700 font-semibold px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer transition"
                >
                  {isPackagesInlineExpanded
                    ? "Show Less"
                    : `Show More (${packagesList.length})`}
                </button>
              </div>
            </div>

            {/* Quick Filter / Search input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  value={packageInlineFilter}
                  onChange={(e) => setPackageInlineFilter(e.target.value)}
                  placeholder="Filter packages (e.g. wheels, sport, BSI, warranty)..."
                  className="w-full pl-7 pr-3 py-1 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 focus:border-blue-500 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none transition shadow-2xs"
                />
              </div>
              {packageInlineFilter && (
                <button
                  onClick={() => setPackageInlineFilter("")}
                  className="text-xs text-gray-500 hover:text-gray-700 font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-1 text-xs">
              {displayedInlinePackages.map((pkg, pIdx) => {
                const desc = pkg.packageDescription || "Package Option";
                const isRemovable = desc.includes("(Removable)");
                const isWarranty =
                  desc.toLowerCase().includes("warranty") ||
                  desc.toLowerCase().includes("warr") ||
                  desc.toLowerCase().includes("bsi") ||
                  desc.toLowerCase().includes("insurance");
                const cleanDesc = desc
                  .replace(/\s*\(Removable\)\s*/i, "")
                  .trim();

                return (
                  <div
                    key={pIdx}
                    onClick={() => setIsPackagesModalOpen(true)}
                    className="p-2.5 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200 hover:border-blue-300 transition cursor-pointer flex flex-col justify-between gap-1 shadow-2xs group"
                    title="Click to view all packages"
                  >
                    <span className="font-bold text-gray-900 text-[11px] leading-tight line-clamp-2 group-hover:text-blue-700">
                      {cleanDesc}
                    </span>
                    <div className="flex items-center gap-1 flex-wrap mt-0.5">
                      {isRemovable && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded border border-amber-200">
                          Removable
                        </span>
                      )}
                      {isWarranty && (
                        <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.2 rounded border border-purple-200">
                          BSI/Warranty
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {packagesList.length > 8 &&
              !isPackagesInlineExpanded &&
              !packageInlineFilter && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setIsPackagesModalOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>
                      + {packagesList.length - 8} more packages installed (Click
                      to view full list)
                    </span>
                  </button>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Vehicle Packages Breakdown Modal */}
      <VehiclePackagesModal
        isOpen={isPackagesModalOpen}
        onClose={() => setIsPackagesModalOpen(false)}
        vehicle={currentVehicle}
      />

      {/* Vehicle Ownership Transfer / Link Modal */}
      <VehicleOwnershipTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        initialVin={vin}
        initialGroup={group}
        onSuccess={() => {
          handleRefreshAll();
        }}
      />
    </div>
  );
}
