import React, { useState } from "react";
import { createRoot, Root } from "react-dom/client";

// ─── Types ────────────────────────────────────────────────────────────────────
type EstadoSol = "pendiente" | "aprobado" | "rechazado" | "entregado";
type Prioridad  = "alta" | "media" | "baja";

interface SolicitudMat {
  id: string;
  folio: string;
  material: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  prioridad: Prioridad;
  estado: EstadoSol;
  solicitante: string;
  obra: string;
  fechaSolicitud: string;
  fechaRequerida: string;
  notas: string;
  imagenUrl?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const SOLICITUDES_INIT: SolicitudMat[] = [
  { id: "1", folio: "SM-001", material: "Varilla #4 corrugada",  descripcion: "Para columnas planta baja bloque B-03", unidad: "Qq",     cantidad: 40,  prioridad: "alta",  estado: "pendiente",  solicitante: "Carlos Méndez",  obra: "Residencial Los Álamos",  fechaSolicitud: "2026-02-18", fechaRequerida: "2026-02-25", notas: "Urgente, detiene avance de obra" },
  { id: "2", folio: "SM-002", material: "Cemento Portland Tipo I", descripcion: "Mezcla para losas",                         unidad: "Saco",   cantidad: 200, prioridad: "alta",  estado: "aprobado",   solicitante: "Luis Rodríguez",  obra: "Edificio Comercial Centro", fechaSolicitud: "2026-02-17", fechaRequerida: "2026-02-22", notas: "Proveedor: CEMEX, cuenta #4521" },
  { id: "3", folio: "SM-003", material: "Cerámica 30x30 beige",   descripcion: "Pisos área social",                         unidad: "m²",     cantidad: 320, prioridad: "media", estado: "aprobado",   solicitante: "Ana González",   obra: "Residencial Los Álamos",  fechaSolicitud: "2026-02-15", fechaRequerida: "2026-03-05", notas: "Color cod: BEI-330" },
  { id: "4", folio: "SM-004", material: "Tubería PVC 4\"",        descripcion: "Red de aguas negras",                       unidad: "Tubo",   cantidad: 60,  prioridad: "media", estado: "entregado",  solicitante: "Pedro Vargas",   obra: "Bodega Industrial Norte",  fechaSolicitud: "2026-02-10", fechaRequerida: "2026-02-14", notas: "" },
  { id: "5", folio: "SM-005", material: "Cable THHN #12 AWG",     descripcion: "Instalación eléctrica pisos 2-4",           unidad: "Rollo",  cantidad: 25,  prioridad: "alta",  estado: "entregado",  solicitante: "Marco Solano",   obra: "Edificio Comercial Centro", fechaSolicitud: "2026-02-08", fechaRequerida: "2026-02-11", notas: "" },
  { id: "6", folio: "SM-006", material: "Pintura epóxica blanca", descripcion: "Acabados estacionamiento",                  unidad: "Galón",  cantidad: 80,  prioridad: "baja",  estado: "rechazado",  solicitante: "Sandra López",   obra: "Bodega Industrial Norte",  fechaSolicitud: "2026-02-12", fechaRequerida: "2026-03-01", notas: "Revisar especificación técnica, no corresponde al plano aprobado" },
  { id: "7", folio: "SM-007", material: "Bloque concreto 15cm",   descripcion: "Paredes bodega zona sur",                   unidad: "Unidad", cantidad: 3200,prioridad: "media", estado: "pendiente",  solicitante: "Carlos Méndez",  obra: "Bodega Industrial Norte",  fechaSolicitud: "2026-02-20", fechaRequerida: "2026-02-28", notas: "" },
  { id: "8", folio: "SM-008", material: "Arena de río",           descripcion: "Mezcla repello interior",                   unidad: "m³",     cantidad: 18,  prioridad: "baja",  estado: "pendiente",  solicitante: "Luis Rodríguez",  obra: "Residencial Los Álamos",  fechaSolicitud: "2026-02-21", fechaRequerida: "2026-03-10", notas: "" },
];

const ESTADO_CFG: Record<EstadoSol, { label: string; bg: string; text: string; dot: string; icon: string }> = {
  pendiente:  { label: "Pendiente",  bg: "#2d2a14", text: "#fcd34d", dot: "#f59e0b", icon: "⏳" },
  aprobado:   { label: "Aprobado",   bg: "#0a2a1a", text: "#6ee7b7", dot: "#10b981", icon: "✅" },
  rechazado:  { label: "Rechazado",  bg: "#2a0f0f", text: "#fca5a5", dot: "#ef4444", icon: "❌" },
  entregado:  { label: "Entregado",  bg: "#1a1555", text: "#a5b4fc", dot: "#818cf8", icon: "📦" },
};

const PRIO_CFG: Record<Prioridad, { label: string; color: string; bg: string }> = {
  alta:  { label: "Alta",  color: "#ef4444", bg: "#2a0f0f" },
  media: { label: "Media", color: "#f59e0b", bg: "#2d2a14" },
  baja:  { label: "Baja",  color: "#3b82f6", bg: "#0f1e35" },
};

type TabFiltro = "todos" | EstadoSol;

const TABS: { val: TabFiltro; label: string }[] = [
  { val: "todos",     label: "Todas" },
  { val: "pendiente", label: "⏳ Pendientes" },
  { val: "aprobado",  label: "✅ Aprobadas" },
  { val: "rechazado", label: "❌ Rechazadas" },
  { val: "entregado", label: "📦 Entregadas" },
];

interface ModalNueva {
  editId?: string;
}

const OBRAS = ["Residencial Los Álamos", "Edificio Comercial Centro", "Bodega Industrial Norte"];
const SOLICITANTES = ["Carlos Méndez", "Luis Rodríguez", "Ana González", "Pedro Vargas", "Marco Solano", "Sandra López"];

// ─── App ──────────────────────────────────────────────────────────────────────
function SolicitudMaterialApp() {
  const [solis, setSolis] = useState<SolicitudMat[]>(SOLICITUDES_INIT);
  const [tab, setTab] = useState<TabFiltro>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [detalle, setDetalle] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalNueva | null>(null);
  const [form, setForm] = useState<Partial<SolicitudMat>>({});
  const [rechazoId, setRechazoId] = useState<string | null>(null);
  const [rechazoNota, setRechazoNota] = useState("");

  const counts: Record<TabFiltro, number> = {
    todos: solis.length,
    pendiente: solis.filter(s => s.estado === "pendiente").length,
    aprobado:  solis.filter(s => s.estado === "aprobado").length,
    rechazado: solis.filter(s => s.estado === "rechazado").length,
    entregado: solis.filter(s => s.estado === "entregado").length,
  };

  const filtered = solis.filter(s => {
    if (tab !== "todos" && s.estado !== tab) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      return s.material.toLowerCase().includes(q) || s.folio.toLowerCase().includes(q) ||
             s.solicitante.toLowerCase().includes(q) || s.obra.toLowerCase().includes(q);
    }
    return true;
  });

