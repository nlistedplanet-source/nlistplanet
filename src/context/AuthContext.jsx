import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Restore user from localStorage on page load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedRole = localStorage.getItem('currentRole');
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user:', e);
        localStorage.removeItem('user');
      }
    }
    
    if (savedRole) {
      setCurrentRole(savedRole);
    }
  }, []);

  const [users, setUsers] = useState([
    // Pre-created admin account
    {
      id: 1,
      userId: 'ADMIN001',
      username: '@nlistplanet',
      name: 'Admin',
      email: 'nlistedplanet@gmail.com',
      password: 'Div@10390beena',
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
      username: '@rahul_trader',
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
      username: '@priya_investor',
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
      username: '@vikram_wealth',
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
      username: '@anjali_stocks',
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
    setLoading(true);
    setError(null);
    
    try {
      // Set a timeout for the API call
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );
      
      // Try backend API first with timeout
      const apiPromise = authAPI.signup(userData);
      
      try {
        const response = await Promise.race([apiPromise, timeoutPromise]);
        if (response.data.success) {
          const token = response.data.token;
          localStorage.setItem('authToken', token);
          setUser(response.data.user);
          setLoading(false);
          return { success: true, user: response.data.user };
        }
      } catch (apiErr) {
        console.log('Backend signup failed, using local auth:', apiErr.message);
        // Fallback to local authentication
        const existingUser = users.find(u => u.email === userData.email);
        if (existingUser) {
          setLoading(false);
          throw new Error('User already exists');
        }
        
        // Generate username from name
        const generateUsername = (name) => {
          const cleanName = name.toLowerCase().replace(/\s+/g, '_');
          const randomNum = Math.floor(Math.random() * 999);
          return `@${cleanName}_${randomNum}`;
        };
        
        const newUser = {
          id: users.length + 1,
          userId: `USR${String(users.length + 1).padStart(3, '0')}`,
          username: generateUsername(userData.name),
          name: userData.name,
          email: userData.email,
          password: userData.password,
          mobile: userData.mobile,
          userType: 'individual',
          walletBalance: 10000,
          roles: ['buyer', 'seller'],
          rating: 0,
          emailVerified: true,
          mobileVerified: true,
          joinedDate: new Date().toISOString(),
        };
        
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        setLoading(false);
        return { success: true, user: newUser };
      }
      
      setLoading(false);
      return { success: false };
    } catch (err) {
      setLoading(false);
      const apiMessage = err.message || 'Signup failed';
      setError(apiMessage);
      throw new Error(apiMessage);
    }
  };

  const signin = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Set a timeout for the API call
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );
      
      // Try backend API first with timeout
      const apiPromise = authAPI.signin(email, password);
      
      try {
        const response = await Promise.race([apiPromise, timeoutPromise]);
        if (response.data.success) {
          const token = response.data.token;
          localStorage.setItem('authToken', token);
          setUser(response.data.user);
          setLoading(false);
          return { success: true, user: response.data.user };
        }
      } catch (apiErr) {
        console.log('Backend signin failed, using local auth:', apiErr.message);
        // Fallback to local authentication
        const foundUser = users.find(u => u.email === email && u.password === password);
        if (!foundUser) {
          setLoading(false);
          throw new Error('Invalid email or password');
        }
        
        setUser(foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        
        // Set default role based on user type
        const defaultRole = foundUser.roles.includes('admin') ? 'admin' : 'buyer';
        setCurrentRole(defaultRole);
        localStorage.setItem('currentRole', defaultRole);
        
        setLoading(false);
        return { success: true, user: foundUser };
      }
      
      setLoading(false);
      return { success: false };
    } catch (err) {
      setLoading(false);
      const apiMessage = err.message || 'Invalid credentials';
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
      
      // Find user by email and mobile
      const foundUser = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.mobile === mobile
      );

      if (!foundUser) {
        const errorMsg = 'No account found with this email and mobile number combination';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // Generate a mock OTP and store it
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem(`reset_otp_${email}`, JSON.stringify({
        otp,
        email,
        mobile,
        timestamp: Date.now(),
        expiresIn: 10 * 60 * 1000 // 10 minutes
      }));

      console.log('🔐 Reset OTP generated:', otp, 'for', email);
      
      return { 
        success: true, 
        message: 'OTP sent successfully to your registered mobile number',
        // In development, we can show the OTP
        ...(process.env.NODE_ENV === 'development' && { otp })
      };
    } catch (err) {
      const apiMessage = err.message || 'Failed to send reset OTP';
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

      // Verify OTP
      const storedData = localStorage.getItem(`reset_otp_${email}`);
      if (!storedData) {
        const errorMsg = 'OTP expired or not found. Please request a new one.';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      const { otp: validOtp, mobile: validMobile, timestamp, expiresIn } = JSON.parse(storedData);

      // Check if OTP is expired
      if (Date.now() - timestamp > expiresIn) {
        localStorage.removeItem(`reset_otp_${email}`);
        const errorMsg = 'OTP has expired. Please request a new one.';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // Verify OTP and mobile
      if (otp !== validOtp || mobile !== validMobile) {
        const errorMsg = 'Invalid OTP or mobile number';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // Find and update user password
      const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
      if (userIndex === -1) {
        const errorMsg = 'User not found';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // Update password
      const updatedUsers = [...users];
      updatedUsers[userIndex] = {
        ...updatedUsers[userIndex],
        password: newPassword
      };

      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // Clear the OTP
      localStorage.removeItem(`reset_otp_${email}`);

      console.log('✅ Password reset successful for', email);
      
      return { 
        success: true, 
        message: 'Password reset successful. Please sign in with your new password.' 
      };
    } catch (err) {
      const apiMessage = err.message || 'Failed to reset password';
      setError(apiMessage);
      throw new Error(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentRole('buyer');
    localStorage.removeItem('user');
    localStorage.removeItem('currentRole');
    localStorage.removeItem('authToken');
  };

  const switchRole = (role) => {
    if (user?.roles.includes(role)) {
      setCurrentRole(role);
      localStorage.setItem('currentRole', role);
    }
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
