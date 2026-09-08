import { CmsData, getCmsData } from './cms';

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:5001';

export async function getServerCmsData(): Promise<CmsData> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/cms`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3500),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object' && data.restaurant) {
        return data as CmsData;
      }
    }
  } catch (error) {
    // Graceful fallback to static seed data if backend is starting or offline
  }

  return getCmsData();
}

export async function updateCmsData(newData: Partial<CmsData>, token?: string): Promise<CmsData> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BACKEND_URL}/api/cms`, {
    method: 'POST',
    headers,
    body: JSON.stringify(newData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Fejl ved opdatering af CMS i backend');
  }

  const json = await res.json();
  return json.data;
}
