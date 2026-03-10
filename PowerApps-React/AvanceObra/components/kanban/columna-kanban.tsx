import React, { useState, useCallback, useRef } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { busquedaAtom, wipLimitsAtom } from '../../store/atoms';
import type { Etapa, Casa } from '../../store/data';
import { TarjetaCasa } from './tarjeta-unidad';
import { BarraAvance } from '../ui/barra-avance';

export const ColumnaKanban: React.FC<{
  etapa: Etapa;
  casas: Casa[];
  draggedId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (etapaId: string, insertIndex?: number) => void;
}> = ({ etapa, casas, draggedId, onDragStart, onDragEnd, onDrop }) => {
  const busqueda = useAtomValue(busquedaAtom);
  const [wipLimits, setWipLimits] = useAtom(wipLimitsAtom);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [editingWip, setEditingWip] = useState(false);
  const [wipInput, setWipInput] = useState('');
  const cardsRef = useRef<HTMLDivElement>(null);

  const maxWip = wipLimits[etapa.id] ?? etapa.maxWip;

  const filtradas = busqueda.trim()
    ? casas.filter(c =>
        c.lote.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.modelo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.proyecto?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : casas;

  const count = filtradas.length;
  const isOverWip = maxWip != null && count > maxWip;

  const pctAvg = count > 0
    ? Math.round(filtradas.reduce((acc, c) => acc + (c.avance ?? 0), 0) / count)
    : 0;

  // ─── Calcular la posición exacta del drop ─────────────────────────────────
  const calcDropIndex = useCallback((e: React.DragEvent) => {
    if (!cardsRef.current) return filtradas.length;
    const cards = Array.from(cardsRef.current.children).filter(
      el => !(el as HTMLElement).dataset.dropIndicator
    );
    for (let i = 0; i < cards.length; i++) {
      const rect = cards[i].getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (e.clientY < mid) return i;
    }
    return cards.length;
  }, [filtradas.length]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
    setDropIndex(calcDropIndex(e));
  }, [calcDropIndex]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setDropIndex(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const idx = calcDropIndex(e);
    setIsDragOver(false);
    setDropIndex(null);
    onDrop(etapa.id, idx);
  }, [etapa.id, onDrop, calcDropIndex]);

  // ─── WIP limit edit ───────────────────────────────────────────────────────
  function handleWipClick() {
    setWipInput(maxWip != null ? String(maxWip) : '');
    setEditingWip(true);
  }

  function handleWipSave() {
    const val = wipInput.trim();
    if (val === '' || val === '0') {
      setWipLimits(prev => { const next = { ...prev }; delete next[etapa.id]; return next; });
    } else {
      const n = parseInt(val, 10);
      if (!isNaN(n) && n > 0) {
        setWipLimits(prev => ({ ...prev, [etapa.id]: n }));
      }
    }
    setEditingWip(false);
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        width: 268, flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        background: isDragOver
          ? `linear-gradient(180deg, ${etapa.colorSoft}, ${etapa.color}08)`
          : '#f8fafc',
        borderRadius: 14,
        border: isDragOver
          ? `2.5px solid ${etapa.color}80`
          : isOverWip
            ? '2px solid #ef444440'
            : '2px solid #e2e8f0',
        transition:   'background .2s, border .2s, box-shadow .2s',
        paddingBottom: 8,
        boxShadow: isDragOver ? `0 0 20px ${etapa.color}25` : 'none',
      }}
    >
      {/* Header */}
      <div style={{
        padding:      '10px 12px 8px',
        borderBottom: `1px solid ${etapa.color}25`,
        background:   `linear-gradient(180deg, ${etapa.colorSoft}, transparent)`,
        borderRadius: '12px 12px 0 0',
        marginBottom: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: count > 0 ? 6 : 0 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: etapa.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1a2535', flex: 1 }}>{etapa.nombre}</span>

          {/* WIP counter / editor */}
          {editingWip ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <input
                autoFocus
                value={wipInput}
                onChange={e => setWipInput(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => { if (e.key === 'Enter') handleWipSave(); if (e.key === 'Escape') setEditingWip(false); }}
                onBlur={handleWipSave}
                placeholder="∞"
                style={{
                  width: 32, textAlign: 'center', fontSize: 11, fontWeight: 700,
                  border: `1.5px solid ${etapa.color}60`, borderRadius: 6,
                  outline: 'none', padding: '1px 2px',
                  background: '#fff', color: etapa.color,
                }}
              />
            </div>
          ) : (
            <span
              onClick={handleWipClick}
              title="Clic para editar límite WIP"
              style={{
                background: isOverWip ? '#ef444420' : `${etapa.color}22`,
                color: isOverWip ? '#ef4444' : etapa.color,
                borderRadius: 12, padding: '1px 8px',
                fontSize: 11, fontWeight: 700,
                border: `1px solid ${isOverWip ? '#ef444440' : etapa.color + '30'}`,
                cursor: 'pointer',
                transition: 'all .2s',
              }}
            >
              {count}{maxWip != null ? ` / ${maxWip}` : ''}
            </span>
          )}

          {isDragOver && draggedId && (
            <span style={{ fontSize: 10, color: etapa.color, fontWeight: 600, animation: 'pulse 0.8s ease infinite' }}>↓ Soltar</span>
          )}
        </div>
        {count > 0 && <BarraAvance pct={pctAvg} color={isOverWip ? '#ef4444' : etapa.color} />}
        {isOverWip && (
          <div style={{ fontSize: 10, color: '#ef4444', marginTop: 3, fontWeight: 600 }}>
            ⚠ Sobre capacidad — obras en cola no editables
          </div>
        )}
      </div>

      {/* Cards */}
      <div ref={cardsRef} style={{ flex: 1, overflowY: 'auto', padding: '0 8px', maxHeight: 'calc(100vh - 240px)', minHeight: 60 }}>
        {filtradas.map((casa, i) => {
          const enCola = maxWip != null && i >= maxWip;
          return (
            <React.Fragment key={casa.id}>
              {/* Drop indicator BEFORE this card */}
              {isDragOver && draggedId && dropIndex === i && (
                <div data-drop-indicator="true" style={{
                  height: 4, borderRadius: 4, margin: '4px 0',
                  background: `linear-gradient(90deg, ${etapa.color}, ${etapa.color}60)`,
                  boxShadow: `0 0 8px ${etapa.color}40`,
                  transition: 'all .15s',
                }} />
              )}
              <TarjetaCasa
                casa={casa}
                etapa={etapa}
                isDragging={draggedId === casa.id}
                enCola={enCola}
                onDragStart={(e) => { e.dataTransfer.setData('text/plain', casa.id); e.dataTransfer.effectAllowed = 'move'; onDragStart(casa.id); }}
                onDragEnd={onDragEnd}
              />
            </React.Fragment>
          );
        })}
        {/* Drop indicator at the END */}
        {isDragOver && draggedId && dropIndex === filtradas.length && (
          <div data-drop-indicator="true" style={{
            height: 4, borderRadius: 4, margin: '4px 0',
            background: `linear-gradient(90deg, ${etapa.color}, ${etapa.color}60)`,
            boxShadow: `0 0 8px ${etapa.color}40`,
            transition: 'all .15s',
          }} />
        )}
        {count === 0 && (
          <div style={{
            border:     `1.5px dashed ${isDragOver ? etapa.color : '#cbd5e1'}`,
            borderRadius: 10, padding: 16, textAlign: 'center',
            color:      isDragOver ? etapa.color : '#94a3b8',
            fontSize:   12, transition: 'all .2s', margin: '4px 0',
            background: isDragOver ? `${etapa.color}08` : 'transparent',
          }}>
            {isDragOver ? '↓ Soltar aquí' : 'Sin obras'}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
};

