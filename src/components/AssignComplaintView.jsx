import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaUserCheck, 
  FaUserTag, 
  FaBuilding, 
  FaCheckCircle, 
  FaSpinner, 
  FaCheck, 
  FaRedo,
  FaTimes,
  FaExclamationTriangle,
  FaUserSlash
} from 'react-icons/fa';

export default function AssignComplaintView({ complaintId: propComplaintId }) {
  const { customer, getFormattedName } = useCustomer();
  const customerName = getFormattedName();
  const group = customer?.keyloopGroup || "";
  const customerNumber = customer?.customerNumber || customer?.id || "";

  const [complaintsList, setComplaintsList] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(propComplaintId || "");
  const [assignmentData, setAssignmentData] = useState(null);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [loadingAssignment, setLoadingAssignment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form state
  const [teamAgentId, setTeamAgentId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  // 1. Fetch customer complaints from API
  const fetchCustomerComplaints = async () => {
    if (!customerNumber) {
      setComplaintsList([]);
      setSelectedComplaintId('');
      setAssignmentData(null);
      setLoadingComplaints(false);
      return;
    }

    setLoadingComplaints(true);
    try {
      const res = await apiFetch(`/api/v1/complaints?group=${group}&customerNumber=${customerNumber}`);
      if (res && res.ok && Array.isArray(res.data) && res.data.length > 0) {
        setComplaintsList(res.data);
        setSelectedComplaintId(prev => {
          if (propComplaintId && res.data.some(c => c.complaintId === propComplaintId)) {
            return propComplaintId;
          }
          if (prev && res.data.some(c => c.complaintId === prev)) {
            return prev;
          }
          return res.data[0].complaintId;
        });
      } else {
        setComplaintsList([]);
        setSelectedComplaintId('');
        setAssignmentData(null);
      }
    } catch (err) {
      console.warn("Failed to fetch customer complaints:", err);
      setComplaintsList([]);
      setSelectedComplaintId('');
      setAssignmentData(null);
    } finally {
      setLoadingComplaints(false);
    }
  };

  // 2. Fetch assignment details for the selected complaint
  const fetchAssignment = async (cid) => {
    if (!cid || !group) {
      setAssignmentData(null);
      setLoadingAssignment(false);
      return;
    }

    setLoadingAssignment(true);
    try {
      const res = await apiFetch(`/api/v1/complaints/${group}/${cid}/assignment`);
      if (res && res.ok && res.data) {
        setAssignmentData(res.data);
        setTeamAgentId(res.data.teamAgentId || '');
        setAssignedTo(res.data.assignedTo || '');
      } else {
        setAssignmentData(null);
        setTeamAgentId('');
        setAssignedTo('');
      }
    } catch (err) {
      console.warn("Failed to fetch complaint assignment:", err);
      setAssignmentData(null);
      setTeamAgentId('');
      setAssignedTo('');
    } finally {
      setLoadingAssignment(false);
    }
  };

  useEffect(() => {
    fetchCustomerComplaints();
  }, [group, customerNumber, propComplaintId]);

  useEffect(() => {
    if (selectedComplaintId) {
      fetchAssignment(selectedComplaintId);
    } else {
      setAssignmentData(null);
    }
  }, [group, selectedComplaintId]);

  // 3. PUT Assign Complaint
  const handleAssign = async (e) => {
    if (e) e.preventDefault();
    if (!selectedComplaintId) return;

    setSubmitting(true);
    setErrorMessage(null);
    const payload = {
      teamAgentId: teamAgentId.trim(),
      assignedTo: assignedTo.trim()
    };

    try {
      const apiUrl = `/api/v1/complaints/${group}/${selectedComplaintId}/assignment`;
      const res = await apiFetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res && res.ok) {
        const updated = res.data || {
          complaintId: selectedComplaintId,
          assignmentStatus: payload.teamAgentId ? 'ASSIGNED' : 'UNASSIGNED',
          teamAgentId: payload.teamAgentId,
          assignedTo: payload.assignedTo
        };
        setAssignmentData(updated);
        setToastMessage(`Complaint #${selectedComplaintId} successfully assigned to ${payload.assignedTo || 'agent'}.`);
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        setErrorMessage(res?.message || 'Failed to assign complaint');
      }
    } catch (err) {
      console.warn("Assign complaint error:", err);
      setErrorMessage(err.message || 'Error assigning complaint');
    } finally {
      setSubmitting(false);
    }
  };

  // 4. PUT Unassign Complaint
  const handleUnassign = async () => {
    if (!selectedComplaintId) return;

    setSubmitting(true);
    setErrorMessage(null);
    const payload = {
      teamAgentId: "",
      assignedTo: ""
    };

    try {
      const apiUrl = `/api/v1/complaints/${group}/${selectedComplaintId}/assignment`;
      const res = await apiFetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res && res.ok) {
        setAssignmentData(prev => ({
          ...prev,
          assignmentStatus: 'UNASSIGNED',
          teamAgentId: '',
          assignedTo: ''
        }));
        setTeamAgentId('');
        setAssignedTo('');
        setToastMessage(`Complaint #${selectedComplaintId} has been unassigned.`);
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        setErrorMessage(res?.message || 'Failed to unassign complaint');
      }
    } catch (err) {
      console.warn("Unassign complaint error:", err);
      setErrorMessage(err.message || 'Error unassigning complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const isAssigned = (assignmentData?.assignmentStatus || '').toUpperCase() === 'ASSIGNED';

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200 flex flex-col gap-5 w-full">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FaUserCheck className="text-blue-600" /> Assign Complaint
          </h2>
          <p className="text-[11px] text-gray-500">
            Allocate ticket to team or agent for <span className="font-semibold text-gray-800">{customerName || `#${customerNumber}`}</span>
            {selectedComplaintId && (
              <> — Complaint <span className="font-mono font-bold text-blue-600">#{selectedComplaintId}</span></>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {complaintsList.length > 1 && (
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ticket:</label>
              <select
                value={selectedComplaintId}
                onChange={(e) => setSelectedComplaintId(e.target.value)}
                className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-blue-500"
              >
                {complaintsList.map(c => (
                  <option key={c.complaintId} value={c.complaintId}>
                    #{c.complaintId} {c.category ? `— ${c.category}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => {
              fetchCustomerComplaints();
              if (selectedComplaintId) fetchAssignment(selectedComplaintId);
            }}
            title="Refresh"
            className="p-1.5 text-gray-400 hover:text-gray-600 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
          >
            <FaRedo className={`text-xs ${loadingComplaints || loadingAssignment ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-lg flex items-center justify-between text-xs font-semibold animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <FaTimes className="text-xs" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold animate-fade-in flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-700 cursor-pointer">
            <FaTimes className="text-xs" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {loadingComplaints || loadingAssignment ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
          <FaSpinner className="animate-spin text-xl text-blue-600" />
          <span className="text-xs font-medium">Loading complaint assignment details...</span>
        </div>
      ) : complaintsList.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-gray-50/70 rounded-xl border border-dashed border-gray-300">
          <p className="font-bold text-sm text-gray-700">No Complaints on Record</p>
          <p className="text-xs text-gray-400 mt-1">There are no open or recorded complaints for customer #{customerNumber}.</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Create a complaint first to assign it to an escalation team.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
          
          {/* LEFT COLUMN: Current Assignment Status Card */}
          <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="font-bold text-gray-900 text-xs">Assignment Status</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  isAssigned 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {assignmentData?.assignmentStatus || 'UNASSIGNED'}
                </span>
              </div>

              <div className="mt-3.5 space-y-3">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Complaint ID</span>
                  <span className="font-mono font-bold text-blue-700 text-sm mt-0.5 block">
                    #{assignmentData?.complaintId || selectedComplaintId}
                  </span>
                </div>

                {assignmentData?.origin && (
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Ticket Origin</span>
                    <span className="font-semibold text-gray-700 text-xs mt-0.5 block">
                      {assignmentData.origin}
                    </span>
                  </div>
                )}

                {assignmentData?.assignedTo && (
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Allocated Agent / Team</span>
                    <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                      {assignmentData.assignedTo}
                    </span>
                  </div>
                )}

                {assignmentData?.teamAgentId && (
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold block">Team / Agent ID</span>
                    <span className="font-mono font-semibold text-gray-700 text-xs mt-0.5 block">
                      {assignmentData.teamAgentId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {isAssigned && (
              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={handleUnassign}
                  disabled={submitting}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <FaUserSlash className="text-[11px]" />
                  <span>Unassign Ticket</span>
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Assignment Action Form */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-200 shadow-2xs flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Assign or Reassign Ticket</h3>
                  <p className="text-[11px] text-gray-500">Route complaint #{selectedComplaintId} to the appropriate department or owner</p>
                </div>
              </div>

              <form onSubmit={handleAssign} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Team / Agent ID <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text"
                      value={teamAgentId}
                      onChange={(e) => setTeamAgentId(e.target.value)}
                      required
                      placeholder="e.g. T-7"
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Assigned To (Name / Department) <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      required
                      placeholder="e.g. Service Quality Team"
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                  Assigning this complaint will update the ticket allocation status in Keyloop. Both fields are required for active assignment.
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {submitting ? <FaSpinner className="animate-spin text-xs" /> : <FaCheck className="text-xs" />}
                    <span>Assign Complaint #{selectedComplaintId}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
