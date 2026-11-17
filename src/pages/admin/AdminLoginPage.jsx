import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrchestrator } from '../../context/OrchestratorContext';
import {
  FaUserShield,
  FaLock,
  FaArrowRight,
  FaExclamationCircle,
  FaSlidersH
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
    <div
      className="min-h-screen w-full flex flex-col justify-center items-center p-4 relative font-sans text-slate-100 bg-slate-950 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/admin-bg.jpg')` }}
    >
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs" />

      {/* Main Login Card with Glassmorphism */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/15 overflow-hidden relative z-10 animate-fadeIn">
        
        {/* Card Header */}
        <div className="px-6 pt-7 pb-5 text-center border-b border-white/10 relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 shadow-xl shadow-indigo-500/30 flex items-center justify-center mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <FaSlidersH className="text-emerald-400 text-xl" />
            </div>
          </div>
          <h2 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
            AGMC Orchestrator Portal
          </h2>
        </div>

        {/* Card Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 animate-shake">
              <FaExclamationCircle className="shrink-0 text-sm" />
              <span className="font-semibold text-xs">{error}</span>
            </div>
          )}

          {/* Quick Select Pill Buttons */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Authorized Admin Accounts:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPresetUser('SAdmin')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  username === 'SAdmin'
                    ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 shadow-sm ring-2 ring-indigo-500/30'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <FaUserShield className="text-[11px]" />
                <span>SAdmin</span>
              </button>
              <button
                type="button"
                onClick={() => setPresetUser('MAdmin')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  username === 'MAdmin'
                    ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 shadow-sm ring-2 ring-indigo-500/30'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <FaUserShield className="text-[11px]" />
                <span>MAdmin</span>
              </button>
            </div>
          </div>

          {/* Username Input */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">Username</label>
            <div className="relative">
              <FaUserShield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter SAdmin or MAdmin"
                className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-white/10 rounded-xl text-white font-bold focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all text-xs"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (default: admin)"
                className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-white/10 rounded-xl text-white font-medium focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all text-xs"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50 mt-3"
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
      </div>
    </div>
  );
}
