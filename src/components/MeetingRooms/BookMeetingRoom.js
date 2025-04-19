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
  Container,
  MenuItem,
  Select,
  FormControl,
  Paper,
  Chip,
  Stack
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { bookMeetingRoom, getUser, getUsers } from '../../services/api';

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const currentUser = getUser();

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
    setDropdownOpen(false);
  };

  const handleRemoveParticipant = (userId) => {
    setSelectedParticipants(selectedParticipants.filter(p => p.user_id !== userId));
  };

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Book Meeting Room
      </Typography>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {safeRoom.room_name} - Floor {safeRoom.floor_number}
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Capacity: {safeRoom.capacity} people
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ my: 2 }}>
          {success}
        </Alert>
      )}
      
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ ml: 1 }}>
                Meeting Date & Time
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  value={formik.values.booking_date}
                  onChange={(newValue) => {
                    formik.setFieldValue('booking_date', newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={formik.touched.booking_date && Boolean(formik.errors.booking_date)}
                      helperText={formik.touched.booking_date && formik.errors.booking_date}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px'
                        } 
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ ml: 1 }}>
                Meeting Details
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Meeting Details"
                id="details"
                name="details"
                value={formik.values.details}
                onChange={formik.handleChange}
                error={formik.touched.details && Boolean(formik.errors.details)}
                helperText={formik.touched.details && formik.errors.details}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '4px'
                  } 
                }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ ml: 1, color: 'primary.main' }}>
                Participants
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Select
                  displayEmpty
                  value=""
                  onChange={handleParticipantSelect}
                  open={dropdownOpen}
                  onOpen={() => setDropdownOpen(true)}
                  onClose={() => setDropdownOpen(false)}
                  renderValue={() => "Add"}
                  sx={{ 
                    height: '50px',
                    border: '1px solid #1976d2',
                    borderRadius: '4px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    }
                  }}
                >
                  {loadingUsers ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading users...
                    </MenuItem>
                  ) : (
                    users
                      .filter(user => !selectedParticipants.some(p => p.user_id === user.user_id))
                      .map(user => (
                        <MenuItem key={user.user_id} value={user.user_id}>
                          {user.first_name} {user.last_name} ({user.email_id})
                        </MenuItem>
                      ))
                  )}
                </Select>
              </FormControl>
              
              {selectedParticipants.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2, minHeight: '50px' }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {selectedParticipants.map((user) => (
                      <Chip
                        key={user.user_id}
                        label={`${user.first_name} ${user.last_name}`}
                        onDelete={() => handleRemoveParticipant(user.user_id)}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Stack>
                </Paper>
              )}
              
              {selectedParticipants.length === 0 && (
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    minHeight: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No participants selected
                  </Typography>
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="text"
            onClick={onBookingComplete}
            sx={{ 
              color: '#1976d2',
              textTransform: 'uppercase',
              fontWeight: 'bold'
            }}
          >
            CANCEL
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ 
              py: 1.5,
              px: 4,
              backgroundColor: '#000',
              color: '#fff',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#333',
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'BOOK MEETING ROOM'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default BookMeetingRoom;