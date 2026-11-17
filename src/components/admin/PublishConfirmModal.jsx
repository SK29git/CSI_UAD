import React, { useState } from 'react';
import {
  FaCloudUploadAlt,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaCodeBranch,
  FaUserCheck,
  FaCommentDots
} from 'react-icons/fa';

export default function PublishConfirmModal({
  isOpen,
  onClose,
  activeAdmin,
  onConfirmPublish,
  isPublishing,
  hasUnsavedChanges
}) {
  const defaultMessage = `Update mock data & orchestrator settings`;
  const [commitMessage, setCommitMessage] = useState(defaultMessage);
  const [publishResult, setPublishResult] = useState(null);
  const [publishError, setPublishError] = useState(null);

  if (!isOpen) return null;

  const handlePublish = async () => {
    setPublishError(null);
    setPublishResult(null);

    const res = await onConfirmPublish({
      commitMessage: commitMessage.trim() || defaultMessage
    });

    if (res?.success) {
      setPublishResult(res.data);
      setTimeout(() => {
        onClose();
        setPublishResult(null);
      }, 2500);
    } else {
      setPublishError(res?.error || 'Failed to publish to Git. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-400/20">
              <FaCloudUploadAlt className="text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Publish to Git Origin</h3>
              <p className="text-xs text-slate-300">Commit changes and deploy to repository</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPublishing}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {publishResult ? (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <FaCheckCircle className="text-3xl text-emerald-600 mx-auto animate-bounce" />
              <h4 className="font-bold text-emerald-900 text-sm">Successfully Published!</h4>
              <p className="text-emerald-700">
                Commit <span className="font-mono font-bold bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-900">{publishResult.commitHash}</span> pushed to origin.
              </p>
              <div className="flex justify-center gap-2 pt-2 text-[11px] text-emerald-800">
                <span className="font-semibold">Author: {publishResult.author}</span>
                <span>•</span>
                <span className="font-semibold">Branch: {publishResult.branch}</span>
              </div>
            </div>
          ) : (
            <>
              {/* Question Banner */}
              <div className="p-3.5 bg-indigo-50/80 border border-indigo-100 rounded-xl flex items-start gap-3">
                <FaCodeBranch className="text-indigo-600 text-base mt-0.5 shrink-0" />
                <div className="text-indigo-950">
                  <p className="font-bold text-xs mb-0.5">Should publish to Git origin?</p>
                  <p className="text-[11px] text-indigo-700 leading-relaxed">
                    This action will package your active mock data and settings, commit them as <span className="font-semibold">{activeAdmin}</span>, and push directly to the <span className="font-bold font-mono">OrchestrationPortal</span> branch.
                  </p>
                </div>
              </div>

              {/* Author Badge */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <FaUserCheck className="text-slate-500 text-sm" />
                  <span className="text-slate-600 font-semibold">Publishing Admin:</span>
                </div>
                <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  {activeAdmin}
                </span>
              </div>

              {/* Commit Comment Input */}
              <div>
                <label className="font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FaCommentDots className="text-slate-400" />
                  Commit Description:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold font-mono text-slate-400 select-none">
                    [{activeAdmin}]
                  </span>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Enter short description of your changes..."
                    disabled={isPublishing}
                    className="w-full pl-24 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-xs"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  This description will appear in git commit history and audit trails.
                </p>
              </div>

              {publishError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700">
                  <FaExclamationTriangle className="shrink-0 text-sm" />
                  <span className="text-[11px] font-semibold">{publishError}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!publishResult && (
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPublishing}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer text-xs disabled:opacity-50"
            >
              No, Cancel
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer text-xs disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <FaSpinner className="animate-spin text-xs" />
                  <span>Publishing to Git...</span>
                </>
              ) : (
                <>
                  <FaCloudUploadAlt className="text-sm" />
                  <span>Yes, Publish</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
