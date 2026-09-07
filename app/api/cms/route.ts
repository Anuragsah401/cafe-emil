import { NextResponse } from 'next/server';
import { getServerCmsData, updateCmsData } from '@/lib/cms-server';

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

