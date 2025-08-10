
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ZodError } from 'zod';
import { searchParamsSchema, type SearchResponse } from '../../shared/schema';
import { cache, openData, dataService } from '../_lib/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });
  try {
    await dataService.initializeData();
    const searchParams = searchParamsSchema.parse({
      query: req.query.query as string,
      provinceCode: req.query.provinceCode as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    });
    const cacheKey = `search_${JSON.stringify(searchParams)}`;
    let municipalities = await cache.getCachedMunicipalities(cacheKey);
    if (!municipalities) {
      municipalities = await openData.searchMunicipalities(searchParams);
      await cache.cacheMunicipalities(cacheKey, municipalities);
    }
    const response: SearchResponse = { municipalities, total: municipalities.length };
    res.status(200).json(response);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: 'Invalid search parameters', errors: error.errors });
    }
    res.status(500).json({ message: error?.message || 'Failed to search municipalities' });
  }
}
