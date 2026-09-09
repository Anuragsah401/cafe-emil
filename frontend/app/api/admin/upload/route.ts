import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { getBackendUrl } from '@/lib/backend-url';

export const dynamic = 'force-dynamic';

const BACKEND_URL = getBackendUrl();

function checkAuth(): string | null {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token || !verifySessionToken(token)) return null;
  return token;
}

// GET: List all uploaded images
export async function GET() {
  const token = checkAuth();
  if (!token) {
    return NextResponse.json({ error: 'Uautoriseret adgang' }, { status: 401 });
  }

  // 1. Try fetching list from Express backend (Supabase Storage)
  try {
    const res = await fetch(`${BACKEND_URL}/api/upload`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // Backend offline, fallback to local uploads
  }

  // 2. Local fallback
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json({ files: [] });
    }

    const fileNames = await fs.promises.readdir(uploadDir);
    const files = await Promise.all(
      fileNames
        .filter((name) => !name.startsWith('.'))
        .map(async (name) => {
          const filePath = path.join(uploadDir, name);
          const stats = await fs.promises.stat(filePath);
          return {
            name,
            url: `/uploads/${name}`,
            size: stats.size,
            updatedAt: stats.mtime.toISOString(),
          };
        })
    );

    files.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json({ files: [] });
  }
}

// POST: Upload a single image file
export async function POST(request: Request) {
  const token = checkAuth();
  if (!token) {
    return NextResponse.json({ error: 'Uautoriseret adgang' }, { status: 401 });
  }

  try {
    const incomingFormData = await request.formData();
    const file = incomingFormData.get('file') as File | null;

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Ingen gyldig billedfil modtaget' }, { status: 400 });
    }

    // 1. Try uploading to Node.js / Supabase backend
    try {
      const backendFormData = new FormData();
      backendFormData.append('file', file);

      const res = await fetch(`${BACKEND_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: backendFormData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        return NextResponse.json(data);
      }
    } catch (backendErr) {
      console.warn('Notice: Backend server upload failed, attempting local disk fallback:', backendErr);
    }

    // 2. Local fallback if backend is offline and filesystem is writable
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      await fs.promises.mkdir(uploadDir, { recursive: true });
    }

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const parsedExt = path.extname(file.name || '').toLowerCase() || '.jpg';
    const finalFilename = `upload-${uniqueSuffix}${parsedExt}`;
    const targetPath = path.join(uploadDir, finalFilename);

    const bytes = await file.arrayBuffer();
    await fs.promises.writeFile(targetPath, Buffer.from(bytes));

    return NextResponse.json({
      success: true,
      url: `/uploads/${finalFilename}`,
      filename: finalFilename,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Der opstod en fejl under upload af billedet' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an uploaded image
export async function DELETE(request: Request) {
  const token = checkAuth();
  if (!token) {
    return NextResponse.json({ error: 'Uautoriseret adgang' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || '';

    // 1. Try deleting via Express backend
    try {
      const res = await fetch(`${BACKEND_URL}/api/upload/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        return NextResponse.json({ success: true, message: 'Billede slettet' });
      }
    } catch (backendErr) {
      //
    }

    // 2. Local fallback
    const safeFilename = path.basename(filename);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const targetPath = path.join(uploadDir, safeFilename);

    if (fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath);
      return NextResponse.json({ success: true, message: 'Billede slettet' });
    }

    return NextResponse.json({ success: true, message: 'Slettet' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Kunne ikke slette filen' }, { status: 500 });
  }
}
