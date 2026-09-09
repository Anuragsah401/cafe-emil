import { CmsData, getCmsData } from './cms';

const rawBackendUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:5001';
const BACKEND_URL = rawBackendUrl.replace(/\/+$/, '');

export async function getServerCmsData(): Promise<CmsData> {
  const urls = [BACKEND_URL];
  if (!urls.includes('http://localhost:5001')) {
    urls.push('http://localhost:5001');
  }

  for (const url of urls) {
    try {
      const res = await fetch(`${url}/api/cms`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object' && data.restaurant) {
          return data as CmsData;
        }
      }
    } catch {
      // Continue to next URL
    }
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

  const urls = [BACKEND_URL];
  if (!urls.includes('http://localhost:5001')) {
    urls.push('http://localhost:5001');
  }

  let lastError: any = null;
  for (const url of urls) {
    try {
      const res = await fetch(`${url}/api/cms`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newData),
      });

      if (res.ok) {
        const json = await res.json();
        return json.data;
      } else {
        const err = await res.json().catch(() => ({}));
        lastError = err.error || `Fejl fra server (${res.status})`;
      }
    } catch (e: any) {
      lastError = e?.message || 'Server utilgængelig';
    }
  }

  throw new Error(lastError || 'Fejl ved opdatering af CMS i backend');
}
