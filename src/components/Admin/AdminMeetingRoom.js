import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Alert, Box } from '@mui/material';
import { getUser, createAdminMeetingRoom } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function AdminMeetingRoom() {
  const navigate = useNavigate();
  const user = getUser();
  const [fields, setFields] = useState({ room_name: '', capacity: '', floor_number: '' });
  const [msg, setMsg]       = useState({ error: '', success: '' });

  useEffect(() => {
    if (!user || user.access_level_id !== 3) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = e =>
    setFields({ ...fields, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await createAdminMeetingRoom({
        room_name:    fields.room_name,
        capacity:     +fields.capacity,
        floor_number: +fields.floor_number,
      });
      setMsg({ success: 'Meeting room created!', error: '' });
    } catch (err) {
      setMsg({ error: err.message || 'Creation failed', success: '' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6">New Meeting Room</Typography>
      {msg.error   && <Alert severity="error">{msg.error}</Alert>}
      {msg.success && <Alert severity="success">{msg.success}</Alert>}
      <TextField
        name="room_name"
        label="Name"
        fullWidth
        onChange={handleChange}
        value={fields.room_name}
        sx={{ mt: 1 }}
      />
      <TextField
        name="capacity"
        label="Capacity"
        type="number"
        fullWidth
        onChange={handleChange}
        value={fields.capacity}
        sx={{ mt: 1 }}
      />
      <TextField
        name="floor_number"
        label="Floor #"
        type="number"
        fullWidth
        onChange={handleChange}
        value={fields.floor_number}
        sx={{ mt: 1 }}
      />
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Create
      </Button>
    </Box>
  );
}