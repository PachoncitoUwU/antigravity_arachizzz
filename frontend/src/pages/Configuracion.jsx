import React, { useContext, useState, useRef, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import { Moon, Sun, Globe, Bell, User, Shield, Palette, Save, Camera, Loader, Lock, Eye, EyeOff } from 'lucide-react';

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
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

function Section({ icon: Icon, title, children, onTitleClick }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <Icon size={16} className="text-[#4285F4]" />
        </div>
        <h2 className="font-bold text-gray-900 cursor-default select-none" onClick={onTitleClick}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── JUEGO SECRETO: Snake ─────────────────────────────────────────────────────
const COLS = 15, ROWS = 12, CELL = 24;
const DIR = { ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0] };

function SnakeGame({ onClose }) {
  const [snake, setSnake]   = useState([[7,6],[6,6],[5,6]]);
  const [food, setFood]     = useState([10,4]);
  const [dir, setDir]       = useState([1,0]);
  const [score, setScore]   = useState(0);
  const [dead, setDead]     = useState(false);
  const dirRef              = useRef([1,0]);

  const randFood = (s) => {
    let f;
    do { f = [Math.floor(Math.random()*COLS), Math.floor(Math.random()*ROWS)]; }
    while (s.some(c => c[0]===f[0] && c[1]===f[1]));
    return f;
  };

  useEffect(() => {
    const onKey = (e) => {
      if (DIR[e.key]) { e.preventDefault(); dirRef.current = DIR[e.key]; }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (dead) return;
    const iv = setInterval(() => {
      setSnake(prev => {
        const [dx,dy] = dirRef.current;
        const head = [prev[0][0]+dx, prev[0][1]+dy];
        if (head[0]<0||head[0]>=COLS||head[1]<0||head[1]>=ROWS||prev.some(c=>c[0]===head[0]&&c[1]===head[1])) {
          setDead(true); return prev;
        }
        const ate = head[0]===food[0] && head[1]===food[1];
        const next = [head, ...prev.slice(0, ate ? undefined : -1)];
        if (ate) { setScore(s=>s+10); setFood(randFood(next)); }
        return next;
      });
    }, 130);
    return () => clearInterval(iv);
  }, [dead, food]);

  const reset = () => {
    const s = [[7,6],[6,6],[5,6]];
    setSnake(s); setFood(randFood(s)); dirRef.current=[1,0]; setDir([1,0]); setScore(0); setDead(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200]" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center gap-4" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between w-full">
          <h3 className="font-bold text-gray-900">🐍 Snake — Puntos: {score}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">✕ Cerrar</button>
        </div>
        <div style={{ width: COLS*CELL, height: ROWS*CELL, background:'#f8fafc', border:'2px solid #e2e8f0', borderRadius:12, position:'relative', overflow:'hidden' }}>
          {snake.map(([x,y],i) => (
            <div key={i} style={{ position:'absolute', left:x*CELL, top:y*CELL, width:CELL-2, height:CELL-2, background: i===0?'#4285F4':'#34A853', borderRadius:i===0?6:4, transition:'all 0.1s' }}/>
          ))}
          <div style={{ position:'absolute', left:food[0]*CELL+2, top:food[1]*CELL+2, width:CELL-6, height:CELL-6, background:'#EA4335', borderRadius:'50%' }}/>
          {dead && (
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, borderRadius:10 }}>
              <p style={{ color:'white', fontWeight:700, fontSize:18 }}>Game Over — {score} pts</p>
              <button onClick={reset} style={{ background:'#4285F4', color:'white', border:'none', borderRadius:10, padding:'8px 20px', fontWeight:600, cursor:'pointer' }}>Reintentar</button>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400">Usa las flechas del teclado · ESC para cerrar</p>
        {/* Controles táctiles */}
        <div className="flex flex-col items-center gap-1">
          <button onClick={() => { dirRef.current = DIR['ArrowUp']; }}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 flex items-center justify-center">↑</button>
          <div className="flex gap-1">
            <button onClick={() => { dirRef.current = DIR['ArrowLeft']; }}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 flex items-center justify-center">←</button>
            <button onClick={() => { dirRef.current = DIR['ArrowDown']; }}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 flex items-center justify-center">↓</button>
            <button onClick={() => { dirRef.current = DIR['ArrowRight']; }}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 flex items-center justify-center">→</button>
          </div>
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
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl ? `${API_BASE}${user.avatarUrl}` : null);
  const [avatarFile, setAvatarFile]       = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Cambio de contraseña
  const [passForm, setPassForm]   = useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass]   = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  // Juego secreto — se activa con 7 clicks en "Seguridad"
  const [secClicks, setSecClicks] = useState(0);
  const [showGame, setShowGame]   = useState(false);
  const secTimer = useRef(null);

  const handleSecClick = () => {
    setSecClicks(n => {
      const next = n + 1;
      if (next >= 7) { setShowGame(true); return 0; }
      clearTimeout(secTimer.current);
      secTimer.current = setTimeout(() => setSecClicks(0), 2000);
      return next;
    });
  };

  const initials  = user?.fullName ? user.fullName.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() : '?';
  const roleColor = user?.userType === 'instructor' ? 'bg-[#4285F4]' : 'bg-[#34A853]';

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5*1024*1024) { showToast('La imagen no puede superar 5MB','error'); return; }
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
      if (!d.ok) throw new Error(json.error || 'Error al guardar');
      if (updateUser) updateUser(json.user);
      setAvatarFile(null);
      showToast('Perfil actualizado','success');
    } catch(err) { showToast(err.message,'error'); }
    finally { setSavingProfile(false); }
  };

  const handleChangePass = async (e) => {
    e.preventDefault();
    if (passForm.newPass !== passForm.confirm) return showToast('Las contraseñas no coinciden','error');
    if (passForm.newPass.length < 6) return showToast('Mínimo 6 caracteres','error');
    setSavingPass(true);
    try {
      // Endpoint de cambio de contraseña (se agrega al backend)
      const d    = await fetch(`${API_BASE}/api/auth/change-password`, {
        method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ currentPassword: passForm.current, newPassword: passForm.newPass })
      });
      const json = await d.json();
      if (!d.ok) throw new Error(json.error || 'Error');
      setPassForm({ current:'', newPass:'', confirm:'' });
      showToast('Contraseña actualizada','success');
    } catch(err) { showToast(err.message,'error'); }
    finally { setSavingPass(false); }
  };

  const LANGUAGES = [
    { code:'es', label:'Español', flag:'🇨🇴' },
    { code:'en', label:'English', flag:'🇺🇸' },
  ];

  return (
    <div className="animate-fade-in space-y-5 max-w-2xl">
      {showGame && <SnakeGame onClose={() => setShowGame(false)} />}

      <PageHeader title="Configuración" subtitle="Personaliza tu experiencia en Arachiz" />

      {/* Perfil */}
      <Section icon={User} title="Perfil">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-5 mb-2">
            <div className="relative group">
              {avatarPreview
                ? <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover shadow-md"/>
                : <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-md ${roleColor}`}>{initials}</div>
              }
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white"/>
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange}/>
            </div>
            <div>
              <p className="font-bold text-gray-900">{user?.fullName}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <span className={`badge mt-1 ${user?.userType==='instructor'?'badge-info':'badge-success'}`}>
                {user?.userType==='instructor'?'Instructor':'Aprendiz'}
              </span>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="block text-xs text-[#4285F4] hover:underline mt-1">Cambiar foto</button>
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
      <Section icon={Palette} title="Apariencia">
        <p className="text-sm font-medium text-gray-700 mb-3">Tema</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
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
        <p className="text-xs text-gray-400 mt-3">La traducción completa al inglés estará disponible próximamente.</p>
      </Section>

      {/* Notificaciones */}
      <Section icon={Bell} title="Notificaciones">
        <div className="divide-y divide-gray-100">
          <ToggleSwitch checked={settings.notifications} onChange={v=>updateSetting('notifications',v)}
            label="Notificaciones del sistema" description="Alertas de sesiones, excusas y actividad"/>
        </div>
      </Section>

      {/* Cambio de contraseña — función útil nueva */}
      <Section icon={Lock} title="Cambiar Contraseña">
        <form onSubmit={handleChangePass} className="space-y-3">
          <div className="relative">
            <label className="input-label">Contraseña actual</label>
            <input type={showPass?'text':'password'} required className="input-field pr-10"
              value={passForm.current} onChange={e=>setPassForm(p=>({...p,current:e.target.value}))} placeholder="••••••••"/>
            <button type="button" onClick={()=>setShowPass(v=>!v)} className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
              {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
            </button>
          </div>
          <div>
            <label className="input-label">Nueva contraseña</label>
            <input type={showPass?'text':'password'} required className="input-field"
              value={passForm.newPass} onChange={e=>setPassForm(p=>({...p,newPass:e.target.value}))} placeholder="Mínimo 6 caracteres"/>
          </div>
          <div>
            <label className="input-label">Confirmar nueva contraseña</label>
            <input type={showPass?'text':'password'} required className="input-field"
              value={passForm.confirm} onChange={e=>setPassForm(p=>({...p,confirm:e.target.value}))} placeholder="Repite la contraseña"/>
          </div>
          <button type="submit" disabled={savingPass} className="btn-primary flex items-center gap-2">
            {savingPass?<Loader size={15} className="animate-spin"/>:<Lock size={15}/>}
            {savingPass?'Guardando...':'Actualizar contraseña'}
          </button>
        </form>
      </Section>

      {/* Seguridad — clic 7 veces para el juego */}
      <Section icon={Shield} title="Seguridad" onTitleClick={handleSecClick}>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Tu sesión expira automáticamente después de 8 horas de inactividad.</p>
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sesión actual</p>
            <p className="text-sm text-gray-700">{user?.email}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.userType}</p>
          </div>
          {secClicks > 0 && secClicks < 7 && (
            <p className="text-xs text-gray-300 text-center">{7-secClicks} más...</p>
          )}
        </div>
      </Section>
    </div>
  );
}
