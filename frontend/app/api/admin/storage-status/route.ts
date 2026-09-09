import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:5001';

export async function GET() {
  let backendOnline = false;
  let supabaseConnected = false;
  let activeBackendUrl = BACKEND_URL;

  const urlsToTry = [BACKEND_URL];
  if (!urlsToTry.includes('http://localhost:5001')) {
    urlsToTry.push('http://localhost:5001');
  }

  for (const url of urlsToTry) {
    try {
      const res = await fetch(`${url}/api/health`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const data = await res.json();
        backendOnline = true;
        supabaseConnected = Boolean(data.supabaseConnected);
        activeBackendUrl = url;
        break;
      }
    } catch {
      // Continue to fallback
    }
  }

  return NextResponse.json({
    backendOnline,
    supabaseConnected,
    backendUrl: activeBackendUrl,
    readyForProduction: backendOnline && supabaseConnected,
  });
}
