import React from 'react';
import { X, Printer, Download, CheckCircle2, FileText, School, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DistrictRecord, AggregatedMetrics } from '../types';
import { formatNumber, formatPercent } from '../utils/calculations';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: AggregatedMetrics;
  records: DistrictRecord[];
  filterParams: {
    departamento: string;
    provincia: string;
    distrito: string;
  };
  attachedNotes?: string[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  metrics,
  records,
  filterParams,
  attachedNotes = [],
}) => {
  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentTime = new Date().toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const topDistricts = [...records]
    .sort((a, b) => b.secundaria.tasa - a.secundaria.tasa)
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      {/* Modal Card */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Actions Bar (Top) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-sm sm:text-base">
              Vista Previa de Ficha Técnica / Reporte Ejecutivo
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar en PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-report" className="overflow-y-auto p-8 sm:p-10 font-sans text-slate-800 space-y-8 bg-white">
          {/* Official Newsroom / Institutional Letterhead */}
          <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-black text-xl text-slate-900 tracking-tight">
                  DATAPERÚ <span className="text-sky-600 font-serif-editorial italic font-normal">Investigación</span>
                </span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 uppercase px-2 py-0.5 rounded border border-slate-300">
                  Documento Oficial
                </span>
              </div>
              <h1 className="font-serif-editorial text-2xl sm:text-3xl font-extrabold text-slate-900">
                Ficha Técnica: Deserción Escolar en Primaria y Secundaria
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Análisis Estadístico Territorial sobre Microdatos Oficiales de Matrícula y Abandono (Periodo 2023-2024)
              </p>
            </div>

            <div className="text-right text-xs text-slate-500 sm:border-l sm:border-slate-200 sm:pl-4">
              <div><strong>Fecha de emisión:</strong> {currentDate}</div>
              <div><strong>Hora:</strong> {currentTime}</div>
              <div><strong>Folio:</strong> INF-DES-{Math.floor(100000 + Math.random() * 900000)}</div>
            </div>
          </div>

          {/* Filter Parameters Summary Block */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold block text-[10px]">Ámbito Territorial</span>
              <strong className="text-slate-900 font-bold">{metrics.scopeName}</strong>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold block text-[10px]">Departamento</span>
              <strong className="text-slate-900">{filterParams.departamento || 'Todo el Perú'}</strong>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold block text-[10px]">Provincia</span>
              <strong className="text-slate-900">{filterParams.provincia || 'Todas las provincias'}</strong>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold block text-[10px]">Distritos Evaluados</span>
              <strong className="text-slate-900">{metrics.distritosCount} distritos censados</strong>
            </div>
          </div>

          {/* Core Statistical Summary Table */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-3 flex items-center space-x-2">
              <span>1. Balance Estadístico Comparativo de Ciclo</span>
            </h3>

            <table className="w-full text-left text-xs sm:text-sm border-collapse border border-slate-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Nivel Educativo</th>
                  <th className="py-2.5 px-3 text-right">Desertores (N°)</th>
                  <th className="py-2.5 px-3 text-right">Matrícula (Denom.)</th>
                  <th className="py-2.5 px-3 text-right">Tasa Oficial (%)</th>
                  <th className="py-2.5 px-3 text-right">Condición de Riesgo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-sky-800">
                    Educación Primaria
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium">
                    {formatNumber(metrics.primaria.desertores)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium">
                    {formatNumber(metrics.primaria.denominador)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-sky-700">
                    {formatPercent(metrics.primaria.tasa)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600">
                    Línea Base Escolar
                  </td>
                </tr>
                <tr className="bg-rose-50/40">
                  <td className="py-2.5 px-3 font-semibold text-rose-800">
                    Educación Secundaria
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-rose-700">
                    {formatNumber(metrics.secundaria.desertores)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium">
                    {formatNumber(metrics.secundaria.denominador)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                    {formatPercent(metrics.secundaria.tasa)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-rose-700">
                    Alta Vulnerabilidad
                  </td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="py-2.5 px-3 text-slate-900">
                    Brecha de Deserción Inter-ciclo
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-900">
                    +{formatNumber(metrics.secundaria.desertores - metrics.primaria.desertores)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-900">
                    {formatNumber(metrics.totalMatricula)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-rose-600">
                    +{formatPercent(metrics.brechaTasa)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-rose-600 font-bold">
                    Incremento de Riesgo
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Top Vulnerable Jurisdictions in Scope */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-3">
              2. Zonas de Mayor Tasa de Abandono en Secundaria
            </h3>

            <table className="w-full text-left text-xs border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2 px-3">Ubigeo</th>
                  <th className="py-2 px-3">Distrito / Provincia</th>
                  <th className="py-2 px-3 text-right">Desertores Secundaria</th>
                  <th className="py-2 px-3 text-right">Tasa Primaria</th>
                  <th className="py-2 px-3 text-right">Tasa Secundaria</th>
                  <th className="py-2 px-3 text-right">Brecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topDistricts.map((d, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-slate-500">{d.ubigeo}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">
                      {d.distrito} <span className="font-normal text-slate-500">({d.provincia})</span>
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-slate-900">
                      {formatNumber(d.secundaria.desertor)}
                    </td>
                    <td className="py-2 px-3 text-right text-sky-700 font-medium">
                      {formatPercent(d.primaria.tasa)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-rose-600">
                      {formatPercent(d.secundaria.tasa)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-800">
                      +{formatPercent(d.brecha_tasa)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Attached Investigation Notes from Assistant */}
          {attachedNotes.length > 0 && (
            <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-200">
              <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                <span>3. Notas de Investigación Periodística Incorporadas</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {attachedNotes.map((note, nIdx) => (
                  <li key={nIdx} className="bg-white p-2.5 rounded-lg border border-sky-100 shadow-2xs">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Methodological Citation & Certification */}
          <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center space-x-2 text-slate-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Certificación de Rigor Estadístico y Metodología RAG:</span>
            </div>
            <p>
              <strong>Fuente Oficial:</strong> Ministerio de Educación del Perú (MINEDU), Sistema de Información de Apoyo a la Gestión de la Institución Educativa (SIAGIE) y Estadística de la Calidad Educativa (ESCALE). Periodo Escolar consolidado 2023-2024.
            </p>
            <p>
              <strong>Fórmula de Agregación:</strong> Tasa Porcentual = (Suma total de desertores / Suma total de denominadores) × 100. Ningún valor proviene de inferencias o estimaciones fuera de los microdatos oficiales.
            </p>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between no-print">
          <span className="text-xs text-slate-500">
            Formato optimizado para impresión A4 e informe ejecutivo.
          </span>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Imprimir / Descargar PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
