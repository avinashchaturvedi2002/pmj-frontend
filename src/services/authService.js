import api from './api';

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data?.token) {
      localStorage.setItem('auth-token', response.data.token);
    }
    return response;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data?.token) {
      localStorage.setItem('auth-token', response.data.token);
    }
    return response;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('auth-token');
    return response;
  },

  // Get current user
  getMe: async () => {
    return await api.get('/auth/me');
  },

  // Update profile
  updateProfile: async (profileData) => {
    return await api.put('/auth/profile', profileData);
  },

  // Change password
  changePassword: async (passwordData) => {
    return await api.put('/auth/password', passwordData);
  },
};


