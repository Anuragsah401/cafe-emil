import crypto from 'crypto';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const AUTH_COOKIE_NAME = 'cafeemil_admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
const SECRET_KEY = process.env.ADMIN_SESSION_SECRET || 'cafeemil_secret_key_valby_denmark_2025_secure_session_token';

interface AdminCredentials {
  username: string;
  passwordHash: string;
  salt: string;
}

const authFilePath = path.join(process.cwd(), 'data', 'auth-data.json');

// Default initial credentials: username 'admin', password 'CafeEmil2025!'
const DEFAULT_SALT = 'cafeemil_salt_valby_2025';
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function getStoredCredentials(): AdminCredentials {
  try {
    if (fs.existsSync(authFilePath)) {
      const data = JSON.parse(fs.readFileSync(authFilePath, 'utf8'));
      return data;
    }
  } catch (err) {
    console.error('Error reading auth-data.json, using default credentials:', err);
  }

  // Initial default credentials
  return {
    username: 'admin',
    salt: DEFAULT_SALT,
    passwordHash: hashPassword('CafeEmil2025!', DEFAULT_SALT),
  };
}

export function saveCredentials(username: string, newPasswordPlain: string): void {
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(newPasswordPlain, salt);
  const dataDir = path.dirname(authFilePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(
    authFilePath,
    JSON.stringify({ username, salt, passwordHash }, null, 2),
    'utf8'
  );
}

// Generate signed token
export function createSessionToken(username: string): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${username}:${expiresAt}`;
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payload)
    .digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

// Verify signed token
export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const [username, expiresStr, signature] = decoded.split(':');
    if (!username || !expiresStr || !signature) return false;

    const expiresAt = parseInt(expiresStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(`${username}:${expiresAt}`)
      .digest('hex');

    // Constant-time compare
    const sigBuf = Buffer.from(signature, 'hex');
    const expectedBuf = Buffer.from(expectedSignature, 'hex');
    if (sigBuf.length !== expectedBuf.length) return false;

    return crypto.timingSafeEqual(sigBuf, expectedBuf);
  } catch (err) {
    return false;
  }
}

// Validate login credentials
export function validateLogin(usernameInput: string, passwordInput: string): boolean {
  const creds = getStoredCredentials();
  const normalizedUser = (usernameInput || '').trim().toLowerCase();
  const expectedUser = creds.username.toLowerCase();

  // Accept 'admin' or 'admin@cafeemil.dk'
  const isUserValid = normalizedUser === expectedUser || normalizedUser === 'admin@cafeemil.dk';
  if (!isUserValid) return false;

  const testHash = hashPassword(passwordInput, creds.salt);
  return testHash === creds.passwordHash;
}

// Helper to check if current request is authenticated
export function isAuthenticated(): boolean {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    return verifySessionToken(sessionToken);
  } catch {
    return false;
  }
}

export { AUTH_COOKIE_NAME, SESSION_MAX_AGE };
