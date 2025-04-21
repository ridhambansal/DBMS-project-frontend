import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  Grid,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { bookMeetingRoom, getUser, getUsers } from '../../services/api';

// Import icons
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const validationSchema = Yup.object({
  booking_date: Yup.date().required('Meeting date and time is required'),
  details: Yup.string().required('Meeting details are required'),
});

const BookMeetingRoom = ({ room, onBookingComplete }) => {
  // Add safe default values if room is undefined
  const safeRoom = room || { 
    room_name: 'Unknown Room', 
    floor_number: 0, 
    capacity: 0,
    room_id: 0
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  
  const currentUser = getUser();
  
  // Always count the current user as a participant
  const totalParticipants = selectedParticipants.length + 1; // +1 for current user
  const isOverCapacity = totalParticipants > safeRoom.capacity;

  // Fetch users from the database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const fetchedUsers = await getUsers();
        // Filter out the current user from the list
        const filteredUsers = fetchedUsers.filter(user => user.user_id !== currentUser.user_id);
        setUsers(filteredUsers);
      } catch (err) {
        setError('Failed to load users. Please try again.');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [currentUser.user_id]);

  const formik = useFormik({
    initialValues: {
      booking_date: new Date(),
      details: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Check if capacity is exceeded
        if (isOverCapacity) {
          setError(`Cannot book room. The number of participants (${totalParticipants}) exceeds room capacity (${safeRoom.capacity}).`);
          return;
        }
        
        setLoading(true);
        setError('');
        
        // Format date manually to MySQL format
        const date = values.booking_date;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        
        const bookingData = {
          user_id: currentUser.user_id,
          room_id: safeRoom.room_id,
          booking_date: formattedDate,
          details: values.details,
          participants: selectedParticipants.map(p => p.user_id)
        };
        
        await bookMeetingRoom(bookingData);
        setSuccess('Meeting room booked successfully!');
        
        setTimeout(() => {
          if (onBookingComplete) {
            onBookingComplete();
          }
        }, 1500);
      } catch (err) {
        setError(err.message || 'Failed to book meeting room');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleParticipantSelect = (event) => {
    const userId = event.target.value;
    if (userId) {
      const selectedUser = users.find(user => user.user_id === userId);
      if (selectedUser && !selectedParticipants.some(p => p.user_id === userId)) {
        setSelectedParticipants([...selectedParticipants, selectedUser]);
      }
    }
  };

  const handleRemoveParticipant = (userId) => {
    setSelectedParticipants(selectedParticipants.filter(p => p.user_id !== userId));
  };

  return (
    <Paper sx={{ maxWidth: '800px', mx: 'auto', my: 2, p: 3, borderRadius: 2 }}>
      {/* Header with room info */}
      <Box sx={{ 
        pb: 2, 
        mb: 3, 
        borderBottom: '1px solid #e0e0e0', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MeetingRoomIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Book: {safeRoom.room_name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1.5 }}>
            <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              Floor {safeRoom.floor_number}
            </Typography>
          </Box>
        </Box>
        
        <Chip 
          icon={<PeopleIcon />}
          label={`${totalParticipants}/${safeRoom.capacity}`}
          color={isOverCapacity ? "error" : "primary"}
          variant="outlined"
        />
      </Box>
      
      {/* Alerts */}
      {(error || success || isOverCapacity) && (
        <Box sx={{ mb: 3 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          {isOverCapacity && !error && (
            <Alert severity="warning">
              Participants exceed room capacity
            </Alert>
          )}
        </Box>
      )}
      
      {/* Main form */}
      <Box component="form" onSubmit={formik.handleSubmit}>
        <Grid container spacing={4}>
          {/* Left side - Date & Details */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Date & Time
            </Typography>
            
            <Box sx={{ 
              border: '1px solid #ddd', 
              borderRadius: 1, 
              p: 1, 
              mb: 3,
              display: 'flex',
              alignItems: 'center'
            }}>
              <TextField
                fullWidth
                variant="standard"
                value={formik.values.booking_date ? new Date(formik.values.booking_date).toLocaleString() : ''}
                InputProps={{
                  readOnly: true,
                  disableUnderline: true,
                }}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  value={formik.values.booking_date}
                  onChange={(newValue) => {
                    formik.setFieldValue('booking_date', newValue);
                  }}
                  components={{
                    OpenPickerIcon: CalendarTodayIcon
                  }}
                  renderInput={({ inputRef, inputProps, InputProps }) => (
                    <IconButton ref={inputRef}>
                      <CalendarTodayIcon color="primary" />
                    </IconButton>
                  )}
                />
              </LocalizationProvider>
            </Box>
            
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Meeting Details
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={5}
              placeholder="Enter meeting details and agenda"
              id="details"
              name="details"
              value={formik.values.details}
              onChange={formik.handleChange}
              error={formik.touched.details && Boolean(formik.errors.details)}
              helperText={formik.touched.details && formik.errors.details}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* Right side - Participants */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Participants
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="participant-label">Add Participant</InputLabel>
              <Select
                labelId="participant-label"
                label="Add Participant"
                displayEmpty
                value=""
                onChange={handleParticipantSelect}
                disabled={isOverCapacity}
              >
                {loadingUsers ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Loading users...
                  </MenuItem>
                ) : (
                  users
                    .filter(user => !selectedParticipants.some(p => p.user_id === user.user_id))
                    .map(user => (
                      <MenuItem key={user.user_id} value={user.user_id}>
                        {user.first_name} {user.last_name}
                      </MenuItem>
                    ))
                )}
              </Select>
            </FormControl>
            
            <Box sx={{ 
              p: 2,
              mb: 2,
              minHeight: '100px',
              border: '1px solid #e0e0e0',
              borderRadius: 1
            }}>
              {/* Current user */}
              <Chip
                label={`You (${currentUser.first_name})`}
                color="primary"
                sx={{ m: 0.5 }}
              />
              
              {/* Selected participants */}
              {selectedParticipants.map((user) => (
                <Chip
                  key={user.user_id}
                  label={`${user.first_name} ${user.last_name}`}
                  onDelete={() => handleRemoveParticipant(user.user_id)}
                  sx={{ m: 0.5 }}
                />
              ))}
              
              {/* Message when no additional participants */}
              {selectedParticipants.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No additional participants
                </Typography>
              )}
            </Box>
            
            <Alert 
              severity="info" 
              icon={<PeopleIcon />}
              sx={{ mb: 2 }}
            >
              You are automatically included as a participant
            </Alert>
          </Grid>
        </Grid>
        
        <Divider sx={{ mt: 2, mb: 3 }} />
        
        {/* Footer with actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={onBookingComplete}
            sx={{ textTransform: 'uppercase' }}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            disabled={loading || isOverCapacity}
            startIcon={loading ? <CircularProgress size={16} /> : <AccessTimeIcon />}
            sx={{ 
              textTransform: 'uppercase',
              bgcolor: '#1976d2',
              '&:hover': {
                bgcolor: '#1565c0',
              }
            }}
          >
            {loading ? 'Booking...' : 'Book Room'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default BookMeetingRoom;