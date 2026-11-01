import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { linkNewVehicleToCustomer } from '../utils/api';
import { BMW_MODELS, getVariantsForModel } from '../data/bmwModelsVariants';
import {
  FaCar,
  FaPlusCircle,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSearch,
  FaChevronDown,
  FaUser,
  FaIdBadge,
  FaBuilding
} from 'react-icons/fa';

const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'Plug-in Hybrid'];
const ODOMETER_TYPES = ['Kilometres', 'Miles'];

export default function AddNewVehicleModal({
  isOpen = false,
  onClose,
  onSuccess
}) {
  const { customer, group: contextGroup } = useCustomer();

  // Customer Details (Read-only)
  const group = contextGroup || customer?.keyloopGroup || 'BMW';
  const customerId = customer?.customerNumber || '';
  const customerName =
    customer?.fullName ||
    customer?.customerName ||
    [customer?.firstName, customer?.surname].filter(Boolean).join(' ') ||
    '';

  // Form Fields
  const [selectedChassis, setSelectedChassis] = useState('');
  const [selectedVariantCode, setSelectedVariantCode] = useState('');
  const [customVariantCode, setCustomVariantCode] = useState('');
  const [description, setDescription] = useState('');

  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vin, setVin] = useState('');
  const [registrationDate, setRegistrationDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [odometer, setOdometer] = useState('0');
  const [odometerType, setOdometerType] = useState('Kilometres');
  const [fuelType, setFuelType] = useState('Petrol');
  const [engineNumber, setEngineNumber] = useState('');

  // Dropdown UI states
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const modelDropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedChassis('');
      setSelectedVariantCode('');
      setCustomVariantCode('');
      setDescription('');
      setRegistrationNumber('');
      setVin('');
      setRegistrationDate(new Date().toISOString().split('T')[0]);
      setOdometer('0');
      setOdometerType('Kilometres');
      setFuelType('Petrol');
      setEngineNumber('');
      setModelSearch('');
      setIsModelDropdownOpen(false);
      setErrorMessage('');
      setSuccessMessage('');
      setSubmitting(false);
    }
  }, [isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target)) {
        setIsModelDropdownOpen(false);
      }
    }
    if (isModelDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto focus search input
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModelDropdownOpen]);

  // Filtered models for search inside dropdown
  const filteredModels = useMemo(() => {
    if (!modelSearch.trim()) return BMW_MODELS;
    const q = modelSearch.toLowerCase();
    return BMW_MODELS.filter(
      m =>
        m.modelAsShown.toLowerCase().includes(q) ||
        m.chassisCode.toLowerCase().includes(q) ||
        m.modelName.toLowerCase().includes(q)
    );
  }, [modelSearch]);

  // Current selected model
  const currentModel = useMemo(() => {
    return BMW_MODELS.find(m => m.chassisCode === selectedChassis);
  }, [selectedChassis]);

  // Available variants for selected chassis
  const availableVariants = useMemo(() => {
    if (!selectedChassis) return [];
    return getVariantsForModel(selectedChassis);
  }, [selectedChassis]);

  // Select a model from custom dropdown
  const handleSelectModel = model => {
    setSelectedChassis(model.chassisCode);
    setSelectedVariantCode('');
    setCustomVariantCode('');
    setDescription(`BMW ${model.modelName}`);
    setIsModelDropdownOpen(false);
    setModelSearch('');
  };

  // Handle variant change
  const handleVariantChange = e => {
    const code = e.target.value;
    setSelectedVariantCode(code);
    if (code && code !== '__CUSTOM__') {
      const v = availableVariants.find(item => item.variantCode === code);
      if (v && currentModel) {
        setDescription(`BMW ${currentModel.modelName} ${v.variant}`);
      }
    }
  };

  // Submit Handler
  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanVin = vin.trim().toUpperCase();
    const cleanPlate = registrationNumber.trim().toUpperCase();
    const cleanModel = selectedChassis.trim();
    const cleanVariant = (
      selectedVariantCode === '__CUSTOM__' ? customVariantCode : selectedVariantCode
    ).trim();

    if (!cleanModel) {
      setErrorMessage('Please select a BMW Model / Chassis.');
      return;
    }
    if (!cleanVariant) {
      setErrorMessage('Please select or enter a Variant Code.');
      return;
    }
    if (!cleanPlate) {
      setErrorMessage('Registration / License Plate Number is required.');
      return;
    }
    if (!cleanVin) {
      setErrorMessage('VIN is required.');
      return;
    }
    if (cleanVin.length !== 17) {
      setErrorMessage(`VIN must be exactly 17 characters (currently ${cleanVin.length}).`);
      return;
    }

    setSubmitting(true);

    const payloadDetails = {
      group: group || 'BMW',
      customerId: String(customerId).trim(),
      customerName: customerName.trim() || undefined,
      registrationNumber: cleanPlate,
      manufacturer: 'BMW',
      model: cleanModel,
      variant: cleanVariant,
      description: description.trim() || `BMW ${currentModel?.modelName || cleanModel}`,
      odometerType: odometerType || 'Kilometres',
      odometer: odometer.trim() || '0',
      vin: cleanVin,
      engineNumber: engineNumber.trim() || undefined,
      fuelType: fuelType || 'Petrol',
      registrationDate: registrationDate || undefined
    };

    try {
      const res = await linkNewVehicleToCustomer(payloadDetails);
      if (res && res.ok) {
        setSuccessMessage('Vehicle successfully linked to customer!');
        setTimeout(() => {
          if (onSuccess) onSuccess(payloadDetails);
          if (onClose) onClose();
        }, 800);
      } else {
        const errDetail =
          res?.data?.error || res?.data?.message || res?.error || 'Failed to submit vehicle linkage request';
        setErrorMessage(typeof errDetail === 'string' ? errDetail : JSON.stringify(errDetail));
      }
    } catch (err) {
      console.error('Error in linkNewVehicleToCustomer:', err);
      setErrorMessage(err.message || 'Network / Server connection error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[95vh]">
        
        {/* Compact Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/15 rounded-lg">
              <FaCar className="text-base" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold leading-tight">Add New Vehicle</h2>
              <p className="text-[11px] text-emerald-100 font-normal">
                Link new vehicle to customer profile
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-md transition-colors cursor-pointer"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Read-only Customer Information Banner */}
        <div className="px-5 py-2.5 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <FaIdBadge className="text-slate-500 text-xs" />
            <span className="text-slate-500">Customer ID:</span>
            <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              {customerId || 'N/A'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <FaUser className="text-slate-500 text-xs" />
            <span className="text-slate-500">Customer Name:</span>
            <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              {customerName || 'N/A'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <FaBuilding className="text-slate-500 text-xs" />
            <span className="text-slate-500">Brand:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {group}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          
          {/* Error & Success Feedback */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
              <FaExclamationTriangle className="text-sm shrink-0" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
              <FaCheckCircle className="text-sm shrink-0 text-emerald-600" />
              <div className="flex-1">{successMessage}</div>
            </div>
          )}

          {/* Grid Section 1: Model & Variant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Modern Searchable Dropdown for Model */}
            <div className="relative" ref={modelDropdownRef}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Model (Chassis Code) <span className="text-red-500">*</span>
                </label>
                {selectedChassis && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Code: {selectedChassis}
                  </span>
                )}
              </div>

              {/* Dropdown trigger button */}
              <button
                type="button"
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 bg-white border rounded-lg text-xs font-medium text-left transition-all cursor-pointer ${
                  isModelDropdownOpen
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <span className={currentModel ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
                  {currentModel ? currentModel.modelAsShown : '-- Select Model / Chassis --'}
                </span>
                <FaChevronDown
                  className={`text-[10px] text-slate-400 transition-transform ${
                    isModelDropdownOpen ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>

              {/* Dropdown Popup with search inside */}
              {isModelDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
                  
                  {/* Search inside dropdown */}
                  <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <FaSearch className="text-slate-400 text-xs shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={modelSearch}
                      onChange={e => setModelSearch(e.target.value)}
                      placeholder="Search model or chassis code (e.g. X5, F95, G26)..."
                      className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-hidden"
                    />
                    {modelSearch && (
                      <button
                        type="button"
                        onClick={() => setModelSearch('')}
                        className="text-slate-400 hover:text-slate-600 text-[10px] p-0.5"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>

                  {/* Scrollable Model List */}
                  <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {filteredModels.length === 0 ? (
                      <div className="p-3 text-center text-slate-400 text-xs">
                        No models matching "{modelSearch}"
                      </div>
                    ) : (
                      filteredModels.map(m => {
                        const isSelected = m.chassisCode === selectedChassis;
                        return (
                          <button
                            key={m.chassisCode}
                            type="button"
                            onClick={() => handleSelectModel(m)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-emerald-50 transition-colors cursor-pointer ${
                              isSelected ? 'bg-emerald-50/80 font-bold text-emerald-900' : 'text-slate-700'
                            }`}
                          >
                            <span className="truncate">{m.modelAsShown}</span>
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0 ml-2">
                              {m.chassisCode}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Variant Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Variant Code <span className="text-red-500">*</span>
                </label>
                {selectedVariantCode && selectedVariantCode !== '__CUSTOM__' && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Code: {selectedVariantCode}
                  </span>
                )}
              </div>
              <select
                value={selectedVariantCode}
                onChange={handleVariantChange}
                disabled={!selectedChassis}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition-all disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
                required
              >
                <option value="">
                  {!selectedChassis
                    ? '-- Select Model First --'
                    : availableVariants.length > 0
                    ? '-- Select Variant --'
                    : '-- No standard variant --'}
                </option>
                {availableVariants.map(v => (
                  <option key={v.variantCode || v.variant} value={v.variantCode}>
                    {v.variant} ({v.variantCode})
                  </option>
                ))}
                <option value="__CUSTOM__">Other / Manual Variant Code...</option>
              </select>

              {selectedVariantCode === '__CUSTOM__' && (
                <input
                  type="text"
                  value={customVariantCode}
                  onChange={e => setCustomVariantCode(e.target.value.toUpperCase())}
                  placeholder="Enter Variant Code (e.g. 11ET)"
                  className="mt-1.5 w-full px-3 py-1.5 bg-white border border-emerald-400 rounded-lg text-xs font-mono font-bold uppercase outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              )}
            </div>
          </div>

          {/* Vehicle Description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Vehicle Description
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. BMW X5 xDrive45e M Sport, Phytonic Blue"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition-all"
            />
          </div>

          {/* Grid Section 2: Plate, VIN, Reg Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Registration / Plate <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={e => setRegistrationNumber(e.target.value.toUpperCase())}
                placeholder="e.g. K 15638"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 tracking-wider focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition-all uppercase"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  VIN (17 Chars) <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    vin.length === 17 ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {vin.length}/17
                </span>
              </div>
              <input
                type="text"
                value={vin}
                maxLength={17}
                onChange={e => setVin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="17-character VIN"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 tracking-wider focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition-all uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Registration Date
              </label>
              <input
                type="date"
                value={registrationDate}
                onChange={e => setRegistrationDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Grid Section 3: Mileage, Fuel, Engine */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Odometer Reading
              </label>
              <input
                type="number"
                value={odometer}
                onChange={e => setOdometer(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Odometer Unit
              </label>
              <select
                value={odometerType}
                onChange={e => setOdometerType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition-all cursor-pointer"
              >
                {ODOMETER_TYPES.map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Fuel Type
              </label>
              <select
                value={fuelType}
                onChange={e => setFuelType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition-all cursor-pointer"
              >
                {FUEL_TYPES.map(fuel => (
                  <option key={fuel} value={fuel}>
                    {fuel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Engine Number
              </label>
              <input
                type="text"
                value={engineNumber}
                onChange={e => setEngineNumber(e.target.value)}
                placeholder="e.g. B58B30M..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin text-xs" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FaPlusCircle className="text-xs" />
                  <span>Link Vehicle to Customer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
