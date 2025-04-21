import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack
} from '@mui/material';
import {
  fetchCafes,
  checkCafeAvailability,
  bookCafe,
} from '../services/api';
import { getUser } from '../services/api';

export default function BookCafeForm({ onBookingSuccess }) {
  const user = getUser();
  const [cafes, setCafes] = useState([]);
  const [form, setForm] = useState({
    cafe_name: '',
    booking_date: '',
    details: '',
  });
  const [availability, setAvailability] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Load cafes on mount
  useEffect(() => {
    (async () => {
      try {
        const cafelist = await fetchCafes();
        setCafes(cafelist);
      } catch (err) {
        setError(err.message || 'Failed to load cafes');
      }
    })();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Reset availability check when form changes
    setAvailability(null);
  };

  const isoDate = (dt) => new Date(dt).toISOString();

  const onCheck = async () => {
    if (!form.cafe_name || !form.booking_date) {
      setError("Please select a cafe and date to check availability");
      return;
    }
    
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

  const onBook = async () => {
    if (!form.cafe_name || !form.booking_date || !form.details) {
      setError("Please fill in all fields");
      return;
    }
    
    try {
      setError(null);
      const res = await bookCafe({
        user_id: user.user_id,
        cafe_name: form.cafe_name,
        booking_date: isoDate(form.booking_date),
        details: form.details,
      });
      
      setMessage('Cafe booked successfully!');
      // Reset form
      setForm({
        cafe_name: '',
        booking_date: '',
        details: '',
      });
      setAvailability(null);
      
      // Notify parent component about successful booking
      setTimeout(() => {
        if (onBookingSuccess) {
          onBookingSuccess();
        }
      }, 1500);
      
    } catch (err) {
      setError(err.message || 'Booking failed');
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      
      {availability !== null && (
        <Alert severity={availability ? 'success' : 'warning'} sx={{ mb: 2 }}>
          {availability ? 'Selected time is available' : 'Selected time is NOT available'}
        </Alert>
      )}

      <Stack spacing={3}>
        <FormControl fullWidth>
          <InputLabel id="cafe-label">Select Cafe</InputLabel>
          <Select
            labelId="cafe-label"
            name="cafe_name"
            value={form.cafe_name}
            label="Select Cafe"
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
          InputLabelProps={{ shrink: true }}
          value={form.booking_date}
          onChange={handleChange}
        />

        <TextField
          label="Details"
          name="details"
          fullWidth
          multiline
          rows={3}
          placeholder="Enter details about your booking (e.g., number of people, special requests)"
          value={form.details}
          onChange={handleChange}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={onCheck}>
            Check Availability
          </Button>
          <Button 
            variant="contained" 
            onClick={onBook}
            disabled={availability === false}
          >
            Book Cafe
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}