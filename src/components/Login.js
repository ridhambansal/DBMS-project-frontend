import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Container, TextField, Typography, Alert, Paper } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const validationSchema = Yup.object({
  email_id: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email_id: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await login(values);
        navigate('/dashboard');
      } catch (err) {
        setError(err.message || 'Login failed. Please check your credentials.');
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
        Office Booking App
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
              Email
            </Typography>
            <TextField
              fullWidth
              id="email_id"
              name="email_id"
              placeholder="Enter your email"
              variant="outlined"
              value={formik.values.email_id}
              onChange={formik.handleChange}
              error={formik.touched.email_id && Boolean(formik.errors.email_id)}
              helperText={formik.touched.email_id && formik.errors.email_id}
              size="small"
            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
              Password
            </Typography>
            <TextField
              fullWidth
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              variant="outlined"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              size="small"
            />
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              py: 1.5,
              backgroundColor: '#111',
              '&:hover': {
                backgroundColor: '#333',
              },
              mb: 2
            }}
          >
            Login
          </Button>
          
          <Button
            component={Link}
            to="/register"
            fullWidth
            variant="outlined"
            sx={{ 
              py: 1.5,
              borderColor: '#e0e0e0',
              color: '#000',
              '&:hover': {
                borderColor: '#bdbdbd',
                backgroundColor: 'transparent',
              }
            }}
          >
            Create User
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;