// ─── ENTIDADES DATAVERSE ──────────────────────────────────────────────────────

export interface DvEtapa {
  cr8f2_etapasid: string;
  cr8f2_nombreetapa: string;
  cr8f2_ordenetapa: number;
  cr8f2_categoria?: string;
  cr8f2_descripcion?: string;
  cr8f2_cantidadmax?: number;
}

export interface DvCasa {
  cr8f2_casasid: string;
  cr8f2_numerodelope?: string;
  cr8f2_modelocasa?: string;
  cr8f2_proyecto?: string;
  cr8f2_nombrevendedor?: string;
  cr8f2_nombrecomprador?: string;
  '_cr8f2_etapaactual_value'?: string;
  '_cr8f2_etapaactual_value@OData.Community.Display.V1.FormattedValue'?: string;
  cr8f2_estadogeneral?: string;
  cr8f2_observaciones?: string;
}

export interface DvAvance {
  cr8f2_avanceconstruccionid: string;
  '_cr8f2_casaid_value'?: string;
  '_cr8f2_etapaid_value'?: string;
  cr8f2_fechainicio?: string;
  cr8f2_fechafinEsperada?: string;
  cr8f2_fechacompletado?: string;
  cr8f2_porcentajeavance?: number;
  cr8f2_estado?: string;
}

// ─── TIPOS INTERNOS ───────────────────────────────────────────────────────────

export interface Etapa {
  id: string;
  nombre: string;
  orden: number;
  categoria?: string;
  color: string;
  colorSoft: string;
  maxWip?: number;
}

export interface Casa {
  id: string;
  lote: string;
  modelo?: string;
  proyecto?: string;
  vendedor?: string;
  comprador?: string;
  etapaId: string;
  estado: string;
  observaciones?: string;
  avance?: number;
  fechaInicio?: string;
  fechaFinEsperada?: string;
  fechaCompletado?: string;
}

// ─── PALETA DE COLORES ────────────────────────────────────────────────────────
const PALETTE = [
  '#ADD010','#0047FF','#f59e0b','#10b981','#f43f5e',
  '#8b5cf6','#06b6d4','#ec4899','#84cc16','#f97316',
  '#64748b','#14b8a6','#e879f9','#fb923c','#4ade80',
];

export function colorForIndex(i: number): string {
  return PALETTE[i % PALETTE.length];
}
export function colorSoftForIndex(i: number): string {
  return PALETTE[i % PALETTE.length] + '18';
}

// ─── CONVERTERS ───────────────────────────────────────────────────────────────
export function dvEtapaToEtapa(dv: DvEtapa, index: number): Etapa {
  return {
    id:        dv.cr8f2_etapasid,
    nombre:    dv.cr8f2_nombreetapa,
    orden:     dv.cr8f2_ordenetapa ?? index,
    categoria: dv.cr8f2_categoria,
    color:     colorForIndex(index),
    colorSoft: colorSoftForIndex(index),
  };
}

export function dvCasaToInternal(dv: DvCasa, avances: DvAvance[]): Casa {
  const etapaId = dv['_cr8f2_etapaactual_value'] ?? '';
  const avance  = avances.find(
    a => a['_cr8f2_casaid_value'] === dv.cr8f2_casasid &&
         a['_cr8f2_etapaid_value'] === etapaId
  );
  return {
    id:              dv.cr8f2_casasid,
    lote:            dv.cr8f2_numerodelope ?? dv.cr8f2_casasid,
    modelo:          dv.cr8f2_modelocasa,
    proyecto:        dv.cr8f2_proyecto,
    vendedor:        dv.cr8f2_nombrevendedor,
    comprador:       dv.cr8f2_nombrecomprador,
    etapaId,
    estado:          dv.cr8f2_estadogeneral ?? 'Pendiente',
    observaciones:   dv.cr8f2_observaciones,
    avance:          avance?.cr8f2_porcentajeavance,
    fechaInicio:     avance?.cr8f2_fechainicio,
    fechaFinEsperada: avance?.cr8f2_fechafinEsperada,
    fechaCompletado: avance?.cr8f2_fechacompletado,
  };
}

// ─── ESTADO VISUAL ────────────────────────────────────────────────────────────
export const ESTADO_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  'En proceso':  { bg: '#0047FF15', color: '#0047FF', border: '#0047FF40' },
  'Retrasado':   { bg: '#ef444420', color: '#ef4444', border: '#ef444440' },
  'Completado':  { bg: '#ADD01020', color: '#5a7400', border: '#ADD01060' },
  'Pendiente':   { bg: '#64748b15', color: '#64748b', border: '#64748b30' },
};

/* ─── COMPATIBILIDAD (referencias antiguas eliminadas) ─── */
export interface Etiqueta { label: string; bg: string; color: string; border: string; }

// Tipos legacy eliminados — se usan Casa/Etapa en su lugar
