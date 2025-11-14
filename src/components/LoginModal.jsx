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
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
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
          <div className="relative">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              required
              className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition peer placeholder-transparent"
              placeholder="Enter your full name"
            />
            <label className="absolute left-4 top-2 text-xs text-gray-600 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-600">
              👤 Full Name
            </label>
          </div>

          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              required
              className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition peer placeholder-transparent"
              placeholder="your.email@example.com"
            />
            <label className="absolute left-4 top-2 text-xs text-gray-600 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-600">
              📧 Email Address
            </label>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleFormChange}
              required
              className="w-full px-4 pt-6 pb-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition peer placeholder-transparent"
              placeholder="Create a strong password"
            />
            <label className="absolute left-4 top-2 text-xs text-gray-600 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-600">
              🔒 Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <div className="relative">
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleFormChange}
              required
              className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition peer placeholder-transparent"
              placeholder="9580118412"
            />
            <label className="absolute left-4 top-2 text-xs text-gray-600 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-600">
              📱 Mobile Number
            </label>
          </div>
        </>
      );
    }

    if (isForgot) {
      return (
        <>
          {forgotStep === 1 ? (
            <>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={forgotData.email}
                  onChange={handleForgotChange}
                  required
                  className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition peer placeholder-transparent"
                  placeholder="your.email@example.com"
                />
                <label className="absolute left-4 top-2 text-xs text-gray-600 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-600">
                  📧 Registered Email
                </label>
              </div>

              <div className="relative">
                <input
                  type="tel"
                  name="mobile"
                  value={forgotData.mobile}
                  onChange={handleForgotChange}
                  required
                  className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition peer placeholder-transparent"
                  placeholder="9580118412"
                />
                <label className="absolute left-4 top-2 text-xs text-gray-600 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-600">
                  📱 Registered Mobile
                </label>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <input
                  type="text"
                  name="otp"
                  value={forgotData.otp}
                  onChange={handleForgotChange}
                  required
                  maxLength={6}
                  className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-center tracking-widest peer placeholder-transparent"
                  placeholder="000000"
                />
                <label className="absolute left-4 top-2 text-xs text-gray-600 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-600">
                  🔢 OTP
                </label>
              </div>

              <div className="relative">
                <label className="absolute left-4 top-2 text-xs text-gray-600 transition-all z-10 bg-white px-1">
                  🔒 New Password
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={forgotData.newPassword}
                  onChange={handleForgotChange}
                  required
                  className="w-full px-4 pt-6 pb-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="Enter new password"
                />
                <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  >
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
              </div>

              <div className="relative">
                <label className="absolute left-4 top-2 text-xs text-gray-600 transition-all z-10 bg-white px-1">
                  ✅ Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={forgotData.confirmPassword}
                  onChange={handleForgotChange}
                  required
                  className="w-full px-4 pt-6 pb-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
              </div>
            </>
          )}
        </>
      );
    }

    return (
      <>
        <div className="relative">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            required
            className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition peer placeholder-transparent"
            placeholder="your.email@example.com"
          />
          <label className="absolute left-4 top-2 text-xs text-gray-600 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-600">
            📧 Email Address
          </label>
        </div>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleFormChange}
            required
            className="w-full px-4 pt-6 pb-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition peer placeholder-transparent"
            placeholder="Enter your password"
          />
          <label className="absolute left-4 top-2 text-xs text-gray-600 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-purple-600">
            🔒 Password
          </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-8">
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
