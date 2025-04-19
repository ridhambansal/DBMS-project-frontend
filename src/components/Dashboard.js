import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getUser, logout } from '../services/api';

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
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button variant="outlined" onClick={handleLogout}>Logout</Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">
          Welcome, {user.first_name} {user.last_name}!
        </Typography>
        <Typography>You are a {user.access_level_id === 1 ? 'Employee' : 'Manager'} at {user.company}.</Typography>
      </Box>

      <Button
        variant="contained"
        component={RouterLink}
        to="/events"
      >
        Manage Events
      </Button>
    </Container>
  );
};

export default Dashboard;
