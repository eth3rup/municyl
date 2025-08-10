import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenDataApiService } from '../_lib/openDataApiService';

const openDataApiService = new OpenDataApiService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const id = String(req.query.municipalityId);
    const health = await openDataApiService.getHealthCentersByMunicipality(id);
    return res.status(200).json(health ?? { totalCenters: 0, centers: [] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
