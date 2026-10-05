import React, { useState, useEffect, useRef } from 'react';
import { Target, Search, Plus, Map as MapIcon, Loader2, History, Trash2, Radar } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Fallback inline components if missing
const IMEITrackerHeader = () => (
  <header className="bg-[#0f1d32] border-b border-[#1a2d4a] px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-3 text-white font-bold text-lg">
      <Target className="w-6 h-6 text-[#00d4aa]" />
      <span>IMEI Tracker</span>
    </div>
  </header>
);

const RegisterDeviceModal = ({ isOpen, onClose }) => null;

const pulseMarkerCSS = `
@keyframes pulse-ring {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(3); opacity: 0; }
}
.pulse-marker {
  width: 16px; height: 16px; border-radius: 50%; background: #00d4aa;
  position: relative;
  box-shadow: 0 0 10px rgba(0, 212, 170, 0.8);
}
.pulse-marker::before {
  content: ''; position: absolute; inset: -12px; border-radius: 50%;
  border: 3px solid #00d4aa; animation: pulse-ring 1.5s infinite ease-out;
}
`;

const IMEITrackerPage = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  
  const [imeiQuery, setImeiQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [deviceData, setDeviceData] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load recent searches
    try {
      const saved = localStorage.getItem('recentImeiSearches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch (e) {
      console.error('Could not load recent searches', e);
    }
    
    // Add CSS for marker
    const style = document.createElement('style');
    style.innerHTML = pulseMarkerCSS;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    // Initialize map
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([25.2048, 55.2708], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abc',
        maxZoom: 20
      }).addTo(mapInstance.current);

      L.control.zoom({ position: 'topright' }).addTo(mapInstance.current);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const saveRecentSearch = (imei) => {
    const newSearch = { imei, timestamp: new Date().toISOString() };
    const updated = [newSearch, ...recentSearches.filter(s => s.imei !== imei)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentImeiSearches', JSON.stringify(updated));
  };

  const clearSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentImeiSearches');
  };

  const handleSearch = async (e, forcedImei = null) => {
    if (e) e.preventDefault();
    const query = forcedImei || imeiQuery;
    
    if (query.length !== 15) {
      setError('IMEI must be exactly 15 digits');
      return;
    }

    setError('');
    setIsSearching(true);
    setDeviceData(null);

    if (markerRef.current) {
      mapInstance.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    try {
      const res = await fetch('http://localhost:3001/api/devices/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imei: query })
      });
      const data = await res.json();

      if (!data.success || !data.found) {
        setError(data.error || 'Device not found. Please register it first.');
        return;
      }

      const device = data.device;

      if (device.status === 'no_location') {
        setError(device.message || 'No location data for this device yet.');
        return;
      }

      setDeviceData(device);
      saveRecentSearch(query);

      // Update Map
      if (mapInstance.current && device.latitude && device.longitude) {
        mapInstance.current.flyTo([device.latitude, device.longitude], 16, {
          duration: 1.5,
          easeLinearity: 0.25
        });

        const icon = L.divIcon({
          className: 'custom-pulse-icon',
          html: '<div class="pulse-marker"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        markerRef.current = L.marker([device.latitude, device.longitude], { icon })
          .addTo(mapInstance.current)
          .bindPopup(`<b>${device.name || device.model}</b><br>${device.address || 'Location found'}`)
          .openPopup();
      }

    } catch (err) {
      setError('Failed to track device. Please check the IMEI and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleImeiChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 15);
    setImeiQuery(val);
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a1628] font-sans overflow-hidden">
      <IMEITrackerHeader />
      
      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Left Panel */}
        <div className="w-full lg:w-[35%] xl:w-[30%] flex flex-col border-r border-[#1a2d4a] bg-[#0a1628] z-10 shadow-2xl z-20">
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            
            {/* Search Card */}
            <div className="bg-[#0f1d32] rounded-2xl border border-[#1a2d4a] p-5 shadow-lg mb-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-[#00d4aa]" />
                Track Device
              </h2>
              
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 block uppercase tracking-wider">Device IMEI Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={imeiQuery}
                      onChange={handleImeiChange}
                      placeholder="Enter 15-digit IMEI..."
                      className="w-full bg-[#1a2d4a] border border-[#2a3f5f] rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa] transition-all text-lg tracking-widest"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                      <span className={`text-xs font-medium ${imeiQuery.length === 15 ? 'text-[#00d4aa]' : 'text-gray-500'}`}>
                        {imeiQuery.length}/15
                      </span>
                    </div>
                  </div>
                  {error && <p className="text-red-400 text-xs mt-2 font-medium">{error}</p>}
                </div>
                
                <button
                  type="submit"
                  disabled={isSearching || imeiQuery.length !== 15}
                  className="w-full bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:brightness-110 text-[#0a1628] font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,212,170,0.2)]"
                >
                  {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  {isSearching ? 'Locating Device...' : 'Track Location'}
                </button>
              </form>
              
              <div className="mt-5 pt-5 border-t border-[#1a2d4a]">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-transparent border border-[#00d4aa] text-[#00d4aa] hover:bg-[#00d4aa]/10 font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Register New Device
                </button>
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                    <History className="w-4 h-4" /> Recent Searches
                  </h3>
                  <button onClick={clearSearches} className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setImeiQuery(search.imei);
                        handleSearch(null, search.imei);
                      }}
                      className="bg-[#0f1d32] border border-[#1a2d4a] hover:border-[#2a3f5f] hover:bg-[#1a2d4a]/50 p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1a2d4a] flex items-center justify-center text-gray-400 group-hover:text-[#00d4aa] transition-colors">
                          <MapIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-white font-medium tracking-wider text-sm">{search.imei}</div>
                          <div className="text-xs text-gray-500">{new Date(search.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel (Map) */}
        <div className="w-full lg:w-[65%] xl:w-[70%] relative flex flex-col">
          <div className="absolute top-4 left-4 z-[400] bg-[#0f1d32]/90 backdrop-blur-md border border-[#1a2d4a] px-4 py-2 rounded-xl shadow-lg pointer-events-none">
            <h2 className="text-white font-bold flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-[#00d4aa]" /> Device Location
            </h2>
          </div>

          <div className="flex-1 relative bg-[#0a1628]">
            <div id="map" ref={mapRef} className="absolute inset-0 z-[10]"></div>
            
            {!deviceData && !isSearching && (
              <div className="absolute inset-0 z-[20] flex items-center justify-center bg-[#0a1628]/80 backdrop-blur-sm pointer-events-none">
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-[#1a2d4a] rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[#00d4aa] rounded-full border-t-transparent animate-spin"></div>
                    <Radar className="w-16 h-16 text-[#00d4aa] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Awaiting Input</h3>
                  <p className="text-gray-400 max-w-sm mx-auto">Enter a 15-digit IMEI number in the panel to locate a device on the map.</p>
                </div>
              </div>
            )}
          </div>

          {/* Device Info Overlay */}
          {deviceData && (
            <div className="absolute bottom-6 left-6 right-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-xl z-[400]">
              <DeviceInfoCard device={deviceData} />
            </div>
          )}
        </div>
      </main>

      <RegisterDeviceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={(data) => {
          setImeiQuery(data.imei);
        }}
      />
    </div>
  );
};

export default IMEITrackerPage;
