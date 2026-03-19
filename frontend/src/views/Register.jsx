import React, { useState } from 'react';
import { User, Mail, Lock, CreditCard, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InputIcon from '../components/InputIcon';
import Button from '../components/Button';

// Reutilizamos el Logo de Login
const LogoArachiz = () => (
  <div className="app-logo-container">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-8 8" />
      <path d="m12 3 8 8" />
      <path d="m12 11-8 8" />
      <path d="m12 11 8 8" />
    </svg>
    Arachiz
  </div>
);

export default function Register({ onRegisterSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userType: '',
    fullName: '',
    document: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Frontend validation RF62
    if (formData.password !== formData.confirmPassword) {
      return setError('Las contraseñas no coinciden.');
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      onRegisterSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <>
      <LogoArachiz />
      
      <div className="auth-container" style={{ margin: '1rem auto' }}>
        <div className="auth-header">
          <h1 className="auth-title">Crear cuenta</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Únete a Arachiz y gestiona tu asistencia
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          
          <div className="input-wrapper">
            <div className="input-icon"><User strokeWidth={1.5} /></div>
            <select 
              name="userType" 
              className="input-field" 
              required 
              value={formData.userType}
              onChange={handleChange}
              style={{ appearance: 'none' }}
            >
              <option value="" disabled>Selecciona tipo de usuario</option>
              <option value="aprendiz">Aprendiz</option>
              <option value="instructor">Instructor</option>
            </select>
            <div style={{ position: 'absolute', right: '1rem', pointerEvents: 'none', color: 'var(--color-text-light)' }}>
              <ChevronDown size={18} />
            </div>
          </div>

          <InputIcon
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nombre completo"
            icon={<User strokeWidth={1.5} />}
            required
          />

          <InputIcon
            type="number"
            name="document"
            value={formData.document}
            onChange={handleChange}
            placeholder="Número de documento"
            icon={<CreditCard strokeWidth={1.5} />}
            required
          />

          <InputIcon
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Correo electrónico"
            icon={<Mail strokeWidth={1.5} />}
            required
          />

          <InputIcon
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Contraseña"
            icon={<Lock strokeWidth={1.5} />}
            required
          />

          <InputIcon
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmar contraseña"
            icon={<Lock strokeWidth={1.5} />}
            required
          />

          <Button type="submit" variant="success" fullWidth style={{ marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse ahora'}
          </Button>

          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>¿Ya tienes una cuenta? </span>
            <a href="#login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Iniciar sesión
            </a>
          </div>
        </form>
      </div>
    </>
  );
}
