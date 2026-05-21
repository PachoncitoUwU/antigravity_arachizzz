import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Aplicar dark mode ANTES de que React renderice para evitar el flash blanco
try {
  const saved = localStorage.getItem('arachiz_settings');
  if (saved && JSON.parse(saved).darkMode === true) {
    document.documentElement.classList.add('dark');
  }
} catch {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
