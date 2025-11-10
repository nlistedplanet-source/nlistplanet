import React, { createContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Lightweight KYC state derived from user record; defaults to 'incomplete'
  const getKycStatus = (u) => (u?.kycStatus ? u.kycStatus : 'incomplete');

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
        // Ensure KYC defaults on fresh signups
        const normalizedUser = {
          ...response.data.user,
          kycStatus: response.data.user.kycStatus || 'incomplete',
        };
        setUser(normalizedUser);
        
        // Set default role based on user type
  const defaultRole = normalizedUser.roles?.includes('admin') ? 'admin' : 'buyer';
        setCurrentRole(defaultRole);
        localStorage.setItem('currentRole', defaultRole);
        
        setLoading(false);
        return { success: true, user: response.data.user };
      }
      
      setLoading(false);
      return { success: false };
    } catch (err) {
      setLoading(false);
      
      // User-friendly error messages
      let errorMessage = 'Signup failed. Please try again.';
      
      if (err.response) {
        const status = err.response.status;
        const backendMessage = err.response.data?.message || err.response.data?.error;
        
        if (status === 400 && backendMessage?.toLowerCase().includes('email')) {
          errorMessage = 'This email is already registered. Please sign in instead.';
        } else if (status === 400) {
          errorMessage = backendMessage || 'Invalid information provided. Please check your details.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (backendMessage) {
          errorMessage = backendMessage;
        }
      } else if (err.request) {
        errorMessage = 'Backend server is currently unavailable. The server may be starting up (takes ~30 seconds). Please try again in a moment.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
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
        const normalizedUser = {
          ...response.data.user,
          kycStatus: response.data.user.kycStatus || 'incomplete',
        };
        setUser(normalizedUser);
        
        // Set default role based on user type
  const defaultRole = normalizedUser.roles?.includes('admin') ? 'admin' : 'buyer';
        setCurrentRole(defaultRole);
        localStorage.setItem('currentRole', defaultRole);
        
        setLoading(false);
        return { success: true, user: response.data.user };
      }
      
      setLoading(false);
      return { success: false };
    } catch (err) {
      setLoading(false);
      
      // User-friendly error messages
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (err.response) {
        // Backend returned an error response
        const status = err.response.status;
        const backendMessage = err.response.data?.message || err.response.data?.error;
        
        if (status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (status === 404) {
          errorMessage = 'Account not found. Please sign up first.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (backendMessage) {
          errorMessage = backendMessage;
        }
      } else if (err.request) {
        // Request was made but no response received - server is down
        errorMessage = 'Backend server is currently unavailable. The server may be starting up (takes ~30 seconds). Please try again in a moment.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
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
  const response = await userAPI.updateProfile(user?._id || user?.id, updates);
      
      if (response.data.success) {
        // Update local user state with new data
  const updatedUser = { ...user, ...response.data.user };
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      }
      
      return { success: false };
    } catch (err) {
      // User-friendly error messages
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (err.response) {
        const status = err.response.status;
        const backendMessage = err.response.data?.message || err.response.data?.error;
        
        if (status === 403) {
          errorMessage = 'You are not authorized to update this profile.';
        } else if (status === 400 && backendMessage?.toLowerCase().includes('username')) {
          errorMessage = 'This username is already taken. Please choose another one.';
        } else if (status === 404) {
          errorMessage = 'User not found. Please sign in again.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (backendMessage) {
          errorMessage = backendMessage;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // KYC: submit documents (stubbed client action)
  const submitKycDocuments = async (docs) => {
    try {
      setLoading(true);
      setError(null);
      // In a real app, upload docs to backend and set status to 'under_review'
      const response = await userAPI.updateProfile(user?._id || user?.id, {
        kycStatus: 'under_review',
        kycDocuments: docs,
      });
      if (response.data?.success) {
        const updatedUser = { ...user, kycStatus: 'under_review', kycDocuments: docs };
        setUser(updatedUser);
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.message || 'Failed to submit KYC';
      setError(apiMessage);
      throw new Error(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  // Admin or system can update KYC status
  const updateKycStatus = async (status) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.updateProfile(user?._id || user?.id, { kycStatus: status });
      if (response.data?.success) {
        const updatedUser = { ...user, kycStatus: status };
        setUser(updatedUser);
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.message || 'Failed to update KYC status';
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
      getKycStatus,
      submitKycDocuments,
      updateKycStatus,
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
