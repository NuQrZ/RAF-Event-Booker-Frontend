export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Nema automatskog redirecta – samo bacamo greške
export async function api(path, { method = 'GET', headers = {}, body, auth } = {}) {
  const requiresAuth = typeof auth === 'boolean' ? auth : !path.startsWith('/public');

  const token = localStorage.getItem('token');
  const h = { Accept: 'application/json', ...headers };

  if (requiresAuth && token) {
    h.Authorization = `Bearer ${token}`;
  }
  if (body && !(body instanceof FormData)) {
    h['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers: h, body });
  } catch (e) {
    throw new Error('Network error: ' + (e?.message || e));
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const err = new Error((isJson && data?.message) || res.statusText || `HTTP ${res.status}`);
    err.status = res.status;
    err.path = path;
    err.requiresAuth = requiresAuth;
    throw err;
  }

  return { data, res };
}
