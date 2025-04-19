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

export default api;