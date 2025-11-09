import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

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

const normalizeDocument = (value) => {
  if (!value) return null;
  if (typeof value === 'string') {
    const fileName = value.split('/').pop() || 'document';
    return { name: fileName, data: value };
  }
  if (value.fileName || value.name) {
    return { name: value.name || value.fileName, data: value.data || value.url || value.fileUrl || '' };
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

  const profileCompletion = useMemo(() => {
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
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, profilePhoto: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentUpload = (docKey, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docKey]: { name: file.name, data: reader.result }
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (docKey) => {
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [docKey]: null }
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log('Profile saved:', formData);
  };

  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-white py-8 px-2 sm:px-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* Profile Photo */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-4xl overflow-hidden border-4 border-white shadow-lg">
                {formData.profilePhoto ? (
                  <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  formData.name.charAt(0).toUpperCase()
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{formData.name}</h1>
              <p className="text-gray-600 mt-1">{formData.email}</p>
              <div className="mt-3 flex flex-col gap-1 text-sm text-gray-600">
                <p>👤 Username: <span className="font-semibold text-gray-900">{user.username || 'N/A'}</span></p>
                <p>🆔 User ID: <span className="font-semibold text-gray-900">{user.userId || 'N/A'}</span></p>
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="mt-4 px-4 py-2 border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition"
                >
                  Change Photo
                </button>
              )}
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-6 py-3 rounded-lg font-bold transition text-base ${
                isEditing
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isEditing ? '✕ Cancel' : '✏️ Edit Profile'}
            </button>
          </div>
        </div>

        {/* Profile Incomplete Alert */}
        {profileCompletion < 100 && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-amber-900">Profile incomplete — complete your KYC</p>
              <p className="text-sm text-amber-800 mt-1">Completion: <strong>{profileCompletion}%</strong></p>
            </div>
          </div>
        )}

        {/* Main Form - Fields directly without card wrapper */}
        <form onSubmit={handleSave} className="space-y-8">
          {/* Contact Information - Direct fields */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-purple-200">📧 Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
                    isEditing 
                      ? 'border-purple-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
                    isEditing 
                      ? 'border-purple-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Mobile Number</label>
                <input 
                  type="tel" 
                  value={formData.mobile}
                  onChange={(e) => setFormData((prev) => ({ ...prev, mobile: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="10-digit num"
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
                    isEditing 
                      ? 'border-purple-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200' 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Personal Information - Direct fields */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-purple-200">👤 Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Date of Birth</label>
                <input
                  type="date"
                  value={formData.personal.dob}
                  onChange={(e) => updateSectionField('personal', 'dob', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
                    isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Gender</label>
                <select
                  value={formData.personal.gender}
                  onChange={(e) => updateSectionField('personal', 'gender', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
                    isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Occupation</label>
                <input
                  type="text"
                  value={formData.personal.occupation}
                  onChange={(e) => updateSectionField('personal', 'occupation', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
                    isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div className="lg:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Address</label>
                <textarea
                  value={formData.personal.address}
                  onChange={(e) => updateSectionField('personal', 'address', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
                    isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  value={formData.personal.city}
                  onChange={(e) => updateSectionField('personal', 'city', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
                    isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">State</label>
                <input
                  type="text"
                  value={formData.personal.state}
                  onChange={(e) => updateSectionField('personal', 'state', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
                    isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">PIN Code</label>
                <input
                  type="text"
                  value={formData.personal.pincode}
                  onChange={(e) => updateSectionField('personal', 'pincode', e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  disabled={!isEditing}
                  placeholder="6-digit"
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
                    isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Bank Details - Direct fields */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-purple-200">🏦 Bank Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Account Holder Name</label>
                <input
                  type="text"
                  value={formData.bank.accountHolderName}
                  onChange={(e) => updateSectionField('bank', 'accountHolderName', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
                    isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Bank Name</label>
                <input
                  type="text"
                  value={formData.bank.bankName}
                  onChange={(e) => updateSectionField('bank', 'bankName', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
                    isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Account Number</label>
                <input
                  type="text"
                  value={formData.bank.accountNumber}
                  onChange={(e) => updateSectionField('bank', 'accountNumber', e.target.value.replace(/[^0-9]/g, ''))}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
                    isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">IFSC Code</label>
                <input
                  type="text"
                  value={formData.bank.ifsc}
                  onChange={(e) => updateSectionField('bank', 'ifsc', e.target.value.toUpperCase())}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 uppercase outline-none transition ${
                    isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Branch Name</label>
                <input
                  type="text"
                  value={formData.bank.branchName}
                  onChange={(e) => updateSectionField('bank', 'branchName', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
                    isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Account Type</label>
                <select
                  value={formData.bank.accountType}
                  onChange={(e) => updateSectionField('bank', 'accountType', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
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
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">UPI ID (Optional)</label>
                <input
                  type="text"
                  value={formData.bank.upiId}
                  onChange={(e) => updateSectionField('bank', 'upiId', e.target.value)}
                  disabled={!isEditing}
                  placeholder="name@bank"
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
                    isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Demat Details - Direct fields */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-purple-200">📈 Demat Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">DP Name</label>
                <input
                  type="text"
                  value={formData.demat.dpName}
                  onChange={(e) => updateSectionField('demat', 'dpName', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
                    isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">DP ID</label>
                <input
                  type="text"
                  value={formData.demat.dpId}
                  onChange={(e) => updateSectionField('demat', 'dpId', e.target.value.toUpperCase())}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 uppercase outline-none transition ${
                    isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Client ID / BO ID</label>
                <input
                  type="text"
                  value={formData.demat.clientId}
                  onChange={(e) => updateSectionField('demat', 'clientId', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
                    isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Broking House</label>
                <input
                  type="text"
                  value={formData.demat.brokingHouse}
                  onChange={(e) => updateSectionField('demat', 'brokingHouse', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
                    isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Trading Experience</label>
                <select
                  value={formData.demat.tradingExperience}
                  onChange={(e) => updateSectionField('demat', 'tradingExperience', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
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
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Nominee (Optional)</label>
                <input
                  type="text"
                  value={formData.demat.nominee}
                  onChange={(e) => updateSectionField('demat', 'nominee', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full border-2 rounded-lg px-4 py-3 outline-none transition ${
                    isEditing ? 'border-purple-300 bg-white focus:border-purple-500' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Documents - Direct fields */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-purple-200">📄 Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {DOCUMENT_LIST.map((doc) => {
                const uploaded = formData.documents[doc.key];
                return (
                  <div key={doc.key} className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 text-sm">{doc.label}</h4>
                      <span className={`text-xs font-bold ${uploaded ? 'text-green-600' : 'text-gray-400'}`}>
                        {uploaded ? '✓' : '○'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{doc.helper}</p>
                    {uploaded && (
                      <div className="bg-gray-50 p-2 rounded mb-2">
                        <p className="text-xs font-semibold text-gray-700 truncate">{uploaded.name}</p>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeDocument(doc.key)}
                            className="mt-1 text-xs text-red-600 hover:text-red-700 font-semibold"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )}
                    <label
                      className={`block text-center px-3 py-2 rounded font-semibold text-xs transition ${
                        isEditing
                          ? 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData(createInitialFormData(user));
                }}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
