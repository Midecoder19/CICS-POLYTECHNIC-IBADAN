import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/AuthService';

const AuthContext = createContext({
  user: null,
  login: () => Promise.reject(new Error('AuthProvider not found')),
  register: () => Promise.reject(new Error('AuthProvider not found')),
  verifyEmail: () => Promise.reject(new Error('AuthProvider not found')),
  verifyPhone: () => Promise.reject(new Error('AuthProvider not found')),
  forgotPassword: () => Promise.reject(new Error('AuthProvider not found')),
  resetPassword: () => Promise.reject(new Error('AuthProvider not found')),
  getProfile: () => Promise.reject(new Error('AuthProvider not found')),
  updateProfile: () => Promise.reject(new Error('AuthProvider not found')),
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a default context to prevent crashes
    return {
      user: null,
      login: () => Promise.reject(new Error('AuthProvider not found')),
      register: () => Promise.reject(new Error('AuthProvider not found')),
      verifyEmail: () => Promise.reject(new Error('AuthProvider not found')),
      verifyPhone: () => Promise.reject(new Error('AuthProvider not found')),
      forgotPassword: () => Promise.reject(new Error('AuthProvider not found')),
      resetPassword: () => Promise.reject(new Error('AuthProvider not found')),
      getProfile: () => Promise.reject(new Error('AuthProvider not found')),
      updateProfile: () => Promise.reject(new Error('AuthProvider not found')),
      logout: () => {},
      isAuthenticated: false,
    };
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Don't load from localStorage on mount

  // Clear authentication data on app start to require login on refresh
  useEffect(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('memberToken');
    localStorage.removeItem('memberUser');
  }, []);

  const login = async (username, password) => {
    const userData = await AuthService.login(username, password);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    return await AuthService.register(userData);
  };

  const verifyEmail = async (token) => {
    return await AuthService.verifyEmail(token);
  };

  const verifyPhone = async (phone, code) => {
    return await AuthService.verifyPhone(phone, code);
  };

  const forgotPassword = async (email) => {
    return await AuthService.forgotPassword(email);
  };

  const resetPassword = async (token, newPassword) => {
    return await AuthService.resetPassword(token, newPassword);
  };

  const getProfile = async () => {
    const userData = await AuthService.getProfile();
    setUser(userData);
    return userData;
  };

  const updateProfile = async (profileData) => {
    const updatedUser = await AuthService.updateProfile(profileData);
    setUser(updatedUser);
    return updatedUser;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    verifyEmail,
    verifyPhone,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    logout,
    isAuthenticated: AuthService.isAuthenticated(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
