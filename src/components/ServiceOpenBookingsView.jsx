import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch, getServiceAppointments, deleteServiceAppointment } from '../utils/api';
import { 
  FaCalendarCheck, 
  FaCar, 
  FaSpinner, 
  FaRedo, 
  FaCheckCircle, 
  FaClock, 
  FaWrench, 
  FaInfoCircle,
  FaArrowRight,
  FaChevronUp,
  FaBuilding,
  FaUser,
  FaCalendarAlt,
  FaTag,
  FaBan,
  FaExclamationTriangle,
  FaCheck
} from 'react-icons/fa';

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  } catch (e) {}
  return String(dateStr);
};

const formatTime = (timeVal) => {
  if (!timeVal && timeVal !== 0) return '';
  const s = String(timeVal).trim();
  if (s.includes(':')) return s;
  const num = parseInt(s, 10);
  if (!isNaN(num)) {
    const hh = String(num).padStart(2, '0');
    return `${hh}:00`;
  }
  return s;
};

export default function ServiceOpenBookingsView() {
  const { customer, selectedVin, vehicleDetails, vehicles, group: contextGroup } = useCustomer();
  const rawGroup = contextGroup || customer?.keyloopGroup || (new URLSearchParams(window.location.search).get('group') || "");
  const group = rawGroup || "BMW";
  const customerNumber = customer?.customerNumber || customer?.id || "";
  const vin = selectedVin || vehicleDetails?.vin || (vehicles && vehicles[0]?.vin) || "";

  // Integration Flow Toggle: 'KEYLOOP' (Open Workshop Bookings) or 'GEELY' (Direct DMS)
  const [activeFlow, setActiveFlow] = useState('KEYLOOP');

  // Universal DMS Flow State
  const initialPlate = vehicleDetails?.registrationNumber || vehicles?.[0]?.registrationNumber || '240153';
  const [geelyPlate, setGeelyPlate] = useState(initialPlate);
  const [geelyAppointments, setGeelyAppointments] = useState([]);
  const [geelyLoading, setGeelyLoading] = useState(true);

  useEffect(() => {
    const pl = vehicleDetails?.registrationNumber || vehicles?.[0]?.registrationNumber;
    if (pl) setGeelyPlate(pl);
  }, [vehicleDetails, vehicles]);

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelToast, setCancelToast] = useState(null);

  // KEYLOOP Flow State
  const [openBookings, setOpenBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchMode, setFetchMode] = useState('customer'); // 'customer' or 'vehicle'
  const [expandedBookingId, setExpandedBookingId] = useState(null);

  // Fetch Service Appointments (GET /api/service/appointments?regNumber={plate})
  const fetchGeelyAppointments = async () => {
    if (!geelyPlate.trim()) return;
    setGeelyLoading(true);
    setCancelToast(null);
    try {
      const res = await getServiceAppointments(geelyPlate.trim());
      if (res && res.ok && res.data) {
        const list = res.data.result || res.data.data || res.data || [];
        setGeelyAppointments(Array.isArray(list) ? list : [list]);
      } else {
        setGeelyAppointments([]);
      }
    } catch (err) {
      console.warn("Failed to fetch service appointments:", err);
      setGeelyAppointments([]);
    } finally {
      setGeelyLoading(false);
    }
  };

  useEffect(() => {
    if (activeFlow === 'GEELY') {
      fetchGeelyAppointments();
    }
  }, [activeFlow, geelyPlate]);

  // Handle Delete / Cancel Appointment (DELETE /api/service/appointments?appointmentId=...)
  const handleOpenCancelModal = (apt) => {
    setAppointmentToCancel(apt);
    setCancelModalOpen(true);
  };

  const handleConfirmCancelAppointment = async (e) => {
    e.preventDefault();
    if (!appointmentToCancel) return;
    const aptId = appointmentToCancel.repairOrderId || appointmentToCancel.appointmentId || appointmentToCancel.id;
    if (!aptId) return;

    setCancelling(true);
    try {
      const res = await deleteServiceAppointment(aptId);
      if (res && res.ok) {
        setCancelToast({
          isError: false,
          message: `Appointment #${aptId} has been successfully cancelled in Keyloop/Autoline DMS.`
        });
        setCancelModalOpen(false);
        setAppointmentToCancel(null);
        fetchGeelyAppointments();
      } else {
        setCancelToast({
          isError: true,
          message: res?.statusText || "Failed to cancel appointment in DMS"
        });
      }
    } catch (err) {
      console.error("Delete appointment error:", err);
      setCancelToast({
        isError: true,
        message: err.message || "Failed to cancel appointment"
      });
    } finally {
      setCancelling(false);
    }
  };

  // Keyloop fetcher
  const fetchOpenBookings = async () => {
    setLoading(true);
    setOpenBookings([]);
    try {
      let apiUrl = `/api/v1/customers/${group}/${customerNumber}/service-bookings`;
      if (fetchMode === 'vehicle' && vin) {
        apiUrl = `/api/v1/vehicles/${group}/${vin}/service-bookings`;
      } else if (!customerNumber) {
        if (vin) {
          apiUrl = `/api/v1/vehicles/${group}/${vin}/service-bookings`;
        } else {
          setOpenBookings([]);
          setLoading(false);
          return;
        }
      }

      const res = await apiFetch(apiUrl);
      if (res && res.ok && Array.isArray(res.data)) {
        setOpenBookings(res.data);
      } else {
        setOpenBookings([]);
      }
    } catch (err) {
      console.warn("Failed to fetch open service bookings:", err);
      setOpenBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenBookings();
  }, [group, customerNumber, vin, fetchMode]);

  const handleToggleDetails = (id) => {
    setExpandedBookingId(prev => (prev === id ? null : id));
  };

  const getStatusBadge = (status, statusCode) => {
    const s = String(status || statusCode || '').trim().toUpperCase();
    if (s === 'BOOKED' || s === 'B' || s === 'CONFIRMED' || s === 'CREATED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <FaCheckCircle className="text-[9px] text-blue-600" /> {status || 'Booked'}
        </span>
      );
    }
    if (s === 'OPEN' || s === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <FaClock className="text-[9px] text-amber-600" /> {status || 'Open'}
        </span>
      );
    }
    if (s === 'COMPLETED' || s === 'CLOSED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <FaCheckCircle className="text-[9px] text-emerald-600" /> {status || 'Completed'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
        {status || 'Booked'}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-4 text-xs font-sans">
      
      {/* Integration Flow Switcher Bar */}
      <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
            <FaCalendarCheck className="text-sm" />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-xs block">Workshop Bookings & Appointments Engine</span>
            <span className="text-[10px] text-gray-500 font-medium">Live workshop jobs and appointment management</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveFlow('KEYLOOP')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFlow === 'KEYLOOP'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Open Workshop Bookings</span>
            {openBookings.length > 0 && (
              <span className="ml-1 bg-emerald-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {openBookings.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveFlow('GEELY')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFlow === 'GEELY'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>Direct DMS Appointments (Plate Lookup)</span>
            {geelyAppointments.length > 0 && (
              <span className="ml-1 bg-blue-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {geelyAppointments.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Cancellation Toast Message */}
      {cancelToast && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs shadow-xs animate-fade-in ${
          cancelToast.isError ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-center gap-2">
            {cancelToast.isError ? <FaExclamationTriangle className="text-rose-600 shrink-0" /> : <FaCheckCircle className="text-emerald-600 shrink-0" />}
            <span className="font-bold">{cancelToast.message}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setCancelToast(null)}
            className="text-gray-400 hover:text-gray-700 font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ================================================================ */}
      {/* 1. AGMC UNIVERSAL APPOINTMENTS VIEW (Direct DMS)                 */}
      {/* ================================================================ */}
      {activeFlow === 'GEELY' && (
        <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4 text-xs">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FaWrench className="text-base" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900 leading-tight">Live Workshop Bookings</h2>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200 uppercase">
                    Multi-Brand DMS Engine
                  </span>
                  {geelyAppointments.length > 0 && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                      {geelyAppointments.length} Active
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 font-medium">
                  Real-Time Workshop Appointments & Active Bookings
                </span>
              </div>
            </div>

            {/* Plate Input & Refresh Bar */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Plate:</span>
                <input
                  type="text"
                  value={geelyPlate}
                  onChange={(e) => setGeelyPlate(e.target.value)}
                  placeholder="e.g. 240153"
                  className="w-24 bg-transparent font-mono font-bold text-gray-900 text-xs focus:outline-none uppercase"
                />
              </div>

              <button
                type="button"
                onClick={fetchGeelyAppointments}
                disabled={geelyLoading}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer transition-colors"
                title="Refresh Service Appointments"
              >
                <FaRedo className={`text-xs ${geelyLoading ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Appointments List Body */}
          {geelyLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-400 gap-2">
              <FaSpinner className="animate-spin text-xl text-blue-600" />
              <span className="text-xs font-medium">Fetching service appointments from DMS...</span>
            </div>
          ) : geelyAppointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-1">
              <FaInfoCircle className="mx-auto text-xl text-gray-300 mb-1" />
              <p className="font-bold text-gray-700 text-xs">No Active Appointments Found for Plate {geelyPlate}</p>
              <p className="text-[11px] text-gray-400">
                You can create a new service booking using the "Book Service" tab.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {geelyAppointments.map((apt, idx) => {
                const roId = apt.repairOrderId || apt.appointmentId || apt.id || `RO-${idx}`;
                const aptDate = apt.appointment?.date || apt.startDate || 'Scheduled';
                const aptTime = apt.appointment?.dropOffTime || apt.appointment?.time || '10:15-10:30';
                const vehicleDesc = apt.vehicle?.description || `${apt.vehicle?.referenceData?.makeCode || apt.vehicle?.make || 'Vehicle'} ${apt.vehicle?.referenceData?.modelCode || ''}`.trim();
                const plate = apt.vehicle?.licensePlate || apt.licensePlateNo || geelyPlate;
                const locId = apt.details?.dealershipLocationId || apt.dealershipLocationId || 40;

                return (
                  <div 
                    key={roId}
                    className="bg-white rounded-xl border border-gray-200 shadow-2xs hover:shadow-xs transition-all overflow-hidden"
                  >
                    <div className="bg-slate-50/80 px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                          <FaCar className="text-sm" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-xs leading-tight">
                              Repair Order #{roId}
                            </span>
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                              {apt.status || 'CREATED'}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono">
                            Ref: {apt.reference || roId} • Workshop Location #{locId}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleOpenCancelModal(apt)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FaBan className="text-[11px]" />
                          <span>Cancel Appointment</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Vehicle</span>
                        <span className="font-bold text-gray-800 block truncate">{vehicleDesc || 'Customer Vehicle'}</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-blue-700">Plate: {plate}</span>
                          {(apt.batteryId || apt.batteryID || apt.battery_id || apt.vehicle?.batteryId || apt.vehicle?.batteryID) && (
                            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                              Battery ID: {apt.batteryId || apt.batteryID || apt.battery_id || apt.vehicle?.batteryId || apt.vehicle?.batteryID}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Scheduled Date & Time</span>
                        <span className="font-bold text-gray-900 font-mono block">{aptDate}</span>
                        <span className="text-[11px] text-gray-600 font-medium">{aptTime}</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Workshop Location</span>
                        <span className="font-bold text-gray-800 block">Location ID #{locId}</span>
                        <span className="text-[10px] text-gray-500">AGMC Service Center</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Service Type</span>
                        <span className="font-bold text-emerald-800 block">Periodic Maintenance</span>
                        <span className="text-[10px] text-gray-500">Keyloop Autoline Sync</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ================================================================ */}
      {/* 2. BMW KEYLOOP APPOINTMENTS VIEW                                 */}
      {/* ================================================================ */}
      {activeFlow === 'KEYLOOP' && (
        <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4 text-xs">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FaCalendarCheck className="text-base" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900 leading-tight">
                    {group ? `${group} Open Workshop Bookings` : 'Open Workshop Bookings'}
                  </h2>
                  {openBookings.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                      {openBookings.length} {openBookings.length === 1 ? 'Booking' : 'Bookings'}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 font-medium">
                  Active service appointments and live workshop jobs
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Mode Switcher */}
              <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setFetchMode('customer')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    fetchMode === 'customer' ? 'bg-blue-600 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  By Customer {customerNumber ? `(#${customerNumber})` : ''}
                </button>
                <button
                  onClick={() => setFetchMode('vehicle')}
                  disabled={!vin}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer disabled:opacity-40 ${
                    fetchMode === 'vehicle' ? 'bg-blue-600 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  By Vehicle {vin ? `(${vin.slice(-6)})` : ''}
                </button>
              </div>

              <button 
                onClick={fetchOpenBookings}
                disabled={loading}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer transition-colors"
                title="Refresh Open Bookings"
              >
                <FaRedo className={`text-xs ${loading ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          </div>

      {/* Bookings Content */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-gray-400 gap-2">
          <FaSpinner className="animate-spin text-xl text-blue-600" />
          <span className="text-xs font-medium">Loading open workshop bookings...</span>
        </div>
      ) : openBookings.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-1">
          <FaInfoCircle className="mx-auto text-xl text-gray-300 mb-1" />
          <p className="font-bold text-gray-700 text-xs">No Open Workshop Bookings Found</p>
          <p className="text-[11px] text-gray-400">There are currently no active upcoming bookings returned from the API for this selection.</p>
        </div>
      ) : (
        <div 
          className="overflow-y-auto pr-2 flex flex-col gap-3 focus:outline-none"
          style={{
            maxHeight: 'calc(100vh - 275px)',
            minHeight: '380px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#93c5fd #f1f5f9'
          }}
        >
          {openBookings.map((b, idx) => {
            const bookingId = b.bookingId || b.wipNumber || String(idx);
            const isExpanded = expandedBookingId === bookingId;

            // Extract branch display safely
            const branchName = b.branch?.name || (b.branch?.code ? `Branch ${b.branch.code}` : (typeof b.branch === 'string' ? b.branch : '-'));
            const branchCode = b.branch?.code || '';

            // Extract advisor code safely
            const advisorCode = b.advisor?.code || (typeof b.advisor === 'string' ? b.advisor : '');
            const advisorName = b.advisor?.name || (advisorCode ? `Advisor #${advisorCode}` : (b.bookedBy || '-'));

            // Format date & time
            const formattedDate = formatDate(b.date || b.createdDate);
            const formattedTime = formatTime(b.time);

            return (
              <div 
                key={bookingId}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 shadow-2xs flex flex-col gap-3 transition-all"
              >
                {/* Card Summary Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Booking #{b.bookingId || b.wipNumber || '-'}
                    </span>
                    {getStatusBadge(b.status, b.statusCode)}
                    <span className="text-xs font-bold text-gray-800">
                      {b.brand ? `${b.brand} — ` : ''}{b.vehicle || 'Vehicle Workshop Booking'}
                    </span>
                    {b.jobNumber && b.jobNumber !== '0' && (
                      <span className="text-[10px] text-gray-400 font-mono">Job #{b.jobNumber}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleDetails(bookingId)}
                    className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                    {isExpanded ? (
                      <FaChevronUp className="text-[9px]" />
                    ) : (
                      <FaArrowRight className="text-[9px]" />
                    )}
                  </button>
                </div>

                {/* Card Primary Summary Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  {/* Column 1: Date & Time */}
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Booking Date & Time</span>
                    <div className="flex items-center gap-1.5 font-bold text-gray-900 font-mono">
                      <FaCalendarAlt className="text-gray-400 text-xs shrink-0" />
                      <span>{formattedDate}</span>
                      {formattedTime && <span className="text-blue-600 font-normal">at {formattedTime}</span>}
                    </div>
                    {b.dueOutDate && (
                      <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                        Due Out: {formatDate(b.dueOutDate)}
                      </span>
                    )}
                  </div>

                  {/* Column 2: Vehicle & Mileage */}
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Vehicle & Mileage</span>
                    <span className="font-bold text-gray-800 block truncate" title={b.vehicle}>
                      {b.vehicle || 'Vehicle Service'}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono flex-wrap">
                      {b.vin && <span className="truncate" title={b.vin}>VIN: {b.vin}</span>}
                      {b.odometerKm && <span>• {Number(b.odometerKm).toLocaleString()} KM</span>}
                      {(b.batteryId || b.batteryID || b.battery_id || b.vehicle?.batteryId || b.vehicle?.batteryID) && (
                        <span className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          Battery ID: {b.batteryId || b.batteryID || b.battery_id || b.vehicle?.batteryId || b.vehicle?.batteryID}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Column 3: Branch & Advisor */}
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Branch & Advisor</span>
                    <span className="font-bold text-gray-800 block truncate">
                      {branchName}
                    </span>
                    <span className="text-blue-700 font-semibold text-[10px] block truncate">
                      {advisorName}
                    </span>
                  </div>

                  {/* Column 4: Service Info & Loan Car */}
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Service Info & Loan Car</span>
                    <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                      <FaWrench className="text-gray-400 text-[10px] shrink-0" />
                      <span>Code: <strong className="font-mono">{b.serviceCode || '-'}</strong></span>
                    </div>
                    <span className="text-[10px] text-gray-500 block">
                      Loan Car: <strong className="text-gray-700 font-semibold">{b.loanCar && String(b.loanCar).trim() !== "" ? b.loanCar : 'None'}</strong>
                    </span>
                  </div>
                </div>

                {/* Expanded Detailed Breakdown with ALL Response Fields */}
                {isExpanded && (
                  <div className="mt-2 p-3.5 bg-slate-50/90 rounded-xl border border-blue-200/90 shadow-2xs flex flex-col gap-3">
                    {/* Expanded Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/70 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                          <FaInfoCircle className="text-blue-600 text-xs" />
                          Full Workshop Booking Details — #{b.bookingId || b.wipNumber}
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-mono px-2 py-0.5 rounded font-semibold border border-blue-200">
                          Group: {b.keyloopGroup || group}
                        </span>
                        {b.customerNumber && (
                          <span className="bg-gray-100 text-gray-700 text-[10px] font-mono px-2 py-0.5 rounded border border-gray-200 font-semibold">
                            Customer #{b.customerNumber}
                          </span>
                        )}
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                          {b.open ? 'Status: Active / Open' : 'Status: Closed'}
                        </span>
                      </div>

                      <button 
                        type="button"
                        onClick={() => setExpandedBookingId(null)}
                        className="text-gray-400 hover:text-gray-700 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-gray-200/50 cursor-pointer"
                      >
                        ✕ Close
                      </button>
                    </div>

                    {/* 4 Detail Grid Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      
                      {/* CARD 1: Booking Schedule & Timing */}
                      <div className="bg-white rounded-lg p-3 border border-blue-100 shadow-2xs flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-blue-800 font-bold text-[11px] border-b border-blue-50 pb-1.5">
                          <FaCalendarAlt className="text-blue-600 text-[10px]" />
                          <span>Schedule & Dates</span>
                        </div>
                        
                        <div className="space-y-1.5 text-[11px]">
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Service Date & Time</span>
                            <span className="font-bold text-gray-900 font-mono">
                              {formattedDate} {formattedTime ? `(${formattedTime})` : ''}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">Due Out Date</span>
                              <span className="font-mono font-semibold text-gray-800">{formatDate(b.dueOutDate)}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">Next Service Date</span>
                              <span className="font-mono text-gray-800">{formatDate(b.nextServiceDate)}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-gray-100">
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">Created Date</span>
                              <span className="font-mono text-[10px] text-gray-600">{formatDate(b.createdDate)}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">Last Updated</span>
                              <span className="font-mono text-[10px] text-gray-600">{formatDate(b.lastUpdatedDate)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CARD 2: Vehicle & Mileage */}
                      <div className="bg-white rounded-lg p-3 border border-indigo-100 shadow-2xs flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-[11px] border-b border-indigo-50 pb-1.5">
                          <FaCar className="text-indigo-600 text-[10px]" />
                          <span>Vehicle Details</span>
                        </div>

                        <div className="space-y-1.5 text-[11px]">
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Vehicle Description</span>
                            <span className="font-bold text-gray-900">{b.vehicle || 'N/A'}</span>
                            {b.brand && (
                              <span className="text-[10px] text-gray-500 font-semibold block">Brand: {b.brand}</span>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">VIN</span>
                            <span className="font-mono font-bold text-[10px] text-gray-800 block truncate" title={b.vin}>
                              {b.vin || 'N/A'}
                            </span>
                          </div>

                          {(b.batteryId || b.batteryID || b.battery_id || b.vehicle?.batteryId || b.vehicle?.batteryID) && (
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">Battery ID</span>
                              <span className="font-mono font-bold text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">
                                {b.batteryId || b.batteryID || b.battery_id || b.vehicle?.batteryId || b.vehicle?.batteryID}
                              </span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">Odometer</span>
                              <span className="font-mono font-bold text-gray-900">
                                {b.odometerKm ? `${Number(b.odometerKm).toLocaleString()} KM` : '-'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">Loan Car</span>
                              <span className="font-semibold text-gray-800">
                                {b.loanCar && String(b.loanCar).trim() !== "" ? b.loanCar : 'None'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CARD 3: Branch & Service Advisor */}
                      <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-2xs flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px] border-b border-emerald-50 pb-1.5">
                          <FaBuilding className="text-emerald-600 text-[10px]" />
                          <span>Branch & Advisor</span>
                        </div>

                        <div className="space-y-1.5 text-[11px]">
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Branch Name</span>
                            <span className="font-bold text-gray-900">{branchName}</span>
                            {branchCode && (
                              <span className="text-[10px] text-gray-400 font-mono block">Branch Code: {branchCode}</span>
                            )}
                          </div>

                          <div className="pt-1 border-t border-gray-100">
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Service Advisor</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-blue-900">{advisorName}</span>
                              {advisorCode && (
                                <span className="text-[10px] bg-blue-50 text-blue-700 font-mono px-1 rounded border border-blue-100 font-semibold">
                                  Code: {advisorCode}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-1 border-t border-gray-100">
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Customer Number</span>
                            <span className="font-mono font-bold text-gray-800">
                              #{b.customerNumber || customerNumber || '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CARD 4: Job & Status Tracking */}
                      <div className="bg-white rounded-lg p-3 border border-amber-100 shadow-2xs flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[11px] border-b border-amber-50 pb-1.5">
                          <FaTag className="text-amber-600 text-[10px]" />
                          <span>Status & Job Info</span>
                        </div>

                        <div className="space-y-1.5 text-[11px]">
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Booking Status</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {getStatusBadge(b.status, b.statusCode)}
                              {b.statusCode && (
                                <span className="text-[10px] text-gray-400 font-mono">[{b.statusCode}]</span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">Job Number</span>
                              <span className="font-mono font-bold text-gray-900">
                                {b.jobNumber ? `#${b.jobNumber}` : '0'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase block">Service Code</span>
                              <span className="font-mono font-bold text-gray-800">{b.serviceCode || '-'}</span>
                            </div>
                          </div>

                          <div className="pt-1 border-t border-gray-100">
                            <span className="text-[10px] text-gray-400 font-bold uppercase block">Open Status</span>
                            <span className={`font-bold text-[10px] ${b.open ? 'text-emerald-700' : 'text-gray-500'}`}>
                              {b.open ? '● Open / Active' : '○ Closed'}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      </div>
      )}

      {/* ================================================================ */}
      {/* CANCEL GEELY APPOINTMENT MODAL (DELETE /api/service/appointments)*/}
      {/* ================================================================ */}
      {cancelModalOpen && appointmentToCancel && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget && !cancelling) setCancelModalOpen(false);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200/90 max-w-md w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="bg-white border-b border-gray-100 p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center font-bold shadow-2xs shrink-0">
                  <FaBan className="text-base" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">
                    Cancel Service Appointment
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Delete booking #{appointmentToCancel.repairOrderId || appointmentToCancel.appointmentId || appointmentToCancel.id} in Workshop DMS
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmCancelAppointment} className="p-5 flex flex-col gap-4 text-xs">
              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-900">
                <FaExclamationTriangle className="text-rose-600 text-base shrink-0" />
                <span className="font-bold block">
                  Are you sure you want to release this workshop booking?
                </span>
              </div>

              {/* Appointment Summary Box */}
              <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-[11px] font-bold uppercase">Appointment / RO</span>
                  <span className="font-mono text-blue-700 font-bold">
                    #{appointmentToCancel.repairOrderId || appointmentToCancel.appointmentId || appointmentToCancel.id}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-[11px] font-bold uppercase">Scheduled Slot</span>
                  <span className="font-bold text-gray-800">
                    {appointmentToCancel.appointment?.date || appointmentToCancel.startDate || 'Scheduled'} @ {appointmentToCancel.appointment?.dropOffTime || appointmentToCancel.appointment?.time || '10:15'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-[11px] font-bold uppercase">Vehicle Plate</span>
                  <span className="font-mono font-bold text-gray-900">
                    {appointmentToCancel.vehicle?.licensePlate || geelyPlate}
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-2xs"
                >
                  Keep Appointment
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 text-white font-bold cursor-pointer text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  {cancelling ? <FaSpinner className="animate-spin text-xs" /> : <FaBan className="text-xs" />}
                  <span>Confirm Cancellation</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
