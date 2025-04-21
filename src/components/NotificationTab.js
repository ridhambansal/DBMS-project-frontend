import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  MenuItem, 
  Typography, 
  Box, 
  Divider,
  CircularProgress,
  Badge,
  Button,
  IconButton
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { getUnreadNotifications, markNotificationAsRead, getUser } from '../services/api';

const NotificationTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const currentUser = getUser();

  useEffect(() => {
    fetchNotificationsCount();
    
    // Set up interval to check for new notifications
    const interval = setInterval(() => {
      fetchNotificationsCount();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationsCount = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getUnreadNotifications(currentUser.user_id);
      const notificationsArray = Array.isArray(data) ? data : (data ? [data] : []);
      setNotificationsCount(notificationsArray.length);
    } catch (err) {
      console.error('Error fetching notification count:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getUnreadNotifications(currentUser.user_id);
      console.log('Notifications received:', data);
      
      // Ensure data is always treated as an array
      const notificationsArray = Array.isArray(data) ? data : (data ? [data] : []);
      setNotifications(notificationsArray);
      setNotificationsCount(notificationsArray.length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = (event) => {
    // Only fetch notifications when button is clicked
    fetchNotifications();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    try {
      console.log('Marking notification as read:', notification.notification_id);
      await markNotificationAsRead(notification.notification_id, currentUser.user_id);
      // Remove the notification from the list after marking as read
      setNotifications(notifications.filter(n => n.notification_id !== notification.notification_id));
      setNotificationsCount(prev => prev - 1);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
    
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton 
        color="inherit"
        onClick={handleButtonClick}
        size="large"
        sx={{ mr: 2 }}
      >
        <Badge badgeContent={notificationsCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 320,
          },
        }}
      >
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        
        <Divider />
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {error && (
          <Box sx={{ p: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        
        {!loading && !error && notifications.length === 0 && (
          <Box sx={{ p: 2 }}>
            <Typography color="text.secondary">No new notifications</Typography>
          </Box>
        )}
        
        {notifications.map((notification) => (
          <MenuItem 
            key={notification.notification_id} 
            onClick={() => handleNotificationClick(notification)}
            sx={{ 
              whiteSpace: 'normal',
              py: 1.5
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {notification.title}
              </Typography>
              
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {notification.message && notification.message.length > 100
                  ? `${notification.message.slice(0, 100)}...`
                  : notification.message}
              </Typography>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                From: {notification.sender_name || 'System'} • {new Date(notification.time).toLocaleString()}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default NotificationTab;