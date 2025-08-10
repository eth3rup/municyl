import { z } from "zod";

// Province codes for Castilla y León
export const ProvinceCode = z.enum([
  'AV', 'BU', 'LE', 'P', 'SA', 'SG', 'SO', 'VA', 'ZA'
]);

export const provinceNames: Record<z.infer<typeof ProvinceCode>, string> = {
  'AV': 'Ávila',
  'BU': 'Burgos', 
  'LE': 'León',
  'P': 'Palencia',
  'SA': 'Salamanca',
  'SG': 'Segovia',
  'SO': 'Soria',
  'VA': 'Valladolid',
  'ZA': 'Zamora'
};

// Municipality basic info schema
export const municipalitySchema = z.object({
  id: z.string(),
  name: z.string(),
  provinceCode: ProvinceCode,
  provinceName: z.string(),
  postalCodes: z.array(z.string()).optional(),
  surface: z.number().optional(), // Surface area in km²
  altitude: z.number().optional(), // Altitude in meters
  population: z.number().optional(), // Current population
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  coordinates: z.tuple([z.number(), z.number()]).optional(), // [longitude, latitude]
  mancomunidades: z.array(z.string()).optional(), // Municipal associations
  entidadesLocalesMenores: z.array(z.string()).optional(), // Minor local entities
  comercio: z.boolean().optional(), // Presence of commerce
});

// Demographics data schema
export const demographicsSchema = z.object({
  totalPopulation: z.number(),
  men: z.number(),
  women: z.number(),
  spanish: z.number(),
  foreigners: z.number(),
  age0to14: z.number(),
  age15to64: z.number(),
  age65plus: z.number(),
  populationDensity: z.number().optional(),
  populationsCount: z.number().optional(),
  localities: z.array(z.object({
    name: z.string(),
    population: z.number(),
    men: z.number(),
    women: z.number(),
    spanish: z.number(),
    foreign: z.number(),
    age0to14: z.number(),
    age15to64: z.number(),
    age65plus: z.number(),
  })).optional(),
});

// Education data schema
export const educationSchema = z.object({
  primarySchools: z.number().optional(),
  secondarySchools: z.number().optional(),
  vocationalSchools: z.number().optional(),
  hasUniversity: z.boolean().optional(),
  libraries: z.number().optional(),
  totalCenters: z.number().optional(),
  centers: z.array(z.object({
    nombre_centro: z.string(),
    codigo_centro: z.string(),
    tipo_centro: z.string(),
    denominacion_generica_breve: z.string().optional(),
    titularidad: z.string(),
    direccion: z.string(),
    codigo_postal: z.string().optional(),
    telefono: z.string().optional(),
    email: z.string().optional(),
    web: z.string().optional(),
    curso_academico: z.string().optional(),
    transporte: z.string().optional(),
    comedor: z.string().optional(),
    jornada_continua: z.string().optional(),
    internado: z.string().optional(),
    niveles_educativos: z.array(z.string()).optional(),
    coordenadas: z.object({
      lat: z.number(),
      lon: z.number()
    }).optional()
  })).optional(),
});

// Services data schema
export const servicesSchema = z.object({
  healthCenters: z.number().optional(),
  hospitals: z.number().optional(),
  pharmacies: z.number().optional(),
  fireStations: z.number().optional(),
});

// Economy data schema
export const economySchema = z.object({
  unemploymentRate: z.number().optional(),
  activeCompanies: z.number().optional(),
  servicesPercentage: z.number().optional(),
  incomePerCapita: z.number().optional(),
});

// Complete municipality data schema
export const municipalityDataSchema = z.object({
  municipality: municipalitySchema,
  demographics: demographicsSchema.optional(),
  education: educationSchema.optional(),
  services: servicesSchema.optional(),
  economy: economySchema.optional(),
});

// Search parameters schema
export const searchParamsSchema = z.object({
  query: z.string().optional(),
  provinceCode: ProvinceCode.optional(),
  limit: z.number().min(1).max(50).default(10),
});

// Export types
export type Municipality = z.infer<typeof municipalitySchema>;
export type Demographics = z.infer<typeof demographicsSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Services = z.infer<typeof servicesSchema>;
export type Economy = z.infer<typeof economySchema>;
export type MunicipalityData = z.infer<typeof municipalityDataSchema>;
export type SearchParams = z.infer<typeof searchParamsSchema>;

// API response schemas
export const searchResponseSchema = z.object({
  municipalities: z.array(municipalitySchema),
  total: z.number(),
});

export const municipalityDetailsResponseSchema = municipalityDataSchema;

export type SearchResponse = z.infer<typeof searchResponseSchema>;
export type MunicipalityDetailsResponse = z.infer<typeof municipalityDetailsResponseSchema>;

// Interfaces for additional data types
export interface EducationCenter {
  codigo_centro: string;
  nombre_centro: string;
  direccion: string;
  codigo_postal: string;
  municipio: string;
  telefono?: string;
  email?: string;
  web?: string;
  titularidad: string;
  denominacion_generica_breve?: string;
  tipo_centro?: string;
  transporte?: string;
  comedor?: string;
  jornada_continua?: string;
  internado?: string;
  coordenadas?: {
    lat: number;
    lon: number;
  };
}

export interface HealthCenter {
  codigo_centro_sanitario: string;
  nombre_centro_sanitario: string;
  tipo_centro?: string;
  tipo_asistencia?: string;
  dependencia_funcional?: string;
  clasificacion?: string;
  regimen_juridico?: string;
  direccion: string;
  poblacion: string;
  codigo_postal?: string;
  telefono?: string;
  email?: string;
  web?: string;
  coordenadas?: {
    lat: number;
    lon: number;
  };
}
