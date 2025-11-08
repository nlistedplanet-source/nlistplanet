import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function UserProfile({ onClose }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    profilePhoto: user?.profilePhoto || '',
    hideContactInfo: user?.hideContactInfo || false
  });
  const [verificationStep, setVerificationStep] = useState(null); // 'email' or 'mobile'
  const [emailOTP, setEmailOTP] = useState('');
  const [mobileOTP, setMobileOTP] = useState('');
  const [generatedEmailOTP, setGeneratedEmailOTP] = useState('');
  const [generatedMobileOTP, setGeneratedMobileOTP] = useState('');

  if (!user) {
    return null;
  }

  // Generate random 6-digit OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Check if email or mobile changed
  const emailChanged = formData.email !== user.email;
  const mobileChanged = formData.mobile !== user.mobile;

  const handleSave = (e) => {
    e.preventDefault();
    
    // If email or mobile changed, start verification
    if (emailChanged && verificationStep === null) {
      const otp = generateOTP();
      setGeneratedEmailOTP(otp);
      alert(`📧 Email OTP sent to ${formData.email}\nOTP: ${otp} (Demo)`);
      setVerificationStep('email');
      return;
    }

    if (verificationStep === 'email') {
      if (emailOTP === generatedEmailOTP) {
        alert('✅ Email verified successfully!');
        // If mobile also changed, verify it next
        if (mobileChanged) {
          const otp = generateOTP();
          setGeneratedMobileOTP(otp);
          alert(`📱 SMS OTP sent to ${formData.mobile}\nOTP: ${otp} (Demo)`);
          setVerificationStep('mobile');
          return;
        }
      } else {
        alert('❌ Invalid email OTP. Please try again.');
        return;
      }
    }

    if (verificationStep === 'mobile') {
      if (mobileOTP === generatedMobileOTP) {
        alert('✅ Mobile verified successfully!');
      } else {
        alert('❌ Invalid mobile OTP. Please try again.');
        return;
      }
    }

    // If only mobile changed (no email change)
    if (mobileChanged && !emailChanged && verificationStep === null) {
      const otp = generateOTP();
      setGeneratedMobileOTP(otp);
      alert(`📱 SMS OTP sent to ${formData.mobile}\nOTP: ${otp} (Demo)`);
      setVerificationStep('mobile');
      return;
    }

    // All verifications passed or no verification needed
    alert('✅ Profile updated successfully!');
    setIsEditing(false);
    setVerificationStep(null);
    setEmailOTP('');
    setMobileOTP('');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePhoto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[100] px-4 animate-fadeIn" onClick={onClose} style={{ margin: 0, padding: '1rem' }}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()} style={{ margin: 'auto' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-900 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-2 border-gray-100 rounded-xl p-4">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-4xl overflow-hidden">
                {formData.profilePhoto ? (
                  <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  formData.name.charAt(0).toUpperCase()
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-purple-700 transition shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-gray-600 text-xs mt-3">Click the camera icon to upload photo</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSave} className="space-y-4">
            {/* Show OTP verification if email changed */}
            {verificationStep === 'email' && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-500 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Verify Email</h3>
                    <p className="text-blue-600 text-xs">OTP sent to {formData.email}</p>
                  </div>
                </div>
                <input 
                  type="text" 
                  placeholder="Enter 6-digit OTP" 
                  value={emailOTP} 
                  onChange={(e) => setEmailOTP(e.target.value)}
                  maxLength="6"
                  className="w-full border-2 border-blue-300 rounded-lg px-3 py-2 bg-white text-gray-900 text-center text-lg tracking-widest font-bold"
                  required 
                />
              </div>
            )}

            {/* Show OTP verification if mobile changed */}
            {verificationStep === 'mobile' && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-green-500 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Verify Mobile</h3>
                    <p className="text-green-600 text-xs">SMS sent to {formData.mobile}</p>
                  </div>
                </div>
                <input 
                  type="text" 
                  placeholder="Enter 6-digit OTP" 
                  value={mobileOTP} 
                  onChange={(e) => setMobileOTP(e.target.value)}
                  maxLength="6"
                  className="w-full border-2 border-green-300 rounded-lg px-3 py-2 bg-white text-gray-900 text-center text-lg tracking-widest font-bold"
                  required 
                />
              </div>
            )}

            {/* Show form fields only when not in verification mode */}
            {!verificationStep && (
              <>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-gray-700">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                      isEditing 
                        ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' 
                        : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-gray-700">
                    Email Address
                    {isEditing && emailChanged && <span className="text-orange-500 ml-1">⚠️ Will require verification</span>}
                  </label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                      isEditing 
                        ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' 
                        : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-gray-700">
                    Mobile Number
                    {isEditing && mobileChanged && <span className="text-orange-500 ml-1">⚠️ Will require verification</span>}
                  </label>
                  <input 
                    type="tel" 
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter mobile number"
                    className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                      isEditing 
                        ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' 
                        : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                    }`}
                  />
                </div>
                
                {/* Privacy Settings */}
                <div className="border-t border-gray-200 pt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hideContactInfo}
                      onChange={(e) => setFormData({ ...formData, hideContactInfo: e.target.checked })}
                      disabled={!isEditing}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">🔒 Hide Contact Information</p>
                      <p className="text-xs text-gray-600">
                        When enabled, your email and mobile number will be hidden from other users. They will only see your username.
                      </p>
                    </div>
                  </label>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-3">
              {!isEditing && !verificationStep ? (
                <button 
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-purple-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-purple-700 shadow-lg transition"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setVerificationStep(null);
                      setEmailOTP('');
                      setMobileOTP('');
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        mobile: user?.mobile || '',
                        profilePhoto: user?.profilePhoto || ''
                      });
                    }}
                    className="flex-1 border-2 border-gray-200 rounded-lg py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className={`flex-1 text-white rounded-lg py-2.5 text-sm font-bold shadow-lg transition ${
                      verificationStep === 'email' 
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : verificationStep === 'mobile'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {verificationStep === 'email' 
                      ? '✉️ Verify Email'
                      : verificationStep === 'mobile'
                        ? '📱 Verify Mobile'
                        : 'Save Changes'
                    }
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
