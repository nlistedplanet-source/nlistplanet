import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('🔗 API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
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
  verifyMobileOTP: (mobile, otp) => api.post('/auth/verify-mobile-otp', { mobile, otp })
};

// User APIs
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`)
};

// Listing APIs
export const listingAPI = {
  getAllListings: () => api.get('/listings'),
  createSellListing: (listingData) => api.post('/listings/sell', listingData),
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

export default api;
