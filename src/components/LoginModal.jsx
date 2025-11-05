import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginModal = ({ isOpen, onClose, setPage }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Email OTP, 3: Mobile OTP
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    mobile: '',
    role: 'individual'
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signin, signup, sendEmailOTP, verifyEmailOTP, sendMobileOTP, verifyMobileOTP } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (step === 1) {
          // Step 1: Send Email OTP
          await sendEmailOTP(formData.email);
          setStep(2);
        } else if (step === 2) {
          // Step 2: Verify Email OTP & Send Mobile OTP
          await verifyEmailOTP(formData.email, otp);
          await sendMobileOTP(formData.mobile);
          setOtp('');
          setStep(3);
        } else if (step === 3) {
          // Step 3: Verify Mobile OTP & Complete Signup
          await verifyMobileOTP(formData.mobile, otp);
          const userData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            mobile: formData.mobile,
            userType: formData.role
          };
          const result = await signup(userData);
          if (result && result.success) {
            onClose();
            setPage(result.user.roles.includes('admin') ? 'admin' : 'user');
          }
        }
      } else {
        // Sign In
        const result = await signin(formData.email, formData.password);
        if (result && result.success) {
          onClose();
          setPage(result.user.roles.includes('admin') ? 'admin' : 'user');
        } else {
          setError('Invalid email or password');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setStep(1);
    setOtp('');
    setFormData({
      email: '',
      password: '',
      name: '',
      mobile: '',
      role: 'individual'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {isSignUp ? '✍️ Sign Up' : '🔑 Sign In'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              ✕
            </button>
          </div>
          <p className="text-purple-100 mt-2 text-sm">
            {isSignUp 
              ? 'Create your account to start trading' 
              : 'Welcome back! Sign in to continue'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {(!isSignUp || step === 1) && (
            <>
              {isSignUp && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    👤 Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={isSignUp}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  📧 Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  🔒 Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your password"
                />
              </div>

              {isSignUp && (
                <>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      � Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      required={isSignUp}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      �💼 Account Type
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white"
                    >
                      <option value="individual">👤 Individual Investor</option>
                      <option value="hni">💎 HNI (High Net Worth)</option>
                      <option value="institutional">🏢 Institutional Investor</option>
                    </select>
                  </div>
                </>
              )}
            </>
          )}

          {/* Step 2: Email OTP */}
          {isSignUp && step === 2 && (
            <div>
              <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-lg mb-4">
                <p className="text-purple-700 font-medium">📧 Email OTP sent to:</p>
                <p className="text-purple-900 font-semibold">{formData.email}</p>
              </div>
              <label className="block text-gray-700 font-medium mb-2">
                🔢 Enter Email OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-center text-2xl font-bold tracking-widest"
                placeholder="000000"
              />
            </div>
          )}

          {/* Step 3: Mobile OTP */}
          {isSignUp && step === 3 && (
            <div>
              <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg mb-4">
                <p className="text-green-700 font-medium">📱 SMS OTP sent to:</p>
                <p className="text-green-900 font-semibold">{formData.mobile}</p>
              </div>
              <label className="block text-gray-700 font-medium mb-2">
                🔢 Enter Mobile OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-center text-2xl font-bold tracking-widest"
                placeholder="000000"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Please wait...' : 
             isSignUp ? 
               (step === 1 ? '📧 Send Email OTP' : 
                step === 2 ? '✅ Verify Email' : 
                '✅ Verify Mobile & Complete') : 
             '🚀 Sign In'}
          </button>

          {step === 1 && (
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="ml-2 text-purple-600 font-semibold hover:text-purple-800 transition"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
