import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSlidersH,
  FaCloudUploadAlt,
  FaUserShield,
  FaSignOutAlt,
  FaExternalLinkAlt,
  FaCodeBranch,
  FaCircle
} from 'react-icons/fa';

export default function AdminHeader({
  activeAdmin,
  onLogout,
  onOpenPublish,
  hasUnsavedChanges,
  isSyncing
}) {
  const navigate = useNavigate();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 p-0.5 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <FaSlidersH className="text-emerald-400 text-base" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                AGMC Orchestrator Portal
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                <FaCodeBranch className="text-[9px]" />
                OrchestrationPortal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Live Mock Data, Taxonomy & Dynamic Navigation Orchestrator
            </p>
          </div>
        </div>

        {/* Right Actions & Admin Profile */}
        <div className="flex items-center gap-3">
          
          {/* Publish Button */}
          <button
            onClick={onOpenPublish}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 ring-2 ring-emerald-400/30 animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'
            }`}
          >
            <FaCloudUploadAlt className="text-sm" />
            <span>Publish to Git</span>
            {hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-amber-300 ring-2 ring-emerald-600" title="Unpublished changes ready" />
            )}
          </button>

          <div className="h-5 w-px bg-slate-700 mx-0.5" />

          {/* Active Admin Profile */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs">
            <div className="w-6 h-6 rounded-md bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-[10px]">
              <FaUserShield />
            </div>
            <div className="text-left">
              <span className="font-bold text-white text-xs block leading-none">{activeAdmin}</span>
              <span className="text-[9px] text-emerald-400 font-medium flex items-center gap-1">
                <FaCircle className="text-[5px] text-emerald-400" /> Authorized
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Sign out of Orchestrator"
          >
            <FaSignOutAlt className="text-sm" />
          </button>
        </div>
      </div>
    </header>
  );
}
