import React, { useState, useEffect } from 'react';
import { Users, PlusCircle, Search, Copy, Check } from 'lucide-react';
import Button from '../components/Button';
import InputIcon from '../components/InputIcon';

export default function Fichas({ user }) {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  
  // Forms state
  const [formData, setFormData] = useState({ numero: '', nivel: 'Técnico', centro: '', jornada: 'Diurna' });
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchFichas = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/fichas/user/${user.id}`);
      const data = await response.json();
      if (response.ok) setFichas(data.fichas);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFichas(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/fichas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, instructorId: user.id })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setShowCreate(false);
      fetchFichas();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/fichas/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, code: joinCode.toUpperCase() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setShowJoin(false);
      setJoinCode('');
      fetchFichas();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={28} /> {user.userType === 'instructor' ? 'Mis Fichas de Formación' : 'Mi Ficha Actual'}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            {user.userType === 'instructor' ? 'Crea y administra tus grupos.' : 'Revisa los detalles de tu grupo.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {user.userType === 'instructor' && (
            <Button variant="primary" icon={<PlusCircle size={18} />} onClick={() => { setShowCreate(true); setShowJoin(false); }}>
              Crear Ficha
            </Button>
          )}
          {(!fichas.length || user.userType === 'instructor') && (
            <Button variant="outline" icon={<Search size={18} />} onClick={() => { setShowJoin(true); setShowCreate(false); }}>
              Unirse con Código
            </Button>
          )}
        </div>
      </div>

      {(showCreate || showJoin) && (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
            {showCreate ? 'Crear Nueva Ficha' : 'Unirse a una Ficha'}
          </h3>
          
          {error && <div style={{ color: '#b91c1c', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

          {showCreate && (
            <form onSubmit={handleCreate} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <InputIcon type="text" placeholder="Número de Ficha" value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} required />
              <div className="input-wrapper">
                <select className="input-field" value={formData.nivel} onChange={e => setFormData({...formData, nivel: e.target.value})} style={{ appearance: 'none', paddingLeft: '1rem' }}>
                  <option value="Técnico">Técnico</option>
                  <option value="Tecnólogo">Tecnólogo</option>
                </select>
              </div>
              <InputIcon type="text" placeholder="Centro de Formación" value={formData.centro} onChange={e => setFormData({...formData, centro: e.target.value})} required />
              <div className="input-wrapper">
                <select className="input-field" value={formData.jornada} onChange={e => setFormData({...formData, jornada: e.target.value})} style={{ appearance: 'none', paddingLeft: '1rem' }}>
                  <option value="Diurna">Diurna</option>
                  <option value="Nocturna">Nocturna</option>
                  <option value="Mixta">Mixta</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
                <Button variant="primary" type="submit">Guardar Ficha</Button>
              </div>
            </form>
          )}

          {showJoin && (
            <form onSubmit={handleJoin} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <InputIcon type="text" placeholder="Ingresa el código ej. A1B2C3" value={joinCode} onChange={e => setJoinCode(e.target.value)} required />
              <Button variant="primary" type="submit">Unirse</Button>
              <Button variant="outline" onClick={() => setShowJoin(false)} type="button">Cancelar</Button>
            </form>
          )}
        </div>
      )}

      {loading ? (
        <p>Cargando fichas...</p>
      ) : fichas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
          <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No tienes fichas asociadas.</h3>
          <p>Utiliza los botones superiores para {user.userType === 'instructor' ? 'crear una nueva o ' : ''}unirte a un grupo.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {fichas.map(f => (
            <div key={f.id} style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ backgroundColor: 'var(--color-surface)', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                  {f.jornada}
                </span>
                <span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                  {f.nivel}
                </span>
              </div>
              
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>Ficha {f.numero}</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{f.centro}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '1rem 0', marginBottom: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>{f.aprendices.length}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Aprendices</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>{f.instructores.length}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Instructores</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {user.userType === 'instructor' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-surface)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: '600', color: 'var(--color-text-primary)', letterSpacing: '1px' }}>{f.code}</span>
                    <button 
                      onClick={() => handleCopyCode(f.code)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
                      title="Copiar código de invitación"
                    >
                      {copiedCode === f.code ? <Check size={16} color="var(--color-secondary)" /> : <Copy size={16} />}
                    </button>
                  </div>
                )}
                <Button variant="outline" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', marginLeft: 'auto' }}>
                  Ver Detalles
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
