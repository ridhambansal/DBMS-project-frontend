import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Alert, Box } from '@mui/material';
import { getUser, createAdminFloor } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function AdminFloor() {
  const navigate = useNavigate();
  const user     = getUser();
  const [fields, setFields] = useState({ floor_number: '', no_meeting_rooms: '', total_capacity: '' });
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
      await createAdminFloor({
        floor_number:     +fields.floor_number,
        floor_name:      fields.floor_name,
        total_capacity:         +fields.total_capacity,
      });
      setMsg({ success: 'Floor created!', error: '' });
    } catch (err) {
      setMsg({ error: err.message || 'Creation failed', success: '' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6">New Floor</Typography>
      {msg.error   && <Alert severity="error">{msg.error}</Alert>}
      {msg.success && <Alert severity="success">{msg.success}</Alert>}
      <TextField
        name="floor_number"
        label="Floor #"
        type="number"
        fullWidth
        onChange={handleChange}
        value={fields.floor_number}
        sx={{ mt: 1 }}
      />
      <TextField
  name="floor_name"
  label="Floor Name"
  fullWidth
  onChange={handleChange}
  value={fields.floor_name}
  sx={{ mt: 1 }}
/>
      <TextField
        name="total_capacity"
        label="total_capacity"
        type="number"
        fullWidth
        onChange={handleChange}
        value={fields.total_capacity}
        sx={{ mt: 1 }}
      />
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Create
      </Button>
    </Box>
  );
}