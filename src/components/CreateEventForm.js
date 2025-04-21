import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Alert, 
  Box, 
  Stack
} from '@mui/material';
import { getUser, createEvent } from '../services/api';
import EventIcon from '@mui/icons-material/Event';

const CreateEventForm = ({ onEventSuccess }) => {
  const [form, setForm] = useState({ 
    event_name: '', 
    date: '', 
    description: '', 
    creator_id: getUser().user_id 
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => setForm({ 
    ...form, 
    [e.target.name]: e.target.value 
  });

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!form.event_name || !form.date) {
      setError('Event name and date are required');
      return;
    }
    
    try {
      await createEvent(form);
      
      setSuccess('Event created successfully!');
      
      // Reset form
      setForm({ 
        event_name: '', 
        date: '', 
        description: '', 
        creator_id: getUser().user_id 
      });
      
      // Notify parent component after a delay
      setTimeout(() => {
        if (onEventSuccess) {
          onEventSuccess();
        }
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create event');
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Box component="form" display="flex" flexDirection="column" gap={3} onSubmit={handleSubmit}>
        <TextField
          label="Event Name"
          name="event_name"
          fullWidth
          value={form.event_name}
          onChange={handleChange}
          required
        />
        
        <TextField
          label="Date & Time"
          name="date"
          type="datetime-local"
          fullWidth
          value={form.date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        
        <TextField
          label="Description"
          name="description"
          fullWidth
          multiline
          rows={4}
          value={form.description}
          onChange={handleChange}
          placeholder="Enter event details, location, or any other information"
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="submit" 
            variant="contained" 
            startIcon={<EventIcon />}
          >
            Create Event
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateEventForm;