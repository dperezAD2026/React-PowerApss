import React, { useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';
import { useQueryClient } from '@tanstack/react-query';
import { busquedaAtom, draggedIdAtom, filtroProyectoAtom, filtroModeloAtom, filtroVendedorAtom, filtroEstadoAtom } from '../store/atoms';
import { useEtapas, useCasas, limpiarCambiosLocales } from '../lib/dataverse';
import { toast } from 'sonner';
import { detalleModoAtom, seleccionadaAtom } from '../store/atoms';

export interface LayoutProps {
  w?: number;
  h?: number;
  unidadesJSON?: string;
}

const TABS = [
  { label: 'Tablero',   path: '/'          },
  { label: 'Lista',     path: '/lista'      },
  { label: 'Dashboard', path: '/dashboard'  },
] as const;

const STAT_ITEMS = [
  { key: 'total',       label: 'Total Casas',  icon: '🏠', color: '#1a2535' },
  { key: 'enProceso',   label: 'En Proceso',   icon: '⏱',  color: '#0ea5e9' },
  { key: 'retrasadas',  label: 'Retrasadas',   icon: '⚠',  color: '#ef4444' },
  { key: 'completadas', label: 'Completadas',  icon: '✅', color: '#22c55e' },
  { key: 'pendientes',  label: 'Pendientes',   icon: '📋', color: '#64748b' },
] as const;

export default function Layout({ w, h }: LayoutProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const qc        = useQueryClient();

  const [busqueda, setBusqueda] = useAtom(busquedaAtom);
  const draggedId = useAtomValue(draggedIdAtom);
  const [, setDetalleModo] = useAtom(detalleModoAtom);
  const [, setSeleccionada] = useAtom(seleccionadaAtom);

  const [filtroProyecto, setFiltroProyecto]   = useAtom(filtroProyectoAtom);
  const [filtroModelo, setFiltroModelo]       = useAtom(filtroModeloAtom);
  const [filtroVendedor, setFiltroVendedor]   = useAtom(filtroVendedorAtom);
  const [filtroEstado, setFiltroEstado]       = useAtom(filtroEstadoAtom);

  const etapasQ = useEtapas();
  const casasQ  = useCasas();
  const casas   = casasQ.data ?? [];
  void etapasQ;

  // Opciones únicas para los selects
  const proyectos  = useMemo(() => [...new Set(casas.map(c => c.proyecto).filter(Boolean))].sort() as string[], [casas]);
  const modelos    = useMemo(() => [...new Set(casas.map(c => c.modelo).filter(Boolean))].sort() as string[], [casas]);
  const vendedores = useMemo(() => [...new Set(casas.map(c => c.vendedor).filter(Boolean))].sort() as string[], [casas]);
  const estados    = useMemo(() => [...new Set(casas.map(c => c.estado))].sort() as string[], [casas]);

  // Estadísticas
  const stats = useMemo(() => {
    const total       = casas.length;
    const enProceso   = casas.filter(c => c.estado === 'En proceso').length;
    const retrasadas  = casas.filter(c => c.estado === 'Retrasado').length;
    const completadas = casas.filter(c => c.estado === 'Completado').length;
    const pendientes  = casas.filter(c => c.estado === 'Pendiente').length;
    return { total, enProceso, retrasadas, completadas, pendientes } as Record<string, number>;
  }, [casas]);

  const selectStyle: React.CSSProperties = {
    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9,
    padding: '5px 8px', color: '#475569', fontSize: 12, outline: 'none',
    cursor: 'pointer', maxWidth: 165,
  };

  return (
    <div style={{
      fontFamily:    "'Segoe UI', system-ui, sans-serif",
      background:    '#f5f7f5',
      height:        h ? `${h}px` : '100%',
      color:         '#1a2535',
      display:       'flex',
      flexDirection: 'column',
      width:         w ? `${w}px` : '100%',
      overflow:      'hidden',
      position:      'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
    }}>

      {/* ── TOPBAR ── */}
      <div style={{
        padding:      '10px 20px',
        background:   '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        boxShadow: '0 1px 4px #00000010',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #ADD010, #8fb00c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17,
          }}>🏗</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#1a2535', lineHeight: 1 }}>Avance de Obra</div>
            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>Control de construcción</div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => {
            setDetalleModo('create');
            setSeleccionada(null);
            navigate('/');
          }}
          style={{ background: '#ADD010', border: 'none', borderRadius: 9, padding: '7px 12px', color: '#1a2535', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#96b80e')}
          onMouseLeave={e => (e.currentTarget.style.background = '#ADD010')}
        >
          + Nueva Obra
        </button>

        {/* Acción */}
        <button
          onClick={() => {
            limpiarCambiosLocales(qc);
            toast.success('Datos recargados desde SQL');
          }}
          disabled={casasQ.isFetching || etapasQ.isFetching}
          style={{ background: '#ADD010', border: 'none', borderRadius: 9, padding: '7px 16px', color: '#1a2535', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: (casasQ.isFetching || etapasQ.isFetching) ? 0.6 : 1 }}
          onMouseEnter={e => (e.currentTarget.style.background = '#96b80e')}
          onMouseLeave={e => (e.currentTarget.style.background = '#ADD010')}
        >
          {(casasQ.isFetching || etapasQ.isFetching) ? '⌛ Sincronizando…' : 'Sincronizar ↺'}
        </button>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{
        padding: '8px 20px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        {STAT_ITEMS.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.3px', lineHeight: 1 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color, lineHeight: 1.2 }}>{stats[s.key] ?? 0}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div style={{ padding: '0 20px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
        {TABS.map(tab => {
          const activo = location.pathname === tab.path;
          return (
            <button key={tab.label}
              onClick={() => navigate(tab.path)}
              style={{
                background:   'none', border: 'none',
                borderBottom: activo ? '2px solid #ADD010' : '2px solid transparent',
                padding:      '9px 16px',
                color:        activo ? '#5a7400' : '#64748b',
                fontSize:     13, cursor: 'pointer',
                fontWeight:   activo ? 700 : 400,
                transition:   'color .15s, border-color .15s',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TOOLBAR: Filtros + Búsqueda ── */}
      <div style={{ padding: '7px 20px', background: '#ffffff', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>🔎 Filtros:</span>

        <select value={filtroProyecto} onChange={e => setFiltroProyecto(e.target.value)} style={selectStyle}>
          <option value="">Todos los proyectos</option>
          {proyectos.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select value={filtroModelo} onChange={e => setFiltroModelo(e.target.value)} style={selectStyle}>
          <option value="">Todos los modelos</option>
          {modelos.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <select value={filtroVendedor} onChange={e => setFiltroVendedor(e.target.value)} style={selectStyle}>
          <option value="">Todos los vendedores</option>
          {vendedores.map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={selectStyle}>
          <option value="">Todos los estados</option>
          {estados.map(es => <option key={es} value={es}>{es}</option>)}
        </select>

        {draggedId && (
          <span style={{ background: '#ADD01015', border: '1px solid #ADD01060', borderRadius: 8, padding: '4px 12px', color: '#5a7400', fontSize: 11, fontWeight: 600 }}>
            ↔ Arrastrando… suelta en la columna destino
          </span>
        )}
        <div style={{ flex: 1 }} />

        {/* Buscador */}
        <div style={{ position: 'relative' }}>
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar lote..."
            style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9,
              padding: '5px 30px 5px 10px', color: '#1a2535', fontSize: 12,
              outline: 'none', width: 180,
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#ADD01080'; }}
            onBlur={e  => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
          />
          <span style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 12 }}>🔍</span>
        </div>

        {/* Refresh */}
        <button
          onClick={() => { casasQ.refetch(); }}
          disabled={casasQ.isFetching}
          style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 11px', color: '#64748b', fontSize: 12, cursor: 'pointer' }}
          title="Recargar datos"
        >
          {casasQ.isFetching ? '⌛' : '↺'}
        </button>
      </div>

      {/* ── CONTENIDO ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Outlet />
      </div>
    </div>
  );
}

