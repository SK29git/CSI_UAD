import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrchestrator } from '../../context/OrchestratorContext';
import {
  FaUserShield,
  FaLock,
  FaKey,
  FaArrowRight,
  FaExclamationCircle,
  FaSlidersH,
  FaExternalLinkAlt
} from 'react-icons/fa';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginAdmin, isAuthenticated } = useOrchestrator();

  const [username, setUsername] = useState('SAdmin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = loginAdmin(username, password);
      setIsLoading(false);
      if (res.success) {
        navigate('/admin');
      } else {
        setError(res.error || 'Invalid credentials');
      }
    }, 400);
  };

  const setPresetUser = (user) => {
    setUsername(user);
    setPassword('admin');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 relative font-sans text-slate-800">
      
      {/* Ambient background blur circles */}
      <div className="pointer-events-none fixed -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden relative z-10 animate-fadeIn">
        
        {/* Card Header */}
        <div className="px-6 py-6 bg-slate-950 text-white text-center border-b border-slate-800 relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <FaSlidersH className="text-emerald-400 text-xl" />
            </div>
          </div>
          <h2 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            AGMC Orchestrator Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            System Administration & Git Deployment Console
          </p>
        </div>

        {/* Card Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 animate-shake">
              <FaExclamationCircle className="shrink-0 text-sm" />
              <span className="font-semibold text-xs">{error}</span>
            </div>
          )}

          {/* Quick Select Pill Buttons */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Authorized Admin Accounts:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPresetUser('SAdmin')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  username === 'SAdmin'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs ring-2 ring-indigo-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FaUserShield className="text-[11px]" />
                <span>SAdmin</span>
              </button>
              <button
                type="button"
                onClick={() => setPresetUser('MAdmin')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  username === 'MAdmin'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs ring-2 ring-indigo-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FaUserShield className="text-[11px]" />
                <span>MAdmin</span>
              </button>
            </div>
          </div>

          {/* Username Input */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Username</label>
            <div className="relative">
              <FaUserShield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter SAdmin or MAdmin"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-xs"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (default: admin)"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-xs"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Orchestrator</span>
                <FaArrowRight className="text-[11px]" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Protected Orchestration Route</span>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="text-indigo-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Client App</span>
            <FaExternalLinkAlt className="text-[9px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
