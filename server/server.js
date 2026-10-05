/**
 * IMEI Device Tracker - Backend Server
 * 
 * This server provides APIs for:
 * 1. Registering devices with their IMEI numbers
 * 2. Updating device locations (from the companion app on the phone)
 * 3. Tracking/querying device locations by IMEI
 * 4. Reverse geocoding coordinates to addresses
 * 
 * Uses JSON file for persistent storage (no native compilation needed).
 */

import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;
const DB_FILE = join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// ─── JSON File Database ──────────────────────────────────────────────────────

function loadDB() {
  try {
    if (existsSync(DB_FILE)) {
      return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading DB:', e.message);
  }
  return { devices: [], locations: [], nextDeviceId: 1, nextLocationId: 1 };
}

function saveDB(data) {
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

let db = loadDB();

// ─── Helper: Reverse Geocode ─────────────────────────────────────────────────

async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: { 'User-Agent': 'IMEIDeviceTracker/1.0' }
      }
    );
    const data = await response.json();
    return data.display_name || `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
  } catch (error) {
    console.error('Reverse geocoding failed:', error.message);
    return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
  }
}

// ─── Helper: Calculate time ago ──────────────────────────────────────────────

function timeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 10) return 'just now';
  if (diffSec < 60) return `${diffSec} seconds ago`;
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
}

// ─── API Routes ──────────────────────────────────────────────────────────────

/**
 * POST /api/devices/register
 * Register a new device with its IMEI number
 */
app.post('/api/devices/register', (req, res) => {
  try {
    const { imei, name, owner, phone, model } = req.body;

    if (!imei || !/^\d{15}$/.test(imei)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid IMEI. Must be exactly 15 digits.'
      });
    }

    const existing = db.devices.find(d => d.imei === imei);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'This IMEI is already registered.'
      });
    }

    const device = {
      id: db.nextDeviceId++,
      imei,
      name: name || '',
      owner: owner || '',
      phone: phone || '',
      model: model || 'Unknown Device',
      createdAt: new Date().toISOString()
    };

    db.devices.push(device);
    saveDB(db);

    res.status(201).json({
      success: true,
      message: 'Device registered successfully',
      deviceId: device.id
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
});

/**
 * POST /api/devices/update-location
 * Update a device's location (called by the companion app on the phone)
 */
app.post('/api/devices/update-location', async (req, res) => {
  try {
    const { imei, latitude, longitude, accuracy, battery, signal } = req.body;

    if (!imei || !/^\d{15}$/.test(imei)) {
      return res.status(400).json({ success: false, error: 'Invalid IMEI' });
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ success: false, error: 'Invalid coordinates' });
    }

    const device = db.devices.find(d => d.imei === imei);
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not registered' });
    }

    // Reverse geocode the address
    const address = await reverseGeocode(latitude, longitude);

    const location = {
      id: db.nextLocationId++,
      deviceId: device.id,
      latitude,
      longitude,
      accuracy: accuracy || 0,
      battery: battery ?? -1,
      signal: signal ?? -1,
      address,
      timestamp: new Date().toISOString()
    };

    db.locations.push(location);
    saveDB(db);

    res.json({ success: true, message: 'Location updated', address });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * POST /api/devices/track
 * Track a device by IMEI — returns latest location
 */
app.post('/api/devices/track', async (req, res) => {
  try {
    const { imei } = req.body;

    if (!imei || !/^\d{15}$/.test(imei)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid IMEI. Must be exactly 15 digits.'
      });
    }

    const device = db.devices.find(d => d.imei === imei);
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found. Please register it first.'
      });
    }

    // Get latest location for this device
    const deviceLocations = db.locations
      .filter(l => l.deviceId === device.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const location = deviceLocations[0];

    if (!location) {
      return res.json({
        success: true,
        found: true,
        device: {
          imei: device.imei,
          name: device.name,
          owner: device.owner,
          phone: device.phone,
          model: device.model,
          status: 'no_location',
          message: 'Device registered but no location data received yet. Make sure the companion app is installed and running on the device.'
        }
      });
    }

    // Determine status based on last update time
    const lastUpdate = new Date(location.timestamp);
    const minutesAgo = (Date.now() - lastUpdate.getTime()) / 1000 / 60;
    let status = 'online';
    if (minutesAgo > 60) status = 'offline';
    else if (minutesAgo > 15) status = 'idle';

    res.json({
      success: true,
      found: true,
      device: {
        imei: device.imei,
        name: device.name,
        owner: device.owner,
        phone: device.phone,
        model: device.model,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        battery: location.battery,
        signal: location.signal,
        address: location.address,
        lastSeen: timeAgo(location.timestamp),
        lastSeenRaw: location.timestamp,
        status
      }
    });
  } catch (error) {
    console.error('Track error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * GET /api/devices
 * List all registered devices with their latest location
 */
app.get('/api/devices', (req, res) => {
  try {
    const devicesWithLocation = db.devices.map(device => {
      const deviceLocations = db.locations
        .filter(l => l.deviceId === device.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const location = deviceLocations[0];

      let status = 'no_location';
      if (location) {
        const lastUpdate = new Date(location.timestamp);
        const minutesAgo = (Date.now() - lastUpdate.getTime()) / 1000 / 60;
        status = minutesAgo > 60 ? 'offline' : minutesAgo > 15 ? 'idle' : 'online';
      }

      return {
        imei: device.imei,
        name: device.name,
        owner: device.owner,
        phone: device.phone,
        model: device.model,
        latitude: location?.latitude,
        longitude: location?.longitude,
        address: location?.address || '',
        battery: location?.battery ?? -1,
        signal: location?.signal ?? -1,
        lastSeen: location ? timeAgo(location.timestamp) : 'Never',
        status,
        createdAt: device.createdAt
      };
    });

    res.json({ success: true, devices: devicesWithLocation });
  } catch (error) {
    console.error('List devices error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * GET /api/devices/:imei/history
 * Get location history for a device
 */
app.get('/api/devices/:imei/history', (req, res) => {
  try {
    const { imei } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const device = db.devices.find(d => d.imei === imei);
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    const history = db.locations
      .filter(l => l.deviceId === device.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)
      .map(l => ({
        latitude: l.latitude,
        longitude: l.longitude,
        accuracy: l.accuracy,
        battery: l.battery,
        signal: l.signal,
        address: l.address,
        timestamp: l.timestamp
      }));

    res.json({ success: true, history });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * DELETE /api/devices/:imei
 * Delete a device and all its location data
 */
app.delete('/api/devices/:imei', (req, res) => {
  try {
    const { imei } = req.params;

    const deviceIndex = db.devices.findIndex(d => d.imei === imei);
    if (deviceIndex === -1) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    const deviceId = db.devices[deviceIndex].id;
    db.devices.splice(deviceIndex, 1);
    db.locations = db.locations.filter(l => l.deviceId !== deviceId);
    saveDB(db);

    res.json({ success: true, message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ─── Seed Demo Data ──────────────────────────────────────────────────────────

function seedDemoData() {
  if (db.devices.length > 0) return; // Already seeded

  console.log('🌱 Seeding demo data...');

  const demoDevices = [
    { imei: '354789201234567', name: 'iPhone 15 Pro', owner: 'Ahmed Al-Maktoum', phone: '+971501234567', model: 'Apple iPhone 15 Pro' },
    { imei: '867530012345678', name: 'Galaxy S24 Ultra', owner: 'Fatima Al-Rashid', phone: '+971552345678', model: 'Samsung Galaxy S24 Ultra' },
    { imei: '490154203237518', name: 'Pixel 8 Pro', owner: 'Omar Hassan', phone: '+971503456789', model: 'Google Pixel 8 Pro' },
    { imei: '353456789012345', name: 'OnePlus 12', owner: 'Sara Al-Khouri', phone: '+971504567890', model: 'OnePlus 12' },
    { imei: '862345678901234', name: 'Huawei P60', owner: 'Khalid Ibrahim', phone: '+971505678901', model: 'Huawei P60 Pro' },
  ];

  const demoLocations = [
    { lat: 25.2048, lng: 55.2708, address: 'Burj Khalifa, Downtown Dubai, Dubai, UAE' },
    { lat: 25.1972, lng: 55.2744, address: 'Dubai Mall, Financial Center Road, Dubai, UAE' },
    { lat: 25.2532, lng: 55.3317, address: 'Dubai International Airport, Terminal 3, Dubai, UAE' },
    { lat: 25.0657, lng: 55.1713, address: 'Palm Jumeirah, Atlantis, Dubai, UAE' },
    { lat: 25.2285, lng: 55.2867, address: 'DIFC Gate Building, Sheikh Zayed Road, Dubai, UAE' },
  ];

  const now = Date.now();

  demoDevices.forEach((deviceData, index) => {
    const device = {
      id: db.nextDeviceId++,
      ...deviceData,
      createdAt: new Date(now - 86400000).toISOString() // created yesterday
    };
    db.devices.push(device);

    const loc = demoLocations[index];
    // Insert multiple location points (history)
    const minuteOffsets = [0, 5, 15, 30, 60, 180]; // minutes ago
    minuteOffsets.forEach((offsetMinutes, i) => {
      const jitter = i > 0 ? (Math.random() - 0.5) * 0.005 : 0;
      db.locations.push({
        id: db.nextLocationId++,
        deviceId: device.id,
        latitude: loc.lat + jitter,
        longitude: loc.lng + jitter,
        accuracy: Math.random() * 20 + 5,
        battery: Math.max(10, 100 - index * 15 - i * 5),
        signal: Math.max(1, 5 - Math.floor(i / 2)),
        address: loc.address,
        timestamp: new Date(now - offsetMinutes * 60000).toISOString()
      });
    });
  });

  saveDB(db);
  console.log('✅ Demo data seeded: 5 devices with location history');
}

seedDemoData();

// ─── Start Server ────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║     IMEI Device Tracker - API Server         ║
  ║     Running on http://localhost:${PORT}          ║
  ╠══════════════════════════════════════════════╣
  ║  Endpoints:                                  ║
  ║  POST /api/devices/register                  ║
  ║  POST /api/devices/update-location           ║
  ║  POST /api/devices/track                     ║
  ║  GET  /api/devices                           ║
  ║  GET  /api/devices/:imei/history             ║
  ║  DEL  /api/devices/:imei                     ║
  ╚══════════════════════════════════════════════╝
  `);
});
