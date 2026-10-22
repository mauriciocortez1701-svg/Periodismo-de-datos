import React, { useState, useMemo, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import {
  Filter,
  RotateCcw,
  FileDown,
  Printer,
  ChevronRight,
  Search,
  ArrowUpDown,
  GraduationCap,
  AlertTriangle,
  Layers,
  BarChart3,
  Table as TableIcon
} from 'lucide-react';
import { DistrictRecord, AggregatedMetrics } from '../types';
import { calculateAggregates, formatNumber, formatPercent } from '../utils/calculations';

interface InteractiveExplorerProps {
  allRecords: DistrictRecord[];
  selectedDept: string;
  selectedProv: string;
  selectedDist: string;
  onFilterChange: (dept: string, prov: string, dist: string) => void;
  onResetFilters: () => void;
  onOpenReportModal: () => void;
}

export const InteractiveExplorer: React.FC<InteractiveExplorerProps> = ({
  allRecords,
  selectedDept,
  selectedProv,
  selectedDist,
  onFilterChange,
  onResetFilters,
  onOpenReportModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'secundaria_tasa' | 'secundaria_desertor' | 'primaria_tasa' | 'distrito'>('secundaria_tasa');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [chartViewMode, setChartViewMode] = useState<'tasas' | 'volumen'>('tasas');
  const pageSize = 10;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // 1. Cascading Options
  const departmentOptions = useMemo(() => {
    return Array.from(new Set(allRecords.map(r => r.departamento))).sort();
  }, [allRecords]);

  const provinceOptions = useMemo(() => {
    if (!selectedDept) {
      return Array.from(new Set(allRecords.map(r => r.provincia))).sort();
    }
    return Array.from(
      new Set(allRecords.filter(r => r.departamento === selectedDept).map(r => r.provincia))
    ).sort();
  }, [allRecords, selectedDept]);

  const districtOptions = useMemo(() => {
    let filtered = allRecords;
    if (selectedDept) filtered = filtered.filter(r => r.departamento === selectedDept);
    if (selectedProv) filtered = filtered.filter(r => r.provincia === selectedProv);
    return Array.from(new Set(filtered.map(r => r.distrito))).sort();
  }, [allRecords, selectedDept, selectedProv]);

  // Handle cascading changes
  const handleDeptSelect = (dept: string) => {
    onFilterChange(dept, '', '');
    setCurrentPage(1);
  };

  const handleProvSelect = (prov: string) => {
    let parentDept = selectedDept;
    if (!parentDept && prov) {
      const match = allRecords.find(r => r.provincia === prov);
      if (match) parentDept = match.departamento;
    }
    onFilterChange(parentDept, prov, '');
    setCurrentPage(1);
  };

  const handleDistSelect = (dist: string) => {
    let parentDept = selectedDept;
    let parentProv = selectedProv;
    if (dist && (!parentDept || !parentProv)) {
      const match = allRecords.find(r => r.distrito === dist);
      if (match) {
        parentDept = match.departamento;
        parentProv = match.provincia;
      }
    }
    onFilterChange(parentDept, parentProv, dist);
    setCurrentPage(1);
  };

  // 2. Filtered records based on selection
  const filteredRecords = useMemo(() => {
    return allRecords.filter(record => {
      if (selectedDept && record.departamento !== selectedDept) return false;
      if (selectedProv && record.provincia !== selectedProv) return false;
      if (selectedDist && record.distrito !== selectedDist) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesName =
          record.distrito.toLowerCase().includes(query) ||
          record.provincia.toLowerCase().includes(query) ||
          record.departamento.toLowerCase().includes(query) ||
          record.ubigeo.includes(query);
        if (!matchesName) return false;
      }
      return true;
    });
  }, [allRecords, selectedDept, selectedProv, selectedDist, searchTerm]);

  // 3. Dynamic aggregated metrics according to strict RAG rule
  const currentAggregates: AggregatedMetrics = useMemo(() => {
    let scopeName = 'Nivel Nacional (Todo el Perú)';
    let scopeType: 'nacional' | 'departamento' | 'provincia' | 'distrito' = 'nacional';

    if (selectedDist) {
      scopeName = `Distrito de ${selectedDist}`;
      scopeType = 'distrito';
    } else if (selectedProv) {
      scopeName = `Provincia de ${selectedProv} (${selectedDept})`;
      scopeType = 'provincia';
    } else if (selectedDept) {
      scopeName = `Departamento de ${selectedDept}`;
      scopeType = 'departamento';
    }

    return calculateAggregates(filteredRecords, scopeName, scopeType);
  }, [filteredRecords, selectedDept, selectedProv, selectedDist]);

  // 4. Sorted Records for Table
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'secundaria_tasa') {
        comparison = a.secundaria.tasa - b.secundaria.tasa;
      } else if (sortField === 'secundaria_desertor') {
        comparison = a.secundaria.desertor - b.secundaria.desertor;
      } else if (sortField === 'primaria_tasa') {
        comparison = a.primaria.tasa - b.primaria.tasa;
      } else if (sortField === 'distrito') {
        comparison = a.distrito.localeCompare(b.distrito);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [filteredRecords, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const handleSort = (field: 'secundaria_tasa' | 'secundaria_desertor' | 'primaria_tasa' | 'distrito') => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // 5. Chart Rendering Effect
  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    let labels: string[] = [];
    let pValues: number[] = [];
    let sValues: number[] = [];

    if (!selectedDept) {
      // Top 8 departments by secundaria rate
      const deptList = departmentOptions.map(d => {
        const recs = allRecords.filter(r => r.departamento === d);
        return calculateAggregates(recs, d, 'departamento');
      }).sort((a, b) => b.secundaria.tasa - a.secundaria.tasa).slice(0, 8);

      labels = deptList.map(d => d.scopeName);
      if (chartViewMode === 'tasas') {
        pValues = deptList.map(d => d.primaria.tasa);
        sValues = deptList.map(d => d.secundaria.tasa);
      } else {
        pValues = deptList.map(d => d.primaria.desertores);
        sValues = deptList.map(d => d.secundaria.desertores);
      }
    } else if (selectedDept && !selectedProv) {
      // Provinces within department
      const provList = provinceOptions.map(p => {
        const recs = allRecords.filter(r => r.departamento === selectedDept && r.provincia === p);
        return calculateAggregates(recs, p, 'provincia');
      }).sort((a, b) => b.secundaria.tasa - a.secundaria.tasa);

      labels = provList.map(p => p.scopeName);
      if (chartViewMode === 'tasas') {
        pValues = provList.map(p => p.primaria.tasa);
        sValues = provList.map(p => p.secundaria.tasa);
      } else {
        pValues = provList.map(p => p.primaria.desertores);
        sValues = provList.map(p => p.secundaria.desertores);
      }
    } else {
      // Districts in current selection (top 8)
      const topDists = [...filteredRecords]
        .sort((a, b) => b.secundaria.tasa - a.secundaria.tasa)
        .slice(0, 8);

      labels = topDists.map(d => d.distrito);
      if (chartViewMode === 'tasas') {
        pValues = topDists.map(d => d.primaria.tasa);
        sValues = topDists.map(d => d.secundaria.tasa);
      } else {
        pValues = topDists.map(d => d.primaria.desertor);
        sValues = topDists.map(d => d.secundaria.desertor);
      }
    }

    const isRates = chartViewMode === 'tasas';

    chartInstanceRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: isRates ? 'Primaria (Tasa %)' : 'Desertores Primaria (N°)',
            data: pValues,
            backgroundColor: 'rgba(2, 132, 199, 0.85)',
            borderColor: '#0284C7',
            borderWidth: 1,
            borderRadius: 6,
          },
          {
            label: isRates ? 'Secundaria (Tasa %)' : 'Desertores Secundaria (N°)',
            data: sValues,
            backgroundColor: 'rgba(225, 29, 72, 0.85)',
            borderColor: '#E11D48',
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: { family: 'Inter', size: 12, weight: 'bold' },
              usePointStyle: true,
              boxWidth: 8,
            },
          },
          tooltip: {
            backgroundColor: '#0F172A',
            titleFont: { family: 'Inter', size: 13, weight: 'bold' },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                if (isRates) {
                  return ` ${context.dataset.label}: ${Number(context.parsed.y).toFixed(2)}%`;
                }
                return ` ${context.dataset.label}: ${formatNumber(Number(context.parsed.y))} alumnos`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Inter', size: 11 },
              maxRotation: 45,
              minRotation: 0,
            },
          },
          y: {
            grid: { color: '#E2E8F0' },
            ticks: {
              font: { family: 'Inter', size: 11 },
              callback: function (val) {
                return isRates ? `${val}%` : formatNumber(Number(val));
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [allRecords, departmentOptions, provinceOptions, selectedDept, selectedProv, filteredRecords, chartViewMode]);

  const handleDownloadPdfTrigger = () => {
    setIsPdfLoading(true);
    setTimeout(() => {
      setIsPdfLoading(false);
      onOpenReportModal();
    }, 400);
  };

  return (
    <section id="explorador" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-700 mb-2">
          <Layers className="w-4 h-4" />
          <span>Sección 2 • Análisis Territorial y Comparativo</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
              Explorador Interactivo: Contraste Primaria vs. Secundaria
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Filtre por cualquier departamento, provincia o distrito para recalcular las métricas agregadas oficiales.
            </p>
          </div>

          {/* PDF Report Trigger Button */}
          <button
            onClick={handleDownloadPdfTrigger}
            disabled={isPdfLoading}
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all hover:shadow self-start lg:self-auto cursor-pointer"
          >
            {isPdfLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FileDown className="w-4 h-4 text-sky-400" />
            )}
            <span>Descargar Ficha / Reporte PDF</span>
          </button>
        </div>
      </div>

      {/* Dynamic Cascading Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs mb-8">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
            <Filter className="w-4 h-4 text-sky-600" />
            <span>Filtros Geográficos Dinámicos</span>
          </div>

          {(selectedDept || selectedProv || selectedDist) && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer a Nivel Nacional</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Departamento Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              1. Departamento
            </label>
            <select
              value={selectedDept}
              onChange={e => handleDeptSelect(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium transition-colors outline-none cursor-pointer"
            >
              <option value="">Todo el Perú (25 Regiones)</option>
              {departmentOptions.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Provincia Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              2. Provincia
            </label>
            <select
              value={selectedProv}
              onChange={e => handleProvSelect(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium transition-colors outline-none cursor-pointer"
            >
              <option value="">
                {selectedDept ? `Todas las provincias de ${selectedDept}` : 'Todas las provincias'}
              </option>
              {provinceOptions.map(prov => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          {/* Distrito Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              3. Distrito
            </label>
            <select
              value={selectedDist}
              onChange={e => handleDistSelect(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium transition-colors outline-none cursor-pointer"
            >
              <option value="">
                {selectedProv ? `Todos los distritos de ${selectedProv}` : 'Todos los distritos'}
              </option>
              {districtOptions.map(dist => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Active Geographic Breadcrumbs */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
          <span className="font-semibold text-slate-400">Ámbito seleccionado:</span>
          <span className="font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
            {selectedDept || 'Perú (Macro Nacional)'}
          </span>
          {selectedProv && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {selectedProv}
              </span>
            </>
          )}
          {selectedDist && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                {selectedDist}
              </span>
            </>
          )}
          <span className="ml-auto text-slate-500 text-[11px]">
            {filteredRecords.length} distritos analizados
          </span>
        </div>
      </div>

      {/* Side-by-Side Contrast Module (Primaria vs Secundaria) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Module Primaria */}
        <div className="bg-white rounded-2xl p-6 border-2 border-sky-100 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
                PRI
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Educación Primaria</h3>
                <span className="text-xs text-slate-500">Censo 2023-2024</span>
              </div>
            </div>
            <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
              Tasa Oficial: {formatPercent(currentAggregates.primaria.tasa)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Desertores</span>
              <div className="text-2xl font-extrabold text-sky-700">
                {formatNumber(currentAggregates.primaria.desertores)}
              </div>
              <span className="text-[11px] text-slate-400">alumnos fuera del aula</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Matrícula (Denom.)</span>
              <div className="text-2xl font-extrabold text-slate-900">
                {formatNumber(currentAggregates.primaria.denominador)}
              </div>
              <span className="text-[11px] text-slate-400">estudiantes matriculados</span>
            </div>
          </div>

          {/* Progress bar visualizer */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600">Proporción de deserción en Primaria</span>
              <span className="text-sky-700">{formatPercent(currentAggregates.primaria.tasa)}</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-sky-600 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(currentAggregates.primaria.tasa * 12, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Representa 1 de cada {Math.round(100 / (currentAggregates.primaria.tasa || 1))} alumnos matriculados.
            </p>
          </div>
        </div>

        {/* Module Secundaria */}
        <div className="bg-white rounded-2xl p-6 border-2 border-rose-100 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm">
                SEC
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Educación Secundaria</h3>
                <span className="text-xs text-rose-500 font-semibold">Zona de Alto Riesgo</span>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Tasa Oficial: {formatPercent(currentAggregates.secundaria.tasa)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Desertores</span>
              <div className="text-2xl font-extrabold text-rose-600">
                {formatNumber(currentAggregates.secundaria.desertores)}
              </div>
              <span className="text-[11px] text-slate-400">adolescentes que abandonaron</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Matrícula (Denom.)</span>
              <div className="text-2xl font-extrabold text-slate-900">
                {formatNumber(currentAggregates.secundaria.denominador)}
              </div>
              <span className="text-[11px] text-slate-400">estudiantes matriculados</span>
            </div>
          </div>

          {/* Progress bar visualizer */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600">Proporción de deserción en Secundaria</span>
              <span className="text-rose-600">{formatPercent(currentAggregates.secundaria.tasa)}</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-rose-600 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(currentAggregates.secundaria.tasa * 12, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px]">
              <span className="text-slate-500">
                Brecha de vulnerabilidad: <strong className="text-rose-600 font-bold">+{formatPercent(currentAggregates.brechaTasa)}</strong>
              </span>
              <span className="font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                +{formatPercent(((currentAggregates.secundaria.tasa - currentAggregates.primaria.tasa) / (currentAggregates.primaria.tasa || 1)) * 100)} mayor riesgo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-slate-900 text-lg">
                Comparativa Visual de Deserción: {currentAggregates.scopeName}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualización dinámica con Chart.js según el desglose geográfico activo.
            </p>
          </div>

          {/* Toggle between Rates (%) and Absolute Volume (N°) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setChartViewMode('tasas')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'tasas'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tasas Porcentuales (%)
            </button>
            <button
              onClick={() => setChartViewMode('volumen')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'volumen'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Volumen Absoluto (N° Desertores)
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-72 sm:h-80 w-full relative">
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* Detailed Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <TableIcon className="w-5 h-5 text-slate-500" />
            <h3 className="font-bold text-slate-900 text-base">
              Tabla Geográfica de Registros ({filteredRecords.length} distritos)
            </h3>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search filter input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por distrito, ubigeo..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-sky-500 focus:bg-white w-48 sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Ubigeo</th>
                <th
                  onClick={() => handleSort('distrito')}
                  className="py-3 px-4 cursor-pointer hover:text-sky-600"
                >
                  <div className="flex items-center space-x-1">
                    <span>Distrito / Región</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('primaria_tasa')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-sky-600"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Primaria (Des. / Denom.)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Tasa Primaria</th>
                <th
                  onClick={() => handleSort('secundaria_desertor')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-rose-600"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Secundaria (Des. / Denom.)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('secundaria_tasa')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-rose-600"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Tasa Secundaria</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Brecha Riesgo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map(record => {
                  const isHighRisk = record.secundaria.tasa >= 3.5;
                  return (
                    <tr
                      key={record.ubigeo}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => handleDistSelect(record.distrito)}
                      title="Haga clic para enfocar este distrito"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">
                        {record.ubigeo}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div>
                          <span className="font-bold">{record.distrito}</span>
                          <span className="text-slate-500 text-xs block">
                            {record.provincia}, {record.departamento}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        <span className="font-semibold text-slate-900">{formatNumber(record.primaria.desertor)}</span>
                        <span className="text-slate-400 text-xs"> / {formatNumber(record.primaria.denominador)}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-sky-700">
                        {formatPercent(record.primaria.tasa)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        <span className="font-semibold text-slate-900">{formatNumber(record.secundaria.desertor)}</span>
                        <span className="text-slate-400 text-xs"> / {formatNumber(record.secundaria.denominador)}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-bold inline-block px-2 py-0.5 rounded-full text-xs ${
                            isHighRisk
                              ? 'bg-rose-100 text-rose-800 font-extrabold'
                              : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {formatPercent(record.secundaria.tasa)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">
                        <span className="text-xs">+{formatPercent(record.brecha_tasa)}</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No se encontraron distritos con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
            <span>
              Mostrando página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> (
              {sortedRecords.length} registros)
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                Anterior
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
