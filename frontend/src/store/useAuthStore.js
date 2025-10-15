import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../config/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      // Register
      register: async (name, email, password) => {
        try {
          set({ isLoading: true, error: null });

          const response = await api.post('/auth/register', {
            name,
            email,
            password,
          });

          if (response.data.success) {
            const { user, accessToken, refreshToken } = response.data.data;

            // Save tokens to localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            set({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return { success: true, message: 'Registration successful!' };
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || 'Registration failed. Please try again.';
          set({ error: errorMessage, isLoading: false });
          return { success: false, message: errorMessage };
        }
      },

      // Login
      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });

          const response = await api.post('/auth/login', {
            email,
            password,
          });

          if (response.data.success) {
            const { user, accessToken, refreshToken } = response.data.data;

            // Save tokens to localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            set({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return { success: true, message: 'Login successful!' };
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || 'Login failed. Please try again.';
          set({ error: errorMessage, isLoading: false });
          return { success: false, message: errorMessage };
        }
      },

      // Logout
      logout: async () => {
        try {
          set({ isLoading: true });

          // Call logout API
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear everything regardless of API success
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Get current user
      getMe: async () => {
        try {
          set({ isLoading: true });

          const response = await api.get('/auth/me');

          if (response.data.success) {
            const user = response.data.data;
            localStorage.setItem('user', JSON.stringify(user));

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });

            return { success: true, user };
          }
        } catch (error) {
          console.error('Get user error:', error);
          set({ isLoading: false });
          return { success: false };
        }
      },

      // Initialize auth from localStorage
      initializeAuth: () => {
        const storedUser = localStorage.getItem('user');
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');

        if (storedUser && storedAccessToken) {
          try {
            const user = JSON.parse(storedUser);
            set({
              user,
              accessToken: storedAccessToken,
              refreshToken: storedRefreshToken,
              isAuthenticated: true,
            });

            // Optionally refresh user data
            get().getMe();
          } catch (error) {
            console.error('Error parsing stored user:', error);
            get().logout();
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
