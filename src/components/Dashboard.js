import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
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

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
          <Button variant="outlined" color="primary" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
        
        <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 1 }}>
          <Typography variant="h6">Welcome, {user.first_name} {user.last_name}!</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            You are logged in as a {user.access_level_id === 1 ? 'Employee' : 'Manager'} at {user.company}.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;