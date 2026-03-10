import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colorForIndex, colorSoftForIndex, type Etapa, type Casa } from '../store/data';

const MOCK_ETAPAS: Etapa[] = [
  { id: 'e0', nombre: 'Freezer',       orden: 0, categoria: 'Freezer',   color: '#06b6d4', colorSoft: '#06b6d412', maxWip: 50 },
  { id: 'e1', nombre: 'Preliminares',  orden: 1, categoria: 'Obra Gris', color: colorForIndex(0), colorSoft: colorSoftForIndex(0), maxWip: 3 },
  { id: 'e2', nombre: 'Cimentación',   orden: 2, categoria: 'Obra Gris', color: colorForIndex(1), colorSoft: colorSoftForIndex(1), maxWip: 3 },
  { id: 'e3', nombre: 'Estructura',    orden: 3, categoria: 'Obra Gris', color: colorForIndex(2), colorSoft: colorSoftForIndex(2), maxWip: 3 },
  { id: 'e4', nombre: 'Paredes',       orden: 4, categoria: 'Obra Gris', color: colorForIndex(3), colorSoft: colorSoftForIndex(3), maxWip: 3 },
  { id: 'e5', nombre: 'Instalaciones', orden: 5, categoria: 'Acabados',  color: colorForIndex(4), colorSoft: colorSoftForIndex(4), maxWip: 3 },
  { id: 'e6', nombre: 'Acabados',      orden: 6, categoria: 'Acabados',  color: colorForIndex(5), colorSoft: colorSoftForIndex(5), maxWip: 3 },
  { id: 'e7', nombre: 'Entrega',       orden: 7, categoria: 'Cierre',    color: colorForIndex(6), colorSoft: colorSoftForIndex(6) },
];

let mockCasas: Casa[] = [
  { id: 'c15', lote: 'L-15', modelo: 'Modelo A', proyecto: 'Torres del Valle',       vendedor: 'Jorge Arias',  comprador: 'Felipe Mora',    etapaId: 'e0', estado: 'Pendiente',  avance: 0,   fechaInicio: '2026-03-01', fechaFinEsperada: '2026-09-30' },
  { id: 'c1',  lote: 'L-01', modelo: 'Modelo A', proyecto: 'Residencial Los Robles', vendedor: 'Carlos Mora',  comprador: 'Ana Jiménez',    etapaId: 'e1', estado: 'En proceso', avance: 35,  fechaInicio: '2026-01-15', fechaFinEsperada: '2026-04-30' },
  { id: 'c2',  lote: 'L-02', modelo: 'Modelo B', proyecto: 'Residencial Los Robles', vendedor: 'Carlos Mora',  comprador: 'Pedro Solís',    etapaId: 'e1', estado: 'Pendiente',  avance: 10,  fechaInicio: '2026-02-01', fechaFinEsperada: '2026-05-15' },
  { id: 'c3',  lote: 'L-03', modelo: 'Modelo A', proyecto: 'Residencial Los Robles', vendedor: 'María Vargas', comprador: 'Luis Herrera',   etapaId: 'e2', estado: 'En proceso', avance: 55,  fechaInicio: '2025-12-01', fechaFinEsperada: '2026-03-20' },
  { id: 'c4',  lote: 'L-04', modelo: 'Modelo C', proyecto: 'Condominio Vista Azul',  vendedor: 'María Vargas', comprador: 'Rosa Méndez',    etapaId: 'e2', estado: 'Retrasado',  avance: 40,  fechaInicio: '2025-11-15', fechaFinEsperada: '2026-02-28' },
  { id: 'c5',  lote: 'L-05', modelo: 'Modelo B', proyecto: 'Condominio Vista Azul',  vendedor: 'Jorge Arias',  comprador: 'Daniel Rojas',   etapaId: 'e3', estado: 'En proceso', avance: 70,  fechaInicio: '2025-10-10', fechaFinEsperada: '2026-03-15' },
  { id: 'c6',  lote: 'L-06', modelo: 'Modelo A', proyecto: 'Residencial Los Robles', vendedor: 'Jorge Arias',  comprador: 'Marta Soto',     etapaId: 'e3', estado: 'En proceso', avance: 65,  fechaInicio: '2025-10-20', fechaFinEsperada: '2026-03-30' },
  { id: 'c8',  lote: 'L-08', modelo: 'Modelo B', proyecto: 'Residencial Los Robles', vendedor: 'María Vargas', comprador: 'Sofía Campos',   etapaId: 'e4', estado: 'En proceso', avance: 80,  fechaInicio: '2025-09-15', fechaFinEsperada: '2026-02-28' },
  { id: 'c9',  lote: 'L-09', modelo: 'Modelo A', proyecto: 'Torres del Valle',       vendedor: 'Jorge Arias',  comprador: 'Andrés Quesada', etapaId: 'e4', estado: 'Retrasado',  avance: 60,  fechaInicio: '2025-08-20', fechaFinEsperada: '2026-01-31' },
  { id: 'c12', lote: 'L-12', modelo: 'Modelo B', proyecto: 'Torres del Valle',       vendedor: 'Jorge Arias',  comprador: 'Carmen Alfaro',  etapaId: 'e6', estado: 'En proceso', avance: 95,  fechaInicio: '2025-05-15', fechaFinEsperada: '2026-01-15' },
  { id: 'c13', lote: 'L-13', modelo: 'Modelo A', proyecto: 'Condominio Vista Azul',  vendedor: 'Carlos Mora',  comprador: 'Roberto Fallas', etapaId: 'e7', estado: 'Completado', avance: 100, fechaInicio: '2025-03-01', fechaFinEsperada: '2025-12-15', fechaCompletado: '2025-12-10' },
];

