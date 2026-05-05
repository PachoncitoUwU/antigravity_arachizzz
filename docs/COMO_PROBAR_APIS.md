# 🧪 Cómo Probar las APIs de Reconocimiento Facial

## 📋 Preparación

### 1. Asegúrate de estar en la rama correcta
```bash
git branch
# Deberías ver: * experiment/facial-recognition-apis
```

### 2. El servidor debe estar corriendo
Si no está corriendo:
```bash
cd frontend
npm run dev
```

### 3. Abre la página de pruebas
```
http://localhost:5173/facial-recognition-test
```

---

## 🎯 Flujo de Prueba Completo

### Paso 1: Registrar Tu Rostro (2-3 veces)

1. **Tab "📝 Registrar Rostros"**
2. Clic en **"▶️ Iniciar Detección"**
3. Mira a la cámara hasta que aparezca **"✓ Rostro detectado"**
4. Clic en **"💾 Guardar Rostro"**
5. Ingresa tu nombre (ej: "Juan")
6. **Repite 2-3 veces** desde diferentes ángulos:
   - Una vez mirando de frente
   - Una vez con la cabeza ligeramente girada
   - Una vez con diferente expresión

**Tip**: Captura tu rostro en condiciones similares a las que usarás en producción (misma iluminación, distancia, etc.)

---

### Paso 2: Probar Reconocimiento (Opcional)

1. **Tab "🎯 Reconocer"**
2. Clic en **"▶️ Iniciar Reconocimiento"**
3. Mira a la cámara
4. Verás tu nombre aparecer automáticamente con:
   - % de confianza
   - Distancia

**Esto te da una idea de qué tan bien funciona face-api.js (tu API actual)**

---

### Paso 3: Ejecutar Benchmark (Comparar APIs)

1. **Tab "📊 Benchmark"**
2. **Selecciona las APIs a comparar**:
   - ✅ **face-api.js** (siempre déjala marcada - es tu baseline)
   - ✅ **MediaPipe** (Google - muy rápida)
   - ✅ **TensorFlow.js** (BlazeFace - ligera)

3. Clic en **"🚀 Ejecutar Benchmark"**
4. **Espera 1-2 minutos** (no cierres la página)
5. Ve los resultados

---

## 📊 Interpretar Resultados

### Ganadores por Categoría

El benchmark te mostrará 4 ganadores:

#### 🏆 **Más Rápida**
- La que tiene menor tiempo de detección + extracción
- **Importante si**: Tienes muchos alumnos y necesitas velocidad

#### 🎯 **Más Precisa**
- La que tiene mayor accuracy (% de comparaciones correctas)
- **Importante si**: Necesitas evitar falsos positivos/negativos

#### 💾 **Menos Memoria**
- La que usa menos MB de RAM
- **Importante si**: Los dispositivos tienen poca memoria

#### 👑 **Ganador General**
- Ponderación: 30% velocidad + 40% precisión + 30% memoria
- **Esta es la recomendación general**

---

### Tabla Comparativa

| Métrica | Qué Significa | Ideal |
|---------|---------------|-------|
| **Inicialización** | Tiempo de carga de modelos (una sola vez) | < 2000ms |
| **Detección** | Tiempo para encontrar rostros en imagen | < 150ms |
| **Extracción** | Tiempo para crear descriptor facial | < 200ms |
| **Matching** | Tiempo para comparar dos rostros | < 100ms |
| **Precisión** | % de comparaciones correctas | > 90% |
| **Memoria** | MB de RAM utilizados | < 50MB |

---

## 🤔 Cómo Decidir

### Escenario 1: Todas las APIs funcionan bien
**Pregúntate:**
- ¿La diferencia de velocidad es significativa? (>30% más rápida)
- ¿La diferencia de precisión es significativa? (>10% más precisa)
- ¿Vale la pena el esfuerzo de migrar?

**Si la respuesta es NO a todas**: Quédate con face-api.js

