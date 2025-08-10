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
  Camera
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMunicipalityDetails } from "@/hooks/use-municipalities";
import { Municipality } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { exportMunicipalityCSV } from "@/lib/csv-export";

interface MunicipalityProfileProps {
  municipality: Municipality;
}

export default function MunicipalityProfile({ municipality }: MunicipalityProfileProps) {
  const { toast } = useToast();
  const { 
    data: municipalityData, 
    isLoading, 
    error 
  } = useMunicipalityDetails(municipality.id);

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
                  <h2 className="text-2xl font-bold text-slate-900">{municipality.name}</h2>
                  <p className="text-slate-600">Provincia de {municipality.provinceName}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                    {municipality.postalCodes && municipality.postalCodes.length > 0 && (
                      <span>
                        <MapPin className="inline w-3 h-3 mr-1" />
                        CP: {municipality.postalCodes.join(', ')}
                      </span>
                    )}
                    {municipality.surface && (
                      <span>
                        <Building className="inline w-3 h-3 mr-1" />
                        Superficie: {municipality.surface.toFixed(2)} km²
                      </span>
                    )}
                    {municipality.coordinates && (
                      <span>
                        <Globe className="inline w-3 h-3 mr-1" />
                        {municipality.coordinates[1].toFixed(4)}°N, {municipality.coordinates[0].toFixed(4)}°W
                      </span>
                    )}
                    {municipality.comercio !== undefined && (
                      <span>
                        <ShoppingBag className="inline w-3 h-3 mr-1" />
                        {municipality.comercio ? 'Con comercio local' : 'Sin comercio registrado'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleExport}
                  variant="default"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  disabled={isLoading || !municipalityData}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar CSV
                </Button>
                <Button 
                  onClick={handleShare}
                  variant="outline"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartir
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="stat-card">
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                ))}
              </div>
            ) : municipalityData?.demographics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="stat-card">
                  <div className="text-2xl font-bold text-primary">
                    {municipalityData.demographics.totalPopulation.toLocaleString('es-ES')}
                  </div>
                  <div className="text-sm text-slate-600">Habitantes</div>
                </div>
                {municipalityData.demographics.populationDensity && (
                  <div className="stat-card">
                    <div className="text-2xl font-bold text-secondary">
                      {municipalityData.demographics.populationDensity.toFixed(1)}
                    </div>
                    <div className="text-sm text-slate-600">Hab/km²</div>
                  </div>
                )}
                {municipalityData.demographics.agingIndex && (
                  <div className="stat-card">
                    <div className="text-2xl font-bold text-destructive">
                      {municipalityData.demographics.agingIndex.toFixed(1)}
                    </div>
                    <div className="text-sm text-slate-600">Índice envejecimiento</div>
                  </div>
                )}
                {municipality.altitude && (
                  <div className="stat-card">
                    <div className="text-2xl font-bold text-slate-700">
                      {municipality.altitude}
                    </div>
                    <div className="text-sm text-slate-600">Altitud (m)</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-500">
                <p>Cargando estadísticas básicas...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demographics Section */}
          <Card className="educational-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="text-primary" size={20} />
                </div>
                <span>Demografía</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : municipalityData?.demographics ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Población total</span>
                    <span className="font-semibold">
                      {municipalityData.demographics.totalPopulation.toLocaleString('es-ES')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Hombres</span>
                    <span className="font-semibold">
                      {municipalityData.demographics.men.toLocaleString('es-ES')} 
                      ({((municipalityData.demographics.men / municipalityData.demographics.totalPopulation) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Mujeres</span>
                    <span className="font-semibold">
                      {municipalityData.demographics.women.toLocaleString('es-ES')} 
                      ({((municipalityData.demographics.women / municipalityData.demographics.totalPopulation) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  {municipalityData.demographics.averageAge && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Edad media</span>
                      <span className="font-semibold">
                        {municipalityData.demographics.averageAge.toFixed(1)} años
                      </span>
                    </div>
                  )}
                  {municipalityData.demographics.foreigners && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600">Extranjeros</span>
                      <span className="font-semibold">
                        {municipalityData.demographics.foreigners.toLocaleString('es-ES')} 
                        ({((municipalityData.demographics.foreigners / municipalityData.demographics.totalPopulation) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">
                  No hay datos demográficos disponibles
                </p>
              )}
            </CardContent>
          </Card>

          {/* Education Section */}
          <Card className="educational-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-secondary" size={20} />
                </div>
                <span>Educación</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  ))}
                </div>
              ) : municipalityData?.education ? (
                <div className="space-y-4">
                  {municipalityData.education.primarySchools && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Centros Infantil/Primaria</span>
                      <span className="font-semibold">{municipalityData.education.primarySchools}</span>
                    </div>
                  )}
                  {municipalityData.education.secondarySchools && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Institutos ESO/Bachillerato</span>
                      <span className="font-semibold">{municipalityData.education.secondarySchools}</span>
                    </div>
                  )}
                  {municipalityData.education.vocationalSchools && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Centros FP</span>
                      <span className="font-semibold">{municipalityData.education.vocationalSchools}</span>
                    </div>
                  )}
                  {municipalityData.education.hasUniversity !== undefined && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Universidad</span>
                      <span className="font-semibold">
                        {municipalityData.education.hasUniversity ? 'Sí' : 'No'}
                      </span>
                    </div>
                  )}
                  {municipalityData.education.libraries && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600">Bibliotecas públicas</span>
                      <span className="font-semibold">{municipalityData.education.libraries}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">
                  No hay datos educativos disponibles
                </p>
              )}
            </CardContent>
          </Card>

          {/* Services Section */}
          <Card className="educational-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <Hospital className="text-destructive" size={20} />
                </div>
                <span>Servicios Básicos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="stat-card">
                      <Skeleton className="h-6 w-8 mx-auto mb-2" />
                      <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                  ))}
                </div>
              ) : municipalityData?.services ? (
                <div className="grid grid-cols-2 gap-4">
                  {municipalityData.services.healthCenters && (
                    <div className="stat-card">
                      <div className="text-lg font-bold text-slate-700">
                        {municipalityData.services.healthCenters}
                      </div>
                      <div className="text-xs text-slate-600">Centros de salud</div>
                    </div>
                  )}
                  {municipalityData.services.hospitals && (
                    <div className="stat-card">
                      <div className="text-lg font-bold text-slate-700">
                        {municipalityData.services.hospitals}
                      </div>
                      <div className="text-xs text-slate-600">Hospitales</div>
                    </div>
                  )}
                  {municipalityData.services.pharmacies && (
                    <div className="stat-card">
                      <div className="text-lg font-bold text-slate-700">
                        {municipalityData.services.pharmacies}
                      </div>
                      <div className="text-xs text-slate-600">Farmacias</div>
                    </div>
                  )}
                  {municipalityData.services.fireStations && (
                    <div className="stat-card">
                      <div className="text-lg font-bold text-slate-700">
                        {municipalityData.services.fireStations}
                      </div>
                      <div className="text-xs text-slate-600">Parques de bomberos</div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">
                  No hay datos de servicios disponibles
                </p>
              )}
            </CardContent>
          </Card>

          {/* Economy Section */}
          <Card className="educational-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-yellow-600" size={20} />
                </div>
                <span>Economía y Empleo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : municipalityData?.economy ? (
                <div className="space-y-4">
                  {municipalityData.economy.unemploymentRate && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Tasa de paro</span>
                      <span className="font-semibold">{municipalityData.economy.unemploymentRate.toFixed(1)}%</span>
                    </div>
                  )}
                  {municipalityData.economy.activeCompanies && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Empresas activas</span>
                      <span className="font-semibold">
                        {municipalityData.economy.activeCompanies.toLocaleString('es-ES')}
                      </span>
                    </div>
                  )}
                  {municipalityData.economy.servicesPercentage && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Sector servicios</span>
                      <span className="font-semibold">{municipalityData.economy.servicesPercentage.toFixed(1)}%</span>
                    </div>
                  )}
                  {municipalityData.economy.incomePerCapita && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600">Renta per cápita</span>
                      <span className="font-semibold">
                        {municipalityData.economy.incomePerCapita.toLocaleString('es-ES')}€
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">
                  No hay datos económicos disponibles
                </p>
              )}
            </CardContent>
          </Card>

          {/* Geographic Information Section */}
          <Card className="educational-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Map className="text-blue-600" size={20} />
                </div>
                <span>Información Geográfica</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {municipality.coordinates && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Coordenadas</span>
                    <span className="font-semibold text-sm">
                      {municipality.coordinates[1].toFixed(6)}°N, {municipality.coordinates[0].toFixed(6)}°W
                    </span>
                  </div>
                )}
                {municipality.altitude && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Altitud</span>
                    <span className="font-semibold">
                      <Mountain className="inline w-4 h-4 mr-1" />
                      {municipality.altitude} metros
                    </span>
                  </div>
                )}
                {municipality.surface && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Superficie</span>
                    <span className="font-semibold">{municipality.surface.toFixed(2)} km²</span>
                  </div>
                )}
                {municipalityData?.demographics?.populationDensity && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Densidad de población</span>
                    <span className="font-semibold">
                      {municipalityData.demographics.populationDensity.toFixed(1)} hab/km²
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Administrative Information Section */}
          <Card className="educational-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building2 className="text-green-600" size={20} />
                </div>
                <span>Información Administrativa</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Código INE</span>
                  <span className="font-semibold">{municipality.id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Provincia</span>
                  <span className="font-semibold">{municipality.provinceName} ({municipality.provinceCode})</span>
                </div>
                {municipality.postalCodes && municipality.postalCodes.length > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Códigos Postales</span>
                    <span className="font-semibold">{municipality.postalCodes.join(', ')}</span>
                  </div>
                )}
                {municipality.comercio !== undefined && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Comercio local</span>
                    <span className="font-semibold">
                      {municipality.comercio ? (
                        <span className="text-green-600">Sí registrado</span>
                      ) : (
                        <span className="text-slate-500">No registrado</span>
                      )}
                    </span>
                  </div>
                )}
                {municipality.mancomunidades && municipality.mancomunidades.length > 0 && (
                  <div className="py-2 border-b border-slate-100">
                    <span className="text-slate-600 block mb-2">Mancomunidades</span>
                    <div className="flex flex-wrap gap-2">
                      {municipality.mancomunidades.map((manc, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {manc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {municipality.entidadesLocalesMenores && municipality.entidadesLocalesMenores.length > 0 && (
                  <div className="py-2">
                    <span className="text-slate-600 block mb-2">Entidades Locales Menores</span>
                    <div className="flex flex-wrap gap-2">
                      {municipality.entidadesLocalesMenores.map((ent, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {ent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
