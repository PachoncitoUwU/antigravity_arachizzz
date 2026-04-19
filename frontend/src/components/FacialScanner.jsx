import React, { useState, useEffect, useRef } from 'react';
import { loadFaceModels, detectFaceDescriptor, faceDistance, arrayToDescriptor } from '../utils/faceApi';
import fetchApi from '../services/api';
import { ScanLine, Camera, CheckCircle2, Loader2, X, Users, AlertCircle } from 'lucide-react';

/**
 * Escáner de asistencia facial rápido y continuo.
 * Escanea sin parar, registra a cada aprendiz que reconoce con un toast rápido.
 * NO se cierra entre personas — funciona como una puerta automática.
 */
export default function FacialScanner({ asistenciaId, aprendices = [], alreadyRegistered = new Set(), onRegistered, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animRef = useRef(null);      // requestAnimationFrame loop
  const busyRef = useRef(false);     // evita solapamiento entre detecciones
  const registeredRef = useRef(new Set(alreadyRegistered));

  const [ready, setReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toasts, setToasts] = useState([]);            // { id, name, ok } — notificaciones fugaces
  const [registeredCount, setRegisteredCount] = useState(alreadyRegistered.size);

  // Candidatos con descriptor Float32Array ya parseado
  const candidates = aprendices
    .filter(a => a.faceDescriptor && a.faceDescriptor.length === 128)
    .map(a => ({ ...a, descriptor: arrayToDescriptor(a.faceDescriptor) }));

  const THRESHOLD = 0.52;
  const COOLDOWN_MS = 4000; // tiempo mínimo entre re-detección de la misma persona
  const lastSeenRef = useRef({}); // { userId: timestamp }

  // ─── Inicialización ───────────────────────────────────────────────────
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
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
        startLoop();
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err.name === 'NotAllowedError'
            ? 'Permiso de cámara denegado'
            : 'Error de cámara: ' + err.message);
        }
      }
    };

    init();
    return () => {
      cancelled = true;
      stopAll();
    };
  }, []);

  const stopAll = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  };

  // ─── Loop de detección (sin setInterval — usa setTimeout para controlar la cadencia) ──
  const startLoop = () => {
    const tick = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2 || busyRef.current) {
        animRef.current = setTimeout(tick, 200);
        return;
      }

      busyRef.current = true;
      try {
        const descriptor = await detectFaceDescriptor(videoRef.current);
        if (descriptor && candidates.length > 0) {
          // Buscar mejor match entre pendientes
          const now = Date.now();
          const pending = candidates.filter(c => {
            if (registeredRef.current.has(c.id)) return false;
            const lastSeen = lastSeenRef.current[c.id] || 0;
            return (now - lastSeen) > COOLDOWN_MS;
          });

          if (pending.length > 0) {
            let best = null, bestDist = Infinity;
            for (const c of pending) {
              const d = faceDistance(descriptor, c.descriptor);
              if (d < bestDist) { bestDist = d; best = c; }
            }

            if (bestDist < THRESHOLD && best) {
              lastSeenRef.current[best.id] = now;
              handleRegister(best);
            }
          }
        }
      } catch (_) {}

      busyRef.current = false;
      animRef.current = setTimeout(tick, 800); // detectar cada 800ms
    };

    animRef.current = setTimeout(tick, 500);
  };

  // ─── Registrar asistencia en backend ─────────────────────────────────
  const handleRegister = async (aprendiz) => {
    try {
      await fetchApi('/asistencias/facial-register', {
        method: 'POST',
        body: JSON.stringify({ asistenciaId, aprendizId: aprendiz.id })
      });
      registeredRef.current.add(aprendiz.id);
      setRegisteredCount(n => n + 1);
      addToast(aprendiz.fullName, true);
      onRegistered?.(aprendiz);
    } catch (err) {
      const alreadyDone = err.message?.includes('ya registró');
      if (alreadyDone) {
        registeredRef.current.add(aprendiz.id);
      } else {
        addToast(aprendiz.fullName, false);
      }
    }
  };

  // ─── Toasts rápidos ───────────────────────────────────────────────────
  const addToast = (name, ok) => {
    const id = Date.now();
    setToasts(prev => [...prev.slice(-4), { id, name, ok }]); // máx 5 visibles
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
  };

  const totalWithFace = candidates.length;

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
          <span className="font-semibold text-gray-800 text-sm">Escáner Facial Activo</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            <span className="font-bold text-[#34A853]">{registeredCount}</span> / {totalWithFace} reconocidos
          </span>
          <button onClick={() => { stopAll(); onClose(); }}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors">
            <X size={15} />
          </button>
        </div>
      </div>

      {totalWithFace === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <AlertCircle size={24} className="text-yellow-500 mx-auto mb-1" />
          <p className="text-sm font-semibold text-yellow-800">Sin caras registradas</p>
          <p className="text-xs text-yellow-600 mt-0.5">Ve a Fichas → aprendiz → Registrar Cara</p>
        </div>
      ) : (
        <div className="relative">
          {/* Video */}
          <div className="relative rounded-xl overflow-hidden bg-black"
            style={{ aspectRatio: '4/3', maxHeight: 280 }}>
            <video ref={videoRef} muted playsInline
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }} />

            {/* Estado loading */}
            {!ready && !errorMsg && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-white text-center">
                  <Loader2 size={28} className="animate-spin mx-auto mb-2" />
                  <p className="text-sm">Cargando IA...</p>
                </div>
              </div>
            )}

            {/* Error */}
            {errorMsg && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-4 text-center">
                  <AlertCircle size={28} className="text-red-500 mx-auto mb-1" />
                  <p className="text-sm text-red-700">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Guías de esquina */}
            {ready && (
              <>
                <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-white/60 rounded-tl" />
                <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-white/60 rounded-tr" />
                <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-white/60 rounded-bl" />
                <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-white/60 rounded-br" />
              </>
            )}

            {/* Toasts sobre el video */}
            <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1 pointer-events-none">
              {toasts.map(t => (
                <div key={t.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg
                    ${t.ok ? 'bg-[#34A853] text-white' : 'bg-red-500 text-white'}`}
                  style={{ animation: 'fadeSlideUp 0.2s ease' }}>
                  {t.ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  <span>{t.ok ? '✓' : '✗'} {t.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Barra de estado */}
          <div className="flex items-center justify-between mt-2 px-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              {ready ? (
                <><ScanLine size={13} className="text-[#4285F4]" /> Escaneando continuamente...</>
              ) : (
                <><Loader2 size={13} className="animate-spin" /> Iniciando...</>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {totalWithFace - registeredCount} pendientes
            </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
