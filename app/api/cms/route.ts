import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerCmsData, updateCmsData } from '@/lib/cms-server';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export async function GET() {
  try {
    const data = getServerCmsData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch CMS data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Require valid admin session for modifying website content
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!verifySessionToken(token)) {
      return NextResponse.json(
        { error: 'Uautoriseret adgang. Log ind som administrator for at gemme ændringer.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updated = updateCmsData(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update CMS data' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
