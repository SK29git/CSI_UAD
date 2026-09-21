import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ComplaintsDashboardPage from './pages/ComplaintsDashboardPage';
import ServiceBookingPage from './pages/ServiceBookingPage';
import FeedbackPage from './pages/FeedbackPage';
import SalesPage from './pages/SalesPage';

export default function App() {
  return (
    <Router basename="/CSI_UAD">
      <Routes>
        <Route path="/" element={<ComplaintsDashboardPage />} />
        <Route path="/complaints" element={<ComplaintsDashboardPage />} />
        <Route path="/service" element={<ServiceBookingPage />} />
        <Route path="/service-booking" element={<ServiceBookingPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
