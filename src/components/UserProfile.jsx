import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const PERSONAL_FIELDS = ['dob', 'gender', 'address', 'city', 'state', 'pincode'];
const BANK_FIELDS = ['accountHolderName', 'bankName', 'accountNumber', 'ifsc', 'branchName', 'accountType'];
const DEMAT_FIELDS = ['dpName', 'dpId', 'clientId', 'brokingHouse', 'tradingExperience'];
const DOCUMENT_KEYS = ['pan', 'aadhar', 'cancelCheque', 'cmlCopy'];
const DOCUMENT_LIST = [
  { key: 'pan', label: 'PAN Card', helper: 'Upload a clear copy of your PAN card.' },
  { key: 'aadhar', label: 'Aadhaar Card', helper: 'Front and back in a single PDF or image.' },
  { key: 'cancelCheque', label: 'Cancelled Cheque', helper: 'Use a recent cheque leaf with “Cancelled” written across.' },
  { key: 'cmlCopy', label: 'Client Master List (CML)', helper: 'Download from your broker and upload the latest signed copy.' }
];

const normalizeDocument = (value) => {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    const fileName = value.split('/').pop() || 'document';
    return { name: fileName, data: value };
  }
  if (value.fileName || value.name) {
    return {
      name: value.name || value.fileName,
      data: value.data || value.url || value.fileUrl || ''
    };
  }
  return value;
};

const createInitialFormData = (currentUser) => ({
  name: currentUser?.name || '',
  email: currentUser?.email || '',
  mobile: currentUser?.mobile || '',
  profilePhoto: currentUser?.profilePhoto || '',
  hideContactInfo: currentUser?.hideContactInfo || false,
  personal: {
    dob: currentUser?.personal?.dob || '',
    gender: currentUser?.personal?.gender || '',
    address: currentUser?.personal?.address || '',
    city: currentUser?.personal?.city || '',
    state: currentUser?.personal?.state || '',
    pincode: currentUser?.personal?.pincode || '',
    occupation: currentUser?.personal?.occupation || ''
  },
  bank: {
    accountHolderName: currentUser?.bank?.accountHolderName || currentUser?.name || '',
    bankName: currentUser?.bank?.bankName || '',
    accountNumber: currentUser?.bank?.accountNumber || '',
    ifsc: currentUser?.bank?.ifsc || '',
    branchName: currentUser?.bank?.branchName || '',
    accountType: currentUser?.bank?.accountType || '',
    upiId: currentUser?.bank?.upiId || ''
  },
  demat: {
    dpName: currentUser?.demat?.dpName || '',
    dpId: currentUser?.demat?.dpId || '',
    clientId: currentUser?.demat?.clientId || '',
    brokingHouse: currentUser?.demat?.brokingHouse || '',
    nominee: currentUser?.demat?.nominee || '',
    tradingExperience: currentUser?.demat?.tradingExperience || ''
  },
  documents: {
    pan: normalizeDocument(currentUser?.documents?.pan),
    aadhar: normalizeDocument(currentUser?.documents?.aadhar),
    cancelCheque: normalizeDocument(currentUser?.documents?.cancelCheque),
    cmlCopy: normalizeDocument(currentUser?.documents?.cmlCopy)
  }
});

