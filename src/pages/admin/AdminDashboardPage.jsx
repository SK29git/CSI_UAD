import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrchestrator } from '../../context/OrchestratorContext';
import AdminHeader from '../../components/admin/AdminHeader';
import PublishConfirmModal from '../../components/admin/PublishConfirmModal';
import UsersManagerTab from '../../components/admin/tabs/UsersManagerTab';
import BrandsModelsTab from '../../components/admin/tabs/BrandsModelsTab';
import ComplaintTaxonomyTab from '../../components/admin/tabs/ComplaintTaxonomyTab';
import NavigationTabsTab from '../../components/admin/tabs/NavigationTabsTab';
import ThemeCustomizerTab from '../../components/admin/tabs/ThemeCustomizerTab';
import {
  FaUsers,
  FaCar,
  FaTags,
  FaLayerGroup,
  FaPalette,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    activeAdmin,
    logoutAdmin,
    config,
    updateConfig,
    publishToGit,
    hasUnsavedChanges,
    isSyncing
  } = useOrchestrator();

  const [activeTab, setActiveTab] = useState('users');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Protected route check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateUsers = (newUsers) => {
    updateConfig({ users: newUsers });
    showToast(`Updated staff list (${newUsers.length} total users)`);
  };

  const handleUpdateBrands = (newBrands) => {
    updateConfig({ brands: newBrands });
    showToast(`Updated vehicle brands catalog (${newBrands.length} brands)`);
  };

  const handleUpdateTaxonomy = (newTaxonomy) => {
    updateConfig({ complaintTaxonomy: newTaxonomy });
    showToast('Updated complaint taxonomy & categories');
  };

  const handleUpdateTabs = (newTabs) => {
    updateConfig({ tabs: newTabs });
    showToast('Updated application navigation modules & sub-tabs');
  };

  const handleUpdateTheme = (newTheme) => {
    updateConfig({ theme: newTheme });
    showToast(`Applied theme preset: ${newTheme.preset}`);
  };

  const tabsList = [
    { id: 'users', label: 'Departments & Staff', icon: FaUsers, count: config.users?.length },
    { id: 'brands', label: 'Brands & Models', icon: FaCar, count: config.brands?.length },
    { id: 'taxonomy', label: 'Complaint Taxonomy', icon: FaTags },
    { id: 'navigation', label: 'Navigation & Tabs', icon: FaLayerGroup, count: config.tabs?.length },
    { id: 'theme', label: 'Theme & Background', icon: FaPalette }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      
      {/* Admin Top Header */}
      <AdminHeader
        activeAdmin={activeAdmin}
        onLogout={() => {
          logoutAdmin();
          navigate('/admin/login');
        }}
        onOpenPublish={() => setIsPublishModalOpen(true)}
        hasUnsavedChanges={hasUnsavedChanges}
        isSyncing={isSyncing}
      />

      {/* Main Container */}
      <main className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col space-y-4">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-sm animate-fadeIn ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <FaCheckCircle className="text-emerald-600" />
            ) : (
              <FaExclamationTriangle className="text-rose-600" />
            )}
            <span>{toastMessage.message}</span>
          </div>
        )}

        {/* Tab Navigation Pill Bar */}
        <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
          {tabsList.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1">
          {activeTab === 'users' && (
            <UsersManagerTab
              users={config.users || []}
              onUpdateUsers={handleUpdateUsers}
              complaintDepartments={config.complaintTaxonomy?.departments || []}
            />
          )}

          {activeTab === 'brands' && (
            <BrandsModelsTab
              brands={config.brands || []}
              onUpdateBrands={handleUpdateBrands}
            />
          )}

          {activeTab === 'taxonomy' && (
            <ComplaintTaxonomyTab
              complaintTaxonomy={config.complaintTaxonomy || {}}
              onUpdateTaxonomy={handleUpdateTaxonomy}
            />
          )}

          {activeTab === 'navigation' && (
            <NavigationTabsTab
              tabs={config.tabs || []}
              onUpdateTabs={handleUpdateTabs}
            />
          )}

          {activeTab === 'theme' && (
            <ThemeCustomizerTab
              theme={config.theme || {}}
              onUpdateTheme={handleUpdateTheme}
            />
          )}
        </div>
      </main>

      {/* Publish Confirmation Modal */}
      <PublishConfirmModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        activeAdmin={activeAdmin}
        onConfirmPublish={publishToGit}
        isPublishing={isSyncing}
        hasUnsavedChanges={hasUnsavedChanges}
      />
    </div>
  );
}
