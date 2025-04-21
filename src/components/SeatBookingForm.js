import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert
} from '@mui/material';
import {
  getFloors,
  getAvailableSeats,
  createSeatBooking,
} from '../services/api';
import { getUser } from '../services/api';

export default function SeatBookingForm({ onBookingSuccess }) {
  const user = getUser();
  const [floors, setFloors] = useState([]);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [form, setForm] = useState({
    seat_number: '',
    floor_number: '',
    booking_date: '',
    details: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    loadFloors();
  }, []);

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

  const loadAvailableSeats = async (floor) => {
    if (!floor) {
      setAvailableSeats([]);
      return;
    }
    try {
      const data = await getAvailableSeats(floor);
      const arr = Array.isArray(data) ? data : [data];
      setAvailableSeats(arr.map(s => s.seat_number));
    } catch (err) {
      console.error(err);
      setError('Failed to load available seats');
    }
  };
  useEffect(() => {
    loadAvailableSeats(form.floor_number);
    setForm(f => ({ ...f, seat_number: '' }));
  }, [form.floor_number]);

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
      await createSeatBooking(payload);
      setSuccess('Seat booked successfully!');
      setForm({
        seat_number: '',
        floor_number: '',
        booking_date: '',
        details: '',
      });
      setTimeout(() => {
        if (onBookingSuccess) {
          onBookingSuccess();
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Failed to book seat: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
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

          <Button variant="contained" type="submit">
            Book Seat
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}