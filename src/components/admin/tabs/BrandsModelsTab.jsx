import React, { useState } from 'react';
import {
  FaCar,
  FaPlus,
  FaTrashAlt,
  FaEdit,
  FaCheck,
  FaTimes,
  FaBuilding,
  FaLayerGroup
} from 'react-icons/fa';

export default function BrandsModelsTab({ brands, onUpdateBrands }) {
  const [selectedBrandId, setSelectedBrandId] = useState(brands[0]?.id || 'BMW');
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newModelName, setNewModelName] = useState('');

  const currentBrand = brands.find(b => b.id === selectedBrandId) || brands[0];

  const handleAddBrand = (e) => {
    e.preventDefault();
    const clean = newBrandName.trim();
    if (!clean) return;

    if (brands.some(b => b.id.toUpperCase() === clean.toUpperCase())) {
      alert('This brand already exists.');
      return;
    }

    const nextBrands = [
      ...brands,
      {
        id: clean,
        label: clean,
        models: ['Standard']
      }
    ];

    onUpdateBrands(nextBrands);
    setSelectedBrandId(clean);
    setNewBrandName('');
    setIsAddBrandOpen(false);
  };

  const handleDeleteBrand = (brandId) => {
    if (brands.length <= 1) {
      alert('At least one brand must remain.');
      return;
    }
    if (window.confirm(`Delete brand "${brandId}" and its models?`)) {
      const next = brands.filter(b => b.id !== brandId);
      onUpdateBrands(next);
      if (selectedBrandId === brandId) {
        setSelectedBrandId(next[0]?.id || '');
      }
    }
  };

  const handleAddModel = (e) => {
    e.preventDefault();
    const clean = newModelName.trim();
    if (!clean || !currentBrand) return;

    const existingModels = currentBrand.models || [];
    if (existingModels.includes(clean)) {
      alert('This model already exists for ' + currentBrand.label);
      return;
    }

    const updatedBrand = {
      ...currentBrand,
      models: [...existingModels, clean]
    };

    const nextBrands = brands.map(b => b.id === currentBrand.id ? updatedBrand : b);
    onUpdateBrands(nextBrands);
    setNewModelName('');
  };

  const handleDeleteModel = (modelName) => {
    if (!currentBrand) return;
    const existingModels = currentBrand.models || [];
    if (existingModels.length <= 1) {
      alert('A brand must have at least one model.');
      return;
    }

    const updatedBrand = {
      ...currentBrand,
      models: existingModels.filter(m => m !== modelName)
    };

    const nextBrands = brands.map(b => b.id === currentBrand.id ? updatedBrand : b);
    onUpdateBrands(nextBrands);
  };

  return (
    <div className="space-y-4">
      {/* Brands Selector Grid */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaBuilding className="text-slate-500 text-sm" />
            <h3 className="font-bold text-slate-800 text-sm">Vehicle Brand Manufacturers</h3>
          </div>
          <button
            onClick={() => setIsAddBrandOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <FaPlus className="text-[10px]" />
            <span>Add Brand</span>
          </button>
        </div>

        {/* Brands Horizontal Badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          {brands.map((b) => {
            const isSelected = b.id === selectedBrandId;
            return (
              <div
                key={b.id}
                onClick={() => setSelectedBrandId(b.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs ring-2 ring-indigo-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <FaCar className={isSelected ? 'text-indigo-600' : 'text-slate-400'} />
                <span>{b.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isSelected ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {b.models?.length || 0}
                </span>
                {brands.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBrand(b.id);
                    }}
                    className="ml-1 text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                    title={`Delete brand ${b.label}`}
                  >
                    <FaTimes className="text-[9px]" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Models Manager for Selected Brand */}
      {currentBrand && (
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <span>{currentBrand.label} Models</span>
                <span className="text-xs font-semibold text-slate-500">
                  ({currentBrand.models?.length || 0} registered models)
                </span>
              </h4>
              <p className="text-xs text-slate-500">
                These models appear in the "Add New Vehicle" modal when {currentBrand.label} is selected.
              </p>
            </div>

            {/* Add Model Form */}
            <form onSubmit={handleAddModel} className="flex items-center gap-2 text-xs">
              <input
                type="text"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder={`New ${currentBrand.label} model name...`}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
              >
                <FaPlus className="text-[10px]" />
                <span>Add Model</span>
              </button>
            </form>
          </div>

          {/* Models Chips Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-[400px] overflow-y-auto p-1">
            {currentBrand.models?.map((model) => (
              <div
                key={model}
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-800 transition-all group"
              >
                <span className="truncate mr-2">{model}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteModel(model)}
                  className="text-slate-300 group-hover:text-rose-500 hover:bg-rose-50 p-1 rounded transition-colors"
                  title="Delete model"
                >
                  <FaTrashAlt className="text-[10px]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Brand Modal */}
      {isAddBrandOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Add New Manufacturer Brand</h3>
              <button onClick={() => setIsAddBrandOpen(false)} className="text-slate-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddBrand} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="e.g. Lucid, BYD, Porsche"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBrandOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
