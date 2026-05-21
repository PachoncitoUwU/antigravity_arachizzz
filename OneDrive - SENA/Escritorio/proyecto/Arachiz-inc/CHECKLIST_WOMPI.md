# ✅ Checklist de Configuración - Wompi

## 📋 Antes de empezar

- [ ] Tienes acceso a https://dashboard.wompi.co/
- [ ] Tienes credenciales de Wompi (Public Key, Private Key, Integrity Key)
- [ ] Tu servidor backend está corriendo
- [ ] Tu dominio es accesible desde internet (para webhooks)

---

## 🔧 Configuración Local (Desarrollo)

### Paso 1: Actualizar `.env` del backend
```bash
# Archivo: backend/.env
```

- [ ] Abre `backend/.env`
- [ ] Busca la sección `# ===== WOMPI - PAGOS =====`
- [ ] Reemplaza estos valores:

```env
WOMPI_PUBLIC_KEY=pub_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOMPI_PRIVATE_KEY=prv_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOMPI_INTEGRITY_KEY=prod_sign_test_xxxxxxxxxxxxxxxxxxxxxxxxy
WOMPI_MERCHANT_CODE=your_merchant_code_here
```

**Dónde obtenerlos:**
1. Ve a https://dashboard.wompi.co/
2. Inicia sesión
3. Haz clic en tu nombre → **Configuración**
4. Ve a **Credenciales API**
5. Copia:
   - Public Key → `WOMPI_PUBLIC_KEY`
   - Private Key → `WOMPI_PRIVATE_KEY`
   - Integrity Key → `WOMPI_INTEGRITY_KEY`

### Paso 2: Reiniciar servidor backend
```bash
# En la carpeta backend/
npm start
```

- [ ] El servidor inicia sin errores
- [ ] Ves el mensaje: `✅ Wompi configurado correctamente`

### Paso 3: Probar en el navegador
```
http://localhost:5173/login
```

- [ ] Ves dos botones de donación (Wompi y Epayco)
- [ ] Haces clic en "Wompi"
- [ ] Se abre el modal de donación
- [ ] Puedes seleccionar montos predefinidos
- [ ] Puedes ingresar monto personalizado

### Paso 4: Probar pago (Modo Test)
- [ ] Selecciona un monto (ej: $5K)
- [ ] Haz clic en "Donar"
- [ ] Se abre Wompi Checkout
- [ ] Usa tarjeta de prueba: `4242 4242 4242 4242`
- [ ] Fecha: Cualquier fecha futura (ej: 12/25)
- [ ] CVV: Cualquier número (ej: 123)
- [ ] Completa el pago

### Paso 5: Verificar webhook (Desarrollo)
- [ ] Revisa los logs del servidor
- [ ] Deberías ver: `📥 Webhook Wompi recibido: transaction.updated`
- [ ] Deberías ver: `✅ Donación aprobada: DON-...`

---

## 🌐 Configuración en Producción

### Paso 1: Cambiar a credenciales de producción
```bash
# Archivo: backend/.env
```

- [ ] Reemplaza `pub_test_` con `pub_prod_`
- [ ] Reemplaza `prv_test_` con `prv_prod_`
- [ ] Reemplaza `prod_sign_test_` con `prod_sign_`

### Paso 2: Configurar webhook en Wompi Dashboard
```
https://dashboard.wompi.co/
```

- [ ] Inicia sesión
- [ ] Ve a **Configuración** → **Webhooks**
- [ ] Haz clic en **Agregar webhook**
- [ ] Completa:
  - **URL**: `https://tu-dominio.com/api/skins/webhook-wompi`
  - **Evento**: Selecciona `transaction.updated`
  - **Activo**: Sí ✓

- [ ] Haz clic en **Guardar**

### Paso 3: Actualizar URLs en backend
```bash
# Archivo: backend/.env
```

- [ ] `FRONTEND_URL=https://tu-dominio-frontend.com`
- [ ] `BACKEND_URL=https://tu-dominio-backend.com`

### Paso 4: Desplegar cambios
- [ ] Haz push a tu repositorio
- [ ] Despliega en tu servidor de producción
- [ ] Reinicia el servidor backend

### Paso 5: Probar en producción
- [ ] Accede a tu sitio en producción
- [ ] Haz clic en "Wompi"
- [ ] Realiza una donación de prueba
- [ ] Verifica que el webhook se reciba

---

## 🧪 Pruebas

### Tarjetas de prueba (Modo Test)
```
Visa:
  Número: 4242 4242 4242 4242
  Fecha: 12/25 (o cualquier futura)
  CVV: 123

Mastercard:
  Número: 5555 5555 5555 4444
  Fecha: 12/25
  CVV: 123
```

### Casos de prueba
- [ ] Donación de $5K
- [ ] Donación de $10K
- [ ] Donación de $20K
- [ ] Donación personalizada ($3K)
- [ ] Donación personalizada ($50K)
- [ ] Webhook se recibe correctamente
- [ ] Estado de donación se actualiza en BD

---

## 🐛 Troubleshooting

### Error: "Sistema de pagos Wompi no configurado"
- [ ] Verifica que las variables estén en `backend/.env`
- [ ] Verifica que no haya espacios en blanco
- [ ] Reinicia el servidor: `npm start`
- [ ] Revisa los logs para ver qué variable falta

### Error: "Firma inválida" en webhook
- [ ] Verifica que `WOMPI_INTEGRITY_KEY` sea correcto
- [ ] Comprueba que el webhook venga de Wompi (no de otra fuente)
- [ ] Revisa los logs del servidor

### Webhook no se recibe
- [ ] Verifica que la URL sea accesible desde internet
- [ ] Comprueba que el webhook esté activo en Wompi Dashboard
- [ ] Revisa los logs de Wompi en el dashboard
- [ ] Intenta reenviar el webhook desde Wompi Dashboard

### Pago no se procesa
- [ ] Verifica que el monto sea >= 1000 COP
- [ ] Comprueba que `WOMPI_PRIVATE_KEY` sea correcto
- [ ] Revisa los logs del servidor para errores de API

---

## 📊 Verificar en Base de Datos

```sql
-- Ver todas las donaciones
SELECT * FROM "SkinOrder" WHERE "skinId" IS NULL ORDER BY "createdAt" DESC;

-- Ver donaciones aprobadas
SELECT * FROM "SkinOrder" WHERE "skinId" IS NULL AND status = 'approved';

-- Ver donaciones pendientes
SELECT * FROM "SkinOrder" WHERE "skinId" IS NULL AND status = 'pending';
```

---

## 🎯 Resumen rápido

### Desarrollo (5 minutos)
1. Copia credenciales de Wompi
2. Actualiza `backend/.env`
3. Reinicia servidor
4. Prueba en `http://localhost:5173/login`

### Producción (10 minutos)
1. Cambia a credenciales `prod_`
2. Configura webhook en Wompi Dashboard
3. Actualiza URLs en `backend/.env`
4. Despliega cambios
5. Prueba en producción

---

## ✨ ¡Listo!

Una vez completado este checklist, tu sistema de donaciones con Wompi estará completamente funcional.

**Preguntas frecuentes:**
- ¿Cuánto tarda en recibirse el webhook? 1-5 segundos
- ¿Puedo cambiar los montos predefinidos? Sí, en `Login.jsx` línea ~120
- ¿Puedo agregar más métodos de pago? Sí, Wompi soporta PSE, Nequi, etc.
- ¿Dónde se guardan las donaciones? En la tabla `SkinOrder` con `skinId = NULL`

