import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import MeetingRoomList from './components/MeetingRooms/MeetingRoomList';
import MeetingRoomBookings from './components/MeetingRooms/MeetingRoomBookings';
import Events from './components/Events';
import { CssBaseline } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CafeBooking from './components/CafeBooking'
import SeatBookings from './components/SeatBooking'; 
import AdminMeetingRoom from './components/Admin/AdminMeetingRoom';
import AdminFloor       from './components/Admin/AdminFloor';
import AdminCafe        from './components/Admin/AdminCafe';
import AdminHome from './components/Admin/AdminHome';

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Router>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/meeting-rooms" element={<MeetingRoomList />} />
          <Route path="/my-bookings" element={<MeetingRoomBookings />} />
          <Route path="/events" element={<Events />} />
          <Route path="/cafeteria" element={<CafeBooking />} />
          <Route path="/seat-booking" element={<SeatBookings/>} />
          <Route path="/admin/meeting-rooms" element={<AdminMeetingRoom />} />
          <Route path="/admin/floor"           element={<AdminFloor />} />
          <Route path="/admin/cafe"            element={<AdminCafe />} />
          <Route path="/admin" element={<AdminHome />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </LocalizationProvider>
  );
}

export default App;
