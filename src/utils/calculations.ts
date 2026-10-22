import { DistrictRecord, AggregatedMetrics } from '../types';

/**
 * Calculates aggregated metrics strictly following the prompt's golden rule:
 * Tasa Porcentual = (Suma de desertores / Suma de denominadores) * 100
 * Never averages district percentage rates directly.
 */
export function calculateAggregates(
  records: DistrictRecord[],
  scopeName = 'Nivel Nacional (Todo el Perú)',
  scopeType: 'nacional' | 'departamento' | 'provincia' | 'distrito' = 'nacional'
): AggregatedMetrics {
  const pDesert = records.reduce((acc, r) => acc + r.primaria.desertor, 0);
  const pDenom = records.reduce((acc, r) => acc + r.primaria.denominador, 0);
  const pRate = pDenom > 0 ? (pDesert / pDenom) * 100 : 0;

  const sDesert = records.reduce((acc, r) => acc + r.secundaria.desertor, 0);
  const sDenom = records.reduce((acc, r) => acc + r.secundaria.denominador, 0);
  const sRate = sDenom > 0 ? (sDesert / sDenom) * 100 : 0;

  const totalDesertores = pDesert + sDesert;
  const totalMatricula = pDenom + sDenom;
  const tasaGlobal = totalMatricula > 0 ? (totalDesertores / totalMatricula) * 100 : 0;

  return {
    scopeName,
    scopeType,
    distritosCount: records.length,
    primaria: {
      desertores: pDesert,
      denominador: pDenom,
      tasa: Number(pRate.toFixed(2)),
    },
    secundaria: {
      desertores: sDesert,
      denominador: sDenom,
      tasa: Number(sRate.toFixed(2)),
    },
    brechaTasa: Number((sRate - pRate).toFixed(2)),
    totalDesertores,
    totalMatricula,
    tasaGlobal: Number(tasaGlobal.toFixed(2)),
  };
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-PE').format(num);
}

export function formatPercent(rate: number): string {
  return `${rate.toFixed(2)}%`;
}

/**
 * Normalizes text for accent-insensitive and case-insensitive comparison
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}
