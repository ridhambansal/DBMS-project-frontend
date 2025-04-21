import React, { useEffect, useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Alert,
  Divider,
  Card,
  CardContent,
  CardActions,
  Grid
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { getEvents, updateEvent, deleteEvent, getUser } from '../services/api';

const ManageEvents = ({ onCreateNew }) => {
  const [events, setEvents] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [editForm, setEditForm] = useState({
    event_name: '',
    date: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const user = getUser();

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await getEvents();
      const eventsArray = Array.isArray(data) ? data : [data];
      
      // Sort events by date (most recent first)
      eventsArray.sort((a, b) => new Date(b.date || b.event_date) - new Date(a.date || a.event_date));
      
      setEvents(eventsArray);
    } catch (err) {
      console.error(err);
      setError('Failed to load events');
    }
  }

  const handleEdit = (ev) => {
    setCurrentEvent(ev);
    setEditForm({
      event_name: ev.event_name,
      date: new Date(ev.date || ev.event_date).toISOString().slice(0, 16),
      description: ev.description,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (ev) => {
    setCurrentEvent(ev);
    setDeleteDialogOpen(true);
  };

  const handleEditChange = e => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateEvent = async () => {
    if (!editForm.event_name || !editForm.date) {
      setError('Event name and date are required');
      return;
    }
    
    try {
      await updateEvent(currentEvent.id, {
        ...editForm,
        creator_id: currentEvent.creator_id
      });
      
      setSuccess('Event updated successfully');
      setEditDialogOpen(false);
      loadEvents();
      
      // Clear success message after a delay
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async () => {
    try {
      await deleteEvent(currentEvent.id);
      setSuccess('Event deleted successfully');
      setDeleteDialogOpen(false);
      loadEvents();
      
      // Clear success message after a delay
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to delete event');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const isUpcomingEvent = (dateString) => {
    return new Date(dateString) > new Date();
  };
  
  const isCurrentUserCreator = (creatorId) => {
    return creatorId === user.user_id;
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
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={onCreateNew}
        >
          Create New Event
        </Button>
      </Box>
      
      {events.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No events found. Create your first event!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {events.map((ev) => (
            <Grid item xs={12} sm={6} md={4} key={ev.id}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                opacity: isUpcomingEvent(ev.date || ev.event_date) ? 1 : 0.7
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    <EventIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                    {ev.event_name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                    {formatDate(ev.date || ev.event_date)}
                  </Typography>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    mb: 2,
                    display: 'flex',
                    alignItems: 'flex-start'
                  }}>
                    <DescriptionIcon sx={{ mr: 0.5, fontSize: '0.9rem', mt: 0.3 }} />
                    <Box>{ev.description || 'No description provided'}</Box>
                  </Typography>
                  
                  {!isCurrentUserCreator(ev.creator_id) && (
                    <Typography variant="caption" color="text.secondary">
                      Created by another user
                    </Typography>
                  )}
                </CardContent>
                
                {isCurrentUserCreator(ev.creator_id) && (
                  <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEdit(ev)}
                      disabled={!isUpcomingEvent(ev.date || ev.event_date)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(ev)}
                      disabled={!isUpcomingEvent(ev.date || ev.event_date)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Event Name"
              name="event_name"
              value={editForm.event_name}
              onChange={handleEditChange}
              required
            />
            <TextField
              margin="normal"
              fullWidth
              label="Date & Time"
              name="date"
              type="datetime-local"
              value={editForm.date}
              onChange={handleEditChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              margin="normal"
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={3}
              value={editForm.description}
              onChange={handleEditChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateEvent} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the event "{currentEvent?.event_name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteEvent} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageEvents;