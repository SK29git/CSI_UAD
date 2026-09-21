import React, { useState } from 'react';

export default function ServiceSubHeader() {
  const [activeSubTab, setActiveSubTab] = useState('Book Service');

  const subTabs = [
    'Overview',
    'Book Service',
    'Pick-up & Drop-off',
    'Loan Car',
    'Estimate Approval',
    'Confirmation'
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-2 shadow-2xs mb-4">
      <div className="max-w-[1600px] mx-auto flex items-center justify-center gap-6 overflow-x-auto text-xs font-medium no-scrollbar">
        {subTabs.map((tab) => {
          const isActive = activeSubTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`pb-1.5 relative transition-colors whitespace-nowrap ${
                isActive ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
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
