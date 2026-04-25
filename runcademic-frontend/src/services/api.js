import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('runcademic_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

export const api = {
  auth: {
    login: (credentials) => apiClient.post('/api/auth/login', credentials),
    logout: () => apiClient.get('/api/auth/logout'),
  },
  users: {
    getProfile: () => apiClient.get('/api/users/me'),
    updateProfile: (data) => apiClient.put('/api/users/me', data),
    list: () => apiClient.get('/api/users'),
    getById: (id) => apiClient.get(`/api/users/${id}`),
    delete: (id) => apiClient.delete(`/api/users/${id}`),
  },
  tickets: {
    list: (params) => apiClient.get('/api/tickets', { params }),
    create: (data) => apiClient.post('/api/tickets', data),
    getById: (id) => apiClient.get(`/api/tickets/${id}`),
    update: (id, data) => apiClient.put(`/api/tickets/${id}`, data),
    delete: (id) => apiClient.delete(`/api/tickets/${id}`),
  },
  schedules: {
    list: (params) => apiClient.get('/api/schedules', { params }),
    create: (data) => apiClient.post('/api/schedules', data),
    update: (id, data) => apiClient.put(`/api/schedules/${id}`, data),
    delete: (id) => apiClient.delete(`/api/schedules/${id}`),
  },
  comments: {
    list: (ticketId) => apiClient.get(`/api/comments?ticket_id=${ticketId}`),
    create: (data) => apiClient.post('/api/comments', data),
    update: (id, data) => apiClient.put(`/api/comments/${id}`, data),
    delete: (id) => apiClient.delete(`/api/comments/${id}`),
  },
  workflow: {
    review: (ticketId, data) => apiClient.post(`/api/workflow/review/${ticketId}`, data),
    assign: (ticketId, data) => apiClient.post(`/api/workflow/assign/${ticketId}`, data),
    startWork: (ticketId, data) => apiClient.post(`/api/workflow/start-work/${ticketId}`, data),
    resolve: (ticketId, data) => apiClient.post(`/api/workflow/resolve/${ticketId}`, data),
    close: (ticketId, data) => apiClient.post(`/api/workflow/close/${ticketId}`, data),
    getHistory: (ticketId) => apiClient.get(`/api/workflow/history/${ticketId}`),
    getAssigned: () => apiClient.get('/api/workflow/assigned'),
    getPending: (status) => apiClient.get(`/api/workflow/pending?status=${status}`),
  },
};
