import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from "recharts";

const MO=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MI={Jan:0,Fev:1,Mar:2,Abr:3,Mai:4,Jun:5,Jul:6,Ago:7,Set:8,Out:9,Nov:10,Dez:11};
const CF0={nome:"Ramon",socio:"Rodger",temSocio:true,suaParte:50,closerPct:15,reservaPct:32,dasMei:86.05,rCarro:75,limiteMei:81000};
const C0=[{id:1,mes:"Jan",data:"2026-01-06",cliente:"Laion Confiauto",tipo:"seguros",tel:"",valor:300,closer:false,closerN:"",status:"pago"},{id:2,mes:"Fev",data:"2026-01-10",cliente:"Rei das 2Rodas",tipo:"Concessionaria",tel:"",valor:800,closer:false,closerN:"",status:"pago"},{id:3,mes:"Fev",data:"2026-02-06",cliente:"Laion Confiauto",tipo:"seguros",tel:"",valor:250,closer:false,closerN:"",status:"pago"},{id:4,mes:"Mar",data:"2026-02-10",cliente:"Rei das 2Rodas",tipo:"Concessionaria",tel:"",valor:800,closer:false,closerN:"",status:"pago"},{id:5,mes:"Mar",data:"2026-03-20",cliente:"Lari Honda",tipo:"Consorcio",tel:"",valor:300,closer:false,closerN:"",status:"pago"}];
const D0=[{id:1,mes:"Jan",data:"2026-01-23",desc:"Curso",cat:"estudos",valor:32.87,pago:true},{id:2,mes:"Fev",data:"2026-02-06",desc:"Curso",cat:"estudos",valor:32.87,pago:true},{id:3,mes:"Fev",data:"2026-02-11",desc:"Logomarca",cat:"outros",valor:400,pago:true},{id:4,mes:"Mar",data:"2026-03-11",desc:"Logomarca",cat:"outros",valor:400,pago:true},{id:5,mes:"Abr",data:"2026-04-11",desc:"Logomarca",cat:"outros",valor:400,pago:true},{id:6,mes:"Abr",data:"2026-04-11",desc:"Churrasco",cat:"outros",valor:241.80,pago:true},{id:7,mes:"Abr",data:"2026-04-07",desc:"Restaurante",cat:"outros",valor:186.69,pago:true}];
const V0=[];

const $=v=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const $s=v=>Math.abs(v)>=1e3?"R$"+(v/1e3).toFixed(1)+"k":"R$"+v.toFixed(0);
const ld=async(k,fb)=>{try{const r=await localStorage.getItem(k);return r?JSON.parse(r):fb}catch{return fb}};
const sv=async(k,v)=>{try{await localStorage.setItem(k,JSON.stringify(v))}catch(e){console.error(e)}};

// Brand Palette from Manual de Marca Continental 2026
const BG="#001628";     // Navy escuro - fundo principal
const BG2="#001E35";    // Navy médio - superfícies
const BG3="#002A4A";    // Navy claro - cards hover
const PRI="#006689";    // Azul petróleo - cor primária
const PRI2="#007AA3";   // Azul claro - hover
const ICE="#E2F0F0";    // Mint gelo - secundária
const WHT="#F9F9F9";    // Branco - texto
const TXT2="#7BA8B8";   // Texto secundário
const TXT3="#4A7A8A";   // Texto terciário
const OK="#00C9A7";     // Verde sucesso
const ERR="#FF6B6B";    // Vermelho erro
const WARN="#FFB347";   // Amarelo aviso
const PUR="#8B7EC8";    // Roxo divisão

const CATC={estudos:"#6B9BD2",ferramentas:"#FFB347",marketing:"#FF6B6B","alimentação":"#00C9A7",transporte:"#8B7EC8",outros:PRI};

const CTip=({active,payload,label})=>{
  if(!active||!payload?.length)return null;
  return(<div style={{background:BG2,border:"1px solid "+PRI+"44",borderRadius:10,padding:"10px 14px",fontSize:12,boxShadow:"0 12px 40px rgba(0,0,0,0.6)"}}>
    <div style={{color:ICE,fontWeight:700,marginBottom:6,fontSize:13,letterSpacing:1}}>{label}</div>
    {payload.map((p,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",gap:20,padding:"2px 0"}}>
      <span style={{color:TXT2,fontSize:11}}>{p.name}</span><span style={{fontWeight:600,color:p.color||WHT}}>{$(p.value)}</span>
    </div>))}
  </div>);
};

// Penguin Logo SVG - Pinguim Niilista
const PenguinLogo=({size=36,color=ICE})=>(<svg width={size} height={size} viewBox="0 0 100 120" fill={color}>
  <path d="M55 4c3-1 7 0 9 3 3 4 2 8 0 12l-4 6c-1 2-1 4 0 6l3 5c5 7 3 14-2 18-3 2-5 5-5 9v18c0 4-1 7-4 9-2 2-5 3-8 3h-2c-3-1-5-2-7-5-1-2-2-5-2-8V63c0-4-2-7-5-10-5-4-7-11-3-17l4-6c2-2 2-5 0-7l-3-5c-3-4-3-9 0-12 2-3 5-4 8-3 4 1 6 4 7 8l1 5c0 2 1 3 3 3s3-1 3-3l1-5c1-4 3-7 6-8z"/>
  <ellipse cx="68" cy="95" rx="10" ry="12" transform="rotate(20 68 95)"/>
  <circle cx="43" cy="20" r="3" fill={BG}/>
</svg>);

function KPI({label,value,sub,accent,icon,trend}){
  const[hov,setHov]=useState(false);
  return(<div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
    background:hov?"linear-gradient(145deg,"+BG3+","+BG2+")":"linear-gradient(145deg,"+BG2+","+BG+")",
    border:"1px solid "+(hov?PRI+"44":PRI+"22"),borderRadius:14,padding:"20px 22px",flex:"1 1 210px",minWidth:180,
    position:"relative",overflow:"hidden",transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)",
    transform:hov?"translateY(-2px)":"none",boxShadow:hov?"0 8px 28px rgba(0,102,137,0.12)":"0 2px 8px rgba(0,0,0,0.3)"
  }}>
    <div style={{position:"absolute",top:-12,right:-4,fontSize:48,opacity:0.06,userSelect:"none"}}>{icon}</div>
    <div style={{fontSize:10,color:TXT3,textTransform:"uppercase",letterSpacing:2,marginBottom:10,fontWeight:600}}>{icon&&<span style={{marginRight:6}}>{icon}</span>}{label}</div>
    <div style={{fontSize:28,fontWeight:800,color:accent||ICE,letterSpacing:1,lineHeight:1}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:TXT3,marginTop:8}}>{sub}</div>}
    {trend!==undefined&&trend!==0&&(<div style={{position:"absolute",top:14,right:14,fontSize:11,fontWeight:700,
      color:trend>0?OK:ERR,background:trend>0?OK+"15":ERR+"15",padding:"2px 8px",borderRadius:6}}>
      {trend>0?"▲":"▼"} {Math.abs(trend).toFixed(0)}%</div>)}
  </div>);
}

