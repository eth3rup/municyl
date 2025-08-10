import { useState } from "react";
import MunicipalitySearch from "@/components/municipality-search";
import MunicipalityProfileEnhanced from "@/components/municipality-profile-enhanced";
import EducationalResources from "@/components/educational-resources";
import { Municipality } from "@shared/schema";

export default function Home() {
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section with Search */}
      <section className="hero-gradient py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Descubre tu municipio
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Explora datos oficiales de los municipios de Castilla y León de forma clara y accesible. 
              Perfecto para ciudadanos, estudiantes y educadores.
            </p>
          </div>

          <MunicipalitySearch 
            onMunicipalitySelect={setSelectedMunicipality}
            selectedMunicipality={selectedMunicipality}
          />
        </div>
      </section>

      {/* Municipality Profile Section */}
      {selectedMunicipality && (
        <MunicipalityProfileEnhanced municipality={selectedMunicipality} />
      )}

      {/* Educational Resources Section */}
      <EducationalResources />
    </div>
  );
}
