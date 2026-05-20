# 🧪 Testing Wompi - Guía Práctica

## 🎯 Flujo de Testing Completo

### 1️⃣ Interfaz Mejorada (Ya implementada)

**Modal 1: Seleccionar Monto**
- Input editable para monto personalizado
- Validación en tiempo real: mínimo $1.000 COP
- Mensaje de error si es menor a 1.000
- Botón "Continuar" deshabilitado si monto es inválido

**Modal 2: Confirmación**
- Resumen del monto y método de pago
- Botón "Proceder al pago"
- Opción de volver atrás

---

## 🧪 Testing con Tarjeta de Crédito (Opción A - Recomendada)

### Paso 1: Abre el Login
```
http://localhost:5173/login
```

### Paso 2: Haz clic en "Wompi"
- Se abre el Modal 1 (Seleccionar Monto)

### Paso 3: Ingresa un monto
- Prueba 1: Escribe `500` → Verás error "El monto mínimo es $1.000 COP"
- Prueba 2: Escribe `5000` → Error desaparece, botón se habilita
- Prueba 3: Selecciona un botón predefinido ($5K, $10K, $20K)

### Paso 4: Haz clic en "Continuar"
- Se abre Modal 2 (Confirmación)
- Verás el monto y método de pago

### Paso 5: Haz clic en "Proceder al pago"
- Se abre Wompi Checkout (pasarela de pago)

### Paso 6: Completa el formulario con datos de prueba
```
Número de tarjeta: 4111 1111 1111 1111
Fecha de vencimiento: 12/2030 (o cualquier futura)
Código de seguridad (CVV): 123
Nombre del titular: Dylan Blandón
Cuotas: 1
```

### Paso 7: Haz clic en "Pagar"
- Wompi procesará la transacción
- Verás pantalla de carga
- Terminará en pantalla verde: "Pago Exitoso"

### Paso 8: Verifica el webhook en el backend
Abre la consola del servidor y deberías ver:
```
📥 Webhook Wompi recibido: transaction.updated
✅ Donación aprobada: DON-...
```

---

## 📱 Testing con Nequi/Daviplata (Opción B)

### Paso 1-5: Igual que arriba

### Paso 6: En Wompi Checkout, selecciona "Nequi" o "Banca Móvil"

### Paso 7: Ingresa datos de prueba
```
Número de celular: 300 123 4567 (o el tuyo)
```

### Paso 8: Wompi te abrirá interfaz de simulación
- Pregunta: "¿Qué estado deseas para esta transacción?"
- Selecciona: **APROBADA**
- Haz clic en "Continuar"

### Paso 9: Verifica webhook
Igual que en Opción A

---

## 🔍 Validaciones que debes probar

### Validación de Monto (Frontend)
- [ ] Escribir `0` → Error
- [ ] Escribir `500` → Error
- [ ] Escribir `999` → Error
- [ ] Escribir `1000` → OK
- [ ] Escribir `5000` → OK
- [ ] Escribir `999999` → OK

### Validación de Botones
- [ ] Botón "Continuar" deshabilitado si monto < 1000
- [ ] Botón "Continuar" habilitado si monto >= 1000
- [ ] Botón "Proceder al pago" siempre habilitado en Modal 2

### Flujo de Modales
- [ ] Modal 1 se abre al hacer clic en "Wompi"
- [ ] Modal 1 se cierra al hacer clic en "Cancelar"
- [ ] Modal 1 se cierra al hacer clic en "Continuar" (si monto válido)
- [ ] Modal 2 se abre después de Modal 1
- [ ] Modal 2 muestra monto y método correcto
- [ ] Botón "Atrás" en Modal 2 vuelve a Modal 1

---

## 🔐 Testing de Webhook

### Verificar que el webhook se recibe

**En la consola del servidor backend:**
```bash
npm start
```

Deberías ver al pagar:
```
📥 Webhook Wompi recibido: transaction.updated
✅ Donación aprobada: DON-1234567890-abc123def
```

### Verificar en Base de Datos

```sql
-- Ver todas las donaciones
SELECT * FROM "SkinOrder" WHERE "skinId" IS NULL ORDER BY "createdAt" DESC;

-- Ver donaciones aprobadas
SELECT * FROM "SkinOrder" WHERE "skinId" IS NULL AND status = 'approved';
```

Deberías ver:
- `status`: 'approved'
- `paymentMethod`: 'wompi'
- `externalId`: ID de Wompi
- `preferenceId`: Referencia de la donación

---

## 🐛 Troubleshooting

### "Error al iniciar pago"
- [ ] Verifica que `WOMPI_PRIVATE_KEY` esté en `.env`
- [ ] Verifica que el servidor backend esté corriendo
- [ ] Revisa los logs del servidor para errores

### Webhook no se recibe
- [ ] En desarrollo local, Wompi no puede alcanzar `localhost`
- [ ] Solución: Usa ngrok para exponer tu servidor
  ```bash
  ngrok http 3000
  ```
- [ ] Copia la URL de ngrok y configura en Wompi Dashboard

### Pago se procesa pero no actualiza BD
- [ ] Verifica que `WOMPI_INTEGRITY_KEY` sea correcto
- [ ] Revisa los logs para error de firma
- [ ] Comprueba que la tabla `SkinOrder` exista

---

## 🚀 Flujo Completo de Testing

```
1. Abre Login
   ↓
2. Haz clic en "Wompi"
   ↓
3. Modal 1: Selecciona/ingresa monto
   ↓
4. Haz clic en "Continuar"
   ↓
5. Modal 2: Confirma donación
   ↓
6. Haz clic en "Proceder al pago"
   ↓
7. Wompi Checkout: Ingresa datos de prueba
   ↓
8. Haz clic en "Pagar"
   ↓
9. Pantalla verde: "Pago Exitoso"
   ↓
10. Webhook se recibe en backend
   ↓
11. BD se actualiza con status 'approved'
   ↓
✅ Testing completado
```

---

## 📊 Casos de Prueba

| Caso | Entrada | Esperado | Estado |
|------|---------|----------|--------|
| Monto mínimo | 1000 | Acepta | ✅ |
| Monto bajo | 500 | Error | ✅ |
| Monto alto | 50000 | Acepta | ✅ |
| Pago exitoso | Tarjeta válida | Aprobado | 🧪 |
| Webhook | Wompi envía | BD actualiza | 🧪 |

---

## 💡 Tips para Testing

1. **Usa siempre la misma tarjeta de prueba** para consistencia
2. **Revisa los logs del servidor** después de cada pago
3. **Verifica la BD** para confirmar que se guardó
4. **Prueba con diferentes montos** para validar lógica
5. **Cierra y abre el modal** para verificar que se resetea

---

## ✨ Próximos pasos después de testing

1. Crear página de éxito (`/payment-success`)
2. Mostrar confirmación por email
3. Agregar historial de donaciones en perfil
4. Implementar retry logic para webhooks fallidos

