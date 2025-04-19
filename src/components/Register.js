import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Container, TextField, Typography, Alert, Select, MenuItem, FormControl, InputLabel, Paper } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';

const validationSchema = Yup.object({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  email_id: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  company: Yup.string().required('Company name is required'),
  access_level_id: Yup.number().required('Role is required'),
});

const Register = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email_id: '',
      password: '',
      company: '',
      access_level_id: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await register(values);
        navigate('/dashboard');
      } catch (err) {
        setError(err.message || 'Registration failed. Please try again.');
      }
    },
  });

  return (
    <Container component="main" maxWidth="sm" sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center',
      alignItems: 'center',
      py: 4
    }}>
      <Typography component="h1" variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Create Account
      </Typography>
      
      <Paper 
        elevation={0} 
        sx={{ 
          width: '100%', 
          p: 4, 
          border: '1px solid #e0e0e0',
          borderRadius: 2
        }}
      >
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
              First Name
            </Typography>
            <TextField
              fullWidth
              id="first_name"
              name="first_name"
              placeholder="First name"
              variant="outlined"
              value={formik.values.first_name}
              onChange={formik.handleChange}
              error={formik.touched.first_name && Boolean(formik.errors.first_name)}
              helperText={formik.touched.first_name && formik.errors.first_name}
              size="small"
              sx={{ mb: 1 }}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
              Last Name
            </Typography>
            <TextField
              fullWidth
              id="last_name"
              name="last_name"
              placeholder="Last name"
              variant="outlined"
              value={formik.values.last_name}
              onChange={formik.handleChange}
              error={formik.touched.last_name && Boolean(formik.errors.last_name)}
              helperText={formik.touched.last_name && formik.errors.last_name}
              size="small"
              sx={{ mb: 1 }}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
              Email
            </Typography>
            <TextField
              fullWidth
              id="email_id"
              name="email_id"
              placeholder="Your email"
              variant="outlined"
              value={formik.values.email_id}
              onChange={formik.handleChange}
              error={formik.touched.email_id && Boolean(formik.errors.email_id)}
              helperText={formik.touched.email_id && formik.errors.email_id}
              size="small"
              sx={{ mb: 1 }}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
              Password
            </Typography>
            <TextField
              fullWidth
              id="password"
              name="password"
              type="password"
              placeholder="Choose a password"
              variant="outlined"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              size="small"
              sx={{ mb: 1 }}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
              Company
            </Typography>
            <TextField
              fullWidth
              id="company"
              name="company"
              placeholder="Your company"
              variant="outlined"
              value={formik.values.company}
              onChange={formik.handleChange}
              error={formik.touched.company && Boolean(formik.errors.company)}
              helperText={formik.touched.company && formik.errors.company}
              size="small"
              sx={{ mb: 1 }}
            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
              Role
            </Typography>
            <FormControl fullWidth error={formik.touched.access_level_id && Boolean(formik.errors.access_level_id)}>
              <Select
                id="access_level_id"
                name="access_level_id"
                displayEmpty
                value={formik.values.access_level_id}
                onChange={formik.handleChange}
                size="small"
                renderValue={(selected) => {
                  if (!selected) {
                    return <em>Select role</em>;
                  }
                  return selected === 1 ? 'Employee' : 'Manager';
                }}
              >
                <MenuItem value="" disabled><em>Select role</em></MenuItem>
                <MenuItem value={1}>Employee</MenuItem>
                <MenuItem value={2}>Manager</MenuItem>
              </Select>
              {formik.touched.access_level_id && formik.errors.access_level_id && (
                <Typography variant="caption" color="error">
                  {formik.errors.access_level_id}
                </Typography>
              )}
            </FormControl>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 2, 
              mb: 2, 
              py: 1.5,
              backgroundColor: '#111',
              '&:hover': {
                backgroundColor: '#333',
              }
            }}
          >
            Register
          </Button>
        </Box>
      </Paper>
      
      <Box sx={{ mt: 2 }}>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <Typography variant="body2" color="text.secondary">
            Back to login
          </Typography>
        </Link>
      </Box>
    </Container>
  );
};

export default Register;