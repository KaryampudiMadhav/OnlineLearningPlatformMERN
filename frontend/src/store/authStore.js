import { create } from 'zustand';
import api from '../config/api';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,

  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  },

  signup: async (name, email, password, role) => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed' 
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  getMe: async () => {
    try {
      set({ loading: true });
      const response = await api.get('/auth/me');
      set({ user: response.data.user, loading: false });
    } catch {
      set({ loading: false });
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));

export default useAuthStore;
