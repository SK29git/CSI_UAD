import React, { useState } from 'react';
import {
  FaFolderOpen,
  FaPlus,
  FaTrashAlt,
  FaChevronRight,
  FaChevronDown,
  FaListUl,
  FaTags,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

export default function ComplaintTaxonomyTab({ complaintTaxonomy, onUpdateTaxonomy }) {
  const departments = complaintTaxonomy.departments || [];
  const hierarchy = complaintTaxonomy.hierarchy || {};
  const sources = complaintTaxonomy.sources || [];
  const priorities = complaintTaxonomy.priorities || [];

  const [selectedDept, setSelectedDept] = useState(departments[0] || 'Service');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [newDeptInput, setNewDeptInput] = useState('');
  const [newGroupInput, setNewGroupInput] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newSourceInput, setNewSourceInput] = useState('');

  const currentGroups = selectedDept && hierarchy[selectedDept] ? Object.keys(hierarchy[selectedDept]) : [];
  const activeGroup = selectedGroup && currentGroups.includes(selectedGroup) ? selectedGroup : currentGroups[0] || '';
  const currentCategories = activeGroup && hierarchy[selectedDept]?.[activeGroup] ? hierarchy[selectedDept][activeGroup] : [];

  // Add Department
  const handleAddDept = (e) => {
    e.preventDefault();
    const clean = newDeptInput.trim();
    if (!clean || departments.includes(clean)) return;

    const nextDepts = [...departments, clean];
    const nextHierarchy = {
      ...hierarchy,
      [clean]: {
        'General': ['General Enquiry', 'Other']
      }
    };

    onUpdateTaxonomy({
      ...complaintTaxonomy,
      departments: nextDepts,
      hierarchy: nextHierarchy
    });
    setSelectedDept(clean);
    setNewDeptInput('');
  };

  // Add Group to Department
  const handleAddGroup = (e) => {
    e.preventDefault();
    const clean = newGroupInput.trim();
    if (!clean || !selectedDept) return;

    const deptHierarchy = hierarchy[selectedDept] || {};
    if (deptHierarchy[clean]) return;

    const nextHierarchy = {
      ...hierarchy,
      [selectedDept]: {
        ...deptHierarchy,
        [clean]: ['Standard Issue']
      }
    };

    onUpdateTaxonomy({
      ...complaintTaxonomy,
      hierarchy: nextHierarchy
    });
    setSelectedGroup(clean);
    setNewGroupInput('');
  };

  // Add Category to Group
  const handleAddCategory = (e) => {
    e.preventDefault();
    const clean = newCategoryInput.trim();
    if (!clean || !selectedDept || !activeGroup) return;

    const existing = hierarchy[selectedDept]?.[activeGroup] || [];
    if (existing.includes(clean)) return;

    const nextHierarchy = {
      ...hierarchy,
      [selectedDept]: {
        ...hierarchy[selectedDept],
        [activeGroup]: [clean, ...existing]
      }
    };

    onUpdateTaxonomy({
      ...complaintTaxonomy,
      hierarchy: nextHierarchy
    });
    setNewCategoryInput('');
  };

  // Delete Category
  const handleDeleteCategory = (catName) => {
    if (!selectedDept || !activeGroup) return;
    const existing = hierarchy[selectedDept]?.[activeGroup] || [];
    const nextHierarchy = {
      ...hierarchy,
      [selectedDept]: {
        ...hierarchy[selectedDept],
        [activeGroup]: existing.filter(c => c !== catName)
      }
    };

    onUpdateTaxonomy({
      ...complaintTaxonomy,
      hierarchy: nextHierarchy
    });
  };

  // Add Source
  const handleAddSource = (e) => {
    e.preventDefault();
    const clean = newSourceInput.trim();
    if (!clean || sources.includes(clean)) return;

    onUpdateTaxonomy({
      ...complaintTaxonomy,
      sources: [...sources, clean]
    });
    setNewSourceInput('');
  };

  const handleDeleteSource = (source) => {
    if (sources.length <= 1) return;
    onUpdateTaxonomy({
      ...complaintTaxonomy,
      sources: sources.filter(s => s !== source)
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* COLUMN 1: Departments */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col h-[560px]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <FaTags className="text-indigo-600" />
            1. Departments ({departments.length})
          </h3>
        </div>

        {/* Add Dept */}
        <form onSubmit={handleAddDept} className="flex gap-1.5 py-3 border-b border-slate-100">
          <input
            type="text"
            value={newDeptInput}
            onChange={(e) => setNewDeptInput(e.target.value)}
            placeholder="New department name..."
            className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
          />
          <button
            type="submit"
            className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700"
          >
            <FaPlus className="text-[10px]" />
          </button>
        </form>

        {/* Depts List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 py-2">
          {departments.map((dept) => {
            const isSelected = dept === selectedDept;
            return (
              <div
                key={dept}
                onClick={() => {
                  setSelectedDept(dept);
                  setSelectedGroup('');
                }}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>{dept}</span>
                <FaChevronRight className={`text-[10px] ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* COLUMN 2: Complaint Groups */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col h-[560px]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <FaListUl className="text-emerald-600" />
            2. Groups under {selectedDept} ({currentGroups.length})
          </h3>
        </div>

        {/* Add Group */}
        <form onSubmit={handleAddGroup} className="flex gap-1.5 py-3 border-b border-slate-100">
          <input
            type="text"
            value={newGroupInput}
            onChange={(e) => setNewGroupInput(e.target.value)}
            placeholder="New group (e.g. Process, Technical)..."
            className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
          />
          <button
            type="submit"
            className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700"
          >
            <FaPlus className="text-[10px]" />
          </button>
        </form>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 py-2">
          {currentGroups.map((group) => {
            const isSelected = group === activeGroup;
            return (
              <div
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>{group}</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full">
                  {hierarchy[selectedDept]?.[group]?.length || 0}
                </span>
              </div>
            );
          })}
          {currentGroups.length === 0 && (
            <div className="py-6 text-center text-slate-400 text-xs">No groups defined.</div>
          )}
        </div>
      </div>

      {/* COLUMN 3: Categories & Sources */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col h-[560px]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <FaTags className="text-amber-600" />
            3. Categories under "{activeGroup || 'None'}"
          </h3>
        </div>

        {/* Add Category */}
        <form onSubmit={handleAddCategory} className="flex gap-1.5 py-3 border-b border-slate-100">
          <input
            type="text"
            value={newCategoryInput}
            onChange={(e) => setNewCategoryInput(e.target.value)}
            disabled={!activeGroup}
            placeholder="New complaint category name..."
            className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={!activeGroup}
            className="px-2.5 py-1.5 bg-amber-600 text-white rounded-lg font-bold text-xs hover:bg-amber-700 disabled:opacity-50"
          >
            <FaPlus className="text-[10px]" />
          </button>
        </form>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 py-2">
          {currentCategories.map((cat) => (
            <div
              key={cat}
              className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium text-slate-800 group"
            >
              <span className="truncate mr-2">{cat}</span>
              <button
                type="button"
                onClick={() => handleDeleteCategory(cat)}
                className="text-slate-300 group-hover:text-rose-500 hover:bg-rose-50 p-1 rounded transition-colors"
                title="Delete category"
              >
                <FaTrashAlt className="text-[10px]" />
              </button>
            </div>
          ))}
          {currentCategories.length === 0 && (
            <div className="py-6 text-center text-slate-400 text-xs">No categories in this group.</div>
          )}
        </div>

        {/* Sources Footer */}
        <div className="pt-3 border-t border-slate-100">
          <span className="font-bold text-slate-700 text-[11px] block mb-1">
            Active Sources ({sources.length}):
          </span>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
            {sources.map((s) => (
              <span
                key={s}
                className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1"
              >
                {s}
                <FaTimes
                  onClick={() => handleDeleteSource(s)}
                  className="cursor-pointer text-slate-400 hover:text-rose-500 text-[8px]"
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
