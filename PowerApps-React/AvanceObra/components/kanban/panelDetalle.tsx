import React, { useEffect, useMemo, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { detalleModoAtom, seleccionadaAtom, wipLimitsAtom } from '../../store/atoms';
import { BarraAvance } from '../ui/barra-avance';
import { ESTADO_STYLES } from '../../store/data';
import type { Etapa, Casa } from '../../store/data';
import { useActualizarCasa, useCompletarCasa, useCrearCasa, useMoverCasa } from '../../lib/dataverse';
import { toast } from 'sonner';

interface CasaForm {
  lote: string;
  modelo: string;
  proyecto: string;
  comprador: string;
  vendedor: string;
  etapaId: string;
  estado: string;
  avance: string;
  fechaInicio: string;
  fechaFinEsperada: string;
  fechaCompletado: string;
  observaciones: string;
}

const EMPTY_FORM: CasaForm = {
  lote: '',
  modelo: '',
  proyecto: '',
  comprador: '',
  vendedor: '',
  etapaId: '',
  estado: 'Pendiente',
  avance: '',
  fechaInicio: '',
  fechaFinEsperada: '',
  fechaCompletado: '',
  observaciones: '',
};

function casaToForm(casa: Casa): CasaForm {
  return {
    lote: casa.lote ?? '',
    modelo: casa.modelo ?? '',
    proyecto: casa.proyecto ?? '',
    comprador: casa.comprador ?? '',
    vendedor: casa.vendedor ?? '',
    etapaId: casa.etapaId ?? '',
    estado: casa.estado ?? 'Pendiente',
    avance: casa.avance != null ? String(casa.avance) : '',
    fechaInicio: casa.fechaInicio?.slice(0, 10) ?? '',
    fechaFinEsperada: casa.fechaFinEsperada?.slice(0, 10) ?? '',
    fechaCompletado: casa.fechaCompletado?.slice(0, 10) ?? '',
    observaciones: casa.observaciones ?? '',
  };
}

function toCasaPatch(form: CasaForm): Partial<Casa> {
  const avanceNumber = form.avance.trim() === '' ? undefined : Number(form.avance);
  const estado = form.estado || 'Pendiente';
  const fechaCompletado = estado === 'Completado'
    ? (form.fechaCompletado || new Date().toISOString().slice(0, 10))
    : undefined;

  return {
    lote: form.lote.trim(),
    modelo: form.modelo.trim() || undefined,
    proyecto: form.proyecto.trim() || undefined,
    comprador: form.comprador.trim() || undefined,
    vendedor: form.vendedor.trim() || undefined,
    etapaId: form.etapaId,
    estado,
    avance: Number.isFinite(avanceNumber) ? Math.max(0, Math.min(100, avanceNumber as number)) : undefined,
    fechaInicio: form.fechaInicio || undefined,
    fechaFinEsperada: form.fechaFinEsperada || undefined,
    fechaCompletado,
    observaciones: form.observaciones.trim() || undefined,
  };
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '.4px',
  fontWeight: 600,
  marginBottom: 4,
};

const baseControlStyle: React.CSSProperties = {
  width: '100%',
  fontSize: 13,
  color: '#334155',
  border: '1px solid #dbe3ed',
  borderRadius: 8,
  padding: '7px 9px',
  boxSizing: 'border-box',
  outline: 'none',
  background: '#ffffff',
  fontFamily: "'Segoe UI', system-ui, sans-serif",
};

const ESTADOS = Object.keys(ESTADO_STYLES);

export const PanelDetalle: React.FC<{ etapas?: Etapa[]; casas?: Casa[] }> = ({ etapas = [], casas = [] }) => {
  const [seleccionada, setSeleccionada] = useAtom(seleccionadaAtom);
  const [detalleModo, setDetalleModo] = useAtom(detalleModoAtom);
  const mover = useMoverCasa();
  const completar = useCompletarCasa();
  const actualizar = useActualizarCasa();
  const crear = useCrearCasa();
  const wipLimits = useAtomValue(wipLimitsAtom);
  const [form, setForm] = useState<CasaForm>(EMPTY_FORM);

  const creando = detalleModo === 'create';
  const abierta = creando || !!seleccionada;

  const etapaDefaultId = useMemo(() => {
    const sorted = [...etapas].sort((a, b) => a.orden - b.orden);
    return sorted[0]?.id ?? '';
  }, [etapas]);

  useEffect(() => {
    if (!abierta) return;
    if (creando) {
      setForm({ ...EMPTY_FORM, etapaId: etapaDefaultId });
      return;
    }
    if (seleccionada) {
      setForm(casaToForm(seleccionada));
    }
  }, [abierta, creando, seleccionada, etapaDefaultId]);

  if (!abierta) return null;

  const c = seleccionada;
  const etapa = etapas.find(e => e.id === form.etapaId || e.id === c?.etapaId);
  const accent = etapa?.color ?? '#ADD010';
  const estadoStyle = ESTADO_STYLES[form.estado] ?? ESTADO_STYLES['Pendiente'];

  const maxWip = c && etapa ? (wipLimits[etapa.id] ?? etapa.maxWip) : undefined;
  const casasEnEtapa = c ? casas.filter(ca => ca.etapaId === c.etapaId) : [];
  const cardIndex = c ? casasEnEtapa.findIndex(ca => ca.id === c.id) : -1;
  const enCola = c ? (maxWip != null && cardIndex >= maxWip) : false;
  const disableForm = enCola;

  function handleCerrar() {
    setSeleccionada(null);
    setDetalleModo('view');
  }

  function onField<K extends keyof CasaForm>(key: K, value: CasaForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleCompletar() {
    if (!c) return;
    if (c.estado === 'Completado') {
      toast.info('Esta casa ya esta completada');
      return;
    }
    completar.mutate(c.id, {
      onSuccess: () => {
        toast.success(`Casa ${c.lote} marcada como completada`);
        handleCerrar();
      },
      onError: () => toast.error('Error al completar la casa'),
    });
  }

  function handleMover(etapaId: string) {
    if (!c) return;
    mover.mutate(
      { casaId: c.id, etapaId },
      {
        onSuccess: () => {
          toast.success(`Casa ${c.lote} movida a nueva etapa`);
          handleCerrar();
        },
        onError: () => toast.error('Error al mover la casa'),
      }
    );
  }

  function handleGuardar() {
    if (!form.lote.trim()) {
      toast.error('El lote es obligatorio');
      return;
    }

    const targetEtapaId = form.etapaId || etapaDefaultId;
    if (!targetEtapaId) {
      toast.error('Debe existir al menos una etapa para guardar la obra');
      return;
    }

    const payload = toCasaPatch({ ...form, etapaId: targetEtapaId });

    if (creando) {
      crear.mutate(payload as Omit<Casa, 'id'>, {
        onSuccess: () => {
          toast.success('Nueva obra creada');
          handleCerrar();
        },
        onError: () => toast.error('Error al crear la obra'),
      });
      return;
    }

    if (!c) return;
    actualizar.mutate(
      { casaId: c.id, cambios: payload },
      {
        onSuccess: () => {
          toast.success('Obra actualizada');
          setSeleccionada(prev => (prev ? { ...prev, ...payload } as Casa : null));
        },
        onError: () => toast.error('Error al guardar cambios'),
      }
    );
  }

  const guardando = crear.isPending || actualizar.isPending;

  return (
    <div style={{
      width: 400,
      background: '#ffffff',
      borderLeft: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: `linear-gradient(135deg, ${accent}12, #ffffff)`,
      }}>
        <div style={{ width: 5, height: 22, borderRadius: 3, background: accent, flexShrink: 0 }} />
        <span style={{ fontSize: 18, fontWeight: 800, color: '#1a2535', flex: 1 }}>
          {creando ? 'Nueva obra' : (c?.lote ?? 'Detalle de obra')}
        </span>
        <span style={{
          background: estadoStyle.bg,
          color: estadoStyle.color,
          border: `1px solid ${estadoStyle.border}`,
          borderRadius: 10,
          padding: '2px 10px',
          fontSize: 11,
          fontWeight: 700,
        }}>{form.estado}</span>
        <button
          onClick={handleCerrar}
          style={{ background: '#f1f5f9', border: 'none', borderRadius: 7, padding: '5px 10px', color: '#64748b', fontSize: 13, cursor: 'pointer', lineHeight: 1 }}
        >✕</button>
      </div>

      <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}40, transparent)` }} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 8px' }}>
        {etapa && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, background: etapa.colorSoft, border: `1px solid ${accent}30`, borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: accent, flex: 1 }}>{etapa.nombre}</span>
            {form.avance !== '' && <BarraAvance pct={Number(form.avance)} color={accent} />}
          </div>
        )}

        {enCola && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 10,
            padding: '8px 12px',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ fontSize: 14 }}>🔒</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>En cola - sobre capacidad</div>
              <div style={{ fontSize: 11, color: '#b91c1c' }}>Mueva una obra de esta etapa para habilitar edicion.</div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={labelStyle}>Lote</div>
            <input value={form.lote} disabled={disableForm} onChange={e => onField('lote', e.target.value)} style={baseControlStyle} />
          </div>

          <div>
            <div style={labelStyle}>Modelo</div>
            <input value={form.modelo} disabled={disableForm} onChange={e => onField('modelo', e.target.value)} style={baseControlStyle} />
          </div>

          <div>
            <div style={labelStyle}>Proyecto</div>
            <input value={form.proyecto} disabled={disableForm} onChange={e => onField('proyecto', e.target.value)} style={baseControlStyle} />
          </div>

          <div>
            <div style={labelStyle}>Comprador</div>
            <input value={form.comprador} disabled={disableForm} onChange={e => onField('comprador', e.target.value)} style={baseControlStyle} />
          </div>

          <div>
            <div style={labelStyle}>Vendedor</div>
            <input value={form.vendedor} disabled={disableForm} onChange={e => onField('vendedor', e.target.value)} style={baseControlStyle} />
          </div>

          <div>
            <div style={labelStyle}>Etapa</div>
            <select value={form.etapaId} disabled={disableForm} onChange={e => onField('etapaId', e.target.value)} style={baseControlStyle}>
              {etapas
                .slice()
                .sort((a, b) => a.orden - b.orden)
                .map(e => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
            </select>
          </div>

          <div>
            <div style={labelStyle}>Estado</div>
            <select value={form.estado} disabled={disableForm} onChange={e => onField('estado', e.target.value)} style={baseControlStyle}>
              {ESTADOS.map(es => <option key={es} value={es}>{es}</option>)}
            </select>
          </div>

          <div>
            <div style={labelStyle}>Avance (%)</div>
            <input
              type="number"
              min={0}
              max={100}
              value={form.avance}
              disabled={disableForm}
              onChange={e => onField('avance', e.target.value)}
              style={baseControlStyle}
            />
          </div>

          <div>
            <div style={labelStyle}>Fecha inicio</div>
            <input type="date" value={form.fechaInicio} disabled={disableForm} onChange={e => onField('fechaInicio', e.target.value)} style={baseControlStyle} />
          </div>

          <div>
            <div style={labelStyle}>Fecha estimada</div>
            <input type="date" value={form.fechaFinEsperada} disabled={disableForm} onChange={e => onField('fechaFinEsperada', e.target.value)} style={baseControlStyle} />
          </div>

          <div>
            <div style={labelStyle}>Fecha completado</div>
            <input type="date" value={form.fechaCompletado} disabled={disableForm || form.estado !== 'Completado'} onChange={e => onField('fechaCompletado', e.target.value)} style={baseControlStyle} />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <div style={labelStyle}>Observaciones</div>
            <textarea
              value={form.observaciones}
              disabled={disableForm}
              onChange={e => onField('observaciones', e.target.value)}
              rows={4}
              style={{ ...baseControlStyle, resize: 'vertical', lineHeight: 1.45 }}
            />
          </div>
        </div>

        {!creando && c && etapas.length > 1 && (
          <>
            <div style={{ height: 1, background: '#e2e8f0', margin: '14px 0 12px' }} />
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.4px', fontWeight: 600, marginBottom: 8 }}>
              Mover a etapa
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {etapas
                .filter(e => e.id !== c.etapaId)
                .sort((a, b) => a.orden - b.orden)
                .map(e => (
                  <button
                    key={e.id}
                    disabled={mover.isPending}
                    onClick={() => handleMover(e.id)}
                    style={{
                      background: `${e.color}15`,
                      border: `1px solid ${e.color}40`,
                      borderRadius: 8,
                      padding: '4px 12px',
                      color: e.color,
                      fontSize: 11,
                      cursor: 'pointer',
                      fontWeight: 600,
                      opacity: mover.isPending ? 0.6 : 1,
                    }}
                  >
                    {e.nombre}
                  </button>
                ))}
            </div>
          </>
        )}
      </div>

      <div style={{ borderTop: '1px solid #e2e8f0', padding: '10px 16px', background: '#f8fafc', display: 'flex', gap: 8 }}>
        {!creando && c && (
          <button
            onClick={handleCompletar}
            disabled={completar.isPending || c.estado === 'Completado' || enCola}
            title={enCola ? 'Casa en cola - mueva una obra para habilitar' : undefined}
            style={{
              background: enCola ? '#e2e8f0' : c.estado === 'Completado' ? '#e2e8f0' : '#ADD010',
              border: 'none',
              borderRadius: 9,
              padding: '8px 12px',
              color: enCola || c.estado === 'Completado' ? '#94a3b8' : '#fff',
              fontSize: 12,
              fontWeight: 700,
              cursor: enCola || c.estado === 'Completado' ? 'not-allowed' : 'pointer',
              opacity: completar.isPending ? 0.6 : 1,
            }}
          >
            {completar.isPending ? 'Completando...' : c.estado === 'Completado' ? 'Completada' : 'Completar'}
          </button>
        )}

        <button
          onClick={handleGuardar}
          disabled={guardando || disableForm}
          style={{
            flex: 1,
            background: '#1a2535',
            border: 'none',
            borderRadius: 9,
            padding: '8px 0',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            cursor: guardando || disableForm ? 'not-allowed' : 'pointer',
            opacity: guardando || disableForm ? 0.6 : 1,
          }}
        >
          {guardando ? 'Guardando...' : creando ? 'Crear obra' : 'Guardar cambios'}
        </button>

        <button
          onClick={handleCerrar}
          style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 9, padding: '8px 14px', color: '#64748b', fontSize: 12, cursor: 'pointer' }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
