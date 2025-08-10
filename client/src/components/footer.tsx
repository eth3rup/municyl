import { MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MapPin className="text-primary-foreground" size={16} />
              </div>
              <span className="font-semibold text-white">Retrato de mi pueblo</span>
            </div>
            <p className="text-slate-400 text-sm">
              Plataforma educativa para explorar los municipios de Castilla y León usando datos abiertos oficiales.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Enlaces útiles</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://datosabiertos.jcyl.es" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors focus-visible"
                >
                  Datos Abiertos JCyL
                </a>
              </li>
              <li>
                <a 
                  href="#accesibilidad" 
                  className="hover:text-white transition-colors focus-visible"
                >
                  Accesibilidad
                </a>
              </li>
              <li>
                <a 
                  href="#privacidad" 
                  className="hover:text-white transition-colors focus-visible"
                >
                  Política de privacidad
                </a>
              </li>
              <li>
                <a 
                  href="#contacto" 
                  className="hover:text-white transition-colors focus-visible"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Recursos educativos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="#guias" 
                  className="hover:text-white transition-colors focus-visible"
                >
                  Guías didácticas
                </a>
              </li>
              <li>
                <a 
                  href="#material" 
                  className="hover:text-white transition-colors focus-visible"
                >
                  Material descargable
                </a>
              </li>
              <li>
                <a 
                  href="#formacion" 
                  className="hover:text-white transition-colors focus-visible"
                >
                  Formación docente
                </a>
              </li>
              <li>
                <a 
                  href="#comunidad" 
                  className="hover:text-white transition-colors focus-visible"
                >
                  Comunidad educativa
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>© 2024 Retrato de mi pueblo. Datos proporcionados por la Junta de Castilla y León.</p>
          <p className="mt-2">Aplicación web educativa desarrollada con datos abiertos oficiales.</p>
        </div>
      </div>
    </footer>
  );
}
