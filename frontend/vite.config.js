import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'

// Obtener IP local automáticamente para desarrollo en red local
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // escucha en 0.0.0.0 — accesible desde celular en la misma WiFi
    port: 5173,
  },
})
