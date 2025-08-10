import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMunicipalitySearch } from "@/hooks/use-municipalities";
import { Municipality, provinceNames, ProvinceCode } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface MunicipalitySearchProps {
  onMunicipalitySelect: (municipality: Municipality | null) => void;
  selectedMunicipality: Municipality | null;
}

export default function MunicipalitySearch({ onMunicipalitySelect, selectedMunicipality }: MunicipalitySearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { toast } = useToast();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { 
    data: searchResults, 
    isLoading, 
    error 
  } = useMunicipalitySearch({
    query: debouncedQuery,
    limit: 10,
    enabled: debouncedQuery.length >= 2,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error en la búsqueda",
        description: "No se pudieron cargar los municipios. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleMunicipalitySelect = (municipality: Municipality) => {
    onMunicipalitySelect(municipality);
    setSearchQuery(municipality.name);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    onMunicipalitySelect(null);
  };

  const shouldShowResults = debouncedQuery.length >= 2 && !selectedMunicipality;
  const hasResults = searchResults && searchResults.municipalities.length > 0;

  return (
    <Card className="educational-card">
      <CardContent className="p-6">
        <div className="mb-6">
          <Label htmlFor="municipality-search" className="block text-sm font-medium text-slate-700 mb-2">
            Buscar municipio
          </Label>
          <div className="relative">
            <Input
              id="municipality-search"
              type="text"
              placeholder="Escribe el nombre del municipio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!!selectedMunicipality}
              className="pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-colors bg-background disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          </div>
        </div>

        {selectedMunicipality && (
          <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Municipio seleccionado:</h3>
                <p className="text-slate-600">
                  {selectedMunicipality.name}, {selectedMunicipality.provinceName}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={clearSearch}>
                Cambiar municipio
              </Button>
            </div>
          </div>
        )}

        {/* Search Results */}
        {shouldShowResults && (
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              {isLoading ? "Buscando..." : "Resultados sugeridos:"}
            </h3>
            
            {isLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && hasResults && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.municipalities.map((municipality) => (
                  <button
                    key={municipality.id}
                    onClick={() => handleMunicipalitySelect(municipality)}
                    className="municipality-result focus-visible"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-slate-900">{municipality.name}</span>
                        <span className="text-slate-600 ml-2">{municipality.provinceName}</span>
                      </div>
                      <span className="text-sm text-slate-500">
                        {municipality.provinceCode}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!isLoading && !hasResults && debouncedQuery.length >= 2 && (
              <div className="text-center py-4 text-slate-500">
                <p>No se encontraron municipios que coincidan con tu búsqueda.</p>
                <p className="text-sm mt-1">Intenta con un término diferente o selecciona una provincia.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
