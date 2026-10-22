import React from 'react';
import { Database, ShieldCheck, FileSpreadsheet, FileJson, ExternalLink, HelpCircle } from 'lucide-react';

export const FooterSection: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-12 border-t border-slate-800 text-xs sm:text-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Portal ID */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white text-lg tracking-tight">
                DATA<span className="text-sky-400">PERÚ</span>
              </span>
              <span className="text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded">
                Portal Oficial
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma periodística e interactiva dedicada a la fiscalización, transparencia y análisis de las
              trayectorias escolares en el Perú a partir de microdatos censales oficiales.
            </p>
            <div className="pt-2 text-xs text-slate-400">
              © {new Date().getFullYear()} Observatorio de Periodismo de Datos Educativos.
            </div>
          </div>

          {/* Col 2: Datasets & Downloads */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">
              Datasets Oficiales
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <a
                  href="/Tasa_y_número_de_desertores_en_Educación_Primaria_2023-2024.csv"
                  download
                  className="hover:text-white flex items-center space-x-2 text-slate-400 hover:text-sky-400 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                  <span>CSV Primaria 2023-2024</span>
                </a>
              </li>
              <li>
                <a
                  href="/Tasa_y_número_de_desertores_en_Educación_Secundaria_2023-2024.csv"
                  download
                  className="hover:text-white flex items-center space-x-2 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-rose-400" />
                  <span>CSV Secundaria 2023-2024</span>
                </a>
              </li>
              <li>
                <a
                  href="/desercion_data.json"
                  download
                  className="hover:text-white flex items-center space-x-2 text-slate-400 hover:text-amber-400 transition-colors"
                >
                  <FileJson className="w-4 h-4 text-amber-400" />
                  <span>JSON Unificado Georreferenciado</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Methodological Transparency */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">
              Rigor y Metodología
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Fuente de Datos:</strong> Sistema de Información de Apoyo a la Gestión de la Institución
              Educativa (SIAGIE) y Estadística de la Calidad Educativa (ESCALE), Ministerio de Educación del Perú (MINEDU).
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Regla de Agregación:</strong> Tasa (%) = (Σ desertores / Σ denominadores) × 100.
            </p>
          </div>

          {/* Col 4: AEO & GEO FAQ */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span>Optimización AEO / GEO</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Estructura con esquemas Schema.org JSON-LD (Dataset y FAQPage) para indexación y citación por
              motores de inteligencia artificial generativa y motores de búsqueda semántica.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Cero Alucinación • RAG Local</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
          Deserción Escolar en Educación Primaria y Secundaria en el Perú • Periodo 2023-2024 • Portal Periodístico Interactivo
        </div>
      </div>
    </footer>
  );
};
