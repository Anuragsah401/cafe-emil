import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:5001';

export async function GET() {
  let backendOnline = false;
  let supabaseConnected = false;

  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    });

    if (res.ok) {
      const data = await res.json();
      backendOnline = true;
      supabaseConnected = Boolean(data.supabaseConnected);
    }
  } catch (err) {
    backendOnline = false;
  }

  return NextResponse.json({
    backendOnline,
    supabaseConnected,
    backendUrl: BACKEND_URL,
    readyForProduction: backendOnline && supabaseConnected,
  });
}
