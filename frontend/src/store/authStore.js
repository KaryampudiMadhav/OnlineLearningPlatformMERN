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
      const { user, accessToken } = response.data.data;
      
      console.log('Login response:', { token: accessToken?.substring(0, 20) + '...', user });
      
      localStorage.setItem('token', accessToken);
      set({ user, token: accessToken, isAuthenticated: true });
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error.response?.data);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  },

  signup: async (name, email, password, role) => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { user, accessToken } = response.data.data;
      
      localStorage.setItem('token', accessToken);
      set({ user, token: accessToken, isAuthenticated: true });
      return { success: true, user };
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
      const user = response.data.data;
      set({ user, loading: false });
    } catch (error) {
      console.error('getMe error:', error.response?.status, error.response?.data);
      set({ loading: false });
      // Only logout if token is invalid, not for network errors
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },
}));

export default useAuthStore;
