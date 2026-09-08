import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

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

// GET: List all uploaded images
export async function GET() {
  if (!checkAuth()) {
    return NextResponse.json({ error: 'Uautoriseret adgang' }, { status: 401 });
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      await fs.promises.mkdir(uploadDir, { recursive: true });
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

    // Sort newest first
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

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      await fs.promises.mkdir(uploadDir, { recursive: true });
    }

    // Generate safe unique filename
    const origName = file.name || 'image';
    const parsedExt = path.extname(origName).toLowerCase();
    const ext = parsedExt || (file.type === 'image/jpeg' ? '.jpg' : file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg');
    
    // Sanitize base name (remove special characters, spaces to hyphens)
    const baseName = path.basename(origName, parsedExt)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 40) || 'upload';

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const finalFilename = `${baseName}-${uniqueSuffix}${ext}`;
    const targetPath = path.join(uploadDir, finalFilename);

    // Convert file to Buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.promises.writeFile(targetPath, buffer);

    const publicUrl = `/uploads/${finalFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: finalFilename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Der opstod en fejl under upload af billedet' }, { status: 500 });
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

    if (!filename) {
      return NextResponse.json({ error: 'Filnavn mangler' }, { status: 400 });
    }

    // Prevent directory traversal attacks
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

