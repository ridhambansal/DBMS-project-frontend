import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/DashboardWithSidebar';
import { CssBaseline } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import AdminMeetingRoom from './components/Admin/AdminMeetingRoom';
import AdminFloor from './components/Admin/AdminFloor';
import AdminCafe from './components/Admin/AdminCafe';
import AdminHome from './components/Admin/AdminHome';

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Router>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Routes that use the dashboard with sidebar layout */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/meeting-rooms" element={<Dashboard />} />
          <Route path="/my-bookings" element={<Dashboard />} />
          <Route path="/events" element={<Dashboard />} />
          <Route path="/cafeteria" element={<Dashboard />} />
          <Route path="/seat-booking" element={<Dashboard />} />
          <Route path="/notifications" element={<Dashboard />} />
          
          {/* Admin routes */}
          <Route path="/admin/meeting-rooms" element={<AdminMeetingRoom />} />
          <Route path="/admin/floor" element={<AdminFloor />} />
          <Route path="/admin/cafe" element={<AdminCafe />} />
          <Route path="/admin" element={<AdminHome />} />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </LocalizationProvider>
  );
}

export default App;