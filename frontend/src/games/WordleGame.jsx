import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from './GameLayout';
import { fetchLB, saveGameScore, getCachedLB } from './gameUtils';

// Lista de palabras de 5 letras en español
const WORD_LIST = [
  'FICHA', 'SABER', 'MUNDO', 'LUGAR', 'TIEMPO', 'FORMA', 'PARTE', 'GRUPO', 'PUNTO', 'ORDEN',
  'CAMPO', 'MEDIO', 'NIVEL', 'VALOR', 'FUERZA', 'CLASE', 'CURSO', 'GRADO', 'MARCO', 'PAPEL',
  'PLANO', 'RADIO', 'RANGO', 'RITMO', 'SALUD', 'SIGNO', 'TAREA', 'TEXTO', 'VISTA', 'VUELO',
  'AGUA', 'AIRE', 'AMOR', 'ARTE', 'BIEN', 'CASA', 'DATO', 'EDAD', 'FASE', 'GATO', 'HORA',
  'IDEA', 'LADO', 'MESA', 'NOTA', 'OBRA', 'PASO', 'PESO', 'PLAN', 'RAMA', 'SALA', 'TEMA',
  'TIPO', 'VIDA', 'ZONA', 'ABRIL', 'ACTOR', 'ALBUM', 'ANGEL', 'ARENA', 'AUDIO', 'BAILE',
  'BANCO', 'BARCO', 'BARRO', 'BEBER', 'BELLO', 'BESAR', 'BLANCO', 'BORDE', 'BRAZO', 'BREVE',
  'BUENO', 'CABLE', 'CAMPO', 'CARNE', 'CARTA', 'CERRO', 'CHICO', 'CIELO', 'CINCO', 'CLIMA',
  'COLOR', 'CREER', 'CRUEL', 'CUERO', 'DANZA', 'DEBER', 'DECIR', 'DIENTE', 'DOLOR', 'DULCE',
  'DURAR', 'ENERO', 'ERROR', 'ESTAR', 'FALTA', 'FECHA', 'FELIZ', 'FINAL', 'FLOR', 'FONDO',
  'FORMA', 'FRUTA', 'FUEGO', 'GENTE', 'GOLPE', 'GRANO', 'GRAVE', 'GRUPO', 'GUSTO', 'HACER',
  'HACIA', 'HECHO', 'HIELO', 'HOMBRE', 'HONOR', 'HOTEL', 'HUESO', 'HUMOR', 'IGUAL', 'IMAGEN',
  'JUNTO', 'LARGO', 'LECHE', 'LETRA', 'LIBRO', 'LIGHT', 'LINEA', 'LLAMA', 'LLENO', 'LUGAR',
  'MADRE', 'MAYOR', 'MEDIO', 'MENOR', 'METAL', 'METRO', 'MIEDO', 'MOVER', 'MUCHO', 'MUNDO',
  'MUSICA', 'NACER', 'NEGRO', 'NIVEL', 'NOCHE', 'NORTE', 'NUEVO', 'OCEAN', 'ORDEN', 'PADRE',
  'PAPEL', 'PARTE', 'PASAR', 'PEACE', 'PECHO', 'PERRO', 'PIANO', 'PIEZA', 'PLATA', 'PLAZA',
  'PODER', 'PUNTO', 'QUESO', 'RADIO', 'RAPIDO', 'REINO', 'RESTO', 'RITMO', 'ROBOT', 'SALIR',
  'SALUD', 'SANTO', 'SERIO', 'SIGLO', 'SOBRE', 'SOLAR', 'SUELO', 'SUEÑO', 'TABLA', 'TANTO',
  'TARDE', 'TECHO', 'TEXTO', 'TIERRA', 'TOTAL', 'TRAJE', 'TRATO', 'TURNO', 'ULTIMO', 'UNION',
  'VERDE', 'VIAJE', 'VIENTO', 'VISTA', 'VIVIR', 'VUELO', 'ZEBRA', 'ZORRO'
];

