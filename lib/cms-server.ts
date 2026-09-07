import fs from 'fs';
import path from 'path';
import { CmsData, getCmsData } from './cms';

const dataFilePath = path.join(process.cwd(), 'data', 'cms-data.json');

export function getServerCmsData(): CmsData {
  try {
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(fileContents) as CmsData;
  } catch (error) {
    return getCmsData();
  }
}

export function updateCmsData(newData: Partial<CmsData>): CmsData {
  try {
    const currentData = getServerCmsData();
    const updated = { ...currentData, ...newData };
    fs.writeFileSync(dataFilePath, JSON.stringify(updated, null, 2), 'utf8');
    return updated;
  } catch (error) {
    console.error('Error writing to cms-data.json:', error);
    throw new Error('Failed to update CMS data');
  }
}

