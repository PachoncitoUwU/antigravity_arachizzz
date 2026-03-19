import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { BookOpen, Users, Clock, FileText, CheckCircle, PlusCircle, LogIn, LayoutDashboard, LogOut } from 'lucide-react';

import Fichas from './Fichas';
import Materias from './Materias';
import Asistencias from './Asistencias';
import Excusas from './Excusas';

// Componente de la página de inicio del Dashboard
const DashboardHome = ({ user }) => (
  <>
    <header style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)' }}>
        Bienvenido, {user.fullName.split(' ')[0]}
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
        {user.userType === 'instructor' 
          ? 'Administra tus fichas y toma asistencia hoy.' 
          : 'Revisa tus materias y registra tu asistencia.'}
      </p>
    </header>

    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Acciones Rápidas</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
      {user.userType === 'instructor' ? (
        <>
          <Link to="/dashboard/fichas" className="btn btn-primary" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none' }}>
            <PlusCircle size={24} />
            Crear Ficha
          </Link>
          <Link to="/dashboard/fichas" className="btn btn-outline" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none' }}>
            <LogIn size={24} />
            Unirse a Ficha
          </Link>
          <Link to="/dashboard/materias" className="btn btn-outline" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none' }}>
            <Clock size={24} />
            Consultar Horario
          </Link>
        </>
      ) : (
        <>
          <Link to="/dashboard/asistencia" className="btn btn-primary" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none' }}>
            <CheckCircle size={24} />
            Registrar Asistencia
          </Link>
          <Link to="/dashboard/materias" className="btn btn-outline" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none' }}>
            <Clock size={24} />
            Consultar Horario
          </Link>
          <Link to="/dashboard/excusas" className="btn btn-outline" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none' }}>
            <FileText size={24} />
            Consultar Excusas
          </Link>
        </>
      )}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', border: '1px solid var(--color-border)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-primary)' }}>Estado de Cuenta</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-surface)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Fichas asociadas:</span>
            <span style={{ fontWeight: '500' }}>0</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-surface)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Materias:</span>
            <span style={{ fontWeight: '500' }}>0</span>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', border: '1px solid var(--color-border)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-secondary)' }}>
          {user.userType === 'instructor' ? 'Excusas Pendientes' : 'Asistencias Recientes'}
        </h3>
        <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          No hay datos para mostrar por ahora.
        </div>
      </div>
    </div>
  </>
);

export default function Dashboard({ user, onLogout }) {
  const location = useLocation();

  if (!user) return null;

  const NavLink = ({ to, icon, label }) => {
    const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
    return (
      <Link 
        to={to} 
        style={{ 
          padding: '0.75rem 1rem', 
          borderRadius: 'var(--radius-md)', 
          background: isActive ? 'var(--color-primary)' : 'transparent', 
          color: isActive ? 'white' : 'var(--color-text-secondary)', 
          fontWeight: '500', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          textDecoration: 'none',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'var(--color-surface)';
            e.currentTarget.style.color = 'var(--color-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }
        }}
      >
        {icon} {label}
      </Link>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface)', width: '100%' }}>
      {/* Sidebar - Aplicando el diseño de la autenticación */}
      <aside style={{ 
        width: '280px', 
        backgroundColor: 'white', 
        borderRight: '1px solid var(--color-border)', 
        padding: '2rem 1.5rem', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '4px 0 15px rgba(0,0,0,0.03)'
      }}>
        <div className="app-logo-container" style={{ position: 'relative', top: 0, left: 0, marginBottom: '2.5rem', color: 'var(--color-primary)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-8 8" />
            <path d="m12 3 8 8" />
            <path d="m12 11-8 8" />
            <path d="m12 11 8 8" />
          </svg>
          <span style={{ fontSize: '1.5rem' }}>Arachiz</span>
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Panel Principal" />
          
          {user.userType === 'instructor' && (
            <>
              <NavLink to="/dashboard/fichas" icon={<Users size={20} />} label="Gestión de Fichas" />
              <NavLink to="/dashboard/materias" icon={<Clock size={20} />} label="Materias y Horarios" />
              <NavLink to="/dashboard/asistencia" icon={<CheckCircle size={20} />} label="Sesiones de Clase" />
              <NavLink to="/dashboard/excusas" icon={<FileText size={20} />} label="Revisar Excusas" />
            </>
          )}

          {user.userType === 'aprendiz' && (
            <>
              <NavLink to="/dashboard/fichas" icon={<Users size={20} />} label="Mi Ficha" />
              <NavLink to="/dashboard/materias" icon={<BookOpen size={20} />} label="Mis Materias" />
              <NavLink to="/dashboard/asistencia" icon={<CheckCircle size={20} />} label="Asistencia" />
              <NavLink to="/dashboard/excusas" icon={<FileText size={20} />} label="Excusas" />
            </>
          )}
        </nav>

        <div style={{ marginTop: 'auto', backgroundColor: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user.fullName.charAt(0)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontWeight: '600', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.fullName}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{user.userType}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="btn btn-outline"
            style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        padding: '2.5rem 3rem', 
        overflowY: 'auto',
        // Aplicar el mismo wave sutil del login pero más desvanecido
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='0.4' d='M0,256L48,261.3C96,267,192,277,288,261.3C384,245,480,203,576,192C672,181,768,203,864,224C960,245,1056,267,1152,266.7C1248,267,1344,245,1392,234.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'bottom right',
        backgroundSize: '100% 300px',
        backgroundAttachment: 'fixed'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<DashboardHome user={user} />} />
            <Route path="/fichas" element={<Fichas user={user} />} />
            <Route path="/materias" element={<Materias user={user} />} />
            <Route path="/asistencia" element={<Asistencias user={user} />} />
            <Route path="/excusas" element={<Excusas user={user} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
