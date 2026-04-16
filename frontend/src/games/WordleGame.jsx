import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from './GameLayout';
import { fetchLB, saveGameScore, getCachedLB } from './gameUtils';

// ── Palabra configurable sin rediseñar el juego ──────────────────────────────
const WORD = (import.meta.env.VITE_WORDLE_WORD || 'FICHA').toUpperCase().slice(0, 5);
const MAX_ATTEMPTS = 6;

// Teclado QWERTY en español
const KEYBOARD = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L','Ñ'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
];

// Correct Wordle evaluation with proper duplicate letter handling
const evaluate = (guess, word) => {
  const result = Array(5).fill(null).map((_, i) => ({ letter: guess[i], state: 'absent' }));
  const wordArr = word.split('');
  const guessArr = guess.split('');

  // Pass 1: mark correct positions (green)
  const wordUsed = Array(5).fill(false);
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === wordArr[i]) {
      result[i].state = 'correct';
      wordUsed[i] = true;
    }
  }

  // Pass 2: mark present (yellow) — only if letter not yet consumed
  for (let i = 0; i < 5; i++) {
    if (result[i].state === 'correct') continue;
    for (let j = 0; j < 5; j++) {
      if (!wordUsed[j] && guessArr[i] === wordArr[j]) {
        result[i].state = 'present';
        wordUsed[j] = true;
        break;
      }
    }
  }

  return result;
};

const STATE_COLORS = {
  correct: { bg:'#34A853', text:'white' },
  present: { bg:'#FBBC05', text:'white' },
  absent:  { bg:'#374151', text:'white' },
  empty:   { bg:'rgba(255,255,255,0.15)', text:'#1d1d1f' },
  active:  { bg:'rgba(255,255,255,0.4)', text:'#1d1d1f' },
};

// Daily play tracking
const DAILY_KEY = 'arachiz_wordle_daily';
const getTodayStr = () => new Date().toISOString().slice(0, 10);
const getDailyRecord = () => {
  try { return JSON.parse(localStorage.getItem(DAILY_KEY)) || {}; } catch { return {}; }
};
const setDailyRecord = (data) => {
  localStorage.setItem(DAILY_KEY, JSON.stringify(data));
};

