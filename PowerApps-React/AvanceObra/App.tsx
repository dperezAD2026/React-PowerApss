import React from "react";
import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { createRoot, Root } from "react-dom/client";
import type { IInputs } from "./generated/ManifestTypes";

import Layout      from "./pages/_layout";
import { queryClient } from "./lib/query-client";
import { PcfContextProvider } from "./lib/pcf-context";
import { Toaster } from "./components/ui/toaster";
import ErrorBoundary from "./components/system/error-boundary";

import HomePage     from "./pages/index";
import ListaPage    from "./pages/lista";
import DashboardPage from "./pages/dashboard";
import NotFoundPage from "./pages/not-found";

// ─── PROPS ────────────────────────────────────────────────────────────────────
export interface AppProps {
  w?: number;
  h?: number;
  ctx?: ComponentFramework.Context<IInputs>;
}

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────
const AvanceObraApp: React.FC<AppProps> = ({ w, h, ctx }) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider>
          {ctx ? (
            <PcfContextProvider ctx={ctx}>
              <Toaster richColors position="bottom-right" />
              <Router>
                <Routes>
                  <Route path="/" element={<Layout w={w} h={h} />}>
                    <Route index             element={<HomePage />}     />
                    <Route path="lista"      element={<ListaPage />}    />
                    <Route path="dashboard"  element={<DashboardPage />} />
                    <Route path="*"          element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </Router>
            </PcfContextProvider>
          ) : (
            /* Modo standalone sin contexto PCF */
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#94a3b8', fontSize:13 }}>
              Cargando contexto PCF…
            </div>
          )}
        </JotaiProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

// ─── EXPORT PCF ───────────────────────────────────────────────────────────────
export function renderApp(
  container: HTMLDivElement,
  props: AppProps,
  prevRoot: Root | null
): Root {
  if (prevRoot) {
    prevRoot.render(<AvanceObraApp {...props} />);
    return prevRoot;
  }
  const root = createRoot(container);
  root.render(<AvanceObraApp {...props} />);
  return root;
}
