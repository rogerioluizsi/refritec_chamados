import { api } from '../api/api';

interface LoginCredentials {
  username: string;
  password: string;
}

interface User {
  username: string;
  role: string;
  id_usuario: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<User | null> => {
    try {
      const response = await api.post('/login', credentials);
      if (response.status === 200 && response.data) {
        // Store user info in localStorage
        const user: User = {
          username: credentials.username,
          role: response.data.role,
          id_usuario: response.data.id_usuario,
        };
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  },

  logout: (): void => {
    localStorage.removeItem('user');
  },

  getUser: (): User | null => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('user');
  }
}; 