export default function WordleGame({ onClose, currentUser }) {
  const [guesses,  setGuesses]  = useState([]); // [{letter,state}[]]
  const [current,  setCurrent]  = useState('');
  const [phase,    setPhase]    = useState('playing'); // playing | won | lost
  const [lb,       setLb]       = useState(getCachedLB('wordle'));
  const [shake,    setShake]    = useState(false);
  const savedRef = React.useRef(false);

  // Check if already played today
  const daily = getDailyRecord();
  const alreadyPlayedToday = daily.date === getTodayStr();

  useEffect(() => { fetchLB('wordle').then(d => setLb(d)); }, []);

  useEffect(() => {
    if (phase === 'won' && !savedRef.current) {
      savedRef.current = true;
      const attempts = guesses.length;
      const today = getTodayStr();
      const rec = getDailyRecord();

      // Only save score if first time today
      if (rec.date !== today) {
        setDailyRecord({ date: today, attempts, won: true });
        saveGameScore('wordle', attempts).then(() => fetchLB('wordle').then(d => setLb(d)));
      } else {
        // Already played today — just reload LB
        fetchLB('wordle').then(d => setLb(d));
      }
    }
  }, [phase, guesses]);

  const submit = useCallback(() => {
    if (current.length !== 5) { setShake(true); setTimeout(() => setShake(false), 500); return; }
    const result = evaluate(current, WORD);
    const newGuesses = [...guesses, result];
    setGuesses(newGuesses);
    setCurrent('');
    if (current === WORD) { setPhase('won'); return; }
    if (newGuesses.length >= MAX_ATTEMPTS) setPhase('lost');
  }, [current, guesses]);

  const pressKey = useCallback((key) => {
    if (phase !== 'playing') return;
    if (key === '⌫' || key === 'Backspace') { setCurrent(p => p.slice(0, -1)); return; }
    if (key === 'ENTER' || key === 'Enter') { submit(); return; }
    if (/^[A-ZÑ]$/.test(key) && current.length < 5) setCurrent(p => p + key);
  }, [phase, current, submit]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      pressKey(e.key === 'Backspace' ? '⌫' : e.key.toUpperCase());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pressKey, onClose]);

  // Mapa de colores por letra para el teclado
  const letterStates = {};
  guesses.flat().forEach(({ letter, state }) => {
    if (!letterStates[letter] || state === 'correct') letterStates[letter] = state;
  });

  const restart = () => {
    savedRef.current = false;
    setGuesses([]); setCurrent(''); setPhase('playing');
  };

  const score = phase === 'won' ? guesses.length : 0;

  return (
    <GameLayout title="📝 Wordle" score={score} lb={lb} game="wordle" onClose={onClose}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}`}</style>

        {alreadyPlayedToday && phase === 'playing' && guesses.length === 0 && (
          <p style={{ color:'#FBBC05', fontSize:11, margin:0, fontWeight:600 }}>
            Ya jugaste hoy — tu resultado no se guardará de nuevo
          </p>
        )}

        {/* Grid de intentos */}
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {Array.from({ length: MAX_ATTEMPTS }).map((_, row) => {
            const guess = guesses[row];
            const isActive = row === guesses.length && phase === 'playing';
            const letters = isActive ? current.padEnd(5, ' ').split('') : (guess ? guess.map(g => g.letter) : Array(5).fill(' '));
            const states  = guess ? guess.map(g => g.state) : Array(5).fill(isActive ? 'active' : 'empty');

            return (
              <div key={row} style={{ display:'flex', gap:4, animation: isActive && shake ? 'shake 0.4s ease' : 'none' }}>
                {letters.map((l, col) => {
                  const s = STATE_COLORS[states[col]] || STATE_COLORS.empty;
                  return (
                    <div key={col} style={{
                      width:44, height:44, borderRadius:8,
                      background: s.bg, color: s.text,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:18, fontWeight:800, letterSpacing:0,
                      border: states[col] === 'empty' || states[col] === 'active' ? '1.5px solid rgba(255,255,255,0.4)' : 'none',
                      transition:'background 0.2s',
                    }}>
                      {l.trim()}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Resultado */}
        {phase !== 'playing' && (
          <div style={{ textAlign:'center' }}>
            {phase === 'won'
              ? <p style={{ color:'#34A853', fontWeight:800, fontSize:16, margin:'4px 0' }}>🎉 ¡Correcto en {guesses.length} intentos!</p>
              : <p style={{ color:'#EA4335', fontWeight:800, fontSize:16, margin:'4px 0' }}>La palabra era: <strong>{WORD}</strong></p>
            }
            <button onClick={restart}
              style={{ background:'#007aff', color:'white', border:'none', borderRadius:18, padding:'8px 22px', fontSize:13, fontWeight:700, cursor:'pointer', marginTop:4 }}>
              Jugar de nuevo
            </button>
          </div>
        )}

        {/* Teclado */}
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {KEYBOARD.map((row, ri) => (
            <div key={ri} style={{ display:'flex', gap:3, justifyContent:'center' }}>
              {row.map(key => {
                const st = letterStates[key];
                const col = st ? STATE_COLORS[st] : { bg:'rgba(255,255,255,0.55)', text:'#1d1d1f' };
                const isWide = key === 'ENTER' || key === '⌫';
                return (
                  <button key={key} onClick={() => pressKey(key)}
                    style={{
                      width: isWide ? 52 : 32, height:36, borderRadius:7, border:'none',
                      background: col.bg, color: col.text,
                      fontSize: isWide ? 10 : 13, fontWeight:700, cursor:'pointer',
                      backdropFilter:'blur(8px)', transition:'background 0.2s',
                    }}>
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <p style={{ color:'rgba(0,0,0,0.3)', fontSize:10, margin:0 }}>Teclado físico o virtual · ESC cierra</p>
      </div>
    </GameLayout>
  );
}
