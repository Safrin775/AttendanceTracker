import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check session on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = authAPI.getStoredUser();
      if (storedUser) {
        // Verify with backend
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      }
    } catch (err) {
      // Not authenticated
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await authAPI.login(username, password);
      
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true };
      } else {
        setError('Login failed');
        return { success: false };
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      return { success: false, error: err.response?.data?.error };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      return { success: false };
    }
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};