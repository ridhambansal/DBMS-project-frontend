import React, { useState, useEffect } from 'react';
import { 
  Tab,
  Menu, 
  MenuItem, 
  Typography, 
  Box, 
  Divider,
  CircularProgress,
  Badge,
  Button
} from '@mui/material';
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
  }, []);

  const fetchNotificationsCount = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getUnreadNotifications(currentUser.user_id);
      setNotificationsCount(data ? data.length : 0);
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
      setNotifications(data || []);
      setNotificationsCount(data ? data.length : 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (event) => {
    // Only fetch notifications when tab is clicked
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

  return (
    <>
      <Button 
        color="inherit" 
        onClick={handleTabClick}
        sx={{ 
          height: '100%',
          borderRadius: 0,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <Badge badgeContent={notificationsCount} color="error">
          Notifications
        </Badge>
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
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
                {notification.message.length > 100
                  ? `${notification.message.slice(0, 100)}...`
                  : notification.message}
              </Typography>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                From: {notification.sender_name} • {new Date(notification.time).toLocaleString()}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default NotificationTab;