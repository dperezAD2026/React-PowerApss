import * as React from "react";
import { useState, useRef } from "react";
import { createRoot, Root } from "react-dom/client";

type Prioridad = "alta" | "media" | "baja";
type ColId = "prospecto" | "negociacion" | "contrato" | "en_obra" | "acabados" | "entregado";

interface Tarea {
  id: string; titulo: string; cliente: string; tipo: string;
  prioridad: Prioridad; responsable: string; iniciales: string;
  color: string; dias: number; avance: number; col: ColId;
}
interface Columna { id: ColId; nombre: string; color: string; limit?: number; }

const COLUMNAS: Columna[] = [
  { id: "prospecto",   nombre: "PROSPECTO",       color: "#6366f1" },
  { id: "negociacion", nombre: "NEGOCIACION",      color: "#f59e0b", limit: 5 },
  { id: "contrato",    nombre: "CONTRATO FIRMADO", color: "#3b82f6", limit: 6 },
  { id: "en_obra",     nombre: "EN OBRA",          color: "#10b981", limit: 10 },
  { id: "acabados",    nombre: "ACABADOS",         color: "#f97316", limit: 8 },
  { id: "entregado",   nombre: "ENTREGADO",        color: "#22c55e" },
];
const PRIO_CFG: Record<Prioridad,{bg:string;label:string}> = {
  alta:{bg:"#dc2626",label:"Alta"}, media:{bg:"#f59e0b",label:"Media"}, baja:{bg:"#22c55e",label:"Baja"},
};
const COLORES_RESP = ["#6366f1","#f59e0b","#10b981","#3b82f6","#f97316","#ec4899","#8b5cf6","#14b8a6"];

const TAREAS_INIT: Tarea[] = [
  {id:"t1",titulo:"Casa Lago Azul",       cliente:"Familia Mora",   tipo:"Residencial",prioridad:"alta", responsable:"DC",iniciales:"DC",color:COLORES_RESP[0],dias:4, avance:65, col:"prospecto"},
  {id:"t2",titulo:"Apt Zamora",           cliente:"Torres SA",      tipo:"Comercial",  prioridad:"media",responsable:"AR",iniciales:"AR",color:COLORES_RESP[2],dias:12,avance:30, col:"prospecto"},
  {id:"t3",titulo:"Bodega Ind Z3",        cliente:"LogiCR SA",      tipo:"Industrial", prioridad:"alta", responsable:"MC",iniciales:"MC",color:COLORES_RESP[5],dias:7, avance:47, col:"negociacion"},
  {id:"t4",titulo:"Proyecto Hiedra FAB",  cliente:"Adelante CR",    tipo:"Residencial",prioridad:"baja", responsable:"DC",iniciales:"DC",color:COLORES_RESP[0],dias:4, avance:90, col:"negociacion"},
  {id:"t5",titulo:"Formaliz. Zona Norte", cliente:"JN Desarrollos", tipo:"Residencial",prioridad:"media",responsable:"LP",iniciales:"LP",color:COLORES_RESP[3],dias:9, avance:72, col:"negociacion"},
  {id:"t6",titulo:"Residencial Las Palmas",cliente:"Familia Minez", tipo:"Residencial",prioridad:"alta", responsable:"DC",iniciales:"DC",color:COLORES_RESP[0],dias:1, avance:82, col:"en_obra"},
  {id:"t7",titulo:"Torre Empresarial Norte",cliente:"Corp GB",      tipo:"Comercial",  prioridad:"media",responsable:"GB",iniciales:"GB",color:COLORES_RESP[7],dias:3, avance:55, col:"en_obra"},
  {id:"t8",titulo:"VN-K25 Formaleta",     cliente:"Adelante CR",    tipo:"Residencial",prioridad:"alta", responsable:"DC",iniciales:"DC",color:COLORES_RESP[0],dias:3, avance:88, col:"acabados"},
  {id:"t9",titulo:"Centro Comercial Oeste",cliente:"Mall Group",    tipo:"Comercial",  prioridad:"media",responsable:"LP",iniciales:"LP",color:COLORES_RESP[3],dias:41,avance:100,col:"entregado"},
];

