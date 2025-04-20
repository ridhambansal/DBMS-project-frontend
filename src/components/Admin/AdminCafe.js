import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  getUser,
  createAdminCafe,
  getAdminCafes,
  updateAdminCafe,
} from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function AdminCafe() {
  const navigate = useNavigate();
  const user = getUser();

  const [fields, setFields] = useState({ name: '', cuisine: '', contact_number: '', floor_number: '' });
  const [msg, setMsg] = useState({ error: '', success: '' });

  const [cafes, setCafes] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editFields, setEditFields] = useState({});

  useEffect(() => {
    if (!user || user.access_level_id !== 3) {
      navigate('/login');
      return;
    }
    fetchCafes();
  }, [user, navigate]);

  const fetchCafes = async () => {
    try {
      const data = await getAdminCafes();
      console.log('Fetched cafés:', data);
      setCafes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = e =>
    setFields({ ...fields, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await createAdminCafe({
        name: fields.name,
        cuisine: fields.cuisine,
        contact_number: fields.contact_number,
        floor_number: +fields.floor_number,
      });
      setMsg({ success: 'Café created!', error: '' });
      setFields({ name: '', cuisine: '', contact_number: '', floor_number: '' });
      fetchCafes();
    } catch (err) {
      setMsg({ error: err.message || 'Creation failed', success: '' });
    }
  };

  const openEdit = cafe => {
    setEditFields(cafe);
    setEditOpen(true);
    setMsg({ error: '', success: '' });
  };

  const handleEditChange = e =>
    setEditFields({ ...editFields, [e.target.name]: e.target.value });

  const handleEditSave = async () => {
    try {
      await updateAdminCafe(editFields.name, {
        cuisine: editFields.cuisine,
        contact_number: editFields.contact_number,
        floor_number: +editFields.floor_number,
      });
      setMsg({ success: 'Updated successfully', error: '' });
      setEditOpen(false);
      fetchCafes();
    } catch (err) {
      setMsg({ error: err.message || 'Update failed', success: '' });
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">New Café</Typography>
      {msg.error && <Alert severity="error" sx={{ mb: 1 }}>{msg.error}</Alert>}
      {msg.success && <Alert severity="success" sx={{ mb: 1 }}>{msg.success}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
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
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Create</Button>
      </Box>

      <Typography variant="h6" sx={{ mb: 1 }}>Existing Cafés</Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Cuisine</TableCell>
              <TableCell>Contact #</TableCell>
              <TableCell>Floor #</TableCell>
              <TableCell>Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cafes.map(cafe => (
              <TableRow key={cafe.name} hover>
                <TableCell>{cafe.name}</TableCell>
                <TableCell>{cafe.cuisine}</TableCell>
                <TableCell>{cafe.contact_number}</TableCell>
                <TableCell>{cafe.floor_number}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => openEdit(cafe)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Café</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="cuisine"
            label="Cuisine"
            fullWidth
            value={editFields.cuisine || ''}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="contact_number"
            label="Contact #"
            fullWidth
            value={editFields.contact_number || ''}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="floor_number"
            label="Floor #"
            type="number"
            fullWidth
            value={editFields.floor_number || ''}
            onChange={handleEditChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
