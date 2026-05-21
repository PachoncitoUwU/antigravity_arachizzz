# 🔐 Configuración de Google OAuth

## Problema Actual
Error: `401: invalid_client - The OAuth client was not found`

Esto ocurre porque las credenciales de Google OAuth no están configuradas correctamente en el archivo `.env`.

---

## 🎯 ¿Qué son estos dominios?

Antes de empezar, aclaremos qué significan estos términos:

### En Desarrollo (Local)
Cuando trabajas en tu computadora:
- **Frontend**: `http://localhost:5173` (donde ves la aplicación en tu navegador)
- **Backend**: `http://localhost:3000` (donde está tu servidor API)

### En Producción (Internet)
Cuando subes tu aplicación a internet:
- **Frontend**: La URL donde los usuarios acceden a tu app
  - Ejemplo Render: `https://arachiz.onrender.com`
  - Ejemplo Vercel: `https://arachiz.vercel.app`
  - Ejemplo dominio propio: `https://www.arachiz.com`
  
- **Backend**: La URL de tu servidor API
  - Ejemplo Render: `https://arachiz-api.onrender.com`
  - Ejemplo Railway: `https://arachiz-api.railway.app`
  - Ejemplo Heroku: `https://arachiz-api.herokuapp.com`

> **💡 Tip**: Estas URLs las obtienes DESPUÉS de desplegar tu aplicación. Por ahora, solo necesitas configurar las URLs locales.

---

## 📋 Pasos para Configurar Google OAuth

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombre sugerido: `Arachiz App`

### 2. Habilitar Google+ API

1. En el menú lateral, ve a **APIs y servicios** → **Biblioteca**
2. Busca "Google+ API"
3. Haz clic en **Habilitar**

### 3. Configurar Pantalla de Consentimiento OAuth

1. Ve a **APIs y servicios** → **Pantalla de consentimiento de OAuth**
2. Selecciona **Externo** (para permitir cualquier usuario con cuenta de Google)
3. Completa la información:
   - **Nombre de la aplicación**: Arachiz
   - **Correo de asistencia**: tu correo
   - **Logo** (opcional): Puedes subir el logo de Arachiz
   - **Dominios autorizados**: (déjalo vacío por ahora)
   - **Correo del desarrollador**: tu correo
4. Haz clic en **Guardar y continuar**
5. En **Ámbitos**, haz clic en **Agregar o quitar ámbitos** y selecciona:
   - `userinfo.email`
   - `userinfo.profile`
6. Haz clic en **Guardar y continuar**
7. En **Usuarios de prueba** (si está en modo desarrollo), agrega los correos que podrán probar el login
8. Haz clic en **Guardar y continuar**

### 4. Crear Credenciales OAuth 2.0

1. Ve a **APIs y servicios** → **Credenciales**
2. Haz clic en **+ CREAR CREDENCIALES** → **ID de cliente de OAuth**
3. Selecciona **Aplicación web**
4. Configura:
   - **Nombre**: Arachiz Web Client
   - **Orígenes de JavaScript autorizados**:
     ```
     http://localhost:5173
     http://localhost:3000
     ```
   - **URIs de redireccionamiento autorizados**:
     ```
     http://localhost:3000/api/auth/google/callback
     ```
5. Haz clic en **Crear**
6. **¡IMPORTANTE!** Copia el **ID de cliente** y el **Secreto del cliente**

### 5. Configurar Variables de Entorno

#### Backend (`backend/.env`)

Reemplaza estas líneas:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
```

**Ejemplo real:**
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOpQrStUvWx
```

### 6. Reiniciar el Backend

```bash
cd backend
npm start
```

---

## 🌐 Configuración para Producción

Cuando despliegues la aplicación en producción (ej: Render, Vercel, Heroku, etc.):

### 1. Actualizar URIs en Google Cloud Console

Ve a **Credenciales** → Edita tu cliente OAuth y agrega:

