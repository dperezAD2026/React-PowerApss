import React, { useCallback, useMemo } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { draggedIdAtom, seleccionadaAtom, detalleModoAtom, filtroProyectoAtom, filtroModeloAtom, filtroVendedorAtom, filtroEstadoAtom } from '../store/atoms';
import { useEtapas, useCasas, useMoverCasa } from '../lib/dataverse';
import { ColumnaKanban } from '../components/kanban/columna-kanban';
import { PanelDetalle } from '../components/kanban/panelDetalle';
import { toast } from 'sonner';

const CAT_ICONS: Record<string, string> = {
  'Freezer': '❄️', 'Obra gris': '🧱', 'Obra Gris': '🧱',
  'Acabados': '🎨', 'Instalaciones': '⚡', 'Otros': '📦', 'Cierre': '✅',
};
const CAT_COLORS: Record<string, string> = {
  'Freezer': '#06b6d4', 'Obra gris': '#f59e0b', 'Obra Gris': '#f59e0b',
  'Acabados': '#8b5cf6', 'Instalaciones': '#f97316', 'Otros': '#ec4899', 'Cierre': '#10b981',
};

export default function HomePage() {
  const [draggedId, setDraggedId]   = useAtom(draggedIdAtom);
  const setSeleccionada              = useSetAtom(seleccionadaAtom);
  const setDetalleModo               = useSetAtom(detalleModoAtom);

  const filtroProyecto  = useAtomValue(filtroProyectoAtom);
  const filtroModelo    = useAtomValue(filtroModeloAtom);
  const filtroVendedor  = useAtomValue(filtroVendedorAtom);
  const filtroEstado    = useAtomValue(filtroEstadoAtom);

  const etapasQ = useEtapas();
  const casasQ  = useCasas();
  const mover   = useMoverCasa();

  const etapas = etapasQ.data ?? [];
  const casasRaw  = casasQ.data  ?? [];

  // Aplicar filtros globales
  const casas = useMemo(() => {
    let result = casasRaw;
    if (filtroProyecto)  result = result.filter(c => c.proyecto === filtroProyecto);
    if (filtroModelo)    result = result.filter(c => c.modelo === filtroModelo);
    if (filtroVendedor)  result = result.filter(c => c.vendedor === filtroVendedor);
    if (filtroEstado)    result = result.filter(c => c.estado === filtroEstado);
    return result;
  }, [casasRaw, filtroProyecto, filtroModelo, filtroVendedor, filtroEstado]);

  const handleDragStart = useCallback((id: string) => setDraggedId(id), [setDraggedId]);
  const handleDragEnd   = useCallback(() => setDraggedId(null), [setDraggedId]);

  const handleDrop = useCallback((etapaId: string, insertIndex?: number) => {
    if (!draggedId) return;
    mover.mutate(
      { casaId: draggedId, etapaId, insertIndex },
      {
        onSuccess: () => {
          setSeleccionada(prev =>
            prev?.id === draggedId ? { ...prev, etapaId } : prev
          );
          toast.success('Casa movida correctamente');
        },
        onError: () => toast.error('Error al mover la casa'),
      }
    );
    setDraggedId(null);
  }, [draggedId, mover, setDraggedId, setSeleccionada]);

  // Agrupar etapas por categoría (siempre se evalúa para mantener orden estable de hooks)
  const grupos = useMemo(() => {
    const map = new Map<string, typeof etapas>();
    for (const e of etapas) {
      const cat = e.categoria || 'Sin categoría';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(e);
    }
    return Array.from(map.entries());
  }, [etapas]);

  // ─── Loading / Error ─────────────────────────────────────────────────────────
  if (etapasQ.isPending || casasQ.isPending) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: '#64748b' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#ADD010', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: 13 }}>Cargando datos…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (etapasQ.isError) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: 14 }}>
        Error al cargar etapas: {String(etapasQ.error)}
      </div>
    );
  }

  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '10px 16px 14px', background: '#f5f7f5' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
          <button
            onClick={() => {
              setDetalleModo('create');
              setSeleccionada(null);
            }}
            style={{
              background: '#ADD010', border: 'none', borderRadius: 10,
              padding: '8px 14px', color: '#1a2535', fontSize: 12,
              fontWeight: 800, cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#96b80e')}
            onMouseLeave={e => (e.currentTarget.style.background = '#ADD010')}
          >
            + Nueva Obra
          </button>
        </div>

        {/* Todas las categorías lado a lado — scroll horizontal único */}
        <div style={{ flex: 1, display: 'flex', gap: 6, overflowX: 'auto', overflowY: 'auto', alignItems: 'flex-start', paddingBottom: 8 }}>
          {grupos.map(([categoria, etapasGrupo]) => {
            const catColor = CAT_COLORS[categoria] ?? '#64748b';
            const catIcon  = CAT_ICONS[categoria]  ?? '📋';
            return (
              <div key={categoria} style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                {/* Header de categoría */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px', marginBottom: 8,
                  background: `${catColor}12`, border: `1px solid ${catColor}30`,
                  borderRadius: 10,
                }}>
                  <span style={{ fontSize: 14 }}>{catIcon}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: catColor, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                    {categoria}
                  </span>
                  <span style={{ fontSize: 11, color: `${catColor}99`, fontWeight: 600 }}>
                    ({etapasGrupo.length} etapa{etapasGrupo.length !== 1 ? 's' : ''})
                  </span>
                </div>

                {/* Columnas del grupo en fila */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  {etapasGrupo.map(etapa => (
                    <ColumnaKanban
                      key={etapa.id}
                      etapa={etapa}
                      casas={casas.filter(c => c.etapaId === etapa.id)}
                      draggedId={draggedId}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDrop={handleDrop}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          {etapas.length === 0 && !etapasQ.isPending && (
            <div style={{ flex: 1, textAlign: 'center', color: '#94a3b8', fontSize: 14, paddingTop: 40 }}>
              No hay etapas configuradas en Dataverse.
            </div>
          )}
        </div>
      </div>

      <PanelDetalle etapas={etapas} casas={casas} />
    </>
  );
}

