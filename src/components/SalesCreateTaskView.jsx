import React, { useState, useEffect, useRef } from 'react';
import { useCustomer, isExistingCustomer } from '../context/CustomerContext';
import { createSalesTaskCase } from '../utils/api';
import { 
  BRAND_OPTIONS, 
  getModelsForBrand, 
  getBranchesForGroup, 
  BMW_BRANCHES 
} from '../data/brandModels';
import { 
  FaTasks, 
  FaPaperPlane, 
  FaSpinner, 
  FaCheckCircle, 
  FaFileAlt, 
  FaExclamationTriangle,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaCar,
  FaBuilding,
  FaIdCard,
  FaUserTie,
  FaBullhorn
} from 'react-icons/fa';

export const WHO_PROMPTED_OPTIONS = [
  { code: 'AUTODROM', description: 'Dubai Autodrome' },
  { code: 'BMWSTOCK', description: 'BMW Stock Locator' },
  { code: 'BMWiPORT', description: 'BMW Portal' },
  { code: 'CALLCENT', description: 'CRM Outbound' },
  { code: 'DLRWEBS', description: 'BPS Portal' },
  { code: 'Dubiz', description: 'Dubizzle' },
  { code: 'Email', description: 'Email' },
  { code: 'FACEBOOK', description: 'Facebook' },
  { code: 'IG', description: 'Instagram' },
  { code: 'INTERNAL', description: 'Internal Deal' },
  { code: 'LEADSBRI', description: 'Leads Bridge' },
  { code: 'LINKED', description: 'Linked-In' },
  { code: 'MINIPORT', description: 'www.mini-dubai.com' },
  { code: 'MINSTOCK', description: 'MINI Stock Locator' },
  { code: 'MKTEVT', description: 'Marketing Event' },
  { code: 'OLBNR', description: 'Online Banners' },
  { code: 'OUTADS', description: 'Outdoor Advertising' },
  { code: 'REFF', description: 'Referrals' },
  { code: 'SAD', description: 'Showroom at your doorstep' },
  { code: 'SB', description: 'Service Booking' },
  { code: 'SEARCH', description: 'Search Engines' },
  { code: 'SERVICE', description: 'Service Department' },
  { code: 'SMS', description: 'SMS' },
  { code: 'SNAP', description: 'SNAPCHAT' },
  { code: 'TIK', description: 'TIKTOK' },
  { code: 'TWITTER', description: 'Twitter' },
  { code: 'WHTAPP', description: 'Whatsapp' },
  { code: 'WINDSHOP', description: 'Window Shopping' },
  { code: 'YTUBE', description: 'Youtube' }
];