**Orígenes de JavaScript autorizados:**
```
https://arachiz-frontend.onrender.com
https://arachiz-backend.onrender.com
```
> **Nota**: Reemplaza `arachiz-frontend.onrender.com` y `arachiz-backend.onrender.com` con tus URLs reales de producción.
> 
> **Ejemplos de URLs de producción:**
> - Si usas Render: `https://tu-app.onrender.com`
> - Si usas Vercel: `https://tu-app.vercel.app`
> - Si usas Netlify: `https://tu-app.netlify.app`
> - Si tienes dominio propio: `https://www.tudominio.com`

**URIs de redireccionamiento autorizados:**
```
https://arachiz-backend.onrender.com/api/auth/google/callback
```
> **Nota**: Esta URL debe apuntar a tu backend en producción + `/api/auth/google/callback`
> 
> **Ejemplos:**
> - Render: `https://tu-backend.onrender.com/api/auth/google/callback`
> - Railway: `https://tu-backend.railway.app/api/auth/google/callback`
> - Heroku: `https://tu-backend.herokuapp.com/api/auth/google/callback`

### 2. Actualizar Variables de Entorno en Producción

En tu plataforma de hosting (Render, Railway, Vercel, etc.), configura:

```env
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
BACKEND_URL=https://tu-backend-real.onrender.com
FRONTEND_URL=https://tu-frontend-real.vercel.app
```

> **⚠️ IMPORTANTE**: 
> - `BACKEND_URL` debe ser la URL completa de tu backend en producción (sin `/api` al final)
> - `FRONTEND_URL` debe ser la URL completa de tu frontend en producción
> - Estas URLs las obtienes después de desplegar tu aplicación

### Ejemplo Real de Configuración en Producción

Si desplegaste en Render:
- Frontend: `https://arachiz.onrender.com`
- Backend: `https://arachiz-api.onrender.com`

Entonces en Google Cloud Console agregas:
```
Orígenes JavaScript:
https://arachiz.onrender.com
https://arachiz-api.onrender.com

URIs de redirección:
https://arachiz-api.onrender.com/api/auth/google/callback
```

Y en las variables de entorno de Render:
```env
BACKEND_URL=https://arachiz-api.onrender.com
FRONTEND_URL=https://arachiz.onrender.com
```

---

## 🧪 Probar el Login con Google

1. Abre el frontend: `http://localhost:5173`
2. Ve a la página de login
3. Haz clic en **Continuar con Google**
4. Selecciona tu cuenta de Google
5. Acepta los permisos
6. Deberías ser redirigido al dashboard

---

## ❌ Solución de Problemas

### Error: "Acceso bloqueado: Error de autorización"
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de que el `BACKEND_URL` en `.env` sea correcto
- Reinicia el servidor backend

### Error: "redirect_uri_mismatch"
- Verifica que la URI de callback en Google Cloud Console sea exactamente:
  ```
  http://localhost:3000/api/auth/google/callback
  ```
- No debe tener espacios ni caracteres extra

### Error: "This app isn't verified"
- Es normal en desarrollo
- Haz clic en **Avanzado** → **Ir a Arachiz (no seguro)**
- Para producción, debes verificar la app con Google

### El usuario se crea pero no inicia sesión
- Verifica que `SESSION_SECRET` esté configurado en `.env`
- Verifica que `JWT_SECRET` esté configurado en `.env`

---

## 📝 Notas Importantes

1. **Nunca compartas** tus credenciales de Google OAuth
2. **No subas** el archivo `.env` a Git (ya está en `.gitignore`)
3. En producción, usa variables de entorno del hosting
4. Puedes tener diferentes credenciales para desarrollo y producción

---

## 🔗 Enlaces Útiles

- [Google Cloud Console](https://console.cloud.google.com/)
- [Documentación OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Passport Google OAuth20](https://www.passportjs.org/packages/passport-google-oauth20/)
