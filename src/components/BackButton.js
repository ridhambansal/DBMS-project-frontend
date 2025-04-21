import React from 'react';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ destination = '/dashboard' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(destination);
  };

  return (
    <Button
      variant="text"
      startIcon={<ArrowBackIcon />}
      onClick={handleBack}
      sx={{ 
        mb: 2, 
        color: 'text.secondary',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        }
      }}
    >
      Back to Dashboard
    </Button>
  );
};

export default BackButton;