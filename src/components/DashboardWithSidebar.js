import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Container,
  Paper,
  CssBaseline,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Badge,
  CircularProgress,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUser, logout, getEvents, getMeetingRoomBookings, fetchCafeBookings, getSeatBookings, getUnreadNotifications } from '../services/api';
import { format } from 'date-fns';

// Import icons
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import EventIcon from '@mui/icons-material/Event';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ChairIcon from '@mui/icons-material/Chair';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

// Import components
import MeetingRoomList from './MeetingRooms/MeetingRoomList';
import MeetingRoomBookings from './MeetingRooms/MeetingRoomBookings';
import Events from './Events';
import CafeBooking from './CafeBooking';
import SeatBookings from './SeatBooking';
import NotificationTab from './NotificationTab';

const drawerWidth = 240;

// Define menu items with access level requirements
const getMenuItems = (userAccessLevel) => [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/dashboard' 
  },
  { 
    text: 'Meeting Rooms', 
    icon: <MeetingRoomIcon />, 
    path: '/meeting-rooms',
    requiresLevel: 0, // Everyone can view
    bookingRequiresLevel: 2 // Only managers can book
  },
  { 
    text: 'My Meeting Bookings', 
    icon: <BookOnlineIcon />, 
    path: '/my-bookings',
    requiresLevel: 0 // Everyone can view their bookings
  },
  { 
    text: 'Seat Booking', 
    icon: <ChairIcon />, 
    path: '/seat-booking' 
  },
  { 
    text: 'Cafeteria Booking', 
    icon: <RestaurantIcon />, 
    path: '/cafeteria' 
  },
  { 
    text: 'Events', 
    icon: <EventIcon />, 
    path: '/events',
    requiresLevel: 0, // Everyone can view
    createRequiresLevel: 2 // Only managers can create
  },
];

// Helper function to check if a date is today
const isToday = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

