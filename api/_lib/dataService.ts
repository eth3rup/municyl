import { readFileSync, existsSync } from 'fs';
import path from 'path';

interface MunicipalityData {
  CodINE5: string;
  PROVINCIA: string;
  NOMBRE_ACTUAL: string;
  POBLACION_MUNI: string;
  SUPERFICIE: string;
  LONGITUD_ETRS89: string;
  LATITUD_ETRS89: string;
  ALTITUD: string;
}

interface PostalCodeData {
  codINE5: string;
  CP: string;
}

interface NomenclatorData {
  codINE5: string;
  Unidad: string;
  poblacion: string;
  total_2024: string;
  hombres_2024: string;
  mujeres_2024: string;
  espanoles_2024: string;
  extranjeros_2024: string;
  de0a14: string;
  de15a64: string;
  apartirde65: string;
}

interface PopulationMappingItem {
  poblacion_sin_tilde: string;
  poblacion_con_tilde: string;
  codINE5: string;
}

export interface MunicipalityGeographic {
  ineCode: string;
  name: string;
  provinceCode: string;
  provinceName: string;
  superficie: number; // hectares
  altitud: number; // meters
  latitud: number;
  longitud: number;
}

export interface PopulationData {
  totalPopulation: number;
  men: number;
  women: number;
  spanish: number;
  foreign: number;
  age0to14: number;
  age15to64: number;
  age65plus: number;
  localities: Array<{
    name: string;
    population: number;
    men: number;
    women: number;
    spanish: number;
    foreign: number;
    age0to14: number;
    age15to64: number;
    age65plus: number;
  }>;
}

class DataService {
  private municipalitiesData: MunicipalityData[] = [];
  private postalCodesData: PostalCodeData[] = [];
  private nomenclatorData: NomenclatorData[] = [];
  private populationMappingData: PopulationMappingItem[] = [];

  async initializeData(): Promise<void> {
    console.log('[JSON Data] Loading complementary JSON data files...');
    this.loadMunicipalitiesData();
    this.loadPostalCodesData();
    this.loadNomenclatorData();
    this.loadPopulationMapping();
  }

