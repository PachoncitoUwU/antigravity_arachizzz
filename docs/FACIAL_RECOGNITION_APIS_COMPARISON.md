# Comparación de APIs de Reconocimiento Facial

## Estado Actual
- **API Actual**: face-api.js
- **Rama de Pruebas**: `experiment/facial-recognition-apis`
- **Objetivo**: Encontrar la API más rápida, precisa, segura y gratuita

---

## APIs a Probar

### 1. **face-api.js** (Actual)
- **Lenguaje**: JavaScript (TensorFlow.js)
- **Tipo**: Cliente (navegador)
- **Pros**: 
  - Ya implementada
  - Funciona offline
  - Sin límites de uso
  - Privacidad total (no envía datos)
- **Contras**: 
  - Depende del hardware del cliente
  - Modelos más pesados
- **Documentación**: https://github.com/justadudewhohacks/face-api.js

---

### 2. **MediaPipe Face Detection** (Google)
- **Lenguaje**: JavaScript, Python
- **Tipo**: Cliente/Servidor
- **Pros**:
  - Muy rápido (optimizado por Google)
  - Modelos ligeros
  - Funciona en navegador y servidor
  - Gratis y open source
- **Contras**:
  - Menos preciso en condiciones difíciles
- **Documentación**: https://developers.google.com/mediapipe/solutions/vision/face_detector
- **NPM**: `@mediapipe/face_detection`

---

### 3. **face-recognition.js** (dlib wrapper)
- **Lenguaje**: Node.js (C++ binding)
- **Tipo**: Servidor
- **Pros**:
  - Muy preciso (basado en dlib)
  - Excelente para matching
  - Gratis
- **Contras**:
  - Solo servidor (Node.js)
  - Instalación más compleja
- **Documentación**: https://github.com/justadudewhohacks/face-recognition.js
- **NPM**: `face-recognition`

---

### 4. **InsightFace (Python)**
- **Lenguaje**: Python
- **Tipo**: Servidor
- **Pros**:
  - Estado del arte en precisión
  - Muy rápido con GPU
  - Múltiples modelos disponibles
  - Gratis
- **Contras**:
  - Requiere Python backend
  - Mejor con GPU
- **Documentación**: https://github.com/deepinsight/insightface
- **Instalación**: `pip install insightface`

---

### 5. **CompreFace** (Open Source)
- **Lenguaje**: API REST (cualquier lenguaje)
- **Tipo**: Servidor (Docker)
- **Pros**:
  - API REST fácil de usar
  - Muy preciso
  - Self-hosted (privacidad)
  - Gratis
  - UI de administración incluida
- **Contras**:
  - Requiere servidor/Docker
  - Más recursos de servidor
- **Documentación**: https://github.com/exadel-inc/CompreFace
- **Docker**: `docker pull exadel/compreface`

---

### 6. **OpenCV.js + Face Recognition**
- **Lenguaje**: JavaScript
- **Tipo**: Cliente
- **Pros**:
  - Muy establecido
  - Funciona offline
  - Gratis
- **Contras**:
  - Configuración compleja
  - Modelos más antiguos
- **Documentación**: https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html

---

### 7. **TensorFlow.js con modelos custom**
- **Lenguaje**: JavaScript
- **Tipo**: Cliente/Servidor
- **Pros**:
  - Muy flexible
  - Puedes usar modelos pre-entrenados
  - Gratis
- **Contras**:
  - Requiere más configuración
  - Curva de aprendizaje
- **Documentación**: https://www.tensorflow.org/js

---

## Criterios de Evaluación

### 1. **Velocidad** (ms)
- Tiempo de detección de rostro
- Tiempo de extracción de descriptores
- Tiempo de comparación (matching)

### 2. **Precisión** (%)
- True Positive Rate
- False Positive Rate
- Accuracy en diferentes condiciones:
  - Iluminación variable
  - Ángulos diferentes
  - Distancia de la cámara
  - Accesorios (lentes, gorras)

### 3. **Seguridad**
- ¿Procesa en cliente o servidor?
- ¿Envía datos a terceros?
- ¿Almacena datos?
- ¿Cumple con GDPR/privacidad?

### 4. **Facilidad de Integración**
- Complejidad de instalación
- Compatibilidad con stack actual
- Documentación disponible

### 5. **Costo**
- Límites de uso gratuito
- Costo de infraestructura
- Escalabilidad

---

## Recomendaciones Iniciales

### Para Probar Primero (Más Fáciles):
1. **MediaPipe Face Detection** - Rápido de implementar, muy optimizado
2. **face-recognition.js** - Si quieres mejorar precisión en servidor
3. **CompreFace** - Si quieres una solución completa self-hosted

### Para Máxima Precisión:
1. **InsightFace** (Python backend)
2. **CompreFace** (Docker)

### Para Máxima Privacidad:
1. **face-api.js** (actual)
2. **MediaPipe** (cliente)
3. **OpenCV.js** (cliente)

---

## Próximos Pasos

1. ✅ Crear rama de experimentación
2. ⏳ Crear sistema de benchmarking
3. ⏳ Implementar adaptadores para cada API
4. ⏳ Ejecutar pruebas comparativas
5. ⏳ Documentar resultados
6. ⏳ Decidir cuál integrar a main

---

## Notas

- Todas las APIs listadas son **gratuitas** para uso
- Priorizar **privacidad** (procesamiento local cuando sea posible)
- Considerar **recursos del servidor** actual
- Mantener **compatibilidad** con sistema existente
