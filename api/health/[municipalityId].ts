
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dataService } from '../../_lib/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });
  try {
    await dataService.initializeData();
    const municipalityId = req.query.municipalityId as string;
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const start = (page - 1) * limit;
    if (!municipalityId) return res.status(400).json({ message: 'Municipality ID is required' });

    const mapping = await dataService.getPopulationMapping();
    const municipalityPopulations = mapping.filter(x => x.codINE5 === municipalityId);

    const allCenters: any[] = [];
    for (const locality of municipalityPopulations) {
      const queryParams = new URLSearchParams({
        dataset: 'registro-de-centros-sanitarios-de-castilla-y-leon',
        format: 'json',
        q: `localidad:"${locality.poblacion_sin_tilde}"`,
        rows: String(limit),
        start: String(start)
      });
      const url = `https://analisis.datosabiertos.jcyl.es/api/records/1.0/search?${queryParams.toString()}`;
      const r = await fetch(url);
      if (!r.ok) continue;
      const data = await r.json();
      const centers = (data.records || []).map((record: any) => {
        const fields = record.fields || {};
        const coordinates = record.geometry?.coordinates ? 
          { lat: record.geometry.coordinates[1], lon: record.geometry.coordinates[0] } : undefined;
        return {
          name: fields.nombre || fields.nombre_centro || '',
          type: fields.tipo || fields.tipo_centro || fields.denominacion_generica_breve || '',
          address: [fields.via, fields.nombre_de_la_via, fields.numero_ext || fields.numero].filter(Boolean).join(' ').trim(),
          phone: fields.telefono?.toString() || '',
          email: fields.correo_electronico || '',
          coordinates
        };
      });
      allCenters.push(...centers);
    }

    // total count (approx, from first locality)
    let totalCount = 0;
    if (municipalityPopulations.length > 0) {
      const locality = municipalityPopulations[0];
      const qp = new URLSearchParams({
        dataset: 'registro-de-centros-sanitarios-de-castilla-y-leon',
        format: 'json',
        q: `localidad:"${locality.poblacion_sin_tilde}"`,
        rows: '0'
      });
      const rr = await fetch(`https://analisis.datosabiertos.jcyl.es/api/records/1.0/search?${qp.toString()}`);
      if (rr.ok) {
        const d = await rr.json();
        totalCount = d.nhits || 0;
      }
    }

    res.status(200).json({
      centers: allCenters,
      totalCenters: allCenters.length,
      totalAvailable: totalCount,
      page,
      limit,
      hasMore: totalCount > (page * limit)
    });
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'Failed to load health centers' });
  }
}
