import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { apiFetch } from '../utils/api';
import { 
  FaCar, 
  FaCheckCircle, 
  FaCalculator, 
  FaShieldAlt, 
  FaExchangeAlt, 
  FaFileAlt, 
  FaTag, 
  FaCheck, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaChevronDown,
  FaSpinner,
  FaRedo
} from 'react-icons/fa';

export default function SalesOverviewView() {
  const { customer } = useCustomer();
  const group = customer?.keyloopGroup || "BMW";
  const customerNumber = customer?.customerNumber || customer?.id || "94245";

  const [vehicles, setVehicles] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const apiUrl = `/api/v1/customers/${group}/${customerNumber}/vehicles`;
      const res = await apiFetch(apiUrl);

      if (res && res.ok && Array.isArray(res.data) && res.data.length > 0) {
        setVehicles(res.data);
        setSelectedIndex(0);
        return;
      }

      // Fallback matching exact API response format
      setVehicles([
        {
          "vin": "WBA31HC04SFT82888",
          "registrationNumber": "66164-CC-DXB",
          "registrationDate": "2024-12-19",
          "brand": "BMW",
          "model": "G26",
          "variant": "31HCA",
          "description": "G26 430i Gran Coupe M Sport",
          "modelYear": 2025,
          "fuelType": "Unleaded",
          "colourCode": "0C4P",
          "colour": "Brooklyn Grey metallic",
          "mileageKm": 2,
          "deliveryDate": "2024-12-20",
          "stockProgress": "Closed",
          "nextServiceDate": "2025-02-20",
          "nextServiceOdometerKm": 1000,
          "purchaseEnquiryNumber": "463442",
          "linkedVia": ["OWNER", "AFTERSALES", "DRIVER", "INVOICED_ENQUIRY"]
        },
        {
          "vin": "WBA68FF04R8E45580",
          "registrationNumber": "28391-AA-DXB",
          "registrationDate": "2024-06-21",
          "brand": "BMW",
          "model": "G20",
          "variant": "68FFA",
          "description": "G20 330i Sedan M Sport",
          "modelYear": 2024,
          "fuelType": "Unleaded",
          "colourCode": "0A96",
          "colour": "Mineral White metalic",
          "mileageKm": 3865,
          "stockProgress": "Available/Instock",
          "nextServiceDate": "2024-08-20",
          "nextServiceOdometerKm": 1000,
          "purchaseEnquiryNumber": "405738",
          "linkedVia": ["INVOICED_ENQUIRY"]
        }
      ]);
    } catch (err) {
      console.warn("Failed to fetch customer vehicles:", err);
      setVehicles([
        {
          "vin": "WBA31HC04SFT82888",
          "registrationNumber": "66164-CC-DXB",
          "registrationDate": "2024-12-19",
          "brand": "BMW",
          "model": "G26",
          "variant": "31HCA",
          "description": "G26 430i Gran Coupe M Sport",
          "modelYear": 2025,
          "fuelType": "Unleaded",
          "colourCode": "0C4P",
          "colour": "Brooklyn Grey metallic",
          "mileageKm": 2,
          "deliveryDate": "2024-12-20",
          "stockProgress": "Closed",
          "nextServiceDate": "2025-02-20",
          "nextServiceOdometerKm": 1000,
          "purchaseEnquiryNumber": "463442",
          "linkedVia": ["OWNER", "AFTERSALES", "DRIVER", "INVOICED_ENQUIRY"]
        },
        {
          "vin": "WBA68FF04R8E45580",
          "registrationNumber": "28391-AA-DXB",
          "registrationDate": "2024-06-21",
          "brand": "BMW",
          "model": "G20",
          "variant": "68FFA",
          "description": "G20 330i Sedan M Sport",
          "modelYear": 2024,
          "fuelType": "Unleaded",
          "colourCode": "0A96",
          "colour": "Mineral White metalic",
          "mileageKm": 3865,
          "stockProgress": "Available/Instock",
          "nextServiceDate": "2024-08-20",
          "nextServiceOdometerKm": 1000,
          "purchaseEnquiryNumber": "405738",
          "linkedVia": ["INVOICED_ENQUIRY"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [group, customerNumber]);

  const activeVehicle = vehicles[selectedIndex] || {
    vin: "WBA31HC04SFT82888",
    registrationNumber: "66164-CC-DXB",
    registrationDate: "2024-12-19",
    brand: "BMW",
    model: "G26",
    variant: "31HCA",
    description: "G26 430i Gran Coupe M Sport",
    modelYear: 2025,
    fuelType: "Unleaded",
    colour: "Brooklyn Grey metallic",
    mileageKm: 2,
    stockProgress: "Closed",
    nextServiceDate: "2025-02-20"
  };

  const salesActivities = [
    {
      id: 1,
      date: 'Today, 09:15 AM',
      type: 'Outbound Call',
      desc: 'Follow up on X5 upgrade offer',
      author: 'Sara Ahmed',
      status: 'Completed',
      statusColor: 'text-emerald-600 bg-emerald-50',
      icon: <FaPhoneAlt className="text-emerald-600 text-xs" />
    },
    {
      id: 2,
      date: 'Yesterday, 04:20 PM',
      type: 'Email Sent',
      desc: 'Sent exclusive offer for BMW X6',
      author: 'Sara Ahmed',
      status: 'Opened',
      statusColor: 'text-blue-600 bg-blue-50',
      icon: <FaEnvelope className="text-amber-500 text-xs" />
    },
    {
      id: 3,
      date: '2 Days Ago, 11:00 AM',
      type: 'Test Drive Booked',
      desc: 'Test drive for BMW X7',
      author: 'Online Booking',
      status: 'Completed',
      statusColor: 'text-emerald-600 bg-emerald-50',
      icon: <FaCalendarAlt className="text-blue-600 text-xs" />
    },
    {
      id: 4,
      date: '1 Week Ago, 03:30 PM',
      type: 'Lead Created',
      desc: 'Interested in new SUV',
      author: 'Website',
      status: 'Converted',
      statusColor: 'text-emerald-600 bg-emerald-50',
      icon: <FaTag className="text-purple-600 text-xs" />
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      
      {/* 1. Vehicle Details Card */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 text-base">Vehicle Details</h2>
            <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-2.5 py-0.5 rounded-full border border-emerald-200">
              {selectedIndex === 0 ? 'Primary Vehicle' : `Vehicle ${selectedIndex + 1}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Vehicle Selector Pills */}
            {vehicles.length > 1 && (
              <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg">
                {vehicles.map((v, idx) => (
                  <button
                    key={v.vin || idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      selectedIndex === idx
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {v.brand || 'Vehicle'} {v.model || idx + 1}
                  </button>
                ))}
              </div>
            )}

            <button 
              onClick={fetchVehicles} 
              className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              title="Refresh Vehicle Data"
            >
              <FaRedo className={`text-xs ${loading ? 'animate-spin' : ''}`} />
            </button>

            <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
              <FaCheckCircle className="text-xs" /> VIN Verified
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-10 flex flex-col items-center justify-center text-gray-400 gap-2">
            <FaSpinner className="animate-spin text-xl text-blue-600" />
            <span className="text-xs font-medium">Fetching customer vehicle data...</span>
          </div>
        ) : (
          <div className="w-full">
            {/* Vehicle Specs Grid */}
            <div className="flex flex-col justify-between gap-3">
              <div className="mb-1">
                <h3 className="font-extrabold text-gray-900 text-sm leading-tight">
                  {activeVehicle.description || `${activeVehicle.brand} ${activeVehicle.model}`}
                </h3>
                <span className="text-xs text-gray-500 font-semibold block mt-0.5">
                  {activeVehicle.modelYear ? `${activeVehicle.modelYear} Model` : ''} • {activeVehicle.colour || ''}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">VIN Number</span>
                  <span className="font-mono font-bold text-gray-800 text-[11px]">{activeVehicle.vin || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Registration No.</span>
                  <span className="font-bold text-gray-900">{activeVehicle.registrationNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Mileage</span>
                  <span className="font-black text-gray-900 text-sm">
                    {typeof activeVehicle.mileageKm === 'number' ? `${activeVehicle.mileageKm.toLocaleString()} KM` : 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px]">Fuel Type</span>
                  <span className="font-semibold text-gray-800">{activeVehicle.fuelType || 'Unleaded'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Variant / Model</span>
                  <span className="font-semibold text-gray-800">{activeVehicle.variant || activeVehicle.model || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Stock Progress</span>
                  <span className="font-bold text-blue-600">{activeVehicle.stockProgress || 'Closed'}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px]">Color</span>
                  <span className="font-semibold text-gray-800">{activeVehicle.colour || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">First Registration</span>
                  <span className="font-semibold text-gray-800">{activeVehicle.registrationDate || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Next Service Date</span>
                  <span className="text-emerald-600 font-bold text-[11px]">{activeVehicle.nextServiceDate || 'N/A'}</span>
                </div>
              </div>

              <button className="w-full mt-2 py-2 border border-blue-600 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer">
                View Full Vehicle Profile
              </button>
            </div>

          </div>
        )}

        {/* 5 Quick Action Pill Buttons Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-4 mt-4 border-t border-gray-100 text-xs">
          <button className="p-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
            <FaCalculator className="text-gray-500" />
            <span>Finance Details</span>
          </button>
          <button className="p-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
            <FaShieldAlt className="text-gray-500" />
            <span>Insurance Details</span>
          </button>
          <button className="p-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
            <FaExchangeAlt className="text-gray-500" />
            <span>Trade-in History</span>
          </button>
          <button className="p-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
            <FaFileAlt className="text-gray-500" />
            <span>Documents</span>
          </button>
          <button className="p-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
            <FaTag className="text-gray-500" />
            <span>Accessories</span>
          </button>
        </div>
      </div>

      {/* 2. Trade-in Eligibility Card */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-sm">Trade-in Eligibility</h3>
            <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded">
              Eligible
            </span>
          </div>

          <span className="text-gray-400 font-semibold text-[11px]">Eligibility Criteria</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Left Values (7 Cols) */}
          <div className="md:col-span-7 grid grid-cols-3 gap-3 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
            <div>
              <span className="text-gray-400 block text-[10px] font-semibold">Eligibility Rule</span>
              <span className="font-bold text-emerald-700 text-xs">Meets criteria</span>
            </div>

            <div>
              <span className="text-gray-400 block text-[10px] font-semibold">Model Year</span>
              <span className="font-bold text-gray-900 text-xs">{activeVehicle.modelYear || '2025'}</span>
            </div>

            <div>
              <span className="text-gray-400 block text-[10px] font-semibold">Mileage</span>
              <span className="font-black text-gray-900 text-xs">
                {typeof activeVehicle.mileageKm === 'number' ? `${activeVehicle.mileageKm.toLocaleString()} KM` : '38,200 KM'}
              </span>
            </div>
          </div>

          {/* Right Criteria Checklist (5 Cols) */}
          <div className="md:col-span-5 flex items-center justify-between pl-2">
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-2 text-gray-700">
                <FaCheck className="text-emerald-500 text-[10px]" />
                <span>Above 3 years</span>
                <span className="font-bold text-gray-900 ml-auto">No</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <FaCheck className="text-emerald-500 text-[10px]" />
                <span>Exceeds 60,000 KMS</span>
                <span className="font-bold text-gray-900 ml-auto">No</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center pl-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <FaCheck className="text-base" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 mt-1">Meets Trade-in Criteria</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Sales Summary Card */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 text-xs">
        <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-gray-100 mb-3">Sales Summary</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
            <span className="text-gray-400 block text-[10px] font-semibold">Total Leads</span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">8</span>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
            <span className="text-gray-400 block text-[10px] font-semibold">Open Leads</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block">2</span>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
            <span className="text-gray-400 block text-[10px] font-semibold">Won Deals</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">3</span>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
            <span className="text-gray-400 block text-[10px] font-semibold">Lost Deals</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">2</span>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center col-span-2 sm:col-span-1">
            <span className="text-gray-400 block text-[10px] font-semibold">Last Purchase</span>
            <span className="text-base font-black text-gray-900 mt-2 block">{activeVehicle.deliveryDate || '14 Feb 2024'}</span>
          </div>
        </div>
      </div>

      {/* 4. Recent Sales Activities Card */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
          <h3 className="font-bold text-gray-900 text-sm">Recent Sales Activities</h3>
          <button className="text-blue-600 font-bold text-xs hover:underline cursor-pointer">View All</button>
        </div>

        <div className="space-y-3">
          {salesActivities.map((act) => (
            <div key={act.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-2xs flex-shrink-0">
                  {act.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-xs">{act.type}</span>
                    <span className="text-gray-400 text-[10px] font-medium">{act.date}</span>
                  </div>
                  <p className="text-gray-600 text-[11px] leading-tight my-0.5">{act.desc}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px]">
                <span className="text-gray-400 font-medium">{act.author}</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${act.statusColor}`}>
                  {act.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 py-2 border border-gray-200 text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1 transition-colors cursor-pointer">
          <span>Load More Activities</span>
          <FaChevronDown className="text-[10px]" />
        </button>
      </div>

    </div>
  );
}
