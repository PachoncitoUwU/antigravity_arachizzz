# 🧪 Experimento: Comparación de APIs de Reconocimiento Facial

## 📌 Resumen

Este experimento te permite probar diferentes APIs de reconocimiento facial sin modificar el código en producción, para determinar cuál es la mejor opción para Arachiz.

---

## 🎯 Objetivo

Encontrar la API de reconocimiento facial que sea:
- ⚡ **Más rápida**: Menor latencia en detección y matching
- 🎯 **Más precisa**: Mayor accuracy en identificación
- 🔒 **Más segura**: Procesamiento local, sin envío de datos
- 💰 **Gratuita**: Sin costos de uso

---

## 📂 Estructura Creada

```
experiment/facial-recognition-apis/
│
├── docs/
│   ├── FACIAL_RECOGNITION_APIS_COMPARISON.md    # Lista de APIs a probar
│   └── FACIAL_RECOGNITION_TESTING_GUIDE.md      # Guía de uso
│
├── frontend/
│   ├── src/
│   │   ├── utils/facialRecognition/
│   │   │   ├── benchmark.js                     # Sistema de benchmarking
│   │   │   └── adapters/
│   │   │       ├── FaceApiAdapter.js            # face-api.js (actual)
│   │   │       ├── MediaPipeAdapter.js          # Google MediaPipe
│   │   │       └── TensorFlowAdapter.js         # TensorFlow.js BlazeFace
│   │   │
│   │   └── pages/
│   │       └── FacialRecognitionTest.jsx        # Interfaz de pruebas
│   │
│   └── install-facial-apis.bat                  # Instalador rápido
│
└── FACIAL_RECOGNITION_EXPERIMENT.md             # Este archivo
```

---

## 🚀 Inicio Rápido

### 1. Ya estás en la rama correcta
```bash
# Verificar rama actual
git branch
# Deberías ver: * experiment/facial-recognition-apis
```

### 2. Instalar APIs adicionales (opcional)
```bash
cd frontend
install-facial-apis.bat
```

O manualmente:
```bash
npm install @mediapipe/face_detection @mediapipe/face_mesh
npm install @tensorflow/tfjs @tensorflow-models/blazeface
```

### 3. Iniciar servidor de desarrollo
```bash
npm run dev
```

### 4. Abrir página de pruebas
Navegar a: `http://localhost:5173/facial-recognition-test`

*(Nota: Necesitas agregar la ruta al router - ver guía)*

---

## 📊 APIs Disponibles para Probar

### ✅ face-api.js (Actual)
- **Estado**: Ya instalada y funcionando
- **Ventajas**: Offline, privado, sin límites
- **Desventajas**: Modelos pesados, depende del hardware cliente

### 🆕 MediaPipe (Google)
- **Estado**: Requiere instalación
- **Ventajas**: Muy rápido, optimizado, ligero
- **Desventajas**: Menos preciso en condiciones difíciles
- **Instalación**: `npm install @mediapipe/face_detection @mediapipe/face_mesh`

### 🆕 TensorFlow.js (BlazeFace)
- **Estado**: Requiere instalación
- **Ventajas**: Rápido, modelos ligeros
- **Desventajas**: Menos features que face-api.js
- **Instalación**: `npm install @tensorflow/tfjs @tensorflow-models/blazeface`

### 🔮 Futuras (Backend)
- **CompreFace**: Self-hosted, muy preciso (requiere Docker)
- **InsightFace**: Estado del arte (requiere Python)
- **face-recognition.js**: Basado en dlib (requiere Node.js)

---

## 🧪 Cómo Probar

### Paso 1: Preparar Dataset
- Mínimo 3 personas diferentes
- 2-3 fotos por persona
- Variedad de condiciones (ángulos, iluminación, accesorios)

### Paso 2: Cargar Imágenes
- Usar el botón "📁 Cargar Imágenes"
- Asignar ID de persona a cada imagen
- Indicar número de rostros esperados

### Paso 3: Seleccionar APIs
- Marcar las APIs que quieres comparar
- Recomendado: Empezar con face-api.js + una nueva

### Paso 4: Ejecutar Benchmark
- Clic en "🚀 Iniciar Benchmark"
- Esperar 1-2 minutos (depende del dataset)

### Paso 5: Analizar Resultados
- Ver ganadores por categoría
- Comparar métricas en tabla
- Descargar JSON con resultados completos

---

## 📈 Métricas Comparadas

| Métrica | Descripción | Ideal |
|---------|-------------|-------|
| **Inicialización** | Tiempo de carga de modelos | < 2000ms |
| **Detección** | Tiempo para detectar rostros | < 100ms |
| **Extracción** | Tiempo para extraer descriptores | < 200ms |
| **Matching** | Tiempo para comparar rostros | < 50ms |
| **Accuracy** | % de comparaciones correctas | > 95% |
| **Precision** | % de matches correctos | > 90% |
| **Recall** | % de matches encontrados | > 90% |
| **Memoria** | MB de RAM utilizados | < 100MB |

