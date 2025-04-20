import axios from 'axios';

const API_URL = 'http://localhost:3000'; // NestJS server URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export async function createEvent(eventData) {
  const res = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData)
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to create event');
  return res.json();
};

export async function updateEvent(id, eventData) {
  const res = await fetch(`${API_URL}/events/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData)
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to update event');
  return res.json();
};

export async function getEvents() {
  const res = await fetch(`${API_URL}/events`, {
    headers: {
      'Content-Type': 'application/json',
      ...(getUser()?.token
        ? { Authorization: `Bearer ${getUser().token}` }
        : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteEvent(id) {
  const res = await fetch(`${API_URL}/events/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete event');
  return res.json();
};

export const fetchCafes = async () => {
  const res = await api.get('/cafeteria-booking/cafes');
  return res.data;
};

export const fetchCafeBookings = async (user_id) => {
  const res = await api.get(`/cafeteria-booking/bookings?user_id=${user_id}`);
  return res.data;
};

export const checkCafeAvailability = async (dto) => {
  const res = await api.post('/cafeteria-booking/availability', dto);
  return res.data; 
};

export const bookCafe = async (dto) => {
  const res = await api.post('/cafeteria-booking', dto);
  return res.data; 
};

export const updateCafeBooking = async (id, dto) => {
  const res = await api.patch(`/cafeteria-booking/${id}`, dto);
  return res.data; 
};

export const cancelCafeBooking = async (id, dto) => {
  const res = await api.delete(`/cafeteria-booking/${id}`, { data: dto });
  return res.data;
};

export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getMeetingRooms = async () => {
    try {
      const response = await api.get('/meeting-rooms');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  };
  
  export const getMeetingRoomById = async (id) => {
    try {
      const response = await api.get(`/meeting-rooms/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  };
  
  export const bookMeetingRoom = async (bookingData) => {
    try {
      const response = await api.post('/meeting-rooms/book', bookingData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  };
  
  export const getMeetingRoomBookings = async (userId, date) => {
    try {
      const params = {};
      if (userId) params.userId = userId;
      if (date) params.date = date;
      
      console.log('Requesting bookings with params:', params); // Add this for debugging
      
      const response = await api.get('/meeting-rooms/bookings', { params });
      console.log('Received bookings:', response.data); // Add this for debugging
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error); // Add this for debugging
      throw error.response ? error.response.data : error;
    }
  };
  
  export const cancelMeetingRoomBooking = async (id) => {
    try {
      if (!id) {
        throw new Error('Booking ID is required');
      }
      console.log(`Cancelling booking with ID: ${id}`);
      const response = await api.delete(`/meeting-rooms/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error.response ? error.response.data : error;
    }
  };


  export async function getSeatBookings() {
    const response = await api.get('/seat-bookings');
    return response.data;
  }
  
  export async function createSeatBooking(bookingData) {
    const response = await api.post('/seat-bookings', bookingData);
    return response.data;
  }
  
  export async function updateSeatBooking(id, bookingData) {
    const response = await api.patch(`/seat-bookings/${id}`, bookingData);
    return response.data;
  }
  
  export async function deleteSeatBooking(id) {
    const response = await api.delete(`/seat-bookings/${id}`);
    return response.data;
  }

  export async function getFloors() {
    const res = await api.get('/floors');
    return res.data; // [{ floor_number: 1 }, ...]
  }
  
  export async function getAvailableSeats(floor) {
    const res = await api.get(`/floors/${floor}/seats/available`);
    return res.data; // [{ seat_number: 1 }, ...]
  }
  
  export const createAdminMeetingRoom = async (dto) => {
    const user = getUser();
    const response = await api.post(
      '/admin/meeting-rooms',
      dto,
      { headers: { 'x-user-id': user.user_id } }
    );
    return response.data;
  };
  
  export const createAdminFloor = async (dto) => {
    const user = getUser();
    const response = await api.post(
      '/admin/floors',
      dto,
      { headers: { 'x-user-id': user.user_id } }
    );
    return response.data;
  };
  
  export const createAdminCafe = async (dto) => {
    const user = getUser();
    const response = await api.post(
      '/admin/cafes',
      dto,
      { headers: { 'x-user-id': user.user_id } }
    );
    return response.data;
  };

  export const getUnreadNotifications = async (userId) => {
    try {
      console.log(`Fetching unread notifications for user ${userId}`);
      const response = await api.get(`/notifications?userId=${userId}`);
      console.log('Notification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error.response ? error.response.data : error;
    }
  };
  
  export const markNotificationAsRead = async (notificationId, userId) => {
    try {
      console.log(`Marking notification ${notificationId} as read for user ${userId}`);
      const response = await api.post(`/notifications/${notificationId}/read?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error.response ? error.response.data : error;
    }
  };

  export default api;