import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Button from '../components/Button';

export default function Asistencias({ user }) {
  const [materias, setMaterias] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState('');
  const [fecha, setFecha] = useState('');
  const [mensaje, setMensaje] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:3000/api/materias/user/${user.id}`)
        .then(res => res.json())
        .then(data => setMaterias(data.materias || []))
        .catch(err => console.error(err));
    }
  }, [user]);

  useEffect(() => {
    if (selectedMateria) {
      fetchAsistencias(selectedMateria);
    } else {
      setAsistencias([]);
    }
  }, [selectedMateria]);

  const fetchAsistencias = (materiaId) => {
    fetch(`http://localhost:3000/api/asistencias/materia/${materiaId}`)
      .then(res => res.json())
      .then(data => setAsistencias(data.asistencias || []))
      .catch(err => console.error(err));
  };

  const handleCrearSesion = async (e) => {
    e.preventDefault();
    if (!selectedMateria || !fecha) {
      setMensaje({ text: 'Selecciona materia y fecha', type: 'error' });
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/asistencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materiaId: selectedMateria, fecha, instructorId: user.id })
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje({ text: 'Sesión creada exitosamente', type: 'success' });
        setAsistencias([...asistencias, data.asistencia]);
        setFecha('');
      } else {
        setMensaje({ text: data.error, type: 'error' });
      }
    } catch (err) {
      setMensaje({ text: 'Error de red', type: 'error' });
    }
  };

  const handleMarcarAsistencia = async (asistenciaId) => {
    try {
      const res = await fetch('http://localhost:3000/api/asistencias/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asistenciaId, aprendizId: user.id, presente: true })
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje({ text: 'Asistencia registrada exitosamente', type: 'success' });
        fetchAsistencias(selectedMateria);
      } else {
        setMensaje({ text: data.error, type: 'error' });
      }
    } catch (err) {
      setMensaje({ text: 'Error de red', type: 'error' });
    }
  };

  const getUserAttendance = (asistencia) => {
    if (user.userType === 'instructor') return null;
    const reg = asistencia.registros.find(r => r.aprendizId === user.id);
    return reg ? (reg.presente ? 'Presente' : 'Ausente') : 'Sin marcar';
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <CheckCircle size={32} color="var(--color-primary)" />
        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--color-primary)', margin: 0 }}>Control de Asistencia</h2>
      </div>

      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        {user.userType === 'instructor' 
          ? 'Selecciona una materia para crear una sesión de clase y ver quiénes asistieron.' 
          : 'Selecciona una materia para registrar tu asistencia a las sesiones activas.'}
      </p>

      {mensaje.text && (
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', backgroundColor: mensaje.type === 'error' ? '#fee2e2' : '#d1fae5', color: mensaje.type === 'error' ? '#b91c1c' : '#047857', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          {mensaje.text}
        </div>
      )}

      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginBottom: '2rem', border: '1px solid var(--color-border)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Seleccionar Materia</h3>
        <select 
          className="input-field" 
          value={selectedMateria} 
          onChange={(e) => setSelectedMateria(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '1rem' }}
        >
          <option value="">Selecciona una materia...</option>
          {materias.map(m => (
            <option key={m.id} value={m.id}>{m.nombre} - {m.tipo}</option>
          ))}
        </select>

        {user?.userType === 'instructor' && selectedMateria && (
          <form onSubmit={handleCrearSesion} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <input 
              type="date" 
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
            <Button variant="primary" type="submit">Crear Sesión</Button>
          </form>
        )}
      </div>

      {selectedMateria ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {asistencias.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)' }}>
              No hay sesiones programadas para esta materia.
            </div>
          ) : (
            asistencias.map(asis => (
              <div key={asis.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div>
                  <h4 style={{ fontWeight: '700', fontSize: '1.125rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Fecha: {asis.fecha}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                    <Clock size={16} /> Estudiantes que han marcado asistencia: {asis.registros.length}
                  </div>
                  {user?.userType === 'aprendiz' && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: getUserAttendance(asis) === 'Presente' ? 'var(--color-secondary)' : 'var(--color-text-primary)' }}>
                      Estado: {getUserAttendance(asis)}
                    </div>
                  )}
                </div>
                {user?.userType === 'aprendiz' && getUserAttendance(asis) === 'Sin marcar' && (
                  <Button variant="primary" onClick={() => handleMarcarAsistencia(asis.id)} style={{ backgroundColor: 'var(--color-secondary)', borderColor: 'var(--color-secondary)' }}>
                    Registrar Asistencia
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
          Por favor, selecciona una materia arriba para ver las sesiones.
        </div>
      )}
    </div>
  );
}
