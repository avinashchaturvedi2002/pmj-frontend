import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || 'An error occurred';
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
      
      return Promise.reject({
        message,
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        message: 'No response from server. Please check your connection.',
        status: 0,
      });
    } else {
      // Error in request setup
      return Promise.reject({
        message: error.message || 'Request failed',
        status: 0,
      });
    }
  }
);

export default api;


