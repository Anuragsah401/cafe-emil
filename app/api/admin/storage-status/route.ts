import { NextResponse } from 'next/server';
import { isKvConfigured } from '@/lib/cms-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isVercel = Boolean(process.env.VERCEL);
  const kv = isKvConfigured();
  const blob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  return NextResponse.json({
    isVercel,
    kvConfigured: kv,
    blobConfigured: blob,
    readyForProduction: kv && blob,
  });
}
