import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import SerialConnect from '../components/SerialConnect';
import { Moon, Sun, Globe, Bell, User, Shield, Palette, Save, Camera, Loader, Usb } from 'lucide-react';

const API_BASE = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${checked ? 'bg-[#4285F4]' : 'bg-gray-200'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`}/>
      </button>
    </div>
  );
}

function Section({ icon: Icon, title, children, onTitleClick }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <Icon size={16} className="text-[#4285F4]"/>
        </div>
        <h2 className="font-bold text-gray-900 cursor-default select-none" onClick={onTitleClick}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Breakout ─────────────────────────────────────────────────────────────────
function BreakoutGame({ onClose }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [dead, setDead]   = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let x = canvas.width/2, y = canvas.height-30, dx = 2.5, dy = -2.5;
    const ballR=6, padH=10, padW=80; let padX=(canvas.width-padW)/2;
    let right=false, left=false;
    const COLS=6, ROWS=5, BW=47, BH=15, BP=6; let sc=0;
    const bricks=Array.from({length:COLS},(_,c)=>Array.from({length:ROWS},(_,r)=>({x:0,y:0,on:1,color:`hsl(${(c*60+r*30)%360},70%,55%)`})));
    const kd=(e)=>{if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')right=true;if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')left=true;if(e.key==='Escape')onClose();};
    const ku=(e)=>{if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')right=false;if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')left=false;};
    const mm=(e)=>{const rx=e.clientX-canvas.getBoundingClientRect().left;if(rx>0&&rx<canvas.width)padX=rx-padW/2;};
    const tm=(e)=>{if(e.touches[0]){const rx=e.touches[0].clientX-canvas.getBoundingClientRect().left;if(rx>0&&rx<canvas.width)padX=rx-padW/2;}};
    document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
    canvas.addEventListener('mousemove',mm);canvas.addEventListener('touchmove',tm,{passive:true});
    let req;
    const draw=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for(let c=0;c<COLS;c++)for(let r=0;r<ROWS;r++){if(!bricks[c][r].on)continue;const bx=(c*(BW+BP))+15,by=(r*(BH+BP))+30;bricks[c][r].x=bx;bricks[c][r].y=by;ctx.beginPath();ctx.roundRect?ctx.roundRect(bx,by,BW,BH,4):ctx.rect(bx,by,BW,BH);ctx.fillStyle=bricks[c][r].color;ctx.fill();}
      ctx.beginPath();ctx.arc(x,y,ballR,0,Math.PI*2);ctx.fillStyle='#EA4335';ctx.fill();
      ctx.beginPath();ctx.roundRect?ctx.roundRect(padX,canvas.height-padH,padW,padH,4):ctx.rect(padX,canvas.height-padH,padW,padH);ctx.fillStyle='#4285F4';ctx.fill();
      for(let c=0;c<COLS;c++)for(let r=0;r<ROWS;r++){const b=bricks[c][r];if(b.on&&x>b.x&&x<b.x+BW&&y>b.y&&y<b.y+BH){dy=-dy;b.on=0;sc++;setScore(sc);if(sc===COLS*ROWS){for(let c2=0;c2<COLS;c2++)for(let r2=0;r2<ROWS;r2++)bricks[c2][r2].on=1;sc=0;setScore(0);}}}
      if(x+dx>canvas.width-ballR||x+dx<ballR)dx=-dx;
      if(y+dy<ballR)dy=-dy;
      else if(y+dy>canvas.height-ballR){if(x>padX&&x<padX+padW){dy=-Math.abs(dy);dx+=((x-(padX+padW/2))*0.1);}else{setDead(true);return;}}
      if(right&&padX<canvas.width-padW)padX+=5;if(left&&padX>0)padX-=5;
      x+=dx;y+=dy;req=requestAnimationFrame(draw);
    };
    draw();
    return()=>{document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);canvas.removeEventListener('mousemove',mm);canvas.removeEventListener('touchmove',tm);cancelAnimationFrame(req);};
  },[onClose,dead]);

  const glass={background:'rgba(255,255,255,0.18)',backdropFilter:'blur(40px) saturate(200%)',WebkitBackdropFilter:'blur(40px) saturate(200%)',border:'1px solid rgba(255,255,255,0.5)',borderRadius:28,boxShadow:'0 20px 60px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.6)',padding:24,display:'flex',flexDirection:'column',alignItems:'center',gap:16};
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',backdropFilter:'blur(16px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200}} onClick={onClose}>
      <div style={glass} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
          <span style={{fontWeight:700,color:'white',fontSize:15,textShadow:'0 1px 6px rgba(0,0,0,0.3)'}}>🧱 Breakout — {score} pts</span>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.25)',border:'1px solid rgba(255,255,255,0.4)',borderRadius:20,color:'white',padding:'4px 14px',cursor:'pointer',fontSize:13,fontWeight:600}}>✕</button>
        </div>
        <div style={{position:'relative',borderRadius:14,overflow:'hidden',border:'1px solid rgba(255,255,255,0.3)',touchAction:'none'}}>
          <canvas ref={canvasRef} width={340} height={260} style={{display:'block',background:'rgba(0,0,0,0.25)'}}/>
          {dead&&(<div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(10px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:14}}>
            <p style={{color:'white',fontWeight:700,fontSize:20}}>Game Over — {score} pts</p>
            <button onClick={()=>setDead(false)} style={{background:'rgba(66,133,244,0.85)',color:'white',border:'1px solid rgba(255,255,255,0.3)',borderRadius:20,padding:'10px 24px',fontWeight:700,cursor:'pointer',fontSize:14}}>Reintentar</button>
          </div>)}
        </div>
        <p style={{color:'rgba(255,255,255,0.6)',fontSize:11}}>Ratón / teclado / táctil · ESC para cerrar</p>
      </div>
    </div>
  );
}

// ─── Snake ────────────────────────────────────────────────────────────────────
const COLS=16,ROWS=13,CELL=24;
const DIR={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};

function Apple({ x, y }) {
  return (
    <div style={{position:'absolute',left:x*CELL,top:y*CELL,width:CELL,height:CELL,display:'flex',alignItems:'center',justifyContent:'center',fontSize:CELL-4,lineHeight:1,filter:'drop-shadow(0 2px 6px rgba(255,59,48,0.6))',animation:'appleFloat 1.2s ease-in-out infinite alternate',userSelect:'none'}}>🍎</div>
  );
}

// Guardar/leer leaderboard en localStorage
const LS_KEY = 'arachiz_snake_lb';
const getLeaderboard = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; } };
const saveScore = (name, avatar, score) => {
  const lb = getLeaderboard();
  lb.push({ name, avatar, score, date: new Date().toLocaleDateString('es-CO') });
  lb.sort((a,b) => b.score - a.score);
  localStorage.setItem(LS_KEY, JSON.stringify(lb.slice(0, 10)));
};

const MEDAL = ['🥇','🥈','🥉'];
const TOP_COLORS = [
  { text:'#FFD700', glow:'rgba(255,215,0,0.4)', bg:'rgba(255,215,0,0.12)' },
  { text:'#C0C0C0', glow:'rgba(192,192,192,0.4)', bg:'rgba(192,192,192,0.1)' },
  { text:'#CD7F32', glow:'rgba(205,127,50,0.4)',  bg:'rgba(205,127,50,0.1)' },
];

function Leaderboard({ onClose, currentUser }) {
  const lb = getLeaderboard();
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(180,200,220,0.2)',backdropFilter:'blur(32px) saturate(180%)',WebkitBackdropFilter:'blur(32px) saturate(180%)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:201,padding:16}} onClick={onClose}>
      <div style={{background:'rgba(255,255,255,0.45)',backdropFilter:'blur(60px) saturate(220%)',WebkitBackdropFilter:'blur(60px) saturate(220%)',border:'1.5px solid rgba(255,255,255,0.9)',borderRadius:36,boxShadow:'0 40px 100px rgba(0,0,0,0.12),inset 0 2px 0 rgba(255,255,255,1)',padding:'28px 24px',width:'100%',maxWidth:380,maxHeight:'85vh',overflow:'hidden',display:'flex',flexDirection:'column',gap:16}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <span style={{fontSize:20,fontWeight:800,color:'#1d1d1f',letterSpacing:'-0.6px'}}>Leaderboard</span>
            <span style={{marginLeft:8,fontSize:18}}>🏆</span>
          </div>
          <button onClick={onClose} style={{background:'rgba(0,0,0,0.07)',border:'none',borderRadius:22,color:'#1d1d1f',padding:'7px 18px',cursor:'pointer',fontSize:14,fontWeight:600}}>Done</button>
        </div>

        {lb.length === 0 ? (
          <div style={{textAlign:'center',padding:'32px 0',color:'#6e6e73',fontSize:14}}>
            <div style={{fontSize:40,marginBottom:8}}>🎮</div>
            Aún no hay puntuaciones.<br/>¡Sé el primero!
          </div>
        ) : (
          <div style={{overflowY:'auto',display:'flex',flexDirection:'column',gap:8}}>
            {lb.map((entry, i) => {
              const isTop = i < 3;
              const col = isTop ? TOP_COLORS[i] : null;
              return (
                <div key={i} style={{
                  display:'flex',alignItems:'center',gap:12,
                  padding:'10px 14px',
                  borderRadius:18,
                  background: isTop ? col.bg : 'rgba(255,255,255,0.4)',
                  border: isTop ? `1px solid ${col.glow}` : '1px solid rgba(255,255,255,0.6)',
                  boxShadow: isTop ? `0 4px 16px ${col.glow}` : '0 2px 8px rgba(0,0,0,0.04)',
                  transition:'transform 0.15s',
                }}>
                  {/* Posición */}
                  <span style={{fontSize:isTop?22:15,fontWeight:700,minWidth:28,textAlign:'center',color:isTop?col.text:'#6e6e73'}}>
                    {isTop ? MEDAL[i] : `${i+1}`}
                  </span>
                  {/* Avatar */}
                  {entry.avatar
                    ? <img src={entry.avatar} style={{width:36,height:36,borderRadius:10,objectFit:'cover',border:isTop?`2px solid ${col.text}`:'2px solid rgba(255,255,255,0.8)',boxShadow:isTop?`0 0 10px ${col.glow}`:'none'}} alt={entry.name}/>
                    : <div style={{width:36,height:36,borderRadius:10,background:isTop?col.text:'#007aff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'white',border:isTop?`2px solid ${col.text}`:'none'}}>
                        {entry.name?.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()||'?'}
                      </div>
                  }
                  {/* Nombre y fecha */}
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{margin:0,fontWeight:700,fontSize:14,color:isTop?col.text:'#1d1d1f',letterSpacing:'-0.2px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{entry.name}</p>
                    <p style={{margin:0,fontSize:11,color:'#6e6e73'}}>{entry.date}</p>
                  </div>
                  {/* Puntos */}
                  <span style={{fontWeight:800,fontSize:isTop?18:15,color:isTop?col.text:'#1d1d1f',letterSpacing:'-0.5px'}}>{entry.score}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SnakeGame({ onClose, currentUser }) {
  const [snake,setSnake]=useState([[8,6],[7,6],[6,6],[5,6]]);
  const [food,setFood]=useState([12,4]);
  const [score,setScore]=useState(0);
  const [dead,setDead]=useState(false);
  const [speed,setSpeed]=useState(140);
  const [scoresSaved,setScoresSaved]=useState(false);
  const [lb,setLb]=useState(getLeaderboard());
  const dirRef=useRef([1,0]);
  const lastDir=useRef([1,0]);

  const randFood=(s)=>{let f;do{f=[Math.floor(Math.random()*COLS),Math.floor(Math.random()*ROWS)];}while(s.some(c=>c[0]===f[0]&&c[1]===f[1]));return f;};
  const tryDir=(next)=>{const cur=lastDir.current;if(cur[0]!==0&&next[0]===-cur[0])return;if(cur[1]!==0&&next[1]===-cur[1])return;dirRef.current=next;};

  useEffect(()=>{
    const map={'ArrowUp':DIR.ArrowUp,'ArrowDown':DIR.ArrowDown,'ArrowLeft':DIR.ArrowLeft,'ArrowRight':DIR.ArrowRight,'w':DIR.ArrowUp,'W':DIR.ArrowUp,'s':DIR.ArrowDown,'S':DIR.ArrowDown,'a':DIR.ArrowLeft,'A':DIR.ArrowLeft,'d':DIR.ArrowRight,'D':DIR.ArrowRight};
    const onKey=(e)=>{if(map[e.key]){e.preventDefault();tryDir(map[e.key]);}if(e.key==='Escape')onClose();};
    window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);
  },[onClose]);

  useEffect(()=>{
    if(dead){
      if(!scoresSaved&&score>0){
        saveScore(currentUser?.fullName||currentUser?.email||'Jugador', currentUser?.avatarUrl||null, score);
        setLb(getLeaderboard());
        setScoresSaved(true);
      }
      return;
    }
    const iv=setInterval(()=>{
      setSnake(prev=>{
        const[dx,dy]=dirRef.current;lastDir.current=[dx,dy];
        const head=[prev[0][0]+dx,prev[0][1]+dy];
        if(head[0]<0||head[0]>=COLS||head[1]<0||head[1]>=ROWS||prev.some(c=>c[0]===head[0]&&c[1]===head[1])){setDead(true);return prev;}
        const ate=head[0]===food[0]&&head[1]===food[1];
        const next=[head,...prev.slice(0,ate?undefined:-1)];
        if(ate){setScore(s=>s+10);setFood(randFood(next));setSpeed(sp=>Math.max(70,sp-5));}
        return next;
      });
    },speed);
    return()=>clearInterval(iv);
  },[dead,food,speed,scoresSaved,score,currentUser]);

  const reset=()=>{
    const s=[[8,6],[7,6],[6,6],[5,6]];
    setSnake(s);setFood(randFood(s));
    dirRef.current=[1,0];lastDir.current=[1,0];
    setScore(0);setDead(false);setSpeed(140);setScoresSaved(false);
  };

  const snakeColor=(i,total)=>{const t=i/Math.max(total-1,1);return `rgb(${Math.round(52+t*30)},${Math.round(199-t*60)},${Math.round(89-t*20)})`;};
  const btn={width:56,height:56,background:'rgba(255,255,255,0.6)',border:'1.5px solid rgba(255,255,255,0.9)',borderRadius:16,color:'#1d1d1f',fontSize:20,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(0,0,0,0.08),inset 0 1px 0 rgba(255,255,255,0.8)',backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)',transition:'transform 0.1s',display:'flex',alignItems:'center',justifyContent:'center'};
  const W=COLS*CELL, H=ROWS*CELL;

  // Panel leaderboard inline
  const LBPanel = () => (
    <div style={{width:200,display:'flex',flexDirection:'column',gap:10}}>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        <span style={{fontSize:16,fontWeight:800,color:'#1d1d1f',letterSpacing:'-0.4px'}}>Ranking</span>
        <span style={{fontSize:16}}>🏆</span>
      </div>
      {lb.length===0 ? (
        <div style={{textAlign:'center',padding:'20px 0',color:'#6e6e73',fontSize:12}}>
          <div style={{fontSize:28,marginBottom:6}}>🎮</div>
          ¡Sé el primero!
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:6,overflowY:'auto',maxHeight:H+40}}>
          {lb.map((entry,i)=>{
            const isTop=i<3;
            const col=isTop?TOP_COLORS[i]:null;
            return(
              <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:14,background:isTop?col.bg:'rgba(255,255,255,0.35)',border:isTop?`1px solid ${col.glow}`:'1px solid rgba(255,255,255,0.5)',boxShadow:isTop?`0 3px 12px ${col.glow}`:'none'}}>
                <span style={{fontSize:isTop?16:12,fontWeight:700,minWidth:20,textAlign:'center',color:isTop?col.text:'#6e6e73'}}>{isTop?MEDAL[i]:i+1}</span>
                {entry.avatar
                  ? <img src={entry.avatar} style={{width:28,height:28,borderRadius:8,objectFit:'cover',border:isTop?`1.5px solid ${col.text}`:'1.5px solid rgba(255,255,255,0.7)',flexShrink:0}} alt=""/>
                  : <div style={{width:28,height:28,borderRadius:8,background:isTop?col.text:'#007aff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'white',flexShrink:0}}>
                      {entry.name?.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()||'?'}
                    </div>
                }
                <div style={{flex:1,minWidth:0}}>
                  <p style={{margin:0,fontWeight:700,fontSize:11,color:isTop?col.text:'#1d1d1f',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{entry.name}</p>
                  <p style={{margin:0,fontSize:10,color:'#6e6e73'}}>{entry.score} pts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(180,200,220,0.25)',backdropFilter:'blur(32px) saturate(180%)',WebkitBackdropFilter:'blur(32px) saturate(180%)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:16,overflowY:'auto'}} onClick={onClose}>
      <style>{`@keyframes appleFloat{from{transform:translateY(0) scale(1)}to{transform:translateY(-3px) scale(1.08)}}@keyframes deadShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}`}</style>

      {/* Contenedor principal — leaderboard izquierda + juego derecha */}
      <div style={{display:'flex',gap:16,alignItems:'flex-start',maxWidth:'95vw'}} onClick={e=>e.stopPropagation()}>

        {/* Panel leaderboard */}
        <div style={{background:'rgba(255,255,255,0.45)',backdropFilter:'blur(60px) saturate(220%)',WebkitBackdropFilter:'blur(60px) saturate(220%)',border:'1.5px solid rgba(255,255,255,0.9)',borderRadius:28,boxShadow:'0 20px 60px rgba(0,0,0,0.1),inset 0 2px 0 rgba(255,255,255,1)',padding:'20px 16px'}}>
          <LBPanel/>
        </div>

        {/* Panel juego */}
        <div style={{background:'rgba(255,255,255,0.5)',backdropFilter:'blur(60px) saturate(220%)',WebkitBackdropFilter:'blur(60px) saturate(220%)',border:'1.5px solid rgba(255,255,255,0.9)',borderRadius:36,boxShadow:'0 40px 100px rgba(0,0,0,0.15),inset 0 2px 0 rgba(255,255,255,1)',padding:'20px 20px 16px',display:'flex',flexDirection:'column',alignItems:'center',gap:14}}>

          {/* Header */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
            <div style={{display:'flex',alignItems:'baseline',gap:8}}>
              <span style={{fontSize:18,fontWeight:800,color:'#1d1d1f',letterSpacing:'-0.5px'}}>Snake</span>
              <span style={{fontSize:12,fontWeight:500,color:'#6e6e73',background:'rgba(0,0,0,0.06)',padding:'2px 8px',borderRadius:20}}>{score} pts</span>
              {score>0&&<span style={{fontSize:10,color:'#34c759',fontWeight:600}}>Vel {Math.round((140-speed)/5)+1}x</span>}
            </div>
            <button onClick={onClose} style={{background:'rgba(0,0,0,0.07)',border:'none',borderRadius:20,color:'#1d1d1f',padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:600}}>Done</button>
          </div>

          {/* Board */}
          <div style={{width:W,height:H,background:'linear-gradient(145deg,rgba(240,248,255,0.9),rgba(220,240,230,0.8))',borderRadius:22,position:'relative',overflow:'hidden',boxShadow:'inset 0 2px 16px rgba(0,0,0,0.06)',border:'1.5px solid rgba(255,255,255,0.95)',animation:dead?'deadShake 0.4s ease':'none'}}>
            {snake.map(([x,y],i)=>{
              const isHead=i===0;const color=snakeColor(i,snake.length);
              return(<div key={i} style={{position:'absolute',left:x*CELL+1,top:y*CELL+1,width:CELL-2,height:CELL-2,background:color,borderRadius:isHead?10:6,boxShadow:isHead?`0 3px 12px ${color}99`:`0 1px 4px ${color}55`,transition:'left 0.1s linear,top 0.1s linear',zIndex:isHead?10:5}}>
                {isHead&&(<><div style={{position:'absolute',width:4,height:4,background:'white',borderRadius:'50%',top:4,left:4}}/><div style={{position:'absolute',width:4,height:4,background:'white',borderRadius:'50%',top:4,right:4}}/></>)}
              </div>);
            })}
            <Apple x={food[0]} y={food[1]}/>
            {dead&&(
              <div style={{position:'absolute',inset:0,background:'rgba(255,255,255,0.82)',backdropFilter:'blur(16px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,borderRadius:20}}>
                <span style={{fontSize:40}}>😵</span>
                <p style={{color:'#1d1d1f',fontWeight:800,fontSize:20,letterSpacing:'-0.6px',margin:0}}>Game Over</p>
                <p style={{color:'#6e6e73',fontSize:13,margin:0}}>{score} pts guardados</p>
                <button onClick={reset} style={{background:'#007aff',color:'white',border:'none',borderRadius:22,padding:'10px 28px',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 20px rgba(0,122,255,0.4)',marginTop:4}}>Try Again</button>
              </div>
            )}
          </div>

          {/* Controles */}
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
            <button style={btn} onClick={()=>tryDir(DIR['ArrowUp'])} onMouseDown={e=>e.currentTarget.style.transform='scale(0.93)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}>↑</button>
            <div style={{display:'flex',gap:6}}>
              {['ArrowLeft','ArrowDown','ArrowRight'].map((k,i)=>(
                <button key={k} style={btn} onClick={()=>tryDir(DIR[k])} onMouseDown={e=>e.currentTarget.style.transform='scale(0.93)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}>
                  {['←','↓','→'][i]}
                </button>
              ))}
            </div>
          </div>
          <p style={{color:'rgba(0,0,0,0.3)',fontSize:10,margin:0}}>Flechas / WASD · ESC para cerrar</p>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Configuracion() {
  const { user, updateUser } = useContext(AuthContext);
  const { settings, updateSetting, toggleDark } = useSettings();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [fullName, setFullName]           = useState(user?.fullName || '');
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatarUrl ? (user.avatarUrl.startsWith('data:')||user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_BASE}${user.avatarUrl}`) : null
  );
  const [avatarFile, setAvatarFile]       = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Sincronizar avatarPreview cuando el user se actualiza (ej: al cargar /auth/me)
  useEffect(() => {
    if (user?.avatarUrl && !avatarFile) {
      const url = user.avatarUrl;
      setAvatarPreview(url.startsWith('data:') || url.startsWith('http') || url.startsWith('blob:') ? url : `${API_BASE}${url}`);
    }
  }, [user?.avatarUrl]);

  // Snake — 7 clicks en "Seguridad"
  const [secClicks, setSecClicks] = useState(0);
  const [showSnake, setShowSnake] = useState(false);
  const secTimer = useRef(null);
  const handleSecClick = () => {
    setSecClicks(n => {
      const next = n + 1;
      if (next >= 7) { setShowSnake(true); return 0; }
      clearTimeout(secTimer.current);
      secTimer.current = setTimeout(() => setSecClicks(0), 2000);
      return next;
    });
  };

  // Breakout — 7 clicks en "Apariencia"
  const [arkClicks, setArkClicks] = useState(0);
  const [showArk, setShowArk]     = useState(false);
  const arkTimer = useRef(null);
  const handleArkClick = () => {
    setArkClicks(n => {
      const next = n + 1;
      if (next >= 7) { setShowArk(true); return 0; }
      clearTimeout(arkTimer.current);
      arkTimer.current = setTimeout(() => setArkClicks(0), 2000);
      return next;
    });
  };

  // Botón oculto instructor — 10 clicks en el rol para borrar huellas
  const [instClicks, setInstClicks] = useState(0);
  const [showClear, setShowClear]   = useState(false);
  const instTimer = useRef(null);
  const handleInstClick = () => {
    if (user?.userType !== 'instructor') return;
    setInstClicks(n => {
      const next = n + 1;
      if (next >= 10) { setShowClear(true); return 0; }
      clearTimeout(instTimer.current);
      instTimer.current = setTimeout(() => setInstClicks(0), 2000);
      return next;
    });
  };

  const handleClearFingerprints = async () => {
    if (!confirm('¿Borrar TODA la base de datos del sensor de huellas?')) return;
    try {
      const res  = await fetch(`${API_BASE}/api/serial/clear-fingerprints`, { method:'POST', headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message || 'Comando enviado al sensor', 'success');
      setShowClear(false);
    } catch (err) { showToast(err.message, 'error'); }
  };

  const initials  = user?.fullName ? user.fullName.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() : '?';
  const roleColor = user?.userType === 'instructor' ? 'bg-[#4285F4]' : 'bg-[#34A853]';

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5*1024*1024) { showToast('Máx. 5MB','error'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setSavingProfile(true);
    try {
      const body = new FormData();
      if (fullName.trim() && fullName !== user?.fullName) body.append('fullName', fullName.trim());
      if (avatarFile) body.append('avatar', avatarFile);
      const d    = await fetch(`${API_BASE}/api/auth/profile`, { method:'PUT', headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` }, body });
      const json = await d.json();
      if (!d.ok) throw new Error(json.error || 'Error');
      if (updateUser) updateUser(json.user);
      setAvatarFile(null);
      showToast('Perfil actualizado','success');
    } catch(err) { showToast(err.message,'error'); }
    finally { setSavingProfile(false); }
  };

  const LANGUAGES = [{ code:'es', label:'Español', flag:'🇨🇴' }, { code:'en', label:'English', flag:'🇺🇸' }];

  return (
    <div className="animate-fade-in space-y-5 max-w-2xl">
      {showSnake && <SnakeGame onClose={() => setShowSnake(false)} currentUser={user}/>}
      {showArk   && <BreakoutGame onClose={() => setShowArk(false)} />}

      <PageHeader title="Configuración" subtitle="Personaliza tu experiencia en Arachiz" />

      {/* Perfil */}
      <Section icon={User} title="Perfil">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-5 mb-2">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {avatarPreview
                ? <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover shadow-md"/>
                : <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-md ${roleColor}`}>{initials}</div>
              }
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white"/>
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange}/>
            </div>
            <div>
              <p className="font-bold text-gray-900">{user?.fullName}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <span className={`badge mt-1 ${user?.userType==='instructor'?'badge-info':'badge-success'}`}>
                {user?.userType==='instructor'?'Instructor':'Aprendiz'}
              </span>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="block text-xs text-[#4285F4] hover:underline mt-1">
                Cambiar foto
              </button>
            </div>
          </div>
          <div>
            <label className="input-label">Nombre completo</label>
            <input className="input-field" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Tu nombre completo"/>
          </div>
          <div>
            <label className="input-label">Correo electrónico</label>
            <input type="email" className="input-field opacity-60 cursor-not-allowed" value={user?.email||''} disabled/>
            <p className="text-xs text-gray-400 mt-1">El correo no puede modificarse</p>
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary flex items-center gap-2">
            {savingProfile ? <Loader size={15} className="animate-spin"/> : <Save size={15}/>}
            {savingProfile ? 'Guardando...' : 'Guardar perfil'}
          </button>
        </form>
      </Section>

      {/* Apariencia */}
      <Section icon={Palette} title="Apariencia" onTitleClick={handleArkClick}>
        <p className="text-sm font-medium text-gray-700 mb-3">Tema</p>
        <div className="grid grid-cols-2 gap-3">
          {[{id:'light',label:'Claro',icon:Sun},{id:'dark',label:'Oscuro',icon:Moon}].map(({id,label,icon:Icon}) => {
            const active = id==='dark' ? settings.darkMode : !settings.darkMode;
            return (
              <button key={id} type="button"
                onClick={() => { if(id==='dark'&&!settings.darkMode) toggleDark(); if(id==='light'&&settings.darkMode) toggleDark(); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${active?'border-[#4285F4] bg-blue-50':'border-gray-200 hover:border-gray-300'}`}>
                <Icon size={22} className={active?'text-[#4285F4]':'text-gray-400'}/>
                <span className={`text-sm font-semibold ${active?'text-[#4285F4]':'text-gray-500'}`}>{label}</span>
              </button>
            );
          })}
        </div>
        {arkClicks > 0 && arkClicks < 7 && <p className="text-xs text-gray-300 text-center mt-2">{7-arkClicks} más...</p>}
      </Section>

      {/* Idioma */}
      <Section icon={Globe} title="Idioma">
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map(({code,label,flag}) => (
            <button key={code} type="button"
              onClick={() => { updateSetting('language',code); showToast(`Idioma: ${label}`,'info'); }}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${settings.language===code?'border-[#4285F4] bg-blue-50':'border-gray-200 hover:border-gray-300'}`}>
              <span className="text-2xl">{flag}</span>
              <div className="text-left">
                <p className={`text-sm font-semibold ${settings.language===code?'text-[#4285F4]':'text-gray-700'}`}>{label}</p>
                <p className="text-xs text-gray-400">{code.toUpperCase()}</p>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Traducción completa al inglés próximamente.</p>
      </Section>

      {/* Notificaciones */}
      <Section icon={Bell} title="Notificaciones">
        <div className="divide-y divide-gray-100">
          <ToggleSwitch checked={settings.notifications} onChange={v=>updateSetting('notifications',v)}
            label="Notificaciones del sistema" description="Alertas de sesiones, excusas y actividad"/>
        </div>
      </Section>

      {/* Hardware — solo instructores */}
      {user?.userType === 'instructor' && (
        <Section icon={Usb} title="Hardware / Arduino">
          <SerialConnect />
        </Section>
      )}

      {/* Seguridad */}
      <Section icon={Shield} title="Seguridad" onTitleClick={handleSecClick}>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Tu sesión expira automáticamente después de 8 horas de inactividad.</p>
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sesión actual</p>
            <p className="text-sm text-gray-700">{user?.email}</p>
            <p className="text-xs text-gray-400 capitalize cursor-default select-none" onClick={handleInstClick}>
              {user?.userType}
            </p>
          </div>
          {secClicks > 0 && secClicks < 7 && <p className="text-xs text-gray-300 text-center">{7-secClicks} más...</p>}
          {showClear && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
              <p className="text-xs font-bold text-red-600">Opciones avanzadas del sensor</p>
              <button onClick={handleClearFingerprints} className="w-full text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg py-2 transition-colors">
                Borrar base de datos del sensor de huellas
              </button>
              <button onClick={() => setShowClear(false)} className="w-full text-xs text-gray-500 hover:text-gray-700 py-1">
                Cancelar
              </button>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
