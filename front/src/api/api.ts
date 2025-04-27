import axios from 'axios';

// Use environment variable with proper fallback for FastAPI backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_KEY = process.env.REACT_APP_API_KEY;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
});

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if unauthorized error (401)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear any auth tokens from localStorage
      localStorage.removeItem('auth_token');
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Add a request interceptor to inject user role and id headers
api.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role) {
          config.headers['X-User-Role'] = user.role;
        }
        if (user.id_usuario) {
          config.headers['current-user-id'] = user.id_usuario;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
); 