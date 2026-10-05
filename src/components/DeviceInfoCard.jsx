import React from 'react';
import { Battery, Signal, MapPin, Clock, Smartphone, Hash, Navigation } from 'lucide-react';

const DeviceInfoCard = ({ device }) => {
  if (!device) return null;

  const { imei, name, owner, phone, latitude, longitude, address, battery, signal, lastSeen, status, model } = device;

  const getBatteryColor = (level) => {
    if (level > 50) return 'bg-green-500';
    if (level > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderSignalBars = (level) => {
    return (
      <div className="flex items-end gap-1 h-4">
        {[1, 2, 3, 4, 5].map((bar) => (
          <div
            key={bar}
            className={`w-1 rounded-sm ${bar <= level ? 'bg-[#00d4aa]' : 'bg-[#1a2d4a]'}`}
            style={{ height: `${20 * bar}%` }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-gray-400" />
            {model || name || 'Unknown Device'}
          </h3>
          <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
            <Hash className="w-4 h-4" /> {imei}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
          status === 'online' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
          status === 'offline' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
          'bg-gray-500/10 text-gray-400 border border-gray-500/20'
        }`}>
          <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-400 animate-pulse' : status === 'offline' ? 'bg-red-400' : 'bg-gray-400'}`} />
          {status === 'online' ? 'Device Found' : status === 'offline' ? 'Device Offline' : 'Status Unknown'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-[#1a2d4a]/50 p-3 rounded-lg">
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Battery className="w-3 h-3"/> Battery</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-[#1a2d4a] rounded-full overflow-hidden">
              <div className={`h-full ${getBatteryColor(battery)}`} style={{ width: `${battery || 0}%` }} />
            </div>
            <span className="text-sm text-white font-medium">{battery || 0}%</span>
          </div>
        </div>
        <div className="bg-[#1a2d4a]/50 p-3 rounded-lg">
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Signal className="w-3 h-3"/> Signal Strength</div>
          <div className="flex items-center gap-2 mt-1">
            {renderSignalBars(signal || 0)}
            <span className="text-sm text-white font-medium ml-1">{signal || 0}/5</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="mt-1 bg-[#1a2d4a] p-1.5 rounded-md text-[#00d4aa]"><Navigation className="w-4 h-4" /></div>
          <div>
            <div className="text-xs text-gray-400">Coordinates</div>
            <div className="text-sm text-white font-medium">{latitude?.toFixed(6)}, {longitude?.toFixed(6)}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="mt-1 bg-[#1a2d4a] p-1.5 rounded-md text-[#00d4aa]"><MapPin className="w-4 h-4" /></div>
          <div>
            <div className="text-xs text-gray-400">Address</div>
            <div className="text-sm text-white font-medium line-clamp-2">{address || 'Location unavailable'}</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1 bg-[#1a2d4a] p-1.5 rounded-md text-[#00d4aa]"><Clock className="w-4 h-4" /></div>
          <div>
            <div className="text-xs text-gray-400">Last Seen</div>
            <div className="text-sm text-white font-medium">{lastSeen ? (lastSeen.includes('ago') || lastSeen === 'just now' ? lastSeen : new Date(lastSeen).toLocaleString()) : 'Never'}</div>
          </div>
        </div>
      </div>

      {(owner || phone) && (
        <div className="mt-4 pt-4 border-t border-[#1a2d4a]">
          <div className="text-xs text-gray-400 mb-2">Owner Information</div>
          <div className="flex justify-between items-center text-sm text-white">
            <span>{owner || 'Unknown'}</span>
            <span className="text-gray-400">{phone || 'N/A'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceInfoCard;
