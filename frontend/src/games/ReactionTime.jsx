import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameRanking from './GameRanking';
import { fetchLB, saveGameScore, getCachedLB, glassLight, overlayStyle } from './gameUtils';

export default function ReactionTime({ onClose, currentUser }) {
  const [phase,    setPhase]    = useState('idle');
  const [ms,       setMs]       = useState(null);
  const [best,     setBest]     = useState(null);
  const [pos,      setPos]      = useState({ x:50, y:50 });
  const [lb,       setLb]       = useState(getCachedLB('reaction'));
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  const [showLB,   setShowLB]   = useState(false);
  const timerRef = useRef(null);
  const startRef = useRef(null);
  const savedRef = useRef(false);
  const phaseRef = useRef('idle'); // ref para acceder en callbacks sin stale closure

  useEffect(() => {
    fetchLB('reaction').then(d => setLb(d));
    const f = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);

  // Sincronizar phaseRef con phase
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const startRound = useCallback(() => {
    clearTimeout(timerRef.current);
    setPhase('waiting'); setMs(null);
    phaseRef.current = 'waiting';
    const delay = 800 + Math.random() * 1500;
    timerRef.current = setTimeout(() => {
      setPos({ x: 15 + Math.random() * 70, y: 15 + Math.random() * 70 }); // Más margen para evitar bordes
      setPhase('ready');
      phaseRef.current = 'ready';
      startRef.current = performance.now();
    }, delay);
  }, []);

  const handleTap = useCallback((e) => {
    const p = phaseRef.current;
    if (p === 'idle' || p === 'result' || p === 'dead') {
      startRound(); return;
    }
    if (p === 'waiting') {
      clearTimeout(timerRef.current);
      setPhase('dead'); phaseRef.current = 'dead'; return;
    }
    if (p === 'ready') {
      // Verificar si el click fue en el círculo verde
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Calcular posición del círculo en píxeles
      const circleX = (pos.x / 100) * 360;
      const circleY = (pos.y / 100) * 360;
      
      // Verificar si el click está dentro del círculo (radio 32px)
      const distance = Math.sqrt((clickX - circleX) ** 2 + (clickY - circleY) ** 2);
      if (distance > 32) {
        // Click fuera del círculo - fallo
        setPhase('dead'); phaseRef.current = 'dead'; return;
      }
      
      const elapsed = Math.round(performance.now() - startRef.current);
      setMs(elapsed);
      setBest(prev => {
        const newBest = prev === null ? elapsed : Math.min(prev, elapsed);
        // Guardar si es mejor
        if (prev === null || elapsed < prev) {
          saveGameScore('reaction', elapsed)
            .then(() => fetchLB('reaction').then(d => setLb(d)));
        }
        return newBest;
      });
      setPhase('result'); phaseRef.current = 'result';
    }
  }, [startRound, pos]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleTap(); }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); clearTimeout(timerRef.current); };
  }, [handleTap, onClose]);

  const BG = {
    idle:    'linear-gradient(135deg,#1e293b,#0f172a)',
    waiting: 'linear-gradient(135deg,#1e293b,#0f172a)',
    ready:   'linear-gradient(135deg,#14532d,#166534)',
    result:  'linear-gradient(135deg,#1e3a5f,#1e40af)',
    dead:    'linear-gradient(135deg,#7f1d1d,#991b1b)',
  };

  const MSG = {
    idle:    { emoji:'⚡', text:'Toca para empezar', sub:'Reacciona cuando aparezca el objetivo' },
    waiting: { emoji:'👀', text:'Espera...', sub:'No toques todavía — ¡viene pronto!' },
    ready:   { emoji:'🎯', text:'¡AHORA!', sub:'Toca lo más rápido que puedas' },
    result:  { emoji:'✅', text:`${ms} ms`, sub: ms < 200 ? '🏎️ Reflejos de F1!' : ms < 300 ? '⚡ Muy rápido' : ms < 500 ? '👍 Bien' : '🐢 Puedes mejorar' },
    dead:    { emoji:'❌', text:'¡Demasiado pronto!', sub:'Toca de nuevo para reintentar' },
  };

  const info = MSG[phase] || MSG.idle;

  return (
    <div style={{ ...overlayStyle }} onClick={e => e.stopPropagation()}>
      <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', gap:12, alignItems:'flex-start', maxWidth:'98vw' }}>

        {/* Ranking desktop */}
        {!isMobile && (
          <div style={{ ...glassLight, padding:'18px 14px', minWidth:200 }}>
            <GameRanking lb={lb} game="reaction" maxHeight={380} />
          </div>
        )}

        {/* Panel juego */}
        <div style={{ ...glassLight, padding:'14px 14px 10px', display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%' }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
              <span style={{ fontSize:16, fontWeight:800, color:'#1d1d1f', letterSpacing:'-0.5px' }}>⚡ Reacción</span>
              {best !== null && (
                <span style={{ fontSize:13, fontWeight:700, color:'#007aff', background:'rgba(0,122,255,0.1)', padding:'2px 8px', borderRadius:20 }}>
                  Mejor: {best} ms
                </span>
              )}
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {isMobile && (
                <button onClick={() => setShowLB(v => !v)}
                  style={{ background:'rgba(0,0,0,0.07)', border:'none', borderRadius:14, color:'#1d1d1f', padding:'5px 10px', cursor:'pointer', fontSize:11, fontWeight:600 }}>
                  🏆 Top
                </button>
              )}
              <button onClick={onClose}
                style={{ background:'rgba(0,0,0,0.07)', border:'none', borderRadius:14, color:'#1d1d1f', padding:'5px 12px', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                Done
              </button>
            </div>
          </div>

          {isMobile && showLB ? (
            <div style={{ width:300, maxHeight:260, overflowY:'auto' }}>
              <GameRanking lb={lb} game="reaction" maxHeight={240} />
            </div>
          ) : (
            <>
              {/* Área de juego — click aquí activa handleTap */}
              <div
                onClick={handleTap}
                style={{
                  width:360, height:360, borderRadius:20, cursor:'pointer',
                  background: BG[phase], position:'relative', overflow:'hidden',
                  border:'1.5px solid rgba(255,255,255,0.15)',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  gap:8, transition:'background 0.4s', userSelect:'none',
                }}
              >
                {phase === 'ready' && (
                  <div style={{
                    position:'absolute',
                    left:`${pos.x}%`, top:`${pos.y}%`,
                    transform:'translate(-50%,-50%)',
                    width:64, height:64, borderRadius:'50%',
                    background:'#22c55e',
                    boxShadow:'0 0 30px #22c55e, 0 0 60px #22c55e55',
                    animation:'reactionPulse 0.3s ease-in-out infinite alternate',
                    cursor:'pointer',
                  }}/>
                )}
                <style>{`@keyframes reactionPulse{from{transform:translate(-50%,-50%) scale(1)}to{transform:translate(-50%,-50%) scale(1.18)}}`}</style>

                <span style={{ fontSize:52, zIndex:1 }}>{info.emoji}</span>
                <p style={{ color:'white', fontWeight:800, fontSize:22, margin:0, zIndex:1, letterSpacing:'-0.5px', textAlign:'center' }}>
                  {info.text}
                </p>
                <p style={{ color:'rgba(255,255,255,0.65)', fontSize:13, margin:0, zIndex:1, textAlign:'center', padding:'0 16px' }}>
                  {phase === 'ready' ? 'Toca solo el círculo verde' : info.sub}
                </p>
              </div>
              <p style={{ color:'rgba(0,0,0,0.3)', fontSize:10, margin:0 }}>Espacio / Toca · ESC cierra</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