function Modal({open,onClose,title,children}){
  if(!open)return null;
  return(<div style={{position:"fixed",inset:0,zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",
    background:"rgba(0,10,20,0.85)",backdropFilter:"blur(8px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(180deg,"+BG2+","+BG+")",
      border:"1px solid "+PRI+"33",borderRadius:18,padding:"28px",width:"92%",maxWidth:540,maxHeight:"88vh",overflowY:"auto",
      boxShadow:"0 24px 80px rgba(0,0,0,0.6)",animation:"mIn 0.25s ease"}}>
      <style>{"@keyframes mIn{from{opacity:0;transform:scale(0.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}"}</style>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <h3 style={{color:ICE,margin:0,fontSize:20,fontWeight:800,letterSpacing:2}}>{title}</h3>
        <button onClick={onClose} style={{background:PRI+"15",border:"none",color:TXT2,fontSize:16,cursor:"pointer",width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      </div>{children}
    </div>
  </div>);
}

const F=({label,children})=>(<div style={{marginBottom:16}}>
  <label style={{display:"block",fontSize:10,color:TXT3,marginBottom:5,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600}}>{label}</label>{children}
</div>);

const iS={width:"100%",padding:"10px 14px",background:BG+"aa",border:"1px solid "+PRI+"22",borderRadius:10,color:WHT,fontSize:14,outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"};
const sS={...iS,appearance:"none",backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23006689' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center"};
const bP={padding:"11px 28px",background:"linear-gradient(135deg,"+PRI+","+PRI2+")",border:"none",borderRadius:10,color:WHT,fontWeight:700,cursor:"pointer",fontSize:14,transition:"all 0.2s",boxShadow:"0 4px 16px rgba(0,102,137,0.25)"};
const bSt={padding:"11px 28px",background:"transparent",border:"1px solid "+PRI+"44",borderRadius:10,color:PRI2,cursor:"pointer",fontSize:14};

function Badge({status}){
  const ok=status==="pago"||status===true;
  return(<span style={{padding:"3px 12px",borderRadius:20,fontSize:11,fontWeight:700,letterSpacing:0.5,
    background:ok?OK+"15":ERR+"15",color:ok?OK:ERR,border:"1px solid "+(ok?OK+"22":ERR+"22")
  }}>{typeof status==="boolean"?(status?"SIM":"NÃO"):status||"pendente"}</span>);
}

function Tog({options,value,onChange,colors}){
  return(<div style={{display:"flex",gap:6}}>
    {options.map(o=>{const v=typeof o==="object"?o.value:o;const l=typeof o==="object"?o.label:String(o);
      const sel=value===v;const c=(colors&&colors[v])||PRI;
      return(<button key={String(v)} onClick={()=>onChange(v)} style={{
        padding:"7px 18px",borderRadius:10,border:"1px solid "+(sel?c+"44":PRI+"22"),cursor:"pointer",
        background:sel?c+"18":"transparent",color:sel?c:TXT3,fontWeight:sel?700:500,fontSize:13,transition:"all 0.2s"
      }}>{l}</button>);
    })}
  </div>);
}

// Dot pattern element from brand
const DotPattern=({opacity=0.04})=>(<svg width="120" height="120" viewBox="0 0 120 120" style={{position:"absolute",right:-20,bottom:-20,opacity}}>
  {[0,1,2,3,4].map(r=>[0,1,2,3,4].map(c=><circle key={r+"-"+c} cx={12+c*24} cy={12+r*24} r={4} fill={PRI}/>))}
</svg>);

export default function App(){
  const[tab,setTab]=useState("dashboard");
  const[con,setCon]=useState(C0);const[des,setDes]=useState(D0);const[ven,setVen]=useState(V0);const[cfg,setCfg]=useState(CF0);
  const[ok,setOk]=useState(false);const[dm,setDm]=useState("Mar");const[mt,setMt]=useState(null);const[ei,setEi]=useState(null);
  const[search,setSearch]=useState("");const[fM,setFM]=useState("Todos");

  useEffect(()=>{(async()=>{setCon(await ld("cp3-c",C0));setDes(await ld("cp3-d",D0));setVen(await ld("cp3-v",V0));setCfg(await ld("cp3-f",CF0));setOk(true)})()},[]);
  useEffect(()=>{if(ok)sv("cp3-c",con)},[con,ok]);useEffect(()=>{if(ok)sv("cp3-d",des)},[des,ok]);
  useEffect(()=>{if(ok)sv("cp3-v",ven)},[ven,ok]);useEffect(()=>{if(ok)sv("cp3-f",cfg)},[cfg,ok]);

  const fat=useMemo(()=>MO.map(m=>{
    const rc=con.filter(c=>c.mes===m).reduce((s,c)=>s+(c.valor||0),0);
    const rv=ven.filter(v=>v.mes===m).length*(cfg.rCarro||0);const tr=rc+rv;
    const cc=con.filter(c=>c.mes===m&&c.closer).reduce((s,c)=>s+c.valor*(cfg.closerPct/100),0);
    const dm2=tr>0?cfg.dasMei:0;const dp=des.filter(d=>d.mes===m).reduce((s,d)=>s+(d.valor||0),0);
    const tc=cc+dm2+dp;const lu=tr-tc;const re=lu*(cfg.reservaPct/100);const pd=lu-re;
    const vc=pd*(cfg.suaParte/100);const sc=cfg.temSocio?pd*((100-cfg.suaParte)/100):0;
    return{mes:m,rc,rv,tr,cc,dm:dm2,dp,tc,lu,re,vc,sc};
  }),[con,des,ven,cfg]);

  const resAc=useMemo(()=>{let a=0;return fat.map(f=>{a+=f.re;return a})},[fat]);
  const tot=useMemo(()=>{const t={r:0,c:0,l:0,v:0,s:0};fat.forEach(f=>{t.r+=f.tr;t.c+=f.tc;t.l+=f.lu;t.v+=f.vc;t.s+=f.sc});return t},[fat]);
  const dd=useMemo(()=>fat[MI[dm]]||fat[0],[fat,dm]);
  const pv=useMemo(()=>{const i=MI[dm];return i>0?fat[i-1]:null},[fat,dm]);
  const tr2=(c,p)=>p&&p!==0?((c-p)/Math.abs(p))*100:0;
  const despCat=useMemo(()=>{const m={};des.forEach(d=>{const c=d.cat||"outros";m[c]=(m[c]||0)+d.valor});return Object.entries(m).map(([name,value])=>({name,value}))},[des]);

  const fC=useMemo(()=>{let r=con;if(fM!=="Todos")r=r.filter(c=>c.mes===fM);if(search)r=r.filter(c=>c.cliente.toLowerCase().includes(search.toLowerCase()));return r},[con,fM,search]);
  const fD=useMemo(()=>{let r=des;if(fM!=="Todos")r=r.filter(d=>d.mes===fM);if(search)r=r.filter(d=>d.desc.toLowerCase().includes(search.toLowerCase()));return r},[des,fM,search]);
  const fV=useMemo(()=>{let r=ven;if(fM!=="Todos")r=r.filter(v=>v.mes===fM);if(search)r=r.filter(v=>(v.cliente||"").toLowerCase().includes(search.toLowerCase()));return r},[ven,fM,search]);

  const aC=i=>{setCon(p=>[...p,{...i,id:Date.now()}]);setMt(null)};const uC=i=>{setCon(p=>p.map(c=>c.id===i.id?i:c));setMt(null);setEi(null)};const dC=id=>setCon(p=>p.filter(c=>c.id!==id));
  const aD=i=>{setDes(p=>[...p,{...i,id:Date.now()}]);setMt(null)};const uD=i=>{setDes(p=>p.map(d=>d.id===i.id?i:d));setMt(null);setEi(null)};const dD=id=>setDes(p=>p.filter(d=>d.id!==id));
  const aV=i=>{setVen(p=>[...p,{...i,id:Date.now()}]);setMt(null)};const uV=i=>{setVen(p=>p.map(v=>v.id===i.id?i:v));setMt(null);setEi(null)};const dV=id=>setVen(p=>p.filter(v=>v.id!==id));
  const reset=()=>{if(window.confirm("Resetar todos os dados?")){setCon(C0);setDes(D0);setVen(V0);setCfg(CF0)}};
  const csv=(data,fn)=>{const h=Object.keys(data[0]||{}).join(";");const rows=data.map(d=>Object.values(d).join(";")).join("\n");const b=new Blob([h+"\n"+rows],{type:"text/csv;charset=utf-8"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=fn;a.click()};

  const tabs=[{id:"dashboard",l:"Dashboard",i:"📊"},{id:"contratos",l:"Contratos",i:"📋"},{id:"despesas",l:"Despesas",i:"💸"},{id:"vendas",l:"Vendas",i:"🚗"},{id:"faturamento",l:"Faturamento",i:"💵"},{id:"config",l:"Config",i:"⚙️"}];

  const SB=()=>(<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
    <div style={{position:"relative",flex:"1 1 200px"}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:TXT3,fontSize:14}}>🔍</span>
      <input placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)} style={{...iS,paddingLeft:36}}/></div>
    <select value={fM} onChange={e=>setFM(e.target.value)} style={{...sS,width:"auto",padding:"10px 36px 10px 14px",minWidth:100}}>
      <option value="Todos">Todos</option>{MO.map(m=><option key={m} value={m}>{m}</option>)}</select>
  </div>);

  const thS={padding:"12px 10px",textAlign:"left",color:ICE,fontSize:10,textTransform:"uppercase",letterSpacing:1.5,fontWeight:700,whiteSpace:"nowrap"};
  const tdS={padding:"11px 10px"};
  const ab=(fn,e,c)=>(<button onClick={fn} style={{background:"none",border:"none",color:c,cursor:"pointer",fontSize:15,opacity:0.5,transition:"opacity 0.2s",marginLeft:4}} onMouseEnter={e2=>e2.currentTarget.style.opacity=1} onMouseLeave={e2=>e2.currentTarget.style.opacity=0.5}>{e}</button>);

  return(<div style={{fontFamily:"'Inter','Segoe UI',sans-serif",background:BG,color:WHT,minHeight:"100vh",overflowX:"hidden",maxWidth:"100vw",overflowX:"hidden",maxWidth:"100vw",overflowX:"hidden",maxWidth:"100vw",overflowX:"hidden",maxWidth:"100vw"}}>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
    <style>{`*{scrollbar-width:thin;scrollbar-color:${PRI}44 transparent}::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-thumb{background:${PRI}44;border-radius:3px}::selection{background:${PRI};color:${WHT}}input:focus,select:focus{border-color:${PRI}!important;outline:none}@keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.fu{animation:fu 0.4s ease forwards}table tr:hover td{background:${PRI}08!important}`}</style>

    {/* HEADER */}
    <div style={{background:"linear-gradient(135deg,"+BG2+","+BG+")",borderBottom:"1px solid "+PRI+"22",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,position:"sticky",top:0,zIndex:100,backdropFilter:"blur(12px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <PenguinLogo size={34} color={ICE}/>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:ICE,letterSpacing:4,lineHeight:1}}>continental</div>
          <div style={{fontSize:9,color:PRI,letterSpacing:4,fontWeight:700,textTransform:"uppercase"}}>performance • caixa 2026</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:OK,boxShadow:"0 0 8px "+OK}}/><span style={{fontSize:11,color:TXT3}}>{cfg.nome}</span>
      </div>
    </div>

    {/* TABS */}
    <div style={{display:"flex",gap:0,padding:"0 12px",background:BG2,borderBottom:"1px solid "+PRI+"15",overflowX:"auto"}}>
      {tabs.map(t=>(<button key={t.id} onClick={()=>{setTab(t.id);setSearch("");setFM("Todos")}} style={{
        padding:"12px 16px",background:tab===t.id?PRI+"12":"transparent",border:"none",
        borderBottom:tab===t.id?"2px solid "+PRI:"2px solid transparent",
        color:tab===t.id?ICE:TXT3,cursor:"pointer",fontSize:12,fontWeight:tab===t.id?700:500,
        whiteSpace:"nowrap",transition:"all 0.25s",letterSpacing:0.5
      }}><span style={{marginRight:5}}>{t.i}</span>{t.l}</button>))}
    </div>

    <div style={{padding:"24px 18px",maxWidth:1200,margin:"0 auto"}} className="fu" key={tab}>

    {/* DASHBOARD */}
    {tab==="dashboard"&&(<div>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24,flexWrap:"wrap"}}>
        <h2 style={{margin:0,color:ICE,fontSize:26,letterSpacing:3,fontWeight:800}}>DASHBOARD</h2>
        <div style={{display:"flex",gap:3,background:BG2,borderRadius:10,padding:3,border:"1px solid "+PRI+"15"}}>
          {MO.map(m=>(<button key={m} onClick={()=>setDm(m)} style={{padding:"5px 9px",borderRadius:7,border:"none",cursor:"pointer",fontSize:11,fontWeight:dm===m?700:400,background:dm===m?PRI+"28":"transparent",color:dm===m?ICE:TXT3,transition:"all 0.2s"}}>{m}</button>))}
        </div>
      </div>

      <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:28}}>
        <KPI icon="💰" label="Receita" value={$(dd.tr)} sub={"Contratos: "+$(dd.rc)} trend={tr2(dd.tr,pv?.tr)}/>
        <KPI icon="💸" label="Custos" value={$(dd.tc)} sub={"Desp: "+$(dd.dp)} accent={WARN} trend={tr2(dd.tc,pv?.tc)}/>
        <KPI icon="📈" label="Lucro" value={$(dd.lu)} accent={dd.lu>=0?OK:ERR} trend={tr2(dd.lu,pv?.lu)}/>
        <KPI icon="🏦" label="Reserva Acum." value={$(resAc[MI[dm]])} sub={cfg.reservaPct+"% do lucro"} accent={PUR}/>
      </div>

      <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:28}}>
        <div style={{flex:"1 1 420px",background:BG2,border:"1px solid "+PRI+"15",borderRadius:14,padding:"20px 16px 8px",position:"relative",overflow:"hidden"}}>
          <DotPattern/>
          <div style={{fontSize:11,color:TXT3,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:12,paddingLeft:8}}>RECEITA vs LUCRO</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={fat} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke={PRI+"10"}/>
              <XAxis dataKey="mes" tick={{fill:TXT3,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:TXT3,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={$s}/>
              <Tooltip content={<CTip/>}/>
              <Bar dataKey="tr" name="Receita" fill={PRI} radius={[4,4,0,0]} maxBarSize={28}/>
              <Bar dataKey="lu" name="Lucro" fill={OK} radius={[4,4,0,0]} maxBarSize={28}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{flex:"1 1 320px",background:BG2,border:"1px solid "+PRI+"15",borderRadius:14,padding:"20px 16px 8px"}}>
          <div style={{fontSize:11,color:TXT3,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:12,paddingLeft:8}}>RESERVA ACUMULADA</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={fat.map((f,i)=>({mes:f.mes,reserva:resAc[i]}))}>
              <defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={PRI} stopOpacity={0.35}/><stop offset="95%" stopColor={PRI} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={PRI+"10"}/>
              <XAxis dataKey="mes" tick={{fill:TXT3,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:TXT3,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={$s}/>
              <Tooltip content={<CTip/>}/>
              <Area type="monotone" dataKey="reserva" name="Reserva" stroke={PRI} fill="url(#gr)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
        {/* Divisão */}
        <div style={{flex:"1 1 300px",background:BG2,border:"1px solid "+PRI+"15",borderRadius:14,padding:22,position:"relative",overflow:"hidden"}}>
          <DotPattern opacity={0.03}/>
          <div style={{fontSize:11,color:TXT3,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:18}}>👥 DIVISÃO — {dm}</div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:16}}>
            <div style={{flex:1,minWidth:120,padding:14,background:OK+"0A",borderRadius:12,textAlign:"center",border:"1px solid "+OK+"15"}}>
              <div style={{fontSize:10,color:TXT3,marginBottom:4,fontWeight:600}}>{cfg.nome}</div>
              <div style={{fontSize:24,fontWeight:800,color:OK}}>{$(dd.vc)}</div>
              <div style={{fontSize:10,color:TXT3,marginTop:4}}>{cfg.suaParte}%</div>
            </div>
            {cfg.temSocio&&(<div style={{flex:1,minWidth:120,padding:14,background:PUR+"0A",borderRadius:12,textAlign:"center",border:"1px solid "+PUR+"15"}}>
              <div style={{fontSize:10,color:TXT3,marginBottom:4,fontWeight:600}}>{cfg.socio}</div>
              <div style={{fontSize:24,fontWeight:800,color:PUR}}>{$(dd.sc)}</div>
              <div style={{fontSize:10,color:TXT3,marginTop:4}}>{100-cfg.suaParte}%</div>
            </div>)}
          </div>
          <div style={{padding:12,background:PRI+"0A",borderRadius:10,textAlign:"center",border:"1px solid "+PRI+"15"}}>
            <div style={{fontSize:10,color:TXT3,marginBottom:2}}>Reserva do mês</div>
            <div style={{fontSize:18,fontWeight:800,color:ICE}}>{$(dd.re)}</div>
          </div>
        </div>

        {/* Despesas Cat */}
        <div style={{flex:"1 1 250px",background:BG2,border:"1px solid "+PRI+"15",borderRadius:14,padding:22}}>
          <div style={{fontSize:11,color:TXT3,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>DESPESAS POR CATEGORIA</div>
          {despCat.length>0?(<>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart><Pie data={despCat} cx="50%" cy="50%" innerRadius={35} outerRadius={58} dataKey="value" stroke="none">
                {despCat.map((e,i)=>(<Cell key={i} fill={CATC[e.name]||PRI}/>))}</Pie></PieChart>
            </ResponsiveContainer>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>
              {despCat.map((c,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:TXT2}}>
                <div style={{width:8,height:8,borderRadius:2,background:CATC[c.name]||PRI}}/>{c.name}: {$(c.value)}
              </div>))}
            </div></>):(<div style={{textAlign:"center",color:TXT3,padding:40}}>Sem dados</div>)}
        </div>

        {/* MEI */}
        <div style={{flex:"1 1 250px",background:BG2,border:"1px solid "+PRI+"15",borderRadius:14,padding:22}}>
          <div style={{fontSize:11,color:TXT3,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:16}}>⚠️ ALERTA MEI</div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12}}><span style={{color:TXT3}}>Faturamento</span><span style={{fontWeight:600}}>{$(tot.r)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:14,fontSize:12}}><span style={{color:TXT3}}>Limite</span><span style={{fontWeight:600}}>{$(cfg.limiteMei)}</span></div>
          <div style={{background:PRI+"12",borderRadius:10,height:22,overflow:"hidden",marginBottom:10}}>
            <div style={{width:Math.min((tot.r/cfg.limiteMei)*100,100)+"%",height:"100%",borderRadius:10,transition:"width 0.8s",
              background:(tot.r/cfg.limiteMei)>0.8?"linear-gradient(90deg,"+ERR+",#c0392b)":"linear-gradient(90deg,"+PRI+","+PRI2+")",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:WHT,minWidth:40}}>
              {((tot.r/cfg.limiteMei)*100).toFixed(1)}%
            </div>
          </div>
          <div style={{textAlign:"center",fontSize:15,fontWeight:800,letterSpacing:2,
            color:(tot.r/cfg.limiteMei)>1?ERR:(tot.r/cfg.limiteMei)>0.8?WARN:OK}}>
            {(tot.r/cfg.limiteMei)>1?"❌ EXCEDIDO":(tot.r/cfg.limiteMei)>0.8?"⚠️ ATENÇÃO":"✅ OK"}
          </div>
          <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid "+PRI+"15"}}>
            <div style={{fontSize:10,color:TXT3,fontWeight:600,letterSpacing:1,marginBottom:10}}>RESUMO ANUAL</div>
            {[["Faturado",$(tot.r)],["Custos",$(tot.c)],["Lucro",$(tot.l)],[cfg.nome,$(tot.v)],...(cfg.temSocio?[[cfg.socio,$(tot.s)]]:[])].map(([l,v],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:12}}>
                <span style={{color:TXT3}}>{l}</span><span style={{fontWeight:600}}>{v}</span>
              </div>))}
          </div>
        </div>
      </div>
    </div>)}

    {/* CONTRATOS */}
    {tab==="contratos"&&(<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div><h2 style={{margin:0,color:ICE,fontSize:24,letterSpacing:3,fontWeight:800}}>📋 CONTRATOS</h2>
          <span style={{fontSize:11,color:TXT3}}>{con.length} contratos • {$(con.reduce((s,c)=>s+c.valor,0))}</span></div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>csv(con,"contratos.csv")} style={{...bSt,padding:"8px 16px",fontSize:12}}>📥 CSV</button>
          <button onClick={()=>{setEi(null);setMt("c")}} style={bP}>+ Novo</button>
        </div>
      </div><SB/>
      <div style={{overflowX:"auto",borderRadius:12,border:"1px solid "+PRI+"15",background:BG2}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{borderBottom:"2px solid "+PRI+"33"}}>{["Mês","Data","Cliente","Tipo","Valor","Closer?","Comissão","Status",""].map((h,i)=><th key={i} style={thS}>{h}</th>)}</tr></thead>
          <tbody>{fC.map(c=>(<tr key={c.id} style={{borderBottom:"1px solid "+PRI+"08"}}>
            <td style={{...tdS,color:TXT3}}>{c.mes}</td><td style={{...tdS,whiteSpace:"nowrap",color:TXT3}}>{c.data?new Date(c.data+"T12:00").toLocaleDateString("pt-BR"):"-"}</td>
            <td style={{...tdS,fontWeight:600}}>{c.cliente}</td>
            <td style={tdS}><span style={{background:PRI+"15",padding:"3px 10px",borderRadius:6,fontSize:11,color:ICE}}>{c.tipo}</span></td>
            <td style={{...tdS,fontWeight:700,color:OK,fontSize:15}}>{$(c.valor)}</td>
            <td style={tdS}>{c.closer?<span style={{color:PRI2,fontWeight:600}}>SIM</span>:<span style={{color:TXT3}}>NÃO</span>}</td>
            <td style={{...tdS,color:TXT2}}>{c.closer?$(c.valor*cfg.closerPct/100):$(0)}</td>
            <td style={tdS}><Badge status={c.status}/></td>
            <td style={{...tdS,whiteSpace:"nowrap"}}>{ab(()=>{setEi(c);setMt("c")},"✏️",PRI2)}{ab(()=>dC(c.id),"🗑️",ERR)}</td>
          </tr>))}{fC.length===0&&<tr><td colSpan={9} style={{padding:40,textAlign:"center",color:TXT3}}>Nenhum contrato</td></tr>}
          </tbody></table></div>
    </div>)}

    {/* DESPESAS */}
    {tab==="despesas"&&(<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div><h2 style={{margin:0,color:ICE,fontSize:24,letterSpacing:3,fontWeight:800}}>💸 DESPESAS</h2>
          <span style={{fontSize:11,color:TXT3}}>{des.length} despesas • {$(des.reduce((s,d)=>s+d.valor,0))}</span></div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>csv(des,"despesas.csv")} style={{...bSt,padding:"8px 16px",fontSize:12}}>📥 CSV</button>
          <button onClick={()=>{setEi(null);setMt("d")}} style={bP}>+ Nova</button>
        </div>
      </div><SB/>
      <div style={{overflowX:"auto",borderRadius:12,border:"1px solid "+PRI+"15",background:BG2}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{borderBottom:"2px solid "+PRI+"33"}}>{["Mês","Data","Descrição","Categoria","Valor","Pago?",""].map((h,i)=><th key={i} style={thS}>{h}</th>)}</tr></thead>
          <tbody>{fD.map(d=>(<tr key={d.id} style={{borderBottom:"1px solid "+PRI+"08"}}>
            <td style={{...tdS,color:TXT3}}>{d.mes}</td><td style={{...tdS,whiteSpace:"nowrap",color:TXT3}}>{d.data?new Date(d.data+"T12:00").toLocaleDateString("pt-BR"):"-"}</td>
            <td style={{...tdS,fontWeight:600}}>{d.desc}</td>
            <td style={tdS}><span style={{background:(CATC[d.cat]||PRI)+"15",padding:"3px 10px",borderRadius:6,fontSize:11,color:CATC[d.cat]||ICE}}>{d.cat}</span></td>
            <td style={{...tdS,fontWeight:700,color:WARN,fontSize:15}}>{$(d.valor)}</td>
            <td style={tdS}><Badge status={d.pago}/></td>
            <td style={{...tdS,whiteSpace:"nowrap"}}>{ab(()=>{setEi(d);setMt("d")},"✏️",PRI2)}{ab(()=>dD(d.id),"🗑️",ERR)}</td>
          </tr>))}{fD.length===0&&<tr><td colSpan={7} style={{padding:40,textAlign:"center",color:TXT3}}>Nenhuma despesa</td></tr>}
          </tbody></table></div>
    </div>)}

    {/* VENDAS */}
    {tab==="vendas"&&(<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div><h2 style={{margin:0,color:ICE,fontSize:24,letterSpacing:3,fontWeight:800}}>🚗 COMISSÕES POR VENDA</h2>
          <span style={{fontSize:11,color:TXT3}}>Comissão: {$(cfg.rCarro)} por venda</span></div>
        <div style={{display:"flex",gap:8}}>
          {ven.length>0&&<button onClick={()=>csv(ven,"vendas.csv")} style={{...bSt,padding:"8px 16px",fontSize:12}}>📥 CSV</button>}
          <button onClick={()=>{setEi(null);setMt("v")}} style={bP}>+ Nova</button>
        </div>
      </div><SB/>
      <div style={{overflowX:"auto",borderRadius:12,border:"1px solid "+PRI+"15",background:BG2}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{borderBottom:"2px solid "+PRI+"33"}}>{["Mês","Data","Cliente","Veículo","Valor","Comissão","Recebido?",""].map((h,i)=><th key={i} style={thS}>{h}</th>)}</tr></thead>
          <tbody>{fV.map(v=>(<tr key={v.id} style={{borderBottom:"1px solid "+PRI+"08"}}>
            <td style={{...tdS,color:TXT3}}>{v.mes}</td><td style={{...tdS,color:TXT3}}>{v.data?new Date(v.data+"T12:00").toLocaleDateString("pt-BR"):"-"}</td>
            <td style={{...tdS,fontWeight:600}}>{v.cliente}</td><td style={tdS}>{v.veiculo}</td>
            <td style={tdS}>{$(v.valorVenda||0)}</td>
            <td style={{...tdS,fontWeight:700,color:OK,fontSize:15}}>{$(cfg.rCarro)}</td>
            <td style={tdS}><Badge status={v.recebido}/></td>
            <td style={{...tdS,whiteSpace:"nowrap"}}>{ab(()=>{setEi(v);setMt("v")},"✏️",PRI2)}{ab(()=>dV(v.id),"🗑️",ERR)}</td>
          </tr>))}{fV.length===0&&<tr><td colSpan={8} style={{padding:40,textAlign:"center",color:TXT3}}>Nenhuma venda</td></tr>}
          </tbody></table></div>
    </div>)}

    {/* FATURAMENTO */}
    {tab==="faturamento"&&(<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <h2 style={{margin:0,color:ICE,fontSize:24,letterSpacing:3,fontWeight:800}}>💵 FATURAMENTO MENSAL</h2>
        <button onClick={()=>{const rows=[["","Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez","TOTAL"]];
          const ar=(l,k)=>{rows.push([l,...fat.map(f=>f[k].toFixed(2)),fat.reduce((s,f)=>s+f[k],0).toFixed(2)])};
          ar("Contratos","rc");ar("Vendas","rv");ar("Total Receita","tr");ar("Closer","cc");ar("DAS","dm");ar("Despesas","dp");ar("Total Custos","tc");ar("Lucro","lu");ar("Reserva","re");ar(cfg.nome,"vc");if(cfg.temSocio)ar(cfg.socio,"sc");
          const c2=rows.map(r=>r.join(";")).join("\n");const b=new Blob([c2],{type:"text/csv"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="faturamento_2026.csv";a.click();
        }} style={{...bSt,padding:"8px 16px",fontSize:12}}>📥 CSV</button>
      </div>
      <div style={{overflowX:"auto",borderRadius:12,border:"1px solid "+PRI+"15",background:BG2,padding:2}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:960}}>
          <thead><tr style={{borderBottom:"2px solid "+PRI+"33"}}>
            <th style={{padding:"12px 8px",textAlign:"left",color:ICE,fontSize:10,position:"sticky",left:0,background:BG2,zIndex:1,minWidth:120,letterSpacing:1.5}}></th>
            {MO.map(m=><th key={m} style={{padding:"12px 6px",textAlign:"right",color:ICE,fontSize:10,minWidth:76,letterSpacing:1}}>{m}</th>)}
            <th style={{padding:"12px 8px",textAlign:"right",color:ICE,fontSize:10,fontWeight:800,minWidth:90,letterSpacing:1}}>TOTAL</th>
          </tr></thead>
          <tbody>
            <tr><td colSpan={14} style={{padding:"14px 8px 6px",color:OK,fontWeight:800,fontSize:10,letterSpacing:2}}>RECEITAS</td></tr>
            {[{l:"Contratos",k:"rc"},{l:"Vendas",k:"rv"},{l:"TOTAL RECEITAS",k:"tr",b:1}].map(row=>(<tr key={row.k} style={{borderBottom:row.b?"1px solid "+OK+"22":"1px solid "+PRI+"08"}}>
              <td style={{padding:"7px 8px",fontWeight:row.b?700:400,position:"sticky",left:0,background:BG2,zIndex:1}}>{row.l}</td>
              {fat.map((f,i)=><td key={i} style={{padding:"7px 6px",textAlign:"right",fontWeight:row.b?700:400,color:row.b?OK:TXT2}}>{$(f[row.k])}</td>)}
              <td style={{padding:"7px 8px",textAlign:"right",fontWeight:700,color:OK}}>{$(fat.reduce((s,f)=>s+f[row.k],0))}</td>
            </tr>))}
            <tr><td colSpan={14} style={{padding:"16px 8px 6px",color:WARN,fontWeight:800,fontSize:10,letterSpacing:2}}>CUSTOS</td></tr>
            {[{l:"Closer",k:"cc"},{l:"DAS MEI",k:"dm"},{l:"Despesas",k:"dp"},{l:"TOTAL CUSTOS",k:"tc",b:1}].map(row=>(<tr key={row.k} style={{borderBottom:row.b?"1px solid "+WARN+"22":"1px solid "+PRI+"08"}}>
              <td style={{padding:"7px 8px",fontWeight:row.b?700:400,position:"sticky",left:0,background:BG2,zIndex:1}}>{row.l}</td>
              {fat.map((f,i)=><td key={i} style={{padding:"7px 6px",textAlign:"right",fontWeight:row.b?700:400,color:row.b?WARN:TXT2}}>{$(f[row.k])}</td>)}
              <td style={{padding:"7px 8px",textAlign:"right",fontWeight:700,color:WARN}}>{$(fat.reduce((s,f)=>s+f[row.k],0))}</td>
            </tr>))}
            <tr><td colSpan={14} style={{padding:"16px 8px 6px",color:ICE,fontWeight:800,fontSize:10,letterSpacing:2}}>RESULTADO</td></tr>
            <tr style={{borderBottom:"2px solid "+PRI+"33"}}>
              <td style={{padding:"10px 8px",fontWeight:800,position:"sticky",left:0,background:BG2,zIndex:1,fontSize:13,letterSpacing:1}}>LUCRO LÍQUIDO</td>
              {fat.map((f,i)=><td key={i} style={{padding:"10px 6px",textAlign:"right",fontWeight:700,color:f.lu>=0?OK:ERR,fontSize:13}}>{$(f.lu)}</td>)}
              <td style={{padding:"10px 8px",textAlign:"right",fontWeight:800,color:tot.l>=0?OK:ERR,fontSize:14}}>{$(tot.l)}</td>
            </tr>
            <tr><td colSpan={14} style={{padding:"16px 8px 6px",color:PUR,fontWeight:800,fontSize:10,letterSpacing:2}}>DIVISÃO</td></tr>
            {[{l:"Reserva",k:"re"},{l:cfg.nome,k:"vc"},...(cfg.temSocio?[{l:cfg.socio,k:"sc"}]:[])].map(row=>(<tr key={row.k} style={{borderBottom:"1px solid "+PRI+"08"}}>
              <td style={{padding:"7px 8px",position:"sticky",left:0,background:BG2,zIndex:1}}>{row.l}</td>
              {fat.map((f,i)=><td key={i} style={{padding:"7px 6px",textAlign:"right",color:f[row.k]>=0?TXT2:ERR}}>{$(f[row.k])}</td>)}
              <td style={{padding:"7px 8px",textAlign:"right",fontWeight:600}}>{$(fat.reduce((s,f)=>s+f[row.k],0))}</td>
            </tr>))}
            <tr style={{borderTop:"1px solid "+PRI+"22"}}>
              <td style={{padding:"10px 8px",fontWeight:800,color:ICE,position:"sticky",left:0,background:BG2,zIndex:1,letterSpacing:1}}>RESERVA ACUMULADA</td>
              {resAc.map((v,i)=><td key={i} style={{padding:"10px 6px",textAlign:"right",fontWeight:600,color:ICE}}>{$(v)}</td>)}<td></td>
            </tr>
          </tbody></table></div>
    </div>)}

    {/* CONFIG */}
    {tab==="config"&&(<div style={{maxWidth:540}}>
      <h2 style={{margin:"0 0 20px",color:ICE,fontSize:24,letterSpacing:3,fontWeight:800}}>⚙️ CONFIGURAÇÕES</h2>
      <div style={{background:BG2,border:"1px solid "+PRI+"15",borderRadius:14,padding:26}}>
        <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:180}}><F label="Seu Nome"><input style={iS} value={cfg.nome} onChange={e=>setCfg(p=>({...p,nome:e.target.value}))}/></F></div>
          <div style={{flex:1,minWidth:180}}><F label="Sócio"><input style={iS} value={cfg.socio} onChange={e=>setCfg(p=>({...p,socio:e.target.value}))}/></F></div>
        </div>
        <F label="Tem Sócio?"><Tog options={[{value:true,label:"SIM"},{value:false,label:"NÃO"}]} value={cfg.temSocio} onChange={v=>setCfg(p=>({...p,temSocio:v}))}/></F>
        <F label={"Sua Parte: "+cfg.suaParte+"%"}><input type="range" min={0} max={100} value={cfg.suaParte} onChange={e=>setCfg(p=>({...p,suaParte:Number(e.target.value)}))} style={{width:"100%",accentColor:PRI}}/></F>
        <F label={"% Closer: "+cfg.closerPct+"%"}><input type="range" min={0} max={50} value={cfg.closerPct} onChange={e=>setCfg(p=>({...p,closerPct:Number(e.target.value)}))} style={{width:"100%",accentColor:PRI}}/></F>
        <F label={"% Reserva: "+cfg.reservaPct+"%"}><input type="range" min={0} max={100} value={cfg.reservaPct} onChange={e=>setCfg(p=>({...p,reservaPct:Number(e.target.value)}))} style={{width:"100%",accentColor:PRI}}/></F>
        <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:130}}><F label="DAS MEI (R$)"><input type="number" style={iS} value={cfg.dasMei} onChange={e=>setCfg(p=>({...p,dasMei:Number(e.target.value)}))}/></F></div>
          <div style={{flex:1,minWidth:130}}><F label="R$/Carro"><input type="number" style={iS} value={cfg.rCarro} onChange={e=>setCfg(p=>({...p,rCarro:Number(e.target.value)}))}/></F></div>
          <div style={{flex:1,minWidth:130}}><F label="Limite MEI"><input type="number" style={iS} value={cfg.limiteMei} onChange={e=>setCfg(p=>({...p,limiteMei:Number(e.target.value)}))}/></F></div>
        </div>
        <div style={{marginTop:24,paddingTop:18,borderTop:"1px solid "+PRI+"15"}}>
          <button onClick={reset} style={{...bSt,color:ERR,borderColor:ERR+"44"}}>🔄 Resetar Tudo</button>
        </div>
      </div>
    </div>)}

    </div>

    {/* MODALS */}
    <Modal open={mt==="c"} onClose={()=>{setMt(null);setEi(null)}} title={ei?"EDITAR CONTRATO":"NOVO CONTRATO"}>
      <CForm init={ei} onSave={ei?uC:aC} cfg={cfg}/>
    </Modal>
    <Modal open={mt==="d"} onClose={()=>{setMt(null);setEi(null)}} title={ei?"EDITAR DESPESA":"NOVA DESPESA"}>
      <DForm init={ei} onSave={ei?uD:aD}/>
    </Modal>
    <Modal open={mt==="v"} onClose={()=>{setMt(null);setEi(null)}} title={ei?"EDITAR VENDA":"NOVA VENDA"}>
      <VForm init={ei} onSave={ei?uV:aV} cfg={cfg}/>
    </Modal>
  </div>);
}

