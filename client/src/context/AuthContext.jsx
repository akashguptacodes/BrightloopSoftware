import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  // Check session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.getMe();
        const userData = response.data?.user || response.user || response.data || null;
        setUser(userData);
      } catch {
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    const userData = response.data?.user || response.user || response.data || null;
    const token = response.data?.token || response.token;
    if (token) {
      localStorage.setItem('token', token);
    }
    setUser(userData);
    return response.data || response;
  };

  const register = async (name, email, password) => {
    const data = await authService.register({ name, email, password });
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, initialized, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
