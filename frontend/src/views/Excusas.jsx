import React, { useState, useEffect } from 'react';
import { FileText, Check, X, PlusCircle } from 'lucide-react';
import Button from '../components/Button';

export default function Excusas({ user }) {
  const [excusas, setExcusas] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ tipo: 'Médica', descripcion: '', fecha: '' });
  const [mensaje, setMensaje] = useState({ text: '', type: '' });

  const fetchExcusas = () => {
    const url = user.userType === 'instructor' 
      ? `http://localhost:3000/api/excusas` 
      : `http://localhost:3000/api/excusas/user/${user.id}`;
      
    fetch(url)
      .then(res => res.json())
      .then(data => setExcusas(data.excusas || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (user) fetchExcusas();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.descripcion || !formData.fecha) {
      setMensaje({ text: 'Por favor completa todos los campos', type: 'error' });
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/excusas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, aprendizId: user.id })
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje({ text: 'Excusa enviada correctamente', type: 'success' });
        setShowCreate(false);
        setFormData({ tipo: 'Médica', descripcion: '', fecha: '' });
        fetchExcusas();
        setTimeout(() => setMensaje({ text: '', type: '' }), 3000);
      } else {
        setMensaje({ text: data.error, type: 'error' });
      }
    } catch (err) {
      setMensaje({ text: 'Error de red al enviar', type: 'error' });
    }
  };

  const handleUpdateEstado = async (id, estado) => {
    try {
      const res = await fetch(`http://localhost:3000/api/excusas/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado })
      });
      if (res.ok) {
        fetchExcusas();
      }
    } catch (err) {
      console.error('Error al actualizar', err);
    }
  };

  const getStatusColor = (estado) => {
    if (estado === 'Aprobada') return '#059669'; // success green
    if (estado === 'Rechazada') return '#dc2626'; // error red
    return '#d97706'; // pending orange
  };

  const getStatusBgColor = (estado) => {
    if (estado === 'Aprobada') return '#d1fae5'; 
    if (estado === 'Rechazada') return '#fee2e2'; 
    return '#fef3c7'; 
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={32} />
            Gestión de Excusas
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            {user.userType === 'instructor' ? 'Revisa y aprueba inasistencias de aprendices.' : 'Envía soportes por inasistencia.'}
          </p>
        </div>
        
        {user.userType === 'aprendiz' && (
          <Button variant="primary" icon={<PlusCircle size={18} />} onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancelar' : 'Enviar Excusa'}
          </Button>
        )}
      </div>

      {mensaje.text && (
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', backgroundColor: mensaje.type === 'error' ? '#fee2e2' : '#d1fae5', color: mensaje.type === 'error' ? '#b91c1c' : '#047857' }}>
          {mensaje.text}
        </div>
      )}

      {showCreate && (
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginBottom: '2rem', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Nueva Excusa</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Tipo de Excusa</label>
                <select value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <option value="Médica">Médica</option>
                  <option value="Personal">Personal</option>
                  <option value="Laboral">Laboral</option>
                  <option value="Calamidad">Calamidad Doméstica</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Fecha de Inasistencia</label>
                <input type="date" value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} required />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Descripción o Justificación</label>
              <textarea 
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                placeholder="Explica brevemente el motivo..."
                rows="3"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', resize: 'vertical' }}
                required
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button variant="primary" type="submit">Enviar Excusa</Button>
            </div>
          </form>
        </div>
      )}

      {excusas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
          <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No hay excusas registradas.</h3>
          <p>{user.userType === 'instructor' ? 'Los aprendices no han enviado excusas aún.' : 'Aquí aparecerán las excusas que envíes.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {excusas.map((excusa) => (
            <div key={excusa.id} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{excusa.tipo}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{excusa.fecha}</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontWeight: '600', backgroundColor: getStatusBgColor(excusa.estado), color: getStatusColor(excusa.estado) }}>
                    {excusa.estado}
                  </span>
                </div>
                <p style={{ color: 'var(--color-text-primary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>{excusa.descripcion}</p>
              </div>
              
              {user.userType === 'instructor' && excusa.estado === 'Pendiente' && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button onClick={() => handleUpdateEstado(excusa.id, 'Aprobada')} style={{ background: 'var(--color-secondary)', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Aprobar">
                    <Check size={18} />
                  </button>
                  <button onClick={() => handleUpdateEstado(excusa.id, 'Rechazada')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Rechazar">
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
