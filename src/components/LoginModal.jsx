import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const initialFormState = {
  name: '',
  email: '',
  password: '',
  mobile: ''
};

const initialForgotState = {
  email: '',
  mobile: '',
  otp: '',
  newPassword: '',
  confirmPassword: ''
};

const LoginModal = ({ isOpen, onClose, setPage }) => {
  const [authMode, setAuthMode] = useState('signin'); // signin | signup | forgot
  const [formData, setFormData] = useState(initialFormState);
  const [forgotData, setForgotData] = useState(initialForgotState);
  const [forgotStep, setForgotStep] = useState(1);
  const [error, setError] = useState('');
  const [errorAction, setErrorAction] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { signin, signup, requestPasswordReset, resetPassword } = useAuth();

  const isSignUp = authMode === 'signup';
  const isSignIn = authMode === 'signin';
  const isForgot = authMode === 'forgot';

  const headerContent = useMemo(() => {
    if (isSignUp) {
      return {
        title: '✍️ Sign Up',
        subtitle: 'Create your account to start trading'
      };
    }
    if (isForgot) {
      return {
        title: '🔁 Reset Password',
        subtitle: forgotStep === 1 ? 'Request a one-time password to reset your account' : 'Enter the OTP and choose a new password'
      };
    }
    return {
      title: '🔑 Sign In',
      subtitle: 'Welcome back! Sign in to continue'
    };
  }, [isSignUp, isForgot, forgotStep]);

  const handleClose = () => {
    setAuthMode('signin');
    setFormData(initialFormState);
    setForgotData(initialForgotState);
    setForgotStep(1);
    setError('');
    setErrorAction(null);
    setSuccessMessage('');
    setLoading(false);
    onClose();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleForgotChange = (e) => {
    const { name, value } = e.target;
    setForgotData((prev) => ({ ...prev, [name]: value }));
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setError('');
    setErrorAction(null);
    setSuccessMessage('');
    setLoading(false);

    if (mode === 'signup') {
      setFormData(initialFormState);
    }

    if (mode === 'signin') {
      setForgotData(initialForgotState);
      setForgotStep(1);
      setFormData((prev) => ({
        ...initialFormState,
        email: prev.email
      }));
    }

    if (mode === 'forgot') {
      setForgotData((prev) => ({
        ...initialForgotState,
        email: formData.email
      }));
      setForgotStep(1);
    }
  };

  const handleSignup = async () => {
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      mobile: formData.mobile,
      userType: 'individual'
    };

    const result = await signup(payload);
    if (result && result.success) {
      handleClose();
      setPage(result.user.roles.includes('admin') ? 'admin' : 'user');
    }
  };

  const handleSignin = async () => {
    const result = await signin(formData.email, formData.password);
    if (result && result.success) {
      handleClose();
      setPage(result.user.roles.includes('admin') ? 'admin' : 'user');
    } else {
      setError('Invalid email or password');
    }
  };

  const handleForgotFlow = async () => {
    if (forgotStep === 1) {
      if (!forgotData.email || !forgotData.mobile) {
        setError('Please enter your registered email and mobile number');
        return;
      }

      await requestPasswordReset(forgotData.email, forgotData.mobile);
      setSuccessMessage('OTP sent to your registered mobile number.');
      setForgotStep(2);
      setForgotData((prev) => ({ ...prev, otp: '', newPassword: '', confirmPassword: '' }));
      return;
    }

    if (!forgotData.otp || !forgotData.newPassword) {
      setError('Please enter the OTP and new password');
      return;
    }

    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    await resetPassword({
      email: forgotData.email,
      mobile: forgotData.mobile,
      otp: forgotData.otp,
      newPassword: forgotData.newPassword
    });

    setSuccessMessage('Password reset successful. Please sign in with your new password.');
    setFormData((prev) => ({
      ...initialFormState,
      email: forgotData.email
    }));
    setForgotData(initialForgotState);
    setForgotStep(1);
    setAuthMode('signin');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorAction(null);
    if (!successMessage) {
      setSuccessMessage('');
    }

    try {
      setLoading(true);

      if (isForgot) {
        await handleForgotFlow();
        return;
      }

      if (isSignUp) {
        await handleSignup();
        return;
      }

      await handleSignin();
    } catch (err) {
      const message = err.message || 'Something went wrong. Please try again.';
      setError(message);
      if (message.toLowerCase().includes('already')) {
        setErrorAction('signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderAuthFields = () => {
    if (isSignUp) {
      return (
        <>
          <div>
            <label className="block text-gray-700 font-medium mb-2">👤 Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">📧 Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">🔒 Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="Create a strong password"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">📱 Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="9580118412"
            />
          </div>
        </>
      );
    }

    if (isForgot) {
      return (
        <>
          {forgotStep === 1 ? (
            <>
              <div>
                <label className="block text-gray-700 font-medium mb-2">📧 Registered Email</label>
                <input
                  type="email"
                  name="email"
                  value={forgotData.email}
                  onChange={handleForgotChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">📱 Registered Mobile</label>
                <input
                  type="tel"
                  name="mobile"
                  value={forgotData.mobile}
                  onChange={handleForgotChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="9580118412"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-gray-700 font-medium mb-2">🔢 OTP</label>
                <input
                  type="text"
                  name="otp"
                  value={forgotData.otp}
                  onChange={handleForgotChange}
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-center tracking-widest"
                  placeholder="000000"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">🔒 New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={forgotData.newPassword}
                  onChange={handleForgotChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">✅ Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={forgotData.confirmPassword}
                  onChange={handleForgotChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="Re-enter new password"
                />
              </div>
            </>
          )}
        </>
      );
    }

    return (
      <>
        <div>
          <label className="block text-gray-700 font-medium mb-2">📧 Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">🔒 Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleFormChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            placeholder="Enter your password"
          />
        </div>
      </>
    );
  };

  const primaryButtonLabel = useMemo(() => {
    if (loading) return '⏳ Please wait...';
    if (isForgot) {
      return forgotStep === 1 ? '📩 Send OTP' : '🔑 Reset Password';
    }
    return isSignUp ? '✍️ Sign Up' : '🚀 Sign In';
  }, [loading, isForgot, forgotStep, isSignUp]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden my-auto">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">{headerContent.title}</h2>
              <p className="text-purple-100 mt-2 text-sm">{headerContent.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{error}</p>
                  {errorAction === 'signin' && (
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="text-purple-600 text-sm font-semibold hover:text-purple-800 transition"
                    >
                      Go to Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
              {successMessage}
            </div>
          )}

          {renderAuthFields()}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {primaryButtonLabel}
          </button>

          {isSignIn && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-purple-600 font-semibold">
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="hover:text-purple-800 transition"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="hover:text-purple-800 transition"
              >
                Create account
              </button>
            </div>
          )}

          {isSignUp && (
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Already have an account?
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="ml-2 text-purple-600 font-semibold hover:text-purple-800 transition"
                >
                  Sign In
                </button>
              </p>
            </div>
          )}

          {isForgot && (
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Remembered the password?
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="ml-2 text-purple-600 font-semibold hover:text-purple-800 transition"
                >
                  Sign In
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
