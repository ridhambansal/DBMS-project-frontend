import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  fetchCafes,
  fetchCafeBookings,
  checkCafeAvailability,
  bookCafe,
  updateCafeBooking,
  cancelCafeBooking,
} from '../services/api';
import { getUser } from '../services/api';

export default function CafeBooking() {
  const user = getUser();
  const [cafes, setCafes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    cafe_name: '',
    booking_date: '',
    details: '',
  });
  const [bookingId, setBookingId] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Load cafes and bookings on mount
  useEffect(() => {
    (async () => {
      try {
        const [cafelist, bookinglist] = await Promise.all([
          fetchCafes(),
          fetchCafeBookings(user.user_id),
        ]);
        setCafes(cafelist);
        setBookings(bookinglist);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      }
    })();
  }, [user.user_id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const isoDate = (dt) => new Date(dt).toISOString();

  const onCheck = async () => {
    try {
      setError(null);
      const res = await checkCafeAvailability({
        cafe_name: form.cafe_name,
        booking_date: isoDate(form.booking_date),
      });
      setAvailability(res.available);
      setMessage(null);
    } catch (err) {
      setError(err.message || 'Availability check failed');
    }
  };

  const refreshBookings = async () => {
    const list = await fetchCafeBookings(user.user_id);
    setBookings(list);
  };

  const onBook = async () => {
    try {
      setError(null);
      const res = await bookCafe({
        user_id: user.user_id,
        cafe_name: form.cafe_name,
        booking_date: isoDate(form.booking_date),
        details: form.details,
      });
      setBookingId(res['Booking ID']);
      setMessage(res.Status);
      await refreshBookings();
    } catch (err) {
      setError(err.message || 'Booking failed');
    }
  };

  const onEdit = (b) => {
    setForm({
      cafe_name: b.cafe_name,
      booking_date: new Date(b.booking_date).toISOString().slice(0,16),
      details: b.details,
    });
    setBookingId(b.booking_id);
    setAvailability(null);
    setMessage(null);
    setError(null);
  };

  const onUpdate = async () => {
    if (!bookingId) return;
    try {
      setError(null);
      await updateCafeBooking(bookingId, {
        user_id: user.user_id,
        booking_date: isoDate(form.booking_date),
        details: form.details,
      });
      setMessage('Updated successfully');
      await refreshBookings();
    } catch (err) {
      setError(err.message || 'Update failed');
    }
  };

  const onCancel = async (id = null) => {
    const bid = id || bookingId;
    if (!bid) return;
    try {
      setError(null);
      const res = await cancelCafeBooking(bid, { user_id: user.user_id });
      setMessage(res.Status);
      setBookingId(null);
      setAvailability(null);
      setForm({ cafe_name: '', booking_date: '', details: '' });
      await refreshBookings();
    } catch (err) {
      setError(err.message || 'Cancel failed');
    }
  };

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Typography variant="h5" mb={2}>
        Café Booking
      </Typography>

      <Paper sx={{ mb: 2, p: 2 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="cafe-label">Select Café</InputLabel>
          <Select
            labelId="cafe-label"
            name="cafe_name"
            value={form.cafe_name}
            label="Select Café"
            onChange={handleChange}
          >
            {cafes.map((c) => (
              <MenuItem key={c.name} value={c.name}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Booking Date & Time"
          name="booking_date"
          type="datetime-local"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={form.booking_date}
          onChange={handleChange}
        />

        <TextField
          label="Details"
          name="details"
          fullWidth
          margin="normal"
          multiline
          rows={2}
          value={form.details}
          onChange={handleChange}
        />

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button variant="outlined" onClick={onCheck}>
            Check Availability
          </Button>
          <Button variant="contained" onClick={onBook}>
            {bookingId ? 'Save New Booking' : 'Book Café'}
          </Button>
          {bookingId && (
            <>
              <Button variant="outlined" onClick={onUpdate}>
                Update
              </Button>
              <Button variant="outlined" color="error" onClick={() => onCancel(bookingId)}>
                Delete
              </Button>
            </>
          )}
        </Box>

        {availability !== null && (
          <Alert severity={availability ? 'success' : 'warning'} sx={{ mt: 2 }}>
            {availability ? 'Slot is available' : 'Slot is NOT available'}
          </Alert>
        )}

        {message && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      <Typography variant="h6" mb={1}>
        Your Bookings
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Café</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((b) => (
              <TableRow key={b.booking_id} hover>
                <TableCell>{b.booking_id}</TableCell>
                <TableCell>{b.cafe_name}</TableCell>
                <TableCell>
                  {new Date(b.booking_date).toLocaleString()}
                </TableCell>
                <TableCell>{b.details}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => onEdit(b)}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => onCancel(b.booking_id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}