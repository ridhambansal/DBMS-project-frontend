import React, { useEffect, useState } from 'react';
import { Box, Button, Container, TextField, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Paper } from '@mui/material';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../services/api';
import { getUser } from '../services/api';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ event_name: '', date: '', description: '', creator_id: getUser().user_id });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateEvent(editingId, form);
      } else {
        await createEvent(form);
      }
      setForm({ event_name: '', date: '', description: '', creator_id: getUser().user_id });
      setEditingId(null);
      loadEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = ev => {
    setEditingId(ev.id);
    setForm({
      event_name: ev.event_name,
      date: new Date(ev.date).toISOString().slice(0,16),
      description: ev.description,
      creator_id: ev.creator_id
    });
  };

  const handleDelete = async id => {
    try {
      await deleteEvent(id);
      loadEvents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Manage Events</Typography>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Box component="form" display="flex" flexDirection="column" gap={2} onSubmit={handleSubmit}>
          <TextField
            label="Event Name"
            name="event_name"
            value={form.event_name}
            onChange={handleChange}
            required
          />
          <TextField
            label="Date & Time"
            name="date"
            type="datetime-local"
            value={form.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            multiline
            rows={2}
          />
          <Button type="submit" variant="contained">
            {editingId ? 'Update Event' : 'Create Event'}
          </Button>
        </Box>
      </Paper>

      <List>
        {events.map(ev => (
          <ListItem key={ev.id} divider>
            <ListItemText
              primary={ev.event_name + ' (' + new Date(ev.date).toLocaleString() + ')'}
              secondary={ev.description}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleEdit(ev)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" onClick={() => handleDelete(ev.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}