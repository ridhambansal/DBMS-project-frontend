import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  Typography,
  Box
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  getFloors,
  getAvailableSeats,
  getSeatBookings,
  updateSeatBooking,
  deleteSeatBooking,
} from '../services/api';
import { getUser } from '../services/api';

export default function ManageSeatBookings() {
  const user = getUser();
  const [bookings, setBookings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [form, setForm] = useState({
    seat_number: '',
    floor_number: '',
    booking_date: '',
    details: '',
  });
  const [editId, setEditId] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load initial data
  const loadBookings = async () => {
    try {
      const data = await getSeatBookings(user.user_id);
      console.log("🔍 raw seat‑bookings payload:", data);
      const arr = Array.isArray(data) ? data : [data];
      setBookings(arr);
    } catch (err) {
      console.error(err);
      setError('Failed to load bookings');
    }
  };

  const loadFloors = async () => {
    try {
      const data = await getFloors();
      const arr = Array.isArray(data) ? data : [data];
      setFloors(arr.map(f => f.floor_number));
    } catch (err) {
      console.error(err);
      setError('Failed to load floors');
    }
  };

  const loadAvailableSeats = async (floor, currentSeat = null) => {
    if (!floor) {
      setAvailableSeats([]);
      return;
    }
    try {
      const data = await getAvailableSeats(floor);
      const arr = Array.isArray(data) ? data : [data];
      
      // Include the current seat in the available options
      let availableList = arr.map(s => s.seat_number);
      if (currentSeat && !availableList.includes(currentSeat)) {
        availableList.push(currentSeat);
      }
      
      setAvailableSeats(availableList);
    } catch (err) {
      console.error(err);
      setError('Failed to load available seats');
    }
  };

  useEffect(() => {
    loadBookings();
    loadFloors();
  }, []);

  const handleEdit = (booking) => {
    setEditId(booking.booking_id);
    setForm({
      seat_number: booking.seat_number,
      floor_number: booking.floor_number,
      booking_date: new Date(booking.booking_date).toISOString().slice(0,16),
      details: booking.details,
    });
    // Load available seats, including the current seat
    loadAvailableSeats(booking.floor_number, booking.seat_number);
    setEditDialogOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteSeatBooking(deleteId);
      loadBookings();
      setDeleteDialogOpen(false);
      setSuccess('Booking deleted successfully');
      
      // Clear success message after a delay
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to delete booking: ' + (err.message || 'Unknown error'));
    }
  };

  const handleFormChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    
    // If floor changes, update available seats
    if (field === 'floor_number') {
      loadAvailableSeats(value);
      setForm(f => ({ ...f, seat_number: '' }));
    }
  };

  const handleUpdate = async () => {
    const isoDate = new Date(form.booking_date).toISOString();
    const payload = {
      user_id: user.user_id,
      seat_number: Number(form.seat_number),
      floor_number: Number(form.floor_number),
      booking_date: isoDate,
      details: form.details,
    };

    try {
      await updateSeatBooking(editId, payload);
      loadBookings();
      setEditDialogOpen(false);
      setSuccess('Booking updated successfully');
      
      // Clear success message after a delay
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to update booking: ' + (err.message || 'Unknown error'));
    }
  };

  // Helper to check if booking is in the past
  const isPastBooking = (bookingDate) => {
    return new Date(bookingDate) < new Date();
  };

  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Floor</TableCell>
              <TableCell>Seat</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Details</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map(b => (
              <TableRow 
                key={b.booking_id}
                sx={{ 
                  opacity: isPastBooking(b.booking_date) ? 0.6 : 1 
                }}
              >
                <TableCell>{b.booking_id}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    Floor {b.floor_number}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    Seat {b.seat_number}
                  </Typography>
                </TableCell>
                <TableCell>{new Date(b.booking_date).toLocaleString()}</TableCell>
                <TableCell>{b.details}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    onClick={() => handleEdit(b)}
                    disabled={isPastBooking(b.booking_date)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(b.booking_id)}
                    disabled={isPastBooking(b.booking_date)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {bookings.length === 0 && (
              <TableRow key="no-bookings">
                <TableCell colSpan={6} align="center">
                  No bookings yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Booking</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Floor</InputLabel>
                <Select
                  value={form.floor_number}
                  label="Floor"
                  required
                  onChange={e => handleFormChange('floor_number', e.target.value)}
                >
                  {floors.map(f => (
                    <MenuItem key={f} value={f}>Floor {f}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={!form.floor_number}>
                <InputLabel>Seat</InputLabel>
                <Select
                  value={form.seat_number}
                  label="Seat"
                  required
                  onChange={e => handleFormChange('seat_number', e.target.value)}
                >
                  {availableSeats.map(s => (
                    <MenuItem key={s} value={s}>Seat {s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <TextField
              label="Booking Date"
              type="datetime-local"
              required
              InputLabelProps={{ shrink: true }}
              value={form.booking_date}
              onChange={e => handleFormChange('booking_date', e.target.value)}
            />
            <TextField
              label="Details"
              multiline
              rows={2}
              required
              value={form.details}
              onChange={e => handleFormChange('details', e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} color="primary" variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this booking? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}