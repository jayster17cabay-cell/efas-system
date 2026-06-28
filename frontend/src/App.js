import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Home from './pages/Home';
import ScanResult from './pages/ScanResult';
import Complaint from './pages/Complaint';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Rating from './pages/Rating';
import DriverPortal from './pages/DriverPortal';

// ── Guard: redirect mobile to /driver ────────────────────────────────────────
function DesktopOnly({ children }) {
  // useMemo para hindi mag-re-evaluate sa bawat re-render (keyboard open/close)
  const mobile = useMemo(() =>
    /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent),
  []);

  if (mobile) {
    return <Navigate to="/driver" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/"                     element={<Home />} />
        <Route path="/scan/:qrCode"         element={<ScanResult />} />
        <Route path="/complaint/:qrCode"    element={<Complaint />} />
        <Route path="/rate/:qrCode/:tripId" element={<Rating />} />
        <Route path="/driver"               element={<DriverPortal />} />

        {/* Desktop only — phone ay diretso redirect sa /driver */}
        <Route path="/login" element={<DesktopOnly><Login /></DesktopOnly>} />
        <Route path="/admin" element={<DesktopOnly><AdminDashboard /></DesktopOnly>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;