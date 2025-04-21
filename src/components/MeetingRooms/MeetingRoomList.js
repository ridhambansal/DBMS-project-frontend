import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  CardActions,
  Grid, 
  Container,
  Dialog,
  DialogContent,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Divider,
  InputAdornment,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton
} from '@mui/material';
import { getMeetingRooms, getUser } from '../../services/api';
import BookMeetingRoom from './BookMeetingRoom';
import BackButton from '../BackButton';

// Import icons
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const MeetingRoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState('all');
  const [capacityFilter, setCapacityFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('name');
  const [expandedFloor, setExpandedFloor] = useState(null);
  const [floors, setFloors] = useState([]);
  
  // Get current user to check permissions
  const user = getUser();
  const canBookRoom = user.access_level_id >= 2; // Only managers (level 2+) can book rooms

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

        const floorsList = Object.values(roomsByFloor).map(floor => ({
          floor_number: floor.floor_number,
          floor_name: floor.floor_name
        }));

        setRooms(Object.values(roomsByFloor));
        setFilteredRooms(Object.values(roomsByFloor));
        setFloors(floorsList);
        setExpandedFloor(floorsList[0]?.floor_number);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load meeting rooms');
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    // Filter and sort rooms based on search, filters and sort order
    const applyFilters = () => {
      let result = [...rooms];
      
      // Apply filters
      if (floorFilter !== 'all') {
        result = result.filter(floor => floor.floor_number.toString() === floorFilter);
      }
      
      // Apply search and capacity filter to individual rooms within each floor
      result = result.map(floor => {
        const filteredRooms = floor.rooms.filter(room => {
          // Apply search term filter
          const matchesSearch = searchTerm === '' || 
            room.room_name.toLowerCase().includes(searchTerm.toLowerCase());
          
          // Apply capacity filter
          let matchesCapacity = true;
          if (capacityFilter === 'small') {
            matchesCapacity = room.capacity <= 5;
          } else if (capacityFilter === 'medium') {
            matchesCapacity = room.capacity > 5 && room.capacity <= 10;
          } else if (capacityFilter === 'large') {
            matchesCapacity = room.capacity > 10;
          }
          
          return matchesSearch && matchesCapacity;
        });
        
        // Sort rooms within each floor
        filteredRooms.sort((a, b) => {
          if (sortOrder === 'name') {
            return a.room_name.localeCompare(b.room_name);
          } else if (sortOrder === 'capacity-asc') {
            return a.capacity - b.capacity;
          } else if (sortOrder === 'capacity-desc') {
            return b.capacity - a.capacity;
          }
          return 0;
        });
        
        return {
          ...floor,
          rooms: filteredRooms
        };
      });
      
      // Filter out floors with no rooms
      result = result.filter(floor => floor.rooms.length > 0);
      
      setFilteredRooms(result);
    };
    
    applyFilters();
  }, [rooms, searchTerm, floorFilter, capacityFilter, sortOrder]);

  const handleBookRoom = (room) => {
    if (!canBookRoom) {
      setError("You don't have permission to book meeting rooms. Please contact your administrator.");
      return;
    }
    
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

  const handleAccordionChange = (floorNumber) => (event, isExpanded) => {
    setExpandedFloor(isExpanded ? floorNumber : null);
  };

  const renderRooms = () => {
    if (filteredRooms.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No meeting rooms match your search criteria.
          </Typography>
        </Paper>
      );
    }

    return filteredRooms.map((floor) => (
      <Accordion 
        key={floor.floor_number}
        expanded={expandedFloor === floor.floor_number}
        onChange={handleAccordionChange(floor.floor_number)}
        sx={{ mb: 2, overflow: 'hidden' }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
          sx={{ 
            bgcolor: 'white', 
            color: 'black',
            borderBottom: expandedFloor === floor.floor_number ? '1px solid #e0e0e0' : 'none',
            '&:hover': {
              bgcolor: '#f5f5f5',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOnIcon sx={{ mr: 1 }} />
            <Typography variant="h6">{floor.floor_name} (Floor {floor.floor_number})</Typography>
            <Chip 
              label={`${floor.rooms.length} rooms`} 
              size="small" 
              sx={{ ml: 2, bgcolor: 'rgba(255, 255, 255, 0.2)' }} 
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2 }}>
          <Grid container spacing={3}>
            {floor.rooms.map((room) => (
              <Grid item xs={12} sm={6} md={4} key={room.room_id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'all 0.2s ease',
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                    borderColor: '#1976d2',
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 1, 
                      color: '#555'
                    }}>
                      <MeetingRoomIcon sx={{ mr: 1 }} />
                      <Typography variant="h6" component="h3">
                        {room.room_name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PeopleIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        Capacity: {room.capacity} people
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={() => handleBookRoom(room)}
                      startIcon={<AccessTimeIcon />}
                      disabled={!canBookRoom}
                      sx={{ 
                        bgcolor: '#111',
                        '&:hover': {
                          bgcolor: '#333',
                        }
                      }}
                    >
                      {canBookRoom ? 'Book Room' : 'View Only (Employee)'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    ));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
        <BackButton />
        <Typography variant="h4" component="h1" gutterBottom>
          Meeting Rooms
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} key={item}>
              <Skeleton variant="rectangular" height={60} />
            </Grid>
          ))}
        </Grid>
        
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" height={150} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <BackButton />
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Meeting Rooms
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse meeting rooms across all floors. {canBookRoom ? 'Select a room to make a reservation.' : 'As an employee, you can view rooms but cannot make bookings.'}
        </Typography>
        
        {!canBookRoom && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Only managers can book meeting rooms. Please contact your manager if you need to book a room.
          </Alert>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search rooms"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="floor-filter-label">Floor</InputLabel>
              <Select
                labelId="floor-filter-label"
                value={floorFilter}
                label="Floor"
                onChange={(e) => setFloorFilter(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Floors</MenuItem>
                {floors.map((floor) => (
                  <MenuItem key={floor.floor_number} value={floor.floor_number.toString()}>
                    {floor.floor_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="capacity-filter-label">Capacity</InputLabel>
              <Select
                labelId="capacity-filter-label"
                value={capacityFilter}
                label="Capacity"
                onChange={(e) => setCapacityFilter(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <PeopleIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">Any Size</MenuItem>
                <MenuItem value="small">Small (≤ 5)</MenuItem>
                <MenuItem value="medium">Medium (6-10)</MenuItem>
                <MenuItem value="large">Large (&gt; 10)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-label">Sort By</InputLabel>
              <Select
                labelId="sort-label"
                value={sortOrder}
                label="Sort By"
                onChange={(e) => setSortOrder(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value="name">Name (A to Z)</MenuItem>
                <MenuItem value="capacity-asc">Capacity (Low to High)</MenuItem>
                <MenuItem value="capacity-desc">Capacity (High to Low)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {renderRooms()}
      
      {/* Only show booking dialog if user has permission */}
      {canBookRoom && (
        <Dialog 
          open={openBookingDialog} 
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="md"
        >
          <DialogContent sx={{ p: 0 }}>
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
      )}
    </Container>
  );
};

export default MeetingRoomList;