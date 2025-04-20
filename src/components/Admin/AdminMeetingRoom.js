import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  getUser,
  createAdminMeetingRoom,
  getAdminMeetingRooms,
  updateAdminMeetingRoom,
} from '../../services/api';

export default function AdminMeetingRoom() {
  const navigate = useNavigate();
  const user = getUser();
  const [rooms, setRooms] = useState([]);
  const [fields, setFields] = useState({ id: null, room_name: '', capacity: '', floor_number: '' });
  const [msg, setMsg] = useState({ error: '', success: '' });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!user || user.access_level_id !== 3) {
      navigate('/login');
      return;
    }
    fetchRooms();
  }, [user, navigate]);

  const fetchRooms = async () => {
    try {
      const data = await getAdminMeetingRooms();
      setRooms(data);
    } catch (err) {
      console.error(err);
      setMsg({ error: err.message || 'Failed to fetch rooms', success: '' });
    }
  };

  const resetForm = () => {
    setFields({ id: null, room_name: '', capacity: '', floor_number: '' });
    setEditing(false);
    setMsg({ error: '', success: '' });
  };

  const handleChange = (e) =>
    setFields({ ...fields, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateAdminMeetingRoom(fields.id, {
          room_name: fields.room_name,
          capacity: +fields.capacity,
          floor_number: +fields.floor_number,
        });
        setMsg({ success: 'Updated successfully', error: '' });
      } else {
        await createAdminMeetingRoom({
          room_name: fields.room_name,
          capacity: +fields.capacity,
          floor_number: +fields.floor_number,
        });
        setMsg({ success: 'Created successfully', error: '' });
      }
      resetForm();
      fetchRooms();
    } catch (err) {
      setMsg({ error: err.message || 'Operation failed', success: '' });
    }
  };

  const startEdit = (room) => {
    setFields({
      id: room.room_id,
      room_name: room.room_name,
      capacity: room.capacity,
      floor_number: room.floor_number,
    });
    setEditing(true);
    setMsg({ error: '', success: '' });
  };

  return (
    <Box>
      <Typography variant="h6">
        {editing ? 'Edit Meeting Room' : 'New Meeting Room'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        {msg.error && <Alert severity="error">{msg.error}</Alert>}
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
          {editing ? 'Update' : 'Create'}
        </Button>
        {editing && (
          <Button onClick={resetForm} sx={{ mt: 2, ml: 2 }}>
            Cancel
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Floor</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.room_id}>
                <TableCell>{room.room_name}</TableCell>
                <TableCell>{room.capacity}</TableCell>
                <TableCell>{room.floor_number}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => startEdit(room)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