  function cambiarEstado(id: string, nuevo: EstadoSol) {
    setSolis(prev => prev.map(s => s.id === id ? { ...s, estado: nuevo } : s));
  }

  function confirmarRechazo() {
    if (!rechazoId) return;
    setSolis(prev => prev.map(s => s.id === rechazoId ? { ...s, estado: "rechazado", notas: rechazoNota || s.notas } : s));
    setRechazoId(null);
    setRechazoNota("");
    if (detalle === rechazoId) setDetalle(null);
  }

  function openNew() {
    setForm({ estado: "pendiente", prioridad: "media", solicitante: SOLICITANTES[0], obra: OBRAS[0], fechaSolicitud: new Date().toISOString().slice(0, 10), fechaRequerida: "", cantidad: 1, unidad: "Unidad", notas: "" });
    setModal({});
  }

  function openEdit(s: SolicitudMat) {
    setForm({ ...s });
    setModal({ editId: s.id });
  }

  function saveModal() {
    if (!form.material || !form.cantidad) return;
    if (modal?.editId) {
      setSolis(prev => prev.map(s => s.id === modal.editId ? { ...s, ...form } as SolicitudMat : s));
    } else {
      const newId = String(Date.now());
      const folio = `SM-${String(solis.length + 1).padStart(3, "0")}`;
      setSolis(prev => [...prev, { ...form, id: newId, folio } as SolicitudMat]);
    }
    setModal(null);
  }

  function deleteSol(id: string) {
    setSolis(prev => prev.filter(s => s.id !== id));
    if (detalle === id) setDetalle(null);
  }

  const detalleItem = solis.find(s => s.id === detalle);

