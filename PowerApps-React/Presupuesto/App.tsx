import React, { useState } from "react";
import { createRoot, Root } from "react-dom/client";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PartidaPresupuesto {
  id: string;
  nombre: string;
  unidad: string;
  cantidad: number;
  precioUnit: number;
  ejecutado: number;
}

interface CategoriaPresupuesto {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  partidas: PartidaPresupuesto[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATS_INIT: CategoriaPresupuesto[] = [
  {
    id: "mat", nombre: "Materiales", icono: "🧱", color: "#3b82f6",
    partidas: [
      { id: "m1", nombre: "Cemento Portland", unidad: "Saco", cantidad: 2400, precioUnit: 12.5, ejecutado: 18900 },
      { id: "m2", nombre: "Varilla #4 corrugada", unidad: "Qq", cantidad: 820, precioUnit: 95, ejecutado: 62100 },
      { id: "m3", nombre: "Bloque de concreto 15cm", unidad: "Unidad", cantidad: 48000, precioUnit: 0.85, ejecutado: 28560 },
      { id: "m4", nombre: "Arena de río m³", unidad: "m³", cantidad: 560, precioUnit: 28, ejecutado: 9800 },
      { id: "m5", nombre: "Piedra cuarta m³", unidad: "m³", cantidad: 380, precioUnit: 32, ejecutado: 8320 },
    ],
  },
  {
    id: "mo", nombre: "Mano de Obra", icono: "👷", color: "#f59e0b",
    partidas: [
      { id: "o1", nombre: "Maestro de obras", unidad: "Mes", cantidad: 18, precioUnit: 3800, ejecutado: 49400 },
      { id: "o2", nombre: "Cuadrilla estructural (4)", unidad: "Mes", cantidad: 18, precioUnit: 12000, ejecutado: 144000 },
      { id: "o3", nombre: "Electricistas (2)", unidad: "Mes", cantidad: 12, precioUnit: 4200, ejecutado: 25200 },
      { id: "o4", nombre: "Plomeros (2)", unidad: "Mes", cantidad: 10, precioUnit: 3600, ejecutado: 18000 },
    ],
  },
  {
    id: "eq", nombre: "Equipos y Herramientas", icono: "🏗", color: "#8b5cf6",
    partidas: [
      { id: "eq1", nombre: "Alquiler mixer", unidad: "Días", cantidad: 120, precioUnit: 250, ejecutado: 26250 },
      { id: "eq2", nombre: "Compactadora vibratoria", unidad: "Días", cantidad: 45, precioUnit: 180, ejecutado: 6300 },
      { id: "eq3", nombre: "Andamio (módulos)", unidad: "Mes", cantidad: 12, precioUnit: 880, ejecutado: 7920 },
    ],
  },
  {
    id: "sub", nombre: "Subcontratos", icono: "📋", color: "#10b981",
    partidas: [
      { id: "s1", nombre: "Instalación eléctrica completa", unidad: "Global", cantidad: 1, precioUnit: 68000, ejecutado: 34000 },
      { id: "s2", nombre: "Sistema hidrosanitario", unidad: "Global", cantidad: 1, precioUnit: 45000, ejecutado: 18000 },
      { id: "s3", nombre: "Ventanas aluminio y vidrio", unidad: "Global", cantidad: 1, precioUnit: 32000, ejecutado: 0 },
    ],
  },
  {
    id: "ind", nombre: "Gastos Indirectos", icono: "📊", color: "#ef4444",
    partidas: [
      { id: "i1", nombre: "Permisos y planos", unidad: "Global", cantidad: 1, precioUnit: 8500, ejecutado: 8500 },
      { id: "i2", nombre: "Seguros de obra", unidad: "Año", cantidad: 2, precioUnit: 3200, ejecutado: 3200 },
      { id: "i3", nombre: "Imprevistos (5%)", unidad: "Global", cantidad: 1, precioUnit: 28000, ejecutado: 4200 },
    ],
  },
];

const fmt = (n: number) =>
  n.toLocaleString("es-CR", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });

function pctColor(pct: number): string {
  if (pct >= 110) return "#ef4444";
  if (pct >= 90) return "#f59e0b";
  if (pct >= 70) return "#3b82f6";
  return "#10b981";
}

interface ModalPartida {
  catId: string;
  partida?: PartidaPresupuesto;
}

// ─── App ──────────────────────────────────────────────────────────────────────
function PresupuestoApp() {
  const [cats, setCats] = useState<CategoriaPresupuesto[]>(CATS_INIT);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["mat", "mo"]));
  const [modal, setModal] = useState<ModalPartida | null>(null);
  const [form, setForm] = useState({ nombre: "", unidad: "", cantidad: "", precioUnit: "", ejecutado: "" });
  const [filtro, setFiltro] = useState<"todos" | "sobre" | "ok">("todos");

  function toggleCat(id: string) {
    setExpanded(prev => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); } else { n.add(id); }
      return n;
    });
  }

  const presTotal = cats.reduce((s, c) => s + c.partidas.reduce((ss, p) => ss + p.cantidad * p.precioUnit, 0), 0);
  const ejTotal   = cats.reduce((s, c) => s + c.partidas.reduce((ss, p) => ss + p.ejecutado, 0), 0);
  const dispTotal = presTotal - ejTotal;
  const pctTotal  = presTotal > 0 ? (ejTotal / presTotal) * 100 : 0;

  function openNew(catId: string) {
    setModal({ catId });
    setForm({ nombre: "", unidad: "", cantidad: "", precioUnit: "", ejecutado: "" });
  }

  function openEdit(catId: string, p: PartidaPresupuesto) {
    setModal({ catId, partida: p });
    setForm({ nombre: p.nombre, unidad: p.unidad, cantidad: String(p.cantidad), precioUnit: String(p.precioUnit), ejecutado: String(p.ejecutado) });
  }

  function saveModal() {
    if (!modal) return;
    const newP: PartidaPresupuesto = {
      id: modal.partida?.id ?? `p${Date.now()}`,
      nombre: form.nombre,
      unidad: form.unidad,
      cantidad: parseFloat(form.cantidad) || 0,
      precioUnit: parseFloat(form.precioUnit) || 0,
      ejecutado: parseFloat(form.ejecutado) || 0,
    };
    setCats(prev => prev.map(c => {
      if (c.id !== modal.catId) return c;
      const partidas = modal.partida
        ? c.partidas.map(p => p.id === modal.partida!.id ? newP : p)
        : [...c.partidas, newP];
      return { ...c, partidas };
    }));
    setModal(null);
  }

  function deletePartida(catId: string, pId: string) {
    setCats(prev => prev.map(c => c.id !== catId ? c : { ...c, partidas: c.partidas.filter(p => p.id !== pId) }));
  }

  const filteredCats = cats.map(c => ({
    ...c,
    partidas: c.partidas.filter(p => {
      const pres = p.cantidad * p.precioUnit;
      const pct = pres > 0 ? (p.ejecutado / pres) * 100 : 0;
      if (filtro === "sobre") return pct >= 90;
      if (filtro === "ok") return pct < 90;
      return true;
    })
  }));

  const inpStyle: React.CSSProperties = {
    background: "#0f1117", border: "1px solid #374151", borderRadius: 7, padding: "8px 12px",
    color: "#e2e8f0", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box"
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#0f1117", minHeight: "100vh", color: "#e2e8f0", padding: 20, position: "relative" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>💰 Presupuesto de Obra</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>Control de costos presupuestados vs ejecutados</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {[
            { val: "todos", label: "Todas" },
            { val: "sobre", label: "⚠ Con alerta" },
            { val: "ok",    label: "✅ En control" },
          ].map(f => (
            <button key={f.val} onClick={() => setFiltro(f.val as typeof filtro)}
              style={{ background: filtro === f.val ? "#3b82f6" : "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8, padding: "7px 14px", color: "#e2e8f0", fontSize: 12, cursor: "pointer" }}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Presupuesto Total", val: fmt(presTotal), sub: "100%", color: "#3b82f6", icon: "📋" },
          { label: "Ejecutado",         val: fmt(ejTotal),   sub: `${pctTotal.toFixed(1)}%`, color: pctColor(pctTotal), icon: "✅" },
          { label: "Disponible",        val: fmt(dispTotal), sub: dispTotal < 0 ? "⚠ SOBRE PRESUPUESTO" : "Saldo restante", color: dispTotal < 0 ? "#ef4444" : "#10b981", icon: dispTotal < 0 ? "🚨" : "💵" },
          { label: "Avance Financiero", val: `${pctTotal.toFixed(1)}%`, sub: `${cats.reduce((s,c)=>s+c.partidas.length,0)} partidas`, color: "#f59e0b", icon: "📈" },
        ].map(k => (
          <div key={k.label} style={{ background: "#1a1f2e", borderRadius: 12, padding: "16px 18px", border: "1px solid #2d3748", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: 14, top: 14, fontSize: 24, opacity: 0.15 }}>{k.icon}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.val}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{k.sub}</div>
            <div style={{ marginTop: 10, background: "#0f1117", borderRadius: 4, height: 4 }}>
              <div style={{ width: `${Math.min(pctTotal, 100)}%`, background: k.color, height: "100%", borderRadius: 4, transition: "width .5s" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      {filteredCats.map(cat => {
        const catPres = cat.partidas.reduce((s, p) => s + p.cantidad * p.precioUnit, 0);
        const catEj   = cat.partidas.reduce((s, p) => s + p.ejecutado, 0);
        const catDisp = catPres - catEj;
        const catPct  = catPres > 0 ? (catEj / catPres) * 100 : 0;
        const isOpen  = expanded.has(cat.id);
        return (
          <div key={cat.id} style={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 12, marginBottom: 14, overflow: "hidden" }}>
            {/* Category Header */}
            <div
              onClick={() => toggleCat(cat.id)}
              style={{ display: "flex", alignItems: "center", padding: "14px 18px", cursor: "pointer", background: "#111827", gap: 14 }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1a1f2e")}
              onMouseLeave={e => (e.currentTarget.style.background = "#111827")}
            >
              <span style={{ fontSize: 20 }}>{cat.icono}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
                  {cat.nombre}
                  <span style={{ fontSize: 11, color: "#475569", fontWeight: 400 }}>({cat.partidas.length} partidas)</span>
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Pres: <b style={{ color: cat.color }}>{fmt(catPres)}</b></span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Ej: <b style={{ color: pctColor(catPct) }}>{fmt(catEj)}</b></span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Saldo: <b style={{ color: catDisp < 0 ? "#ef4444" : "#10b981" }}>{fmt(catDisp)}</b></span>
                </div>
              </div>
              <div style={{ textAlign: "right", minWidth: 80 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: pctColor(catPct) }}>{catPct.toFixed(0)}%</div>
                <div style={{ width: 80, background: "#0f1117", borderRadius: 4, height: 5, marginTop: 4 }}>
                  <div style={{ width: `${Math.min(catPct, 100)}%`, background: pctColor(catPct), height: "100%", borderRadius: 4 }} />
                </div>
              </div>
              <span style={{ color: "#475569", fontSize: 14, marginLeft: 8 }}>{isOpen ? "▲" : "▼"}</span>
            </div>

            {/* Partidas Table */}
            {isOpen && (
              <div>
                {/* Table Header */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px 90px 110px 110px 90px 110px 70px", background: "#0f1117", padding: "8px 18px", gap: 8 }}>
                  {["Partida","Unidad","Cantidad","P.Unit","Presup.","Ejecutado","% Ejec.","Diferencia",""].map(h => (
                    <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", textAlign: h === "" ? "right" : "left" }}>{h}</div>
                  ))}
                </div>
                {cat.partidas.map((p, pi) => {
                  const pres = p.cantidad * p.precioUnit;
                  const pct  = pres > 0 ? (p.ejecutado / pres) * 100 : 0;
                  const diff = pres - p.ejecutado;
                  return (
                    <div key={p.id} style={{
                      display: "grid", gridTemplateColumns: "1fr 80px 90px 90px 110px 110px 90px 110px 70px",
                      padding: "10px 18px", gap: 8, background: pi % 2 === 0 ? "#131825" : "#111827",
                      borderTop: "1px solid #1e2535", alignItems: "center",
                      transition: "background .15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#1e2535")}
                    onMouseLeave={e => (e.currentTarget.style.background = pi % 2 === 0 ? "#131825" : "#111827")}
                    >
                      <div style={{ fontSize: 13, color: "#e2e8f0" }}>{p.nombre}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{p.unidad}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{p.cantidad.toLocaleString()}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{fmt(p.precioUnit)}</div>
                      <div style={{ fontSize: 12, color: cat.color, fontWeight: 600 }}>{fmt(pres)}</div>
                      <div style={{ fontSize: 12, color: pctColor(pct), fontWeight: 600 }}>{fmt(p.ejecutado)}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ flex: 1, background: "#0f1117", borderRadius: 4, height: 5 }}>
                          <div style={{ width: `${Math.min(pct, 100)}%`, background: pctColor(pct), height: "100%", borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 11, color: pctColor(pct), minWidth: 30, textAlign: "right" }}>{pct.toFixed(0)}%</span>
                      </div>
                      <div style={{ fontSize: 12, color: diff < 0 ? "#ef4444" : "#10b981", fontWeight: 600 }}>
                        {diff < 0 ? "▼ " : "▲ "}{fmt(Math.abs(diff))}
                      </div>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <button onClick={() => openEdit(cat.id, p)}
                          style={{ background: "#1e3a5f", border: "none", borderRadius: 5, padding: "4px 8px", color: "#93c5fd", cursor: "pointer", fontSize: 11 }}>✏</button>
                        <button onClick={() => deletePartida(cat.id, p.id)}
                          style={{ background: "#3b1212", border: "none", borderRadius: 5, padding: "4px 8px", color: "#fca5a5", cursor: "pointer", fontSize: 11 }}>🗑</button>
                      </div>
                    </div>
                  );
                })}
                {/* Add row */}
                <div style={{ padding: "10px 18px", borderTop: "1px solid #1e2535" }}>
                  <button onClick={() => openNew(cat.id)}
                    style={{ background: "transparent", border: "1px dashed #2d3748", borderRadius: 8, padding: "7px 16px", color: "#64748b", cursor: "pointer", fontSize: 12, width: "100%" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = cat.color)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#2d3748")}
                  >+ Agregar partida a {cat.nombre}</button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 14, padding: 28, width: 440, maxWidth: "95vw" }}>
            <h3 style={{ margin: "0 0 20px", color: "#f1f5f9", fontSize: 16 }}>
              {modal.partida ? "Editar Partida" : "Nueva Partida"}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { label: "Nombre", key: "nombre", full: true },
                { label: "Unidad", key: "unidad" },
                { label: "Cantidad", key: "cantidad" },
                { label: "Precio Unitario", key: "precioUnit" },
                { label: "Monto Ejecutado", key: "ejecutado", full: true },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.full ? "1 / -1" : undefined }}>
                  <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 5 }}>{f.label}</label>
                  <input
                    style={inpStyle}
                    value={(form as Record<string,string>)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
              <button onClick={() => setModal(null)} style={{ background: "#1e2535", border: "1px solid #374151", borderRadius: 8, padding: "8px 18px", color: "#94a3b8", cursor: "pointer" }}>Cancelar</button>
              <button onClick={saveModal}   style={{ background: "#3b82f6", border: "none", borderRadius: 8, padding: "8px 18px", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 11, color: "#374151", textAlign: "right" }}>Adelante · Presupuesto v1.0</div>
    </div>
  );
}

export function renderApp(container: HTMLDivElement, _value: string): Root {
  const root = createRoot(container);
  root.render(<PresupuestoApp />);
  return root;
}
