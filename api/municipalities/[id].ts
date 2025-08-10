
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { type MunicipalityDetailsResponse } from '../../../shared/schema';
import { cache, openData, dataService } from '../../_lib/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });
  try {
    await dataService.initializeData();
    const municipalityId = req.query.id as string;
    if (!municipalityId) return res.status(400).json({ message: 'Municipality ID is required' });

    let municipalityData = await cache.getCachedMunicipalityData(municipalityId);
    if (!municipalityData) {
      municipalityData = await openData.getMunicipalityDetails(municipalityId);

      if (municipalityData?.municipality) {
        const postalCodes = await dataService.getPostalCodes(municipalityId);
        if (postalCodes.length > 0) municipalityData.municipality.postalCodes = postalCodes;

        const geoData = await dataService.getMunicipalityGeographic(municipalityId);
        if (geoData) {
          municipalityData.municipality.latitude = geoData.latitud;
          municipalityData.municipality.longitude = geoData.longitud;
          municipalityData.municipality.altitude = geoData.altitud;
          municipalityData.municipality.surface = geoData.superficie;
        }

        const demographicData = await dataService.getPopulationData(municipalityId);
        if (demographicData) {
          municipalityData.demographics = {
            totalPopulation: demographicData.totalPopulation,
            men: demographicData.men,
            women: demographicData.women,
            spanish: demographicData.spanish,
            foreigners: demographicData.foreign,
            age0to14: demographicData.age0to14,
            age15to64: demographicData.age15to64,
            age65plus: demographicData.age65plus,
            populationsCount: demographicData.localities.length,
            localities: demographicData.localities,
            populationDensity: (geoData ? Math.round(demographicData.totalPopulation / geoData.superficie) : undefined)
          };
        }

        const educationData = await openData.getEducationData(municipalityData.municipality.name);
        if (educationData) {
          municipalityData.education = educationData;
        }
      }

      await cache.cacheMunicipalityData(municipalityId, municipalityData);
    }

    if (!municipalityData) return res.status(404).json({ message: 'Municipality not found' });

    const response: MunicipalityDetailsResponse = municipalityData;
    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || 'Failed to get municipality details' });
  }
}
