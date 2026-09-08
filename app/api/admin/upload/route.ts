import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { put, list, del } from '@vercel/blob';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
]);

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

function checkAuth(): boolean {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

function isBlobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

// GET: List all uploaded images
export async function GET() {
  if (!checkAuth()) {
    return NextResponse.json({ error: 'Uautoriseret adgang' }, { status: 401 });
  }

  try {
    // 1. If Vercel Blob is configured, list from Blob Storage
    if (isBlobEnabled()) {
      const { blobs } = await list({ prefix: 'uploads/' });
      const files = blobs.map((b) => ({
        name: path.basename(b.pathname),
        url: b.url,
        size: b.size,
        updatedAt: b.uploadedAt.toISOString(),
      }));
      files.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      return NextResponse.json({ files });
    }

    // 2. Otherwise read from local public/uploads directory (local development)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      try {
        await fs.promises.mkdir(uploadDir, { recursive: true });
      } catch {
        // Read-only filesystem
        return NextResponse.json({ files: [] });
      }
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
    console.error('Error listing uploads:', error);
    return NextResponse.json({ error: 'Kunne ikke hente uploadede billeder' }, { status: 500 });
  }
}

// POST: Upload a single image file
export async function POST(request: Request) {
  if (!checkAuth()) {
    return NextResponse.json({ error: 'Uautoriseret adgang' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Ingen gyldig billedfil modtaget' }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Filtypen ${file.type} er ikke tilladt. Tilladte formater: JPG, PNG, WEBP, GIF, AVIF, SVG.` },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Filen er for stor. Maksimal tilladt størrelse er 20MB.' },
        { status: 400 }
      );
    }

    // Generate safe unique filename
    const origName = file.name || 'image';
    const parsedExt = path.extname(origName).toLowerCase();
    const ext =
      parsedExt ||
      (file.type === 'image/jpeg'
        ? '.jpg'
        : file.type === 'image/png'
        ? '.png'
        : file.type === 'image/webp'
        ? '.webp'
        : '.jpg');

    const baseName =
      path
        .basename(origName, parsedExt)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 40) || 'upload';

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const finalFilename = `${baseName}-${uniqueSuffix}${ext}`;

    // 1. If Vercel Blob is configured, upload directly to Vercel Blob CDN
    if (isBlobEnabled()) {
      const blob = await put(`uploads/${finalFilename}`, file, {
        access: 'public',
        addRandomSuffix: false,
      });

      return NextResponse.json({
        success: true,
        url: blob.url,
        filename: finalFilename,
        size: file.size,
        type: file.type,
      });
    }

    // 2. Otherwise write to local filesystem (local development)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      if (!fs.existsSync(uploadDir)) {
        await fs.promises.mkdir(uploadDir, { recursive: true });
      }

      const targetPath = path.join(uploadDir, finalFilename);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await fs.promises.writeFile(targetPath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${finalFilename}`,
        filename: finalFilename,
        size: file.size,
        type: file.type,
      });
    } catch (fsErr: any) {
      console.error('Local filesystem upload failed:', fsErr);
      if (process.env.VERCEL || fsErr.code === 'EROFS') {
        return NextResponse.json(
          {
            error:
              'Vercel filsystemet er skrivebeskyttet i produktion. Tilslut "Vercel Blob" under Vercel Dashboard (Storage -> Create -> Blob) for at aktivere direkte billed-upload.',
          },
          { status: 500 }
        );
      }
      throw fsErr;
    }
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
  if (!checkAuth()) {
    return NextResponse.json({ error: 'Uautoriseret adgang' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const fileUrl = searchParams.get('url');

    // 1. If Vercel Blob is enabled and we have a blob URL
    if (isBlobEnabled()) {
      if (fileUrl && fileUrl.startsWith('http')) {
        await del(fileUrl);
        return NextResponse.json({ success: true, message: 'Billede slettet fra Vercel Blob' });
      } else if (filename) {
        const { blobs } = await list({ prefix: `uploads/${path.basename(filename)}` });
        if (blobs.length > 0) {
          await del(blobs[0].url);
        }
        return NextResponse.json({ success: true, message: 'Billede slettet fra Vercel Blob' });
      }
    }

    // 2. Otherwise delete from local filesystem
    if (!filename) {
      return NextResponse.json({ error: 'Filnavn mangler' }, { status: 400 });
    }

    const safeFilename = path.basename(filename);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const targetPath = path.join(uploadDir, safeFilename);

    if (fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath);
      return NextResponse.json({ success: true, message: 'Billede slettet' });
    } else {
      return NextResponse.json({ error: 'Filen blev ikke fundet' }, { status: 404 });
    }
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Kunne ikke slette filen' }, { status: 500 });
  }
}
