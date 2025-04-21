import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Paper, 
  Alert,
  TextField,
  Tabs,
  Tab
} from '@mui/material';
import { getEvents, createEvent, updateEvent, deleteEvent, getUser } from '../services/api';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import BackButton from './BackButton';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ 
    event_name: '', 
    date: '', 
    description: '', 
    creator_id: getUser().user_id 
  });
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Get user to check permissions
  const user = getUser();
  const canCreateEvents = user.access_level_id >= 2; // Only managers (level 2+) can create events

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load events');
    }
  }

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset editing state when switching tabs
    setEditingId(null);
    setForm({ 
      event_name: '', 
      date: '', 
      description: '', 
      creator_id: getUser().user_id 
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!canCreateEvents) {
      setError("You don't have permission to create events. Please contact your administrator.");
      return;
    }
    
    try {
      if (editingId) {
        await updateEvent(editingId, form);
        setSuccess('Event updated successfully!');
      } else {
        await createEvent(form);
        setSuccess('Event created successfully!');
      }
      
      setForm({ 
        event_name: '', 
        date: '', 
        description: '', 
        creator_id: getUser().user_id 
      });
      setEditingId(null);
      loadEvents();
      
      // Switch to the events list tab after creating/updating
      setTimeout(() => {
        setActiveTab(1);
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save event');
    }
  };

  const handleEdit = ev => {
    if (!canCreateEvents) {
      setError("You don't have permission to edit events. Please contact your administrator.");
      return;
    }
    
    setEditingId(ev.id);
    setForm({
      event_name: ev.event_name,
      date: new Date(ev.date).toISOString().slice(0,16),
      description: ev.description,
      creator_id: ev.creator_id
    });
    // Switch to create tab for editing
    setActiveTab(0);
  };

  const handleDelete = async id => {
    if (!canCreateEvents) {
      setError("You don't have permission to delete events. Please contact your administrator.");
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await deleteEvent(id);
      setSuccess('Event deleted successfully!');
      loadEvents();
      
      // Clear success message after a delay
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to delete event');
    }
  };

  // Check if current user is the creator of the event
  const isCreator = (creatorId) => {
    return creatorId === user.user_id;
  };

  return (
    <Box>
      <BackButton />
      
      <Typography variant="h4" gutterBottom>Events</Typography>
      
      {!canCreateEvents && (
        <Alert severity="info" sx={{ mb: 2 }}>
          As an employee, you can view events but cannot create, edit, or delete them. Please contact your manager if you need assistance.
        </Alert>
      )}
      
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
      
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<AddIcon />} 
            label="Create Event" 
            iconPosition="start"
            disabled={!canCreateEvents}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 'medium',
              '&.Mui-selected': { color: 'primary.main' }
            }}
          />
          <Tab 
            icon={<ListIcon />} 
            label="All Events" 
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
            // Create Event Form
            <Box component="form" display="flex" flexDirection="column" gap={2} onSubmit={handleSubmit}>
              <TextField
                label="Event Name"
                name="event_name"
                value={form.event_name}
                onChange={handleChange}
                required
                disabled={!canCreateEvents}
              />
              <TextField
                label="Date & Time"
                name="date"
                type="datetime-local"
                value={form.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                disabled={!canCreateEvents}
              />
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                multiline
                rows={4}
                disabled={!canCreateEvents}
              />
              <Button 
                type="submit" 
                variant="contained"
                disabled={!canCreateEvents}
              >
                {editingId ? 'Update Event' : 'Create Event'}
              </Button>
            </Box>
          ) : (
            // Events List
            <List>
              {events.map(ev => (
                <ListItem key={ev.id} divider>
                  <ListItemText
                    primary={ev.event_name + ' (' + new Date(ev.date).toLocaleString() + ')'}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.primary">
                          {ev.description}
                        </Typography>
                        {isCreator(ev.creator_id) && (
                          <Typography variant="caption" color="text.secondary">
                            Created by you
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  {canCreateEvents && (isCreator(ev.creator_id) || user.access_level_id === 3) && (
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleEdit(ev)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDelete(ev.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
              {events.length === 0 && (
                <ListItem>
                  <ListItemText primary="No events found" />
                </ListItem>
              )}
            </List>
          )}
        </Box>
      </Paper>
    </Box>
  );
}