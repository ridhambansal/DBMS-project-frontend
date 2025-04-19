import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  TextField,
  Popover,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { getMeetingRoomBookings, cancelMeetingRoomBooking, getUser } from '../../services/api';

const MeetingRoomBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [participantsAnchorEl, setParticipantsAnchorEl] = useState(null);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  
  const currentUser = getUser();

  // Use useCallback to memoize the fetchBookings function
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const data = await getMeetingRoomBookings(currentUser.user_id, formattedDate);
      setBookings(data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
      setLoading(false);
    }
  }, [selectedDate, currentUser.user_id]);

  // Now include fetchBookings in the dependency array
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const handleCancelBooking = (booking) => {
    setBookingToCancel(booking);
    setOpenCancelDialog(true);
  };

  const confirmCancelBooking = async () => {
    try {
      setLoading(true);
      await cancelMeetingRoomBooking(bookingToCancel.booking_id);
      setOpenCancelDialog(false);
      fetchBookings();
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
      setLoading(false);
    }
  };

  const isCreator = (booking) => {
    return booking.user_id === currentUser.user_id;
  };

  const handleParticipantsClick = (event, participants) => {
    setParticipantsAnchorEl(event.currentTarget);
    setSelectedParticipants(participants);
  };

  const handleParticipantsClose = () => {
    setParticipantsAnchorEl(null);
  };

  const openParticipants = Boolean(participantsAnchorEl);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Meeting Room Bookings
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Filter by Date"
            value={selectedDate}
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : bookings.length === 0 ? (
        <Alert severity="info">
          No bookings found for the selected date.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="15%">Room</TableCell>
                <TableCell width="10%">Floor</TableCell>
                <TableCell width="15%">Date & Time</TableCell>
                <TableCell width="20%">Details</TableCell>
                <TableCell width="15%">Organized By</TableCell>
                <TableCell width="15%">Participants</TableCell>
                <TableCell width="10%">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.booking_id}>
                  <TableCell>{booking.room_name}</TableCell>
                  <TableCell>{booking.floor_name}</TableCell>
                  <TableCell>
                    {format(new Date(booking.booking_date), 'MMM dd, yyyy hh:mm a')}
                  </TableCell>
                  <TableCell>{booking.details}</TableCell>
                  <TableCell>
                    {`${booking.first_name} ${booking.last_name}`}
                    {isCreator(booking) && (
                      <Chip size="small" label="You" color="primary" sx={{ ml: 1 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    {booking.participants && booking.participants.length > 0 ? (
                      <>
                        <Box sx={{ mb: 1 }}>
                          {booking.participants.slice(0, 2).map((p) => (
                            <Chip 
                              key={p.user_id}
                              size="small" 
                              label={`${p.first_name} ${p.last_name}`} 
                              sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                          ))}
                        </Box>
                        {booking.participants.length > 2 && (
                          <Button
                            variant="text"
                            onClick={(e) => handleParticipantsClick(e, booking.participants)}
                            size="small"
                            sx={{ textTransform: 'none', p: 0 }}
                          >
                            +{booking.participants.length - 2} more
                          </Button>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No participants
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {isCreator(booking) && (
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small"
                        onClick={() => handleCancelBooking(booking)}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Participants Popover */}
      <Popover
        open={openParticipants}
        anchorEl={participantsAnchorEl}
        onClose={handleParticipantsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 2, maxWidth: 400, maxHeight: 300, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            All Participants ({selectedParticipants.length})
          </Typography>
          <List dense>
            {selectedParticipants.map((participant) => (
              <ListItem key={participant.user_id}>
                <ListItemText 
                  primary={`${participant.first_name} ${participant.last_name}`}
                  secondary={participant.email_id}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Popover>
      
      {/* Cancel Booking Dialog */}
      <Dialog
        open={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
      >
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>No, Keep It</Button>
          <Button onClick={confirmCancelBooking} color="error" autoFocus>
            Yes, Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MeetingRoomBookings;