// TabPanel component to handle tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [meetingBookings, setMeetingBookings] = useState([]);
  const [cafeBookings, setCafeBookings] = useState([]);
  const [seatBookings, setSeatBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setUser(currentUser);
    
    // Only fetch dashboard data when on the dashboard page
    if (location.pathname === '/dashboard') {
      fetchDashboardData(currentUser.user_id);
    }
  }, [navigate, location.pathname]);

  const fetchDashboardData = async (userId) => {
    setLoading(true);
    try {
      // Get today's date as a string (YYYY-MM-DD)
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Fetch all necessary data in parallel
      const [eventsData, meetingsData, notificationsData, cafeData, seatsData] = await Promise.all([
        getEvents(),
        getMeetingRoomBookings(userId, today),
        getUnreadNotifications(userId),
        fetchCafeBookings(userId),
        getSeatBookings(userId)
      ]);
      
      console.log("Fetched events:", eventsData);
      console.log("Fetched meetings:", meetingsData);
      console.log("Fetched cafe bookings:", cafeData);
      console.log("Fetched seat bookings:", seatsData);
      
      // Filter events for today only
      const todayEvents = Array.isArray(eventsData) ? eventsData.filter(event => {
        return isToday(event.date || event.event_date);
      }) : [];
      
      // Filter cafe bookings for today
      const todayCafeBookings = Array.isArray(cafeData) ? cafeData.filter(booking => {
        return isToday(booking.booking_date);
      }) : [];
      
      // Filter seat bookings for today
      const todaySeatBookings = Array.isArray(seatsData) ? seatsData.filter(booking => {
        return isToday(booking.booking_date);
      }) : [];

      // Ensure meetingsData is always an array
      const meetingsArray = Array.isArray(meetingsData) ? meetingsData : 
                           (meetingsData ? [meetingsData] : []);
      
      // Sort events and bookings by time
      todayEvents.sort((a, b) => 
        new Date(a.date || a.event_date) - new Date(b.date || b.event_date));
      meetingsArray.sort((a, b) => 
        new Date(a.booking_date) - new Date(b.booking_date));
      todayCafeBookings.sort((a, b) => 
        new Date(a.booking_date) - new Date(b.booking_date));
      todaySeatBookings.sort((a, b) => 
        new Date(a.booking_date) - new Date(b.booking_date));
      
      setEvents(todayEvents);
      setMeetingBookings(meetingsArray);
      setCafeBookings(todayCafeBookings);
      setSeatBookings(todaySeatBookings);
      setNotifications(notificationsData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const renderContent = () => {
    switch (location.pathname) {
      case '/dashboard':
        return renderDashboard();
      case '/meeting-rooms':
        return <MeetingRoomList />;
      case '/my-bookings':
        return <MeetingRoomBookings />;
      case '/events':
        return <Events />;
      case '/cafeteria':
        return <CafeBooking />;
      case '/seat-booking':
        return <SeatBookings />;
      default:
        return renderDashboard();
    }
  };

  // Event Card Component
  const EventCard = ({ event }) => (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {event.event_name}
          </Typography>
          <Box sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            p: 0.5,
            px: 1,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.8rem',
            whiteSpace: 'nowrap',
            ml: 1
          }}>
            <AccessTimeIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
            {format(new Date(event.date || event.event_date), 'h:mm a')}
          </Box>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <Typography variant="body2" sx={{ mb: 1, height: '2.5em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {event.description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 20, 
              height: 20, 
              fontSize: 10,
              bgcolor: 'primary.light',
              mr: 0.5
            }}
          >
            {event.creator_id === user?.user_id ? 'Me' : 'U'}
          </Avatar>
          <Typography variant="caption" color="text.secondary">
            {event.creator_id === user?.user_id ? 'You' : 'User'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  // Meeting Room Card Component
  const MeetingRoomCard = ({ booking }) => (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {booking.room_name}
          </Typography>
          <Box sx={{ 
            bgcolor: 'primary.main',
            color: 'white',
            p: 0.5,
            px: 1,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.8rem',
            whiteSpace: 'nowrap',
            ml: 1
          }}>
            <AccessTimeIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
            {format(new Date(booking.booking_date), 'h:mm a')}
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary" noWrap>
          {booking.floor_name || `Floor ${booking.floor_number}`}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" sx={{ mb: 1, height: '2.5em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {booking.details}
        </Typography>
        {booking.participants && booking.participants.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {booking.participants.slice(0, 3).map((p, index) => (
              <Avatar
                key={index}
                sx={{ 
                  width: 20, 
                  height: 20, 
                  fontSize: 10,
                  bgcolor: 'primary.light',
                  mr: 0.5
                }}
              >
                {p.first_name?.charAt(0) || 'U'}
              </Avatar>
            ))}
            {booking.participants.length > 3 && (
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                +{booking.participants.length - 3}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Seat Card Component
  const SeatCard = ({ booking }) => (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            Seat {booking.seat_number}
          </Typography>
          <Box sx={{ 
            bgcolor: 'warning.main',
            color: 'white',
            p: 0.5,
            px: 1,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.8rem',
            whiteSpace: 'nowrap',
            ml: 1
          }}>
            <AccessTimeIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
            {format(new Date(booking.booking_date), 'h:mm a')}
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary" noWrap>
          Floor {booking.floor_number}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" sx={{ height: '2.5em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {booking.details}
        </Typography>
      </CardContent>
    </Card>
  );

  // Cafe Card Component
  const CafeCard = ({ booking }) => (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {booking.cafe_name}
          </Typography>
          <Box sx={{ 
            bgcolor: 'success.main',
            color: 'white',
            p: 0.5,
            px: 1,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.8rem',
            whiteSpace: 'nowrap',
            ml: 1
          }}>
            <AccessTimeIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
            {format(new Date(booking.booking_date), 'h:mm a')}
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" sx={{ height: '2.5em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {booking.details}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderDashboard = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      );
    }

    // Check if user can book rooms or create events
    const canBookRooms = user?.access_level_id >= 2;
    const canCreateEvents = user?.access_level_id >= 2;

    return (
      <>
        <Paper sx={{ p: 3, mb: 4, borderRadius: 1 }}>
          <Typography variant="h6">Welcome, {user?.first_name} {user?.last_name}!</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            You are logged in as a {user?.access_level_id === 1 ? 'Employee' : user?.access_level_id === 2 ? 'Manager' : 'Admin'} at {user?.company}.
          </Typography>
          
          {!canBookRooms && (
            <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 2 }}>
              As an employee, you can view meeting rooms and events but cannot book rooms or create events.
            </Alert>
          )}
        </Paper>

        <Paper sx={{ width: '100%', mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="dashboard tabs"
              sx={{ px: 2, pt: 2 }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                icon={<EventIcon />}
                label="Today's Events" 
                iconPosition="start"
                sx={{ 
                  textTransform: 'none', 
                  fontWeight: 'bold',
                  '&.Mui-selected': { color: 'primary.main' }
                }}
              />
              <Tab 
                icon={<MeetingRoomIcon />}
                label="Meeting Room Bookings" 
                iconPosition="start"
                sx={{ 
                  textTransform: 'none', 
                  fontWeight: 'bold',
                  '&.Mui-selected': { color: 'primary.main' }
                }}
              />
              <Tab 
                icon={<ChairIcon />}
                label="Seat Bookings" 
                iconPosition="start"
                sx={{ 
                  textTransform: 'none', 
                  fontWeight: 'bold',
                  '&.Mui-selected': { color: 'primary.main' }
                }}
              />
              <Tab 
                icon={<RestaurantIcon />}
                label="Cafeteria Bookings" 
                iconPosition="start"
                sx={{ 
                  textTransform: 'none', 
                  fontWeight: 'bold',
                  '&.Mui-selected': { color: 'primary.main' }
                }}
              />
            </Tabs>
          </Box>
          
          {/* Tab 1: Today's Events */}
          <TabPanel value={tabValue} index={0}>
            {events.length > 0 ? (
              <Box sx={{ px: 3 }}>
                <Box 
                  sx={{ 
                    height: 330, 
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '10px',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      },
                    },
                  }}
                >
                  <Grid container spacing={2}>
                    {events.map((event) => (
                      <Grid item xs={12} sm={6} md={4} key={event.id || event.event_id}>
                        <EventCard event={event} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<EventIcon />}
                    onClick={() => navigate('/events')}
                  >
                    {canCreateEvents ? 'Manage Events' : 'View Events'}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  No events scheduled for today
                </Typography>
                {canCreateEvents && (
                  <Button
                    variant="contained"
                    startIcon={<EventIcon />}
                    onClick={() => navigate('/events')}
                  >
                    Create an Event
                  </Button>
                )}
                {!canCreateEvents && (
                  <Button
                    variant="outlined"
                    startIcon={<EventIcon />}
                    onClick={() => navigate('/events')}
                  >
                    View Events
                  </Button>
                )}
              </Box>
            )}
          </TabPanel>
          
          {/* Tab 2: Meeting Room Bookings */}
          <TabPanel value={tabValue} index={1}>
            {meetingBookings.length > 0 ? (
              <Box sx={{ px: 3 }}>
                <Box 
                  sx={{ 
                    height: 330, 
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '10px',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      },
                    },
                  }}
                >
                  <Grid container spacing={2}>
                    {meetingBookings.map((booking, index) => (
                      <Grid item xs={12} sm={6} md={4} key={booking.booking_id || index}>
                        <MeetingRoomCard booking={booking} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<MeetingRoomIcon />}
                    onClick={() => navigate('/meeting-rooms')}
                  >
                    {canBookRooms ? 'Book Meeting Room' : 'View Meeting Rooms'}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  No meeting room bookings for today
                </Typography>
                {canBookRooms ? (
                  <Button
                    variant="contained"
                    startIcon={<MeetingRoomIcon />}
                    onClick={() => navigate('/meeting-rooms')}
                  >
                    Book a Meeting Room
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<MeetingRoomIcon />}
                    onClick={() => navigate('/meeting-rooms')}
                  >
                    View Meeting Rooms
                  </Button>
                )}
              </Box>
            )}
          </TabPanel>
          
          {/* Tab 3: Seat Bookings */}
          <TabPanel value={tabValue} index={2}>
            {seatBookings.length > 0 ? (
              <Box sx={{ px: 3 }}>
                <Box 
                  sx={{ 
                    height: 330, 
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '10px',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      },
                    },
                  }}
                >
                  <Grid container spacing={2}>
                    {seatBookings.map((booking, index) => (
                      <Grid item xs={12} sm={6} md={4} key={booking.booking_id || index}>
                        <SeatCard booking={booking} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<ChairIcon />}
                    onClick={() => navigate('/seat-booking')}
                  >
                    Book Seat
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  No seat bookings for today
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<ChairIcon />}
                  onClick={() => navigate('/seat-booking')}
                >
                  Book a Seat
                </Button>
              </Box>
            )}
          </TabPanel>
          
          {/* Tab 4: Cafeteria Bookings */}
          <TabPanel value={tabValue} index={3}>
            {cafeBookings.length > 0 ? (
              <Box sx={{ px: 3 }}>
                <Box 
                  sx={{ 
                    height: 330, 
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '10px',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      },
                    },
                  }}
                >
                  <Grid container spacing={2}>
                    {cafeBookings.map((booking, index) => (
                      <Grid item xs={12} sm={6} md={4} key={booking.booking_id || index}>
                        <CafeCard booking={booking} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<RestaurantIcon />}
                    onClick={() => navigate('/cafeteria')}
                  >
                    Book Cafeteria
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  No cafeteria bookings for today
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<RestaurantIcon />}
                  onClick={() => navigate('/cafeteria')}
                >
                  Book a Cafeteria
                </Button>
              </Box>
            )}
          </TabPanel>
        </Paper>
      </>
    );
  };

  if (!user) return null;

  // Get menu items based on user's access level
  const menuItemsForUser = getMenuItems(user.access_level_id);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ backgroundColor: '#111', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Office Management
          </Typography>
          
          <NotificationTab />
          
          <Button 
            color="inherit" 
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            backgroundColor: '#f5f5f5',
            borderRight: '1px solid #e0e0e0'
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {user.first_name} {user.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.access_level_id === 1 ? 'Employee' : user.access_level_id === 2 ? 'Manager' : 'Admin'} • {user.company}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <List>
            {menuItemsForUser.map((item) => {
              // Skip rendering menu items that require higher access level
              if (item.requiresLevel && user.access_level_id < item.requiresLevel) {
                return null;
              }
              
              return (
                <ListItem 
                  button 
                  key={item.text}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    mb: 0.5,
                    borderRadius: '0 20px 20px 0',
                    mr: 2,
                    '&:hover': {
                      backgroundColor: '#e3f2fd',
                    },
                    ...(location.pathname === item.path && {
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      '& .MuiListItemIcon-root': {
                        color: '#1976d2',
                      }
                    })
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, height: '100vh', overflowY: 'auto' }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ mb: 4 }}>
          {renderContent()}
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;