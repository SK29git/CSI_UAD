import React, { useState } from 'react';
import {
  FaFolder,
  FaFolderOpen,
  FaEye,
  FaEyeSlash,
  FaPlus,
  FaTrashAlt,
  FaTimes,
  FaCheck,
  FaLayerGroup,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';

export default function NavigationTabsTab({ tabs, onUpdateTabs }) {
  const [selectedTabId, setSelectedTabId] = useState(tabs[0]?.id || 'home');
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isAddSubTabModalOpen, setIsAddSubTabModalOpen] = useState(false);
  const [newTabTitle, setNewTabTitle] = useState('');
  const [newTabPath, setNewTabPath] = useState('');
  const [newSubTabTitle, setNewSubTabTitle] = useState('');
  const [feedback, setFeedback] = useState(null);

  const currentTab = tabs.find((t) => t.id === selectedTabId) || tabs[0];

  const showNotification = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const toggleTabVisibility = (tabId) => {
    const nextTabs = tabs.map((t) => {
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

    if (tabs.some((t) => t.id === tabId || t.path === path)) {
      alert('A module with this name or path already exists.');
      return;
    }

    const nextTabs = [
      ...tabs,
      {
        id: tabId,
        label: title,
        path: path,
        visible: true,
        subTabs: [{ id: 'Overview', label: 'Overview', visible: true }]
      }
    ];

    onUpdateTabs(nextTabs);
    setSelectedTabId(tabId);
    setNewTabTitle('');
    setNewTabPath('');
    setIsAddModuleOpen(false);
    showNotification(`Module "${title}" created successfully!`);
  };

  const handleDeleteTab = (tabId, label) => {
    if (tabs.length <= 1) {
      alert('At least one module tab must remain.');
      return;
    }
    if (window.confirm(`Delete module tab "${label || tabId}"?`)) {
      const nextTabs = tabs.filter((t) => t.id !== tabId);
      onUpdateTabs(nextTabs);
      if (selectedTabId === tabId) {
        setSelectedTabId(nextTabs[0]?.id || '');
      }
      showNotification(`Deleted module tab "${label || tabId}".`);
    }
  };

  // Subtabs management
  const handleAddSubTab = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const subTitle = newSubTabTitle.trim();
    if (!subTitle) {
      // If user clicked the button with empty input, open the modal instead of failing silently!
      setIsAddSubTabModalOpen(true);
      return;
    }
    if (!currentTab) return;

    const existing = currentTab.subTabs || [];
    if (existing.some((s) => s.label.toLowerCase() === subTitle.toLowerCase())) {
      showNotification(`Sub-tab "${subTitle}" already exists in ${currentTab.label}.`, 'error');
      return;
    }

    const updatedTab = {
      ...currentTab,
      subTabs: [...existing, { id: subTitle, label: subTitle, visible: true }]
    };

    const nextTabs = tabs.map((t) => (t.id === currentTab.id ? updatedTab : t));
    onUpdateTabs(nextTabs);
    setNewSubTabTitle('');
    setIsAddSubTabModalOpen(false);
    showNotification(`Added sub-tab "${subTitle}" to ${currentTab.label}!`);
  };

  const toggleSubTabVisibility = (subId) => {
    if (!currentTab) return;
    const updatedSubTabs = (currentTab.subTabs || []).map((s) => {
      if (s.id === subId) {
        return { ...s, visible: !s.visible };
      }
      return s;
    });

    const updatedTab = { ...currentTab, subTabs: updatedSubTabs };
    const nextTabs = tabs.map((t) => (t.id === currentTab.id ? updatedTab : t));
    onUpdateTabs(nextTabs);
  };

  const handleDeleteSubTab = (subId, subLabel) => {
    if (!currentTab) return;
    const existing = currentTab.subTabs || [];
    const updatedTab = {
      ...currentTab,
      subTabs: existing.filter((s) => s.id !== subId)
    };

    const nextTabs = tabs.map((t) => (t.id === currentTab.id ? updatedTab : t));
    onUpdateTabs(nextTabs);
    showNotification(`Removed sub-tab "${subLabel || subId}".`);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-xs animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <FaCheckCircle className="text-emerald-600" />
          ) : (
            <FaExclamationCircle className="text-rose-600" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

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
                  <div className="flex items-center gap-2 truncate mr-1">
                    <FaFolder className={isSelected ? 'text-indigo-600' : 'text-slate-400'} />
                    <span className="font-bold text-slate-800 text-xs truncate">{tab.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTabVisibility(tab.id);
                      }}
                      className={`p-1 rounded-md text-xs transition-colors ${
                        tab.visible
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-slate-400 hover:bg-slate-200'
                      }`}
                      title={tab.visible ? 'Tab is Visible' : 'Tab is Hidden'}
                    >
                      {tab.visible ? <FaEye /> : <FaEyeSlash />}
                    </button>
                    {tabs.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTab(tab.id, tab.label);
                        }}
                        className="p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete module tab"
                      >
                        <FaTrashAlt className="text-[10px]" />
                      </button>
                    )}
                  </div>
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

            {/* Add Sub-tab Form */}
            <form onSubmit={handleAddSubTab} className="flex items-center gap-2 text-xs">
              <input
                type="text"
                value={newSubTabTitle}
                onChange={(e) => setNewSubTabTitle(e.target.value)}
                placeholder="New sub-tab title..."
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 w-48 sm:w-56"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm cursor-pointer whitespace-nowrap"
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
                  <span
                    className={`w-2 h-2 rounded-full ${
                      sub.visible !== false ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                  <span className="truncate">{sub.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleSubTabVisibility(sub.id)}
                    className={`p-1 rounded text-xs transition-colors ${
                      sub.visible !== false
                        ? 'text-emerald-600 hover:bg-emerald-50'
                        : 'text-slate-400 hover:bg-slate-200'
                    }`}
                    title={sub.visible !== false ? 'Sub-tab is Visible' : 'Sub-tab is Hidden'}
                  >
                    {sub.visible !== false ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubTab(sub.id, sub.label)}
                    className="text-slate-300 group-hover:text-rose-500 hover:bg-rose-50 p-1 rounded transition-colors"
                    title="Delete subtab"
                  >
                    <FaTrashAlt className="text-[10px]" />
                  </button>
                </div>
              </div>
            ))}

            {/* Empty State when no sub-tabs */}
            {(!currentTab.subTabs || currentTab.subTabs.length === 0) && (
              <div className="col-span-full py-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400">
                <FaLayerGroup className="text-2xl mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-xs text-slate-600">
                  No sub-tabs created for "{currentTab.label}" yet
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Type a title in the box above or click "+ Add Sub-Tab" to create one.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Sub-Tab Dedicated Modal */}
      {isAddSubTabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Add Sub-Tab to "{currentTab?.label}"</h3>
              <button
                onClick={() => setIsAddSubTabModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddSubTab} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Sub-Tab Title *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newSubTabTitle}
                  onChange={(e) => setNewSubTabTitle(e.target.value)}
                  placeholder="e.g. Dashboard, Details, Activity"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              {/* Quick suggestion pills */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Quick Suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Overview', 'Dashboard', 'Analytics', 'Reports', 'Settings', 'Create New'].map(
                    (sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setNewSubTabTitle(sug)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-semibold text-slate-700"
                      >
                        {sug}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSubTabModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Create Sub-Tab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Module Modal */}
      {isAddModuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Add New Navigation Module</h3>
              <button
                onClick={() => setIsAddModuleOpen(false)}
                className="text-slate-400 hover:text-white"
              >
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
                      setNewTabPath(
                        '/' + e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-')
                      );
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