  const inpStyle: React.CSSProperties = {
    background: "#0f1117", border: "1px solid #374151", borderRadius: 7, padding: "8px 12px",
    color: "#e2e8f0", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box"
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#0f1117", minHeight: "100vh", color: "#e2e8f0", padding: 20, position: "relative" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>📦 Solicitud de Material</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>Control y seguimiento de solicitudes de materiales de obra</p>
        </div>
        <button onClick={openNew}
          style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", border: "none", borderRadius: 10, padding: "10px 20px", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
          + Nueva Solicitud
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Solicitudes", val: solis.length, color: "#3b82f6", icon: "📋" },
          { label: "Pendientes",  val: counts.pendiente, color: "#f59e0b", icon: "⏳" },
          { label: "Aprobadas",   val: counts.aprobado,  color: "#10b981", icon: "✅" },
          { label: "Entregadas",  val: counts.entregado, color: "#818cf8", icon: "📦" },
          { label: "Rechazadas",  val: counts.rechazado, color: "#ef4444", icon: "❌" },
        ].map(k => (
          <div key={k.label} style={{ background: "#1a1f2e", borderRadius: 10, padding: "14px 16px", border: "1px solid #2d3748", position: "relative" }}>
            <div style={{ position: "absolute", right: 12, top: 12, fontSize: 20, opacity: 0.15 }}>{k.icon}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: k.color }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4, background: "#111827", borderRadius: 10, padding: 4 }}>
          {TABS.map(t => (
            <button key={t.val} onClick={() => setTab(t.val)}
              style={{
                background: tab === t.val ? "#1d4ed8" : "transparent",
                border: "none", borderRadius: 7, padding: "6px 14px",
                color: tab === t.val ? "#fff" : "#94a3b8", cursor: "pointer", fontSize: 12,
                fontWeight: tab === t.val ? 600 : 400, transition: "all .2s"
              }}>
              {t.label} <span style={{ fontSize: 10, opacity: .8 }}>({counts[t.val]})</span>
            </button>
          ))}
        </div>
        <input
          placeholder="🔍 Buscar material, folio, obra..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8, padding: "8px 14px", color: "#e2e8f0", fontSize: 13, outline: "none", flex: 1, minWidth: 220 }}
        />
      </div>

      {/* Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
        {filtered.map(s => {
          const eCfg = ESTADO_CFG[s.estado];
          const pCfg = PRIO_CFG[s.prioridad];
          const isSelected = detalle === s.id;
          return (
            <div key={s.id}
              style={{
                background: isSelected ? "#1e2d4a" : "#1a1f2e",
                border: `1px solid ${isSelected ? "#3b82f6" : "#2d3748"}`,
                borderRadius: 12, padding: 16, cursor: "pointer", transition: "all .2s",
                boxShadow: isSelected ? "0 0 0 2px #3b82f644" : "none",
              }}
              onClick={() => setDetalle(isSelected ? null : s.id)}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = "#374151"; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = "#2d3748"; }}
            >
              {/* Card Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>{s.folio}</span>
                  <h3 style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 600, color: "#f1f5f9", lineHeight: 1.3 }}>{s.material}</h3>
                </div>
                <span style={{ background: eCfg.bg, color: eCfg.text, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
                  {eCfg.icon} {eCfg.label}
                </span>
              </div>

              {/* Description */}
              <p style={{ margin: "0 0 10px", fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{s.descripcion}</p>

              {/* Details row */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{s.cantidad.toLocaleString()} {s.unidad}</span>
                <span style={{ background: pCfg.bg, color: pCfg.color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12 }}>
                  {pCfg.label}
                </span>
                <span style={{ fontSize: 11, color: "#475569" }}>📍 {s.obra}</span>
              </div>

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#475569", marginBottom: isSelected ? 14 : 0 }}>
                <span>👤 {s.solicitante}</span>
                <span>📅 Req: {s.fechaRequerida || "—"}</span>
              </div>

              {/* Expanded detail */}
              {isSelected && (
                <div onClick={e => e.stopPropagation()} style={{ borderTop: "1px solid #2d3748", paddingTop: 14 }}>
                  {s.notas && (
                    <div style={{ background: "#0f1117", borderRadius: 8, padding: "10px 12px", marginBottom: 12, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
                      💬 {s.notas}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {s.estado === "pendiente" && (<>
                      <button onClick={() => cambiarEstado(s.id, "aprobado")}
                        style={{ background: "#065f46", border: "none", borderRadius: 7, padding: "7px 14px", color: "#6ee7b7", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                        ✅ Aprobar
                      </button>
                      <button onClick={() => setRechazoId(s.id)}
                        style={{ background: "#7f1d1d", border: "none", borderRadius: 7, padding: "7px 14px", color: "#fca5a5", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                        ❌ Rechazar
                      </button>
                    </>)}
                    {s.estado === "aprobado" && (
                      <button onClick={() => cambiarEstado(s.id, "entregado")}
                        style={{ background: "#312e81", border: "none", borderRadius: 7, padding: "7px 14px", color: "#a5b4fc", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                        📦 Marcar Entregado
                      </button>
                    )}
                    <button onClick={() => openEdit(s)}
                      style={{ background: "#1e3a5f", border: "none", borderRadius: 7, padding: "7px 14px", color: "#93c5fd", cursor: "pointer", fontSize: 12 }}>
                      ✏ Editar
                    </button>
                    <button onClick={() => deleteSol(s.id)}
                      style={{ background: "#2d1111", border: "none", borderRadius: 7, padding: "7px 14px", color: "#f87171", cursor: "pointer", fontSize: 12, marginLeft: "auto" }}>
                      🗑 Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 48, color: "#374151" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 15 }}>No hay solicitudes que coincidan</div>
          </div>
        )}
      </div>

      {/* Modal Rechazo */}
      {rechazoId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#1a1f2e", border: "1px solid #7f1d1d", borderRadius: 14, padding: 28, width: 400, maxWidth: "95vw" }}>
            <h3 style={{ margin: "0 0 6px", color: "#ef4444", fontSize: 16 }}>❌ Rechazar Solicitud</h3>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: "#94a3b8" }}>Ingrese el motivo del rechazo (opcional)</p>
            <textarea
              value={rechazoNota}
              onChange={e => setRechazoNota(e.target.value)}
              placeholder="Motivo del rechazo..."
              rows={3}
              style={{ ...inpStyle, resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
              <button onClick={() => setRechazoId(null)} style={{ background: "#1e2535", border: "1px solid #374151", borderRadius: 8, padding: "8px 18px", color: "#94a3b8", cursor: "pointer" }}>Cancelar</button>
              <button onClick={confirmarRechazo} style={{ background: "#dc2626", border: "none", borderRadius: 8, padding: "8px 18px", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Confirmar Rechazo</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva/Editar Solicitud */}
      {modal !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 14, padding: 28, width: 520, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 20px", color: "#f1f5f9", fontSize: 16 }}>
              {modal.editId ? "✏ Editar Solicitud" : "📦 Nueva Solicitud de Material"}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {/* Material */}
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 5 }}>MATERIAL *</label>
                <input style={inpStyle} placeholder="Nombre del material" value={form.material ?? ""} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} />
              </div>
              {/* Descripción */}
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 5 }}>DESCRIPCIÓN</label>
                <input style={inpStyle} placeholder="Uso específico / ubicación" value={form.descripcion ?? ""} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
              </div>
              {/* Cantidad */}
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 5 }}>CANTIDAD *</label>
                <input style={inpStyle} type="number" value={form.cantidad ?? ""} onChange={e => setForm(f => ({ ...f, cantidad: parseFloat(e.target.value) }))} />
              </div>
              {/* Unidad */}
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 5 }}>UNIDAD</label>
                <input style={inpStyle} placeholder="m², Unidad, Saco..." value={form.unidad ?? ""} onChange={e => setForm(f => ({ ...f, unidad: e.target.value }))} />
              </div>
              {/* Prioridad */}
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 5 }}>PRIORIDAD</label>
                <select style={{ ...inpStyle }} value={form.prioridad ?? "media"} onChange={e => setForm(f => ({ ...f, prioridad: e.target.value as Prioridad }))}>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
              {/* Obra */}
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 5 }}>OBRA</label>
                <select style={{ ...inpStyle }} value={form.obra ?? OBRAS[0]} onChange={e => setForm(f => ({ ...f, obra: e.target.value }))}>
                  {OBRAS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {/* Solicitante */}
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 5 }}>SOLICITANTE</label>
                <select style={{ ...inpStyle }} value={form.solicitante ?? SOLICITANTES[0]} onChange={e => setForm(f => ({ ...f, solicitante: e.target.value }))}>
                  {SOLICITANTES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Fecha requerida */}
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 5 }}>FECHA REQUERIDA</label>
                <input style={inpStyle} type="date" value={form.fechaRequerida ?? ""} onChange={e => setForm(f => ({ ...f, fechaRequerida: e.target.value }))} />
              </div>
              {/* Notas */}
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 5 }}>NOTAS</label>
                <textarea style={{ ...inpStyle, resize: "vertical" }} rows={2} placeholder="Observaciones adicionales..." value={form.notas ?? ""} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
              <button onClick={() => setModal(null)} style={{ background: "#1e2535", border: "1px solid #374151", borderRadius: 8, padding: "8px 18px", color: "#94a3b8", cursor: "pointer" }}>Cancelar</button>
              <button onClick={saveModal} style={{ background: "#3b82f6", border: "none", borderRadius: 8, padding: "8px 22px", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                {modal.editId ? "Guardar Cambios" : "Crear Solicitud"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 11, color: "#374151", textAlign: "right" }}>Adelante · Solicitud de Material v1.0</div>
    </div>
  );
}

export function renderApp(container: HTMLDivElement, _value: string): Root {
  const root = createRoot(container);
  root.render(<SolicitudMaterialApp />);
  return root;
}
