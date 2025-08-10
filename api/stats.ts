import type { VercelRequest, VercelResponse } from '@vercel/node';
import dataService from './_lib/dataService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    await dataService.initializeData();
    const stats = dataService.getStats();
    return res.status(200).json(stats);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
