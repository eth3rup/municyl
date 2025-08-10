import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { MunicipalityDetails } from '../../_lib/shared/schema';
import dataService from '../../_lib/dataService';
import { OpenDataApiService } from '../../_lib/openDataApiService';

const openDataApiService = new OpenDataApiService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    await dataService.initializeData();
    const id = String(req.query.id);
    const details = await openDataApiService.getMunicipalityDetails(id);
    const extra = dataService.getMunicipalityExtra(id);
    const data = { ...details, ...extra } as MunicipalityDetails;

    // Minimal CSV generation similar to server (fields adapted)
    const rows: string[][] = [];
    rows.push(['BÁSICO','Nombre', data.name ?? '']);
    rows.push(['BÁSICO','Provincia', data.provinceName ?? '']);
    if (data.population) rows.push(['BÁSICO','Población', String(data.population)]);
    if (data.surface) rows.push(['BÁSICO','Superficie (km²)', String(data.surface)]);
    if (data.altitude) rows.push(['BÁSICO','Altitud (m)', String(data.altitude)]);
    if (data.postalCodes) rows.push(['BÁSICO','Códigos Postales', data.postalCodes.join(' ')]);

    rows.push(['METADATOS','Fecha de Exportación', new Date().toLocaleDateString('es-ES')]);
    rows.push(['METADATOS','Fuente','Junta de Castilla y León - Datos Abiertos']);

    const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g,'""') + '"').join(',')).join('\n');
    res.setHeader('content-type', 'text/csv; charset=utf-8');
    res.setHeader('content-disposition', `attachment; filename="municipio_${id}.csv"`);
    return res.status(200).send(csv);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
