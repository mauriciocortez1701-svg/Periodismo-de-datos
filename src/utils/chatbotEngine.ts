import { DistrictRecord, ChatMessage } from '../types';
import { calculateAggregates, formatNumber, formatPercent, normalizeText } from './calculations';

export function processChatQuery(query: string, allRecords: DistrictRecord[]): Omit<ChatMessage, 'id' | 'timestamp'> {
  const norm = normalizeText(query);

  // 1. Check for Top / Rankings (e.g., "5 distritos con más desertores en Piura", "top 5 distritos", "mayor tasa")
  const topMatch = norm.match(/(?:top|los|primeros)?\s*(\d+)?\s*(?:distritos|lugares|zonas)?.*(?:mas|mayor)\s*(?:desertores|abandono|desertor|tasa|alumnos fuera)/i);
  const isTopQuery = !!topMatch || norm.includes('ranking') || norm.includes('los 5') || norm.includes('top 5') || norm.includes('mas desertores');

  // Check if a specific department or province is mentioned
  const allDepts = Array.from(new Set(allRecords.map(r => r.departamento)));
  const allProvs = Array.from(new Set(allRecords.map(r => r.provincia)));
  const allDists = Array.from(new Set(allRecords.map(r => r.distrito)));

  const foundDept = allDepts.find(d => norm.includes(normalizeText(d)));
  const foundProv = allProvs.find(p => norm.includes(normalizeText(p)));
  const foundDist = allDists.find(d => norm.includes(normalizeText(d)));

  // If top ranking query for a specific geography
  if (isTopQuery) {
    let subset = allRecords;
    let targetName = 'a nivel nacional';
    let filterObj: { departamento?: string; provincia?: string } | undefined;

    if (foundDept) {
      subset = allRecords.filter(r => r.departamento === foundDept);
      targetName = `en el departamento de ${foundDept}`;
      filterObj = { departamento: foundDept };
    } else if (foundProv) {
      subset = allRecords.filter(r => r.provincia === foundProv);
      targetName = `en la provincia de ${foundProv}`;
      filterObj = { provincia: foundProv };
    }

    const count = 5;
    const byRate = norm.includes('tasa') || norm.includes('porcentaje');

    const sorted = [...subset].sort((a, b) => {
      if (byRate) {
        return b.secundaria.tasa - a.secundaria.tasa;
      }
      return (b.primaria.desertor + b.secundaria.desertor) - (a.primaria.desertor + a.secundaria.desertor);
    }).slice(0, count);

    const rows = sorted.map((r, i) => [
      `#${i + 1} ${r.distrito} (${r.provincia})`,
      `${formatNumber(r.primaria.desertor)} (${formatPercent(r.primaria.tasa)})`,
      `${formatNumber(r.secundaria.desertor)} (${formatPercent(r.secundaria.tasa)})`,
      formatPercent(r.brecha_tasa),
      formatNumber(r.primaria.desertor + r.secundaria.desertor)
    ]);

    const leadDistrict = sorted[0];
    const metricText = byRate ? `la tasa más alta en Secundaria (${formatPercent(leadDistrict.secundaria.tasa)})` : `el mayor volumen absoluto (${formatNumber(leadDistrict.primaria.desertor + leadDistrict.secundaria.desertor)} desertores totales)`;

    return {
      sender: 'assistant',
      text: `Análisis de concentración territorial: Los 5 distritos con mayor impacto de deserción ${targetName} revelan una severa disparidad. El distrito con mayor índice es **${leadDistrict.distrito}**, registrando ${metricText}. La transición hacia la secundaria profundiza de forma generalizada el abandono en estas jurisdicciones.`,
      tableData: {
        headers: ['Distrito / Provincia', 'Primaria (Des. / %)', 'Secundaria (Des. / %)', 'Brecha', 'Total Alumnos Fuera'],
        rows
      },
      action: filterObj ? {
        label: `Filtrar mapa y reporte para ${foundDept || foundProv}`,
        filter: filterObj
      } : undefined
    };
  }

  // 2. Query for a specific District
  if (foundDist) {
    const record = allRecords.find(r => r.distrito === foundDist);
    if (record) {
      const isSecHigher = record.secundaria.tasa > record.primaria.tasa;
      const brecha = record.brecha_tasa;
      return {
        sender: 'assistant',
        text: `En el distrito de **${record.distrito}** (${record.provincia}, ${record.departamento}), la tasa de deserción en Educación Primaria se sitúa en **${formatPercent(record.primaria.tasa)}** (${formatNumber(record.primaria.desertor)} desertores de ${formatNumber(record.primaria.denominador)} estudiantes), mientras que en Secundaria asciende a **${formatPercent(record.secundaria.tasa)}** (${formatNumber(record.secundaria.desertor)} desertores de ${formatNumber(record.secundaria.denominador)} estudiantes). La brecha de riesgo representa un ${isSecHigher ? 'incremento' : 'variación'} de **${brecha > 0 ? '+' : ''}${formatPercent(brecha)}** en secundaria.`,
        tableData: {
          headers: ['Nivel Educativo', 'Desertores (N°)', 'Matrícula Total', 'Tasa Oficial (%)', 'Estado'],
          rows: [
            ['Educación Primaria', formatNumber(record.primaria.desertor), formatNumber(record.primaria.denominador), formatPercent(record.primaria.tasa), 'Nivel Base'],
            ['Educación Secundaria', formatNumber(record.secundaria.desertor), formatNumber(record.secundaria.denominador), formatPercent(record.secundaria.tasa), record.secundaria.tasa > 3.0 ? 'Alerta Crítica' : 'Bajo Observación'],
            ['Total Consolidado', formatNumber(record.primaria.desertor + record.secundaria.desertor), formatNumber(record.primaria.denominador + record.secundaria.denominador), formatPercent(((record.primaria.desertor + record.secundaria.desertor)/(record.primaria.denominador + record.secundaria.denominador))*100), 'Ambos Niveles']
          ]
        },
        action: {
          label: `Ver ${record.distrito} en explorador interactivo`,
          filter: {
            departamento: record.departamento,
            provincia: record.provincia,
            distrito: record.distrito
          }
        }
      };
    }
  }

  // 3. Query for a specific Province (e.g., "Chachapoyas", "Cusco", "Sullana")
  if (foundProv && !foundDept) {
    const provRecords = allRecords.filter(r => r.provincia === foundProv);
    const agg = calculateAggregates(provRecords, `Provincia de ${foundProv}`, 'provincia');
    const deptParent = provRecords[0]?.departamento || '';
    const topDist = [...provRecords].sort((a,b) => b.secundaria.tasa - a.secundaria.tasa)[0];

    return {
      sender: 'assistant',
      text: `Reporte Provincial: En la provincia de **${foundProv}** (${deptParent}), la tasa agregada de deserción en Educación Primaria es de **${formatPercent(agg.primaria.tasa)}** (${formatNumber(agg.primaria.desertores)} desertores de ${formatNumber(agg.primaria.denominador)} matriculados) y en Educación Secundaria alcanza el **${formatPercent(agg.secundaria.tasa)}** (${formatNumber(agg.secundaria.desertores)} desertores de ${formatNumber(agg.secundaria.denominador)}). La brecha provincial es de **+${formatPercent(agg.brechaTasa)}**, siendo **${topDist?.distrito}** el distrito con mayor tasa de abandono en secundaria (${formatPercent(topDist?.secundaria.tasa || 0)}).`,
      tableData: {
        headers: ['Nivel Oficial', 'Desertores Absolutos', 'Matrícula (Denominador)', 'Tasa Agregada (%)', 'Brecha / Estado'],
        rows: [
          ['Educación Primaria', formatNumber(agg.primaria.desertores), formatNumber(agg.primaria.denominador), formatPercent(agg.primaria.tasa), 'Primaria Oficial'],
          ['Educación Secundaria', formatNumber(agg.secundaria.desertores), formatNumber(agg.secundaria.denominador), formatPercent(agg.secundaria.tasa), `+${formatPercent(agg.brechaTasa)} vs Primaria`],
          ['Consolidado Provincial', formatNumber(agg.totalDesertores), formatNumber(agg.totalMatricula), formatPercent(agg.tasaGlobal), `${agg.distritosCount} distritos evaluados`]
        ]
      },
      action: {
        label: `Filtrar provincia de ${foundProv}`,
        filter: {
          departamento: deptParent,
          provincia: foundProv
        }
      }
    };
  }

  // 4. Query for a Department (e.g., "Cusco", "Loreto", "Piura", "Amazonas")
  if (foundDept) {
    const deptRecords = allRecords.filter(r => r.departamento === foundDept);
    const agg = calculateAggregates(deptRecords, `Departamento de ${foundDept}`, 'departamento');
    const mayorNivel = agg.secundaria.tasa > agg.primaria.tasa ? 'Educación Secundaria' : 'Educación Primaria';
    const topProv = Array.from(new Set(deptRecords.map(r => r.provincia)))
      .map(p => {
        const pRecs = deptRecords.filter(r => r.provincia === p);
        return calculateAggregates(pRecs, p, 'provincia');
      })
      .sort((a,b) => b.secundaria.tasa - a.secundaria.tasa)[0];

    return {
      sender: 'assistant',
      text: `Balance Departamental: En **${foundDept}**, el nivel con mayor índice de deserción es **${mayorNivel}** con una tasa agregada de **${formatPercent(agg.secundaria.tasa)}** (${formatNumber(agg.secundaria.desertores)} estudiantes fuera de las aulas), superando al ${formatPercent(agg.primaria.tasa)} registrado en Primaria. Esto marca una brecha de vulnerabilidad de **+${formatPercent(agg.brechaTasa)}**. La provincia con mayor riesgo es **${topProv?.scopeName}** con una tasa en secundaria de ${formatPercent(topProv?.secundaria.tasa || 0)}.`,
      tableData: {
        headers: ['Nivel Educativo', 'Estudiantes Desertores', 'Matrícula Censal', 'Tasa Agregada (%)', 'Diagnóstico'],
        rows: [
          ['Educación Primaria', formatNumber(agg.primaria.desertores), formatNumber(agg.primaria.denominador), formatPercent(agg.primaria.tasa), 'Tasa agregada oficial'],
          ['Educación Secundaria', formatNumber(agg.secundaria.desertores), formatNumber(agg.secundaria.denominador), formatPercent(agg.secundaria.tasa), agg.secundaria.tasa > 3.5 ? 'Zona de Alta Alerta' : 'Superior a Primaria'],
          ['Total Departamental', formatNumber(agg.totalDesertores), formatNumber(agg.totalMatricula), formatPercent(agg.tasaGlobal), `${agg.distritosCount} distritos analizados`]
        ]
      },
      action: {
        label: `Filtrar departamento de ${foundDept}`,
        filter: {
          departamento: foundDept
        }
      }
    };
  }

  // 5. Query about "mayor tasa", "departamento con mayor tasa", "mas critica", "selva"
  if (norm.includes('mayor tasa') || norm.includes('mas alta') || norm.includes('peor') || norm.includes('critica')) {
    const deptAggs = allDepts.map(d => {
      const recs = allRecords.filter(r => r.departamento === d);
      return calculateAggregates(recs, d, 'departamento');
    }).sort((a, b) => b.secundaria.tasa - a.secundaria.tasa);

    const topDept = deptAggs[0];
    const secondDept = deptAggs[1];

    const rows = deptAggs.slice(0, 5).map((d, i) => [
      `#${i + 1} ${d.scopeName}`,
      `${formatNumber(d.primaria.desertores)} (${formatPercent(d.primaria.tasa)})`,
      `${formatNumber(d.secundaria.desertores)} (${formatPercent(d.secundaria.tasa)})`,
      `+${formatPercent(d.brechaTasa)}`,
      formatPercent(d.tasaGlobal)
    ]);

    return {
      sender: 'assistant',
      text: `El departamento con la mayor tasa de deserción en Educación Secundaria es **${topDept.scopeName}** con un dramático **${formatPercent(topDept.secundaria.tasa)}** (${formatNumber(topDept.secundaria.desertores)} desertores), seguido por **${secondDept.scopeName}** (${formatPercent(secondDept.secundaria.tasa)}). Los departamentos de la cuenca amazónica y zonas rurales dispersas enfrentan barreras geográficas y de conectividad que disparan la desescolarización adolescente.`,
      tableData: {
        headers: ['Departamento', 'Primaria (Des. / %)', 'Secundaria (Des. / %)', 'Brecha Secundaria', 'Tasa Global'],
        rows
      },
      action: {
        label: `Inspeccionar ${topDept.scopeName} en explorador`,
        filter: {
          departamento: topDept.scopeName
        }
      }
    };
  }

  // 6. Default / National Macro Overview
  const natAgg = calculateAggregates(allRecords, 'Nacional', 'nacional');
  return {
    sender: 'assistant',
    text: `Resumen de Métricas Oficiales a Nivel Nacional (Periodo 2023-2024): En el Perú, se registraron **136,745 estudiantes desertores** en la educación básica regular. En Primaria, la tasa nacional fue de **1.73%** (64,463 desertores sobre 3,721,852 alumnos). En Secundaria, la deserción se elevó a **2.54%** (72,282 desertores sobre 2,842,831 alumnos), lo que significa una **brecha de riesgo de +0.81 puntos porcentuales**, evidenciando la fragilidad del paso entre ciclos educativos.`,
    tableData: {
      headers: ['Nivel Educativo', 'Estudiantes Desertores', 'Matrícula Censal (Denominador)', 'Tasa Nacional (%)', 'Brecha de Riesgo'],
      rows: [
        ['Educación Primaria', formatNumber(natAgg.primaria.desertores), formatNumber(natAgg.primaria.denominador), '1.73%', 'Línea de base'],
        ['Educación Secundaria', formatNumber(natAgg.secundaria.desertores), formatNumber(natAgg.secundaria.denominador), '2.54%', '+0.81% (Mayor vulnerabilidad)'],
        ['Total Nacional Consolidado', formatNumber(natAgg.totalDesertores), formatNumber(natAgg.totalMatricula), `${natAgg.tasaGlobal.toFixed(2)}%`, '237 distritos clave evaluados']
      ]
    },
    action: {
      label: 'Ver Ficha Ejecutiva Nacional',
      filter: {
        departamento: '',
        provincia: '',
        distrito: ''
      }
    }
  };
}
