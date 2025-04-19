import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Container,
  Dialog,
  DialogContent,
  CircularProgress,
  Alert
} from '@mui/material';
import { getMeetingRooms } from '../../services/api';
import BookMeetingRoom from './BookMeetingRoom';

const MeetingRoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await getMeetingRooms();
        
        // Group rooms by floor
        const roomsByFloor = data.reduce((acc, room) => {
          if (!acc[room.floor_number]) {
            acc[room.floor_number] = {
              floor_number: room.floor_number,
              floor_name: room.floor_name,
              rooms: []
            };
          }
          acc[room.floor_number].rooms.push(room);
          return acc;
        }, {});

        setRooms(Object.values(roomsByFloor));
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load meeting rooms');
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
    setOpenBookingDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenBookingDialog(false);
    // Clear the selected room after the dialog closes
    setTimeout(() => {
      setSelectedRoom(null);
    }, 300);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Meeting Rooms
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {rooms.length === 0 ? (
        <Typography>No meeting rooms available.</Typography>
      ) : (
        rooms.map((floor) => (
          <Box key={floor.floor_number} sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {floor.floor_name} (Floor {floor.floor_number})
            </Typography>
            
            <Grid container spacing={3}>
              {floor.rooms.map((room) => (
                <Grid item xs={12} sm={6} md={4} key={room.room_id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" component="h3">
                        {room.room_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Capacity: {room.capacity} people
                      </Typography>
                      <Button 
                        variant="contained" 
                        onClick={() => handleBookRoom(room)}
                        sx={{ 
                          mt: 2,
                          backgroundColor: '#111',
                          '&:hover': {
                            backgroundColor: '#333',
                          }
                        }}
                      >
                        Book Room
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}
      
      <Dialog 
        open={openBookingDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogContent>
          {selectedRoom ? (
            <BookMeetingRoom 
              room={selectedRoom} 
              onBookingComplete={handleCloseDialog} 
            />
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Loading room information...
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default MeetingRoomList;