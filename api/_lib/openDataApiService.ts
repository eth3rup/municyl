import { Municipality, MunicipalityData, SearchParams, Demographics, Education, Services, Economy, EducationCenter, HealthCenter } from "./shared/schema";

/**
 * Service for interacting with Junta de Castilla y León Open Data API
 * API Documentation: https://datosabiertos.jcyl.es/web/jcyl/binarios/645/728/Manual%20de%20consultas_DatosBasicos.pdf
 */
export class OpenDataApiService {
  private readonly baseUrl = 'https://analisis.datosabiertos.jcyl.es/api/records/1.0/search';
  
  /**
   * Search municipalities by name using the open data API
   */
  async searchMunicipalities(params: SearchParams): Promise<Municipality[]> {
    try {
      const queryParams = new URLSearchParams({
        'dataset': 'registro-de-municipios-de-castilla-y-leon',
        'format': 'json',
        'rows': String(params.limit || 10)
      });
      
      // Add facets separately to avoid duplicate keys
      queryParams.append('facet', 'provincia');
      queryParams.append('facet', 'municipio');

      // Add search query if provided
      if (params.query && params.query.trim()) {
        queryParams.set('q', `municipio:*${params.query}*`);
      }

      // Add province filter if provided
      if (params.provinceCode) {
        queryParams.set('refine.provincia', params.provinceCode);
      }

      const response = await fetch(`${this.baseUrl}?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.transformMunicipalityResults(data);
    } catch (error) {
      console.error('Error searching municipalities via API:', error);
      throw new Error('Failed to search municipalities. Please try again later.');
    }
  }

  /**
   * Get detailed data for a specific municipality
   */
  async getMunicipalityDetails(municipalityId: string): Promise<{ municipality: Municipality }> {
    try {
      // Get basic municipality info
      const municipality = await this.getMunicipalityBasicInfo(municipalityId);
      
      return {
        municipality
      };
    } catch (error) {
      console.error('Error getting municipality details via API:', error);
      throw new Error('Failed to load municipality details. Please try again later.');
    }
  }

  private async getMunicipalityBasicInfo(municipalityId: string): Promise<Municipality> {
    const queryParams = new URLSearchParams({
      'dataset': 'registro-de-municipios-de-castilla-y-leon',
      'format': 'json',
      'q': `cod_ine:${municipalityId}`,
      'rows': '1',
    });

    const response = await fetch(`${this.baseUrl}?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch municipality info: ${response.status}`);
    }

    const data = await response.json();
    if (!data.records || data.records.length === 0) {
      throw new Error('Municipality not found');
    }
    
    return this.transformMunicipalityData(data.records[0]);
  }

  async getEducationData(municipalityName: string): Promise<any> {
    try {
      const encodedMunicipality = encodeURIComponent(municipalityName.toUpperCase());
      const url = `https://jcyl.opendatasoft.com/api/explore/v2.1/catalog/datasets/directorio-de-centros-docentes/records?where=municipio="${encodedMunicipality}"&format=json&limit=100`;
      
      console.log(`[OpenData API] Fetching education data for: ${municipalityName}`);
      console.log(`[OpenData API] URL: ${url}`);

      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`[OpenData API] Education API returned status: ${response.status}`);
        return null;
      }

      const data = await response.json();
      console.log(`[OpenData API] Found ${data.total_count || 0} education centers for ${municipalityName}`);

      if (!data.results || data.results.length === 0) {
        return {
          totalCenters: 0,
          centers: [],
          primarySchools: 0,
          secondarySchools: 0,
          vocationalSchools: 0,
          hasUniversity: false,
          libraries: 0
        };
      }

      // Process the educational centers
      const centers = data.results.map((center: any) => ({
        nombre_centro: center.denominacion_especifica || '',
        codigo_centro: center.codigo || '',
        tipo_centro: center.denominacion_generica || '',
        denominacion_generica_breve: center.denominacion_generica_breve || '',
        titularidad: center.naturaleza || '',
        direccion: `${center.via || ''} ${center.nombre_de_la_via || ''} ${center.numero_ext || center.numero || ''}`.trim(),
        codigo_postal: center.c_postal?.toString() || '',
        telefono: center.telefono?.toString() || '',
        email: center.correo_electronico || '',
        web: center.web || '',
        curso_academico: center.curso_academico || '2024',
        transporte: center.transporte || 'N',
        comedor: center.comedor || 'N',
        jornada_continua: center.jornada_continua || 'N',
        internado: center.internado || 'N',
        niveles_educativos: [], // Not directly available in this format
        coordenadas: center.localizacion ? {
          lat: center.localizacion.lat,
          lon: center.localizacion.lon
        } : null
      }));

      // Calculate statistics by type
      let primarySchools = 0;
      let secondarySchools = 0;
      let vocationalSchools = 0;

      centers.forEach((center: any) => {
        const tipo = center.tipo_centro?.toLowerCase() || '';
        
        if (tipo.includes('infantil') || tipo.includes('primaria') || tipo.includes('ceip')) {
          primarySchools++;
        } else if (tipo.includes('secundaria') || tipo.includes('ies') || tipo.includes('bachillerato')) {
          secondarySchools++;
        } else if (tipo.includes('formación profesional') || tipo.includes('fp') || tipo.includes('ciclo')) {
          vocationalSchools++;
        }
      });

      return {
        totalCenters: centers.length,
        centers,
        primarySchools,
        secondarySchools,
        vocationalSchools,
        hasUniversity: false, // No universities in municipal data
        libraries: 0 // Libraries not included in this dataset
      };

    } catch (error) {
      console.error('[OpenData API] Error fetching education data:', error);
      return null;
    }
  }

  private transformMunicipalityResults(apiData: any): Municipality[] {
    if (!apiData || !Array.isArray(apiData.records)) {
      return [];
    }

    return apiData.records.map((record: any) => this.transformMunicipalityData(record));
  }

  /**
   * Get health centers for a municipality using the population mapping
   */
  async getHealthData(municipalityName: string, municipalityId: string): Promise<HealthCenter[]> {
    try {
      console.log(`[OpenData API] Fetching health data for: ${municipalityName} (ID: ${municipalityId})`);
      
      // Load population mapping data to match municipality names without tildes
      const fs = require('fs');
      const path = require('path');
      const mappingPath = path.join(process.cwd(), 'data', 'poblacion_ine_mapping.json');
      
      if (!fs.existsSync(mappingPath)) {
        console.error('[OpenData API] Population mapping file not found at:', mappingPath);
        return [];
      }
      
      console.log(`[OpenData API] Loading mapping data from: ${mappingPath}`);
      const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
      console.log(`[OpenData API] Loaded ${mappingData.length} mapping entries`);
      console.log(`[OpenData API] Sample mapping entry:`, mappingData[0]);
      
      // Find population names for this municipality
      const municipalityPopulations = mappingData
        .filter((item: any) => {
          const parts = item['poblacion_sin_tilde;poblacion_con_tilde;codINE5'].split(';');
          // Normalize INE code to 5 digits (add leading zero if needed)
          const normalizedINE = parts[2].padStart(5, '0');
          console.log(`[OpenData API] Checking: ${normalizedINE} === ${municipalityId} (original: ${parts[2]})`);
          return normalizedINE === municipalityId;
        })
        .map((item: any) => {
          const parts = item['poblacion_sin_tilde;poblacion_con_tilde;codINE5'].split(';');
          return {
            sinTilde: parts[0],
            conTilde: parts[1],
            codINE: parts[2].padStart(5, '0')
          };
        });

      console.log(`[OpenData API] Found ${municipalityPopulations.length} populations for municipality ${municipalityId}`);
      if (municipalityPopulations.length === 0) {
        console.log(`[OpenData API] No population mapping found for municipality ID: ${municipalityId}`);
        return [];
      }
      
      console.log(`[OpenData API] First population:`, municipalityPopulations[0]);

      // Search health centers for each population name
      const allHealthCenters: HealthCenter[] = [];
      
      for (const pop of municipalityPopulations) {
        const queryParams = new URLSearchParams({
          'dataset': 'registro-de-centros-sanitarios-de-castilla-y-leon',
          'format': 'json',
          'q': `localidad:"${pop.sinTilde}"`,
          'rows': '100'
        });

        const url = `https://analisis.datosabiertos.jcyl.es/api/records/1.0/search?${queryParams}`;
        console.log(`[OpenData API] Health centers URL: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`[OpenData API] Health API request failed: ${response.status}`);
          continue;
        }

        const data = await response.json();
        
        if (data.records && data.records.length > 0) {
          const centers = data.records.map((record: any) => this.transformHealthCenterData(record, pop.conTilde));
          allHealthCenters.push(...centers);
        }
      }

      console.log(`[OpenData API] Found ${allHealthCenters.length} health centers for ${municipalityName}`);
      return allHealthCenters;
      
    } catch (error) {
      console.error('[OpenData API] Error fetching health data:', error);
      console.error('[OpenData API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return [];
    }
  }

  private transformHealthCenterData(record: any, poblacionConTilde: string): HealthCenter {
    const fields = record.fields || {};
    
    // Parse coordinates
    const coordinates = record.geometry?.coordinates ? 
      { lat: record.geometry.coordinates[1], lon: record.geometry.coordinates[0] } : 
      undefined;
    
    return {
      codigo_centro_sanitario: fields.no_de_registro || '',
      nombre_centro_sanitario: fields.nombre_del_centro || '',
      tipo_centro: fields.tipo_de_centro || '',
      tipo_asistencia: fields.finalidad_asistencial || '',
      dependencia_funcional: fields.dependencia_funcional || '',
      clasificacion: fields.titularidad || '',
      regimen_juridico: fields.titularidad || '',
      direccion: fields.direccion || '',
      poblacion: poblacionConTilde, // Use the population name with tildes
      codigo_postal: fields.codigo_postal || '',
      telefono: fields.telefono ? String(fields.telefono) : '',
      email: fields.email || '',
      web: fields.web || '',
      coordenadas: coordinates
    };
  }

  private transformMunicipalityData(record: any): Municipality {
    const fields = record.fields || {};
    
    // Map province codes to two-letter codes
    const provinceCodeMap: Record<string, string> = {
      '05': 'AV', '09': 'BU', '24': 'LE', '34': 'P', '37': 'SA',
      '40': 'SG', '42': 'SO', '47': 'VA', '49': 'ZA'
    };
    
    const provCodeNum = fields.cod_provincia || '';
    const provinceCode = provinceCodeMap[provCodeNum] || 'VA';
    
    // Parse coordinates
    const coordinates = record.geometry?.coordinates ? 
      [record.geometry.coordinates[0], record.geometry.coordinates[1]] as [number, number] : 
      undefined;
    
    // Parse postal codes if available
    const postalCodes = fields.codigos_postales ? 
      fields.codigos_postales.split(',').map((code: string) => code.trim()) : 
      undefined;

    return {
      id: String(fields.cod_ine || fields.cod_municipio || ''),
      name: fields.municipio || fields.nombre || '',
      provinceCode: provinceCode as any,
      provinceName: fields.provincia || '',
      postalCodes: postalCodes,
      surface: fields.superficie ? parseFloat(fields.superficie) : undefined,
      altitude: fields.altitud ? parseInt(fields.altitud) : undefined,
      population: fields.poblacion ? parseInt(fields.poblacion) : undefined,
      coordinates: coordinates,
    };
  }
}

export const openDataApiService = new OpenDataApiService();