export default function SalesCreateTaskView() {
  const { customer, vehicles = [], group: contextGroup } = useCustomer();
  const hasCustomer = isExistingCustomer(customer);

  // Group / Brand
  const resolvedGroup = contextGroup || customer?.group || customer?.keyloopGroup || 'BMW';

  // Customer ID & Name
  const resolvedCustomerId = customer?.customerNumber || customer?.customerId || '';
  const rawCustomerName = customer 
    ? `${customer.title ? customer.title + ' ' : ''}${customer.firstName || ''} ${customer.surname || ''}`.trim()
    : '';
  const resolvedCustomerName = rawCustomerName || customer?.customerName || '';

  // Sales Executive (only present if returned from customer profile)
  const rawSalesExecutive = (
    customer?.salesExecutiveId || 
    customer?.salesExecutive || 
    customer?.salesAdvisor || 
    customer?.advisorId || 
    customer?.followupUsername || 
    ''
  ).trim();
  const hasSalesExecutive = Boolean(rawSalesExecutive);

  // Branch Code from customer profile
  const customerBranchCode = String(
    customer?.branchCode || customer?.preferredBranch || '10'
  ).replace(/^Branch\s*(Code\s*)?/i, '').trim() || '10';

  const availableBranches = getBranchesForGroup(resolvedGroup) || BMW_BRANCHES;
  const branchObj = availableBranches.find(b => String(b.code) === String(customerBranchCode));
  const branchDisplayName = branchObj ? `${branchObj.code} - ${branchObj.name}` : `Branch ${customerBranchCode}`;

  // Vehicle data from customer
  const customerVehiclesList = Array.isArray(vehicles) && vehicles.length > 0 
    ? vehicles 
    : (Array.isArray(customer?.vehicles) && customer.vehicles.length > 0 ? customer.vehicles : []);

  const primaryVehicle = customerVehiclesList.length > 0 
    ? customerVehiclesList[0] 
    : (customer?.vehicle || null);

  const hasCustomerVehicle = Boolean(
    primaryVehicle && (
      primaryVehicle.model || 
      primaryVehicle.modelDescription || 
      primaryVehicle.description || 
      primaryVehicle.brand || 
      primaryVehicle.make || 
      primaryVehicle.vin
    )
  );

  const customerVehicleModel = primaryVehicle 
    ? (primaryVehicle.model || primaryVehicle.description || primaryVehicle.modelDescription || primaryVehicle.variant || '')
    : '';

  const customerVehicleMake = primaryVehicle 
    ? (primaryVehicle.brand || primaryVehicle.make || primaryVehicle.manufacturer || resolvedGroup)
    : resolvedGroup;

  // Form State
  const [formData, setFormData] = useState({
    group: resolvedGroup,
    customerId: resolvedCustomerId,
    customerName: resolvedCustomerName,
    whoPrompted: 'SB',
    vehicleType: hasCustomerVehicle ? 'used' : 'new',
    manufacturer: hasCustomerVehicle ? customerVehicleMake : resolvedGroup,
    model: hasCustomerVehicle ? customerVehicleModel : 'X5 M',
    dueDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return d.toISOString().split('T')[0];
    },
    dueTime: '12:00',
    notes: ''
  });

  // State: 'idle' | 'processing' | 'created'
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const resetTimerRef = useRef(null);

  // Sync state if customer changes
  useEffect(() => {
    if (customer) {
      const custNo = customer.customerNumber || customer.customerId || '';
      const name = `${customer.title ? customer.title + ' ' : ''}${customer.firstName || ''} ${customer.surname || ''}`.trim();
      const grp = contextGroup || customer.group || customer.keyloopGroup || 'BMW';

      setFormData(prev => ({
        ...prev,
        group: grp,
        customerId: custNo || prev.customerId,
        customerName: name || customer.customerName || prev.customerName,
        manufacturer: hasCustomerVehicle ? customerVehicleMake : grp,
        model: hasCustomerVehicle ? customerVehicleModel : prev.model,
        vehicleType: hasCustomerVehicle ? 'used' : prev.vehicleType
      }));
    }
  }, [customer, contextGroup, hasCustomerVehicle, customerVehicleModel, customerVehicleMake]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const availableModels = getModelsForBrand(formData.manufacturer);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Applies Script 1 Template into the Notes field
   */
  const handleApplyScript1 = () => {
    const custNo = formData.customerId ? ` ${formData.customerId}` : '';
    const cleanName = formData.customerName ? formData.customerName.replace(/^Mr\.?\s*/i, '').trim() : '';
    const custName = cleanName ? ` ${cleanName}` : (formData.customerName ? ` ${formData.customerName}` : '');
    const activeModel = hasCustomerVehicle ? customerVehicleModel : formData.model;
    const carModel = activeModel ? ` ${activeModel}` : '';
    const location = branchObj ? ` ${branchObj.name || branchObj.code}` : ` Branch ${customerBranchCode}`;

    const scriptText = `Inbound: 
Lead Source: Inbound call
Preferred time to call the cm:
Customer No:${custNo}
Customer Name - Mr${custName}
Current/Old car/bike:
Model of Interest/New Car:${carModel}
Location:${location}
Age For M cars only:
Purchase timeframe:
kindly call and assist. 
For any Clarification, please call me on EXT: 4447.`;

    setFormData(prev => ({ ...prev, notes: scriptText }));
  };

  /**
   * Submit Sales Task to POST /api/intake/cases
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitStatus === 'processing') return;

    setErrorMessage('');
    setSubmitStatus('processing');

    try {
      const activeModel = hasCustomerVehicle ? customerVehicleModel : formData.model;
      const activeMake = hasCustomerVehicle ? customerVehicleMake : (formData.manufacturer || formData.group);
      const activeVehicleType = hasCustomerVehicle ? 'used' : (formData.vehicleType || 'new');
      const activeDueDate = typeof formData.dueDate === 'function' ? formData.dueDate() : formData.dueDate;

      const payloadDetails = {
        group: formData.group,
        customerId: String(formData.customerId).trim(),
        customerName: String(formData.customerName).trim(),
        callScript: 'TELE-SALESSCRIPT',
        vehicleType: String(activeVehicleType).trim(),
        manufacturer: String(activeMake).trim(),
        model: String(activeModel).trim(),
        branchCode: String(customerBranchCode).trim(),
        eventType: 'Z0000001', // Hardcoded as instructed
        whoPrompted: String(formData.whoPrompted || 'SB').trim(),
        notes: String(formData.notes || '').trim(),
        dueDate: activeDueDate,
        dueTime: String(formData.dueTime).trim()
      };

      // Only pass salesExecutiveId if we have it from customer profile
      if (hasSalesExecutive && rawSalesExecutive) {
        payloadDetails.salesExecutiveId = String(rawSalesExecutive).trim();
      }

      await createSalesTaskCase(payloadDetails);

      // On 200 / success:
      setSubmitStatus('created');

      // Reset button state back to 'idle' after 15 seconds
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setSubmitStatus('idle');
      }, 15000);

    } catch (err) {
      console.error('Error submitting sales task:', err);
      setSubmitStatus('idle');
      setErrorMessage(err.message || 'Failed to submit sales task. Please check server connectivity.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 overflow-hidden mb-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-xs border border-white/20">
            <FaTasks className="text-lg text-blue-200" />
          </div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight">Create Sales Task</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-blue-200 font-medium">Target Brand:</span>
          <span className="px-2.5 py-1 rounded bg-white text-blue-900 font-bold text-xs shadow-xs">
            {formData.group}
          </span>
        </div>
      </div>

      {/* Main Form - Single Unified Page */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
        
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 text-rose-800 text-xs">
            <FaExclamationTriangle className="text-rose-600 mt-0.5 shrink-0 text-sm" />
            <div className="flex-1">
              <span className="font-semibold">Submission Failed: </span>
              {errorMessage}
            </div>
            <button 
              type="button" 
              onClick={() => setErrorMessage('')}
              className="text-rose-500 hover:text-rose-700 font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* Unified Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Group / Brand */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Group / Brand <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="group"
              value={formData.group}
              readOnly={hasCustomer}
              onChange={handleChange}
              className={`w-full px-3 py-2 text-xs border rounded-lg font-medium ${
                hasCustomer
                  ? 'border-slate-200 bg-slate-100 text-slate-700 cursor-not-allowed select-none'
                  : 'border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500'
              }`}
              required
            />
          </div>

          {/* Customer ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer ID <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FaIdCard className="absolute left-3 top-2.5 text-slate-400 text-xs pointer-events-none" />
              <input
                type="text"
                name="customerId"
                value={formData.customerId}
                readOnly={hasCustomer}
                onChange={handleChange}
                placeholder="e.g. 462977"
                className={`w-full pl-8 pr-3 py-2 text-xs border rounded-lg ${
                  hasCustomer
                    ? 'border-slate-200 bg-slate-100 text-slate-700 font-medium cursor-not-allowed select-none'
                    : 'border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500'
                }`}
                required
              />
            </div>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-2.5 text-slate-400 text-xs pointer-events-none" />
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                readOnly={hasCustomer}
                onChange={handleChange}
                placeholder="e.g. Pratyush Pattepu"
                className={`w-full pl-8 pr-3 py-2 text-xs border rounded-lg ${
                  hasCustomer
                    ? 'border-slate-200 bg-slate-100 text-slate-700 font-medium cursor-not-allowed select-none'
                    : 'border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500'
                }`}
                required
              />
            </div>
          </div>

          {/* Sales Executive ID (ONLY displayed if obtained from customer profile) */}
          {hasSalesExecutive && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sales Executive ID
              </label>
              <div className="relative">
                <FaUserTie className="absolute left-3 top-2.5 text-slate-400 text-xs pointer-events-none" />
                <input
                  type="text"
                  readOnly
                  value={rawSalesExecutive}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-100 text-slate-700 font-medium cursor-not-allowed select-none"
                />
              </div>
            </div>
          )}

          {/* Branch Location (From Customer Profile - No Dropdown) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Branch Location
            </label>
            <div className="relative">
              <FaBuilding className="absolute left-3 top-2.5 text-slate-400 text-xs pointer-events-none" />
              <input
                type="text"
                readOnly
                value={branchDisplayName}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-100 text-slate-700 font-medium cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* Who Prompted (Dropdown with Descriptions, sends Code) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Who Prompted <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FaBullhorn className="absolute left-3 top-2.5 text-slate-400 text-xs pointer-events-none" />
              <select
                name="whoPrompted"
                value={formData.whoPrompted}
                onChange={handleChange}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                required
              >
                {WHO_PROMPTED_OPTIONS.map(item => (
                  <option key={item.code} value={item.code}>
                    {item.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vehicle Type (Read-only if customer has vehicle, dropdown if not) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vehicle Type <span className="text-rose-500">*</span>
            </label>
            {hasCustomerVehicle ? (
              <input
                type="text"
                readOnly
                value="Customer Vehicle"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-100 text-slate-700 font-medium cursor-not-allowed select-none"
              />
            ) : (
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="new">New Vehicle</option>
                <option value="used">Used / Pre-Owned</option>
              </select>
            )}
          </div>

          {/* Manufacturer (Read-only if customer has vehicle, input if not) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Manufacturer <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="manufacturer"
              readOnly={hasCustomerVehicle}
              value={hasCustomerVehicle ? customerVehicleMake : formData.manufacturer}
              onChange={handleChange}
              placeholder="e.g. BMW"
              className={`w-full px-3 py-2 text-xs border rounded-lg ${
                hasCustomerVehicle
                  ? 'border-slate-200 bg-slate-100 text-slate-700 font-medium cursor-not-allowed select-none'
                  : 'border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500'
              }`}
              required
            />
          </div>

          {/* Model of Interest (Read-only if customer has vehicle, dropdown/input if not) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Model {hasCustomerVehicle ? '' : 'of Interest'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              {hasCustomerVehicle ? (
                <input
                  type="text"
                  readOnly
                  value={customerVehicleModel}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-100 text-slate-700 font-medium cursor-not-allowed select-none"
                />
              ) : (
                <>
                  <input
                    type="text"
                    name="model"
                    list="models-list"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g. X5 M"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <datalist id="models-list">
                    {availableModels.map(m => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Due Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-2.5 text-slate-400 text-xs pointer-events-none" />
              <input
                type="date"
                name="dueDate"
                value={typeof formData.dueDate === 'function' ? formData.dueDate() : formData.dueDate}
                onChange={handleChange}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Due Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Due Time <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FaClock className="absolute left-3 top-2.5 text-slate-400 text-xs pointer-events-none" />
              <input
                type="time"
                name="dueTime"
                value={formData.dueTime}
                onChange={handleChange}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

        </div>

        {/* Task Notes / Instructions & "Script 1" Template Button */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-700">
              Task Notes / Instructions <span className="text-rose-500">*</span>
            </label>

            {/* Template Button: "Script 1" */}
            <button
              type="button"
              onClick={handleApplyScript1}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="Populate notes with Inbound Script 1 Template"
            >
              <FaFileAlt className="text-indigo-600 text-xs" />
              <span>Script 1</span>
            </button>
          </div>

          <textarea
            name="notes"
            rows={8}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Click 'Script 1' above to load the inbound script template or type custom task notes here..."
            className="w-full p-3 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed shadow-2xs"
            required
          />
        </div>

        {/* Action Button & Lifecycle States */}
        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            {submitStatus === 'processing' && (
              <span className="inline-flex items-center gap-1.5 text-blue-700 font-medium">
                <FaSpinner className="animate-spin text-blue-600" />
                Submitting intake case to Keyloop broker...
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {submitStatus === 'processing' && (
              <button
                type="button"
                disabled
                className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 opacity-90 cursor-not-allowed flex items-center gap-2 shadow-xs"
              >
                <FaSpinner className="animate-spin text-xs" />
                <span>Processing...</span>
              </button>
            )}

            {submitStatus === 'created' && (
              <button
                type="button"
                disabled
                className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-emerald-600 cursor-default flex items-center gap-2 shadow-xs transition-all"
              >
                <FaCheckCircle className="text-xs" />
                <span>Task Created</span>
              </button>
            )}

            {submitStatus === 'idle' && (
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <FaPaperPlane className="text-xs" />
                <span>Create Sales Task</span>
              </button>
            )}
          </div>
        </div>

      </form>
    </div>
  );
}
