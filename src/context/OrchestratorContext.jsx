import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import defaultConfig from '../data/orchestratorConfig.json';

const OrchestratorContext = createContext(null);

const ADMIN_ACCOUNTS = {
  SAdmin: 'admin',
  MAdmin: 'admin'
};

const STORAGE_KEY_CONFIG = 'orchestrator_active_config';
const STORAGE_KEY_ADMIN = 'orchestrator_active_admin';

export function OrchestratorProvider({ children }) {
  // ─── 1. Admin Authentication State ──────────────────────────────────────────
  const [activeAdmin, setActiveAdmin] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY_ADMIN) || null;
    } catch {
      return null;
    }
  });

  const loginAdmin = useCallback((username, password) => {
    const cleanUser = String(username || '').trim();
    const cleanPass = String(password || '').trim();

    if (ADMIN_ACCOUNTS[cleanUser] && ADMIN_ACCOUNTS[cleanUser] === cleanPass) {
      setActiveAdmin(cleanUser);
      try {
        sessionStorage.setItem(STORAGE_KEY_ADMIN, cleanUser);
      } catch (e) {
        console.warn('Could not persist admin session', e);
      }
      return { success: true, user: cleanUser };
    }
    return { success: false, error: 'Invalid username or password. Allowed: SAdmin or MAdmin.' };
  }, []);

  const logoutAdmin = useCallback(() => {
    setActiveAdmin(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY_ADMIN);
    } catch (e) {
      console.warn('Could not clear admin session', e);
    }
  }, []);

  // ─── 2. Configuration State ────────────────────────────────────────────────
  const [config, setConfig] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.tabs)) {
          parsed.tabs = parsed.tabs.filter((t) => t.id !== 'tracker' && t.label !== 'IMEI Tracker');
        }
        return { ...defaultConfig, ...parsed };
      }
    } catch (err) {
      console.warn('Error reading cached orchestrator config:', err);
    }
    return defaultConfig;
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  // Fetch latest config from server on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchServerConfig() {
      try {
        const res = await fetch('/orchestrator-api/config');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && typeof data === 'object') {
            setConfig((prev) => {
              // Preserve any existing local edits in localStorage
              const cached = localStorage.getItem(STORAGE_KEY_CONFIG);
              if (cached) {
                try {
                  const parsed = JSON.parse(cached);
                  if (Array.isArray(parsed.tabs)) {
                    parsed.tabs = parsed.tabs.filter(
                      (t) => t.id !== 'tracker' && t.label !== 'IMEI Tracker'
                    );
                  }
                  return { ...defaultConfig, ...data, ...parsed };
                } catch {}
              }
              return { ...defaultConfig, ...data };
            });
          }
        }
      } catch (err) {
        console.debug('Orchestrator server not reachable, using cached/default config.');
      }
    }
    fetchServerConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update theme on document root & body whenever theme changes
  useEffect(() => {
    if (config?.theme?.backgroundColor) {
      document.documentElement.style.setProperty('--app-bg', config.theme.backgroundColor);
      document.body.style.backgroundColor = config.theme.backgroundColor;
    }
  }, [config?.theme?.backgroundColor]);

  // Update config in local state AND auto-persist to server disk
  const updateConfig = useCallback((updater) => {
    setConfig(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      try {
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to cache config in localStorage', e);
      }

      // Auto-save to disk in background so changes persist across refreshes
      fetch('/orchestrator-api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: next,
          adminUser: activeAdmin || 'Admin'
        })
      }).catch(err => {
        console.warn('[Orchestrator] Auto-save error (offline fallback active):', err.message);
      });

      return next;
    });
    setHasUnsavedChanges(true);
  }, [activeAdmin]);

  // Save config draft locally & to disk
  const saveConfig = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/orchestrator-api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          adminUser: activeAdmin || 'Admin'
        })
      });
      if (res.ok) {
        setHasUnsavedChanges(false);
        return { success: true };
      }
      return { success: false, error: 'Failed to save config to server' };
    } catch (err) {
      console.warn('Save config error:', err);
      // Still preserved in localStorage
      return { success: true, localOnly: true };
    } finally {
      setIsSyncing(false);
    }
  }, [config, activeAdmin]);

  // Publish to Git Origin
  const publishToGit = useCallback(async ({ commitMessage }) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/orchestrator-api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          commitMessage,
          adminUser: activeAdmin || 'SAdmin'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHasUnsavedChanges(false);
        setLastSyncResult(data);
        return { success: true, data };
      }
      return {
        success: false,
        error: data?.error || 'Publish failed. Check git credentials and remote connectivity.'
      };
    } catch (err) {
      console.error('Publish API exception:', err);
      return { success: false, error: err.message || 'Network error while publishing' };
    } finally {
      setIsSyncing(false);
    }
  }, [config, activeAdmin]);

  // ─── 3. Application Data Selectors ──────────────────────────────────────────
  const users = useMemo(() => config.users || [], [config.users]);

  const getUsersByDepartment = useCallback((deptName) => {
    if (!deptName) return users;
    const target = String(deptName).toLowerCase().trim();
    return users.filter(u => {
      const dType = (u.departmentType || '').toLowerCase();
      const dDesc = (u.departmentDescription || '').toLowerCase();
      if (target === 'service') {
        return dType.includes('serv') || dDesc.includes('serv') || dDesc.includes('workshop');
      }
      if (target === 'sales') {
        return dType.includes('sale') || dDesc.includes('sale') || dDesc.includes('showroom');
      }
      if (target === 'parts') {
        return dType.includes('part') || dDesc.includes('part');
      }
      if (target === 'business development centre' || target === 'bdc') {
        return dType.includes('bdc') || dDesc.includes('bdc') || dDesc.includes('business dev');
      }
      if (target === 'accounts' || target === 'finance') {
        return dType.includes('account') || dDesc.includes('account') || dDesc.includes('finance');
      }
      if (target === 'balance sheet') {
        return dType.includes('balance') || dDesc.includes('balance') || dDesc.includes('sheet');
      }
      return dType.includes(target) || dDesc.includes(target);
    });
  }, [users]);

  const brands = useMemo(() => config.brands || [], [config.brands]);

  const getModelsForBrand = useCallback((brandId) => {
    if (!brandId) return [];
    const b = brands.find(
      item => String(item.id).toUpperCase() === String(brandId).toUpperCase() ||
              String(item.label).toUpperCase() === String(brandId).toUpperCase()
    );
    return b ? b.models || [] : [];
  }, [brands]);

  const complaintTaxonomy = useMemo(() => config.complaintTaxonomy || {}, [config.complaintTaxonomy]);
  const complaintDepartments = useMemo(() => complaintTaxonomy.departments || [], [complaintTaxonomy.departments]);
  const complaintSources = useMemo(() => complaintTaxonomy.sources || [], [complaintTaxonomy.sources]);
  const complaintPriorities = useMemo(() => complaintTaxonomy.priorities || [], [complaintTaxonomy.priorities]);
  const complaintBranches = useMemo(() => complaintTaxonomy.branches || [], [complaintTaxonomy.branches]);
  const complaintHierarchy = useMemo(() => complaintTaxonomy.hierarchy || {}, [complaintTaxonomy.hierarchy]);

  const getGroupsForDepartment = useCallback((dept) => {
    if (!dept || !complaintHierarchy[dept]) return [];
    return Object.keys(complaintHierarchy[dept]);
  }, [complaintHierarchy]);

  const getCategoriesForDepartmentAndGroup = useCallback((dept, group) => {
    if (!dept || !group || !complaintHierarchy[dept] || !complaintHierarchy[dept][group]) {
      return [];
    }
    return complaintHierarchy[dept][group] || [];
  }, [complaintHierarchy]);

  const tabs = useMemo(() => config.tabs || [], [config.tabs]);
  const theme = useMemo(() => config.theme || {}, [config.theme]);

  const value = {
    // Auth
    activeAdmin,
    loginAdmin,
    logoutAdmin,
    isAuthenticated: Boolean(activeAdmin),

    // State & Sync
    config,
    updateConfig,
    saveConfig,
    publishToGit,
    hasUnsavedChanges,
    isSyncing,
    lastSyncResult,

    // Data Selectors
    users,
    getUsersByDepartment,
    brands,
    getModelsForBrand,
    complaintDepartments,
    complaintSources,
    complaintPriorities,
    complaintBranches,
    complaintHierarchy,
    getGroupsForDepartment,
    getCategoriesForDepartmentAndGroup,
    tabs,
    theme
  };

  return (
    <OrchestratorContext.Provider value={value}>
      {children}
    </OrchestratorContext.Provider>
  );
}

export function useOrchestrator() {
  const ctx = useContext(OrchestratorContext);
  if (!ctx) {
    throw new Error('useOrchestrator must be used within an OrchestratorProvider');
  }
  return ctx;
}
