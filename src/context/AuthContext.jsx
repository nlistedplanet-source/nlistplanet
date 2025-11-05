import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([
    // Pre-created admin account
    {
      id: 1,
      userId: 'ADMIN001',
      name: 'Admin',
      email: 'admin@unlisted.com',
      password: 'admin123',
      mobile: '9999999999',
      userType: 'admin',
      walletBalance: 1000000,
      roles: ['buyer', 'seller', 'admin'],
      rating: 5,
      emailVerified: true,
      mobileVerified: true,
      joinedDate: '2025-01-01T00:00:00Z',
    },
    // Test User 1 - Individual
    {
      id: 2,
      userId: 'USR002',
      name: 'Rahul Kumar',
      email: 'rahul@gmail.com',
      password: 'rahul123',
      mobile: '9876543210',
      userType: 'individual',
      walletBalance: 50000,
      roles: ['buyer', 'seller'],
      rating: 4.5,
      emailVerified: true,
      mobileVerified: true,
      joinedDate: '2025-01-15T00:00:00Z',
    },
    // Test User 2 - HNI
    {
      id: 3,
      userId: 'USR003',
      name: 'Priya Sharma',
      email: 'priya@gmail.com',
      password: 'priya123',
      mobile: '9876543211',
      userType: 'hni',
      walletBalance: 500000,
      roles: ['buyer', 'seller'],
      rating: 4.8,
      emailVerified: true,
      mobileVerified: true,
      joinedDate: '2025-01-20T00:00:00Z',
    },
    // Test User 3 - Institutional
    {
      id: 4,
      userId: 'USR004',
      name: 'Vikram Singh',
      email: 'vikram@gmail.com',
      password: 'vikram123',
      mobile: '9876543212',
      userType: 'institutional',
      walletBalance: 1000000,
      roles: ['buyer', 'seller'],
      rating: 4.9,
      emailVerified: true,
      mobileVerified: true,
      joinedDate: '2025-02-01T00:00:00Z',
    },
    // Test User 4 - Individual
    {
      id: 5,
      userId: 'USR005',
      name: 'Anjali Gupta',
      email: 'anjali@gmail.com',
      password: 'anjali123',
      mobile: '9876543213',
      userType: 'individual',
      walletBalance: 75000,
      roles: ['buyer', 'seller'],
      rating: 4.2,
      emailVerified: true,
      mobileVerified: true,
      joinedDate: '2025-02-10T00:00:00Z',
    }
  ]);

  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.signup(userData);
      if (response.data.success) {
        const token = response.data.token;
        localStorage.setItem('authToken', token);
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      return { success: false };
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.response?.data?.error || 'Signup failed';
      setError(apiMessage);
      throw new Error(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  const signin = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.signin(email, password);
      if (response.data.success) {
        const token = response.data.token;
        localStorage.setItem('authToken', token);
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      return { success: false };
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.response?.data?.error || 'Invalid credentials';
      setError(apiMessage);
      throw new Error(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  const sendEmailOTP = async (email) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.sendEmailOTP(email);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email OTP');
      throw new Error(err.response?.data?.message || 'Failed to send email OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOTP = async (email, otp) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.verifyEmailOTP(email, otp);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email OTP');
      throw new Error(err.response?.data?.message || 'Invalid email OTP');
    } finally {
      setLoading(false);
    }
  };

  const sendMobileOTP = async (mobile) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.sendMobileOTP(mobile);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send mobile OTP');
      throw new Error(err.response?.data?.message || 'Failed to send mobile OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyMobileOTP = async (mobile, otp) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.verifyMobileOTP(mobile, otp);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid mobile OTP');
      throw new Error(err.response?.data?.message || 'Invalid mobile OTP');
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email, mobile) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.requestPasswordReset({ email, mobile });
      return response.data;
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to send reset OTP';
      setError(apiMessage);
      throw new Error(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async ({ email, mobile, otp, newPassword }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.resetPassword({ email, mobile, otp, newPassword });
      return response.data;
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to reset password';
      setError(apiMessage);
      throw new Error(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentRole('buyer');
  };

  const switchRole = (role) => {
    if (user?.roles.includes(role)) setCurrentRole(role);
  };

  // Get user display name (User ID for normal users, Name for admin)
  const getUserDisplayName = (userName, userEmail, isAdminView = false) => {
    if (isAdminView || user?.roles?.includes('admin')) {
      return userName; // Admin can see full names
    }
    // Find user by name or email and return their User ID
    const foundUser = users.find(u => u.name === userName || u.email === userEmail);
    return foundUser?.userId || userName;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      currentRole, 
      switchRole, 
      signup, 
      signin, 
      logout, 
      users, 
      getUserDisplayName,
      sendEmailOTP,
      verifyEmailOTP,
      sendMobileOTP,
      verifyMobileOTP,
      requestPasswordReset,
      resetPassword,
      loading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}
