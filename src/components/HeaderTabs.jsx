import React from 'react';

export default function HeaderTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'Overview', label: 'Overview' },
    { id: 'Open Complaints', label: 'Open Complaints', count: 8 },
    { id: 'Escalations', label: 'Escalations', count: 3 },
    { id: 'SLA Breaches', label: 'SLA Breaches', count: 2 },
    { id: 'Root Cause', label: 'Root Cause' },
    { id: 'Recovery Actions', label: 'Recovery Actions' },
    { id: 'Reports', label: 'Reports' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 pt-3 pb-0 mb-4 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-6 text-sm font-medium border-b border-gray-100 min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 relative flex items-center gap-1.5 transition-colors ${
                isActive ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-md"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
