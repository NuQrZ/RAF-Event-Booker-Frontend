export function getJwtPayload(token) {
    if (!token) return null;
    try {
        const [, payload] = token.split('.');
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}

export function getExpiryDate(token) {
    const p = getJwtPayload(token);
    if (!p?.exp) return null;
    return new Date(p.exp * 1000);
}

export function isExpired(token, skewSec = 0) {
    const exp = getExpiryDate(token);
    if (!exp) return true;
    return Date.now() >= exp.getTime() - skewSec * 1000;
}
