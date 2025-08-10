
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dataService } from './_lib/index';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    await dataService.initializeData();
    const stats = await dataService.getDataStats();
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || 'Failed to get statistics' });
  }
}
