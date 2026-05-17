# 📁 Cómo Ver y Editar Archivos .env

## ¿Por qué no veo el archivo .env?

Los archivos que empiezan con punto (`.env`, `.gitignore`, etc.) están **ocultos por defecto** en Windows.

---

## 🔍 Opción 1: Ver en VS Code (Recomendado)

### Paso 1: Abre VS Code
```bash
code .
```

### Paso 2: Busca el archivo
En el explorador de archivos de VS Code, verás:
```
backend/
  ├── .env          ← Aquí está!
  ├── .env.example
  ├── .gitignore
  └── ...
```

### Paso 3: Haz doble clic en `.env` para editarlo

---

## 🔍 Opción 2: Ver en Explorador de Windows

### Paso 1: Abre la carpeta del proyecto
```
C:\Users\beatr\OneDrive\Escritorio\Arachiz-inc\backend
```

### Paso 2: Habilita archivos ocultos
1. En el Explorador de Windows, haz clic en la pestaña **"Vista"**
2. Marca la casilla **"Elementos ocultos"**

![Mostrar archivos ocultos](https://i.imgur.com/ejemplo.png)

### Paso 3: Ahora verás el archivo `.env`

---

## 🔍 Opción 3: Usar el Terminal

### Ver el contenido del archivo:
```bash
cat backend/.env
```

### Editar con Notepad:
```bash
notepad backend/.env
```

### Editar con VS Code desde terminal:
```bash
code backend/.env
```

---

## 📝 Ubicación de los Archivos .env

### Backend:
```
📁 backend/
  ├── .env          ← Configuración real (NO subir a Git)
  └── .env.example  ← Plantilla de ejemplo (SÍ subir a Git)
```

### Frontend:
```
📁 frontend/
  ├── .env          ← Configuración real (NO subir a Git)
  └── .env.example  ← Plantilla de ejemplo (SÍ subir a Git)
```

---

## ⚙️ Configuración Actual

### Backend (`backend/.env`)
```env
PORT=3000
JWT_SECRET=supersecretarachiz
SESSION_SECRET=arachiz-session-secret-2024

# Base de datos Supabase
DATABASE_URL="postgresql://postgres.vfvhkzfoadbkofpkswbd:..."
DIRECT_URL="postgresql://postgres.vfvhkzfoadbkofpkswbd:..."

# URLs de la aplicación
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# Google OAuth (OPCIONAL - necesita configuración)
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:3000/api 
VITE_SOCKET_URL=http://localhost:3000
```

---

## 🔐 Para Configurar Google OAuth

1. **Abre el archivo** `backend/.env` en VS Code
2. **Busca estas líneas:**
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```
3. **Reemplaza** con tus credenciales reales de Google Cloud Console
4. **Sigue la guía:** `docs/CONFIGURAR_GOOGLE_OAUTH.md`

---

## ⚠️ Importante

### ❌ NO hagas esto:
- ❌ NO subas el archivo `.env` a Git
- ❌ NO compartas tus credenciales
- ❌ NO publiques el `.env` en internet

### ✅ SÍ haz esto:
- ✅ Mantén el `.env` en tu computadora local
- ✅ Usa `.env.example` como plantilla
- ✅ Agrega `.env` al `.gitignore` (ya está)

---

## 🚀 Comandos Útiles

### Verificar si existe el archivo:
```bash
# Windows PowerShell
Test-Path backend/.env

# Git Bash / Linux
ls -la backend/.env
```

### Crear .env desde el ejemplo:
```bash
# Windows PowerShell
Copy-Item backend/.env.example backend/.env

# Git Bash / Linux
cp backend/.env.example backend/.env
```

### Ver el contenido:
```bash
# Windows PowerShell
Get-Content backend/.env

# Git Bash / Linux
cat backend/.env
```

### Editar el archivo:
```bash
# Con VS Code
code backend/.env

# Con Notepad
notepad backend/.env

# Con Nano (Git Bash)
nano backend/.env
```

---

## 🎯 Resumen Rápido

1. **Abre VS Code**: `code .`
2. **Busca**: `backend/.env` en el explorador
3. **Edita**: Las credenciales que necesites
4. **Guarda**: Ctrl + S
5. **Reinicia**: El servidor backend

---

## 📞 ¿Necesitas Ayuda?

Si no encuentras el archivo `.env`:
1. Verifica que estés en la carpeta correcta
2. Usa VS Code (es más fácil)
3. Crea el archivo desde `.env.example`

```bash
# Crear .env si no existe
cd backend
Copy-Item .env.example .env
```

---

## ✅ Checklist

- [ ] Puedo ver el archivo `.env` en VS Code
- [ ] Puedo editar el archivo `.env`
- [ ] Entiendo qué NO debo subir a Git
- [ ] Sé dónde configurar Google OAuth
- [ ] Sé cómo reiniciar el servidor después de cambios

¡Listo! Ahora puedes trabajar con archivos `.env` sin problemas. 🎉
