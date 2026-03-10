import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { createRoot, Root } from "react-dom/client";

// 
// TIPOS
// 
interface MatResumen {
  Codigo: string;
  Descripcion: string;
  Pendiente: number;
  Unidad: string;
  EstadoMat?: string;
}
interface Boleta {
  IDBoletaSalida?: string;
  BoletaNo?: string;
  IDVSControlObra?: string;
  NomObra?: string;
  FechaCreacion?: string;
  NomCreadoPor?: string;
  Estado?: string;
  IDEstado?: number;
  TareaObra?: string;
  MatResumen?: MatResumen[];
}
interface Material {
  IDBSalidaDET: string;
  Codigo: string;
  Descripcion: string;
  Unidad: string;
  Presupuestado: number;
  Entregado: number;
  Pendiente: number;
  CantidadEntregable: number;
  EstadoMat?: string;
  locationCode?: string;
  newLocationCode?: string;
  itemNo?: string;
}
interface Colaborador {
  IDCol: string;
  Nombre: string;
  Iniciales: string;
}

type Fase = "lista" | "editar" | "firmar" | "exito";

// 
// MOCK DATA
// 
const MOCK_BOLETAS: Boleta[] = [
  {
    IDBoletaSalida:"BOL-001", BoletaNo:"BS000057", IDVSControlObra:"VN-A.01",
    NomObra:"Residencial Las Palmas", FechaCreacion:"23/02/2026 12:17:59",
    NomCreadoPor:"Mauricio Zuñiga Alvarado", Estado:"Aprobado", IDEstado:2, TareaObra:"Estructura Nivel 2",
    MatResumen:[
      {Codigo:"M01-0146",Descripcion:"VARILLA #2 DEFORME G40",   Pendiente:0,  Unidad:"UND",EstadoMat:"Completo"},
      {Codigo:"M01-0001",Descripcion:"ALAMBRE NEGRO #16 (1.68MM)",Pendiente:39, Unidad:"KG", EstadoMat:"Parcial"},
      {Codigo:"M10-0047",Descripcion:"CEMENTO INDUSTRIAL",        Pendiente:5190,Unidad:"KG", EstadoMat:"Parcial"},
    ]
  },
  {
    IDBoletaSalida:"BOL-002", BoletaNo:"BS000046", IDVSControlObra:"VN-B.27",
    NomObra:"Torre Empresarial Norte", FechaCreacion:"18/02/2026 23:48:35",
    NomCreadoPor:"Franklin Gonzalez Solis", Estado:"Aprobado", IDEstado:2, TareaObra:"Paredes Nivel 3",
    MatResumen:[
      {Codigo:"M15-3021",Descripcion:"TUBO GALVANIZADO 1/2",Pendiente:17,Unidad:"ML", EstadoMat:"Parcial"},
      {Codigo:"M26-3077",Descripcion:"TUBO LOCTITE 3K ROJO",Pendiente:21,Unidad:"UND",EstadoMat:"Indefinido"},
    ]
  },
  {
    IDBoletaSalida:"BOL-003", BoletaNo:"BS000045", IDVSControlObra:"VN-C.01",
    NomObra:"Residencial Valle Verde", FechaCreacion:"16/02/2026 12:04:10",
    NomCreadoPor:"Yoanni Bonilla Torres", Estado:"Aprobado", IDEstado:2, TareaObra:"Pisos y Acabados",
    MatResumen:[
      {Codigo:"M08-0037",Descripcion:"DISCO CORTE METAL FINO 9",Pendiente:0,  Unidad:"UND",EstadoMat:"Completo"},
      {Codigo:"M10-0045",Descripcion:"MAXIEMPASTE EXTRA LISO",   Pendiente:200,Unidad:"UND",EstadoMat:"Indefinido"},
    ]
  },
  {
    IDBoletaSalida:"BOL-004", BoletaNo:"BS000041", IDVSControlObra:"VN-A.03",
    NomObra:"Residencial Las Palmas", FechaCreacion:"14/02/2026 09:22:00",
    NomCreadoPor:"Luis Perez Salas", Estado:"Sin Autorizar", IDEstado:1, TareaObra:"Cimentacion",
    MatResumen:[
      {Codigo:"M01-0008",Descripcion:"PLATINA HN 3/4X1/8",Pendiente:4,Unidad:"UND",EstadoMat:"Parcial"},
    ]
  },
  {
    IDBoletaSalida:"BOL-005", BoletaNo:"BS000039", IDVSControlObra:"VN-D.05",
    NomObra:"Centro Comercial Oeste", FechaCreacion:"12/02/2026 14:55:00",
    NomCreadoPor:"Ana Rodriguez", Estado:"Denegado", IDEstado:3, TareaObra:"Fachada",
    MatResumen:[]
  },
];
const MOCK_MATS: Material[] = [
  {IDBSalidaDET:"d1",Codigo:"M01-0146",Descripcion:"VARILLA #2 DEFORME G40",    Unidad:"UND",Presupuestado:6,   Entregado:6,  Pendiente:0,  CantidadEntregable:0,  EstadoMat:"Completo", itemNo:"M01-0146",locationCode:"ALM-GRAL",newLocationCode:"VN-A.01"},
  {IDBSalidaDET:"d2",Codigo:"M01-0001",Descripcion:"ALAMBRE NEGRO #16 (1.68MM)",Unidad:"KG", Presupuestado:43,  Entregado:4,  Pendiente:39, CantidadEntregable:10, EstadoMat:"Parcial",  itemNo:"M01-0001",locationCode:"ALM-GRAL",newLocationCode:"VN-A.01"},
  {IDBSalidaDET:"d3",Codigo:"M08-0037",Descripcion:"DISCO CORTE METAL FINO 9", Unidad:"UND",Presupuestado:4,   Entregado:4,  Pendiente:0,  CantidadEntregable:0,  EstadoMat:"Completo", itemNo:"M08-0037",locationCode:"ALM-GRAL",newLocationCode:"VN-A.01"},
  {IDBSalidaDET:"d4",Codigo:"M10-0047",Descripcion:"CEMENTO INDUSTRIAL",       Unidad:"KG", Presupuestado:5193,Entregado:3,  Pendiente:5190,CantidadEntregable:100,EstadoMat:"Parcial",  itemNo:"M10-0047",locationCode:"ALM-GRAL",newLocationCode:"VN-A.01"},
  {IDBSalidaDET:"d5",Codigo:"M10-0045",Descripcion:"MAXIEMPASTE EXTRA LISO 20KG",Unidad:"UND",Presupuestado:200,Entregado:0, Pendiente:200, CantidadEntregable:50, EstadoMat:"Indefinido",itemNo:"M10-0045",locationCode:"ALM-GRAL",newLocationCode:"VN-A.01"},
  {IDBSalidaDET:"d6",Codigo:"M10-0046",Descripcion:"PEGA CERAMICA STANDARD",   Unidad:"UND",Presupuestado:32,  Entregado:0,  Pendiente:32, CantidadEntregable:0,  EstadoMat:"Sin Stock",itemNo:"M10-0046",locationCode:"ALM-GRAL",newLocationCode:"VN-A.01"},
  {IDBSalidaDET:"d7",Codigo:"M01-0008",Descripcion:"PLATINA HN 3/4X1/8",       Unidad:"UND",Presupuestado:5,   Entregado:1,  Pendiente:4,  CantidadEntregable:2,  EstadoMat:"Parcial",  itemNo:"M01-0008",locationCode:"ALM-GRAL",newLocationCode:"VN-A.01"},
];
const MOCK_COLAB: Colaborador[] = [
  {IDCol:"DC",Nombre:"David Perez",    Iniciales:"DC"},
  {IDCol:"MZ",Nombre:"Mauricio Zuñiga",Iniciales:"MZ"},
  {IDCol:"AR",Nombre:"Ana Rodriguez",  Iniciales:"AR"},
  {IDCol:"LP",Nombre:"Luis Perez",     Iniciales:"LP"},
];

