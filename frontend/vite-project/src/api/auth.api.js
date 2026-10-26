import api from './axios.js';

export const authApi = {
  register: (payload) => api.post('/api/auth/register', payload),
  login: (credentials) => api.post('/api/auth/login', credentials),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
};

export default authApi;
