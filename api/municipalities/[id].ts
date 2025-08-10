import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ZodError } from 'zod';
import { searchParamsSchema, type SearchResponse, type MunicipalityDetailsResponse } from '../_lib/shared/schema';
import dataService from '../_lib/dataService';
import { OpenDataApiService } from '../_lib/openDataApiService';
import { storage } from '../_lib/storage';

const openDataApiService = new OpenDataApiService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    await dataService.initializeData();
    const id = String(req.query.id);
    const details = await openDataApiService.getMunicipalityDetails(id);
    const extra = dataService.getMunicipalityExtra(id);
    const payload: MunicipalityDetailsResponse = { ...details, ...extra };
    return res.status(200).json(payload);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
