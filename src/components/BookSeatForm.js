import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Typography,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  getFloors,
  getAvailableSeats,
  createSeatBooking,
  getUser
} from '../../services/api';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// Import icons
import ChairIcon from '@mui/icons-material/Chair';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';

const BookSeatForm = ({ onBookingSuccess }) => {
  const [floors, setFloors] = useState([]);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    seat_number: '',
    floor_number: '',
    booking_date: new Date(),
    details: '',
  });
  
  const user = getUser();

  useEffect(() => {
    loadFloors();
  }, []);

  useEffect(() => {
    if (form.floor_number) {
      loadAvailableSeats(form.floor_number);
    }
  }, [form.floor_number]);

  const loadFloors = async () => {
    try {
      setLoading(true);
      const data = await getFloors();
      const floorsList = Array.isArray(data) ? data : [data];
      setFloors(floorsList);
      setLoading(false);
    } catch (err) {
      setError('Failed to load floors. Please try again.');
      setLoading(false);
    }
  };

  const loadAvailableSeats = async (floor) => {
    try {
      setLoading(true);
      const data = await getAvailableSeats(floor);
      const seatsList = Array.isArray(data) ? data : [data];
      setAvailableSeats(seatsList.map(s => s.seat_number));
      setLoading(false);
    } catch (err) {
      setError('Failed to load available seats. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm({
      ...form,
      [field]: value
    });
    
    // Clear seat selection when floor changes
    if (field === 'floor_number') {
      setForm(prev => ({
        ...prev,
        seat_number: ''
      }));
    }
    
    // Clear any previous messages
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.floor_number || !form.seat_number || !form.booking_date || !form.details) {
      setError('Please fill in all fields.');
      return;
    }
    
    try {
      setLoading(true);
      
      const isoDate = new Date(form.booking_date).toISOString();
      const payload = {
        user_id: user.user_id,
        seat_number: Number(form.seat_number),
        floor_number: Number(form.floor_number),
        booking_date: isoDate,
        details: form.details,
      };
      
      await createSeatBooking(payload);
      
      setSuccess('Seat booked successfully!');
      setForm({
        seat_number: '',
        floor_number: '',
        booking_date: new Date(),
        details: '',
      });
      
      // Notify parent component about successful booking
      setTimeout(() => {
        if (onBookingSuccess) {
          onBookingSuccess();
        }
      }, 1500);
      
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to book seat. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            <LocationOnIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: '1.1rem' }} />
            Select Floor
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="floor-label">Floor</InputLabel>
            <Select
              labelId="floor-label"
              label="Floor"
              value={form.floor_number}
              onChange={(e) => handleChange('floor_number', e.target.value)}
              disabled={loading}
            >
              {floors.map((floor) => (
                <MenuItem key={floor.floor_number} value={floor.floor_number}>
                  {floor.floor_name || `Floor ${floor.floor_number}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            <ChairIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: '1.1rem' }} />
            Select Seat
          </Typography>
          <FormControl fullWidth disabled={!form.floor_number || loading}>
            <InputLabel id="seat-label">Seat</InputLabel>
            <Select
              labelId="seat-label"
              label="Seat"
              value={form.seat_number}
              onChange={(e) => handleChange('seat_number', e.target.value)}
            >
              {availableSeats.map((seat) => (
                <MenuItem key={seat} value={seat}>
                  Seat {seat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            <EventIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: '1.1rem' }} />
            Date & Time
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              value={form.booking_date}
              onChange={(newValue) => handleChange('booking_date', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  disabled={loading}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Details
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Enter booking details or purpose"
            value={form.details}
            onChange={(e) => handleChange('details', e.target.value)}
            disabled={loading}
          />
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !form.floor_number || !form.seat_number}
          startIcon={<ChairIcon />}
        >
          Book Seat
        </Button>
      </Box>
    </Box>
  );
};

export default BookSeatForm;