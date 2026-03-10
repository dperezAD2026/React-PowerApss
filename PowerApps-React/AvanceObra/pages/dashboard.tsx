import React from 'react';
import { useEtapas, useCasas } from '../lib/dataverse';
import { BarraAvance } from '../components/ui/barra-avance';
import { ESTADO_STYLES } from '../store/data';

export default function DashboardPage() {
  const etapasQ = useEtapas();
  const casasQ  = useCasas();
  const etapas  = etapasQ.data ?? [];
  const casas   = casasQ.data  ?? [];

  const total       = casas.length;
  const completadas = casas.filter(c => c.estado === 'Completado').length;
  const retrasadas  = casas.filter(c => c.estado === 'Retrasado').length;
  const enProceso   = casas.filter(c => c.estado === 'En proceso').length;
  const pctGlobal   = total > 0 ? Math.round(casas.reduce((a, c) => a + (c.avance ?? 0), 0) / total) : 0;

  const stats = [
    { label: 'Total casas',    value: total,       color: '#0047FF', icon: '🏠' },
    { label: 'Completadas',    value: completadas, color: '#ADD010', icon: '✅' },
    { label: 'En proceso',     value: enProceso,   color: '#0047FF', icon: '🔨' },
    { label: 'Retrasadas',     value: retrasadas,  color: '#ef4444', icon: '⚠' },
    { label: 'Avance global',  value: `${pctGlobal}%`, color: '#5a7400', icon: '📊' },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, background: '#f5f7f5' }}>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: '#ffffff', border: `1px solid ${s.color}25`, borderRadius: 14,
            padding: '16px 20px', minWidth: 140, flex: 1,
            boxShadow: '0 1px 4px #00000010',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Por estado */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 22px', boxShadow: '0 1px 4px #00000010' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2535', marginBottom: 14 }}>Distribución por estado</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(ESTADO_STYLES).map(([estado, s]) => {
            const count = casas.filter(c => c.estado === estado).length;
            return (
              <div key={estado} style={{
                flex: 1, minWidth: 110, background: s.bg,
                border: `1px solid ${s.border}`, borderRadius: 12, padding: '12px 14px',
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{count}</div>
                <div style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{estado}</div>
                {total > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <BarraAvance pct={Math.round((count / total) * 100)} color={s.color} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Casas por etapa */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 22px', boxShadow: '0 1px 4px #00000010' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2535', marginBottom: 14 }}>Casas por etapa</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {etapas.map(etapa => {
            const count = casas.filter(c => c.etapaId === etapa.id).length;
            if (count === 0) return null;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={etapa.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: etapa.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#1a2535', minWidth: 150, fontWeight: 600 }}>
                  {etapa.nombre}
                </span>
                <div style={{ flex: 1 }}>
                  <BarraAvance pct={pct} color={etapa.color} />
                </div>
                <span style={{ fontSize: 12, color: '#64748b', width: 28, textAlign: 'right', fontWeight: 700 }}>{count}</span>
              </div>
            );
          })}
          {etapas.length === 0 && (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>Sin datos de etapas.</div>
          )}
        </div>
      </div>

      {/* Avance promedio por etapa */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 22px', boxShadow: '0 1px 4px #00000010' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2535', marginBottom: 14 }}>Avance promedio por etapa</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {etapas.map(etapa => {
            const uf  = casas.filter(c => c.etapaId === etapa.id && c.avance != null);
            if (uf.length === 0) return null;
            const avg = Math.round(uf.reduce((a, c) => a + (c.avance ?? 0), 0) / uf.length);
            return (
              <div key={etapa.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: etapa.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#1a2535', minWidth: 150, fontWeight: 600 }}>
                  {etapa.nombre}
                </span>
                <div style={{ flex: 1 }}>
                  <BarraAvance pct={avg} color={etapa.color} />
                </div>
                <span style={{ fontSize: 12, color: '#64748b', width: 38, textAlign: 'right', fontWeight: 700 }}>{avg}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

