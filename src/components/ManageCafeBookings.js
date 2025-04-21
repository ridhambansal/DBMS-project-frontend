import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stack
} from '@mui/material';
import {
  fetchCafes,
  fetchCafeBookings,
  checkCafeAvailability,
  updateCafeBooking,
  cancelCafeBooking,
} from '../services/api';
import { getUser } from '../services/api';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

export default function ManageCafeBookings() {
  const user = getUser();
  const [bookings, setBookings] = useState([]);
  const [cafes, setCafes] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [editForm, setEditForm] = useState({
    cafe_name: '',
    booking_date: '',
    details: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load cafes and bookings
  useEffect(() => {
    loadCafes();
    loadBookings();
  }, []);

  const loadCafes = async () => {
    try {
      const cafelist = await fetchCafes();
      setCafes(cafelist);
    } catch (err) {
      setError(err.message || 'Failed to load cafes');
    }
  };

  const loadBookings = async () => {
    try {
      const bookinglist = await fetchCafeBookings(user.user_id);
      const bookingsArray = Array.isArray(bookinglist) ? bookinglist : [bookinglist];
      
      // Sort bookings by date (newest first)
      bookingsArray.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
      
      setBookings(bookingsArray);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Check if booking is in the past
  const isPastBooking = (dateString) => {
    return new Date(dateString) < new Date();
  };

  // Handle edit booking
  const handleEdit = (booking) => {
    setCurrentBooking(booking);
    setEditForm({
      cafe_name: booking.cafe_name,
      booking_date: new Date(booking.booking_date).toISOString().slice(0, 16),
      details: booking.details,
    });
    setEditDialogOpen(true);
  };

  const handleFormChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async () => {
    if (!editForm.cafe_name || !editForm.booking_date || !editForm.details) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await updateCafeBooking(currentBooking.booking_id, {
        user_id: user.user_id,
        cafe_name: editForm.cafe_name,
        booking_date: new Date(editForm.booking_date).toISOString(),
        details: editForm.details,
      });
      
      setSuccess('Booking updated successfully');
      setEditDialogOpen(false);
      loadBookings();
      
      // Clear success message after a delay
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Update failed');
    }
  };

  // Handle delete booking
  const handleDelete = (booking) => {
    setCurrentBooking(booking);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await cancelCafeBooking(currentBooking.booking_id, { 
        user_id: user.user_id 
      });
      
      setSuccess('Booking canceled successfully');
      setDeleteDialogOpen(false);
      loadBookings();
      
      // Clear success message after a delay
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Cancel failed');
    }
  };

  return (
    <Box>
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
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cafe</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Details</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow 
                key={booking.booking_id} 
                hover
                sx={{ 
                  opacity: isPastBooking(booking.booking_date) ? 0.6 : 1 
                }}
              >
                <TableCell>{booking.booking_id}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {booking.cafe_name}
                  </Typography>
                </TableCell>
                <TableCell>{formatDate(booking.booking_date)}</TableCell>
                <TableCell>{booking.details}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    onClick={() => handleEdit(booking)}
                    disabled={isPastBooking(booking.booking_date)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDelete(booking)}
                    disabled={isPastBooking(booking.booking_date)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Cafe Booking</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="cafe-label">Cafe</InputLabel>
              <Select
                labelId="cafe-label"
                name="cafe_name"
                value={editForm.cafe_name}
                label="Cafe"
                onChange={handleFormChange}
              >
                {cafes.map((cafe) => (
                  <MenuItem key={cafe.name} value={cafe.name}>
                    {cafe.name}
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
              value={editForm.booking_date}
              onChange={handleFormChange}
            />

            <TextField
              label="Details"
              name="details"
              multiline
              rows={3}
              fullWidth
              value={editForm.details}
              onChange={handleFormChange}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this cafe booking? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            No, Keep It
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Yes, Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}