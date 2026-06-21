const API_BASE = '';

export async function apiFetch(endpoint, opts = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...opts.headers,
  };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'API error');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}