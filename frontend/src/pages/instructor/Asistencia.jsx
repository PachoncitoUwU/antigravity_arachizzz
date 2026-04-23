import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import fetchApi from '../../services/api';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import FacialScanner from '../../components/FacialScanner';
import QRAttendance from '../../components/QRAttendance';
import { useToast } from '../../context/ToastContext';
import { Play, Square, Users, CheckCircle, Clock, BookOpen, BarChart2, Download, ScanFace, QrCode, Fingerprint, Wifi, RefreshCw, TrendingUp, Award } from 'lucide-react';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// ─── Timer ────────────────────────────────────────────────────────────────────
function Timer({ startTime }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = new Date(startTime).getTime();
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [startTime]);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  return <span className="font-mono tabular-nums">{h > 0 ? `${h}:` : ''}{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</span>;
}

// ─── Tooltip personalizado ────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-100 dark:border-gray-700 px-3 py-2 text-xs">
      <p className="font-bold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
}

export default function InstructorAsistencia() {
  const { showToast } = useToast();
  const [materias, setMaterias] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [selectedFecha, setSelectedFecha] = useState(() => new Date().toISOString().split('T')[0]); // Se deja internamente si es necesario, pero se oculta o elimina
  const [tab, setTab] = useState('sesion'); // 'sesion' | 'estadisticas'
  const [facialScannerOpen, setFacialScannerOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchApi('/asistencias/my-active-any').then(activeData => {
      let activeSet = false;
      if (activeData.session) {
        setSelectedMateria(activeData.session.materiaId);
        setActiveSession(activeData.session);
        connectSocket(activeData.session.id);
        activeSet = true;
      }
      fetchApi('/materias/my-materias').then(d => {
        setMaterias(d.materias);
        if (d.materias.length > 0 && !activeSet && !selectedMateria) {
          setSelectedMateria(d.materias[0].id);
        }
      }).catch(console.error).finally(() => setLoading(false));
    });
  }, []);

  useEffect(() => {
    if (!selectedMateria) return;
    loadSessions();
    // Si ya recuperamos we don't duplicate
    if (!activeSession || activeSession.materiaId !== selectedMateria) {
      checkActiveSession();
    }
  }, [selectedMateria]);

  const loadSessions = async () => {
    try {
      const d = await fetchApi(`/asistencias/materia/${selectedMateria}`);
      setSessions(d.asistencias);
    } catch {}
  };

  const checkActiveSession = async () => {
    try {
      const d = await fetchApi(`/asistencias/materia/${selectedMateria}/active`);
      if (d.session) { setActiveSession(d.session); connectSocket(d.session.id); }
      else setActiveSession(null);
    } catch {}
  };

  const connectSocket = (sessionId) => {
    if (socketRef.current) socketRef.current.disconnect();
    const socket = io(API_BASE);
    console.log('[Socket] Conectando a sesión:', sessionId);
    socket.emit('joinSession', sessionId);
    
    socket.on('connect', () => {
      console.log('[Socket] Conectado, ID:', socket.id);
    });
    
    socket.on('nuevaAsistencia', (data) => {
      console.log('[Socket] Nueva asistencia recibida:', data);
      setActiveSession(prev => {
        if (!prev) return prev;
        if (prev.registros?.some(r => r.aprendizId === data.aprendizId)) {
          console.log('[Socket] Registro duplicado, ignorando');
          return prev;
        }
        showToast(`✓ ${data.aprendiz?.fullName || 'Aprendiz'} registrado`, 'success');
        return { ...prev, registros: [...(prev.registros || []), { ...data, id: data.id || Date.now() }] };
      });
    });

    socket.on('arduino_read_nfc', async (data) => {
      if (!sessionId) return;
      setActiveSession(prev => {
        if (!prev) return prev;
        const student = prev.materia?.ficha?.aprendices?.find(a => a.nfcUid === data.uid);
        if (student) {
          if (prev.registros?.some(r => r.aprendizId === student.id)) return prev;
          showToast(`Registrando asistencia de ${student.fullName}...`, 'success');
          return {
            ...prev,
            registros: [...(prev.registros || []), {
              id: 'temp-' + Date.now(),
              aprendizId: student.id,
              aprendiz: student,
              presente: true,
              metodo: 'nfc',
              timestamp: new Date().toISOString()
            }]
          };
        }
        return prev;
      });

      try {
        await fetchApi('/asistencias/hardware-register', {
          method: 'POST',
          body: JSON.stringify({ asistenciaId: sessionId, nfcUid: data.uid })
        });
      } catch (err) {
        showToast(err.message, 'error');
        // Opcional: Podríamos revertir la UI si falla en BD. Por simplicidad, se deja.
      }
    });

    socket.on('arduino_read_finger', async (data) => {
      if (!sessionId) return;
      setActiveSession(prev => {
        if (!prev) return prev;
        const student = prev.materia?.ficha?.aprendices?.find(a => a.huellas?.includes(data.id));
        if (student) {
          if (prev.registros?.some(r => r.aprendizId === student.id)) return prev;
          showToast(`Registrando asistencia de ${student.fullName}...`, 'success');
          return {
            ...prev,
            registros: [...(prev.registros || []), {
              id: 'temp-' + Date.now(),
              aprendizId: student.id,
              aprendiz: student,
              presente: true,
              metodo: 'huella',
              timestamp: new Date().toISOString()
            }]
          };
        }
        return prev;
      });

      try {
        await fetchApi('/asistencias/hardware-register', {
          method: 'POST',
          body: JSON.stringify({ asistenciaId: sessionId, huellaId: data.id })
        });
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    socket.on('sessionClosed', () => { setActiveSession(null); loadSessions(); });
    socketRef.current = socket;
  };

  useEffect(() => () => socketRef.current?.disconnect(), []);

  const startSession = async () => {
    setStarting(true);
    try {
      const d = await fetchApi('/asistencias', {
        method: 'POST',
        // Backend ya genera su propia fecha inquebrantable
        body: JSON.stringify({ materiaId: selectedMateria })
      });
      setActiveSession({ ...d.asistencia, registros: [] });
      connectSocket(d.asistencia.id);
      showToast('Sesión iniciada', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setStarting(false); }
  };

  const endSession = async () => {
    if (!confirm('¿Finalizar la sesión? Los aprendices sin registro serán marcados como ausentes.')) return;
    try {
      await fetchApi(`/asistencias/${activeSession.id}/finalizar`, { method: 'PUT' });
      socketRef.current?.disconnect();
      setActiveSession(null);
      loadSessions();
      showToast('Sesión finalizada. Ausencias marcadas automáticamente.', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const exportSession = async (sessionId, fecha) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/export/session/${sessionId}/asistencia`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al exportar');
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `Arachiz_Asistencia_${fecha}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ─── Datos para gráficas ───────────────────────────────────────────────────
  const closedSessions = sessions.filter(s => !s.activa);

  const barData = closedSessions.slice(0, 8).reverse().map((s, i) => ({
    name: s.fecha,
    Presentes: s.registros?.filter(r => r.presente).length || 0,
    Ausentes: s.registros?.filter(r => !r.presente).length || 0,
  }));

  const totalPresentes = closedSessions.reduce((acc, s) => acc + (s.registros?.filter(r => r.presente).length || 0), 0);
  const totalAusentes  = closedSessions.reduce((acc, s) => acc + (s.registros?.filter(r => !r.presente).length || 0), 0);
  const pieData = [
    { name: 'Presentes', value: totalPresentes, color: '#34A853' },
    { name: 'Ausentes',  value: totalAusentes,  color: '#EA4335' },
  ];

  const totalAprendices = activeSession?.materia?.ficha?.aprendices?.length || 0;
  const presentes = activeSession?.registros?.filter(r => r.presente !== false).length || 0;
  const pendientes = totalAprendices - presentes;
  const porcentajeCompletado = totalAprendices > 0 ? Math.round((presentes / totalAprendices) * 100) : 0;

  // Estados para hardware
  const [comPort, setComPort] = useState('COM8');
  const [hardwareConnected, setHardwareConnected] = useState(false);

  return (
    <div className="animate-fade-in space-y-5">
      <PageHeader title="Asistencia" subtitle="Sesión activa" />

      {/* Selector de materia y botón finalizar */}
      <div className="card dark:bg-gray-900 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Materia
            </label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4] transition-all"
              value={selectedMateria}
              onChange={e => setSelectedMateria(e.target.value)}
              disabled={!!activeSession || materias.length === 0}>
              {materias.length === 0
                ? <option>Sin materias disponibles</option>
                : materias.map(m => <option key={m.id} value={m.id}>{m.nombre} – Ficha {m.ficha?.numero}</option>)
              }
            </select>
          </div>
          <div>
            {!activeSession ? (
              <button 
                onClick={startSession} 
                disabled={!selectedMateria || starting} 
                className="px-6 py-3 rounded-xl bg-[#EA4335] text-white text-sm font-semibold hover:bg-red-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <Play size={16}/> {starting ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            ) : (
              <button 
                onClick={endSession} 
                className="px-6 py-3 rounded-xl bg-[#EA4335] text-white text-sm font-semibold hover:bg-red-600 transition-all shadow-sm flex items-center gap-2">
                <Square size={16}/> Finalizar Sesión
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lector de Huella y NFC */}
      {activeSession && (
        <div className="card dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Fingerprint size={18} className="text-[#4285F4]" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lector de Huella y NFC</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <select 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4] transition-all"
                value={comPort}
                onChange={e => setComPort(e.target.value)}>
                <option value="COM8">COM8 - seleccion</option>
                <option value="COM3">COM3</option>
                <option value="COM4">COM4</option>
                <option value="COM5">COM5</option>
                <option value="COM6">COM6</option>
                <option value="COM7">COM7</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setHardwareConnected(!hardwareConnected)}
                className="px-5 py-2.5 rounded-xl bg-[#4285F4] text-white text-sm font-semibold hover:bg-blue-600 transition-all shadow-sm flex items-center gap-2">
                <RefreshCw size={14}/> Vincular Lector
              </button>
              <button 
                onClick={() => setFacialScannerOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#34A853] text-white text-sm font-semibold hover:bg-green-600 transition-all shadow-sm flex items-center gap-2">
                <ScanFace size={14}/> Escanear Facial
              </button>
            </div>
          </div>
          {hardwareConnected && (
            <div className="mt-3 flex items-center gap-2 text-xs text-[#34A853] bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
              <Wifi size={12} />
              <span>Lector conectado en {comPort}</span>
            </div>
          )}
        </div>
      )}
      {/* Estadísticas principales */}
      {activeSession && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card-sm bg-gray-50 dark:bg-gray-800 text-center border-l-4 border-l-gray-400">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users size={16} className="text-gray-600 dark:text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{totalAprendices}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total</p>
          </div>
          <div className="card-sm bg-green-50 dark:bg-green-900/20 text-center border-l-4 border-l-[#34A853]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle size={16} className="text-[#34A853]" />
            </div>
            <p className="text-3xl font-bold text-[#34A853]">{presentes}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Presentes</p>
          </div>
          <div className="card-sm bg-yellow-50 dark:bg-yellow-900/20 text-center border-l-4 border-l-[#FBBC05]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock size={16} className="text-[#FBBC05]" />
            </div>
            <p className="text-3xl font-bold text-[#FBBC05]">{pendientes}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ausentes</p>
          </div>
          <div className="card-sm bg-blue-50 dark:bg-blue-900/20 text-center border-l-4 border-l-[#4285F4]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp size={16} className="text-[#4285F4]" />
            </div>
            <p className="text-3xl font-bold text-[#4285F4]">{porcentajeCompletado}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completado</p>
          </div>
        </div>
      )}

      {/* Sección de Materias y Registrados */}
      {activeSession && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Materias */}
          <div className="card dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#34A853]">✓ Materias</h3>
              <button 
                onClick={() => exportSession(activeSession.id, activeSession.fecha)}
                className="text-xs text-[#4285F4] hover:underline flex items-center gap-1">
                <Download size={12}/> Exportar
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {activeSession.materia?.nombre}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Ficha {activeSession.materia?.ficha?.numero}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span>Progreso</span>
                <span className="font-semibold">{presentes} / {totalAprendices}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#34A853] rounded-full transition-all duration-500"
                  style={{ width: `${porcentajeCompletado}%` }}
                />
              </div>
            </div>
          </div>

          {/* Registrados */}
          <div className="card dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#34A853]">✓ Registrados</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">{presentes}</span>
            </div>
            {presentes === 0 ? (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <Users size={28} className="mx-auto mb-2 opacity-30"/>
                <p className="text-sm">Esperando registros...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activeSession.registros?.filter(r => r.presente !== false).map((reg, i) => (
                  <div key={reg.id || i} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                    <div className="w-10 h-10 rounded-full bg-[#34A853] flex items-center justify-center text-white font-bold text-sm">
                      {(reg.aprendiz?.fullName || reg.fullName || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {reg.aprendiz?.fullName || reg.fullName || 'Aprendiz'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {reg.materia?.ficha?.numero || activeSession.materia?.ficha?.numero || 'Ficha'}
                      </p>
                    </div>
                    <CheckCircle size={18} className="text-[#34A853] shrink-0"/>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historial de Sesiones */}
      {closedSessions.length > 0 && (
        <div className="card dark:bg-gray-900 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Historial de Sesiones</h2>
          
          {/* Estadísticas del historial */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-[#4285F4]">{closedSessions.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Sesiones</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-[#34A853]">
                {totalPresentes + totalAusentes > 0 
                  ? Math.round((totalPresentes / (totalPresentes + totalAusentes)) * 100) 
                  : 0}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Promedio Asistencia</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {closedSessions.length > 0 
                  ? Math.max(...closedSessions.map(s => {
                      const p = s.registros?.filter(r => r.presente).length || 0;
                      const t = s.registros?.length || 0;
                      return t > 0 ? Math.round((p / t) * 100) : 0;
                    }))
                  : 0}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mejor Sesión</p>
            </div>
          </div>

          {/* Lista de sesiones */}
          <div className="space-y-2">
            {closedSessions.slice(0, 5).map(s => {
              const p = s.registros?.filter(r => r.presente).length || 0;
              const t = s.registros?.length || 0;
              const pct = t > 0 ? Math.round((p / t) * 100) : 0;
              const ausentes = t - p;
              
              return (
                <div key={s.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.fecha}</p>
                      <p className="text-xs text-gray-400">
                        Monitor: {s.instructor?.fullName?.split(' ').slice(0, 2).join(' ') || 'Instructor'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        pct >= 90 ? 'bg-green-100 text-[#34A853]' :
                        pct >= 70 ? 'bg-yellow-100 text-[#FBBC05]' :
                        'bg-red-100 text-[#EA4335]'
                      }`}>
                        {pct}%
                      </span>
                      <button 
                        onClick={() => exportSession(s.id, s.fecha)} 
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors" 
                        title="Exportar Sesión">
                        <Download size={14} className="text-[#34A853]"/>
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{t}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-[#34A853]">{p}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Presentes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-[#EA4335]">{ausentes}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Ausentes</p>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#34A853] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <Modal open={facialScannerOpen} onClose={() => setFacialScannerOpen(false)} title="Reconocimiento Facial Activo">
        {activeSession && (
          <FacialScanner
            asistenciaId={activeSession.id}
            fichaId={activeSession.materia?.ficha?.id}
            aprendices={activeSession.materia?.ficha?.aprendices || []}
            alreadyRegistered={new Set((activeSession.registros || []).map(r => r.aprendizId))}
            onRegistered={(aprendiz) => {
              showToast(`✓ ${aprendiz.fullName} marcado como presente`, 'success');
              setActiveSession(prev => {
                if (!prev) return prev;
                if (prev.registros?.some(r => r.aprendizId === aprendiz.id)) return prev;
                return {
                  ...prev,
                  registros: [...(prev.registros || []), {
                    id: 'facial-' + Date.now(),
                    aprendizId: aprendiz.id,
                    aprendiz: { fullName: aprendiz.fullName },
                    presente: true,
                    metodo: 'facial',
                    timestamp: new Date().toISOString()
                  }]
                };
              });
            }}
            onClose={() => setFacialScannerOpen(false)}
          />
        )}
      </Modal>

      {/* Modal QR */}
      {qrModalOpen && activeSession && (
        <QRAttendance 
          asistenciaId={activeSession.id}
          onClose={() => setQrModalOpen(false)}
        />
      )}
    </div>
  );
}
