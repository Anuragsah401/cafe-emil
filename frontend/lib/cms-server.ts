import { CmsData, getCmsData } from './cms';
import { getBackendUrl } from './backend-url';

export async function getServerCmsData(): Promise<CmsData> {
  const backendUrl = getBackendUrl();
  const urls = [backendUrl];
  if (backendUrl !== 'http://localhost:5001' && process.env.NODE_ENV !== 'production') {
    urls.push('http://localhost:5001');
  }

  for (const url of urls) {
    try {
      const res = await fetch(`${url}/api/cms`, {
        next: { revalidate: 60, tags: ['cms-data'] },
        signal: AbortSignal.timeout(6000),
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

  const backendUrl = getBackendUrl();
  const urls = [backendUrl];
  if (backendUrl !== 'http://localhost:5001' && process.env.NODE_ENV !== 'production') {
    urls.push('http://localhost:5001');
  }

  let lastError: any = null;
  for (const url of urls) {
    try {
      const res = await fetch(`${url}/api/cms`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newData),
        signal: AbortSignal.timeout(20000),
      });

      if (res.ok) {
        const json = await res.json();
        return json.data;
      } else {
        const err = await res.json().catch(() => ({}));
        lastError = err.error || `Serverfejl (${res.status})`;
      }
    } catch (e: any) {
      lastError = e?.message || 'Backend server utilgængelig';
    }
  }

  throw new Error(lastError || 'Fejl ved opdatering af CMS i backend');
}
