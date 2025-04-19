import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Alert, Box } from '@mui/material';
import { getUser, createAdminCafe } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function AdminCafe() {
  const navigate = useNavigate();
  const user     = getUser();
  const [fields, setFields] = useState({ name: '', cuisine: '', contact_number: '', floor_number: '' });
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
      await createAdminCafe({
        name:           fields.name,
        cuisine:        fields.cuisine,
        contact_number: fields.contact_number,
        floor_number:   +fields.floor_number,
      });
      setMsg({ success: 'Café created!', error: '' });
    } catch (err) {
      setMsg({ error: err.message || 'Creation failed', success: '' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6">New Café</Typography>
      {msg.error   && <Alert severity="error">{msg.error}</Alert>}
      {msg.success && <Alert severity="success">{msg.success}</Alert>}
      <TextField
        name="name"
        label="Name"
        fullWidth
        onChange={handleChange}
        value={fields.name}
        sx={{ mt: 1 }}
      />
      <TextField
        name="cuisine"
        label="Cuisine"
        fullWidth
        onChange={handleChange}
        value={fields.cuisine}
        sx={{ mt: 1 }}
      />
      <TextField
        name="contact_number"
        label="Contact #"
        fullWidth
        onChange={handleChange}
        value={fields.contact_number}
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