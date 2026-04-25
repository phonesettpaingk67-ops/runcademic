import { create } from 'zustand';
import { api } from '../services/api';

/**
 * Auth Store - Manages user authentication state
 */
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  // Initialize from localStorage
  init: () => {
    const storedUser = localStorage.getItem('runcademic_user');
    const storedToken = localStorage.getItem('access_token');
    const updates = {};
    
    if (storedToken) {
      updates.token = storedToken;
    }
    
    if (storedUser) {
      try {
        updates.user = JSON.parse(storedUser);
      } catch (e) {
        localStorage.removeItem('runcademic_user');
      }
    }
    
    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },

  // Fetch current user
  fetchUser: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.users.getProfile();
      const user = response.data.data || response.data;
      set({ user, loading: false });
      localStorage.setItem('runcademic_user', JSON.stringify(user));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Update user
  updateUser: async (updates) => {
    set({ loading: true });
    try {
      const response = await api.users.updateProfile(updates);
      const user = response.data.data || response.data;
      set({ user, loading: false });
      localStorage.setItem('runcademic_user', JSON.stringify(user));
      return user;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // Ignore errors on logout
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('runcademic_user');
    set({ user: null, token: null });
    window.location.href = '/login';
  },

  // Set token and user
  setToken: (token, userData) => {
    set({ token, user: userData });
    localStorage.setItem('access_token', token);
    if (userData) {
      localStorage.setItem('runcademic_user', JSON.stringify(userData));
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

/**
 * Tickets Store - Manages ticket state
 */
export const useTicketsStore = create((set) => ({
  tickets: [],
  loading: false,
  error: null,
  currentTicket: null,

  // Fetch all tickets
  fetchTickets: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await api.tickets.list(filters);
      set({ tickets: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch single ticket
  fetchTicket: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.tickets.getById(id);
      const ticket = response.data.data || response.data;
      set({ currentTicket: ticket, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Create ticket
  createTicket: async (ticketData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.tickets.create(ticketData);
      const ticket = response.data.data || response.data;
      set((state) => ({
        tickets: [ticket, ...state.tickets],
        loading: false,
      }));
      return ticket;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  // Update ticket
  updateTicket: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await api.tickets.update(id, updates);
      const ticket = response.data.data || response.data;
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === id ? ticket : t)),
        currentTicket: ticket,
        loading: false,
      }));
      return ticket;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete ticket
  deleteTicket: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.tickets.delete(id);
      set((state) => ({
        tickets: state.tickets.filter((t) => t.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

/**
 * Comments Store - Manages comment state
 */
export const useCommentsStore = create((set) => ({
  comments: [],
  loading: false,
  error: null,

  // Fetch comments for ticket
  fetchComments: async (ticketId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.comments.list(ticketId);
      const comments = response.data.data || response.data;
      set({ comments, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Create comment
  createComment: async (commentData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.comments.create(commentData);
      const comment = response.data.data || response.data;
      set((state) => ({
        comments: [comment, ...state.comments],
        loading: false,
      }));
      return comment;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update comment
  updateComment: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await api.comments.update(id, updates);
      const comment = response.data.data || response.data;
      set((state) => ({
        comments: state.comments.map((c) => (c.id === id ? comment : c)),
        loading: false,
      }));
      return comment;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete comment
  deleteComment: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.comments.delete(id);
      set((state) => ({
        comments: state.comments.filter((c) => c.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