// 
// UTILS
// 
function parseOrDefault<T>(json: string, fallback: T): T {
  try { return json ? JSON.parse(json) as T : fallback; }
  catch { return fallback; }
}
const EST_CFG: Record<string,{bg:string;text:string;dot:string}> = {
  "Completo":    {bg:"#16a34a22",text:"#4ade80",dot:"#4ade80"},
  "Parcial":     {bg:"#f5900022",text:"#fb923c",dot:"#fb923c"},
  "Indefinido":  {bg:"#2563eb22",text:"#60a5fa",dot:"#60a5fa"},
  "Sin Stock":   {bg:"#dc262622",text:"#f87171",dot:"#f87171"},
};
const BOL_EST: Record<string,{bg:string;text:string;border:string}> = {
  "Aprobado":      {bg:"#16a34a20",text:"#4ade80",border:"#16a34a50"},
  "Sin Autorizar": {bg:"#f5900020",text:"#fb923c",border:"#f5900050"},
  "Denegado":      {bg:"#dc262620",text:"#f87171",border:"#dc262650"},
};

// 
// BADGE
// 
const Badge: React.FC<{estado:string}> = ({estado}) => {
  const c = EST_CFG[estado] ?? {bg:"#33415522",text:"#94a3b8",dot:"#64748b"};
  return (
    <span style={{background:c.bg,color:c.text,fontSize:10,fontWeight:700,
      padding:"2px 8px",borderRadius:12,border:`1px solid ${c.dot}30`,letterSpacing:0.3}}>
      {estado}
    </span>
  );
};

// 
// SPINNER
// 
const Spinner: React.FC = () => (
  <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",
    flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:9999}}>
    <div style={{width:48,height:48,border:"4px solid #1e3a5f",borderTopColor:"#3b82f6",
      borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
    <div style={{color:"#60a5fa",marginTop:16,fontSize:14,fontWeight:600}}>Procesando entrega...</div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// 
// FIRMA CANVAS
// 
const FirmaCanvas: React.FC<{onFirma:(base64:string)=>void}> = ({onFirma}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing   = useRef(false);
  const hasFirma  = useRef(false);
  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {x:e.clientX-rect.left,y:e.clientY-rect.top};
  };
  const onDown = (e: React.PointerEvent) => {
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const {x,y} = getPos(e as React.PointerEvent<HTMLCanvasElement>);
    ctx.beginPath(); ctx.moveTo(x,y);
    canvasRef.current?.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const {x,y} = getPos(e as React.PointerEvent<HTMLCanvasElement>);
    ctx.lineWidth=2.5; ctx.lineCap="round"; ctx.strokeStyle="#f1f5f9";
    ctx.lineTo(x,y); ctx.stroke();
    hasFirma.current = true;
  };
  const onUp = () => {
    drawing.current = false;
    if (hasFirma.current && canvasRef.current) onFirma(canvasRef.current.toDataURL("image/png"));
  };
  const limpiar = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx||!canvasRef.current) return;
    ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);
    hasFirma.current = false; onFirma("");
  };
  return (
    <div>
      <div style={{background:"#0f172a",borderRadius:8,border:"2px solid #2563eb",padding:4,position:"relative"}}>
        <canvas ref={canvasRef} width={520} height={140}
          style={{display:"block",width:"100%",height:140,borderRadius:6,cursor:"crosshair",touchAction:"none"}}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}/>
        <div style={{position:"absolute",top:6,left:10,fontSize:10,color:"#334155",pointerEvents:"none",userSelect:"none"}}>
          Firma del despachador
        </div>
      </div>
      <button onClick={limpiar}
        style={{marginTop:6,background:"none",border:"1px solid #475569",color:"#94a3b8",
          borderRadius:6,padding:"4px 14px",fontSize:11,cursor:"pointer"}}>
        x Limpiar firma
      </button>
    </div>
  );
};

