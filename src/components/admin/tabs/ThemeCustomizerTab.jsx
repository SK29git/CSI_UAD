import React, { useState } from 'react';
import {
  FaPalette,
  FaCheck,
  FaEye,
  FaSun,
  FaMoon,
  FaCheckCircle,
  FaSlidersH
} from 'react-icons/fa';

const THEME_PRESETS = [
  {
    name: 'Slate Default',
    backgroundColor: '#f1f5f9',
    cardColor: '#ffffff',
    accentColor: '#2563eb',
    textColor: '#1e293b',
    description: 'Crisp cool-gray backdrop (Default AGMC UI)'
  },
  {
    name: 'Clean White',
    backgroundColor: '#ffffff',
    cardColor: '#f8fafc',
    accentColor: '#2563eb',
    textColor: '#0f172a',
    description: 'Minimal pure white enterprise canvas'
  },
  {
    name: 'Emerald Mint',
    backgroundColor: '#ecfdf5',
    cardColor: '#ffffff',
    accentColor: '#059669',
    textColor: '#064e3b',
    description: 'Refreshing subtle mint backdrop'
  },
  {
    name: 'Ocean Sky',
    backgroundColor: '#f0f9ff',
    cardColor: '#ffffff',
    accentColor: '#0284c7',
    textColor: '#0c4a6e',
    description: 'Soft sky blue ambience'
  },
  {
    name: 'Royal Indigo',
    backgroundColor: '#eef2ff',
    cardColor: '#ffffff',
    accentColor: '#4f46e5',
    textColor: '#312e81',
    description: 'Modern executive indigo tone'
  },
  {
    name: 'Light Pearl',
    backgroundColor: '#f8fafc',
    cardColor: '#ffffff',
    accentColor: '#3b82f6',
    textColor: '#1e293b',
    description: 'Ultra subtle off-white background'
  },
  {
    name: 'Warm Amber',
    backgroundColor: '#fffbeb',
    cardColor: '#ffffff',
    accentColor: '#d97706',
    textColor: '#78350f',
    description: 'Warm, hospitable hospitality vibe'
  },
  {
    name: 'Soft Rose',
    backgroundColor: '#fff1f2',
    cardColor: '#ffffff',
    accentColor: '#e11d48',
    textColor: '#881337',
    description: 'Gentle luxury rose tone'
  },
  {
    name: 'Charcoal Dark',
    backgroundColor: '#0f172a',
    cardColor: '#1e293b',
    accentColor: '#38bdf8',
    textColor: '#f8fafc',
    description: 'Dark mode ambiance for call centers'
  }
];

export default function ThemeCustomizerTab({ theme, onUpdateTheme }) {
  const [activeTheme, setActiveTheme] = useState({
    preset: theme.preset || 'Slate Default',
    backgroundColor: theme.backgroundColor || '#f1f5f9',
    cardColor: theme.cardColor || '#ffffff',
    accentColor: theme.accentColor || '#2563eb',
    textColor: theme.textColor || '#1e293b'
  });

  const [customName, setCustomName] = useState(activeTheme.preset);
  const [appliedNotification, setAppliedNotification] = useState(false);

  const handleSelectPreset = (preset) => {
    const updated = {
      preset: preset.name,
      backgroundColor: preset.backgroundColor,
      cardColor: preset.cardColor,
      accentColor: preset.accentColor,
      textColor: preset.textColor
    };
    setActiveTheme(updated);
    setCustomName(preset.name);
    onUpdateTheme(updated);
    triggerAppliedToast();
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    const updated = {
      ...activeTheme,
      preset: customName.trim() || 'Custom Theme'
    };
    onUpdateTheme(updated);
    triggerAppliedToast();
  };

  const triggerAppliedToast = () => {
    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <FaPalette className="text-indigo-600" />
            Background Color & Theme Orchestrator
          </h3>
          <p className="text-xs text-slate-500">
            Customize the background canvas color and theme for the entire application in real-time.
          </p>
        </div>
        {appliedNotification && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-lg animate-fadeIn">
            <FaCheckCircle />
            <span>Theme applied successfully!</span>
          </div>
        )}
      </div>

      {/* Preset Cards Grid */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-3">
        <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
          Curated Color Palettes
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {THEME_PRESETS.map((p) => {
            const isSelected = activeTheme.backgroundColor === p.backgroundColor;
            return (
              <div
                key={p.name}
                onClick={() => handleSelectPreset(p)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 border-indigo-400 bg-indigo-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full border border-slate-300 shadow-2xs inline-block shrink-0"
                      style={{ backgroundColor: p.backgroundColor }}
                    />
                    <span className="font-bold text-xs text-slate-800">{p.name}</span>
                  </div>
                  {isSelected && (
                    <span className="text-indigo-600 font-bold text-xs flex items-center gap-1">
                      <FaCheck className="text-[10px]" /> Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mb-2">{p.description}</p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span>BG: {p.backgroundColor}</span>
                  <span>•</span>
                  <span>Accent: {p.accentColor}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Color Tuner & Live Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Custom Tuner */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 space-y-3">
          <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FaSlidersH className="text-slate-500" />
            Custom Background Tuning
          </h4>
          <form onSubmit={handleApplyCustom} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Theme Name / Label</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. AGMC Light Blue"
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeTheme.backgroundColor}
                    onChange={(e) =>
                      setActiveTheme({ ...activeTheme, backgroundColor: e.target.value })
                    }
                    className="w-9 h-9 p-0.5 rounded-lg border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={activeTheme.backgroundColor}
                    onChange={(e) =>
                      setActiveTheme({ ...activeTheme, backgroundColor: e.target.value })
                    }
                    className="flex-1 p-2 border border-slate-200 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Accent Primary</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeTheme.accentColor}
                    onChange={(e) =>
                      setActiveTheme({ ...activeTheme, accentColor: e.target.value })
                    }
                    className="w-9 h-9 p-0.5 rounded-lg border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={activeTheme.accentColor}
                    onChange={(e) =>
                      setActiveTheme({ ...activeTheme, accentColor: e.target.value })
                    }
                    className="flex-1 p-2 border border-slate-200 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-all cursor-pointer text-xs"
            >
              Apply Custom Theme Colors
            </button>
          </form>
        </div>

        {/* Live Preview Canvas */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FaEye className="text-slate-400" />
              Live Interactive Preview
            </h4>
            
            {/* The preview container with background applied */}
            <div
              className="p-4 rounded-xl border border-slate-200 shadow-inner space-y-3 transition-colors duration-300 min-h-[160px]"
              style={{ backgroundColor: activeTheme.backgroundColor }}
            >
              {/* Simulated Card on top of background */}
              <div
                className="p-3 rounded-lg shadow-xs border border-slate-200/80 flex items-center justify-between"
                style={{ backgroundColor: activeTheme.cardColor }}
              >
                <div>
                  <h5 className="font-bold text-xs" style={{ color: activeTheme.textColor }}>
                    Customer Profile Canvas
                  </h5>
                  <p className="text-[10px] text-slate-500">
                    Preview of card contrast against {activeTheme.preset}
                  </p>
                </div>
                <button
                  type="button"
                  className="px-3 py-1 rounded text-white font-bold text-[11px] shadow-2xs"
                  style={{ backgroundColor: activeTheme.accentColor }}
                >
                  Action Button
                </button>
              </div>

              {/* Simulated Pill / Badge */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-slate-700 border border-slate-200">
                  Status: Active Call
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: activeTheme.accentColor }}
                >
                  Department: Service
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 italic">
            Changes applied here will immediately style all customer view pages.
          </p>
        </div>
      </div>
    </div>
  );
}