export function useEtapas() {
  return useQuery<Etapa[]>({ queryKey: ['etapas'], queryFn: async () => MOCK_ETAPAS, staleTime: Infinity });
}

export function useCasas() {
  return useQuery<Casa[]>({ queryKey: ['casas'], queryFn: async () => [...mockCasas], staleTime: 2 * 60 * 1000 });
}

export function useMoverCasa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ casaId, etapaId, insertIndex }: { casaId: string; etapaId: string; insertIndex?: number }) => {
      const casa = mockCasas.find(c => c.id === casaId);
      if (!casa) return;
      const updated = mockCasas.filter(c => c.id !== casaId);
      const moved = { ...casa, etapaId };
      if (insertIndex != null) {
        const inEtapa = updated.filter(c => c.etapaId === etapaId);
        const others  = updated.filter(c => c.etapaId !== etapaId);
        inEtapa.splice(insertIndex, 0, moved);
        mockCasas = [...others, ...inEtapa];
      } else {
        mockCasas = [...updated, moved];
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['casas'] }),
  });
}

export function useCompletarCasa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (casaId: string) => {
      mockCasas = mockCasas.map(c => c.id === casaId ? { ...c, estado: 'Completado', avance: 100, fechaCompletado: new Date().toISOString().slice(0,10) } : c);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['casas'] }),
  });
}

export function useActualizarCasa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ casaId, cambios }: { casaId: string; cambios: Partial<Casa> }) => {
      mockCasas = mockCasas.map(c => c.id === casaId ? { ...c, ...cambios } : c);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['casas'] }),
  });
}

export function useCrearCasa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (nueva: Omit<Casa, 'id'> & { id?: string }) => {
      const id = nueva.id ?? `c${Date.now()}`;
      mockCasas = [{ ...nueva, id }, ...mockCasas];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['casas'] }),
  });
}

export function limpiarCambiosLocales(qc: ReturnType<typeof useQueryClient>): void {
  qc.invalidateQueries({ queryKey: ['etapas'] });
  qc.invalidateQueries({ queryKey: ['casas'] });
}
