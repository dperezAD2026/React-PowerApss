import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { detalleModoAtom, seleccionadaAtom } from '../../store/atoms';
import type { Casa, Etapa } from '../../store/data';
import { ESTADO_STYLES } from '../../store/data';
import { BarraAvance } from '../ui/barra-avance';

export const TarjetaCasa: React.FC<{
  casa: Casa;
  etapa: Etapa;
  isDragging: boolean;
  enCola?: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}> = ({ casa, etapa, isDragging, enCola, onDragStart, onDragEnd }) => {
  const [hov, setHov] = useState(false);
  const [seleccionada, setSeleccionada] = useAtom(seleccionadaAtom);
  const activa = seleccionada?.id === casa.id;
  const estadoStyle = ESTADO_STYLES[casa.estado] ?? ESTADO_STYLES['Pendiente'];
  const [, setDetalleModo] = useAtom(detalleModoAtom);

  return (
    <div
      draggable
      onClick={() => {
        if (enCola) return;
        setDetalleModo('view');
        setSeleccionada(prev => prev?.id === casa.id ? null : casa);
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        background:   enCola ? '#f8f8f8' : activa ? '#f0f9e8' : hov ? '#f8fafc' : '#ffffff',
        borderRadius: 10,
        padding:      '12px 12px 10px',
        cursor:       enCola ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
        marginBottom: 8,
        transition:   'background .15s, box-shadow .15s, opacity .2s, transform .15s',
        boxShadow:    enCola
          ? 'none'
          : hov || activa
            ? `0 4px 16px #00000018, 0 0 0 1.5px ${etapa.color}60`
            : '0 1px 4px #00000012',
        userSelect:   'none',
        opacity:      enCola ? 0.5 : isDragging ? 0.45 : 1,
        transform:    isDragging ? 'scale(0.97) rotate(-1deg)' : 'none',
        borderLeft:   `3px solid ${enCola ? '#cbd5e1' : etapa.color}`,
        border:       activa && !enCola ? `1.5px solid ${etapa.color}` : undefined,
        borderLeftWidth: '3px',
        filter:       enCola ? 'grayscale(0.6)' : 'none',
        position:     'relative',
      }}
    >
      {enCola && (
        <div style={{
          position: 'absolute', top: 5, right: 6,
          background: '#ef444425', color: '#ef4444',
          borderRadius: 8, padding: '1px 7px',
          fontSize: 9, fontWeight: 700,
          border: '1px solid #ef444430',
        }}>EN COLA</div>
      )}
      {/* Lote + estado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#1a2535', letterSpacing: '.2px', flex: 1 }}>
          {casa.lote}
        </span>
        <span style={{
          background: estadoStyle.bg,
          color:      estadoStyle.color,
          border:     `1px solid ${estadoStyle.border}`,
          borderRadius: 10, padding: '1px 8px',
          fontSize: 10, fontWeight: 700,
        }}>
          {casa.estado}
        </span>
      </div>

      {/* Modelo / Proyecto */}
      {(casa.modelo || casa.proyecto) && (
        <div style={{ marginBottom: 7 }}>
          {casa.modelo && (
            <span style={{ fontSize: 11, color: '#475569', background: '#f1f5f9', borderRadius: 6, padding: '1px 7px', marginRight: 4 }}>
              {casa.modelo}
            </span>
          )}
          {casa.proyecto && (
            <span style={{ fontSize: 11, color: '#0047FF', background: '#0047FF12', borderRadius: 6, padding: '1px 7px' }}>
              {casa.proyecto}
            </span>
          )}
        </div>
      )}

      {/* Barra de avance */}
      {casa.avance != null && (
        <div style={{ marginBottom: 6 }}>
          <BarraAvance pct={casa.avance} color={etapa.color} />
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        {casa.comprador ? (
          <span style={{ fontSize: 11, color: '#64748b', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            👤 {casa.comprador}
          </span>
        ) : (
          <span style={{ flex: 1 }} />
        )}
        {casa.fechaFinEsperada && (
          <span style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap' }}>
            📅 {casa.fechaFinEsperada.slice(0, 10)}
          </span>
        )}
      </div>
    </div>
  );
};

// alias backward-compat
export const TarjetaUnidad = TarjetaCasa;

