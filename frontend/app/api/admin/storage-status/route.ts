import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend-url';

export const dynamic = 'force-dynamic';

export async function GET() {
  let backendOnline = false;
  let supabaseConnected = false;

  const backendUrl = getBackendUrl();
  let activeBackendUrl = backendUrl;

  const urlsToTry = [backendUrl];
  if (backendUrl !== 'http://localhost:5001' && process.env.NODE_ENV !== 'production') {
    urlsToTry.push('http://localhost:5001');
  }

  for (const url of urlsToTry) {
    try {
      const res = await fetch(`${url}/api/health`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(12000),
      });

      if (res.ok) {
        const data = await res.json();
        backendOnline = true;
        supabaseConnected = Boolean(data.supabaseConnected);
        activeBackendUrl = url;
        break;
      }
    } catch {
      // Continue to next URL
    }
  }

  return NextResponse.json({
    backendOnline,
    supabaseConnected,
    backendUrl: activeBackendUrl,
    readyForProduction: backendOnline && supabaseConnected,
  });
}
