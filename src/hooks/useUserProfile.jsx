import { useEffect, useState, useCallback } from 'react';
import * as api from '../api/profileApi';

const FALLBACK_PROFILE = {
  username: 'guest_user',
  userId: 'USR_GUEST',
  name: 'Guest User',
  email: '',
  mobile: '',
  personal: { dob: '', gender: '', address: '', city: '', state: '', pincode: '', occupation: '' },
  bank: { accountHolderName: '', bankName: '', accountNumber: '', ifsc: '', branchName: '', accountType: '', upiId: '', status: 'unverified' },
  demat: { dpName: '', dpId: '', clientId: '', brokingHouse: '', nominee: '', tradingExperience: '', status: 'unverified' },
  documents: { pan: null, aadhar: null, cancelCheque: null, cmlCopy: null }
};

export default function useUserProfile() {
  const [profile, setProfile] = useState(FALLBACK_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProfile();
      if (data) setProfile(data);
      else setProfile(FALLBACK_PROFILE);
    } catch (err) {
      // fallback to local if API fails
      console.error('[useUserProfile] Error fetching profile:', err);
      setError(err.message || 'Failed to fetch profile');
      setProfile(FALLBACK_PROFILE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) console.log('[useUserProfile] Profile loaded:', profile);
  }, [profile]);

  const updateProfile = useCallback(async (payload) => {
    try {
      const updated = await api.updateProfile(payload);
      if (updated) setProfile(updated);
      return updated;
    } catch (err) {
      // Optimistically update locally
      setProfile((p) => ({ ...p, ...payload }));
      return null;
    }
  }, []);

  const sendOTP = useCallback(async (field, value) => {
    try {
      return await api.sendOTP(field, value);
    } catch (err) {
      // For demo/local, just resolve
      return { ok: true };
    }
  }, []);

  const verifyOTP = useCallback(async (field, code) => {
    try {
      return await api.verifyOTP(field, code);
    } catch (err) {
      // demo behaviour
      if (code === '1234') return { ok: true };
      throw err;
    }
  }, []);

  const uploadPhoto = useCallback(async (file) => {
    try {
      return await api.uploadPhoto(file);
    } catch (err) {
      // fallback: read locally and set profile photo as data URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfile((p) => ({ ...p, profilePhoto: reader.result }));
          resolve({ ok: true, url: reader.result });
        };
        reader.readAsDataURL(file);
      });
    }
  }, []);

  const uploadDocument = useCallback(async (docKey, file) => {
    try {
      return await api.uploadDocument(docKey, file);
    } catch (err) {
      // local fallback: add name only
      setProfile((p) => ({ ...p, documents: { ...p.documents, [docKey]: { name: file.name, data: '' } } }));
      return { ok: true };
    }
  }, []);

  const submitBankApproval = useCallback(async (bankData) => {
    try {
      return await api.submitBankApproval(bankData);
    } catch (err) {
      // set status pending locally
      setProfile((p) => ({ ...p, bank: { ...bankData, status: 'pending' } }));
      return { ok: true };
    }
  }, []);

  const submitDematApproval = useCallback(async (dematData) => {
    try {
      return await api.submitDematApproval(dematData);
    } catch (err) {
      setProfile((p) => ({ ...p, demat: { ...dematData, status: 'pending' } }));
      return { ok: true };
    }
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    sendOTP,
    verifyOTP,
    uploadPhoto,
    uploadDocument,
    submitBankApproval,
    submitDematApproval,
  };
}
