export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

function goToLoginWithNext() {
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  localStorage.removeItem('token');
  localStorage.setItem('next', next);
  window.location.replace(`/login`);
}

export async function api(path, { method = 'GET', headers = {}, body, auth } = {}) {
  const requiresAuth =
    typeof auth === 'boolean' ? auth : !String(path).startsWith('/public');

  let token = localStorage.getItem('token') || '';
  token = token.trim().replace(/^["']|["']$/g, '');

  const h = { Accept: 'application/json', ...headers };
  if (requiresAuth) {
    if (!token) {
      goToLoginWithNext();
      const err = new Error('Unauthorized (no token)');
      err.status = 401; err.path = path; err.requiresAuth = true;
      throw err;
    }
    h.Authorization = `Bearer ${token}`;
  }

  let reqBody = body;
  if (reqBody && !(reqBody instanceof FormData)) {
    h['Content-Type'] = 'application/json';
    reqBody = JSON.stringify(reqBody);
  }

  const isAbsolute = /^https?:\/\//i.test(path);
  const url = isAbsolute ? path : `${API_BASE}${path}`;

  let res;
  try {
    res = await fetch(url, { method, headers: h, body: reqBody });
  } catch (e) {
    const err = new Error('Network error: ' + (e?.message || e));
    err.cause = e; err.path = path;
    throw err;
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  let data = null;
  if (isJson) { try { data = await res.json(); } catch { data = null; } }
  else { try { data = await res.text(); } catch { data = null; } }

  if (res.status === 401 && requiresAuth) {
    goToLoginWithNext();
    const err = new Error('Unauthorized');
    err.status = 401; err.path = path; err.requiresAuth = true; err.data = data;
    throw err;
  }

  if (!res.ok) {
    const msg =
      (isJson && data && (data.message || data.error || data.msg)) ||
      res.statusText || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status; err.path = path; err.requiresAuth = requiresAuth; err.data = data;
    throw err;
  }

  return { data, res };
}
