import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://nlistplanet-backend.onrender.com/api'
    : 'http://localhost:5000/api');

console.log('🔗 API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication APIs
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  signin: (email, password) => api.post('/auth/signin', { email, password }),
  sendEmailOTP: (email) => api.post('/auth/send-email-otp', { email }),
  verifyEmailOTP: (email, otp) => api.post('/auth/verify-email-otp', { email, otp }),
  sendMobileOTP: (mobile) => api.post('/auth/send-mobile-otp', { mobile }),
  verifyMobileOTP: (mobile, otp) => api.post('/auth/verify-mobile-otp', { mobile, otp }),
  requestPasswordReset: (payload) => api.post('/auth/forgot-password/send-otp', payload),
  resetPassword: (payload) => api.post('/auth/forgot-password/reset', payload)
};

// User APIs
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateProfile: (userId, updates) => api.patch(`/users/${userId}`, updates)
};

// Listing APIs
export const listingAPI = {
  getAllListings: () => api.get('/listings'),
  createSellListing: (listingData) => api.post('/listings/sell', listingData),
  createBuyRequest: (listingData) => api.post('/listings/buy', listingData),
  placeBid: (listingId, bidData) => api.post(`/listings/${listingId}/bid`, bidData)
};

// Bid APIs
export const bidAPI = {
  getAllBids: () => api.get('/bids')
};

// Companies APIs
export const companyAPI = {
  getAllCompanies: () => api.get('/companies')
};

// Portfolio APIs
export const portfolioAPI = {
  getPortfolio: () => api.get('/portfolio'),
  addTransaction: (transactionData) => api.post('/portfolio/transactions', transactionData),
  updateHoldingPrice: (isin, newPrice) => api.patch(`/portfolio/holdings/${isin}/price`, { newPrice })
};

export default api;
