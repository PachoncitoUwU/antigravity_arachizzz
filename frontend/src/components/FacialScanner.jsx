import React, { useState, useEffect, useRef } from 'react';
import { loadFaceModels, detectAllFaceDescriptors, faceDistance, arrayToDescriptor } from '../utils/faceApi';
import fetchApi from '../services/api';
import { ScanLine, CheckCircle2, Loader2, X, AlertCircle } from 'lucide-react';

/**
 * Escáner de asistencia: detecta TODAS las caras en el frame simultáneamente.
 * Cada cara detectada dispara su registro en paralelo (Promise.all).
 * El nombre aparece INSTANTÁNEAMENTE sobre el video sin esperar al servidor.
 */
export default function FacialScanner({ asistenciaId, aprendices = [], alreadyRegistered = new Set(), onRegistered, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const loopRef = useRef(null);
  const busyRef = useRef(false);
  const registeredRef = useRef(new Set(alreadyRegistered));
  const cooldownRef = useRef({}); // { userId: timestamp }

  const [ready, setReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registeredCount, setRegisteredCount] = useState(alreadyRegistered.size);

  // Caras actualmente reconocidas en vivo (array de nombres)
  const [liveMatches, setLiveMatches] = useState([]);
  const liveTimer = useRef(null);

  // Historial
  const [history, setHistory] = useState([]);

  const THRESHOLD = 0.52;
  const COOLDOWN_MS = 5000;

  const candidates = aprendices
    .filter(a => a.faceDescriptor?.length === 128)
    .map(a => ({ ...a, descriptor: arrayToDescriptor(a.faceDescriptor) }));

  // ─── Init ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        await loadFaceModels();
        if (cancelled) return;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
        setReady(true);
        startLoop();
      } catch (err) {
        if (!cancelled) setErrorMsg(err.name === 'NotAllowedError' ? 'Permiso de cámara denegado' : 'Error: ' + err.message);
      }
    };
    init();
    return () => { cancelled = true; cleanup(); };
  }, []);

  const cleanup = () => {
    if (loopRef.current) clearTimeout(loopRef.current);
    if (liveTimer.current) clearTimeout(liveTimer.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  };

  // ─── Loop principal ───────────────────────────────────────────────────
  const startLoop = () => {
    const tick = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2 || busyRef.current) {
        loopRef.current = setTimeout(tick, 100);
        return;
      }
      busyRef.current = true;

      try {
        // 🔑 Detectar TODAS las caras del frame de una sola vez
        const descriptors = await detectAllFaceDescriptors(videoRef.current);

        if (descriptors.length === 0) {
          setLiveMatches([]);
        } else {
          const now = Date.now();
          const matched = [];      // para mostrar en overlay visual
          const toRegister = [];   // para llamar al API

          // Para cada cara detectada, buscar el mejor candidato
          for (const desc of descriptors) {
            let best = null, bestDist = Infinity;
            for (const c of candidates) {
              const d = faceDistance(desc, c.descriptor);
              if (d < bestDist) { bestDist = d; best = c; }
            }

            if (best && bestDist < THRESHOLD) {
              const alreadyDone = registeredRef.current.has(best.id);
              const onCooldown = (now - (cooldownRef.current[best.id] || 0)) < COOLDOWN_MS;

              matched.push({ id: best.id, name: best.fullName, isNew: !alreadyDone && !onCooldown });

              if (!alreadyDone && !onCooldown) {
                cooldownRef.current[best.id] = now; // marcar cooldown inmediatamente
                toRegister.push(best);
              }
            }
          }

          // ✅ Mostrar nombres INSTANTÁNEAMENTE (sin esperar al API)
          setLiveMatches(matched);

          // Limpiar overlay 1.5s después de la última detección
          if (liveTimer.current) clearTimeout(liveTimer.current);
          liveTimer.current = setTimeout(() => setLiveMatches([]), 1500);

          // 🚀 Registrar todos en PARALELO (fire & forget, no bloquea el loop)
          if (toRegister.length > 0) {
            Promise.all(toRegister.map(a => saveAttendance(a))).then(results => {
              const saved = results.filter(Boolean);
              if (saved.length > 0) {
                setRegisteredCount(n => n + saved.length);
                setHistory(prev => [
                  ...saved.map(a => ({ id: a.id, name: a.fullName, ts: new Date() })),
                  ...prev
                ].slice(0, 20));
                saved.forEach(a => { registeredRef.current.add(a.id); onRegistered?.(a); });
              }
            });
          }
        }
      } catch (_) {}

      busyRef.current = false;
      loopRef.current = setTimeout(tick, 600); // ciclo cada 600ms
    };

    loopRef.current = setTimeout(tick, 400);
  };

  // ─── Guardar en BD ────────────────────────────────────────────────────
  const saveAttendance = async (aprendiz) => {
    try {
      await fetchApi('/asistencias/facial-register', {
        method: 'POST',
        body: JSON.stringify({ asistenciaId, aprendizId: aprendiz.id })
      });
      return aprendiz; // éxito
    } catch (err) {
      if (err.message?.includes('ya registró')) registeredRef.current.add(aprendiz.id);
      return null;
    }
  };

  const totalWithFace = candidates.length;

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
          <span className="font-semibold text-gray-800 text-sm">Escáner Facial</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs">
            <span className="font-bold text-[#34A853]">{registeredCount}</span>
            <span className="text-gray-400"> / {totalWithFace}</span>
          </span>
          <button onClick={() => { cleanup(); onClose(); }}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors">
            <X size={15} />
          </button>
        </div>
      </div>

      {totalWithFace === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <AlertCircle size={22} className="text-yellow-500 mx-auto mb-1" />
          <p className="text-sm font-semibold text-yellow-800">Sin caras registradas</p>
          <p className="text-xs text-yellow-600">Ve a Fichas → aprendiz → Registrar Cara</p>
        </div>
      ) : (
        <>
          {/* Video */}
          <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: '4/3', maxHeight: 270 }}>
            <video ref={videoRef} muted playsInline
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }} />

            {!ready && !errorMsg && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <Loader2 size={26} className="animate-spin text-white" />
              </div>
            )}
            {errorMsg && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-3 text-center">
                  <AlertCircle size={22} className="text-red-500 mx-auto mb-1" />
                  <p className="text-xs text-red-700">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* ✅ Overlay de reconocimiento múltiple — instantáneo */}
            {liveMatches.length > 0 && (
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0">
                {liveMatches.map((m, i) => (
                  <div key={m.id}
                    className={`flex items-center gap-2 px-3 py-2
                      ${m.isNew ? 'bg-[#34A853]' : 'bg-[#4285F4]/90'}
                      ${i === 0 ? '' : 'border-t border-white/20'}`}>
                    <CheckCircle2 size={16} className="text-white flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm leading-tight truncate">{m.name}</p>
                    </div>
                    <span className="text-white/70 text-xs flex-shrink-0">
                      {m.isNew ? 'Nuevo ✓' : 'Ya marcado'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Guías */}
            {ready && liveMatches.length === 0 && (
              <>
                <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-white/50 rounded-tl" />
                <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-white/50 rounded-tr" />
                <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-white/50 rounded-bl" />
                <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-white/50 rounded-br" />
              </>
            )}
          </div>

          {/* Estado */}
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-1 text-gray-400">
              {ready
                ? <><ScanLine size={12} className="text-[#4285F4]" /> Escaneando simultáneo...</>
                : <><Loader2 size={12} className="animate-spin" /> Iniciando...</>}
            </div>
            <span className="text-gray-400">{Math.max(0, totalWithFace - registeredCount)} pendientes</span>
          </div>

          {/* Historial */}
          {history.length > 0 && (
            <div className="max-h-28 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50">
              {history.map((h, i) => (
                <div key={h.id + i} className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 last:border-0">
                  <CheckCircle2 size={11} className="text-[#34A853] flex-shrink-0" />
                  <span className="text-xs text-gray-700 flex-1 truncate">{h.name}</span>
                  <span className="text-xs text-gray-400">
                    {h.ts.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