// ---- Modal ----
const Modal: React.FC<{tarea:Tarea;columnas:Columna[];onClose:()=>void;onMove:(c:ColId)=>void}> = ({tarea,columnas,onClose,onMove}) => {
  const pc = PRIO_CFG[tarea.prioridad];
  const col = columnas.find(c=>c.id===tarea.col)!;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#1e293b",borderRadius:14,padding:24,minWidth:340,maxWidth:460,boxShadow:"0 20px 60px rgba(0,0,0,0.6)",border:"1px solid #334155"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h3 style={{margin:0,color:"#f1f5f9",fontSize:16}}>{tarea.titulo}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#64748b",fontSize:22,cursor:"pointer",lineHeight:1}}>x</button>
        </div>
        <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:11,background:pc.bg+"30",color:pc.bg,borderRadius:4,padding:"3px 8px"}}>Prioridad {pc.label}</span>
          <span style={{fontSize:11,background:col.color+"30",color:col.color,borderRadius:4,padding:"3px 8px"}}>{col.nombre}</span>
        </div>
        <div style={{marginTop:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{background:"#0f172a",borderRadius:8,padding:"10px 14px"}}>
            <div style={{fontSize:11,color:"#64748b"}}>Cliente</div>
            <div style={{fontSize:13,color:"#e2e8f0",marginTop:3,fontWeight:600}}>{tarea.cliente}</div>
          </div>
          <div style={{background:"#0f172a",borderRadius:8,padding:"10px 14px"}}>
            <div style={{fontSize:11,color:"#64748b"}}>Avance</div>
            <div style={{fontSize:22,fontWeight:700,color:tarea.avance===100?"#22c55e":tarea.avance>=70?"#3b82f6":"#f59e0b",marginTop:2}}>{tarea.avance}%</div>
          </div>
        </div>
        <div style={{marginTop:14}}>
          <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>Mover a:</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {columnas.filter(c=>c.id!==tarea.col).map(c=>(
              <button key={c.id} onClick={()=>{onMove(c.id);onClose();}}
                style={{fontSize:11,padding:"5px 12px",borderRadius:6,border:`1px solid ${c.color}`,background:c.color+"20",color:c.color,cursor:"pointer"}}>
                {c.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- App ----
const App: React.FC<{value?:string}> = () => {
  const [tareas, setTareas]     = useState<Tarea[]>(TAREAS_INIT);
  const [showAvance, setShowAvance] = useState(false);
  const [modal, setModal]       = useState<Tarea|null>(null);
  const [filtroPrio, setFiltroPrio] = useState<Prioridad|"">("");
  const [filtroResp, setFiltroResp] = useState("");
  const boardRef = useRef<HTMLDivElement>(null);

  // ---- Drag state ----
  const dragState = useRef<{
    id: string; pointerId: number;
    ghostEl: HTMLDivElement | null;
    overCol: ColId | null;
  } | null>(null);
  const [overCol, setOverCol] = useState<ColId|null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    // Capturar el puntero en el board para seguir recibiendo eventos aunque salga de la tarjeta
    const board = boardRef.current;
    if (!board) return;
    board.setPointerCapture(e.pointerId);

    // Ghost
    const ghost = document.createElement("div");
    ghost.style.cssText = "position:fixed;z-index:99999;pointer-events:none;background:#1e3a5f;border:2px solid #6366f1;border-radius:8px;padding:8px 14px;font-size:12px;color:#f1f5f9;font-family:Segoe UI,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,0.6);white-space:nowrap;";
    const t = tareas.find(x=>x.id===id)!;
    ghost.textContent = t.titulo;
    ghost.style.left = (e.clientX + 12) + "px";
    ghost.style.top  = (e.clientY + 8)  + "px";
    document.body.appendChild(ghost);

    dragState.current = { id, pointerId: e.pointerId, ghostEl: ghost, overCol: null };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const ds = dragState.current;
    if (!ds) return;
    e.preventDefault();

    if (ds.ghostEl) {
      ds.ghostEl.style.left = (e.clientX + 12) + "px";
      ds.ghostEl.style.top  = (e.clientY + 8)  + "px";
    }

    // Detectar columna bajo el cursor
    if (ds.ghostEl) ds.ghostEl.style.display = "none";
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    if (ds.ghostEl) ds.ghostEl.style.display = "";
    const colEl = el?.closest("[data-col]") as HTMLElement | null;
    const col = colEl ? (colEl.dataset.col as ColId) : null;
    ds.overCol = col;
    setOverCol(col);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const ds = dragState.current;
    if (!ds) return;

    boardRef.current?.releasePointerCapture(ds.pointerId);
    if (ds.ghostEl) { try { document.body.removeChild(ds.ghostEl); } catch(_e){ void _e; } }

    if (ds.overCol && ds.overCol !== tareas.find(t=>t.id===ds.id)?.col) {
      const tid = ds.id;
      const targetCol = ds.overCol;
      setTareas(prev => prev.map(t => t.id===tid ? {...t, col:targetCol} : t));
    }
    dragState.current = null;
    setOverCol(null);
  };

  const moverTarea = (id: string, col: ColId) => setTareas(prev=>prev.map(t=>t.id===id?{...t,col}:t));
  const tareasFiltradas = tareas.filter(t=>!filtroPrio||t.prioridad===filtroPrio).filter(t=>!filtroResp||t.responsable===filtroResp);
  const responsables = Array.from(new Set(tareas.map(t=>t.responsable)));
  const totalAvance  = Math.round(tareas.reduce((s,t)=>s+t.avance,0)/(tareas.length||1));

  return (
    <div style={{background:"#0f172a",minHeight:"100vh",fontFamily:"'Segoe UI',system-ui,sans-serif",color:"#e2e8f0",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg,#1e3a5f,#0f172a)",padding:"12px 20px 10px",borderBottom:"1px solid #1e293b",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:17,fontWeight:700,color:"#f1f5f9"}}>Control de Proyectos y Obras</div>
            <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{tareas.length} proyectos &middot; {tareas.filter(t=>t.col==="entregado").length} entregados &middot; avance global {totalAvance}%</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:11,color:"#64748b"}}>Mostrar avance</span>
            <div onClick={()=>setShowAvance(v=>!v)}
              style={{width:38,height:22,borderRadius:11,cursor:"pointer",background:showAvance?"#2563eb":"#334155",position:"relative",transition:"background 0.2s",flexShrink:0}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:showAvance?18:2,transition:"left 0.2s",pointerEvents:"none"}}/>
            </div>
          </div>
        </div>
        {/* BARRA PROGRESO */}
        <div style={{marginTop:7,display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1,height:4,background:"#1e293b",borderRadius:2}}>
            <div style={{height:"100%",width:`${totalAvance}%`,background:"linear-gradient(90deg,#3b82f6,#22c55e)",borderRadius:2,transition:"width 0.5s"}}/>
          </div>
          <span style={{fontSize:11,color:"#64748b"}}>{totalAvance}%</span>
        </div>
        {/* FILTROS */}
        <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
          {(["","alta","media","baja"] as const).map(p=>(
            <button key={p} onClick={()=>setFiltroPrio(p)}
              style={{fontSize:11,padding:"3px 10px",borderRadius:6,cursor:"pointer",background:filtroPrio===p?(p?PRIO_CFG[p].bg:"#6366f1"):"#1e293b",color:filtroPrio===p?"#fff":"#94a3b8",border:"1px solid #334155"}}>
              {p?PRIO_CFG[p].label:"Todos"}
            </button>
          ))}
          <div style={{width:1,background:"#334155",margin:"0 2px",height:20}}/>
          {responsables.map(r=>{
            const t=tareas.find(x=>x.responsable===r)!;
            return (<button key={r} onClick={()=>setFiltroResp(filtroResp===r?"":r)}
              style={{width:26,height:26,borderRadius:"50%",border:filtroResp===r?`2px solid ${t.color}`:"2px solid transparent",background:t.color,color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer"}}>
              {t.iniciales}
            </button>);
          })}
        </div>
      </div>

      {/* BOARD - aqui va el capture de pointer */}
      <div
        ref={boardRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{display:"flex",gap:10,padding:"10px 12px",overflowX:"auto",flex:1,alignItems:"flex-start",touchAction:"none"}}
      >
        {COLUMNAS.map(col=>{
          const cards = tareasFiltradas.filter(t=>t.col===col.id);
          const isOver = overCol===col.id;
          return (
            <div key={col.id} data-col={col.id}
              style={{minWidth:210,maxWidth:230,flex:"0 0 220px",background:isOver?"#1a2540":"#111827",
                borderRadius:10,border:`2px solid ${isOver?col.color:"#1e293b"}`,
                display:"flex",flexDirection:"column",transition:"border-color 0.12s,background 0.12s"}}>
              {/* HEADER COL */}
              <div data-col={col.id} style={{padding:"10px 12px 8px",borderBottom:"1px solid #1e293b"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:col.color}}/>
                    <span style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:0.5}}>{col.nombre}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <span style={{fontSize:12,fontWeight:700,color:col.color,background:col.color+"20",borderRadius:4,padding:"1px 7px"}}>{cards.length}</span>
                    {col.limit && <span style={{fontSize:10,color:"#475569"}}>/{col.limit}</span>}
                  </div>
                </div>
              </div>
              {/* CARDS */}
              <div data-col={col.id} style={{padding:"8px",display:"flex",flexDirection:"column",gap:7,flex:1,minHeight:80}}>
                {cards.map(t=>{
                  const pc = PRIO_CFG[t.prioridad];
                  const isDragging = dragState.current?.id === t.id;
                  return (
                    <div key={t.id}
                      onPointerDown={e=>handlePointerDown(e,t.id)}
                      onClick={()=>{ if (!dragState.current) setModal(t); }}
                      style={{background:isDragging?"#2d3748":"#1e293b",border:`1px solid ${isDragging?"#6366f1":"#334155"}`,
                        borderRadius:8,padding:"10px 11px",cursor:"grab",opacity:isDragging?0.4:1,
                        boxShadow:"0 2px 8px rgba(0,0,0,0.3)",userSelect:"none",touchAction:"none"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
                        <div style={{fontSize:13,fontWeight:600,color:"#f1f5f9",lineHeight:1.3,flex:1}}>{t.titulo}</div>
                        <div style={{minWidth:8,height:8,borderRadius:"50%",background:pc.bg,marginTop:3}}/>
                      </div>
                      <div style={{fontSize:11,color:"#64748b",marginTop:3}}>{t.cliente}</div>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8}}>
                        <span style={{fontSize:10,background:"#0f172a",color:"#94a3b8",borderRadius:4,padding:"2px 7px"}}>{t.tipo}</span>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <span style={{fontSize:10,color:t.dias>30?"#f87171":t.dias>7?"#fbbf24":"#94a3b8"}}>{t.dias}d</span>
                          <div style={{width:24,height:24,borderRadius:"50%",background:t.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff"}}>{t.iniciales}</div>
                        </div>
                      </div>
                      {showAvance && (
                        <div style={{marginTop:7}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                            <span style={{fontSize:10,color:"#64748b"}}>Avance</span>
                            <span style={{fontSize:10,color:"#94a3b8",fontWeight:600}}>{t.avance}%</span>
                          </div>
                          <div style={{height:3,background:"#334155",borderRadius:2}}>
                            <div style={{height:"100%",width:`${t.avance}%`,borderRadius:2,background:t.avance===100?"#22c55e":t.avance>=70?"#3b82f6":"#f59e0b",transition:"width 0.4s"}}/>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {cards.length===0 && (
                  <div data-col={col.id} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",
                    color:isOver?col.color+"80":"#334155",fontSize:11,border:`2px dashed ${isOver?col.color+"60":"#1e293b"}`,
                    borderRadius:8,minHeight:60,transition:"all 0.12s"}}>
                    {isOver?"Soltar aqui":"Vacio"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal tarea={modal} columnas={COLUMNAS} onClose={()=>setModal(null)}
          onMove={col=>moverTarea(modal.id,col)}/>
      )}
    </div>
  );
};

export function renderApp(container: HTMLDivElement, value: string): Root {
  const root = createRoot(container);
  root.render(<App value={value} />);
  return root;
}