export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export async function api(path, { method = 'GET', headers = {}, body, auth = true } = {}) {
  const token = localStorage.getItem('token');
  const h = { Accept: 'application/json', ...headers };
  if (auth && token) h.Authorization = `Bearer ${token}`;
  if (body && !(body instanceof FormData)) {
    h['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, { method, headers: h, body });

  // ⬇️ VAŽNO: redirect na login samo ako je auth:true
  if (res.status === 401) {
    if (auth) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    else {
        throw new Error('Unauthorized');
    }
  }

  if (res.status === 403) {
    // 403 je dozvoljen da redirectuje na /no-access (ovo je u redu)
    window.location.href = '/no-access';
    throw new Error('Forbidden');
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = isJson && data && (data.message || data.error) ? (data.message || data.error) : res.statusText;
    throw new Error(msg || 'Request failed');
  }

  return { data, res };
}