function CForm({init,onSave,cfg}){
  const[f,sF]=useState(init||{mes:"Jan",data:"",cliente:"",tipo:"",tel:"",valor:0,closer:false,closerN:"",status:"pendente"});
  return(<div>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <div style={{width:100}}><F label="Mês"><select style={sS} value={f.mes} onChange={e=>sF(p=>({...p,mes:e.target.value}))}>{MO.map(m=><option key={m}>{m}</option>)}</select></F></div>
      <div style={{flex:1,minWidth:150}}><F label="Data"><input type="date" style={iS} value={f.data} onChange={e=>sF(p=>({...p,data:e.target.value}))}/></F></div>
    </div>
    <F label="Cliente"><input style={iS} value={f.cliente} onChange={e=>sF(p=>({...p,cliente:e.target.value}))} placeholder="Nome do cliente"/></F>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <div style={{flex:1,minWidth:140}}><F label="Tipo"><input style={iS} value={f.tipo} onChange={e=>sF(p=>({...p,tipo:e.target.value}))}/></F></div>
      <div style={{flex:1,minWidth:140}}><F label="Telefone"><input style={iS} value={f.tel} onChange={e=>sF(p=>({...p,tel:e.target.value}))}/></F></div>
    </div>
    <F label="Valor (R$)"><input type="number" step="0.01" style={iS} value={f.valor} onChange={e=>sF(p=>({...p,valor:Number(e.target.value)}))}/></F>
    <F label="Teve Closer?"><Tog options={[{value:true,label:"SIM"},{value:false,label:"NÃO"}]} value={f.closer} onChange={v=>sF(p=>({...p,closer:v}))}/></F>
    {f.closer&&<><F label="Closer"><input style={iS} value={f.closerN} onChange={e=>sF(p=>({...p,closerN:e.target.value}))}/></F>
      <div style={{fontSize:12,color:PRI2,marginBottom:14,background:PRI+"12",padding:"8px 12px",borderRadius:8}}>Comissão: {$(f.valor*cfg.closerPct/100)} ({cfg.closerPct}%)</div></>}
    <F label="Status"><Tog options={[{value:"pago",label:"Pago"},{value:"pendente",label:"Pendente"}]} value={f.status} onChange={v=>sF(p=>({...p,status:v}))} colors={{pago:OK,pendente:ERR}}/></F>
    <button onClick={()=>onSave(f)} style={{...bP,width:"100%",marginTop:8}}>{init?"Salvar":"Adicionar"}</button>
  </div>);
}

