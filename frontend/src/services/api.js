import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
};

// Rapids API
export const rapidsAPI = {
  getAll: (params) => api.get('/rapids', { params }),
  getById: (id) => api.get(`/rapids/${id}`),
  search: (query) => api.get(`/rapids/search/${query}`),
};

// Discussions API
export const discussionsAPI = {
  getByRapidId: (rapidId) => api.get(`/discussions/rapid/${rapidId}`),
  getById: (id) => api.get(`/discussions/${id}`),
  create: (data) => api.post('/discussions', data),
  reply: (id, data) => api.post(`/discussions/${id}/reply`, data),
  delete: (id) => api.delete(`/discussions/${id}`),
};

// Photos API
export const photosAPI = {
  getByRapidId: (rapidId) => api.get(`/photos/rapid/${rapidId}`),
  upload: (formData) => api.post('/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/photos/${id}`),
};

export default api;
