import { MapPin, Download, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const handleExport = () => {
    // This will be handled by the municipality profile component
    console.log("Export functionality - to be implemented by active municipality");
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="text-primary-foreground" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Retrato de mi pueblo</h1>
              <p className="text-sm text-slate-600">Municipios de Castilla y León</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a 
              href="#" 
              className="text-slate-700 hover:text-primary font-medium transition-colors focus-visible"
            >
              Inicio
            </a>
            <a 
              href="#recursos" 
              className="text-slate-700 hover:text-primary font-medium transition-colors focus-visible"
            >
              Recursos Educativos
            </a>
            <a 
              href="#ayuda" 
              className="text-slate-700 hover:text-primary font-medium transition-colors focus-visible"
            >
              Ayuda
            </a>
            <Button 
              onClick={handleExport}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-6">
                <a 
                  href="#" 
                  className="text-slate-700 hover:text-primary font-medium transition-colors focus-visible py-2"
                >
                  Inicio
                </a>
                <a 
                  href="#recursos" 
                  className="text-slate-700 hover:text-primary font-medium transition-colors focus-visible py-2"
                >
                  Recursos Educativos
                </a>
                <a 
                  href="#ayuda" 
                  className="text-slate-700 hover:text-primary font-medium transition-colors focus-visible py-2"
                >
                  Ayuda
                </a>
                <Button 
                  onClick={handleExport}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 justify-start"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
