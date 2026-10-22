export interface DistrictRecord {
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  primaria: {
    desertor: number;
    denominador: number;
    tasa: number;
  };
  secundaria: {
    desertor: number;
    denominador: number;
    tasa: number;
  };
  brecha_tasa: number;
}

export interface AggregatedMetrics {
  scopeName: string;
  scopeType: 'nacional' | 'departamento' | 'provincia' | 'distrito';
  distritosCount: number;
  primaria: {
    desertores: number;
    denominador: number;
    tasa: number;
  };
  secundaria: {
    desertores: number;
    denominador: number;
    tasa: number;
  };
  brechaTasa: number;
  totalDesertores: number;
  totalMatricula: number;
  tasaGlobal: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  tableData?: {
    headers: string[];
    rows: (string | number)[][];
  };
  action?: {
    label: string;
    filter?: {
      departamento?: string;
      provincia?: string;
      distrito?: string;
    };
  };
  timestamp: string;
}