  private loadMunicipalitiesData(): void {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'municipios_cyl.json');
      if (existsSync(dataPath)) {
        const data = readFileSync(dataPath, 'utf-8');
        this.municipalitiesData = JSON.parse(data);
        console.log(`[JSON Data] Loaded ${this.municipalitiesData.length} municipalities with geographic data`);
      } else {
        console.log('[JSON Data] Municipalities file not found, using empty data');
        this.municipalitiesData = [];
      }
    } catch (error) {
      console.error('[JSON Data] Error loading municipalities data:', error);
      this.municipalitiesData = [];
    }
  }

  private loadPostalCodesData(): void {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'codigos_postales.json');
      if (existsSync(dataPath)) {
        const data = readFileSync(dataPath, 'utf-8');
        this.postalCodesData = JSON.parse(data);
        console.log(`[JSON Data] Loaded ${this.postalCodesData.length} postal codes`);
      } else {
        console.log('[JSON Data] Postal codes file not found, using empty data');
        this.postalCodesData = [];
      }
    } catch (error) {
      console.error('[JSON Data] Error loading postal codes data:', error);
      this.postalCodesData = [];
    }
  }

  private loadNomenclatorData(): void {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'nomenclator_cyl.json');
      if (existsSync(dataPath)) {
        const data = readFileSync(dataPath, 'utf-8');
        this.nomenclatorData = JSON.parse(data);
        console.log(`[JSON Data] Loaded ${this.nomenclatorData.length} nomenclator entries with demographic data`);
      } else {
        console.log('[JSON Data] Nomenclator file not found, using empty data');
        this.nomenclatorData = [];
      }
    } catch (error) {
      console.error('[JSON Data] Error loading nomenclator data:', error);
      this.nomenclatorData = [];
    }
  }

  private loadPopulationMapping(): void {
    try {
      const filePath = path.join(process.cwd(), 'data', 'poblacion_ine_mapping.json');
      if (existsSync(filePath)) {
        const data = readFileSync(filePath, 'utf8');
        const rawData = JSON.parse(data);
        
        // Parse the special format with combined field name
        this.populationMappingData = rawData.map((item: any) => {
          const parts = item['poblacion_sin_tilde;poblacion_con_tilde;codINE5'].split(';');
          return {
            poblacion_sin_tilde: parts[0],
            poblacion_con_tilde: parts[1],
            codINE5: parts[2]
          };
        });
        
        console.log(`[JSON Data] Loaded ${this.populationMappingData.length} population mapping entries`);
      } else {
        console.log('[JSON Data] Population mapping file not found, using empty data');
        this.populationMappingData = [];
      }
    } catch (error) {
      console.error('[JSON Data] Error loading population mapping data:', error);
      this.populationMappingData = [];
    }
  }

  async getMunicipalityGeographic(ineCode: string): Promise<MunicipalityGeographic | null> {
    try {
      const municipality = this.municipalitiesData.find(m => m.CodINE5 === ineCode);
      
      if (!municipality) {
        return null;
      }

      return {
        ineCode: municipality.CodINE5,
        name: municipality.NOMBRE_ACTUAL || '',
        provinceCode: municipality.CodINE5.substring(0, 2),
        provinceName: municipality.PROVINCIA || '',
        superficie: parseFloat(municipality.SUPERFICIE) || 0,
        altitud: parseInt(municipality.ALTITUD) || 0,
        latitud: parseFloat(municipality.LATITUD_ETRS89) || 0,
        longitud: parseFloat(municipality.LONGITUD_ETRS89) || 0,
      };
    } catch (error) {
      console.error('[JSON Data] Error fetching municipality geographic data:', error);
      return null;
    }
  }

  async getMunicipalityPopulation(ineCode: string): Promise<PopulationData | null> {
    try {
      // Get demographic data from nomenclator
      const municipalityEntries = this.nomenclatorData.filter(entry => entry.codINE5 === ineCode);
      
      if (municipalityEntries.length === 0) {
        return null;
      }

      // Find municipal total (unidad = "0" según nuevas especificaciones)
      const municipalTotal = municipalityEntries.find(entry => entry.Unidad === '0');
      
      if (!municipalTotal) {
        return null;
      }

      // Find localities: unidad ending in "0" but not being "0" (100, 200, 300, etc.)
      const localities = municipalityEntries
        .filter(entry => {
          const unidad = entry.Unidad;
          return unidad !== '0' && unidad.endsWith('0');
        })
        .map(entry => ({
          name: entry.poblacion || '',
          population: parseInt(entry.total_2024) || 0,
          men: parseInt(entry.hombres_2024) || 0,
          women: parseInt(entry.mujeres_2024) || 0,
          spanish: parseInt(entry.espanoles_2024) || 0,
          foreign: parseInt(entry.extranjeros_2024) || 0,
          age0to14: parseInt(entry.de0a14) || 0,
          age15to64: parseInt(entry.de15a64) || 0,
          age65plus: parseInt(entry.apartirde65) || 0,
        }));

      return {
        totalPopulation: parseInt(municipalTotal.total_2024) || 0,
        men: parseInt(municipalTotal.hombres_2024) || 0,
        women: parseInt(municipalTotal.mujeres_2024) || 0,
        spanish: parseInt(municipalTotal.espanoles_2024) || 0,
        foreign: parseInt(municipalTotal.extranjeros_2024) || 0,
        age0to14: parseInt(municipalTotal.de0a14) || 0,
        age15to64: parseInt(municipalTotal.de15a64) || 0,
        age65plus: parseInt(municipalTotal.apartirde65) || 0,
        localities,
      };
    } catch (error) {
      console.error('[JSON Data] Error fetching population data:', error);
      return null;
    }
  }

  async searchMunicipalities(searchTerm: string): Promise<Array<{ ineCode: string; name: string; provinceName: string }>> {
    try {
      const normalizedSearch = searchTerm.toLowerCase().trim();
      
      return this.municipalitiesData
        .filter(municipality => 
          municipality.NOMBRE_ACTUAL.toLowerCase().includes(normalizedSearch) ||
          municipality.PROVINCIA.toLowerCase().includes(normalizedSearch)
        )
        .slice(0, 20) // Limit to first 20 results
        .map(municipality => ({
          ineCode: municipality.CodINE5,
          name: municipality.NOMBRE_ACTUAL,
          provinceName: municipality.PROVINCIA
        }));
    } catch (error) {
      console.error('[JSON Data] Error searching municipalities:', error);
      return [];
    }
  }

  async getPostalCodes(ineCode: string): Promise<string[]> {
    try {
      return this.postalCodesData
        .filter(postal => postal.codINE5 === ineCode)
        .map(postal => postal.CP);
    } catch (error) {
      console.error('[JSON Data] Error fetching postal codes:', error);
      return [];
    }
  }

  async getPrimaryPostalCode(ineCode: string): Promise<string | null> {
    try {
      const postalCodes = await this.getPostalCodes(ineCode);
      return postalCodes.length > 0 ? postalCodes[0] : null;
    } catch (error) {
      console.error('[JSON Data] Error fetching primary postal code:', error);
      return null;
    }
  }

  async getPopulationMapping(): Promise<PopulationMappingItem[]> {
    return this.populationMappingData;
  }

  async getDataStats(): Promise<{municipalitiesCount: number, postalCodesCount: number}> {
    try {
      return {
        municipalitiesCount: this.municipalitiesData.length,
        postalCodesCount: this.postalCodesData.length
      };
    } catch (error) {
      console.error('[JSON Data] Error getting stats:', error);
      return { municipalitiesCount: 0, postalCodesCount: 0 };
    }
  }
}

export default new DataService();