function DForm({init,onSave}){
  const[f,sF]=useState(init||{mes:"Jan",data:"",desc:"",cat:"outros",valor:0,pago:false});
  return(<div>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <div style={{width:100}}><F label="Mês"><select style={sS} value={f.mes} onChange={e=>sF(p=>({...p,mes:e.target.value}))}>{MO.map(m=><option key={m}>{m}</option>)}</select></F></div>
      <div style={{flex:1,minWidth:150}}><F label="Data"><input type="date" style={iS} value={f.data} onChange={e=>sF(p=>({...p,data:e.target.value}))}/></F></div>
    </div>
    <F label="Descrição"><input style={iS} value={f.desc} onChange={e=>sF(p=>({...p,desc:e.target.value}))}/></F>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <div style={{flex:1,minWidth:150}}><F label="Categoria"><select style={sS} value={f.cat} onChange={e=>sF(p=>({...p,cat:e.target.value}))}>
        {["estudos","ferramentas","marketing","alimentação","transporte","outros"].map(c=><option key={c}>{c}</option>)}</select></F></div>
      <div style={{flex:1,minWidth:150}}><F label="Valor (R$)"><input type="number" step="0.01" style={iS} value={f.valor} onChange={e=>sF(p=>({...p,valor:Number(e.target.value)}))}/></F></div>
    </div>
    <F label="Pago?"><Tog options={[{value:true,label:"SIM"},{value:false,label:"NÃO"}]} value={f.pago} onChange={v=>sF(p=>({...p,pago:v}))} colors={{"true":OK,"false":ERR}}/></F>
    <button onClick={()=>onSave(f)} style={{...bP,width:"100%",marginTop:8}}>{init?"Salvar":"Adicionar"}</button>
  </div>);
}