---

## 🏆 Criterios de Decisión

### Si priorizas VELOCIDAD:
- Elegir la API con menor tiempo de detección + extracción
- Ideal para: Asistencia en tiempo real con muchos alumnos

### Si priorizas PRECISIÓN:
- Elegir la API con mayor accuracy (>95%)
- Ideal para: Seguridad crítica, evitar falsos positivos

### Si priorizas PRIVACIDAD:
- Elegir APIs que procesen en cliente (face-api.js, MediaPipe, TensorFlow.js)
- Evitar: APIs que envíen datos a servidores externos

### Si priorizas RECURSOS:
- Elegir la API con menor uso de memoria
- Ideal para: Dispositivos móviles, computadoras antiguas

---

## 🔄 Workflow Recomendado

```
1. Probar face-api.js (baseline)
   ↓
2. Probar MediaPipe (velocidad)
   ↓
3. Probar TensorFlow.js (alternativa)
   ↓
4. Comparar resultados
   ↓
5. Decidir ganador
   ↓
6a. Si face-api.js gana → Quedarse con actual
6b. Si otra API gana → Integrar a main
```

---

## 📝 Documentar Resultados

Después de las pruebas, crear:

```markdown
# FACIAL_RECOGNITION_RESULTS.md

## Dataset Utilizado
- X personas
- Y fotos por persona
- Condiciones: [describir]

## Resultados

### face-api.js
- Velocidad: X ms
- Precisión: Y%
- Memoria: Z MB

### MediaPipe
- Velocidad: X ms
- Precisión: Y%
- Memoria: Z MB

### TensorFlow.js
- Velocidad: X ms
- Precisión: Y%
- Memoria: Z MB

## Decisión Final
[Explicar qué API se eligió y por qué]
```

---

## 🔀 Integrar a Main

Si decides cambiar de API:

```bash
# 1. Asegurar que todo funciona
npm run build

# 2. Cambiar a main
git checkout main

# 3. Merge de la rama experimental
git merge experiment/facial-recognition-apis

# 4. Resolver conflictos si hay

# 5. Probar en main
npm run dev

# 6. Commit y push
git push origin main
```

---

## ⚠️ Importante

### NO modificar en esta rama:
- ❌ Código de producción de asistencia
- ❌ Base de datos
- ❌ Configuración de servidor
- ❌ Rutas principales

### SÍ puedes:
- ✅ Instalar dependencias opcionales
- ✅ Crear archivos de prueba
- ✅ Experimentar con adaptadores
- ✅ Documentar resultados

---

## 🆘 Soporte

### Problemas comunes:

**"API no disponible"**
```bash
npm install [nombre-del-paquete]
```

**"Modelos no encontrados"**
- Verificar `/public/models` existe
- Descargar modelos de face-api.js si faltan

**"Página no encontrada"**
- Agregar ruta al router (ver guía)

**"Resultados inconsistentes"**
- Usar imágenes de mejor calidad
- Asegurar buena iluminación
- Rostros claramente visibles

---

## 📚 Documentación Completa

- **APIs disponibles**: `docs/FACIAL_RECOGNITION_APIS_COMPARISON.md`
- **Guía de uso**: `docs/FACIAL_RECOGNITION_TESTING_GUIDE.md`
- **Código benchmark**: `frontend/src/utils/facialRecognition/benchmark.js`

---

## 🎓 Aprendizajes Esperados

Al final de este experimento, sabrás:
- ✅ Qué API es más rápida para tu hardware
- ✅ Qué API es más precisa con tus usuarios reales
- ✅ Qué API consume menos recursos
- ✅ Si vale la pena cambiar de face-api.js
- ✅ Cómo implementar la nueva API si decides cambiar

---

## 🚦 Estado Actual

- ✅ Rama creada: `experiment/facial-recognition-apis`
- ✅ Sistema de benchmarking implementado
- ✅ Adaptadores base creados
- ✅ Interfaz de pruebas lista
- ✅ Documentación completa
- ⏳ Pendiente: Agregar ruta al router
- ⏳ Pendiente: Instalar APIs adicionales
- ⏳ Pendiente: Ejecutar pruebas
- ⏳ Pendiente: Documentar resultados
- ⏳ Pendiente: Tomar decisión final

---

## 🤝 Contribuir

Si encuentras una API mejor o mejoras el sistema de benchmarking:
1. Crear adaptador siguiendo la interfaz `FacialRecognitionAdapter`
2. Agregar a la lista de APIs
3. Documentar en `FACIAL_RECOGNITION_APIS_COMPARISON.md`
4. Compartir resultados

---

**¡Buena suerte con las pruebas! 🚀**