export default function UserProfile() {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => createInitialFormData(user));

  useEffect(() => {
    setFormData(createInitialFormData(user));
  }, [user]);
  const [verificationStep, setVerificationStep] = useState(null); // 'email' or 'mobile'
  const [emailOTP, setEmailOTP] = useState('');
  const [mobileOTP, setMobileOTP] = useState('');
  const [generatedEmailOTP, setGeneratedEmailOTP] = useState('');
  const [generatedMobileOTP, setGeneratedMobileOTP] = useState('');

  const sectionCompletion = useMemo(() => ({
    personal: PERSONAL_FIELDS.every((field) => formData.personal[field]),
    bank: BANK_FIELDS.every((field) => formData.bank[field]),
    demat: DEMAT_FIELDS.every((field) => formData.demat[field]),
    documents: DOCUMENT_KEYS.every((field) => formData.documents[field])
  }), [formData]);

  const profileCompletion = useMemo(() => {
    const totalFields = PERSONAL_FIELDS.length + BANK_FIELDS.length + DEMAT_FIELDS.length + DOCUMENT_KEYS.length;
    const completedPersonal = PERSONAL_FIELDS.filter((field) => formData.personal[field]).length;
    const completedBank = BANK_FIELDS.filter((field) => formData.bank[field]).length;
    const completedDemat = DEMAT_FIELDS.filter((field) => formData.demat[field]).length;
    const completedDocs = DOCUMENT_KEYS.filter((field) => formData.documents[field]).length;
    return Math.round(((completedPersonal + completedBank + completedDemat + completedDocs) / totalFields) * 100);
  }, [formData]);

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
    if (!sectionCompletion.documents) {
      alert('📄 Please upload PAN, Aadhaar, Cancelled Cheque, and CML copy before saving.');
      return;
    }

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
        setFormData((prev) => ({ ...prev, profilePhoto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSectionField = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleDocumentUpload = (docKey, file) => {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docKey]: {
            name: file.name,
            data: reader.result
          }
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (docKey) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docKey]: null
      }
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 w-full max-w-3xl mx-auto my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
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
                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-500">Profile Completion</p>
                      <h3 className="text-sm font-semibold text-gray-900">Complete your investor profile</h3>
                    </div>
                    <span className="text-lg font-bold text-purple-700">{profileCompletion}%</span>
                  </div>
                  <div className="h-2 bg-purple-100 rounded-full mt-3">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {Object.entries(sectionCompletion).map(([key, complete]) => {
                      const label = key === 'documents'
                        ? 'Documents'
                        : `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
                      return (
                        <span
                          key={key}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            complete
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {complete ? '✅' : '⌛'} {label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">Basic Contact Information</h3>
                      <span className="text-xs text-gray-500">{isEditing ? 'Update and save your latest details' : 'Enable edit mode to make changes'}</span>
                    </div>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">Full Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing
                              ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white'
                              : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          required={isEditing}
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
                          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing
                              ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white'
                              : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          required={isEditing}
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
                          onChange={(e) => setFormData((prev) => ({ ...prev, mobile: e.target.value }))}
                          disabled={!isEditing}
                          placeholder="Enter mobile number"
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing
                              ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white'
                              : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          required={isEditing}
                        />
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <label className={`flex items-center gap-3 ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                          <input
                            type="checkbox"
                            checked={formData.hideContactInfo}
                            onChange={(e) => setFormData((prev) => ({ ...prev, hideContactInfo: e.target.checked }))}
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
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">Personal Details</h3>
                      <span className={`text-xs font-semibold ${sectionCompletion.personal ? 'text-emerald-600' : 'text-orange-500'}`}>
                        {sectionCompletion.personal ? 'Complete' : 'Pending'}
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">Date of Birth</label>
                        <input
                          type="date"
                          value={formData.personal.dob}
                          onChange={(e) => updateSectionField('personal', 'dob', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          required={isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">Gender</label>
                        <select
                          value={formData.personal.gender}
                          onChange={(e) => updateSectionField('personal', 'gender', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          required={isEditing}
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">Residential Address</label>
                        <textarea
                          value={formData.personal.address}
                          onChange={(e) => updateSectionField('personal', 'address', e.target.value)}
                          disabled={!isEditing}
                          rows={3}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          placeholder="House no, street, area"
                          required={isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">City</label>
                        <input
                          type="text"
                          value={formData.personal.city}
                          onChange={(e) => updateSectionField('personal', 'city', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          required={isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">State</label>
                        <input
                          type="text"
                          value={formData.personal.state}
                          onChange={(e) => updateSectionField('personal', 'state', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          required={isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">PIN Code</label>
                        <input
                          type="text"
                          value={formData.personal.pincode}
                          onChange={(e) => updateSectionField('personal', 'pincode', e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          placeholder="6-digit"
                          required={isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">Occupation</label>
                        <input
                          type="text"
                          value={formData.personal.occupation}
                          onChange={(e) => updateSectionField('personal', 'occupation', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">Bank Details</h3>
                      <span className={`text-xs font-semibold ${sectionCompletion.bank ? 'text-emerald-600' : 'text-orange-500'}`}>
                        {sectionCompletion.bank ? 'Complete' : 'Pending'}
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold mb-1.5 text-gray-700">Account Holder Name</label>
                          <span className="text-[11px] text-gray-400">Must match bank records</span>
                        </div>
                        <input
                          type="text"
                          value={formData.bank.accountHolderName}
                          onChange={(e) => updateSectionField('bank', 'accountHolderName', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          required={isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">Bank Name</label>
                        <input
                          type="text"
                          value={formData.bank.bankName}
                          onChange={(e) => updateSectionField('bank', 'bankName', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          required={isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">Account Number</label>
                        <input
                          type="text"
                          value={formData.bank.accountNumber}
                          onChange={(e) => updateSectionField('bank', 'accountNumber', e.target.value.replace(/[^0-9]/g, '').slice(0, 18))}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          required={isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">IFSC Code</label>
                        <input
                          type="text"
                          value={formData.bank.ifsc}
                          onChange={(e) => updateSectionField('bank', 'ifsc', e.target.value.toUpperCase().slice(0, 11))}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 uppercase outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          placeholder="e.g., HDFC0001234"
                          required={isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">Branch Name</label>
                        <input
                          type="text"
                          value={formData.bank.branchName}
                          onChange={(e) => updateSectionField('bank', 'branchName', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          required={isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">Account Type</label>
                        <select
                          value={formData.bank.accountType}
                          onChange={(e) => updateSectionField('bank', 'accountType', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          required={isEditing}
                        >
                          <option value="">Select type</option>
                          <option value="savings">Savings</option>
                          <option value="current">Current</option>
                          <option value="nre">NRE</option>
                          <option value="nro">NRO</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">UPI ID (Optional)</label>
                        <input
                          type="text"
                          value={formData.bank.upiId}
                          onChange={(e) => updateSectionField('bank', 'upiId', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          placeholder="name@bank"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">Demat Account Details</h3>
                      <span className={`text-xs font-semibold ${sectionCompletion.demat ? 'text-emerald-600' : 'text-orange-500'}`}>
                        {sectionCompletion.demat ? 'Complete' : 'Pending'}
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">Depository Participant (DP) Name</label>
                        <input
                          type="text"
                          value={formData.demat.dpName}
                          onChange={(e) => updateSectionField('demat', 'dpName', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          required={isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">DP ID</label>
                        <input
                          type="text"
                          value={formData.demat.dpId}
                          onChange={(e) => updateSectionField('demat', 'dpId', e.target.value.toUpperCase().slice(0, 16))}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 uppercase outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          required={isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">Client ID / BO ID</label>
                        <input
                          type="text"
                          value={formData.demat.clientId}
                          onChange={(e) => updateSectionField('demat', 'clientId', e.target.value.replace(/[^0-9]/g, '').slice(0, 16))}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          required={isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">Broking House</label>
                        <input
                          type="text"
                          value={formData.demat.brokingHouse}
                          onChange={(e) => updateSectionField('demat', 'brokingHouse', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">Trading Experience</label>
                        <select
                          value={formData.demat.tradingExperience}
                          onChange={(e) => updateSectionField('demat', 'tradingExperience', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                          required={isEditing}
                        >
                          <option value="">Select experience</option>
                          <option value="new">0-1 years</option>
                          <option value="intermediate">1-3 years</option>
                          <option value="experienced">3-5 years</option>
                          <option value="veteran">5+ years</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-gray-700">Nominee Name (Optional)</label>
                        <input
                          type="text"
                          value={formData.demat.nominee}
                          onChange={(e) => updateSectionField('demat', 'nominee', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none transition ${
                            isEditing ? 'border-gray-200 bg-gray-50 focus:border-purple-500 focus:bg-white' : 'border-gray-100 bg-gray-100 cursor-not-allowed'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">KYC Documents</h3>
                      <span className={`text-xs font-semibold ${sectionCompletion.documents ? 'text-emerald-600' : 'text-orange-500'}`}>
                        {sectionCompletion.documents ? 'Complete' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">Upload clear copies. Supported formats: PDF, JPG, PNG (max 5&nbsp;MB each).</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {DOCUMENT_LIST.map((doc) => {
                        const uploaded = formData.documents[doc.key];
                        return (
                          <div key={doc.key} className="border border-dashed border-gray-300 rounded-xl bg-gray-50 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-gray-900">{doc.label}</h4>
                              <span className={`text-[11px] font-semibold ${uploaded ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {uploaded ? 'Uploaded' : 'Required'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-3 min-h-[32px]">{doc.helper}</p>
                            <div className="flex flex-col gap-2">
                              {uploaded ? (
                                <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                                  <p className="text-xs font-semibold text-gray-800 truncate" title={uploaded.name}>{uploaded.name}</p>
                                  <button
                                    type="button"
                                    onClick={() => removeDocument(doc.key)}
                                    disabled={!isEditing}
                                    className={`mt-2 text-xs font-semibold ${
                                      isEditing ? 'text-red-600 hover:text-red-700' : 'text-gray-400 cursor-not-allowed'
                                    }`}
                                  >
                                    Remove
                                  </button>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-2">No file uploaded yet</div>
                              )}
                              <label
                                className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                                  isEditing
                                    ? 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none'
                                }`}
                              >
                                {uploaded ? 'Replace Document' : 'Upload Document'}
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  className="hidden"
                                  disabled={!isEditing}
                                  onChange={(e) => handleDocumentUpload(doc.key, e.target.files?.[0])}
                                />
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
                      setFormData(createInitialFormData(user));
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
  );
}
