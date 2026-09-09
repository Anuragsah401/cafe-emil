/**
 * Resolves the backend API URL with intelligent environment detection and trailing-slash sanitization.
 */
export function getBackendUrl(): string {
  // 1. Explicit override via BACKEND_URL
  if (process.env.BACKEND_URL && process.env.BACKEND_URL.trim()) {
    return process.env.BACKEND_URL.trim().replace(/\/+$/, '');
  }

  // 2. Client-accessible override via NEXT_PUBLIC_BACKEND_URL
  if (process.env.NEXT_PUBLIC_BACKEND_URL && process.env.NEXT_PUBLIC_BACKEND_URL.trim()) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.trim().replace(/\/+$/, '');
  }

  // 3. Default for production (Vercel deployment)
  if (process.env.NODE_ENV === 'production') {
    return 'https://cafe-emil.onrender.com';
  }

  // 4. Default for local development
  return 'http://localhost:5001';
}

