import React, { useEffect, useMemo, useState } from 'react';
import useUserProfile from '../hooks/useUserProfile';

// Helper functions for DOB format conversion
const formatDobForDisplay = (isoDate) => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}-${month}-${year}`;
};

const formatDobForStorage = (ddmmyyyy) => {
  if (!ddmmyyyy) return '';
  const [day, month, year] = ddmmyyyy.split('-');
  return `${year}-${month}-${day}`;
};

const PERSONAL_FIELDS = ['dob', 'gender', 'address', 'city', 'state', 'pincode'];
const BANK_FIELDS = ['accountHolderName', 'bankName', 'accountNumber', 'ifsc', 'branchName', 'accountType'];
const DEMAT_FIELDS = ['dpName', 'dpId', 'clientId', 'brokingHouse', 'tradingExperience'];
const DOCUMENT_KEYS = ['pan', 'aadhar', 'cancelCheque', 'cmlCopy'];

const DOCUMENT_LIST = [
  { key: 'pan', label: 'PAN Card', helper: 'Upload a clear copy of your PAN card.' },
  { key: 'aadhar', label: 'Aadhaar Card', helper: 'Front and back in a single PDF or image.' },
  { key: 'cancelCheque', label: 'Cancelled Cheque', helper: 'Use a recent cheque leaf with "Cancelled" written across.' },
  { key: 'cmlCopy', label: 'Client Master List (CML)', helper: 'Download from your broker and upload the latest signed copy.' }
];

const TABS = [
  { id: 'contact', label: '📧 Contact' },
  { id: 'personal', label: '👤 Personal' },
  { id: 'bank', label: '🏦 Bank' },
  { id: 'demat', label: '📈 Demat' },
  { id: 'documents', label: '📄 Documents' }
];

const mockUser = {
  username: 'beena_yadav',
  userId: 'USR_2024_002',
  name: 'Beena Yadav',
  email: 'beena@nlist.com',
  mobile: '9876543210',
  personal: {
    dob: '1992-03-20',
    gender: 'female',
    address: '456 Business Avenue, Tech Park',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    occupation: 'Financial Analyst'
  },
  bank: {
    accountHolderName: 'Beena Yadav',
    bankName: 'ICICI Bank',
    accountNumber: '9876543210',
    ifsc: 'ICIC0000002',
    branchName: 'Mumbai Main',
    accountType: 'savings',
    upiId: 'beena@icici',
    status: 'verified'
  },
  demat: {
    dpName: 'NSDL',
    dpId: 'DP000002',
    clientId: 'CLI987654',
    brokingHouse: 'Motilal Oswal',
    nominee: 'Akshay Yadav',
    tradingExperience: 'intermediate',
    status: 'verified'
  },
  documents: {
    pan: null,
    aadhar: null,
    cancelCheque: { name: 'cheque.pdf', data: '' },
    cmlCopy: null
  }
};

export default function UserProfileWithEditOptions({ currentUser = mockUser }) {
  const [activeTab, setActiveTab] = useState('contact');
  
  // Hook for API integration
  const {
    profile: apiProfile,
    updateProfile: apiUpdateProfile,
    sendOTP: apiSendOTP,
    verifyOTP: apiVerifyOTP,
    uploadPhoto: apiUploadPhoto,
    uploadDocument: apiUploadDocument,
  } = useUserProfile();
  
  // Ensure formData always has complete structure
  const [formData, setFormData] = useState(() => ({
    ...currentUser,
    personal: currentUser?.personal || {},
    bank: currentUser?.bank || {},
    demat: currentUser?.demat || {},
    documents: currentUser?.documents || {}
  }));
  const [profilePhoto, setProfilePhoto] = useState(null);
  
  // Sync API profile to local state when loaded
  useEffect(() => {
    if (apiProfile && apiProfile.name !== 'Guest User') {
      setFormData(apiProfile);
      if (apiProfile.bank) setBankEditData(apiProfile.bank);
      if (apiProfile.demat) setDematEditData(apiProfile.demat);
    }
  }, [apiProfile]);
  
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingMobile, setEditingMobile] = useState(false);
  const [editingBank, setEditingBank] = useState(false);
  const [editingDemat, setEditingDemat] = useState(false);
  
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpField, setOtpField] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [tempData, setTempData] = useState({});
  
  const [bankEditData, setBankEditData] = useState(currentUser?.bank || {});
  const [dematEditData, setDematEditData] = useState(currentUser?.demat || {});

  const profileCompletion = useMemo(() => {
    if (!formData || !formData.personal || !formData.bank || !formData.demat || !formData.documents) {
      return 0;
    }
    const totalFields = PERSONAL_FIELDS.length + BANK_FIELDS.length + DEMAT_FIELDS.length + DOCUMENT_KEYS.length;
    const completedPersonal = PERSONAL_FIELDS.filter((field) => formData.personal[field]).length;
    const completedBank = BANK_FIELDS.filter((field) => formData.bank[field]).length;
    const completedDemat = DEMAT_FIELDS.filter((field) => formData.demat[field]).length;
    const completedDocs = DOCUMENT_KEYS.filter((field) => formData.documents[field]).length;
    return Math.round(((completedPersonal + completedBank + completedDemat + completedDocs) / totalFields) * 100);
  }, [formData]);

  const updateSectionField = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [field]: value }
    }));
  };

  const handleSendOTP = async (field) => {
    if (field === 'email' && editingEmail) {
      setOtpField('email');
      setTempData({ email: formData.email });
      try {
        const response = await apiSendOTP('email', formData.email);
        console.log('Email OTP response:', response);
        setShowOTPModal(true);
        alert('✅ OTP sent to your email! Check your inbox.');
      } catch (err) {
        console.error('Email OTP error:', err);
        alert('❌ Failed to send OTP to email: ' + (err.message || 'Unknown error'));
      }
    } else if (field === 'mobile' && editingMobile) {
      setOtpField('mobile');
      
      // Validate mobile number
      const mobileNum = formData.mobile.replace(/\s+/g, '');
      if (!/^\d{10}$/.test(mobileNum)) {
        alert('❌ Please enter a valid 10-digit mobile number');
        return;
      }
      
      setTempData({ mobile: formData.mobile });
      try {
        // Add +91 prefix for Indian mobile numbers
        const mobileWithPrefix = `+91${mobileNum}`;
        console.log('Sending OTP to:', mobileWithPrefix);
        
        const response = await apiSendOTP('mobile', mobileWithPrefix);
        console.log('Mobile OTP response:', response);
        setShowOTPModal(true);
        alert('✅ OTP sent to your mobile! Check your SMS.\n\n⚠️ Note: If using Twilio trial account, verify your number in Twilio Console first.');
      } catch (err) {
        console.error('Mobile OTP error:', err);
        alert('❌ Failed to send OTP to mobile: ' + (err.message || 'Unknown error') + '\n\n💡 Twilio trial accounts can only send to verified numbers. Please verify your number in Twilio Console.');
      }
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const res = await apiVerifyOTP(otpField, otpCode);
      if (res && res.ok) {
        setFormData((prev) => ({ ...prev, ...tempData }));
        // Try to update profile via API
        try {
          await apiUpdateProfile({ ...formData, ...tempData });
        } catch (err) {
          console.log('Profile update fallback to local');
        }
        setShowOTPModal(false);
        setOtpCode('');
        setEditingEmail(false);
        setEditingMobile(false);
        alert('✅ ' + (otpField === 'email' ? 'Email' : 'Mobile') + ' verified successfully!');
      } else {
        alert('❌ Invalid OTP. Please check and try again!');
      }
    } catch (err) {
      alert('❌ Invalid OTP. Try again!');
    }
  };

  const handleBankEditChange = (field, value) => {
    setBankEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBankSubmit = async () => {
    try {
      await apiUpdateProfile({ bank: bankEditData });
      setFormData(prev => ({ ...prev, bank: bankEditData }));
      alert('✅ Bank details saved successfully!');
    } catch (err) {
      // Fallback to local update
      setFormData(prev => ({ ...prev, bank: bankEditData }));
      alert('✅ Bank details saved locally!');
    } finally {
      setEditingBank(false);
    }
  };

  const handleDematEditChange = (field, value) => {
    setDematEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDematSubmit = async () => {
    try {
      await apiUpdateProfile({ demat: dematEditData });
      setFormData(prev => ({ ...prev, demat: dematEditData }));
      alert('✅ Demat details saved successfully!');
    } catch (err) {
      setFormData(prev => ({ ...prev, demat: dematEditData }));
      alert('✅ Demat details saved locally!');
    } finally {
      setEditingDemat(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await apiUploadPhoto(file);
      const url = res?.url || res?.data;
      if (url) {
        setProfilePhoto(url);
        await apiUpdateProfile({ ...formData, profilePhoto: url });
        alert('✅ Profile photo updated!');
      }
    } catch (err) {
      // Fallback to local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
        alert('✅ Profile photo updated (local preview)!');
      };
      reader.readAsDataURL(file);
    }
  };

  const inputClass = `w-full border-2 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none transition border-purple-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200`;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-2 px-2 sm:px-3 lg:px-4">
      <div className="w-full">
        
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl sm:text-4xl overflow-hidden border-4 border-white shadow-lg">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  formData.name?.charAt(0).toUpperCase() || 'B'
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 shadow-lg transition">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{formData.name}</h1>
              <div className="mt-2 sm:mt-3 flex flex-col gap-1 text-xs sm:text-sm text-gray-600">
                <p>👤 Username: <span className="font-semibold text-gray-900">{currentUser.username}</span></p>
                <p>🆔 User ID: <span className="font-semibold text-gray-900">{currentUser.userId}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion Alert */}
        {profileCompletion < 100 && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-2 sm:p-3 flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
            <span className="text-lg flex-shrink-0">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-900 text-xs sm:text-sm">Profile incomplete — complete your KYC</p>
              <div className="mt-1 bg-white rounded overflow-hidden h-1.5">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <p className="text-xs text-amber-800 mt-1">Completion: <strong>{profileCompletion}%</strong></p>
            </div>
          </div>
        )}

        {/* Tabs Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-fit px-3 sm:px-6 py-3 sm:py-4 font-semibold transition text-sm sm:text-base whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            
            {/* CONTACT TAB */}
            {activeTab === 'contact' && (
              <div className="space-y-4 sm:space-y-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Email Address</label>
                  {!editingEmail ? (
                    <div className="flex gap-2 items-center">
                      <input type="email" value={formData.email} disabled className="flex-1 border-2 border-gray-200 bg-gray-50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none" />
                      <button onClick={() => setEditingEmail(true)} className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm">Edit</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="flex-1 border-2 border-purple-300 bg-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                      <button onClick={() => handleSendOTP('email')} className="px-3 sm:px-4 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm whitespace-nowrap">Send OTP</button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Mobile Number</label>
                  {!editingMobile ? (
                    <div className="flex gap-2 items-center">
                      <input type="tel" value={formData.mobile} disabled className="flex-1 border-2 border-gray-200 bg-gray-50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none" />
                      <button onClick={() => setEditingMobile(true)} className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm">Edit</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input type="tel" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="flex-1 border-2 border-purple-300 bg-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200" />
                      <button onClick={() => handleSendOTP('mobile')} className="px-3 sm:px-4 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm whitespace-nowrap">Send OTP</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PERSONAL TAB */}
            {activeTab === 'personal' && (
              <div className="space-y-4 sm:space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth (DD-MM-YYYY)</label>
                    <input 
                      type="text" 
                      placeholder="DD-MM-YYYY"
                      value={formatDobForDisplay(formData.personal.dob)} 
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9-]/g, '');
                        // Allow user to type, convert on blur or when complete
                        if (val.length === 10 && val.match(/^\d{2}-\d{2}-\d{4}$/)) {
                          updateSectionField('personal', 'dob', formatDobForStorage(val));
                        } else {
                          // Store intermediate input temporarily
                          updateSectionField('personal', 'dob', val);
                        }
                      }}
                      onBlur={(e) => {
                        const val = e.target.value;
                        if (val.length === 10 && val.match(/^\d{2}-\d{2}-\d{4}$/)) {
                          updateSectionField('personal', 'dob', formatDobForStorage(val));
                        }
                      }}
                      className={inputClass} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                    <select value={formData.personal.gender} onChange={(e) => updateSectionField('personal', 'gender', e.target.value)} className={inputClass}>
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Occupation</label>
                    <input type="text" value={formData.personal.occupation} onChange={(e) => updateSectionField('personal', 'occupation', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                    <input type="text" value={formData.personal.city} onChange={(e) => updateSectionField('personal', 'city', e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <textarea value={formData.personal.address} onChange={(e) => updateSectionField('personal', 'address', e.target.value)} rows={3} className={inputClass} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                    <input type="text" value={formData.personal.state} onChange={(e) => updateSectionField('personal', 'state', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">PIN Code</label>
                    <input type="text" value={formData.personal.pincode} onChange={(e) => updateSectionField('personal', 'pincode', e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} className={inputClass} />
                  </div>
                </div>
              </div>
            )}

            {/* BANK TAB */}
            {activeTab === 'bank' && (
              <div className="space-y-4 sm:space-y-6 animate-fadeIn">
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-gray-900">Current Bank Details</h3>
                    {!editingBank && (
                      <button onClick={() => { setEditingBank(true); setBankEditData(formData.bank); }} className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-xs font-semibold">✏️ Edit</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-600">Account Holder:</span> <span className="font-semibold">{formData.bank.accountHolderName}</span></div>
                    <div><span className="text-gray-600">Bank:</span> <span className="font-semibold">{formData.bank.bankName}</span></div>
                    <div><span className="text-gray-600">Account No:</span> <span className="font-semibold">{formData.bank.accountNumber}</span></div>
                    <div><span className="text-gray-600">IFSC:</span> <span className="font-semibold">{formData.bank.ifsc}</span></div>
                  </div>
                </div>

                {editingBank && (
                  <div className="space-y-4 border-2 border-purple-300 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">Edit Bank Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <input type="text" placeholder="Account Holder" value={bankEditData.accountHolderName} onChange={(e) => handleBankEditChange('accountHolderName', e.target.value)} className={inputClass} />
                      <input type="text" placeholder="Bank Name" value={bankEditData.bankName} onChange={(e) => handleBankEditChange('bankName', e.target.value)} className={inputClass} />
                      <input type="text" placeholder="Account Number" value={bankEditData.accountNumber} onChange={(e) => handleBankEditChange('accountNumber', e.target.value)} className={inputClass} />
                      <input type="text" placeholder="IFSC" value={bankEditData.ifsc} onChange={(e) => handleBankEditChange('ifsc', e.target.value)} className={inputClass} />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setEditingBank(false)} className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-sm">Cancel</button>
                      <button onClick={handleBankSubmit} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm">💾 Save</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DEMAT TAB */}
            {activeTab === 'demat' && (
              <div className="space-y-4 sm:space-y-6 animate-fadeIn">
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-gray-900">Current Demat Details</h3>
                    {!editingDemat && (
                      <button onClick={() => { setEditingDemat(true); setDematEditData(formData.demat); }} className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-xs font-semibold">✏️ Edit</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-600">DP Name:</span> <span className="font-semibold">{formData.demat.dpName}</span></div>
                    <div><span className="text-gray-600">Client ID:</span> <span className="font-semibold">{formData.demat.clientId}</span></div>
                    <div><span className="text-gray-600">Broking House:</span> <span className="font-semibold">{formData.demat.brokingHouse}</span></div>
                    <div><span className="text-gray-600">Experience:</span> <span className="font-semibold">{formData.demat.tradingExperience}</span></div>
                  </div>
                </div>

                {editingDemat && (
                  <div className="space-y-4 border-2 border-purple-300 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">Edit Demat Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <input type="text" placeholder="DP Name" value={dematEditData.dpName} onChange={(e) => handleDematEditChange('dpName', e.target.value)} className={inputClass} />
                      <input type="text" placeholder="Client ID" value={dematEditData.clientId} onChange={(e) => handleDematEditChange('clientId', e.target.value)} className={inputClass} />
                      <input type="text" placeholder="Broking House" value={dematEditData.brokingHouse} onChange={(e) => handleDematEditChange('brokingHouse', e.target.value)} className={inputClass} />
                      <select value={dematEditData.tradingExperience} onChange={(e) => handleDematEditChange('tradingExperience', e.target.value)} className={inputClass}>
                        <option value="">Experience</option>
                        <option value="new">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="experienced">Experienced</option>
                        <option value="veteran">Expert</option>
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setEditingDemat(false)} className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-sm">Cancel</button>
                      <button onClick={handleDematSubmit} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm">💾 Save</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <div className="space-y-4 sm:space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {DOCUMENT_LIST.map((doc) => (
                    <div key={doc.key} className="border-2 border-gray-200 rounded-lg p-4 sm:p-6 hover:border-purple-300 transition">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{doc.label}</h4>
                        <span className="text-lg font-bold text-gray-300">○</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">{doc.helper}</p>
                      <label className="block text-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm bg-purple-600 text-white hover:bg-purple-700 transition cursor-pointer">
                        Upload Document
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              await apiUploadDocument(doc.key, file);
                              setFormData((prev) => ({
                                ...prev,
                                documents: { ...prev.documents, [doc.key]: { name: file.name, data: '' } }
                              }));
                              alert('✅ Document uploaded: ' + file.name);
                            } catch (err) {
                              // Fallback to local storage
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData((prev) => ({
                                  ...prev,
                                  documents: { ...prev.documents, [doc.key]: { name: file.name, data: reader.result } }
                                }));
                                alert('✅ Document uploaded (local): ' + file.name);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verify OTP</h2>
            <p className="text-gray-600 mb-4">Enter the OTP sent to your {otpField}</p>
            <input 
              type="text" 
              placeholder="Enter 6-digit OTP" 
              value={otpCode} 
              onChange={(e) => setOtpCode(e.target.value)} 
              className="w-full border-2 border-purple-300 rounded-lg px-4 py-3 mb-4 outline-none focus:border-purple-500" 
              maxLength="6" 
            />
            <div className="flex gap-3">
              <button onClick={() => setShowOTPModal(false)} className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleVerifyOTP} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">Verify</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}