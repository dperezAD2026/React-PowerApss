import React, { createContext, useContext } from 'react';
import type { IInputs } from '../generated/ManifestTypes';

type PCFContext = ComponentFramework.Context<IInputs>;

const PcfCtx = createContext<PCFContext | null>(null);

export const PcfContextProvider: React.FC<{ ctx: PCFContext; children: React.ReactNode }> = ({ ctx, children }) => (
  <PcfCtx.Provider value={ctx}>{children}</PcfCtx.Provider>
);

export function usePcfContext(): PCFContext {
  const ctx = useContext(PcfCtx);
  if (!ctx) throw new Error('usePcfContext must be used inside PcfContextProvider');
  return ctx;
}