function VForm({init,onSave,cfg}){
  const[f,sF]=useState(init||{mes:"Jan",data:"",cliente:"",veiculo:"",valorVenda:0,recebido:false});
  return(<div>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <div style={{width:100}}><F label="Mês"><select style={sS} value={f.mes} onChange={e=>sF(p=>({...p,mes:e.target.value}))}>{MO.map(m=><option key={m}>{m}</option>)}</select></F></div>
      <div style={{flex:1,minWidth:150}}><F label="Data"><input type="date" style={iS} value={f.data} onChange={e=>sF(p=>({...p,data:e.target.value}))}/></F></div>
    </div>
    <F label="Cliente"><input style={iS} value={f.cliente} onChange={e=>sF(p=>({...p,cliente:e.target.value}))}/></F>
    <F label="Veículo"><input style={iS} value={f.veiculo} onChange={e=>sF(p=>({...p,veiculo:e.target.value}))}/></F>
    <F label="Valor Venda (R$)"><input type="number" step="0.01" style={iS} value={f.valorVenda} onChange={e=>sF(p=>({...p,valorVenda:Number(e.target.value)}))}/></F>
    <div style={{fontSize:12,color:OK,marginBottom:14,background:OK+"12",padding:"8px 12px",borderRadius:8}}>Comissão automática: {$(cfg.rCarro)}</div>
    <F label="Recebido?"><Tog options={[{value:true,label:"SIM"},{value:false,label:"NÃO"}]} value={f.recebido} onChange={v=>sF(p=>({...p,recebido:v}))} colors={{"true":OK,"false":ERR}}/></F>
    <button onClick={()=>onSave(f)} style={{...bP,width:"100%",marginTop:8}}>{init?"Salvar":"Adicionar"}</button>
  </div>);
}
