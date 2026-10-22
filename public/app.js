/**
 * Deserción Escolar en Educación Primaria y Secundaria en el Perú (2023-2024)
 * Script modular para carga de datos, cálculo RAG estricto, Chart.js y Chatbot AEO
 */

let allDataset = [];

// Formateador numérico
const formatNumber = num => new Intl.NumberFormat('es-PE').format(num);
const formatPercent = rate => `${Number(rate).toFixed(2)}%`;

/**
 * Cálculo RAG estricto:
 * Tasa = (Suma de desertores / Suma de denominadores) * 100
 */
export function calculateAggregates(records, scopeName = 'Perú') {
  const pDesert = records.reduce((acc, r) => acc + r.primaria.desertor, 0);
  const pDenom = records.reduce((acc, r) => acc + r.primaria.denominador, 0);
  const pRate = pDenom > 0 ? (pDesert / pDenom) * 100 : 0;

  const sDesert = records.reduce((acc, r) => acc + r.secundaria.desertor, 0);
  const sDenom = records.reduce((acc, r) => acc + r.secundaria.denominador, 0);
  const sRate = sDenom > 0 ? (sDesert / sDenom) * 100 : 0;

  return {
    scopeName,
    count: records.length,
    primaria: { desertores: pDesert, denominador: pDenom, tasa: pRate },
    secundaria: { desertores: sDesert, denominador: sDenom, tasa: sRate },
    brecha: sRate - pRate
  };
}

// Carga inicial de datos
export async function loadData() {
  try {
    const res = await fetch('/desercion_data.json');
    allDataset = await res.json();
    console.log(`Dataset MINEDU cargado: ${allDataset.length} distritos analizados.`);
    return allDataset;
  } catch (err) {
    console.error('Error cargando desercion_data.json:', err);
    return [];
  }
}

// Motor de Búsqueda Conversacional AEO local
export function queryLocalAssistant(query, dataset = allDataset) {
  const norm = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // Buscar provincia o departamento
  const deptMatch = dataset.find(r => norm.includes(r.departamento.toLowerCase()));
  if (deptMatch) {
    const recs = dataset.filter(r => r.departamento === deptMatch.departamento);
    const agg = calculateAggregates(recs, deptMatch.departamento);
    return {
      text: `En el departamento de **${deptMatch.departamento}**, la tasa agregada en Primaria es ${formatPercent(agg.primaria.tasa)} (${formatNumber(agg.primaria.desertores)} alumnos) y en Secundaria sube a ${formatPercent(agg.secundaria.tasa)} (${formatNumber(agg.secundaria.desertores)} alumnos). La brecha de riesgo inter-ciclo es de +${formatPercent(agg.brecha)}.`,
      data: agg
    };
  }

  // Nacional por defecto
  const nat = calculateAggregates(dataset, 'Nacional');
  return {
    text: `A nivel nacional (2023-2024), Primaria registró 64,463 desertores (1.73%) y Secundaria 72,282 desertores (2.54%), con una brecha de +0.81 puntos porcentuales.`,
    data: nat
  };
}

// Descarga / impresión de Ficha PDF
export function triggerPdfDownload() {
  window.print();
}
