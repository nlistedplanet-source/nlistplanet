import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState('buyer');
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

  const signup = (userData) => {
    const emailExists = users.some(u => u.email === userData.email);
    if (emailExists) return { success: false };

    // Generate unique user ID
    const userCount = users.length + 1;
    const userId = `USR${String(userCount).padStart(3, '0')}`;

    const newUser = {
      id: Date.now(),
      userId,
      ...userData,
      walletBalance: 50000,
      roles: ['buyer', 'seller'], // All new users are regular users only
      rating: 5,
      emailVerified: userData.emailVerified || false,
      mobileVerified: userData.mobileVerified || false,
      joinedDate: new Date().toISOString(),
    };
    setUsers([...users, newUser]);
    setUser(newUser);
    return { success: true };
  };

  const signin = (email, password) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return { success: false };
    setUser(found);
    return { success: true, user: found };
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
    <AuthContext.Provider value={{ user, currentRole, switchRole, signup, signin, logout, users, getUserDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}
