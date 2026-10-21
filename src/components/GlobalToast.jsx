import React, { useState, useEffect, useRef } from 'react';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaTimes, 
  FaCopy, 
  FaCheck 
} from 'react-icons/fa';

export default function GlobalToast({ notification, onClose }) {
  const [copiedTaskId, setCopiedTaskId] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!notification) {
      setCountdown(10);
      return;
    }

    const duration = notification.duration || 10;
    setCountdown(duration);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (onClose) onClose();
    }, duration * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [notification, onClose]);

  if (!notification) return null;

  const handleCopyTaskId = (id) => {
    if (!id) return;
    try {
      navigator.clipboard.writeText(id);
      setCopiedTaskId(true);
      setTimeout(() => setCopiedTaskId(false), 2000);
    } catch (e) {
      console.warn("Clipboard copy failed:", e);
    }
  };

  const isSuccess = notification.type === 'success';
  const isError = notification.type === 'error';

  return (
    <aside 
      aria-label="Notification"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] max-w-lg w-[92vw] sm:w-full transition-all duration-300 animate-in fade-in slide-in-from-top-4"
    >
      <div className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-md transition-all ${
        isSuccess 
          ? 'bg-slate-900/95 text-white border-emerald-500/70 shadow-emerald-950/40' 
          : isError 
            ? 'bg-slate-900/95 text-white border-rose-500/70 shadow-rose-950/40'
            : 'bg-slate-900/95 text-white border-blue-500/70 shadow-blue-950/40'
      }`}>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          isSuccess 
            ? 'bg-emerald-500/20 text-emerald-400' 
            : isError 
              ? 'bg-rose-500/20 text-rose-400'
              : 'bg-blue-500/20 text-blue-400'
        }`}>
          {isSuccess ? (
            <FaCheckCircle className="text-xl" />
          ) : isError ? (
            <FaExclamationTriangle className="text-lg" />
          ) : (
            <FaInfoCircle className="text-lg" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-bold text-sm leading-tight text-white">
              {notification.title || (isSuccess ? 'New customer registration successful!' : 'Notification')}
            </h4>
            {countdown > 0 && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 border ${
                isSuccess 
                  ? 'bg-emerald-900/80 text-emerald-300 border-emerald-700/60'
                  : 'bg-slate-800 text-gray-300 border-slate-700'
              }`}>
                Closing in {countdown}s
              </span>
            )}
          </div>

          {notification.taskId ? (
            <div className="mt-2.5 p-2.5 bg-slate-800/90 border border-slate-700/80 rounded-lg flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                  This is your Task ID:
                </span>
                <span className="font-mono text-xs font-semibold text-gray-100 truncate block select-all">
                  {notification.taskId}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyTaskId(notification.taskId)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-[11px] font-bold rounded flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-2xs"
                title="Copy Task ID"
              >
                {copiedTaskId ? (
                  <>
                    <FaCheck className="text-[10px] text-emerald-200" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <FaCopy className="text-[10px]" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            notification.message && (
              <p className="text-xs text-gray-200 mt-1 leading-normal">
                {notification.message}
              </p>
            )
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          title="Close notification"
        >
          <FaTimes className="text-xs" />
        </button>
      </div>
    </aside>
  );
}
