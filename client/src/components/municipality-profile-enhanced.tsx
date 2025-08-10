import { useState, useEffect } from "react";
import { Pagination } from "@/components/pagination";
import { 
  Building2, 
  Users, 
  GraduationCap, 
  Hospital, 
  TrendingUp, 
  Download, 
  Share2,
  MapPin,
  Globe,
  Mountain,
  Building,
  ShoppingBag,
  Map,
  Car,
  Briefcase,
  Heart,
  BookOpen,
  Trees,
  Factory,
  Home,
  Shield,
  Utensils,
  Camera,
  Filter,
  Bus,
  Clock,
  Bed,
  UtensilsCrossed,
  ArrowUpDown,
  X,
  Maximize2,
  Stethoscope,
  Ambulance,
  Pill
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useMunicipalityDetails } from "@/hooks/use-municipalities";
import { useHealthData } from "@/hooks/use-health";
import { Municipality } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { exportMunicipalityCSV } from "@/lib/csv-export";

// Helper function to display invented data as "X"
const formatDataValue = (value: number | undefined, suffix: string = ''): string => {
  if (value === undefined || value === null) return 'X';
  if (value === -1) return 'X'; // Invented/calculated data
  if (value === 0) return 'X'; // Zero values should also show as X for missing data
  return value.toLocaleString('es-ES') + suffix;
};

const formatPercentage = (value: number | undefined): string => {
  if (value === undefined || value === null) return 'N/A';
  if (value === -1) return 'X'; // Invented/calculated data
  return value.toFixed(1) + '%';
};

const formatBoolean = (value: boolean | undefined): string => {
  if (value === undefined || value === null) return 'N/A';
  if (value === false && typeof value === 'boolean') return 'X'; // Check if it's intentionally false (invented)
  return value ? 'Disponible' : 'No disponible';
};

// Color mapping for denominacion_generica_breve
const getTipoColor = (tipo: string): string => {
  const colors: { [key: string]: string } = {
    'CEIP': 'bg-blue-100 text-blue-800 border-blue-200',
    'IES': 'bg-green-100 text-green-800 border-green-200', 
    'CRA': 'bg-purple-100 text-purple-800 border-purple-200',
    'CEO': 'bg-orange-100 text-orange-800 border-orange-200',
    'CPEE': 'bg-pink-100 text-pink-800 border-pink-200',
    'CFGS': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'CFGM': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'EOI': 'bg-red-100 text-red-800 border-red-200',
    'CIM': 'bg-teal-100 text-teal-800 border-teal-200',
    'CONSERVATORIO': 'bg-amber-100 text-amber-800 border-amber-200',
  };
  return colors[tipo] || 'bg-slate-100 text-slate-800 border-slate-200';
};

interface MunicipalityProfileEnhancedProps {
  municipality: Municipality;
}