// Función para obtener palabra del día basada en usuario y fecha
const getDailyWord = (userId, date) => {
  const seed = `${userId}-${date}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % WORD_LIST.length;
  return WORD_LIST[index];
};

// Obtener la palabra del día para el usuario actual
const getTodayWord = (currentUser) => {
  const today = getTodayStr();
  const userId = currentUser?.id || 'guest';
  return getDailyWord(userId, today);
};
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

// Daily play tracking - una vez por día
const DAILY_KEY = 'arachiz_wordle_daily';
const getTodayStr = () => new Date().toISOString().slice(0, 10);
const getDailyRecord = () => {
  try { return JSON.parse(localStorage.getItem(DAILY_KEY)) || {}; } catch { return {}; }
};
const setDailyRecord = (data) => {
  localStorage.setItem(DAILY_KEY, JSON.stringify(data));
};

export default function WordleGame({ onClose, currentUser }) {
  const WORD = getTodayWord(currentUser); // Palabra única por usuario y día
  const [guesses,  setGuesses]  = useState([]); // [{letter,state}[]]
  const [current,  setCurrent]  = useState('');
  const [phase,    setPhase]    = useState('playing'); // playing | won | lost
  const [lb,       setLb]       = useState(getCachedLB('wordle'));
  const [shake,    setShake]    = useState(false);
  const savedRef = React.useRef(false);

  // Check if already played today
  const daily = getDailyRecord();
  const today = getTodayStr();
  const userKey = `${currentUser?.id || 'guest'}-${today}`;
  const alreadyPlayedToday = daily.userKey === userKey;

  // Si ya jugó hoy, bloquear el juego
  useEffect(() => {
    if (alreadyPlayedToday && phase === 'playing' && guesses.length === 0) {
      setPhase('blocked');
    }
  }, [alreadyPlayedToday, phase, guesses.length]);

  useEffect(() => { fetchLB('wordle').then(d => setLb(d)); }, []);

  useEffect(() => {
    if ((phase === 'won' || phase === 'lost') && !savedRef.current) {
      savedRef.current = true;
      const attempts = phase === 'won' ? guesses.length : MAX_ATTEMPTS + 1; // Si perdió, guardar como MAX+1
      const today = getTodayStr();
      const userKey = `${currentUser?.id || 'guest'}-${today}`;
      const rec = getDailyRecord();

      // Only save score if first time today for this user
      if (rec.userKey !== userKey) {
        setDailyRecord({ userKey, attempts, won: phase === 'won' });
        if (phase === 'won') {
          saveGameScore('wordle', attempts).then(() => fetchLB('wordle').then(d => setLb(d)));
        } else {
          // Si perdió, solo actualizar el leaderboard sin guardar score
          fetchLB('wordle').then(d => setLb(d));
        }
      } else {
        // Already played today — just reload LB
        fetchLB('wordle').then(d => setLb(d));
      }
    }
  }, [phase, guesses, currentUser]);

  const submit = useCallback(() => {
    if (phase === 'blocked') return; // No permitir jugar si ya jugó hoy
    if (current.length !== 5) { setShake(true); setTimeout(() => setShake(false), 500); return; }
    const result = evaluate(current, WORD);
    const newGuesses = [...guesses, result];
    setGuesses(newGuesses);
    setCurrent('');
    if (current === WORD) { setPhase('won'); return; }
    if (newGuesses.length >= MAX_ATTEMPTS) setPhase('lost');
  }, [current, guesses, WORD, phase]);

  const pressKey = useCallback((key) => {
    if (phase !== 'playing') return; // Bloquear si no está en fase de juego
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

        {/* Mensaje de bloqueo si ya jugó hoy */}
        {phase === 'blocked' && (
          <div style={{ textAlign:'center', padding:'20px', background:'rgba(251,188,5,0.1)', borderRadius:12, border:'1px solid #FBBC05' }}>
            <p style={{ fontSize:32, margin:'0 0 8px' }}>⏰</p>
            <p style={{ color:'#1d1d1f', fontWeight:800, fontSize:16, margin:'0 0 4px' }}>Ya jugaste hoy</p>
            <p style={{ color:'#6e6e73', fontSize:13, margin:0 }}>
              {daily.won ? `Ganaste en ${daily.attempts} intentos` : 'Perdiste hoy'}
            </p>
            <p style={{ color:'#6e6e73', fontSize:12, margin:'8px 0 0', fontStyle:'italic' }}>
              Vuelve mañana para una nueva palabra
            </p>
          </div>
        )}

        {/* Grid de intentos */}
        {phase !== 'blocked' && (
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
        )}

        {/* Resultado */}
        {(phase === 'won' || phase === 'lost') && (
          <div style={{ textAlign:'center' }}>
            {phase === 'won'
              ? <p style={{ color:'#34A853', fontWeight:800, fontSize:16, margin:'4px 0' }}>🎉 ¡Correcto en {guesses.length} intentos!</p>
              : <p style={{ color:'#EA4335', fontWeight:800, fontSize:16, margin:'4px 0' }}>La palabra era: <strong>{WORD}</strong></p>
            }
            <p style={{ color:'#6e6e73', fontSize:12, margin:'8px 0', fontStyle:'italic' }}>
              Vuelve mañana para una nueva palabra
            </p>
          </div>
        )}

        {/* Teclado - solo mostrar si no está bloqueado */}
        {phase !== 'blocked' && (
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {KEYBOARD.map((row, ri) => (
              <div key={ri} style={{ display:'flex', gap:3, justifyContent:'center' }}>
                {row.map(key => {
                  const st = letterStates[key];
                  const col = st ? STATE_COLORS[st] : { bg:'rgba(255,255,255,0.55)', text:'#1d1d1f' };
                  const isWide = key === 'ENTER' || key === '⌫';
                  const isDisabled = phase !== 'playing';
                  return (
                    <button key={key} onClick={() => pressKey(key)} disabled={isDisabled}
                      style={{
                        width: isWide ? 52 : 32, height:36, borderRadius:7, border:'none',
                        background: col.bg, color: col.text,
                        fontSize: isWide ? 10 : 13, fontWeight:700, 
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.5 : 1,
                        backdropFilter:'blur(8px)', transition:'background 0.2s',
                      }}>
                      {key}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        <p style={{ color:'rgba(0,0,0,0.3)', fontSize:10, margin:0 }}>
          {phase === 'blocked' ? 'Una palabra por día' : 'Teclado físico o virtual · ESC cierra'}
        </p>
      </div>
    </GameLayout>
  );
}
