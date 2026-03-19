import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InputIcon from '../components/InputIcon';
import Button from '../components/Button';

// Icono simple para simular el de Google
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

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

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      onLoginSuccess(data.user);
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
      
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">Iniciar sesión</h1>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
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

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </Button>

          <Button type="button" variant="outline" fullWidth icon={<GoogleIcon />}>
            Iniciar sesión con Google
          </Button>

          <div style={{ textAlign: 'center', marginTop: '-0.25rem', marginBottom: '0.25rem' }}>
            <a href="#forgot">¿Olvidaste tu contraseña?</a>
          </div>

          <div className="divider">o</div>

          <Button 
            type="button" 
            variant="success" 
            fullWidth
            onClick={() => navigate('/register')}
          >
            Registrarse
          </Button>
        </form>
      </div>
    </>
  );
}
