
import React from 'react';
import { Container, Tabs, Tab, Box } from '@mui/material';
import AdminMeetingRoom from './AdminMeetingRoom';
import AdminFloor       from './AdminFloor';
import AdminCafe        from './AdminCafe';

export default function AdminHome() {
    const [tab, setTab] = React.useState(0);
    const handleChange = (_, v) => setTab(v);
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Tabs value={tab} onChange={handleChange} centered>
          <Tab label="Meeting Rooms" />
          <Tab label="Floors" />
          <Tab label="Cafés" />
        </Tabs>
        <Box sx={{ mt: 2 }}>
          {tab === 0 && <AdminMeetingRoom />}
          {tab === 1 && <AdminFloor />}        
          {tab === 2 && <AdminCafe />}        
        </Box>
      </Container>
    );
  }