export default function MunicipalityProfileEnhanced({ municipality }: MunicipalityProfileEnhancedProps) {
  const { toast } = useToast();
  // State for education filters
  const [selectedNaturaleza, setSelectedNaturaleza] = useState<string>("all");
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);
  const [selectedServicios, setSelectedServicios] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<string>("name-az");
  
  // State for health centers pagination
  const [healthPage, setHealthPage] = useState<number>(1);
  const [healthLimit] = useState<number>(50);
  
  // Reset health page when municipality changes
  useEffect(() => {
    setHealthPage(1);
  }, [municipality.id]);
  
  const { 
    data: municipalityData, 
    isLoading, 
    error 
  } = useMunicipalityDetails(municipality.id);
  
  const { 
    data: healthData, 
    isLoading: healthLoading, 
    error: healthError 
  } = useHealthData(municipality.id, healthPage, healthLimit);
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedNaturaleza("all");
    setSelectedTipos([]);
    setSelectedServicios([]);
    setSortOrder("name-az");
  };
  
  // Check if any filters are applied
  const hasActiveFilters = selectedNaturaleza !== "all" || selectedTipos.length > 0 || selectedServicios.length > 0;

  const handleExport = async () => {
    if (!municipalityData) {
      toast({
        title: "Error",
        description: "No hay datos disponibles para exportar",
        variant: "destructive",
      });
      return;
    }

    try {
      await exportMunicipalityCSV(municipality.id, municipalityData.municipality.name);
      toast({
        title: "Exportación exitosa",
        description: `Los datos de ${municipalityData.municipality.name} se han exportado correctamente`,
      });
    } catch (error) {
      toast({
        title: "Error en la exportación",
        description: "No se pudieron exportar los datos. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Retrato de ${municipality.name}`,
          text: `Descubre los datos oficiales de ${municipality.name}, ${municipality.provinceName}`,
          url: url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Enlace copiado",
          description: "El enlace se ha copiado al portapapeles",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo copiar el enlace",
          variant: "destructive",
        });
      }
    }
  };

  if (error) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="educational-card border-destructive/20 bg-destructive/5">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">
                Error al cargar los datos del municipio. Por favor, inténtalo de nuevo.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Municipality Header */}
        <Card className="educational-card mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <Building2 className="text-white text-2xl" size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">{municipality.name}</h2>
                  <div className="text-lg text-slate-700 font-medium">
                    CP {(() => {
                      const postalCodes = municipalityData?.municipality?.postalCodes || municipality.postalCodes || [];
                      return postalCodes.length > 0 ? postalCodes.join(' - ') : 'N/A';
                    })()} ({municipality.provinceName}) <span className="text-sm text-slate-500 font-normal">Código INE: {municipality.id}</span>
                  </div>
                </div>
              </div>
              {/* Geographic Data - Top Right */}
              <div className="flex flex-col space-y-1 text-sm text-slate-600 text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>
                    {municipality.coordinates ? 
                      `${municipality.coordinates[1]}°N, ${municipality.coordinates[0]}°W` : 
                      'X'}
                  </span>
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <Mountain className="w-4 h-4 text-green-600" />
                  <span>{municipalityData?.municipality.altitude ? `${municipalityData.municipality.altitude}m` : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <Map className="w-4 h-4 text-orange-600" />
                  <span>{municipalityData?.municipality.surface ? `${municipalityData.municipality.surface.toFixed(2)} km²` : 'N/A'}</span>
                </div>
              </div>
            </div>
            


          {/* Main Statistics - Following the mockup design */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="stat-card">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          ) : municipalityData ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <div className="stat-card">
                <div className="text-3xl font-bold text-blue-600">
                  {municipalityData.demographics?.totalPopulation?.toLocaleString('es-ES') || 'X'}
                </div>
                <div className="text-xs text-slate-600">Habitantes</div>
              </div>
              <div className="stat-card">
                <div className="text-3xl font-bold text-green-600">
                  {municipalityData?.education?.totalCenters ? 
                    municipalityData.education.totalCenters.toLocaleString('es-ES') :
                    'X'}
                </div>
                <div className="text-xs text-slate-600">Centros educativos</div>
              </div>
              <div className="stat-card">
                <div className="text-3xl font-bold text-red-600">
                  {formatDataValue(municipalityData.services?.healthCenters)}
                </div>
                <div className="text-xs text-slate-600">Centros de salud</div>
              </div>
              <div className="stat-card">
                <div className="text-3xl font-bold text-yellow-600">
                  {formatDataValue(municipalityData.economy?.activeCompanies)}
                </div>
                <div className="text-xs text-slate-600">Empresas</div>
              </div>
              <div className="stat-card">
                <div className="text-3xl font-bold text-purple-600">
                  {formatDataValue(municipalityData.demographics?.populationsCount)}
                </div>
                <div className="text-xs text-slate-600">Poblaciones</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-slate-500">
              <p>Cargando estadísticas básicas...</p>
            </div>
          )}
          </CardContent>
        </Card>

        {/* Detailed Information in Tabs */}
        <Tabs defaultValue="demographics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-8">
            <TabsTrigger value="demographics" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Demografía</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Educación</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-2">
              <Hospital className="w-4 h-4" />
              <span className="hidden sm:inline">Sanidad</span>
            </TabsTrigger>
            <TabsTrigger value="economy" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Economía</span>
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="gap-2">
              <Car className="w-4 h-4" />
              <span className="hidden sm:inline">Servicios</span>
            </TabsTrigger>
            <TabsTrigger value="geography" className="gap-2">
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Geografía</span>
            </TabsTrigger>
          </TabsList>

          {/* Demographics Tab */}
          <TabsContent value="demographics">
            <Card className="educational-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="text-primary" size={20} />
                  Datos Demográficos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : municipalityData?.demographics ? (
                  <div className="overflow-x-auto">
                    {/* Demographic Table following mockup structure */}
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-semibold">Población</th>
                          <th className="text-center p-3 font-semibold">Total</th>
                          <th className="text-center p-3 font-semibold">Mujeres/Hombres</th>
                          <th className="text-center p-3 font-semibold">Españoles/Extranjeros</th>
                          <th className="text-center p-3 font-semibold">0-14/15-64/+65</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b bg-slate-50">
                          <td className="p-3 font-medium">Municipio</td>
                          <td className="p-3 text-center">
                            {municipalityData.demographics.totalPopulation?.toLocaleString('es-ES') || 'X'}
                          </td>
                          <td className="p-3 text-center">
                            {formatDataValue(municipalityData.demographics.women)}/{formatDataValue(municipalityData.demographics.men)}
                          </td>
                          <td className="p-3 text-center">
                            {municipalityData.demographics.spanish !== undefined && municipalityData.demographics.foreigners !== undefined ? 
                              `${municipalityData.demographics.spanish.toLocaleString('es-ES')}/${municipalityData.demographics.foreigners.toLocaleString('es-ES')}` : 
                              'X/X'}
                          </td>
                          <td className="p-3 text-center">
                            {municipalityData.demographics.age0to14 !== undefined && 
                             municipalityData.demographics.age15to64 !== undefined && 
                             municipalityData.demographics.age65plus !== undefined ? 
                              `${municipalityData.demographics.age0to14}/${municipalityData.demographics.age15to64}/${municipalityData.demographics.age65plus}` : 
                              'X/X/X'}
                          </td>
                        </tr>
                        {/* Localities data */}
                        {municipalityData.demographics.localities && municipalityData.demographics.localities.map((locality, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-3">{locality.name}</td>
                            <td className="p-3 text-center">{locality.population.toLocaleString('es-ES')}</td>
                            <td className="p-3 text-center">{locality.women}/{locality.men}</td>
                            <td className="p-3 text-center">{locality.spanish}/{locality.foreign}</td>
                            <td className="p-3 text-center">{locality.age0to14}/{locality.age15to64}/{locality.age65plus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Data source attribution */}
                    <div className="mt-6 pt-4 border-t">
                      <div className="text-right">
                        <span className="text-sm text-gray-500">Fuente de los datos: INE</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">
                    No hay datos demográficos disponibles
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education">
            <Card className="educational-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-3">
                    <BookOpen className="text-green-600" size={20} />
                    Centros Educativos
                  </CardTitle>
                  {municipalityData?.education?.centers && municipalityData.education.centers.length > 0 && (
                    <div className="text-sm text-slate-600">
                      Datos del curso {municipalityData.education.centers[0]?.curso_academico || '2024'}-{(parseInt(municipalityData.education.centers[0]?.curso_academico || '2024') + 1)}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex justify-between items-center py-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                    ))}
                  </div>
                ) : municipalityData?.education ? (
                  <div className="space-y-6">
                    {/* Display actual education centers from API */}
                    {municipalityData.education.centers && municipalityData.education.centers.length > 0 ? (
                      <div className="space-y-6">
                        {/* Filters and Sorting */}
                        <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Filter className="text-slate-600" size={16} />
                            <span className="text-sm font-medium text-slate-700">Filtros y ordenación:</span>
                          </div>
                          
                          {/* Titularidad Filter */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-slate-600">Titularidad:</label>
                            <Select value={selectedNaturaleza} onValueChange={setSelectedNaturaleza}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {[...new Set(municipalityData.education.centers.map(c => c.titularidad))].map(naturaleza => (
                                  <SelectItem key={naturaleza} value={naturaleza}>{naturaleza}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Tipo Multi-select Filter */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-slate-600">Tipo:</label>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="w-32">
                                  {selectedTipos.length === 0 ? 'Todos' : `${selectedTipos.length} seleccionados`}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-sm">
                                <DialogHeader>
                                  <DialogTitle>Filtrar por Tipo de Centro</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-2">
                                  {[...new Set(municipalityData.education.centers.map(c => c.denominacion_generica_breve))].filter(Boolean).map(tipo => (
                                    <div key={tipo} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={tipo}
                                        checked={selectedTipos.includes(tipo!)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setSelectedTipos([...selectedTipos, tipo!]);
                                          } else {
                                            setSelectedTipos(selectedTipos.filter(t => t !== tipo));
                                          }
                                        }}
                                      />
                                      <label htmlFor={tipo} className="text-sm cursor-pointer">{tipo}</label>
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                          
                          {/* Services Multi-select Filter */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-slate-600">Servicios:</label>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="w-32">
                                  {selectedServicios.length === 0 ? 'Todos' : `${selectedServicios.length} seleccionados`}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-sm">
                                <DialogHeader>
                                  <DialogTitle>Filtrar por Servicios</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-2">
                                  {[
                                    { id: 'transporte', label: 'Transporte' },
                                    { id: 'comedor', label: 'Comedor' },
                                    { id: 'jornada_continua', label: 'Jornada Continua' },
                                    { id: 'internado', label: 'Internado' }
                                  ].map(servicio => (
                                    <div key={servicio.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={servicio.id}
                                        checked={selectedServicios.includes(servicio.id)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setSelectedServicios([...selectedServicios, servicio.id]);
                                          } else {
                                            setSelectedServicios(selectedServicios.filter(s => s !== servicio.id));
                                          }
                                        }}
                                      />
                                      <label htmlFor={servicio.id} className="text-sm cursor-pointer">{servicio.label}</label>
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                          
                          {/* Clear Filters Button */}
                          {hasActiveFilters && (
                            <Button variant="outline" size="sm" onClick={clearFilters} className="text-red-600 hover:text-red-700">
                              <X className="w-4 h-4 mr-1" />
                              Limpiar filtros
                            </Button>
                          )}
                          
                          {/* Sort Order */}
                          <div className="flex items-center gap-2 ml-auto">
                            <label className="text-sm text-slate-600">Ordenar:</label>
                            <Select value={sortOrder} onValueChange={setSortOrder}>
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="name-az">Nombre A-Z</SelectItem>
                                <SelectItem value="name-za">Nombre Z-A</SelectItem>
                                <SelectItem value="code-09">Cód. centro 0-9</SelectItem>
                                <SelectItem value="code-90">Cód. centro 9-0</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Centers List */}
                        <div className="space-y-4">
                          {municipalityData.education.centers
                            .filter(center => {
                              // Filter by titularidad
                              const matchesNaturaleza = selectedNaturaleza === "all" || center.titularidad === selectedNaturaleza;
                              
                              // Filter by tipos (multi-select)
                              const matchesTipos = selectedTipos.length === 0 || selectedTipos.includes(center.denominacion_generica_breve || '');
                              
                              // Filter by services (multi-select)
                              const matchesServicios = selectedServicios.length === 0 || selectedServicios.some(servicio => {
                                switch(servicio) {
                                  case 'transporte': return center.transporte === 'S';
                                  case 'comedor': return center.comedor === 'S';
                                  case 'jornada_continua': return center.jornada_continua === 'S';
                                  case 'internado': return center.internado === 'S';
                                  default: return false;
                                }
                              });
                              
                              return matchesNaturaleza && matchesTipos && matchesServicios;
                            })
                            .sort((a, b) => {
                              switch(sortOrder) {
                                case 'name-az': return a.nombre_centro.localeCompare(b.nombre_centro);
                                case 'name-za': return b.nombre_centro.localeCompare(a.nombre_centro);
                                case 'code-09': return a.codigo_centro.localeCompare(b.codigo_centro);
                                case 'code-90': return b.codigo_centro.localeCompare(a.codigo_centro);
                                default: return 0;
                              }
                            })
                            .map((center, index) => (
                            <div key={index} className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 border border-slate-200 rounded-lg bg-white">
                              {/* Center Information */}
                              <div className="lg:col-span-2 space-y-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="text-lg font-semibold text-slate-900">{center.nombre_centro}</h4>
                                    <p className="text-sm text-slate-600">{center.tipo_centro}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {center.codigo_centro}
                                    </Badge>
                                    <Badge variant={center.titularidad === 'PÚBLICO' ? 'default' : 'secondary'} className="text-xs">
                                      {center.titularidad}
                                    </Badge>
                                    {center.denominacion_generica_breve && (
                                      <Badge className={`text-xs ${getTipoColor(center.denominacion_generica_breve)}`}>
                                        {center.denominacion_generica_breve}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-4 h-4 text-slate-400" />
                                      <span>{center.direccion}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="w-4 h-4 text-slate-400">📍</span>
                                      <span>{center.codigo_postal} {municipalityData.municipality.name}</span>
                                    </div>
                                    {center.telefono && (
                                      <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 text-slate-400">📞</span>
                                        <span>{center.telefono}</span>
                                      </div>
                                    )}
                                    {center.email && (
                                      <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 text-slate-400">✉️</span>
                                        <a href={`mailto:${center.email}`} className="text-blue-600 hover:underline">
                                          {center.email}
                                        </a>
                                      </div>
                                    )}
                                    {center.web && (
                                      <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-slate-400" />
                                        <a href={center.web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                          Página web
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Services */}
                                  <div className="space-y-2">
                                    <h5 className="text-sm font-medium text-slate-700">Servicios:</h5>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div className="flex items-center gap-1">
                                        <Bus className="w-3 h-3" />
                                        <span className={center.transporte === 'S' ? 'text-green-600' : 'text-slate-400'}>
                                          Transporte {center.transporte === 'S' ? '✓' : '✗'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <UtensilsCrossed className="w-3 h-3" />
                                        <span className={center.comedor === 'S' ? 'text-green-600' : 'text-slate-400'}>
                                          Comedor {center.comedor === 'S' ? '✓' : '✗'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span className={center.jornada_continua === 'S' ? 'text-green-600' : 'text-slate-400'}>
                                          J. Continua {center.jornada_continua === 'S' ? '✓' : '✗'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Bed className="w-3 h-3" />
                                        <span className={center.internado === 'S' ? 'text-green-600' : 'text-slate-400'}>
                                          Internado {center.internado === 'S' ? '✓' : '✗'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Map */}
                              <div className="relative h-48 bg-slate-100 rounded-lg overflow-hidden">
                                {center.coordenadas ? (
                                  <>
                                    <iframe
                                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${center.coordenadas.lon-0.002},${center.coordenadas.lat-0.002},${center.coordenadas.lon+0.002},${center.coordenadas.lat+0.002}&layer=mapnik&marker=${center.coordenadas.lat},${center.coordenadas.lon}`}
                                      width="100%"
                                      height="100%"
                                      frameBorder="0"
                                      className="border-0"
                                      title={`Mapa de ${center.nombre_centro}`}
                                    />
                                    {/* Modal Button */}
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          className="absolute top-2 right-2 p-1 h-8 w-8"
                                        >
                                          <Maximize2 className="w-4 h-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-[90vw] max-h-[90vh] h-[90vh] w-[90vw] p-0">
                                        <DialogHeader className="p-6 pb-2">
                                          <DialogTitle>Ubicación de {center.nombre_centro}</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex-1 h-full px-6 pb-6">
                                          <iframe
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${center.coordenadas.lon-0.01},${center.coordenadas.lat-0.01},${center.coordenadas.lon+0.01},${center.coordenadas.lat+0.01}&layer=mapnik&marker=${center.coordenadas.lat},${center.coordenadas.lon}`}
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            className="border-0 rounded-lg"
                                            title={`Mapa grande de ${center.nombre_centro}`}
                                          />
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </>
                                ) : (
                                  <div className="flex items-center justify-center h-full text-slate-500">
                                    <div className="text-center">
                                      <Map className="w-8 h-8 mx-auto mb-2" />
                                      <span className="text-sm">Ubicación no disponible</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>


                        {/* Data source attribution */}
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <div className="text-right">
                            <span className="text-sm text-gray-500">Fuente de los datos: Junta de Castilla y León</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p>No hay centros educativos registrados en este municipio</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>No hay datos educativos disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health">
            <Card className="educational-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Hospital className="text-primary" size={20} />
                  Centros Sanitarios
                  <span className="text-sm font-normal text-slate-500">Registro 2024</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {healthLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-48 w-full" />
                    ))}
                  </div>
                ) : healthData?.centers && healthData.centers.length > 0 ? (
                  <div className="space-y-6">
                    {/* Pagination - Show only when totalAvailable > 50 */}
                    {healthData.totalAvailable > 50 && (
                      <Pagination
                        currentPage={healthData.page}
                        totalPages={Math.ceil(healthData.totalAvailable / healthData.limit)}
                        onPageChange={setHealthPage}
                        totalItems={healthData.totalAvailable}
                        itemsPerPage={healthData.limit}
                      />
                    )}
                    
                    {/* Health Centers organized in tabs */}
                    <Tabs defaultValue="todos" className="w-full">
                      <TabsList className="grid w-full grid-cols-6 mb-6">
                        <TabsTrigger value="todos" className="gap-2">
                          <Hospital className="w-4 h-4" />
                          Todos
                        </TabsTrigger>
                        <TabsTrigger value="hospitales" className="gap-2">
                          <Hospital className="w-4 h-4" />
                          Hospitales
                        </TabsTrigger>
                        <TabsTrigger value="centros-salud" className="gap-2">
                          <Stethoscope className="w-4 h-4" />
                          Centros de salud
                        </TabsTrigger>
                        <TabsTrigger value="consultorios-ap" className="gap-2">
                          <Heart className="w-4 h-4" />
                          Consultorios de AP
                        </TabsTrigger>
                        <TabsTrigger value="resto-servicios" className="gap-2">
                          <Ambulance className="w-4 h-4" />
                          Resto de servicios
                        </TabsTrigger>
                        <TabsTrigger value="establecimientos" className="gap-2">
                          <Pill className="w-4 h-4" />
                          Establecimientos
                        </TabsTrigger>
                      </TabsList>

                      {(() => {
                        // Function to get type color
                        const getTypeColor = (tipo: string) => {
                          const upperTipo = tipo?.toUpperCase() || '';
                          
                          if (upperTipo.includes('HOSPITAL')) {
                            return 'bg-red-100 text-red-800 border-red-200';
                          } else if (upperTipo.includes('CENTRO') && upperTipo.includes('SALUD')) {
                            return 'bg-green-100 text-green-800 border-green-200';
                          } else if (upperTipo.includes('CONSULTORIO')) {
                            return 'bg-blue-100 text-blue-800 border-blue-200';
                          } else if (upperTipo.includes('ESTABLECIMIENTO')) {
                            return 'bg-purple-100 text-purple-800 border-purple-200';
                          } else if (upperTipo.includes('FARMACIA')) {
                            return 'bg-orange-100 text-orange-800 border-orange-200';
                          } else {
                            return 'bg-gray-100 text-gray-800 border-gray-200';
                          }
                        };

                        // Function to categorize centers
                        const categorizeCenter = (center: any) => {
                          const tipo = center.tipo_centro?.toUpperCase() || '';
                          
                          if (tipo.includes('HOSPITALES GENERALES') || 
                              tipo.includes('HOSPITAL DE MEDIA Y LARGA ESTANCIA') ||
                              tipo.includes('HOSPITALES ESPECIALIZADOS') || 
                              tipo.includes('HOSPITALES DE SALUD MENTAL Y TRATAMIENTO DE TOXICOMANIAS')) {
                            return 'hospitales';
                          } else if (tipo.includes('CENTROS DE ATENCION PRIMARIA: CENTROS DE SALUD')) {
                            return 'centros-salud';
                          } else if (tipo.includes('CONSULTORIOS DE ATENCION PRIMARIA')) {
                            return 'consultorios-ap';
                          } else if (tipo.includes('ESTABLECIMIENTO DE AUDIOPROTESIS') ||
                                     tipo.includes('ESTABLECIMIENTO DE ORTOPEDIA') ||
                                     tipo.includes('ESTABLECIMIENTO DE OPTICA')) {
                            return 'establecimientos';
                          } else {
                            return 'resto-servicios';
                          }
                        };

                        // Categorize all centers
                        const categorizedCenters = healthData.centers.reduce((acc: any, center: any) => {
                          const category = categorizeCenter(center);
                          if (!acc[category]) acc[category] = [];
                          acc[category].push(center);
                          return acc;
                        }, {});

                        // Function to render centers
                        const renderCenters = (centers: any[]) => (
                          <div className="space-y-4">
                            {centers.map((center, index) => {
                              // Parse finalidad_asistencial by '#' and get first part
                              const finalidadAsistencial = center.tipo_asistencia?.split('#')?.[0] || center.tipo_asistencia || '';

                              return (
                                <Card key={index} className="border border-slate-200 hover:shadow-md transition-shadow">
                                  <CardContent className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Center Info */}
                              <div className="lg:col-span-2 space-y-4">
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between">
                                    <h3 className="font-semibold text-lg text-slate-800 leading-tight">
                                      {center.nombre_centro_sanitario}
                                    </h3>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {center.codigo_centro_sanitario}
                                    </Badge>
                                    {center.tipo_centro && (
                                      <Badge className={`text-xs ${getTypeColor(center.tipo_centro)}`}>
                                        {center.tipo_centro}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-4 h-4 text-slate-400" />
                                      <span>{center.direccion}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="w-4 h-4 text-slate-400">📍</span>
                                      <span>{center.codigo_postal} {center.poblacion}</span>
                                    </div>
                                    {center.telefono && (
                                      <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 text-slate-400">📞</span>
                                        <span>{center.telefono}</span>
                                      </div>
                                    )}
                                    {center.email && (
                                      <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 text-slate-400">✉️</span>
                                        <a href={`mailto:${center.email}`} className="text-blue-600 hover:underline">
                                          {center.email}
                                        </a>
                                      </div>
                                    )}
                                    {center.web && (
                                      <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-slate-400" />
                                        <a href={center.web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                          Página web
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Health Center Details */}
                                  <div className="space-y-2">
                                    <h5 className="text-sm font-medium text-slate-700">Finalidad asistencial:</h5>
                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                      {finalidadAsistencial && (
                                        <div className="text-slate-600 bg-slate-50 p-2 rounded text-sm">
                                          {finalidadAsistencial}
                                        </div>
                                      )}
                                      {center.dependencia_funcional && (
                                        <div className="flex items-center gap-1">
                                          <span className="font-medium">Dependencia:</span>
                                          <span className="text-slate-600">{center.dependencia_funcional}</span>
                                        </div>
                                      )}
                                      {center.clasificacion && (
                                        <div className="flex items-center gap-1">
                                          <span className="font-medium">Clasificación:</span>
                                          <span className="text-slate-600">{center.clasificacion}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Map */}
                              <div className="relative h-48 bg-slate-100 rounded-lg overflow-hidden">
                                {center.coordenadas ? (
                                  <>
                                    <iframe
                                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${center.coordenadas.lon-0.002},${center.coordenadas.lat-0.002},${center.coordenadas.lon+0.002},${center.coordenadas.lat+0.002}&layer=mapnik&marker=${center.coordenadas.lat},${center.coordenadas.lon}`}
                                      width="100%"
                                      height="100%"
                                      frameBorder="0"
                                      className="border-0"
                                      title={`Mapa de ${center.nombre_centro_sanitario}`}
                                    />
                                    {/* Modal Button */}
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          className="absolute top-2 right-2 p-1 h-8 w-8"
                                        >
                                          <Maximize2 className="w-4 h-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-[90vw] max-h-[90vh] h-[90vh] w-[90vw] p-0">
                                        <DialogHeader className="p-6 pb-2">
                                          <DialogTitle>Ubicación de {center.nombre_centro_sanitario}</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex-1 h-full px-6 pb-6">
                                          <iframe
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${center.coordenadas.lon-0.01},${center.coordenadas.lat-0.01},${center.coordenadas.lon+0.01},${center.coordenadas.lat+0.01}&layer=mapnik&marker=${center.coordenadas.lat},${center.coordenadas.lon}`}
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            className="border-0 rounded-lg"
                                            title={`Mapa grande de ${center.nombre_centro_sanitario}`}
                                          />
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </>
                                ) : (
                                  <div className="flex items-center justify-center h-full text-slate-500">
                                    <div className="text-center">
                                      <Map className="w-8 h-8 mx-auto mb-2" />
                                      <span className="text-sm">Ubicación no disponible</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                                                  </CardContent>
                                                </Card>
                                              );
                                            })}
                                          </div>
                                        );

                                        return (
                                          <>
                                            {/* Todos los centros */}
                                            <TabsContent value="todos">
                                              {renderCenters(healthData.centers)}
                                            </TabsContent>

                                            {/* Hospitales */}
                                            <TabsContent value="hospitales">
                                              {categorizedCenters.hospitales && categorizedCenters.hospitales.length > 0 ? (
                                                renderCenters(categorizedCenters.hospitales)
                                              ) : (
                                                <div className="text-center py-8 text-slate-500">
                                                  <Hospital className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                                  <p>No se encontraron hospitales registrados</p>
                                                </div>
                                              )}
                                            </TabsContent>

                                            {/* Centros de salud */}
                                            <TabsContent value="centros-salud">
                                              {categorizedCenters['centros-salud'] && categorizedCenters['centros-salud'].length > 0 ? (
                                                renderCenters(categorizedCenters['centros-salud'])
                                              ) : (
                                                <div className="text-center py-8 text-slate-500">
                                                  <Stethoscope className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                                  <p>No se encontraron centros de salud registrados</p>
                                                </div>
                                              )}
                                            </TabsContent>

                                            {/* Consultorios de AP */}
                                            <TabsContent value="consultorios-ap">
                                              {categorizedCenters['consultorios-ap'] && categorizedCenters['consultorios-ap'].length > 0 ? (
                                                renderCenters(categorizedCenters['consultorios-ap'])
                                              ) : (
                                                <div className="text-center py-8 text-slate-500">
                                                  <Heart className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                                  <p>No se encontraron consultorios de atención primaria registrados</p>
                                                </div>
                                              )}
                                            </TabsContent>

                                            {/* Resto de servicios */}
                                            <TabsContent value="resto-servicios">
                                              {categorizedCenters['resto-servicios'] && categorizedCenters['resto-servicios'].length > 0 ? (
                                                renderCenters(categorizedCenters['resto-servicios'])
                                              ) : (
                                                <div className="text-center py-8 text-slate-500">
                                                  <Ambulance className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                                  <p>No se encontraron otros servicios sanitarios registrados</p>
                                                </div>
                                              )}
                                            </TabsContent>

                                            {/* Establecimientos */}
                                            <TabsContent value="establecimientos">
                                              {categorizedCenters.establecimientos && categorizedCenters.establecimientos.length > 0 ? (
                                                renderCenters(categorizedCenters.establecimientos)
                                              ) : (
                                                <div className="text-center py-8 text-slate-500">
                                                  <Pill className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                                  <p>No se encontraron establecimientos registrados</p>
                                                </div>
                                              )}
                                            </TabsContent>
                                          </>
                                        );
                                      })()}

                                      {/* Data source attribution */}
                                      <div className="mt-4 pt-4 border-t border-slate-200">
                                        <div className="text-right">
                                          <span className="text-xs text-slate-500">Fuente de los datos: Junta de Castilla y León</span>
                                        </div>
                                      </div>
                                    </Tabs>
                                  </div>
                ) : healthError ? (
                  <div className="text-center py-8 text-red-600">
                    <Hospital className="w-12 h-12 mx-auto mb-4 text-red-300" />
                    <p className="text-lg font-semibold mb-2">Error al cargar datos sanitarios</p>
                    <p className="text-sm">No se pudieron obtener los datos de centros sanitarios.</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Hospital className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-semibold mb-2">Sin centros sanitarios</p>
                    <p className="text-sm">No se encontraron centros sanitarios registrados para este municipio.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Economy Tab */}
          <TabsContent value="economy">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {municipalityData?.services?.healthCenters !== undefined && (
                <Card className="educational-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <Heart className="text-red-600" size={20} />
                      Centros de Salud
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-red-600 mb-2">
                        {municipalityData.services.healthCenters}
                      </div>
                      <p className="text-sm text-slate-600">
                        Atención primaria disponible
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {municipalityData?.services?.hospitals !== undefined && (
                <Card className="educational-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <Hospital className="text-blue-600" size={20} />
                      Hospitales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {municipalityData.services.hospitals}
                      </div>
                      <p className="text-sm text-slate-600">
                        {municipalityData.services.hospitals > 0 ? 'Atención especializada' : 'Atención en otras localidades'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {municipalityData?.services?.pharmacies !== undefined && (
                <Card className="educational-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <Heart className="text-green-600" size={20} />
                      Farmacias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {municipalityData.services.pharmacies}
                      </div>
                      <p className="text-sm text-slate-600">
                        Servicios farmacéuticos
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {municipalityData?.services?.fireStations !== undefined && (
                <Card className="educational-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <Shield className="text-orange-600" size={20} />
                      Parques de Bomberos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-orange-600 mb-2">
                        {municipalityData.services.fireStations}
                      </div>
                      <p className="text-sm text-slate-600">
                        Servicios de emergencia
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {municipalityData?.services && (
              <Card className="educational-card mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Hospital className="text-red-600" size={20} />
                    Resumen de Servicios Sanitarios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Cobertura Sanitaria</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Habitantes por centro de salud:</span>
                          <span className="font-semibold">
                            {municipalityData.services.healthCenters > 0 
                              ? Math.round(municipalityData.demographics.totalPopulation / municipalityData.services.healthCenters)
                              : 'N/A'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Habitantes por farmacia:</span>
                          <span className="font-semibold">
                            {municipalityData.services.pharmacies > 0 
                              ? Math.round(municipalityData.demographics.totalPopulation / municipalityData.services.pharmacies)
                              : 'N/A'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Servicios de Emergencia</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Cobertura bomberil:</span>
                          <Badge variant={municipalityData.services.fireStations > 0 ? "default" : "secondary"}>
                            {municipalityData.services.fireStations > 0 ? 'Local' : 'Regional'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Atención hospitalaria:</span>
                          <Badge variant={municipalityData.services.hospitals > 0 ? "default" : "secondary"}>
                            {municipalityData.services.hospitals > 0 ? 'Local' : 'Derivada'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Economy Tab */}
          <TabsContent value="economy">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="educational-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Briefcase className="text-blue-600" size={20} />
                    Mercado Laboral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {municipalityData?.economy ? (
                    <div className="space-y-6">
                      {municipalityData.economy.unemploymentRate !== undefined && (
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-slate-600">Tasa de Desempleo</span>
                            <span className="font-semibold text-lg">
                              {municipalityData.economy.unemploymentRate.toFixed(1)}%
                            </span>
                          </div>
                          <Progress 
                            value={municipalityData.economy.unemploymentRate} 
                            className="h-3"
                          />
                          <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>0%</span>
                            <span>Media nacional: ~12%</span>
                            <span>25%</span>
                          </div>
                        </div>
                      )}

                      {municipalityData.economy.activeCompanies !== undefined && (
                        <div className="pt-4 border-t">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-slate-600">Empresas Activas</span>
                            <span className="font-semibold text-xl text-green-600">
                              {municipalityData.economy.activeCompanies.toLocaleString('es-ES')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Empresas por cada 100 habitantes: {((municipalityData.economy.activeCompanies / municipalityData.demographics.totalPopulation) * 100).toFixed(1)}
                          </p>
                        </div>
                      )}

                      {municipalityData.economy.servicesPercentage !== undefined && (
                        <div className="pt-4 border-t">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-slate-600">Sector Servicios</span>
                            <span className="font-semibold">
                              {municipalityData.economy.servicesPercentage.toFixed(1)}%
                            </span>
                          </div>
                          <Progress 
                            value={municipalityData.economy.servicesPercentage} 
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">
                      No hay datos económicos disponibles
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="educational-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <TrendingUp className="text-green-600" size={20} />
                    Indicadores Económicos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {municipalityData?.economy ? (
                    <div className="space-y-6">
                      {municipalityData.economy.incomePerCapita !== undefined && (
                        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                          <div className="text-3xl font-bold text-green-700 mb-2">
                            {municipalityData.economy.incomePerCapita.toLocaleString('es-ES')}€
                          </div>
                          <div className="text-sm text-green-600 mb-2">Renta per cápita anual</div>
                          <p className="text-xs text-slate-600">
                            Media nacional: ~24.000€
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-xl font-bold text-blue-700">
                            {municipalityData.economy.activeCompanies || 0}
                          </div>
                          <div className="text-xs text-blue-600">Empresas activas</div>
                        </div>
                        
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-xl font-bold text-orange-700">
                            {municipalityData.economy.servicesPercentage?.toFixed(0) || 0}%
                          </div>
                          <div className="text-xs text-orange-600">Sector servicios</div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-2">Contexto Económico</h4>
                        <div className="text-sm text-slate-600 space-y-1">
                          <p>• Economía basada principalmente en el sector servicios</p>
                          <p>• Densidad empresarial: {municipalityData.economy.activeCompanies && municipalityData.demographics.totalPopulation 
                            ? ((municipalityData.economy.activeCompanies / municipalityData.demographics.totalPopulation) * 100).toFixed(1) 
                            : 'N/A'} empresas/100 hab</p>
                          <p>• {municipalityData.economy.unemploymentRate && municipalityData.economy.unemploymentRate < 10 
                            ? 'Tasa de desempleo relativamente baja' 
                            : 'Desempleo por encima de la media'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">
                      No hay datos económicos disponibles
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="educational-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Car className="text-blue-600" size={20} />
                    Transporte y Movilidad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700 mb-2">
                        {municipalityData?.demographics.totalPopulation 
                          ? Math.round(municipalityData.demographics.totalPopulation * 0.6)
                          : 'N/A'}
                      </div>
                      <div className="text-sm text-blue-600">Vehículos estimados</div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Acceso por carretera</span>
                        <Badge variant="default">Disponible</Badge>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Transporte público</span>
                        <Badge variant={municipalityData?.demographics.totalPopulation && municipalityData.demographics.totalPopulation > 5000 ? "default" : "secondary"}>
                          {municipalityData?.demographics.totalPopulation && municipalityData.demographics.totalPopulation > 5000 ? "Disponible" : "Limitado"}
                        </Badge>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-600">Estación de servicio</span>
                        <Badge variant={municipalityData?.demographics.totalPopulation && municipalityData.demographics.totalPopulation > 2000 ? "default" : "secondary"}>
                          {municipalityData?.demographics.totalPopulation && municipalityData.demographics.totalPopulation > 2000 ? "Sí" : "En localidades cercanas"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="educational-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Home className="text-green-600" size={20} />
                    Vivienda e Inmuebles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700 mb-2">
                        {municipalityData?.demographics.totalPopulation 
                          ? Math.round(municipalityData.demographics.totalPopulation * 0.45)
                          : 'N/A'}
                      </div>
                      <div className="text-sm text-green-600">Viviendas estimadas</div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Vivienda principal</span>
                        <span className="font-semibold">~75%</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Segunda residencia</span>
                        <span className="font-semibold">~20%</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-600">Vivienda vacía</span>
                        <span className="font-semibold">~5%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="educational-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Utensils className="text-orange-600" size={20} />
                    Comercio Local
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-700 mb-2">
                        {municipality.comercio ? 'Activo' : 'Limitado'}
                      </div>
                      <div className="text-sm text-orange-600">Estado del comercio</div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Comercio registrado</span>
                        <Badge variant={municipality.comercio ? "default" : "secondary"}>
                          {municipality.comercio ? 'Sí' : 'No registrado'}
                        </Badge>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-600">Restaurantes estimados</span>
                        <span className="font-semibold">
                          {municipalityData?.demographics.totalPopulation 
                            ? Math.max(1, Math.floor(municipalityData.demographics.totalPopulation / 800))
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-600">Establecimientos comerciales</span>
                        <span className="font-semibold">
                          {municipalityData?.demographics.totalPopulation 
                            ? Math.max(2, Math.floor(municipalityData.demographics.totalPopulation / 500))
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Geography Tab */}
          <TabsContent value="geography">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="educational-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Map className="text-blue-600" size={20} />
                    Información Geográfica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {municipality.coordinates && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-center mb-3">
                          <div className="text-sm text-slate-600 mb-1">Coordenadas GPS</div>
                          <div className="font-mono text-lg font-semibold text-blue-700">
                            {municipality.coordinates[1].toFixed(6)}°N
                          </div>
                          <div className="font-mono text-lg font-semibold text-blue-700">
                            {municipality.coordinates[0].toFixed(6)}°W
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      {municipality.altitude && (
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <div className="text-xl font-bold text-slate-700">
                            {municipality.altitude}m
                          </div>
                          <div className="text-xs text-slate-600">Altitud</div>
                        </div>
                      )}
                      
                      {municipality.surface && (
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <div className="text-xl font-bold text-slate-700">
                            {municipality.surface.toFixed(1)}
                          </div>
                          <div className="text-xs text-slate-600">km² de superficie</div>
                        </div>
                      )}
                    </div>

                    {municipality.postalCodes && municipality.postalCodes.length > 0 && (
                      <div className="pt-4 border-t">
                        <div className="text-sm text-slate-600 mb-2">Códigos Postales</div>
                        <div className="flex flex-wrap gap-2">
                          {municipality.postalCodes.map((code, index) => (
                            <Badge key={index} variant="outline">
                              {code}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="educational-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Building className="text-green-600" size={20} />
                    Organización Territorial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-700 mb-1">
                          {municipality.name}
                        </div>
                        <div className="text-sm text-green-600">
                          Municipio de {municipality.provinceName}
                        </div>
                      </div>
                    </div>

                    {municipality.mancomunidades && municipality.mancomunidades.length > 0 && (
                      <div>
                        <div className="text-sm text-slate-600 mb-3">Mancomunidades</div>
                        <div className="space-y-2">
                          {municipality.mancomunidades.map((manc, index) => (
                            <div key={index} className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                              <span className="text-sm font-medium text-blue-800">{manc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {municipality.entidadesLocalesMenores && municipality.entidadesLocalesMenores.length > 0 && (
                      <div>
                        <div className="text-sm text-slate-600 mb-3">Entidades Locales Menores</div>
                        <div className="space-y-2">
                          {municipality.entidadesLocalesMenores.map((ent, index) => (
                            <div key={index} className="p-2 bg-green-50 rounded border-l-4 border-green-400">
                              <span className="text-sm font-medium text-green-800">{ent}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <div className="text-xs text-slate-500">
                        <p>• Las mancomunidades son agrupaciones de municipios para prestar servicios comunes</p>
                        <p>• Las entidades locales menores son núcleos de población con cierta autonomía</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}