### Escenario 2: Una API es claramente superior
**Criterios para cambiar:**
- ✅ >30% más rápida Y >90% de precisión
- ✅ >15% más precisa (aunque sea un poco más lenta)
- ✅ Usa <50% de memoria (si tienes problemas de recursos)

### Escenario 3: Resultados similares
**Quédate con face-api.js** porque:
- Ya está funcionando en producción
- Conoces sus limitaciones
- No hay riesgo de migración

---

## 📝 Documentar Resultados

Después de las pruebas, anota:

```markdown
## Mis Resultados

### Condiciones de Prueba
- Fecha: [fecha]
- Navegador: [Chrome/Firefox/etc]
- Dispositivo: [PC/Laptop/etc]
- Rostros probados: [número]
- Iluminación: [buena/regular/mala]

### Resultados

#### face-api.js (actual)
- Velocidad: [X]ms
- Precisión: [X]%
- Memoria: [X]MB
- Observaciones: [...]

#### MediaPipe
- Velocidad: [X]ms
- Precisión: [X]%
- Memoria: [X]MB
- Observaciones: [...]

#### TensorFlow.js
- Velocidad: [X]ms
- Precisión: [X]%
- Memoria: [X]MB
- Observaciones: [...]

### Decisión Final
[Explicar qué API elegiste y por qué]
```

---

## ⚠️ Problemas Comunes

### "MediaPipe no disponible"
**Solución**: Ya está instalada, recarga la página

### "TensorFlow.js no disponible"
**Solución**: Ya está instalada, recarga la página

### "No detecta mi rostro"
**Solución**:
- Mejora la iluminación
- Acércate más a la cámara
- Mira directamente a la cámara

### "Precisión muy baja"
**Posibles causas**:
- Pocas capturas (necesitas mínimo 2-3)
- Capturas muy similares (varía ángulos)
- Mala iluminación
- Cámara de baja calidad

### "Benchmark muy lento"
**Normal**: Con 3 APIs y 3 rostros puede tomar 2-3 minutos

---

## 🎓 Consejos para Mejores Resultados

### 1. Captura de Calidad
- ✅ Buena iluminación (luz frontal, no de espalda)
- ✅ Rostro completo visible
- ✅ Sin accesorios que tapen (gorras, lentes oscuros)
- ✅ Diferentes ángulos (frente, 45°, perfil ligero)

### 2. Condiciones Realistas
- Captura en condiciones similares al uso real
- Si usarás en aula con luz artificial, prueba con esa luz
- Si usarás con webcam de laptop, prueba con esa cámara

### 3. Dataset Representativo
- Incluye diferentes expresiones (serio, sonriendo)
- Incluye con/sin accesorios si es relevante
- Prueba con diferentes personas si es posible

---

## 📊 Ejemplo de Resultados Esperados

### face-api.js (Actual)
```
Inicialización: 500-800ms
Detección: 100-200ms
Extracción: 100-200ms
Matching: 50-100ms
Precisión: 85-95%
Memoria: 3-8MB
```

### MediaPipe (Google)
```
Inicialización: 1000-2000ms
Detección: 50-100ms (más rápida)
Extracción: 80-150ms
Matching: 40-80ms
Precisión: 80-90%
Memoria: 5-15MB
```

### TensorFlow.js (BlazeFace)
```
Inicialización: 800-1500ms
Detección: 60-120ms
Extracción: 90-180ms
Matching: 45-90ms
Precisión: 75-85%
Memoria: 4-10MB
```

**Nota**: Estos son rangos aproximados. Tus resultados pueden variar según el hardware.

---

## 🚀 Después de Decidir

### Si te quedas con face-api.js:
```bash
git checkout main
# Continúa con tu desarrollo normal
```

### Si decides cambiar de API:
1. Documenta tu decisión
2. Crea un plan de migración
3. Prueba en desarrollo primero
4. Haz merge cuando esté estable

---

## 📞 Soporte

Si tienes dudas sobre los resultados o necesitas ayuda para interpretar:
1. Descarga los resultados en JSON
2. Revisa la documentación de cada API
3. Considera factores específicos de tu caso de uso

---

**¡Buena suerte con las pruebas! 🎉**
