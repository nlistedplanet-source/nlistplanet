import React, { createContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Restore user from localStorage on page load (for JWT persistence only)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedRole = localStorage.getItem('currentRole');
    
    if (token && savedRole) {
      // Token exists, restore role
      setCurrentRole(savedRole);
      // User data will be fetched from backend using the token if needed
    }
  }, []);

  const signup = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call backend API for signup
      const response = await authAPI.signup(userData);
      
      if (response.data.success) {
        const token = response.data.token;
        localStorage.setItem('authToken', token);
        setUser(response.data.user);
        
        // Set default role based on user type
        const defaultRole = response.data.user.roles?.includes('admin') ? 'admin' : 'buyer';
        setCurrentRole(defaultRole);
        localStorage.setItem('currentRole', defaultRole);
        
        setLoading(false);
        return { success: true, user: response.data.user };
      }
      
      setLoading(false);
      return { success: false };
    } catch (err) {
      setLoading(false);
      const apiMessage = err.response?.data?.message || err.message || 'Signup failed';
      setError(apiMessage);
      throw new Error(apiMessage);
    }
  };

  const signin = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call backend API for signin
      const response = await authAPI.signin(email, password);
      
      if (response.data.success) {
        const token = response.data.token;
        localStorage.setItem('authToken', token);
        setUser(response.data.user);
        
        // Set default role based on user type
        const defaultRole = response.data.user.roles?.includes('admin') ? 'admin' : 'buyer';
        setCurrentRole(defaultRole);
        localStorage.setItem('currentRole', defaultRole);
        
        setLoading(false);
        return { success: true, user: response.data.user };
      }
      
      setLoading(false);
      return { success: false };
    } catch (err) {
      setLoading(false);
      const apiMessage = err.response?.data?.message || err.message || 'Invalid credentials';
      setError(apiMessage);
      throw new Error(apiMessage);
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
      
      // Call backend API for password reset request
      const response = await authAPI.requestPasswordReset(email, mobile);
      
      return response.data;
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.message || 'Failed to send reset OTP';
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

      // Call backend API for password reset
      const response = await authAPI.resetPassword({ email, mobile, otp, newPassword });
      
      return response.data;
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.message || 'Failed to reset password';
      setError(apiMessage);
      throw new Error(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentRole('buyer');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentRole');
  };

  const switchRole = (role) => {
    if (user?.roles.includes(role)) {
      setCurrentRole(role);
      localStorage.setItem('currentRole', role);
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);

      // Call backend API to update user profile
      const response = await userAPI.updateProfile(user._id || user.id, updates);
      
      if (response.data.success) {
        // Update local user state with new data
        const updatedUser = { ...user, ...response.data.user };
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      }
      
      return { success: false };
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.message || 'Failed to update profile';
      setError(apiMessage);
      throw new Error(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get user display name (User ID for normal users, Name for admin)
  const getUserDisplayName = (userName, userEmail, isAdminView = false) => {
    if (isAdminView || user?.roles?.includes('admin')) {
      return userName; // Admin can see full names
    }
    // Return user ID or name based on privacy settings
    return userName;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      currentRole, 
      switchRole, 
      signup, 
      signin, 
      logout, 
      updateUserProfile,
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