// 
// TARJETA DE BOLETA (en la lista)
// 
const TarjetaBoleta: React.FC<{b:Boleta;onEditar:()=>void}> = ({b,onEditar}) => {
  const est = b.Estado ?? "Sin Autorizar";
  const ec  = BOL_EST[est] ?? BOL_EST["Sin Autorizar"];
  return (
    <div style={{background:"#111827",borderRadius:10,border:"1px solid #1e293b",
      overflow:"hidden",transition:"border-color 0.15s"}}>
      {/* Header de boleta */}
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",
        flexWrap:"wrap",borderBottom:"1px solid #1e293b",background:"#0f172a"}}>
        <span style={{fontSize:14,fontWeight:800,color:"#f1f5f9",minWidth:70}}>{b.IDVSControlObra}</span>
        <span style={{color:"#334155"}}>|</span>
        <span style={{fontSize:11,color:"#64748b",display:"flex",alignItems:"center",gap:4}}>
          <span></span>{b.NomCreadoPor}
        </span>
        <span style={{color:"#334155"}}>|</span>
        <span style={{fontSize:11,color:"#64748b",display:"flex",alignItems:"center",gap:4}}>
          <span></span>{b.FechaCreacion}
        </span>
        <span style={{color:"#334155"}}>|</span>
        <span style={{fontSize:11,color:"#64748b",display:"flex",alignItems:"center",gap:4}}>
          <span></span>{b.BoletaNo}
        </span>
        {b.TareaObra && (
          <span style={{fontSize:10,background:"#1e3a5f",color:"#93c5fd",borderRadius:4,padding:"1px 7px"}}>
            {b.TareaObra}
          </span>
        )}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,background:ec.bg,color:ec.text,border:`1px solid ${ec.border}`,
            borderRadius:10,padding:"2px 10px",fontWeight:700}}>
            {est}
          </span>
          <button onClick={onEditar}
            style={{background:"#2563eb",border:"none",borderRadius:6,color:"#fff",
              padding:"5px 14px",fontSize:11,fontWeight:700,cursor:"pointer",
              display:"flex",alignItems:"center",gap:5}}>
             Editar
          </button>
        </div>
      </div>
      {/* Materiales resumen */}
      {(b.MatResumen??[]).length > 0 && (
        <div style={{padding:"4px 0 2px"}}>
          {(b.MatResumen??[]).slice(0,4).map((m,i) => {
            const mc = EST_CFG[m.EstadoMat ?? ""] ?? {bg:"#33415522",text:"#94a3b8",dot:"#64748b"};
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,
                padding:"5px 12px",borderBottom:"1px solid #0f172a"}}>
                <span style={{fontSize:11,fontFamily:"monospace",color:"#64748b",
                  background:"#0f172a",borderRadius:4,padding:"1px 6px",flexShrink:0,
                  border:"1px solid #1e293b"}}>
                  {m.Codigo}
                </span>
                <span style={{fontSize:12,color:"#94a3b8",flex:1,minWidth:0,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {m.Descripcion}
                </span>
                <span style={{fontSize:11,fontWeight:700,color:mc.text,flexShrink:0}}>
                  {m.Pendiente > 0 ? `Pendiente ${m.Pendiente} ${m.Unidad}` : "Completo"}
                </span>
                <span style={{width:6,height:6,borderRadius:"50%",background:mc.dot,flexShrink:0}}/>
              </div>
            );
          })}
          {(b.MatResumen??[]).length > 4 && (
            <div style={{padding:"3px 12px",fontSize:10,color:"#475569"}}>
              +{(b.MatResumen??[]).length - 4} materiales mas
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 
// APP PRINCIPAL
// 
interface AppProps {
  boletasJSON:       string;
  boletaJSON:        string;
  detallesJSON:      string;
  colaboradoresJSON: string;
  onOutput: (json: string) => void;
  onBoletaSelect?: (id: string) => void;
  w: number;
  h: number;
}

const App: React.FC<AppProps> = ({boletasJSON,boletaJSON,detallesJSON,colaboradoresJSON,onOutput,onBoletaSelect,w,h}) => {
  const boletas    = parseOrDefault<Boleta[]>(boletasJSON, boletasJSON ? [] : MOCK_BOLETAS);
  const colabList  = parseOrDefault<Colaborador[]>(colaboradoresJSON, MOCK_COLAB);

  const [fase, setFase]                   = useState<Fase>("lista");
  const [boletaSel, setBoletaSel]         = useState<Boleta | null>(null);
  const [mats, setMats]                   = useState<Material[]>([]);
  const [despachador, setDespachador]     = useState<Colaborador | null>(colabList[0] ?? null);
  const [firma, setFirma]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [busquedaBol, setBusquedaBol]     = useState("");
  const [filtroEst, setFiltroEst]         = useState<string>("");
  const [busqueda, setBusqueda]           = useState("");
  const [soloConCantidad, setSoloConCantidad] = useState(false);
  const [entregaNo, setEntregaNo]         = useState("");

  // Cuando cambia detallesJSON (Power Apps actualiza el prop) refrescar mats
  useEffect(() => {
    if (detallesJSON) setMats(parseOrDefault<Material[]>(detallesJSON, MOCK_MATS));
  }, [detallesJSON]);

  // Si llega una boleta individual por prop (seleccion desde Power Apps)
  useEffect(() => {
    if (boletaJSON) {
      const b = parseOrDefault<Boleta>(boletaJSON, {});
      if (b.IDBoletaSalida) { setBoletaSel(b); setFase("editar"); }
    }
  }, [boletaJSON]);

  const seleccionarBoleta = (b: Boleta) => {
    setBoletaSel(b);
    setMats(parseOrDefault<Material[]>(detallesJSON, MOCK_MATS));
    setFase("editar");
    onBoletaSelect?.(b.IDBoletaSalida ?? "");
  };

  //  Estadísticas de la lista 
  const cntAprobado     = boletas.filter(b=>b.Estado==="Aprobado").length;
  const cntSinAutorizar = boletas.filter(b=>b.Estado==="Sin Autorizar").length;
  const cntDenegado     = boletas.filter(b=>b.Estado==="Denegado").length;

  const boletasFiltradas = boletas
    .filter(b => !filtroEst || b.Estado === filtroEst)
    .filter(b => {
      if (!busquedaBol) return true;
      const q = busquedaBol.toLowerCase();
      return (b.IDVSControlObra??"").toLowerCase().includes(q)
          || (b.NomCreadoPor??"").toLowerCase().includes(q)
          || (b.BoletaNo??"").toLowerCase().includes(q)
          || (b.NomObra??"").toLowerCase().includes(q);
    });

  //  Cantidad controles 
  const setCantidad = useCallback((id:string,delta:number) => {
    setMats(prev=>prev.map(m=>{
      if(m.IDBSalidaDET!==id) return m;
      return {...m,CantidadEntregable:Math.min(m.Pendiente,Math.max(0,m.CantidadEntregable+delta))};
    }));
  },[]);
  const setCantidadDirecta = useCallback((id:string,valor:number) => {
    setMats(prev=>prev.map(m=>
      m.IDBSalidaDET!==id ? m : {...m,CantidadEntregable:Math.min(m.Pendiente,Math.max(0,valor))}
    ));
  },[]);

  const enviables  = mats.filter(m=>m.CantidadEntregable>0);
  const totalItems = enviables.length;
  const matsFiltradas = mats
    .filter(m=>!soloConCantidad||m.CantidadEntregable>0)
    .filter(m=>!busqueda||m.Descripcion.toLowerCase().includes(busqueda.toLowerCase())||m.Codigo.toLowerCase().includes(busqueda.toLowerCase()));

  //  Confirmar entrega 
  const confirmarEntrega = () => {
    if (!firma) { alert("Por favor, dibuje la firma del despachador."); return; }
    if (!despachador) { alert("Seleccione el despachador."); return; }
    setLoading(true);
    const newNo = "BE"+String(Math.floor(Math.random()*999999)).padStart(6,"0");
    setEntregaNo(newNo);
    const output = JSON.stringify({
      entregaNo:newNo,despachadorID:despachador.IDCol,firmaDespachado:firma,
      fechaConfirma:new Date().toISOString(),IDBoletaSalida:boletaSel?.IDBoletaSalida,
      materiales:enviables.map(m=>({IDBSalidaDET:m.IDBSalidaDET,itemNo:m.itemNo,
        CantidadEntregable:m.CantidadEntregable,locationCode:m.locationCode,newLocationCode:m.newLocationCode}))
    });
    setTimeout(()=>{ setLoading(false); onOutput(output); setFase("exito"); },1800);
  };

  // 
  // RENDER EXITO
  // 
  const rootStyle: React.CSSProperties = {
    width:  w > 0 ? w : "100%",
    height: h > 0 ? h : "100vh",
    overflow: "hidden",
    position: "relative",
    boxSizing: "border-box",
  };

  if (fase==="exito") return (
    <div style={{...rootStyle,background:"#0f172a",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',sans-serif",color:"#e2e8f0",gap:20}}>
      <div style={{background:"#16a34a20",border:"2px solid #4ade80",borderRadius:"50%",
        width:80,height:80,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40}}>ok</div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:22,fontWeight:700,color:"#4ade80"}}>Entrega Registrada</div>
        <div style={{fontSize:28,fontWeight:800,color:"#f1f5f9",marginTop:4}}>{entregaNo}</div>
        <div style={{fontSize:13,color:"#64748b",marginTop:6}}>
          {totalItems} materiales enviados a {enviables[0]?.newLocationCode??"Obra"}
        </div>
      </div>
      <div style={{background:"#1e293b",borderRadius:12,padding:"14px 24px",border:"1px solid #334155"}}>
        <div style={{fontSize:12,color:"#64748b"}}>Obra</div>
        <div style={{fontSize:14,fontWeight:600,color:"#f1f5f9"}}>
          {boletaSel?.IDVSControlObra} - {boletaSel?.NomObra}
        </div>
        <div style={{fontSize:12,color:"#64748b",marginTop:8}}>Despachado por</div>
        <div style={{fontSize:14,fontWeight:600,color:"#f1f5f9"}}>{despachador?.Nombre}</div>
      </div>
      <button onClick={()=>{setFase("lista");setMats([]);setFirma("");setBoletaSel(null);}}
        style={{background:"#2563eb",border:"none",borderRadius:8,color:"#fff",
          padding:"10px 28px",fontSize:13,cursor:"pointer",fontWeight:600}}>
        Volver a la lista
      </button>
    </div>
  );

  return (
    <div style={{...rootStyle,background:"#0f172a",fontFamily:"'Segoe UI',system-ui,sans-serif",
      color:"#e2e8f0",display:"flex",flexDirection:"column"}}>
      {loading && <Spinner/>}

      {/*  HEADER GLOBAL  */}
      <div style={{background:"linear-gradient(135deg,#1e3a5f,#0f172a)",
        borderBottom:"1px solid #1e293b",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"10px 16px 6px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{background:"#2563eb20",border:"1px solid #2563eb60",borderRadius:8,
              padding:"5px 10px",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:15}}></span>
              <span style={{fontSize:14,fontWeight:700,color:"#93c5fd"}}>Movimiento de Materiales</span>
            </div>
            {boletaSel && fase!=="lista" && (
              <span style={{fontSize:12,color:"#64748b"}}>
                / <span style={{color:"#f1f5f9",fontWeight:600}}>{boletaSel.IDVSControlObra}</span>
                {" "}<span style={{color:"#64748b"}}>{boletaSel.BoletaNo}</span>
              </span>
            )}
          </div>
          {fase!=="lista" && (
            <button onClick={()=>{setFase("lista");setFirma("");}}
              style={{background:"#1e293b",border:"1px solid #334155",borderRadius:6,
                color:"#94a3b8",padding:"4px 12px",fontSize:11,cursor:"pointer"}}>
              Lista
            </button>
          )}
        </div>

        {/* Tabs de fase (solo visible si hay boleta seleccionada) */}
        {fase!=="lista" && (
          <div style={{display:"flex",gap:0,padding:"8px 16px 0",alignItems:"center"}}>
            {([["editar","Editar","1"],["firmar","Confirmar y Firmar","2"]] as const).map(([f,lbl,n])=>(
              <button key={f}
                onClick={()=>{if(f==="firmar"&&enviables.length===0){alert("Seleccione al menos un material con cantidad > 0");return;}setFase(f);}}
                style={{background:fase===f?"#1e293b":"transparent",border:"none",
                  borderBottom:fase===f?"2px solid #3b82f6":"2px solid transparent",
                  color:fase===f?"#60a5fa":"#64748b",padding:"6px 16px",fontSize:12,
                  cursor:"pointer",fontWeight:fase===f?700:400,borderRadius:"4px 4px 0 0",
                  display:"flex",alignItems:"center",gap:5}}>
                <span style={{background:fase===f?"#3b82f6":"#334155",color:"#fff",
                  borderRadius:"50%",width:18,height:18,fontSize:10,display:"inline-flex",
                  alignItems:"center",justifyContent:"center",fontWeight:700}}>{n}</span>
                {lbl}
              </button>
            ))}
            {enviables.length > 0 && (
              <span style={{marginLeft:"auto",fontSize:11,background:"#2563eb30",color:"#60a5fa",
                border:"1px solid #2563eb50",borderRadius:10,padding:"2px 10px"}}>
                {totalItems} material{totalItems!==1?"es":""} seleccionado{totalItems!==1?"s":""}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 
          FASE 0: LISTA DE BOLETAS
       */}
      {fase==="lista" && (
        <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden"}}>

          {/* Barra de contadores de estado */}
          <div style={{display:"flex",alignItems:"center",gap:0,
            background:"#111827",borderBottom:"1px solid #1e293b",flexShrink:0}}>
            {[
              {lbl:"Sin Autorizar",cnt:cntSinAutorizar,val:"Sin Autorizar",color:"#fb923c"},
              {lbl:"Aprobado",     cnt:cntAprobado,    val:"Aprobado",     color:"#4ade80"},
              {lbl:"Denegado",     cnt:cntDenegado,    val:"Denegado",     color:"#f87171"},
            ].map(({lbl,cnt,val,color}) => (
              <button key={val} onClick={()=>setFiltroEst(filtroEst===val?"":val)}
                style={{flex:1,padding:"8px 12px",background:filtroEst===val?color+"20":"transparent",
                  border:"none",borderBottom:filtroEst===val?`2px solid ${color}`:"2px solid transparent",
                  color:filtroEst===val?color:"#64748b",cursor:"pointer",fontSize:12,
                  display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all 0.15s"}}>
                <span style={{fontWeight:800,fontSize:15,color:filtroEst===val?color:"#94a3b8"}}>{cnt}</span>
                {lbl}
              </button>
            ))}
          </div>

          {/* Cabecera de columnas (como el gallery de Power Apps) */}
          <div style={{display:"grid",gridTemplateColumns:"70px 1fr 90px 60px 110px 110px 110px",
            gap:0,padding:"5px 12px",background:"#0f172a",
            borderBottom:"2px solid #1e293b",flexShrink:0}}>
            {["N°","Descripcion","Cantidad","Unidad","Coste Unitario","Importe Coste","Fecha prevista"].map(h=>(
              <span key={h} style={{fontSize:10,color:"#475569",fontWeight:700,letterSpacing:0.5,
                textTransform:"uppercase",padding:"0 4px"}}>{h}</span>
            ))}
          </div>

          {/* Buscador */}
          <div style={{padding:"6px 12px",background:"#111827",
            borderBottom:"1px solid #1e293b",flexShrink:0}}>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",
                color:"#475569",fontSize:13}}></span>
              <input value={busquedaBol} onChange={e=>setBusquedaBol(e.target.value)}
                placeholder="Buscar por obra, responsable, numero de boleta..."
                style={{background:"#0f172a",border:"1px solid #334155",borderRadius:6,
                  color:"#e2e8f0",padding:"6px 10px 6px 28px",fontSize:12,width:"100%",
                  outline:"none",boxSizing:"border-box"}}/>
            </div>
          </div>

          {/* Lista de boletas */}
          <div style={{flex:1,minHeight:0,overflowY:"auto",padding:"8px 10px",display:"flex",
            flexDirection:"column",gap:6}}>
            {boletasFiltradas.length===0 && (
              <div style={{textAlign:"center",padding:"40px 20px",color:"#475569",fontSize:13}}>
                No hay boletas que coincidan con los filtros
              </div>
            )}
            {boletasFiltradas.map(b=>(
              <TarjetaBoleta key={b.IDBoletaSalida} b={b} onEditar={()=>seleccionarBoleta(b)}/>
            ))}
          </div>

          {/* Footer de conteo total */}
          <div style={{background:"#111827",borderTop:"1px solid #1e293b",
            padding:"7px 14px",display:"flex",gap:16,alignItems:"center",flexShrink:0,flexWrap:"wrap"}}>
            <span style={{fontSize:11,color:"#64748b"}}>{boletasFiltradas.length} boletas</span>
            {filtroEst && (
              <button onClick={()=>setFiltroEst("")}
                style={{fontSize:11,background:"none",border:"1px solid #334155",borderRadius:4,
                  color:"#94a3b8",padding:"2px 8px",cursor:"pointer"}}>
                x Limpiar filtro
              </button>
            )}
          </div>
        </div>
      )}

      {/* 
          FASE 1: EDITAR MATERIALES
       */}
      {fase==="editar" && (
        <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden"}}>
          {/* Info boleta seleccionada */}
          {boletaSel && (
            <div style={{padding:"6px 14px",background:"#1e293b",borderBottom:"1px solid #0f172a",
              display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",flexShrink:0}}>
              <span style={{fontSize:11,color:"#64748b"}}> {boletaSel.NomCreadoPor}</span>
              <span style={{color:"#334155"}}></span>
              <span style={{fontSize:11,color:"#64748b"}}> {boletaSel.FechaCreacion}</span>
              <span style={{color:"#334155"}}></span>
              <span style={{fontSize:11,color:"#64748b"}}> {boletaSel.BoletaNo}</span>
              {boletaSel.TareaObra && (
                <span style={{fontSize:10,background:"#1e3a5f",color:"#93c5fd",borderRadius:4,padding:"1px 7px"}}>
                   {boletaSel.TareaObra}
                </span>
              )}
            </div>
          )}

          {/* Barra busqueda/filtros */}
          <div style={{display:"flex",gap:8,padding:"7px 12px",background:"#111827",
            borderBottom:"1px solid #1e293b",flexWrap:"wrap",alignItems:"center",flexShrink:0}}>
            <div style={{position:"relative",flex:"1 1 200px",minWidth:160}}>
              <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",
                color:"#475569",fontSize:13}}></span>
              <input value={busqueda} onChange={e=>setBusqueda(e.target.value)}
                placeholder="Buscar codigo o descripcion..."
                style={{background:"#0f172a",border:"1px solid #334155",borderRadius:6,
                  color:"#e2e8f0",padding:"5px 10px 5px 28px",fontSize:12,width:"100%",outline:"none"}}/>
            </div>
            <button onClick={()=>setSoloConCantidad(v=>!v)}
              style={{background:soloConCantidad?"#2563eb30":"#1e293b",
                border:`1px solid ${soloConCantidad?"#3b82f6":"#334155"}`,
                color:soloConCantidad?"#60a5fa":"#94a3b8",borderRadius:6,
                padding:"5px 12px",fontSize:11,cursor:"pointer",whiteSpace:"nowrap"}}>
              {soloConCantidad?"ok Con cantidad":"Todos"}
            </button>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {Object.entries(EST_CFG).map(([est,c]) => {
                const cnt = mats.filter(m=>m.EstadoMat===est).length;
                return cnt>0?(
                  <span key={est} style={{fontSize:10,display:"flex",alignItems:"center",gap:4}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:c.dot,display:"inline-block"}}/>
                    <span style={{color:"#64748b"}}>{est}</span>
                    <span style={{color:c.text,fontWeight:700}}>{cnt}</span>
                  </span>
                ):null;
              })}
            </div>
          </div>

          {/* Materiales */}
          <div style={{flex:1,minHeight:0,overflowY:"auto",padding:"8px 12px",
            display:"flex",flexDirection:"column",gap:6}}>
            {matsFiltradas.length===0 && (
              <div style={{textAlign:"center",padding:"40px 20px",color:"#475569",fontSize:13}}>
                No hay materiales que coincidan
              </div>
            )}
            {matsFiltradas.map(m => {
              const sinPendiente = m.Pendiente<=0;
              const pct = m.Presupuestado>0?Math.min(100,(m.Entregado/m.Presupuestado)*100):0;
              const barColor = pct>=100?"#4ade80":pct>=50?"#60a5fa":"#fb923c";
              return (
                <div key={m.IDBSalidaDET}
                  style={{background:m.CantidadEntregable>0?"#1a2540":"#111827",
                    border:`1px solid ${m.CantidadEntregable>0?"#2563eb60":"#1e293b"}`,
                    borderRadius:10,padding:"10px 12px",transition:"all 0.15s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                        <span style={{fontSize:10,fontFamily:"monospace",background:"#0f172a",
                          color:"#94a3b8",borderRadius:4,padding:"2px 6px",border:"1px solid #334155"}}>
                          {m.Codigo}
                        </span>
                        {m.EstadoMat && <Badge estado={m.EstadoMat}/>}
                      </div>
                      <div style={{fontSize:13,fontWeight:600,marginTop:4,lineHeight:1.3,
                        color:sinPendiente?"#475569":"#e2e8f0",
                        textDecoration:sinPendiente?"line-through":"none"}}>
                        {m.Descripcion}
                      </div>
                    </div>
                    {/* Control +/- */}
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flexShrink:0}}>
                      <div style={{display:"flex",alignItems:"center",
                        background:"#0f172a",borderRadius:8,border:"1px solid #334155",overflow:"hidden"}}>
                        <button onClick={()=>setCantidad(m.IDBSalidaDET,-1)} disabled={sinPendiente}
                          style={{width:30,height:30,background:"none",border:"none",
                            color:sinPendiente?"#334155":"#f87171",
                            fontSize:16,cursor:sinPendiente?"not-allowed":"pointer",fontWeight:700,lineHeight:1}}>
                          -
                        </button>
                        <input type="number" value={m.CantidadEntregable}
                          onChange={e=>setCantidadDirecta(m.IDBSalidaDET,Number(e.target.value))}
                          disabled={sinPendiente}
                          style={{width:48,height:30,background:"transparent",border:"none",
                            textAlign:"center",fontSize:14,fontWeight:700,outline:"none",
                            color:sinPendiente?"#334155":m.CantidadEntregable>0?"#60a5fa":"#94a3b8",
                            cursor:sinPendiente?"not-allowed":"text"}}/>
                        <button onClick={()=>setCantidad(m.IDBSalidaDET,+1)} disabled={sinPendiente}
                          style={{width:30,height:30,background:"none",border:"none",
                            color:sinPendiente?"#334155":"#4ade80",
                            fontSize:16,cursor:sinPendiente?"not-allowed":"pointer",fontWeight:700,lineHeight:1}}>
                          +
                        </button>
                      </div>
                      <span style={{fontSize:10,color:"#475569"}}>{m.Unidad}</span>
                      {!sinPendiente && (
                        <button onClick={()=>setCantidadDirecta(m.IDBSalidaDET,m.Pendiente)}
                          style={{fontSize:9,background:"none",border:"1px solid #334155",color:"#64748b",
                            borderRadius:4,padding:"1px 6px",cursor:"pointer",marginTop:1}}>
                          Max {m.Pendiente}
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Barra progreso */}
                  <div style={{marginTop:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:10,color:"#64748b"}}>
                        Presupuestado <b style={{color:"#94a3b8"}}>{m.Presupuestado} {m.Unidad}</b>
                      </span>
                      <span style={{fontSize:10,color:"#64748b"}}>
                        Entregado <b style={{color:barColor}}>{m.Entregado}</b>
                        {"  .  "}
                        Pendiente <b style={{color:"#f59e0b"}}>{m.Pendiente} {m.Unidad}</b>
                        {m.CantidadEntregable>0&&(
                          <span style={{color:"#60a5fa"}}> Entregando <b>{m.CantidadEntregable}</b></span>
                        )}
                      </span>
                    </div>
                    <div style={{height:4,background:"#1e293b",borderRadius:2,position:"relative",overflow:"visible"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:barColor,borderRadius:2,transition:"width 0.4s"}}/>
                      {m.CantidadEntregable>0&&m.Presupuestado>0&&(
                        <div style={{position:"absolute",top:0,height:"100%",
                          left:`${pct}%`,
                          width:`${Math.min((m.CantidadEntregable/m.Presupuestado)*100,100-pct)}%`,
                          background:"#3b82f680",borderRadius:"0 2px 2px 0"}}/>
                      )}
                    </div>
                  </div>
                  {m.locationCode && (
                    <div style={{marginTop:5,display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontSize:10,background:"#0f172a",color:"#64748b",
                        borderRadius:4,padding:"1px 6px",border:"1px solid #1e293b"}}>
                         {m.locationCode}
                      </span>
                      <span style={{color:"#334155",fontSize:12}}></span>
                      <span style={{fontSize:10,background:"#1e3a5f40",color:"#93c5fd",
                        borderRadius:4,padding:"1px 6px",border:"1px solid #2563eb40"}}>
                         {m.newLocationCode}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer editar */}
          <div style={{background:"#111827",borderTop:"1px solid #1e293b",
            padding:"10px 14px",display:"flex",justifyContent:"space-between",
            alignItems:"center",flexShrink:0}}>
            <div style={{fontSize:12,color:"#64748b"}}>
              {enviables.length>0
                ? <span style={{color:"#60a5fa"}}><b>{enviables.length}</b> materiales seleccionados</span>
                : "Seleccione cantidades a entregar"
              }
            </div>
            <button
              onClick={()=>{if(enviables.length===0){alert("Seleccione al menos un material con cantidad > 0");return;}setFase("firmar");}}
              style={{background:enviables.length>0?"linear-gradient(135deg,#2563eb,#1d4ed8)":"#1e293b",
                border:"none",borderRadius:8,color:enviables.length>0?"#fff":"#475569",
                padding:"9px 22px",fontSize:13,fontWeight:700,cursor:enviables.length>0?"pointer":"not-allowed",
                display:"flex",alignItems:"center",gap:6,transition:"all 0.2s"}}>
              Confirmar y Firmar 
            </button>
          </div>
        </div>
      )}

      {/* 
          FASE 2: FIRMA
       */}
      {fase==="firmar" && (
        <div style={{flex:1,minHeight:0,overflowY:"auto",padding:"12px 14px",
          display:"flex",flexDirection:"column",gap:12}}>
          {/* Resumen materiales */}
          <div style={{background:"#111827",borderRadius:10,border:"1px solid #1e293b",overflow:"hidden"}}>
            <div style={{padding:"10px 14px",background:"#1e293b",
              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,fontWeight:700,color:"#94a3b8",letterSpacing:0.5}}>
                MATERIALES A ENTREGAR
              </span>
              <span style={{fontSize:12,background:"#2563eb30",color:"#60a5fa",
                border:"1px solid #2563eb50",borderRadius:10,padding:"2px 10px"}}>
                {enviables.length} items
              </span>
            </div>
            <div style={{padding:"8px 0"}}>
              {enviables.map((m,i)=>(
                <div key={m.IDBSalidaDET}
                  style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                    padding:"7px 14px",background:i%2===0?"transparent":"#0f172a10",
                    borderBottom:i<enviables.length-1?"1px solid #1e293b":"none"}}>
                  <div>
                    <span style={{fontSize:10,fontFamily:"monospace",color:"#64748b",marginRight:8}}>
                      {m.Codigo}
                    </span>
                    <span style={{fontSize:12,color:"#e2e8f0"}}>{m.Descripcion}</span>
                  </div>
                  <span style={{fontSize:14,fontWeight:700,color:"#60a5fa",whiteSpace:"nowrap"}}>
                    {m.CantidadEntregable} <span style={{fontSize:10,color:"#64748b"}}>{m.Unidad}</span>
                  </span>
                </div>
              ))}
            </div>
            <div style={{padding:"8px 14px",background:"#0f172a",borderTop:"2px solid #1e293b",
              display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:11,color:"#64748b"}}>Destino</span>
              <span style={{fontSize:12,color:"#93c5fd",fontWeight:700}}>
                 {enviables[0]?.newLocationCode}
              </span>
            </div>
          </div>
          {/* Selector despachador */}
          <div style={{background:"#111827",borderRadius:10,border:"1px solid #1e293b",padding:"12px 14px"}}>
            <div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:0.5,marginBottom:8}}>
              DESPACHADO POR
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {colabList.map(c=>(
                <button key={c.IDCol} onClick={()=>setDespachador(c)}
                  style={{display:"flex",alignItems:"center",gap:7,
                    background:despachador?.IDCol===c.IDCol?"#2563eb20":"#0f172a",
                    border:`1px solid ${despachador?.IDCol===c.IDCol?"#3b82f6":"#334155"}`,
                    borderRadius:8,padding:"6px 12px",cursor:"pointer",transition:"all 0.15s"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:"#2563eb",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>
                    {c.Iniciales}
                  </div>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:12,fontWeight:600,
                      color:despachador?.IDCol===c.IDCol?"#60a5fa":"#e2e8f0"}}>
                      {c.Nombre}
                    </div>
                    <div style={{fontSize:10,color:"#64748b"}}>{c.IDCol}</div>
                  </div>
                  {despachador?.IDCol===c.IDCol&&(
                    <span style={{color:"#4ade80",fontSize:14,marginLeft:2}}>ok</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          {/* Firma */}
          <div style={{background:"#111827",borderRadius:10,border:"1px solid #1e293b",padding:"12px 14px"}}>
            <div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:0.5,marginBottom:8,
              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>FIRMA DEL DESPACHADOR</span>
              {firma
                ? <span style={{color:"#4ade80",fontSize:11}}>ok Firma registrada</span>
                : <span style={{color:"#f59e0b",fontSize:11}}>Pendiente</span>
              }
            </div>
            <FirmaCanvas onFirma={setFirma}/>
          </div>
          {/* Botones */}
          <div style={{display:"flex",gap:8,paddingBottom:12}}>
            <button onClick={()=>setFase("editar")}
              style={{flex:"0 0 auto",background:"#1e293b",border:"1px solid #334155",
                borderRadius:8,color:"#94a3b8",padding:"10px 18px",fontSize:13,cursor:"pointer"}}>
              Volver
            </button>
            <button onClick={confirmarEntrega} disabled={!firma||!despachador}
              style={{flex:1,background:firma&&despachador
                  ?"linear-gradient(135deg,#16a34a,#15803d)":"#1e293b",
                border:"none",borderRadius:8,
                color:firma&&despachador?"#fff":"#475569",
                padding:"10px 22px",fontSize:14,fontWeight:700,
                cursor:firma&&despachador?"pointer":"not-allowed",
                display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.2s"}}>
               Guardar y Enviar a Business Central
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 
// EXPORT
// 
export function renderApp(
  container: HTMLDivElement,
  props: AppProps,
  prevRoot: Root | null
): Root {
  const root = prevRoot ?? createRoot(container);
  root.render(<App {...props}/>);
  return root;
}