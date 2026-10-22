import React from 'react';
import { BookOpen, FileSpreadsheet, FileDown, Sparkles, Printer } from 'lucide-react';

interface HeaderNavProps {
  onOpenReport: () => void;
  onScrollToChat: () => void;
  onScrollToExplorer: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onOpenReport,
  onScrollToChat,
  onScrollToExplorer,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Newsroom ID */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-sky-700 flex items-center justify-center text-white shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                DATA<span className="text-sky-600">PERÚ</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                Periodismo de Datos
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Observatorio de Trayectorias Educativas (2023-2024)
            </p>
          </div>
        </div>

        {/* Navigation links & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={onScrollToExplorer}
            className="text-xs sm:text-sm font-medium text-slate-600 hover:text-sky-600 px-2 py-1.5 rounded-md hover:bg-slate-50 transition-colors"
          >
            Explorador Territorial
          </button>

          <button
            onClick={onScrollToChat}
            className="hidden md:flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-sky-600 px-2.5 py-1.5 rounded-md hover:bg-slate-50 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Asistente AEO</span>
          </button>

          {/* Raw CSV Download Dropdown / Link */}
          <div className="hidden lg:flex items-center space-x-2 border-l border-slate-200 pl-3">
            <a
              href="/Tasa_y_número_de_desertores_en_Educación_Primaria_2023-2024.csv"
              download
              title="Descargar dataset oficial Primaria en CSV"
              className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-sky-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
              <span>CSV Primaria</span>
            </a>
            <a
              href="/Tasa_y_número_de_desertores_en_Educación_Secundaria_2023-2024.csv"
              download
              title="Descargar dataset oficial Secundaria en CSV"
              className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-rose-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-rose-600" />
              <span>CSV Secundaria</span>
            </a>
          </div>

          {/* Executive Report Button */}
          <button
            onClick={onOpenReport}
            className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Reporte PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
