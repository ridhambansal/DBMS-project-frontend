import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardActions,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getUser, logout } from '../services/api';
import NotificationTab from './NotificationTab';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#111' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Office Management
          </Typography>
          <NotificationTab />
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
            Dashboard
          </Typography>
          
          <Paper sx={{ p: 3, mb: 4, borderRadius: 1 }}>
            <Typography variant="h6">Welcome, {user.first_name} {user.last_name}!</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              You are logged in as a {user.access_level_id === 1 ? 'Employee' : 'Manager'} at {user.company}.
            </Typography>
          </Paper>
          
          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            Office Resources
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Meeting Rooms
                  </Typography>
                  <Typography variant="body2">
                    Browse and book meeting rooms across all floors.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/meeting-rooms')}
                    sx={{ color: '#111' }}
                  >
                    View Rooms
                  </Button>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/my-bookings')}
                    sx={{ color: '#111' }}
                  >
                    My Bookings
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Seats
                  </Typography>
                  <Typography variant="body2">
                    Reserve your workspace seat in the office.
                  </Typography>
                </CardContent>
                <CardActions>
                <Button
                  size="small" 
                    onClick={() => navigate('/seat-booking')}
                    sx={{ color: '#111' }}
                >
                  Manage Seats
                </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Cafeteria
                  </Typography>
                  <Typography variant="body2">
                    Browse cafeterias and book them in advance.
                  </Typography>
                </CardContent>
                <CardActions>
                <Button
                  size="small" 
                    onClick={() => navigate('/cafeteria')}
                    sx={{ color: '#111' }}
                >
                  Manage Cafeteria
                </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Manage Events
                  </Typography>
                  <Typography variant="body2">
                    Browse and book events
                  </Typography>
                </CardContent>
                <CardActions>
                <Button
                  size="small" 
                    onClick={() => navigate('/events')}
                    sx={{ color: '#111' }}
                  >
                  Manage Events
                </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default Dashboard;