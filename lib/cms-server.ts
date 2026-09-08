import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';
import { CmsData, getCmsData } from './cms';

const dataFilePath = path.join(process.cwd(), 'data', 'cms-data.json');
const REDIS_CMS_KEY = 'cafeemil_cms_data';

export function getRedisClient(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return new Redis({ url, token });
  }
  return null;
}

export function isKvConfigured(): boolean {
  return Boolean(
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  );
}

function getFallbackCmsData(): CmsData {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileContents = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(fileContents) as CmsData;
    }
  } catch (error) {
    // Read error or file system not available
  }
  return getCmsData();
}

export async function getServerCmsData(): Promise<CmsData> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const data = await redis.get<CmsData>(REDIS_CMS_KEY);
      if (data && typeof data === 'object') {
        return data;
      }
      // If key does not exist yet in Redis, seed with local default data
      const initial = getFallbackCmsData();
      await redis.set(REDIS_CMS_KEY, initial);
      return initial;
    } catch (err) {
      console.error('Vercel KV / Redis read error, falling back to local data:', err);
    }
  }

  return getFallbackCmsData();
}

export async function updateCmsData(newData: Partial<CmsData>): Promise<CmsData> {
  const currentData = await getServerCmsData();
  const updated: CmsData = { ...currentData, ...newData };

  const redis = getRedisClient();
  let savedToCloud = false;

  if (redis) {
    try {
      await redis.set(REDIS_CMS_KEY, updated);
      savedToCloud = true;
    } catch (err) {
      console.error('Vercel KV / Redis write error:', err);
      throw new Error('Kunne ikke gemme CMS data i Vercel KV / Redis');
    }
  }

  // Also try to write to local filesystem if writable (e.g. local development)
  try {
    const dataDir = path.dirname(dataFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(updated, null, 2), 'utf8');
  } catch (error) {
    // Expected on Vercel/serverless read-only filesystem
    if (!savedToCloud) {
      console.error('Filesystem is read-only and no Vercel KV / Redis is connected:', error);
      throw new Error(
        'Filsystemet i produktion er skrivebeskyttet. Tilslut Vercel KV eller Upstash Redis under Vercel Storage for at gemme ændringer.'
      );
    }
  }

  return updated;
}
