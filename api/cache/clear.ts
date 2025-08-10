
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cache } from './_lib/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  try {
    await cache.clearCache();
    res.status(200).json({ message: 'Cache cleared successfully' });
  } catch (_e) {
    res.status(500).json({ message: 'Failed to clear cache' });
  }
}
