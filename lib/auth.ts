import crypto from 'crypto';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { getRedisClient } from './cms-server';

export const AUTH_COOKIE_NAME = 'cafeemil_admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
const SECRET_KEY = process.env.ADMIN_SESSION_SECRET || 'cafeemil_secret_key_valby_denmark_2025_secure_session_token';

interface AdminCredentials {
  username: string;
  passwordHash: string;
  salt: string;
}

const authFilePath = path.join(process.cwd(), 'data', 'auth-data.json');
const REDIS_AUTH_KEY = 'cafeemil_auth_data';

// Default initial credentials: username 'admin', password 'CafeEmil2025!'
const DEFAULT_SALT = 'cafeemil_salt_valby_2025';
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

async function getStoredCredentials(): Promise<AdminCredentials> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const data = await redis.get<AdminCredentials>(REDIS_AUTH_KEY);
      if (data && data.username && data.passwordHash) {
        return data;
      }
    } catch (err) {
      console.error('Redis auth read error:', err);
    }
  }

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

export async function saveCredentials(username: string, newPasswordPlain: string): Promise<void> {
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(newPasswordPlain, salt);
  const creds: AdminCredentials = { username, salt, passwordHash };

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(REDIS_AUTH_KEY, creds);
    } catch (err) {
      console.error('Redis auth write error:', err);
    }
  }

  try {
    const dataDir = path.dirname(authFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(authFilePath, JSON.stringify(creds, null, 2), 'utf8');
  } catch (err) {
    // Read only on Vercel
  }
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

// Verify signed token
export function verifySessionToken(token?: string | null): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) return false;

  const [_, expiresAtStr] = payload.split(':');
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}

// Validate admin login credentials
export async function validateLogin(username: string, passwordPlain: string): Promise<boolean> {
  const creds = await getStoredCredentials();
  const trimmedUser = username.trim().toLowerCase();
  const validUser = creds.username.toLowerCase();

  if (trimmedUser !== validUser && trimmedUser !== 'admin@cafeemil.dk') {
    return false;
  }

  const computedHash = hashPassword(passwordPlain, creds.salt);
  return computedHash === creds.passwordHash;
}
