import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper 
} from '@mui/material';
import BackButton from './BackButton';
import SeatBookingForm from './SeatBookingForm';
import ManageSeatBookings from './ManageSeatBookings';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';

const SeatBookingPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <BackButton />
      
      <Typography variant="h4" component="h1" gutterBottom>
        Seat Booking
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<AddIcon />} 
            label="Book a Seat" 
            iconPosition="start"
            sx={{ 
              textTransform: 'none', 
              fontWeight: 'medium',
              '&.Mui-selected': { color: 'primary.main' }
            }}
          />
          <Tab 
            icon={<ListIcon />} 
            label="My Bookings" 
            iconPosition="start"
            sx={{ 
              textTransform: 'none', 
              fontWeight: 'medium',
              '&.Mui-selected': { color: 'primary.main' }
            }}
          />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {activeTab === 0 ? (
            <SeatBookingForm onBookingSuccess={() => setActiveTab(1)} />
          ) : (
            <ManageSeatBookings />
          )}
        </Box>
      </Paper>
    </>
  );
};

export default SeatBookingPage;