import React, { useState } from 'react';
import {
  FaFolder,
  FaFolderOpen,
  FaEye,
  FaEyeSlash,
  FaPlus,
  FaTrashAlt,
  FaEdit,
  FaCheck,
  FaTimes,
  FaLayerGroup,
  FaExternalLinkAlt
} from 'react-icons/fa';

export default function NavigationTabsTab({ tabs, onUpdateTabs }) {
  const [selectedTabId, setSelectedTabId] = useState(tabs[0]?.id || 'complaints');
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [newTabTitle, setNewTabTitle] = useState('');
  const [newTabPath, setNewTabPath] = useState('');
  const [newSubTabTitle, setNewSubTabTitle] = useState('');

  const currentTab = tabs.find(t => t.id === selectedTabId) || tabs[0];

  const toggleTabVisibility = (tabId) => {
    const nextTabs = tabs.map(t => {
      if (t.id === tabId) {
        return { ...t, visible: !t.visible };
      }
      return t;
    });
    onUpdateTabs(nextTabs);
  };

  const handleAddModule = (e) => {
    e.preventDefault();
    const title = newTabTitle.trim();
    let path = newTabPath.trim();
    if (!title) return;

    if (!path.startsWith('/')) path = '/' + path;
    const tabId = title.toLowerCase().replace(/[^a-z0-9]/g, '-');

    if (tabs.some(t => t.id === tabId || t.path === path)) {
      alert('A tab with this name or path already exists.');
      return;
    }

    const nextTabs = [
      ...tabs,
      {
        id: tabId,
        label: title,
        path: path,
        visible: true,
        subTabs: [
          { id: 'Overview', label: 'Overview', visible: true }
        ]
      }
    ];

    onUpdateTabs(nextTabs);
    setSelectedTabId(tabId);
    setNewTabTitle('');
    setNewTabPath('');
    setIsAddModuleOpen(false);
  };

  const handleDeleteTab = (tabId) => {
    if (tabs.length <= 1) {
      alert('At least one tab must remain.');
      return;
    }
    if (window.confirm(`Delete module tab "${tabId}"?`)) {
      const nextTabs = tabs.filter(t => t.id !== tabId);
      onUpdateTabs(nextTabs);
      if (selectedTabId === tabId) {
        setSelectedTabId(nextTabs[0]?.id || '');
      }
    }
  };

  // Subtabs management
  const handleAddSubTab = (e) => {
    e.preventDefault();
    const subTitle = newSubTabTitle.trim();
    if (!subTitle || !currentTab) return;

    const existing = currentTab.subTabs || [];
    if (existing.some(s => s.label.toLowerCase() === subTitle.toLowerCase())) {
      alert('Subtab already exists.');
      return;
    }

    const updatedTab = {
      ...currentTab,
      subTabs: [
        ...existing,
        { id: subTitle, label: subTitle, visible: true }
      ]
    };

    const nextTabs = tabs.map(t => t.id === currentTab.id ? updatedTab : t);
    onUpdateTabs(nextTabs);
    setNewSubTabTitle('');
  };

  const toggleSubTabVisibility = (subId) => {
    if (!currentTab) return;
    const updatedSubTabs = (currentTab.subTabs || []).map(s => {
      if (s.id === subId) {
        return { ...s, visible: !s.visible };
      }
      return s;
    });

    const updatedTab = { ...currentTab, subTabs: updatedSubTabs };
    const nextTabs = tabs.map(t => t.id === currentTab.id ? updatedTab : t);
    onUpdateTabs(nextTabs);
  };

  const handleDeleteSubTab = (subId) => {
    if (!currentTab) return;
    const existing = currentTab.subTabs || [];
    if (existing.length <= 1) {
      alert('A module must have at least one sub-tab.');
      return;
    }

    const updatedTab = {
      ...currentTab,
      subTabs: existing.filter(s => s.id !== subId)
    };

    const nextTabs = tabs.map(t => t.id === currentTab.id ? updatedTab : t);
    onUpdateTabs(nextTabs);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Module Tabs Grid */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Application Navigation Modules</h3>
            <p className="text-xs text-slate-500">
              Control which tabs and modules appear in the end-user navigation bar.
            </p>
          </div>
          <button
            onClick={() => setIsAddModuleOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <FaPlus className="text-[10px]" />
            <span>Add Module Tab</span>
          </button>
        </div>

        {/* Modules List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
          {tabs.map((tab) => {
            const isSelected = tab.id === selectedTabId;
            return (
              <div
                key={tab.id}
                onClick={() => setSelectedTabId(tab.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaFolder className={isSelected ? 'text-indigo-600' : 'text-slate-400'} />
                    <span className="font-bold text-slate-800 text-xs">{tab.label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTabVisibility(tab.id);
                    }}
                    className={`p-1 rounded-md text-xs transition-colors ${
                      tab.visible ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-200'
                    }`}
                    title={tab.visible ? 'Tab is Visible' : 'Tab is Hidden'}
                  >
                    {tab.visible ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
                  <span>{tab.path}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 rounded-full font-sans">
                    {tab.subTabs?.length || 0} sub-tabs
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtabs Configuration for Selected Module */}
      {currentTab && (
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <FaLayerGroup className="text-indigo-600 text-xs" />
                <span>Sub-Tabs for "{currentTab.label}"</span>
                <span className="text-xs font-semibold text-slate-500">
                  (Route: {currentTab.path})
                </span>
              </h4>
              <p className="text-xs text-slate-500">
                These sub-tabs appear inside the module when navigating to {currentTab.label}.
              </p>
            </div>

            {/* Add Sub-tab */}
            <form onSubmit={handleAddSubTab} className="flex items-center gap-2 text-xs">
              <input
                type="text"
                value={newSubTabTitle}
                onChange={(e) => setNewSubTabTitle(e.target.value)}
                placeholder="New sub-tab title..."
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
              >
                <FaPlus className="text-[10px]" />
                <span>Add Sub-Tab</span>
              </button>
            </form>
          </div>

          {/* Subtabs List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto p-1">
            {currentTab.subTabs?.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-800 transition-all group"
              >
                <div className="flex items-center gap-2 truncate mr-2">
                  <span className={`w-2 h-2 rounded-full ${sub.visible !== false ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className="truncate">{sub.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleSubTabVisibility(sub.id)}
                    className={`p-1 rounded text-xs transition-colors ${
                      sub.visible !== false ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-200'
                    }`}
                    title={sub.visible !== false ? 'Sub-tab is Visible' : 'Sub-tab is Hidden'}
                  >
                    {sub.visible !== false ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubTab(sub.id)}
                    className="text-slate-300 group-hover:text-rose-500 hover:bg-rose-50 p-1 rounded transition-colors"
                    title="Delete subtab"
                  >
                    <FaTrashAlt className="text-[10px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Module Modal */}
      {isAddModuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Add New Navigation Module</h3>
              <button onClick={() => setIsAddModuleOpen(false)} className="text-slate-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddModule} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Module Title *</label>
                <input
                  type="text"
                  required
                  value={newTabTitle}
                  onChange={(e) => {
                    setNewTabTitle(e.target.value);
                    if (!newTabPath) {
                      setNewTabPath('/' + e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  placeholder="e.g. Audit Logs, Analytics"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Route Path *</label>
                <input
                  type="text"
                  required
                  value={newTabPath}
                  onChange={(e) => setNewTabPath(e.target.value)}
                  placeholder="/custom-path"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-mono"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModuleOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Create Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
