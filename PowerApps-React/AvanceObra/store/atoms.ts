import { atom } from 'jotai';
import type { Casa } from './data';

export const seleccionadaAtom = atom<Casa | null>(null);
export const detalleModoAtom   = atom<'view' | 'create'>('view');
export const busquedaAtom     = atom<string>('');
export const vistaAtom        = atom<'tablero' | 'lista'>('tablero');
export const draggedIdAtom    = atom<string | null>(null);

/** Límites WIP editables por el usuario: etapaId → maxWip */
export const wipLimitsAtom    = atom<Record<string, number>>({});

/** Filtros de tablero */
export const filtroProyectoAtom  = atom<string>('');
export const filtroModeloAtom    = atom<string>('');
export const filtroVendedorAtom  = atom<string>('');
export const filtroEstadoAtom    = atom<string>('');
