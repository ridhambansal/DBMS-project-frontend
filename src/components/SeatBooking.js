// src/components/SeatBookings.js
import React, { useEffect, useState } from 'react';
import {
  Container,
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
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  getFloors,
  getAvailableSeats,
  getSeatBookings,
  createSeatBooking,
  updateSeatBooking,
  deleteSeatBooking,
} from '../services/api';
import { getUser } from '../services/api';

export default function SeatBookings() {
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

  // Load initial data
  const loadBookings = async () => {
    try {
      const data = await getSeatBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadFloors = async () => {
    try {
      const data = await getFloors();
      setFloors(data.map(f => f.floor_number));
    } catch (err) {
      console.error(err);
    }
  };

  const loadAvailableSeats = async (floor) => {
    if (!floor) {
      setAvailableSeats([]);
      return;
    }
    try {
      const data = await getAvailableSeats(floor);
      setAvailableSeats(data.map(s => s.seat_number));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBookings();
    loadFloors();
  }, []);

  // When floor changes, update seats
  useEffect(() => {
    loadAvailableSeats(form.floor_number);
    setForm(f => ({ ...f, seat_number: '' }));
  }, [form.floor_number]);

  const resetForm = () => {
    setForm({ seat_number: '', floor_number: '', booking_date: '', details: '' });
    setEditId(null);
  };

  const handleEdit = (booking) => {
    setEditId(booking.booking_id);
    setForm({
      seat_number: booking.seat_number,
      floor_number: booking.floor_number,
      booking_date: booking.booking_date.slice(0,16),
      details: booking.details,
    });
    // ensure availableSeats covers this
    loadAvailableSeats(booking.floor_number);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      await deleteSeatBooking(id);
      loadBookings();
      loadAvailableSeats(form.floor_number);
      if (editId === id) resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isoDate = new Date(form.booking_date).toISOString();
    const payload = {
      user_id: user.user_id,
      seat_number: Number(form.seat_number),
      floor_number: Number(form.floor_number),
      booking_date: isoDate,
      details: form.details,
    };

    try {
      if (editId) {
        await updateSeatBooking(editId, payload);
      } else {
        await createSeatBooking(payload);
      }
      loadBookings();
      loadAvailableSeats(form.floor_number);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        {editId ? 'Edit Booking' : 'New Booking'}
      </Typography>
      <Paper sx={{ p: 2, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Floor</InputLabel>
                <Select
                  value={form.floor_number}
                  label="Floor"
                  required
                  onChange={e => setForm(f => ({ ...f, floor_number: e.target.value }))}
                >
                  {floors.map(f => (
                    <MenuItem key={f} value={f}>{`Floor ${f}`}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={!form.floor_number}>
                <InputLabel>Seat</InputLabel>
                <Select
                  value={form.seat_number}
                  label="Seat"
                  required
                  onChange={e => setForm(f => ({ ...f, seat_number: e.target.value }))}
                >
                  {availableSeats.map(s => (
                    <MenuItem key={s} value={s}>{`Seat ${s}`}</MenuItem>
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
              onChange={e => setForm(f => ({ ...f, booking_date: e.target.value }))}
            />
            <TextField
              label="Details"
              multiline
              rows={2}
              required
              value={form.details}
              onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
            />

            <Stack direction="row" spacing={2}>
              <Button variant="contained" type="submit">
                {editId ? 'Update' : 'Book Seat'}
              </Button>
              {editId && (
                <Button onClick={resetForm} color="secondary">
                  Cancel
                </Button>
              )}
            </Stack>
          </Stack>
        </form>
      </Paper>

      <Typography variant="h6" gutterBottom>
        My Seat Bookings
      </Typography>
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
              <TableRow key={b.booking_id}>
                <TableCell>{b.booking_id}</TableCell>
                <TableCell>{b.floor_number}</TableCell>
                <TableCell>{b.seat_number}</TableCell>
                <TableCell>{new Date(b.booking_date).toLocaleString()}</TableCell>
                <TableCell>{b.details}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(b)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(b.booking_id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No bookings yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
