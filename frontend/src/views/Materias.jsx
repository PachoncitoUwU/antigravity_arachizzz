import React, { useState, useEffect } from 'react';
import { BookOpen, PlusCircle, Search } from 'lucide-react';
import Button from '../components/Button';
import InputIcon from '../components/InputIcon';

export default function Materias({ user }) {
  const [materias, setMaterias] = useState([]);
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  
  // Forms state
  const [formData, setFormData] = useState({ fichaId: '', nombre: '', tipo: 'Técnica' });
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      // 1. Fetch Materias del usuario
      const mRes = await fetch(`http://localhost:3000/api/materias/user/${user.id}`);
      const mData = await mRes.json();
      if (mRes.ok) setMaterias(mData.materias);

      // 2. Si es instructor, fetch sus Fichas (para el select de crear materia)
      if (user.userType === 'instructor') {
        const fRes = await fetch(`http://localhost:3000/api/fichas/user/${user.id}`);
        const fData = await fRes.json();
        if (fRes.ok) setFichas(fData.fichas);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/materias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, instructorId: user.id })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setShowCreate(false);
      setFormData({ fichaId: '', nombre: '', tipo: 'Técnica' });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BookOpen size={28} /> {user.userType === 'instructor' ? 'Gestión de Materias' : 'Mis Materias Activas'}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            {user.userType === 'instructor' ? 'Crea y asigna clases a tus fichas.' : 'Revisa tus clases programadas.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {user.userType === 'instructor' && (
            <Button variant="primary" icon={<PlusCircle size={18} />} onClick={() => setShowCreate(!showCreate)}>
              Programar Materia
            </Button>
          )}
        </div>
      </div>

      {showCreate && user.userType === 'instructor' && (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Crear Nueva Materia</h3>
          
          {error && <div style={{ color: '#b91c1c', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

          <form onSubmit={handleCreate} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            
            <div className="input-wrapper">
              <select className="input-field" value={formData.fichaId} onChange={e => setFormData({...formData, fichaId: e.target.value})} style={{ appearance: 'none', paddingLeft: '1rem' }} required>
                <option value="" disabled>Seleccionar Ficha Destino</option>
                {fichas.map(f => <option key={f.id} value={f.id}>Ficha {f.numero} - {f.jornada}</option>)}
              </select>
            </div>

            <InputIcon type="text" placeholder="Nombre de la Materia" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
            
            <div className="input-wrapper">
              <select className="input-field" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} style={{ appearance: 'none', paddingLeft: '1rem' }}>
                <option value="Técnica">Técnica</option>
                <option value="Transversal">Transversal</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <Button variant="outline" onClick={() => setShowCreate(false)} type="button">Cancelar</Button>
              <Button variant="primary" type="submit">Guardar Materia</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Cargando materias...</p>
      ) : materias.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
          <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No hay materias disponibles.</h3>
          <p>{user.userType === 'instructor' ? 'Empieza creando una materia para tus fichas.' : 'Espera a que un instructor asigne materias a tu ficha.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {materias.map(m => (
            <div key={m.id} style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative' }}>
              
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                <span style={{ backgroundColor: m.tipo === 'Técnica' ? '#dbeafe' : '#fce7f3', color: m.tipo === 'Técnica' ? '#1d4ed8' : '#be185d', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                  {m.tipo}
                </span>
              </div>
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '0.5rem', paddingRight: '4rem' }}>{m.nombre}</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>ID Ficha asoc.: {m.fichaId}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  <Search size={16} /> Ver Detalles
                </div>
                <Button variant="success" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                  {user.userType === 'instructor' ? 'Tomar Asistencia' : 'Ver Asistencia'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
