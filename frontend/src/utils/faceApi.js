import * as faceapi from 'face-api.js';

let modelsLoaded = false;
let loadingPromise = null;

const MODEL_URL = '/models';

/**
 * Carga los modelos de face-api.js desde /public/models (solo una vez, con caché).
 */
export async function loadFaceModels() {
  if (modelsLoaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    modelsLoaded = true;
  })();

  return loadingPromise;
}

/**
 * Detecta la cara en un elemento <video> o <img> y retorna el descriptor facial (Float32Array de 128 valores).
 * Retorna null si no detecta ninguna cara.
 */
export async function detectFaceDescriptor(videoElement) {
  const detection = await faceapi
    .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
    .withFaceLandmarks(true)
    .withFaceDescriptor();

  if (!detection) return null;
  return detection.descriptor; // Float32Array[128]
}

/**
 * Calcula la distancia euclidiana entre dos descriptores.
 * Umbral recomendado: < 0.6 = misma persona.
 */
export function faceDistance(desc1, desc2) {
  return faceapi.euclideanDistance(desc1, desc2);
}

/**
 * Convierte Float32Array → Array normal para enviar al backend como JSON.
 */
export function descriptorToArray(descriptor) {
  return Array.from(descriptor);
}

/**
 * Convierte Array normal → Float32Array para comparación.
 */
export function arrayToDescriptor(arr) {
  return new Float32Array(arr);
}
