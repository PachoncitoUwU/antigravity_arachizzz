# Guía de Pruebas de Reconocimiento Facial

## 🎯 Objetivo

Comparar diferentes APIs de reconocimiento facial para determinar cuál es:
- ⚡ Más rápida
- 🎯 Más precisa
- 🔒 Más segura
- 💰 Gratuita

---

## 📋 Preparación

### 1. Cambiar a la rama de experimentación

```bash
git checkout experiment/facial-recognition-apis
```

### 2. Instalar dependencias base (ya instaladas)

```bash
cd frontend
npm install
```

### 3. Instalar APIs adicionales (opcional)

#### MediaPipe (Google)
```bash
npm install @mediapipe/face_detection @mediapipe/face_mesh
```

#### TensorFlow.js con BlazeFace
```bash
npm install @tensorflow/tfjs @tensorflow-models/blazeface
```

---

## 🧪 Cómo Ejecutar las Pruebas

### Opción 1: Interfaz Visual (Recomendado)

1. **Iniciar el servidor de desarrollo**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Abrir la página de pruebas**
   - Navegar a: `http://localhost:5173/facial-recognition-test`
   - O agregar la ruta al router (ver instrucciones abajo)

3. **Cargar imágenes de prueba**
   - Clic en "📁 Cargar Imágenes"
   - Seleccionar al menos 2 imágenes
   - Para cada imagen, indicar:
     - ID de persona (ej: "persona1", "persona2")
     - Número de rostros esperados

4. **Seleccionar APIs a probar**
   - ✅ face-api.js (actual)
   - ✅ MediaPipe (si está instalada)
   - ✅ TensorFlow.js (si está instalada)

5. **Ejecutar benchmark**
   - Clic en "🚀 Iniciar Benchmark"
   - Esperar resultados (puede tomar 1-2 minutos)

6. **Analizar resultados**
   - Ver ganadores por categoría
   - Comparar tabla de métricas
   - Descargar JSON con resultados completos

---

### Opción 2: Programática (Avanzado)

```javascript
import { FacialRecognitionBenchmark } from './utils/facialRecognition/benchmark';
import { FaceApiAdapter } from './utils/facialRecognition/adapters/FaceApiAdapter';
import { MediaPipeAdapter } from './utils/facialRecognition/adapters/MediaPipeAdapter';

// Crear benchmark
const benchmark = new FacialRecognitionBenchmark();

// Cargar imágenes de prueba
await benchmark.loadTestImages([
  {
    name: 'persona1_foto1.jpg',
    data: img1,
    personId: 'persona1',
    expectedFaces: 1
  },
  {
    name: 'persona1_foto2.jpg',
    data: img2,
    personId: 'persona1',
    expectedFaces: 1
  },
  {
    name: 'persona2_foto1.jpg',
    data: img3,
    personId: 'persona2',
    expectedFaces: 1
  }
]);

// Registrar APIs
benchmark.registerAPI('face-api.js', new FaceApiAdapter());
benchmark.registerAPI('MediaPipe', new MediaPipeAdapter());

// Ejecutar comparación
const report = await benchmark.compareAll();

console.log(report);
```

---

## 📊 Métricas Evaluadas

### 1. Velocidad
- **Inicialización**: Tiempo de carga de modelos
- **Detección**: Tiempo para detectar rostros
- **Extracción**: Tiempo para extraer descriptores
- **Matching**: Tiempo para comparar rostros

### 2. Precisión
- **Accuracy**: % de comparaciones correctas
- **Precision**: % de matches correctos sobre total de matches
- **Recall**: % de matches encontrados sobre total esperado
- **True/False Positives/Negatives**

### 3. Recursos
- **Memoria**: MB de RAM utilizados
- **CPU**: Operaciones por segundo

### 4. Seguridad
- ✅ Procesamiento local (cliente)
- ⚠️ Procesamiento servidor
- ❌ Envío a terceros

---

## 🎨 Agregar Ruta al Router

Si quieres acceder a la página de pruebas desde la navegación:

```javascript
// frontend/src/App.jsx o router
import FacialRecognitionTest from './pages/FacialRecognitionTest';

// Agregar ruta
{
  path: '/facial-recognition-test',
  element: <FacialRecognitionTest />
}
```

---

## 📸 Recomendaciones para Imágenes de Prueba

### Dataset Ideal

1. **Mínimo 3 personas diferentes**
2. **2-3 fotos por persona**
3. **Variedad de condiciones**:
   - Diferentes ángulos
   - Diferentes iluminaciones
   - Con/sin accesorios (lentes, gorra)
   - Diferentes expresiones

### Ejemplo de Dataset

```
persona1_frontal.jpg       (personId: "persona1")
persona1_lateral.jpg       (personId: "persona1")
persona1_con_lentes.jpg    (personId: "persona1")
persona2_frontal.jpg       (personId: "persona2")
persona2_sonriendo.jpg     (personId: "persona2")
persona3_frontal.jpg       (personId: "persona3")
```

---

## 🏆 Interpretación de Resultados

### Ganador por Velocidad
- Menor tiempo promedio de detección + extracción
- Ideal para: Asistencia en tiempo real

### Ganador por Precisión
- Mayor accuracy (>95% es excelente)
- Ideal para: Seguridad crítica

### Ganador por Memoria
- Menor uso de RAM
- Ideal para: Dispositivos móviles

### Ganador General
- Ponderación: 30% velocidad + 40% precisión + 30% memoria
- Ideal para: Uso general en Arachiz

---

## 🔧 Troubleshooting

### Error: "API no disponible"
**Solución**: Instalar la dependencia correspondiente
```bash
npm install @mediapipe/face_detection  # Para MediaPipe
npm install @tensorflow/tfjs           # Para TensorFlow
```

### Error: "Modelos no encontrados"
**Solución**: Verificar que `/public/models` existe con los modelos de face-api.js

### Pruebas muy lentas
**Solución**: 
- Reducir número de imágenes
- Usar imágenes más pequeñas (max 800x600)
- Probar una API a la vez

### Resultados inconsistentes
**Solución**:
- Usar imágenes de mejor calidad
- Asegurar buena iluminación
- Rostros claramente visibles

---

## 📝 Próximos Pasos

1. ✅ Ejecutar pruebas con dataset real de Arachiz
2. ⏳ Documentar resultados en `FACIAL_RECOGNITION_RESULTS.md`
3. ⏳ Decidir cuál API integrar
4. ⏳ Si se elige nueva API, hacer merge a `main`
5. ⏳ Actualizar documentación de producción

---

## 🤝 Contribuir

Si pruebas una API adicional:

1. Crear adaptador en `frontend/src/utils/facialRecognition/adapters/`
2. Implementar interfaz `FacialRecognitionAdapter`
3. Agregar a la lista de APIs en `FacialRecognitionTest.jsx`
4. Documentar en `FACIAL_RECOGNITION_APIS_COMPARISON.md`

---

## 📚 Referencias

- [face-api.js](https://github.com/justadudewhohacks/face-api.js)
- [MediaPipe](https://developers.google.com/mediapipe)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [CompreFace](https://github.com/exadel-inc/CompreFace)
- [InsightFace](https://github.com/deepinsight/insightface)
