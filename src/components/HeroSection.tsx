import React from 'react';
import { Calendar, Database, ShieldCheck, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9] pt-10 pb-14 border-b border-slate-200">
      {/* Decorative subtle editorial watermark */}
      <div className="absolute right-0 top-0 -translate-y-8 translate-x-12 opacity-5 pointer-events-none select-none text-9xl font-black text-slate-900 font-serif-editorial">
        2024
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Methodological Badges & Read time */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
          <span className="inline-flex items-center space-x-1 bg-sky-50 text-sky-800 font-semibold px-2.5 py-1 rounded-full border border-sky-200">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span>Periodo Censal 2023-2024</span>
          </span>

          <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-full border border-slate-200">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>Fuente Oficial: MINEDU / SIAGIE / ESCALE</span>
          </span>

          <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 font-medium px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Veracidad Cero-Alucinación (RAG Estricto)</span>
          </span>

          <span className="inline-flex items-center space-x-1 text-slate-500 ml-auto font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Lectura técnica: 5 min</span>
          </span>
        </div>

        {/* Editorial Headline */}
        <div className="max-w-4xl">
          <p className="text-xs sm:text-sm uppercase tracking-widest font-bold text-sky-700 mb-3">
            Informe Especial de Investigación
          </p>
          <h1 className="font-serif-editorial text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold text-[#0F172A] leading-tight sm:leading-tight mb-6">
            La grieta silenciosa de las aulas: Más de 136,000 escolares desertaron en el Perú entre 2023 y 2024
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 font-normal leading-relaxed mb-8">
            El salto de la Educación Primaria a la Secundaria se ha convertido en el punto de mayor
            fractura pedagógica del sistema peruano. Mientras la primaria retiene a la gran mayoría de
            estudiantes con una tasa de deserción del <strong className="text-sky-700 font-semibold">1.73%</strong>,
            la secundaria dispara el abandono al <strong className="text-rose-600 font-semibold">2.54%</strong>. Un
            incremento relativo del <strong className="text-slate-900 font-semibold">+46.8%</strong> en el riesgo de deserción
            que golpea con mayor saña a las cuencas amazónicas y a los cinturones urbanos periféricos.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onExploreClick}
              className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5 py-3 rounded-lg shadow-sm hover:shadow transition-all group"
            >
              <span>Explorar Datos por Territorio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#asistente-aeo"
              className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-5 py-3 rounded-lg border border-slate-300 shadow-sm transition-all"
            >
              <span>Consultar al Asistente AEO</span>
            </a>
          </div>
        </div>

        {/* Methodological notice card */}
        <div className="mt-10 p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start space-x-3 text-xs sm:text-sm text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Regla Metodológica de Agregación:</strong> Todas las tasas departamentales y
            provinciales mostradas en este portal son recalculadas de forma matemática estricta sumando los valores
            absolutos: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-amber-950 font-semibold">Tasa = (Σ Desertores / Σ Matrícula) × 100</code>.
            Bajo ninguna circunstancia se promedian tasas distritales de forma directa, garantizando precisión estadística absoluta.
          </div>
        </div>
      </div>
    </section>
  );
};
