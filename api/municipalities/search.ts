import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ZodError } from 'zod';
import { searchParamsSchema, type SearchResponse, type MunicipalityDetailsResponse } from '../../shared/schema';
import dataService from '../_lib/dataService';
import { OpenDataApiService } from '../_lib/openDataApiService';
import { storage } from '../_lib/storage';

const openDataApiService = new OpenDataApiService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    await dataService.initializeData();
    const params = searchParamsSchema.parse({
      query: req.query.query || '',
      provinceCode: req.query.provinceCode || undefined
    });
    const results = await openDataApiService.searchMunicipalities(params);
    const enriched = await Promise.all(results.map(async (m) => {
      const extra = dataService.getMunicipalityExtra(m.codIne5);
      return { ...m, ...extra };
    }));
    const payload: SearchResponse = { results: enriched };
    return res.status(200).json(payload);
  } catch (e) {
    if (e instanceof ZodError) return res.status(400).json({ error: e.issues });
    console.error(e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
