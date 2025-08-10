import { Municipality, MunicipalityData } from "../../shared/schema";

/**
 * Storage interface for municipality data
 * Currently using in-memory storage but can be extended to use database
 */
export interface IStorage {
  // Cache management for API responses
  cacheMunicipalities(searchKey: string, municipalities: Municipality[]): Promise<void>;
  getCachedMunicipalities(searchKey: string): Promise<Municipality[] | undefined>;
  cacheMunicipalityData(municipalityId: string, data: MunicipalityData): Promise<void>;
  getCachedMunicipalityData(municipalityId: string): Promise<MunicipalityData | undefined>;
  clearCache(): Promise<void>;
}

export class MemStorage implements IStorage {
  private municipalityCache: Map<string, Municipality[]>;
  private municipalityDataCache: Map<string, MunicipalityData>;
  private cacheTimestamps: Map<string, number>;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.municipalityCache = new Map();
    this.municipalityDataCache = new Map();
    this.cacheTimestamps = new Map();
  }

  async cacheMunicipalities(searchKey: string, municipalities: Municipality[]): Promise<void> {
    this.municipalityCache.set(searchKey, municipalities);
    this.cacheTimestamps.set(searchKey, Date.now());
  }

  async getCachedMunicipalities(searchKey: string): Promise<Municipality[] | undefined> {
    const timestamp = this.cacheTimestamps.get(searchKey);
    
    if (!timestamp || Date.now() - timestamp > this.CACHE_DURATION) {
      this.municipalityCache.delete(searchKey);
      this.cacheTimestamps.delete(searchKey);
      return undefined;
    }

    return this.municipalityCache.get(searchKey);
  }

  async cacheMunicipalityData(municipalityId: string, data: MunicipalityData): Promise<void> {
    this.municipalityDataCache.set(municipalityId, data);
    this.cacheTimestamps.set(`data_${municipalityId}`, Date.now());
  }

  async getCachedMunicipalityData(municipalityId: string): Promise<MunicipalityData | undefined> {
    const timestamp = this.cacheTimestamps.get(`data_${municipalityId}`);
    
    if (!timestamp || Date.now() - timestamp > this.CACHE_DURATION) {
      this.municipalityDataCache.delete(municipalityId);
      this.cacheTimestamps.delete(`data_${municipalityId}`);
      return undefined;
    }

    return this.municipalityDataCache.get(municipalityId);
  }

  async clearCache(): Promise<void> {
    this.municipalityCache.clear();
    this.municipalityDataCache.clear();
    this.cacheTimestamps.clear();
  }
}

export const storage = new MemStorage();
