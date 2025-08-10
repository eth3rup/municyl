
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cache, dataService, openData } from '../../../_lib/index';
import type { MunicipalityDetailsResponse } from '../../../../shared/schema';

function generateCSV(data: MunicipalityDetailsResponse): string {
  const rows: string[][] = [];
  
  // Header row
  rows.push(['Categoría', 'Campo', 'Valor']);
  
  // Municipality basic info
  rows.push(['INFORMACIÓN BÁSICA', 'Nombre', data.municipality.name]);
  rows.push(['INFORMACIÓN BÁSICA', 'Provincia', data.municipality.provinceName]);
  rows.push(['INFORMACIÓN BÁSICA', 'Código Provincial', data.municipality.provinceCode]);
  
  if (data.municipality.surface) {
    rows.push(['INFORMACIÓN BÁSICA', 'Superficie (km²)', data.municipality.surface.toString()]);
  }
  
  if (data.municipality.altitude) {
    rows.push(['INFORMACIÓN BÁSICA', 'Altitud (m)', data.municipality.altitude.toString()]);
  }

  if (data.municipality.coordinates) {
    rows.push(['INFORMACIÓN BÁSICA', 'Latitud', data.municipality.coordinates[1].toString()]);
    rows.push(['INFORMACIÓN BÁSICA', 'Longitud', data.municipality.coordinates[0].toString()]);
  }

  if (data.municipality.postalCodes) {
    rows.push(['INFORMACIÓN BÁSICA', 'Códigos Postales', data.municipality.postalCodes.join(', ')]);
  }

  if (data.municipality.comercio !== undefined) {
    rows.push(['INFORMACIÓN BÁSICA', 'Comercio Local', data.municipality.comercio ? 'Sí' : 'No']);
  }

  if (data.municipality.mancomunidades && data.municipality.mancomunidades.length > 0) {
    rows.push(['INFORMACIÓN BÁSICA', 'Mancomunidades', data.municipality.mancomunidades.join(', ')]);
  }

  if (data.municipality.entidadesLocalesMenores && data.municipality.entidadesLocalesMenores.length > 0) {
    rows.push(['INFORMACIÓN BÁSICA', 'Entidades Locales Menores', data.municipality.entidadesLocalesMenores.join(', ')]);
  }

  // Demographics
  if (data.demographics) {
    rows.push(['DEMOGRAFÍA', 'Población Total', data.demographics.totalPopulation.toString()]);
    rows.push(['DEMOGRAFÍA', 'Hombres', data.demographics.men.toString()]);
    rows.push(['DEMOGRAFÍA', 'Mujeres', data.demographics.women.toString()]);
    rows.push(['DEMOGRAFÍA', 'Porcentaje Hombres (%)', ((data.demographics.men / data.demographics.totalPopulation) * 100).toFixed(2)]);
    rows.push(['DEMOGRAFÍA', 'Porcentaje Mujeres (%)', ((data.demographics.women / data.demographics.totalPopulation) * 100).toFixed(2)]);
    

    
    if (data.demographics.foreigners) {
      rows.push(['DEMOGRAFÍA', 'Extranjeros', data.demographics.foreigners.toString()]);
      rows.push(['DEMOGRAFÍA', 'Porcentaje Extranjeros (%)', ((data.demographics.foreigners / data.demographics.totalPopulation) * 100).toFixed(2)]);
    }
    

    
    if (data.demographics.populationDensity) {
      rows.push(['DEMOGRAFÍA', 'Densidad Población (hab/km²)', data.demographics.populationDensity.toFixed(2)]);
    }
  }

  // Education
  if (data.education) {
    if (data.education.primarySchools !== undefined) {
      rows.push(['EDUCACIÓN', 'Centros Infantil/Primaria', data.education.primarySchools.toString()]);
    }
    
    if (data.education.secondarySchools !== undefined) {
      rows.push(['EDUCACIÓN', 'Institutos ESO/Bachillerato', data.education.secondarySchools.toString()]);
    }
    
    if (data.education.vocationalSchools !== undefined) {
      rows.push(['EDUCACIÓN', 'Centros Formación Profesional', data.education.vocationalSchools.toString()]);
    }
    
    if (data.education.hasUniversity !== undefined) {
      rows.push(['EDUCACIÓN', 'Universidad', data.education.hasUniversity ? 'Disponible' : 'No disponible']);
    }
    
    if (data.education.libraries !== undefined) {
      rows.push(['EDUCACIÓN', 'Bibliotecas Públicas', data.education.libraries.toString()]);
    }

    // Calculate totals
    const totalEducationalCenters = (data.education.primarySchools || 0) + 
                                   (data.education.secondarySchools || 0) + 
                                   (data.education.vocationalSchools || 0);
    rows.push(['EDUCACIÓN', 'Total Centros Educativos', totalEducationalCenters.toString()]);
    
    if (data.demographics && totalEducationalCenters > 0) {
      rows.push(['EDUCACIÓN', 'Habitantes por Centro Educativo', Math.round(data.demographics.totalPopulation / totalEducationalCenters).toString()]);
    }
  }

  // Health and Services
  if (data.services) {
    if (data.services.healthCenters !== undefined) {
      rows.push(['SANIDAD', 'Centros de Salud', data.services.healthCenters.toString()]);
      if (data.demographics && data.services.healthCenters > 0) {
        rows.push(['SANIDAD', 'Habitantes por Centro de Salud', Math.round(data.demographics.totalPopulation / data.services.healthCenters).toString()]);
      }
    }
    
    if (data.services.hospitals !== undefined) {
      rows.push(['SANIDAD', 'Hospitales', data.services.hospitals.toString()]);
    }
    
    if (data.services.pharmacies !== undefined) {
      rows.push(['SANIDAD', 'Farmacias', data.services.pharmacies.toString()]);
      if (data.demographics && data.services.pharmacies > 0) {
        rows.push(['SANIDAD', 'Habitantes por Farmacia', Math.round(data.demographics.totalPopulation / data.services.pharmacies).toString()]);
      }
    }
    
    if (data.services.fireStations !== undefined) {
      rows.push(['EMERGENCIAS', 'Parques de Bomberos', data.services.fireStations.toString()]);
    }
  }

  // Economy and Employment
  if (data.economy) {
    if (data.economy.unemploymentRate !== undefined) {
      rows.push(['ECONOMÍA', 'Tasa de Desempleo (%)', data.economy.unemploymentRate.toFixed(2)]);
    }
    
    if (data.economy.activeCompanies !== undefined) {
      rows.push(['ECONOMÍA', 'Empresas Activas', data.economy.activeCompanies.toString()]);
      
      if (data.demographics) {
        const companyDensity = (data.economy.activeCompanies / data.demographics.totalPopulation) * 100;
        rows.push(['ECONOMÍA', 'Empresas por 100 Habitantes', companyDensity.toFixed(2)]);
      }
    }
    
    if (data.economy.servicesPercentage !== undefined) {
      rows.push(['ECONOMÍA', 'Sector Servicios (%)', data.economy.servicesPercentage.toFixed(2)]);
    }
    
    if (data.economy.incomePerCapita !== undefined) {
      rows.push(['ECONOMÍA', 'Renta per Cápita (€)', data.economy.incomePerCapita.toString()]);
    }
  }

  // Infrastructure estimates
  if (data.demographics) {
    rows.push(['INFRAESTRUCTURA', 'Vehículos Estimados', Math.round(data.demographics.totalPopulation * 0.6).toString()]);
    rows.push(['INFRAESTRUCTURA', 'Viviendas Estimadas', Math.round(data.demographics.totalPopulation * 0.45).toString()]);
    rows.push(['INFRAESTRUCTURA', 'Restaurantes Estimados', Math.max(1, Math.floor(data.demographics.totalPopulation / 800)).toString()]);
    rows.push(['INFRAESTRUCTURA', 'Establecimientos Comerciales Estimados', Math.max(2, Math.floor(data.demographics.totalPopulation / 500)).toString()]);
  }

  // Add timestamp
  rows.push(['METADATOS', 'Fecha de Exportación', new Date().toLocaleDateString('es-ES')]);
  rows.push(['METADATOS', 'Fuente', 'Junta de Castilla y León - Datos Abiertos']);

  // Convert to CSV format with proper escaping
  return rows.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });
  try {
    await dataService.initializeData();
    const municipalityId = req.query.id as string;
    if (!municipalityId) return res.status(400).json({ message: 'Municipality ID is required' });

    let data = await cache.getCachedMunicipalityData(municipalityId);
    if (!data) {
      data = await openData.getMunicipalityDetails(municipalityId);
      if (!data) return res.status(404).json({ message: 'Municipality not found' });
      await cache.cacheMunicipalityData(municipalityId, data);
    }

    const csvContent = generateCSV(data as MunicipalityDetailsResponse);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${(data as any).municipality.name}_datos.csv"`);
    res.status(200).send(csvContent);
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'Failed to export municipality data' });
  }
}
