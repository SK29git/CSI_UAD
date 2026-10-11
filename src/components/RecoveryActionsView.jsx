import React, { useState, useEffect } from "react";
import { useCustomer } from "../context/CustomerContext";
import { apiFetch } from "../utils/api";
import {
  FaCar,
  FaGift,
  FaPhoneVolume,
  FaCheckCircle,
  FaPlus,
  FaClock,
  FaSpinner,
  FaCheck,
  FaRedo,
  FaEdit,
  FaListUl,
  FaTimes,
} from "react-icons/fa";

export default function RecoveryActionsView({ complaintId: propComplaintId }) {
  const { customer, getFormattedName, agentId } = useCustomer();
  const customerName = getFormattedName();
  const group = customer?.keyloopGroup || "";
  const customerNumber = customer?.customerNumber || customer?.id || "";

  // Active view tab: 'list' | 'create' | 'update'
  const [activeSubView, setActiveSubView] = useState("list");

  const [complaintsList, setComplaintsList] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(
    propComplaintId || "",
  );
  const [actions, setActions] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [loadingActions, setLoadingActions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // --- Create Form State ---
  const [createActionType, setCreateActionType] = useState("Call back");
  const [createDescription, setCreateDescription] = useState("");
  const [createOwner, setCreateOwner] = useState(agentId || "Service Advisor");
  const [createDueDate, setCreateDueDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // --- Update Form State ---
  const [updateActionId, setUpdateActionId] = useState("");
  const [updateStatus, setUpdateStatus] = useState("OPEN");
  const [updateActionType, setUpdateActionType] = useState("Call back");
  const [updateDescription, setUpdateDescription] = useState("");
  const [updateOwner, setUpdateOwner] = useState("");
  const [updateDueDate, setUpdateDueDate] = useState("");

  // 1. Fetch customer's real complaints from API
  const fetchCustomerComplaints = async () => {
    if (!customerNumber) {
      setComplaintsList([]);
      setSelectedComplaintId("");
      setActions([]);
      setLoadingComplaints(false);
      return;
    }

    setLoadingComplaints(true);
    try {
      const res = await apiFetch(
        `/api/v1/complaints?group=${group}&customerNumber=${customerNumber}`,
      );
      if (res && res.ok && Array.isArray(res.data) && res.data.length > 0) {
        setComplaintsList(res.data);

        // Select specified complaint or default to first complaint
        setSelectedComplaintId((prev) => {
          if (
            propComplaintId &&
            res.data.some((c) => c.complaintId === propComplaintId)
          ) {
            return propComplaintId;
          }
          if (prev && res.data.some((c) => c.complaintId === prev)) {
            return prev;
          }
          return res.data[0].complaintId;
        });
      } else {
        setComplaintsList([]);
        setSelectedComplaintId("");
        setActions([]);
      }
    } catch (err) {
      console.warn("Failed to fetch customer complaints:", err);
      setComplaintsList([]);
      setSelectedComplaintId("");
      setActions([]);
    } finally {
      setLoadingComplaints(false);
    }
  };

  // 2. Fetch recovery actions for the selected complaint ID
  const fetchRecoveryActions = async (cid) => {
    if (!cid || !group) {
      setActions([]);
      setLoadingActions(false);
      return;
    }

    setLoadingActions(true);
    try {
      const apiUrl = `/api/v1/complaints/${group}/${cid}/recovery-actions`;
      const res = await apiFetch(apiUrl);
      if (res && res.ok && Array.isArray(res.data)) {
        setActions(res.data);
        // Default update selection if actions exist
        if (res.data.length > 0 && !updateActionId) {
          populateUpdateForm(res.data[0]);
        }
      } else {
        setActions([]);
      }
    } catch (err) {
      console.warn("Failed to fetch recovery actions:", err);
      setActions([]);
    } finally {
      setLoadingActions(false);
    }
  };

  useEffect(() => {
    fetchCustomerComplaints();
  }, [group, customerNumber, propComplaintId]);

  useEffect(() => {
    if (selectedComplaintId) {
      fetchRecoveryActions(selectedComplaintId);
    } else {
      setActions([]);
    }
  }, [group, selectedComplaintId]);

  // Populate update form helper
  const populateUpdateForm = (actionItem) => {
    if (!actionItem) return;
    setUpdateActionId(actionItem.actionId || actionItem.id || "");
    setUpdateStatus(actionItem.status || "OPEN");
    setUpdateActionType(actionItem.actionType || "Call back");
    setUpdateDescription(actionItem.description || "");
    setUpdateOwner(actionItem.owner || agentId || "Service Advisor");
    setUpdateDueDate(
      actionItem.dueDate || new Date().toISOString().split("T")[0],
    );
  };

  // Switch to update view with specific item
  const handleOpenUpdate = (actionItem) => {
    populateUpdateForm(actionItem);
    setActiveSubView("update");
    setErrorMessage(null);
  };

  // Handle switching selected action in Update view
  const handleSelectUpdateActionChange = (id) => {
    const item = actions.find(
      (a) =>
        (a.actionId || a.id) === id ||
        String(a.actionId || a.id) === String(id),
    );
    if (item) {
      populateUpdateForm(item);
    }
  };

  // 3. POST Create Recovery Action
  const handleCreateAction = async (e) => {
    e.preventDefault();
    if (!selectedComplaintId) return;

    setSubmitting(true);
    setErrorMessage(null);
    const payload = {
      actionType: createActionType,
      description: createDescription,
      owner: createOwner,
      dueDate: createDueDate,
    };

    try {
      const apiUrl = `/api/v1/complaints/${group}/${selectedComplaintId}/recovery-actions`;
      const res = await apiFetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res && res.ok && res.data) {
        setActions((prev) => [res.data, ...prev]);
        setToastMessage(
          `Recovery action #${res.data.actionId || "new"} created successfully.`,
        );
        setTimeout(() => setToastMessage(null), 4000);
        setCreateDescription("");
        populateUpdateForm(res.data);
        setActiveSubView("list");
      } else {
        setErrorMessage(res?.message || "Failed to create recovery action");
      }
    } catch (err) {
      console.warn("Create recovery action error:", err);
      setErrorMessage(err.message || "Error creating recovery action");
    } finally {
      setSubmitting(false);
    }
  };

  // 4. PATCH Update Recovery Action
  const handleUpdateAction = async (e) => {
    e.preventDefault();
    if (!selectedComplaintId || !updateActionId) return;

    setSubmitting(true);
    setErrorMessage(null);
    const payload = {
      status: updateStatus,
      actionType: updateActionType,
      description: updateDescription,
      owner: updateOwner,
      dueDate: updateDueDate,
    };

    try {
      const apiUrl = `/api/v1/complaints/${group}/${selectedComplaintId}/recovery-actions/${updateActionId}`;
      const res = await apiFetch(apiUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res && res.ok) {
        const updatedItem = res.data || {
          actionId: updateActionId,
          ...payload,
        };
        setActions((prev) =>
          prev.map((act) => {
            if (
              (act.actionId || act.id) === updateActionId ||
              String(act.actionId || act.id) === String(updateActionId)
            ) {
              return { ...act, ...updatedItem };
            }
            return act;
          }),
        );
        setToastMessage(
          `Recovery action #${updateActionId} updated successfully.`,
        );
        setTimeout(() => setToastMessage(null), 4000);
        setActiveSubView("list");
      } else {
        setErrorMessage(res?.message || "Failed to update recovery action");
      }
    } catch (err) {
      console.warn("Update recovery action error:", err);
      setErrorMessage(err.message || "Error updating recovery action");
    } finally {
      setSubmitting(false);
    }
  };

  // Quick 1-click status update to DONE
  const handleQuickMarkDone = async (actionId) => {
    if (!selectedComplaintId) return;

    try {
      const apiUrl = `/api/v1/complaints/${group}/${selectedComplaintId}/recovery-actions/${actionId}`;
      const payload = {
        status: "DONE",
        description: "Marked completed from Agent Desktop",
      };

      const res = await apiFetch(apiUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res && res.ok) {
        setActions((prev) =>
          prev.map((act) => {
            if (
              (act.actionId || act.id) === actionId ||
              String(act.actionId || act.id) === String(actionId)
            ) {
              return { ...act, status: "DONE" };
            }
            return act;
          }),
        );
        setToastMessage(`Action #${actionId} marked as completed.`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.warn("Quick mark done error:", err);
    }
  };

  const selectedComplaintObj = complaintsList.find(
    (c) => c.complaintId === selectedComplaintId,
  );

  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200 flex flex-col gap-4 w-full">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FaGift className="text-emerald-600" /> Recovery Actions
          </h2>
          <p className="text-[11px] text-gray-500">
            Track and dispatch recovery actions for customer{" "}
            <span className="font-semibold text-gray-800">
              {customerName || `#${customerNumber}`}
            </span>
            {selectedComplaintId && (
              <>
                {" "}
                — Complaint{" "}
                <span className="font-mono font-bold text-blue-600">
                  #{selectedComplaintId}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Complaint Selector if multiple exist */}
          {complaintsList.length > 1 && (
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Ticket:
              </label>
              <select
                value={selectedComplaintId}
                onChange={(e) => setSelectedComplaintId(e.target.value)}
                className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-blue-500"
              >
                {complaintsList.map((c) => (
                  <option key={c.complaintId} value={c.complaintId}>
                    #{c.complaintId} {c.category ? `— ${c.category}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subview Nav Tabs: Actions List / Create Action / Update Action */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => {
                setActiveSubView("list");
                setErrorMessage(null);
              }}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 font-semibold ${
                activeSubView === "list"
                  ? "bg-white text-gray-900 shadow-2xs font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FaListUl className="text-[10px]" />
              <span>Actions List</span>
              {actions.length > 0 && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                  {actions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveSubView("create");
                setErrorMessage(null);
                setCreateDescription("");
                setCreateDueDate(new Date().toISOString().split("T")[0]);
              }}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 font-semibold ${
                activeSubView === "create"
                  ? "bg-emerald-600 text-white shadow-2xs font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FaPlus className="text-[10px]" />
              <span>Create Action</span>
            </button>

            <button
              onClick={() => {
                if (actions.length > 0 && !updateActionId) {
                  populateUpdateForm(actions[0]);
                }
                setActiveSubView("update");
                setErrorMessage(null);
              }}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 font-semibold ${
                activeSubView === "update"
                  ? "bg-blue-600 text-white shadow-2xs font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FaEdit className="text-[10px]" />
              <span>Update Action</span>
            </button>
          </div>

          <button
            onClick={() => {
              fetchCustomerComplaints();
              if (selectedComplaintId)
                fetchRecoveryActions(selectedComplaintId);
            }}
            title="Refresh"
            className="p-1.5 text-gray-400 hover:text-gray-600 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
          >
            <FaRedo
              className={`text-xs ${loadingComplaints || loadingActions ? "animate-spin text-blue-600" : ""}`}
            />
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
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold animate-fade-in flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-700 cursor-pointer"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 1: CREATE RECOVERY ACTION (POST /recovery-actions) */}
      {/* ======================================================== */}
      {activeSubView === "create" ? (
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 text-xs animate-fade-in space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                Create New Recovery Action
              </h3>
              <p className="text-[11px] text-gray-500">
                Posting new resolution or goodwill record against Complaint{" "}
                <span className="font-mono font-bold text-blue-600">
                  #{selectedComplaintId}
                </span>
              </p>
            </div>
            <button
              onClick={() => setActiveSubView("list")}
              className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={handleCreateAction}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Action Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={createActionType}
                onChange={(e) => setCreateActionType(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="Call back">Call back</option>
                <option value="Goodwill voucher">Goodwill voucher</option>
                <option value="Courtesy Vehicle">Courtesy Vehicle</option>
                <option value="Free Inspection">Free Inspection</option>
                <option value="Manager Escalation">Manager Escalation</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Owner / Advisor <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={createOwner}
                onChange={(e) => setCreateOwner(e.target.value)}
                required
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={createDueDate}
                onChange={(e) => setCreateDueDate(e.target.value)}
                required
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Complaint ID
              </label>
              <input
                type="text"
                value={selectedComplaintId}
                disabled
                className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Description / Customer Voice{" "}
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                required
                placeholder="Describe resolution action or goodwill offer details..."
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-medium leading-relaxed focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveSubView("list")}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                {submitting ? (
                  <FaSpinner className="animate-spin text-xs" />
                ) : (
                  <FaCheck className="text-xs" />
                )}
                <span>Save Recovery Action</span>
              </button>
            </div>
          </form>
        </div>
      ) : activeSubView === "update" ? (
        /* ============================================================== */
        /* VIEW 2: UPDATE RECOVERY ACTION (PATCH /recovery-actions/:id)   */
        /* ============================================================== */
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 text-xs animate-fade-in space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                Update Recovery Action
              </h3>
              <p className="text-[11px] text-gray-500">
                Updating record status and notes for Complaint{" "}
                <span className="font-mono font-bold text-blue-600">
                  #{selectedComplaintId}
                </span>
              </p>
            </div>
            <button
              onClick={() => setActiveSubView("list")}
              className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>

          {actions.length === 0 ? (
            <div className="py-8 text-center text-gray-500 bg-white rounded-lg border border-dashed border-gray-200">
              <p className="font-bold text-xs text-gray-700">
                No Recovery Actions Available to Update
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Please create a recovery action first before updating.
              </p>
              <button
                type="button"
                onClick={() => setActiveSubView("create")}
                className="mt-3 px-3.5 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 cursor-pointer"
              >
                Go to Create Action
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleUpdateAction}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {/* Select Action ID */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Select Action to Update{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={updateActionId}
                  onChange={(e) =>
                    handleSelectUpdateActionChange(e.target.value)
                  }
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-blue-500"
                >
                  {actions.map((act) => {
                    const aId = act.actionId || act.id;
                    return (
                      <option key={aId} value={aId}>
                        Action #{aId} — {act.actionType || "Recovery"} (
                        {act.status || "OPEN"})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="OPEN">OPEN (Pending)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Working)</option>
                  <option value="DONE">DONE (Completed)</option>
                  <option value="CANCELLED">CANCELLED (Closed)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Action Type
                </label>
                <select
                  value={updateActionType}
                  onChange={(e) => setUpdateActionType(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="Call back">Call back</option>
                  <option value="Goodwill voucher">Goodwill voucher</option>
                  <option value="Courtesy Vehicle">Courtesy Vehicle</option>
                  <option value="Free Inspection">Free Inspection</option>
                  <option value="Manager Escalation">Manager Escalation</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Owner / Advisor
                </label>
                <input
                  type="text"
                  value={updateOwner}
                  onChange={(e) => setUpdateOwner(e.target.value)}
                  required
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={updateDueDate}
                  onChange={(e) => setUpdateDueDate(e.target.value)}
                  required
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Complaint Reference
                </label>
                <input
                  type="text"
                  value={selectedComplaintId}
                  disabled
                  className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Resolution Description / Notes
                </label>
                <textarea
                  rows={3}
                  value={updateDescription}
                  onChange={(e) => setUpdateDescription(e.target.value)}
                  required
                  placeholder="Update outcome notes, customer callback results, or vouchers provided..."
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-medium leading-relaxed focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveSubView("list")}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  {submitting ? (
                    <FaSpinner className="animate-spin text-xs" />
                  ) : (
                    <FaCheck className="text-xs" />
                  )}
                  <span>Update Action #{updateActionId}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* ============================================================== */
        /* VIEW 3: ACTIONS LIST (Shows Cards or Clean Empty State)        */
        /* ============================================================== */
        <div>
          {loadingComplaints || loadingActions ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <FaSpinner className="animate-spin text-xl text-emerald-600" />
              <span className="text-xs font-medium">
                Loading recovery actions from API...
              </span>
            </div>
          ) : complaintsList.length === 0 ? (
            <div className="py-12 text-center text-gray-500 bg-gray-50/70 rounded-xl border border-dashed border-gray-300">
              <p className="font-bold text-sm text-gray-700">
                No Complaints Found
              </p>
              <p className="text-xs text-gray-400 mt-1">
                There are no open or recorded complaints for customer #
                {customerNumber}.
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Please create a complaint ticket first to attach recovery
                actions.
              </p>
            </div>
          ) : actions.length === 0 ? (
            /* Clean Empty State WITHOUT Duplicate Button */
            <div className="py-12 text-center text-gray-500 bg-gray-50/70 rounded-xl border border-dashed border-gray-300">
              <p className="font-bold text-sm text-gray-700">
                No Recovery Actions Found
              </p>
              <p className="text-xs text-gray-400 mt-1">
                No recovery actions recorded for Complaint{" "}
                <span className="font-mono font-bold text-gray-800">
                  #{selectedComplaintId}
                </span>
                {selectedComplaintObj?.category
                  ? ` (${selectedComplaintObj.category})`
                  : ""}
                .
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Click the{" "}
                <span className="font-semibold text-emerald-700">
                  "Create Action"
                </span>{" "}
                tab above to register a new callback or goodwill record.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {actions.map((act, idx) => {
                const isDone =
                  (act.status || "").toUpperCase() === "DONE" ||
                  (act.status || "").toUpperCase() === "COMPLETED";
                const actId = act.actionId || act.id || idx;
                return (
                  <div
                    key={actId}
                    className="p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white flex flex-col justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {act.actionType === "Courtesy Vehicle" ? (
                            <FaCar />
                          ) : act.actionType === "Goodwill voucher" ||
                            act.actionType === "Voucher / Goodwill" ? (
                            <FaGift />
                          ) : (
                            <FaPhoneVolume />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded text-[10px]">
                              #{actId}
                            </span>
                            <h3 className="font-bold text-gray-900 text-xs leading-tight">
                              {act.actionType || "Recovery Action"}
                            </h3>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-1">
                            {act.description || "—"}
                          </p>
                          <span className="text-[10px] text-gray-400 font-medium block mt-1">
                            Owner:{" "}
                            <strong className="text-gray-700">
                              {act.owner || "—"}
                            </strong>{" "}
                            | Due:{" "}
                            <strong className="text-gray-700">
                              {act.dueDate || "—"}
                            </strong>
                            {act.updatedDate && (
                              <span className="ml-1 text-gray-400">
                                (Updated: {act.updatedDate})
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 uppercase ${
                          isDone
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : (act.status || "").toUpperCase() === "CANCELLED"
                              ? "bg-rose-100 text-rose-800 border border-rose-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                        }`}
                      >
                        {isDone ? (
                          <FaCheckCircle className="text-[9px]" />
                        ) : (
                          <FaClock className="text-[9px]" />
                        )}
                        {act.status || "OPEN"}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleOpenUpdate(act)}
                        className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <FaEdit className="text-[10px]" />
                        <span>Update</span>
                      </button>

                      {!isDone && (
                        <button
                          onClick={() => handleQuickMarkDone(actId)}
                          className="text-[11px] font-bold text-white bg-emerald-600 px-3 py-1 rounded-lg hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          <FaCheck className="text-[9px]" />
                          <span>Mark Done</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
