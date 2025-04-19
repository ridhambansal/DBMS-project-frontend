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
  // use backticks, not single quotes, for the template literal
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

// Fetch existing cafe bookings for a user
export const fetchCafeBookings = async (user_id) => {
  const res = await api.get(`/cafeteria-booking/bookings?user_id=${user_id}`);
  return res.data; // [{ booking_id, cafe_name, booking_date, details }]
};

// Check if a cafe slot is available
export const checkCafeAvailability = async (dto) => {
  const res = await api.post('/cafeteria-booking/availability', dto);
  return res.data; // { available: boolean }
};

// Create a new cafe booking
export const bookCafe = async (dto) => {
  const res = await api.post('/cafeteria-booking', dto);
  return res.data; // { Booking ID, Status }
};

// Update an existing booking
export const updateCafeBooking = async (id, dto) => {
  const res = await api.patch(`/cafeteria-booking/${id}`, dto);
  return res.data; // { success: true }
};

// Cancel a booking
export const cancelCafeBooking = async (id, dto) => {
  const res = await api.delete(`/cafeteria-booking/${id}`, { data: dto });
  return res.data; // { Status: 'Booking successfully canceled' }
};









export default api;