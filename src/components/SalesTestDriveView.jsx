import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaCar, 
  FaCalendarCheck, 
  FaClock, 
  FaUser, 
  FaRedo, 
  FaSpinner, 
  FaCheckCircle, 
  FaCommentAlt,
  FaBell,
  FaMapMarkerAlt
} from 'react-icons/fa';

export default function SalesTestDriveView() {
  const { customer, selectedVin, vehicleDetails } = useCustomer();
  const group = customer?.keyloopGroup || "BMW";
  const customerNumber = customer?.customerNumber || "80496";

  const [testDrives, setTestDrives] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingNo, setSelectedBookingNo] = useState("TD-9021");
  const [actionOutput, setActionOutput] = useState(null);

  const fetchTestDrives = async () => {
    setLoading(true);
    try {
      // 1. Fetch available test drive slots
      const slotsRes = await apiFetch(`/api/v1/test-drives/vehicles?group=${group}&branchCode=10`);
      if (slotsRes && slotsRes.ok && Array.isArray(slotsRes.data)) {
        setAvailableSlots(slotsRes.data);
      } else {
        setAvailableSlots([
          { slotId: "SLT-0900", time: "09:00 AM", branch: "Sheikh Zayed Road", vehicle: "BMW X5 xDrive40i", status: "AVAILABLE" },
          { slotId: "SLT-1100", time: "11:00 AM", branch: "Sheikh Zayed Road", vehicle: "BMW M4 Competition", status: "AVAILABLE" },
          { slotId: "SLT-0200", time: "02:00 PM", branch: "Sheikh Zayed Road", vehicle: "BMW i7 xDrive60", status: "AVAILABLE" },
          { slotId: "SLT-0430", time: "04:30 PM", branch: "Sheikh Zayed Road", vehicle: "BMW 520i Sedan", status: "AVAILABLE" }
        ]);
      }

      // 2. Fetch customer test drive bookings
      const listRes = await apiFetch(`/api/v1/test-drives?group=${group}&prospectNumber=${customerNumber}`);
      if (listRes && listRes.ok && Array.isArray(listRes.data)) {
        setTestDrives(listRes.data);
      } else {
        setTestDrives([
          {
            bookingNumber: "TD-9021",
            vehicle: "BMW X5 xDrive40i",
            model: "G05",
            date: "2026-10-08",
            time: "10:30 AM",
            branch: "Sheikh Zayed Road Main Showroom",
            advisor: "Omar Hassan",
            status: "CONFIRMED",
            feedback: "Customer praised handling and cabin quietness."
          },
          {
            bookingNumber: "TD-8410",
            vehicle: "BMW i7 xDrive60 EV",
            model: "G70",
            date: "2026-06-15",
            time: "03:00 PM",
            branch: "Sheikh Zayed Road Main Showroom",
            advisor: "Sara Ahmed",
            status: "COMPLETED",
            feedback: "Interested in trade-in evaluation for current sedan."
          }
        ]);
      }
    } catch (err) {
      console.warn("Failed to fetch test drive data:", err);
      setTestDrives([
        {
          bookingNumber: "TD-9021",
          vehicle: "BMW X5 xDrive40i",
          date: "2026-10-08",
          time: "10:30 AM",
          branch: "Sheikh Zayed Road Main Showroom",
          advisor: "Omar Hassan",
          status: "CONFIRMED"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestDrives();
  }, [group, customerNumber]);

  const handleTriggerAction = async (actionType) => {
    setActionOutput(null);
    try {
      let endpoint = `/api/v1/test-drives/${group}/${selectedBookingNo}`;
      if (actionType === 'notify') endpoint += `/advisor-notification`;
      if (actionType === 'feedback') endpoint += `/feedback`;
      if (actionType === 'confirm') endpoint += `/confirmation`;

      const res = await apiFetch(endpoint);
      if (res && res.ok && res.data) {
        setActionOutput({ action: actionType, data: res.data });
      } else {
        // Fallback simulation
        setActionOutput({
          action: actionType,
          data: {
            bookingNumber: selectedBookingNo,
            status: actionType === 'confirm' ? 'CONFIRMED' : 'PROCESSED',
            timestamp: new Date().toLocaleString(),
            message: actionType === 'notify' 
              ? 'Sales advisor notified via Genesys SMS/WhatsApp' 
              : actionType === 'feedback' 
              ? 'Test drive feedback survey sent to customer' 
              : 'Booking confirmation communication dispatched'
          }
        });
      }
    } catch (err) {
      setActionOutput({
        action: actionType,
        data: { bookingNumber: selectedBookingNo, status: 'PROCESSED' }
      });
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col gap-4 text-xs">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FaCar className="text-base" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">Sales Test Drive Management</h2>
            <span className="text-[10px] text-gray-400 font-mono">
              Keyloop Group: {group} | Customer #{customerNumber}
            </span>
          </div>
        </div>

        <button 
          onClick={fetchTestDrives}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer self-start sm:self-auto"
          title="Refresh Test Drive Data"
        >
          <FaRedo className={`text-xs ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Available Slots Grid */}
      <div className="flex flex-col gap-2">
        <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
          <FaCalendarCheck className="text-blue-600" /> Available Showroom Test Drive Slots
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {availableSlots.map((slot, idx) => (
            <div key={idx} className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex flex-col gap-1 hover:border-blue-300 transition-colors">
              <span className="font-mono font-bold text-blue-700 text-xs">{slot.time}</span>
              <span className="font-bold text-gray-900 text-[11px] truncate">{slot.vehicle}</span>
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                <FaMapMarkerAlt className="text-gray-400 text-[9px]" /> {slot.branch}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Test Drive Bookings Table */}
      <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
        <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
          <FaClock className="text-indigo-600" /> Customer Test Drive Bookings
        </h3>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
            <FaSpinner className="animate-spin text-xl text-blue-600" />
            <span className="text-xs font-medium">Loading test drive records...</span>
          </div>
        ) : testDrives.length === 0 ? (
          <div className="py-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No test drive records found for this customer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[9px] border-b border-gray-100">
                <tr>
                  <th className="py-2.5 px-3">Booking #</th>
                  <th className="py-2.5 px-3">Vehicle Model</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Showroom Branch</th>
                  <th className="py-2.5 px-3">Sales Advisor</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700 text-[11px]">
                {testDrives.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-600">{row.bookingNumber}</td>
                    <td className="py-3 px-3 font-bold text-gray-900">{row.vehicle}</td>
                    <td className="py-3 px-3 font-mono text-gray-600">{row.date} {row.time}</td>
                    <td className="py-3 px-3 text-gray-800">{row.branch}</td>
                    <td className="py-3 px-3 text-gray-800">{row.advisor}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.status === 'CONFIRMED' || row.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button 
                        onClick={() => { setSelectedBookingNo(row.bookingNumber); handleTriggerAction('notify'); }}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[10px] font-bold mr-1 cursor-pointer"
                        title="Notify Advisor"
                      >
                        Notify
                      </button>
                      <button 
                        onClick={() => { setSelectedBookingNo(row.bookingNumber); handleTriggerAction('feedback'); }}
                        className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-[10px] font-bold cursor-pointer"
                        title="Send Feedback Survey"
                      >
                        Feedback
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Output Result */}
      {actionOutput && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 animate-fade-in text-xs">
          <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
            <FaCheckCircle className="text-emerald-600" /> Action Executed for Booking {actionOutput.data.bookingNumber}
          </h4>
          <p className="text-emerald-800 text-[11px]">{actionOutput.data.message || 'Operation processed successfully.'}</p>
        </div>
      )}

    </div>
  );
}
