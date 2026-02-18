import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, companyId = null) => {
    try {
      const response = await api.post('/auth/login', { 
        email, 
        password,
        ...(companyId && { companyId })
      });
      const { token, refreshToken, user } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Apply user's theme preference
      if (user.themePreference) {
        localStorage.setItem('theme', user.themePreference);
      }
      
      setToken(token);
      setRefreshToken(refreshToken);
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        lockoutRemaining: error.response?.data?.lockoutRemaining
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const googleLogin = async (credential) => {
    try {
      const response = await api.post('/auth/google', { credential });
      const { token, user } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Apply user's theme preference
      if (user.themePreference) {
        localStorage.setItem('theme', user.themePreference);
      }
      
      setToken(token);
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Google login failed'
      };
    }
  };

  const refreshAccessToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedCompanyId = JSON.parse(localStorage.getItem('user'))?.companyId;
      
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh-token', {
        refreshToken: storedRefreshToken,
        ...(storedCompanyId && { companyId: storedCompanyId })
      });
      
      const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;

      localStorage.setItem('token', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
        setRefreshToken(newRefreshToken);
      }
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(accessToken);
      setUser(user);

      return { success: true, accessToken };
    } catch (error) {
      // Refresh token failed, clear auth state
      logout();
      return {
        success: false,
        message: error.response?.data?.message || 'Token refresh failed'
      };
    }
  };

  const logout = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      if (storedRefreshToken) {
        // Call backend logout endpoint to revoke refresh token
        await api.post('/auth/logout', { refreshToken: storedRefreshToken });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  };

  const logoutAll = async () => {
    try {
      // Call backend logout-all endpoint to revoke all refresh tokens
      await api.post('/auth/logout-all');
    } catch (error) {
      console.error('Error during logout all:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    refreshToken,
    loading,
    login,
    googleLogin,
    register,
    logout,
    logoutAll,
    refreshAccessToken,
    updateUser,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
