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
  const [activeTab, setActiveTab] = useState('contact');
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
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-2xl shadow-lg p-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">👤 Investor Profile</h1>
            <p className="text-gray-600 mt-1">Complete your KYC and profile information</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-6 py-3 rounded-lg font-bold transition text-lg ${
              isEditing
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
            }`}
          >
            {isEditing ? '✕ Cancel' : '✏️ Edit Profile'}
          </button>
        </div>

        {/* Main Content Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Completion Widget */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-lg font-bold text-purple-700">📊 Profile Completion Status</p>
              <span className="text-3xl font-bold text-purple-700">{profileCompletion}%</span>
            </div>
            <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
              <div
                className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 transition-all rounded-full"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex gap-2 overflow-x-auto px-6 bg-white">
              {[
                { id: 'contact', label: '📧 Contact Info', icon: '📧' },
                { id: 'personal', label: '👤 Personal', icon: '👤' },
                { id: 'bank', label: '🏦 Bank Details', icon: '🏦' },
                { id: 'demat', label: '📈 Demat', icon: '📈' },
                { id: 'documents', label: '📄 Documents', icon: '📄' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-semibold border-b-4 transition whitespace-nowrap text-base ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {/* Profile Photo Section - Always Visible */}
            <div className="flex flex-col items-center mb-12 pb-8 border-b border-gray-200">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-5xl overflow-hidden border-4 border-purple-200">
                  {formData.profilePhoto ? (
                    <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    formData.name.charAt(0).toUpperCase()
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
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
              <h3 className="text-lg font-semibold text-gray-900 mt-4">{formData.name}</h3>
              <p className="text-sm text-gray-500">{formData.email}</p>
            </div>

            {/* Tab Content */}
            <form onSubmit={handleSave} className="space-y-6">
            {/* OTP Verification Sections */}
            {verificationStep === 'email' && (
              <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl">
                <h4 className="text-sm font-bold text-blue-900 mb-3">📧 Verify Email</h4>
                <input 
                  type="text" 
                  placeholder="Enter 6-digit OTP" 
                  value={emailOTP} 
                  onChange={(e) => setEmailOTP(e.target.value)}
                  maxLength="6"
                  className="w-full border-2 border-blue-300 rounded-lg px-3 py-2 text-center font-bold tracking-widest"
                  required 
                />
              </div>
            )}

            {verificationStep === 'mobile' && (
              <div className="bg-green-50 border-2 border-green-200 p-4 rounded-xl">
                <h4 className="text-sm font-bold text-green-900 mb-3">📱 Verify Mobile</h4>
                <input 
                  type="text" 
                  placeholder="Enter 6-digit OTP" 
                  value={mobileOTP} 
                  onChange={(e) => setMobileOTP(e.target.value)}
                  maxLength="6"
                  className="w-full border-2 border-green-300 rounded-lg px-3 py-2 text-center font-bold tracking-widest"
                  required 
                />
              </div>
            )}

            {/* Contact Info Tab */}
            {activeTab === 'contact' && !verificationStep && (
              <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 text-gray-900 outline-none transition ${
                    isEditing 
                      ? 'border-purple-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address {isEditing && emailChanged && <span className="text-orange-500">*</span>}
                </label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 text-gray-900 outline-none transition ${
                    isEditing 
                      ? 'border-purple-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number {isEditing && mobileChanged && <span className="text-orange-500">*</span>}
                </label>
                <input 
                  type="tel" 
                  value={formData.mobile}
                  onChange={(e) => setFormData((prev) => ({ ...prev, mobile: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="10-digit number"
                  className={`w-full border-2 rounded-lg px-4 py-3 text-gray-900 outline-none transition ${
                    isEditing 
                      ? 'border-purple-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <label className={`flex items-center gap-3 ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                <input
                  type="checkbox"
                  checked={formData.hideContactInfo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hideContactInfo: e.target.checked }))}
                  disabled={!isEditing}
                  className="w-5 h-5"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-700">🔒 Hide contact details from other users</p>
                  <p className="text-xs text-gray-500 mt-1">Your email and mobile will be private</p>
                </div>
              </label>
            </div>
          </div>
            )}

            {/* Personal Info Tab */}
            {activeTab === 'personal' && !verificationStep && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                value={formData.personal.dob}
                onChange={(e) => updateSectionField('personal', 'dob', e.target.value)}
                disabled={!isEditing}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
              <select
                value={formData.personal.gender}
                onChange={(e) => updateSectionField('personal', 'gender', e.target.value)}
                disabled={!isEditing}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <textarea
                value={formData.personal.address}
                onChange={(e) => updateSectionField('personal', 'address', e.target.value)}
                disabled={!isEditing}
                rows={3}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={formData.personal.city}
                onChange={(e) => updateSectionField('personal', 'city', e.target.value)}
                disabled={!isEditing}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={formData.personal.state}
                onChange={(e) => updateSectionField('personal', 'state', e.target.value)}
                disabled={!isEditing}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">PIN Code</label>
              <input
                type="text"
                value={formData.personal.pincode}
                onChange={(e) => updateSectionField('personal', 'pincode', e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                disabled={!isEditing}
                placeholder="6-digit"
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Occupation</label>
              <input
                type="text"
                value={formData.personal.occupation}
                onChange={(e) => updateSectionField('personal', 'occupation', e.target.value)}
                disabled={!isEditing}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>
          </div>
            )}

            {/* Bank Details Tab */}
            {activeTab === 'bank' && !verificationStep && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account Holder Name</label>
              <input
                type="text"
                value={formData.bank.accountHolderName}
                onChange={(e) => updateSectionField('bank', 'accountHolderName', e.target.value)}
                disabled={!isEditing}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Name</label>
              <input
                type="text"
                value={formData.bank.bankName}
                onChange={(e) => updateSectionField('bank', 'bankName', e.target.value)}
                disabled={!isEditing}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account Number</label>
              <input
                type="text"
                value={formData.bank.accountNumber}
                onChange={(e) => updateSectionField('bank', 'accountNumber', e.target.value.replace(/[^0-9]/g, ''))}
                disabled={!isEditing}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">IFSC Code</label>
              <input
                type="text"
                value={formData.bank.ifsc}
                onChange={(e) => updateSectionField('bank', 'ifsc', e.target.value.toUpperCase())}
                disabled={!isEditing}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 uppercase outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Branch Name</label>
              <input
                type="text"
                value={formData.bank.branchName}
                onChange={(e) => updateSectionField('bank', 'branchName', e.target.value)}
                disabled={!isEditing}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
              <select
                value={formData.bank.accountType}
                onChange={(e) => updateSectionField('bank', 'accountType', e.target.value)}
                disabled={!isEditing}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              >
                <option value="">Select type</option>
                <option value="savings">Savings</option>
                <option value="current">Current</option>
                <option value="nre">NRE</option>
              </select>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">UPI ID (Optional)</label>
              <input
                type="text"
                value={formData.bank.upiId}
                onChange={(e) => updateSectionField('bank', 'upiId', e.target.value)}
                disabled={!isEditing}
                placeholder="name@bank"
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>
          </div>
            )}

            {/* Demat Tab */}
            {activeTab === 'demat' && !verificationStep && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">DP Name</label>
              <input
                type="text"
                value={formData.demat.dpName}
                onChange={(e) => updateSectionField('demat', 'dpName', e.target.value)}
                disabled={!isEditing}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">DP ID</label>
              <input
                type="text"
                value={formData.demat.dpId}
                onChange={(e) => updateSectionField('demat', 'dpId', e.target.value.toUpperCase())}
                disabled={!isEditing}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 uppercase outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Client ID / BO ID</label>
              <input
                type="text"
                value={formData.demat.clientId}
                onChange={(e) => updateSectionField('demat', 'clientId', e.target.value)}
                disabled={!isEditing}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Broking House</label>
              <input
                type="text"
                value={formData.demat.brokingHouse}
                onChange={(e) => updateSectionField('demat', 'brokingHouse', e.target.value)}
                disabled={!isEditing}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trading Experience</label>
              <select
                value={formData.demat.tradingExperience}
                onChange={(e) => updateSectionField('demat', 'tradingExperience', e.target.value)}
                disabled={!isEditing}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              >
                <option value="">Select experience</option>
                <option value="new">Beginner (0-1 years)</option>
                <option value="intermediate">Intermediate (1-3 years)</option>
                <option value="experienced">Experienced (3-5 years)</option>
                <option value="veteran">Expert (5+ years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nominee (Optional)</label>
              <input
                type="text"
                value={formData.demat.nominee}
                onChange={(e) => updateSectionField('demat', 'nominee', e.target.value)}
                disabled={!isEditing}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-gray-900 outline-none transition ${
                  isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                }`}
              />
            </div>
          </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && !verificationStep && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DOCUMENT_LIST.map((doc) => {
              const uploaded = formData.documents[doc.key];
              return (
                <div key={doc.key} className="border-2 border-dashed border-purple-200 rounded-lg bg-purple-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{doc.label}</h4>
                    <span className={`text-xs font-bold ${uploaded ? 'text-green-600' : 'text-gray-500'}`}>
                      {uploaded ? '✓' : 'Required'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{doc.helper}</p>
                  {uploaded ? (
                    <div className="bg-white p-2 rounded border border-gray-200 mb-2">
                      <p className="text-xs font-semibold text-gray-800 truncate">{uploaded.name}</p>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeDocument(doc.key)}
                          className="mt-2 text-xs text-red-600 font-semibold hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ) : null}
                  <label
                    className={`block text-center px-3 py-2 rounded font-semibold text-sm transition ${
                      isEditing
                        ? 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {uploaded ? 'Replace' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      disabled={!isEditing}
                      onChange={(e) => handleDocumentUpload(doc.key, e.target.files?.[0])}
                    />
                  </label>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t">
          {isEditing && (
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
                className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 px-4 py-2.5 rounded-lg text-white font-semibold transition ${
                  verificationStep === 'email' 
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : verificationStep === 'mobile'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {verificationStep === 'email' 
                  ? 'Verify Email'
                  : verificationStep === 'mobile'
                    ? 'Verify Mobile'
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
    </div>
  );
}