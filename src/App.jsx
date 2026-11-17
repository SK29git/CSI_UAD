import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CustomerProvider } from './context/CustomerContext';
import { OrchestratorProvider } from './context/OrchestratorContext';
import HomePage from './pages/HomePage';
import ComplaintsDashboardPage from './pages/ComplaintsDashboardPage';
import ServiceBookingPage from './pages/ServiceBookingPage';
import FeedbackPage from './pages/FeedbackPage';
import SalesPage from './pages/SalesPage';
import IMEITrackerPage from './pages/IMEITrackerPage';
import EventHistoryPage from './pages/EventHistoryPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

export default function App() {
  return (
    <OrchestratorProvider>
      <CustomerProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/complaints" element={<ComplaintsDashboardPage />} />
            <Route path="/service" element={<ServiceBookingPage />} />
            <Route path="/service-booking" element={<ServiceBookingPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/tracker" element={<IMEITrackerPage />} />
            <Route path="/event-history" element={<EventHistoryPage />} />
            <Route path="/events" element={<EventHistoryPage />} />
            
            {/* Orchestrator Admin Portal */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/orchestrator" element={<Navigate to="/admin" replace />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CustomerProvider>
    </OrchestratorProvider>
  );
}
