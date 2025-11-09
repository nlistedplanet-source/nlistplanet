const API_BASE = process.env.REACT_APP_API_BASE || '';

async function request(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    if (contentType.includes('application/json')) return await res.json();
    return await res.text();
  } catch (err) {
    // Re-throw so caller can decide what to do
    throw err;
  }
}

export async function getProfile() {
  const url = `${API_BASE}/api/profile`;
  return request(url, { method: 'GET', credentials: 'include' });
}

export async function updateProfile(payload) {
  const url = `${API_BASE}/api/profile`;
  return request(url, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function sendOTP(field, value) {
  const url = `${API_BASE}/api/profile/send-otp`;
  return request(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field, value }),
  });
}

export async function verifyOTP(field, code) {
  const url = `${API_BASE}/api/profile/verify-otp`;
  return request(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field, code }),
  });
}

export async function uploadPhoto(file) {
  const url = `${API_BASE}/api/profile/photo`;
  const fd = new FormData();
  fd.append('photo', file);
  return request(url, { method: 'POST', credentials: 'include', body: fd });
}

export async function uploadDocument(docKey, file) {
  const url = `${API_BASE}/api/profile/documents/${encodeURIComponent(docKey)}`;
  const fd = new FormData();
  fd.append('file', file);
  return request(url, { method: 'POST', credentials: 'include', body: fd });
}

export async function submitBankApproval(bankData) {
  const url = `${API_BASE}/api/profile/bank/submit`;
  return request(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bankData),
  });
}

export async function submitDematApproval(dematData) {
  const url = `${API_BASE}/api/profile/demat/submit`;
  return request(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dematData),
  });
}
