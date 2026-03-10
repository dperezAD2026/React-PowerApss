import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { busquedaAtom, detalleModoAtom, seleccionadaAtom } from '../store/atoms';
import { useEtapas, useCasas } from '../lib/dataverse';
import { BarraAvance } from '../components/ui/barra-avance';
import { PanelDetalle } from '../components/kanban/panelDetalle';
import { ESTADO_STYLES } from '../store/data';

export default function ListaPage() {
  const busqueda = useAtomValue(busquedaAtom);
  const [seleccionada, setSeleccionada] = useAtom(seleccionadaAtom);
  const [, setDetalleModo] = useAtom(detalleModoAtom);

  const etapasQ = useEtapas();
  const casasQ  = useCasas();
  const etapas  = etapasQ.data ?? [];
  const casas   = casasQ.data  ?? [];

  const filtradas = busqueda.trim()
    ? casas.filter(c =>
        c.lote.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.modelo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.proyecto?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : casas;

  if (casasQ.isPending) {
    return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Cargando…</div>;
  }

  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', background: '#f5f7f5' }}>
        {etapas.map(etapa => {
          const uf  = filtradas.filter(c => c.etapaId === etapa.id);
          if (uf.length === 0) return null;
          const avg = Math.round(uf.reduce((a, c) => a + (c.avance ?? 0), 0) / uf.length);
          return (
            <div key={etapa.id} style={{ marginBottom: 24 }}>
              {/* Header etapa */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${etapa.color}30` }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: etapa.color }} />
                <span style={{ fontWeight: 700, color: '#1a2535', fontSize: 13 }}>{etapa.nombre}</span>
                <span style={{ fontSize: 11, color: etapa.color, background: `${etapa.color}18`, borderRadius: 10, padding: '0 8px', fontWeight: 700, border: `1px solid ${etapa.color}30` }}>{uf.length}</span>
                <div style={{ flex: 1, maxWidth: 120 }}>
                  <BarraAvance pct={avg} color={etapa.color}/>
                </div>
              </div>

              {/* Filas */}
              {uf.map(c => {
                const estadoStyle = ESTADO_STYLES[c.estado] ?? ESTADO_STYLES['Pendiente'];
                return (
                  <div key={c.id}
                    onClick={() => {
                      setDetalleModo('view');
                      setSeleccionada(prev => prev?.id === c.id ? null : c);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
                      background:   seleccionada?.id === c.id ? '#f0f9e8' : '#ffffff',
                      marginBottom: 4, transition: 'background .15s',
                      borderLeft:   `3px solid ${etapa.color}`,
                      boxShadow:    '0 1px 3px #00000010',
                    }}
                    onMouseEnter={e => { if (seleccionada?.id !== c.id) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={e => { if (seleccionada?.id !== c.id) e.currentTarget.style.background = '#ffffff'; }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2535', minWidth: 90 }}>{c.lote}</span>
                    {c.modelo && <span style={{ fontSize: 11, color: '#64748b', background: '#f1f5f9', borderRadius: 6, padding: '1px 8px' }}>{c.modelo}</span>}
                    {c.proyecto && <span style={{ fontSize: 11, color: '#0047FF', background: '#0047FF10', borderRadius: 6, padding: '1px 8px' }}>{c.proyecto}</span>}
                    <div style={{ flex: 1 }} />
                    <span style={{ background: estadoStyle.bg, color: estadoStyle.color, border: `1px solid ${estadoStyle.border}`, borderRadius: 10, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>
                      {c.estado}
                    </span>
                    {c.avance != null && (
                      <div style={{ width: 70 }}>
                        <BarraAvance pct={c.avance} color={etapa.color}/>
                      </div>
                    )}
                    {c.comprador && <span style={{ fontSize: 11, color: '#94a3b8' }}>👤 {c.comprador}</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
        {filtradas.length === 0 && !casasQ.isPending && (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, paddingTop: 40 }}>
            No se encontraron casas.
          </div>
        )}
      </div>

      <PanelDetalle etapas={etapas} casas={casas} />
    </>
  );
}

