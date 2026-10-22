import React, { useEffect, useState } from 'react';
import { GraduationCap, AlertOctagon, TrendingUp, MapPin, Users, HelpCircle } from 'lucide-react';
import { formatNumber } from '../utils/calculations';

interface KpiCardsProps {
  onSelectDistrict?: (dept: string, prov: string, dist: string) => void;
}

// Custom animated counter hook
function useCountUp(end: number, duration = 1200): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return count;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ onSelectDistrict }) => {
  const countPrimariaDesertores = useCountUp(64463);
  const countSecundariaDesertores = useCountUp(72282);
  const [activeTopTab, setActiveTopTab] = useState<'volumen' | 'tasa'>('volumen');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Primaria */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 kpi-glow-primary group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
              Nivel Primaria
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>

          <div className="mb-2">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatNumber(countPrimariaDesertores)}
            </div>
            <p className="text-xs text-slate-500 font-medium">alumnos desertores en 2023-2024</p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Tasa Nacional</span>
              <div className="text-xl font-bold text-sky-600">1.73%</div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase font-semibold">Matrícula Base</span>
              <div className="text-xs font-medium text-slate-600">3,721,852 estud.</div>
            </div>
          </div>
        </div>

        {/* Card 2: Secundaria */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 kpi-glow-secundaria group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
              Nivel Secundaria
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>

          <div className="mb-2">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatNumber(countSecundariaDesertores)}
            </div>
            <p className="text-xs text-slate-500 font-medium">adolescentes fuera del colegio</p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Tasa Nacional</span>
              <div className="text-xl font-bold text-rose-600">2.54%</div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase font-semibold">Matrícula Base</span>
              <div className="text-xs font-medium text-slate-600">2,842,831 estud.</div>
            </div>
          </div>
        </div>

        {/* Card 3: Brecha de Riesgo */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              Brecha de Riesgo
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="mb-2">
            <div className="text-3xl font-extrabold text-amber-600 tracking-tight">
              +0.81%
            </div>
            <p className="text-xs text-slate-500 font-medium">incremento porcentual al pasar de ciclo</p>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Incremento relativo de tasa:</span>
              <strong className="text-slate-900 font-semibold">+46.8%</strong>
            </div>
            <div className="flex justify-between">
              <span>Alumnos en riesgo adicional:</span>
              <strong className="text-rose-600 font-semibold">+7,819 desertores</strong>
            </div>
          </div>
        </div>

        {/* Card 4: Top Territorio Crítico */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
              <button
                onClick={() => setActiveTopTab('volumen')}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  activeTopTab === 'volumen' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Mayor Volumen
              </button>
              <button
                onClick={() => setActiveTopTab('tasa')}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  activeTopTab === 'tasa' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Mayor Tasa
              </button>
            </div>
            <MapPin className="w-4 h-4 text-slate-400" />
          </div>

          {activeTopTab === 'volumen' ? (
            <div>
              <div className="text-xl font-extrabold text-slate-900 leading-tight">
                San Juan de Lurigancho
              </div>
              <p className="text-xs text-slate-500 mb-2">Lima Metropolitana</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Secundaria</span>
                  <span className="font-bold text-rose-600">2,410 desertores</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tasa Sec.</span>
                  <span className="font-bold text-slate-900">2.15%</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xl font-extrabold text-rose-600 leading-tight">
                Manseriche
              </div>
              <p className="text-xs text-slate-500 mb-2">Datem del Marañón, Loreto</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tasa Secundaria</span>
                  <span className="font-bold text-rose-600">9.60%</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Brecha Ciclo</span>
                  <span className="font-bold text-slate-900">+3.70%</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 pt-2 text-[11px] text-sky-700 font-medium flex items-center justify-between">
            <span>Zona más vulnerable</span>
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Oficial MINEDU</span>
          </div>
        </div>
      </div>
    </section>
  );
};
