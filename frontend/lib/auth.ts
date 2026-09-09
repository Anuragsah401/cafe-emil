import crypto from 'crypto';
import { getBackendUrl } from './backend-url';

export const AUTH_COOKIE_NAME = 'cafeemil_admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
const SECRET_KEY =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.JWT_SECRET ||
  'cafeemil_jwt_secret_token_valby_2025_secure_key';

// Delegate login verification to backend
export async function validateLogin(username: string, passwordPlain: string): Promise<{ success: boolean; token?: string; error?: string }> {
  const backendUrl = getBackendUrl();
  const urls = [backendUrl];
  if (backendUrl !== 'http://localhost:5001' && process.env.NODE_ENV !== 'production') {
    urls.push('http://localhost:5001');
  }

  for (const url of urls) {
    try {
      const res = await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: passwordPlain }),
        signal: AbortSignal.timeout(3000),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Ugyldigt brugernavn eller adgangskode' };
      }

      return { success: true, token: data.token };
    } catch {
      // Try next URL
    }
  }

  // If all backend URLs are offline, check fallback local credentials for uninterrupted access
  const isDefault =
    (username.trim().toLowerCase() === 'admin' || username.trim().toLowerCase() === 'admin@cafeemil.dk') &&
    passwordPlain === 'CafeEmil2025!';

  if (isDefault) {
    const fallbackToken = createSessionToken('admin');
    return { success: true, token: fallbackToken };
  }

  return { success: false, error: 'Kunne ikke forbinde til backend server' };
}

// Delegate password change to backend
export async function changePasswordWithBackend(
  currentPassword: string,
  newPassword: string,
  token?: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  const backendUrl = getBackendUrl();
  const urls = [backendUrl];
  if (backendUrl !== 'http://localhost:5001' && process.env.NODE_ENV !== 'production') {
    urls.push('http://localhost:5001');
  }

  let lastError: string | null = null;
  for (const url of urls) {
    try {
      const res = await fetch(`${url}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
        signal: AbortSignal.timeout(3000),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Kunne ikke ændre adgangskode' };
      }

      return { success: true, token: data.token };
    } catch (err: any) {
      lastError = err?.message || 'Server utilgængelig';
    }
  }

  return { success: false, error: lastError || 'Kunne ikke forbinde til backend server' };
}

// Generate signed token
export function createSessionToken(username: string): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${username}:${expiresAt}`;
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payload)
    .digest('hex');
  return `${payload}.${signature}`;
}

// Verify signed token or standard JWT
export function verifySessionToken(token?: string | null): boolean {
  if (!token) return false;

  // 1. Check if standard JWT (3 parts separated by .)
  const jwtParts = token.split('.');
  if (jwtParts.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(jwtParts[1], 'base64url').toString('utf8'));
      if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
        return true;
      }
    } catch {
      // Invalid JWT format
    }
  }

  // 2. Check if HMAC token (2 parts)
  if (jwtParts.length === 2) {
    const [payload, signature] = jwtParts;
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(payload)
      .digest('hex');

    if (signature === expectedSignature) {
      const [_, expiresAtStr] = payload.split(':');
      const expiresAt = parseInt(expiresAtStr, 10);
      if (!isNaN(expiresAt) && Date.now() <= expiresAt) {
        return true;
      }
    }
  }

  return false;
}
