import { api } from '../api/api';

interface LoginCredentials {
  username: string;
  password: string;
}

// Simple token for authentication
const TOKEN_KEY = 'auth_token';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const response = await api.post('/login', credentials);
      if (response.status === 200) {
        // Store a simple token in localStorage
        localStorage.setItem(TOKEN_KEY, 'authenticated');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  },

  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem(TOKEN_KEY) === 'authenticated';
  }
}; 