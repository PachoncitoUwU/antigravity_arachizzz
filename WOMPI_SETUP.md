# Configuración de Wompi - Guía de Implementación

## ✅ Lo que se ha implementado

### Frontend (Login.jsx)
- ✅ Botón de Wompi (arriba del botón de Epayco)
- ✅ Botón de Epayco (mantiene la funcionalidad anterior)
- ✅ Modal de donación con monto configurable
- ✅ Montos predefinidos: $5K, $10K, $20K COP
- ✅ Opción de monto personalizado

### Backend (skinController.js)
- ✅ Función `createWompiPayment()` - Crea transacciones en Wompi
- ✅ Función `handleWebhookWompi()` - Procesa confirmaciones de pago
- ✅ Validación de integridad de webhooks
- ✅ Almacenamiento de donaciones en la BD

### Rutas (skinRoutes.js)
- ✅ POST `/api/skins/wompi-payment` - Crear pago
- ✅ POST `/api/skins/webhook-wompi` - Webhook de confirmación

### Variables de Entorno
- ✅ `.env` actualizado con placeholders
- ✅ `.env.example` actualizado con documentación

---

## 🔧 Pasos para activar Wompi

### 1. Obtener credenciales de Wompi
1. Ve a https://dashboard.wompi.co/
2. Inicia sesión o crea una cuenta
3. Ve a **Configuración** → **Credenciales API**
4. Copia las siguientes claves:
   - **Public Key** (comienza con `pub_test_` o `pub_prod_`)
   - **Private Key** (comienza con `prv_test_` o `prv_prod_`)
   - **Integrity Key** (comienza con `prod_sign_test_` o `prod_sign_`)

### 2. Actualizar el archivo `.env` del backend

Reemplaza los valores en `backend/.env`:

```env
WOMPI_PUBLIC_KEY=pub_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOMPI_PRIVATE_KEY=prv_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOMPI_INTEGRITY_KEY=prod_sign_test_xxxxxxxxxxxxxxxxxxxxxxxxy
WOMPI_MERCHANT_CODE=your_merchant_code_here
```

### 3. Configurar webhook en Wompi Dashboard

1. Ve a **Configuración** → **Webhooks**
2. Agrega un nuevo webhook con:
   - **URL**: `https://tu-dominio.com/api/skins/webhook-wompi`
   - **Eventos**: Selecciona `transaction.updated`
   - **Activo**: Sí

### 4. Reiniciar el servidor backend

```bash
npm start
```

---

## 🧪 Pruebas

### Modo Test (Recomendado primero)
1. Usa las credenciales `pub_test_` y `prv_test_`
2. En el modal de donación, selecciona un monto
3. Haz clic en "Donar"
4. Serás redirigido a Wompi en modo test
5. Usa tarjetas de prueba de Wompi

### Tarjetas de prueba (Modo Test)
- **Visa**: 4242 4242 4242 4242
- **Mastercard**: 5555 5555 5555 4444
- **Fecha**: Cualquier fecha futura (ej: 12/25)
- **CVV**: Cualquier número de 3 dígitos

### Modo Producción
1. Cambia a credenciales `pub_prod_` y `prv_prod_`
2. Actualiza el webhook URL a tu dominio de producción
3. Prueba con una donación real

---

## 📊 Flujo de Donación

```
Usuario hace clic en "Wompi"
    ↓
Modal de donación se abre
    ↓
Usuario selecciona monto (predefinido o personalizado)
    ↓
Usuario hace clic en "Donar"
    ↓
Frontend envía POST a /api/skins/wompi-payment
    ↓
Backend crea transacción en Wompi API
    ↓
Backend retorna URL de pago
    ↓
Usuario es redirigido a Wompi Checkout
    ↓
Usuario completa el pago
    ↓
Wompi envía webhook a /api/skins/webhook-wompi
    ↓
Backend actualiza estado de donación en BD
    ↓
Usuario es redirigido a /login?payment_status=success
```

---

## 🔐 Seguridad

### Validación de Webhooks
- Se verifica la firma SHA256 del webhook
- Se usa `WOMPI_INTEGRITY_KEY` para validar autenticidad
- Solo se procesan webhooks válidos

### Datos Sensibles
- Las claves privadas se almacenan en `.env` (no en el código)
- Las transacciones se guardan en la BD con estado
- Los montos se validan en el backend (mínimo 1000 COP)

---

## 🐛 Troubleshooting

### "Sistema de pagos Wompi no configurado"
- Verifica que las variables de entorno estén correctas en `.env`
- Reinicia el servidor backend
- Comprueba que no haya espacios en blanco en las claves

### Webhook no se recibe
- Verifica que la URL del webhook sea accesible desde internet
- Comprueba que el webhook esté activo en Wompi Dashboard
- Revisa los logs del servidor para errores

### Error "Firma inválida"
- Verifica que `WOMPI_INTEGRITY_KEY` sea correcta
- Comprueba que el webhook venga de Wompi (no de otra fuente)

---

## 📝 Notas

- Las donaciones se guardan en la tabla `skinOrder` con `skinId = null`
- El monto mínimo es 1000 COP
- Wompi soporta múltiples métodos de pago: Tarjetas, PSE, Nequi
- Los webhooks se procesan automáticamente

---

## ✨ Próximos pasos (Opcional)

- Agregar confirmación por email después de donación
- Mostrar historial de donaciones en el perfil del usuario
- Agregar estadísticas de donaciones en admin panel
- Integrar con sistema de rewards/badges por donaciones

