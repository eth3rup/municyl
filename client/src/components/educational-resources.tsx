import { Presentation, BarChart, GitBranch, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EducationalResources() {
  return (
    <section id="recursos" className="educational-gradient py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Recursos Educativos</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Materiales didácticos y propuestas para trabajar los datos municipales en el aula
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="educational-card hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Presentation className="text-primary text-xl" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Guías Didácticas</h3>
              <p className="text-slate-600 mb-4">
                Actividades estructuradas para trabajar demografía, geografía y estadística en Primaria y Secundaria.
              </p>
              <Button 
                variant="ghost" 
                className="text-primary font-medium hover:text-primary/80 transition-colors p-0 h-auto"
              >
                Ver recursos <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="educational-card hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="text-secondary text-xl" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Ejercicios Prácticos</h3>
              <p className="text-slate-600 mb-4">
                Problemas matemáticos y análisis de datos basados en información real de los municipios.
              </p>
              <Button 
                variant="ghost" 
                className="text-primary font-medium hover:text-primary/80 transition-colors p-0 h-auto"
              >
                Explorar ejercicios <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="educational-card hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                <GitBranch className="text-destructive text-xl" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Proyectos de Investigación</h3>
              <p className="text-slate-600 mb-4">
                Propuestas de investigación para que los estudiantes analicen y comparen sus municipios.
              </p>
              <Button 
                variant="ghost" 
                className="text-primary font-medium hover:text-primary/80 transition-colors p-0 h-auto"
              >
                Ver proyectos <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
