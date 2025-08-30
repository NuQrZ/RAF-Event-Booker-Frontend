export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export async function api(path, { method = 'GET', headers = {}, body, auth = true } = {}) {
    const token = localStorage.getItem('token')
    const h = { 'Accept': 'application/json', ...headers }

    if (auth && token) {
        h['Authorization'] = `Bearer ${token}`
    }
    if (body && !(body instanceof FormData)) {
        h['Content-Type'] = 'application/json'
        body = JSON.stringify(body)
    }

    const res = await fetch(`${API_BASE}${path}`, { method, headers: h, body })

    if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Unauthorized')
    }

    if (res.status === 403) {
        window.location.href = '/no-access';
        throw new Error('Forbidden')
    }

    const contentType = res.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    const data = isJson ? await res.json() : await res.text()

    if (!res.ok) {
        const msg = isJson && data && data.message ? data.message : res.statusText;
        throw new Error(msg || 'Request failed')
    }
    
    return { data, res }
}
