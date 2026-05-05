/**
 * Adaptador para MediaPipe Face Detection (Google)
 * 
 * Instalación: npm install @mediapipe/face_detection @mediapipe/face_mesh
 */
import { FacialRecognitionAdapter } from '../benchmark';

export class MediaPipeAdapter extends FacialRecognitionAdapter {
  constructor() {
    super();
    this.faceDetection = null;
    this.faceMesh = null;
    this._threshold = 0.5;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Importar MediaPipe
      const FaceDetectionModule = await import('@mediapipe/face_detection');
      const FaceMeshModule = await import('@mediapipe/face_mesh');

      // Crear instancias
      this.faceDetection = new FaceDetectionModule.FaceDetection({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
        }
      });

      this.faceMesh = new FaceMeshModule.FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      // Configurar opciones
      this.faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5
      });

      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.initialized = true;
    } catch (error) {
      console.error('MediaPipe no está instalado:', error);
      throw new Error('MediaPipe no disponible. Instalar: npm install @mediapipe/face_detection @mediapipe/face_mesh');
    }
  }

  async detectFaces(imageData) {
    if (!this.initialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      this.faceDetection.onResults((results) => {
        resolve(results.detections || []);
      });

      // Enviar imagen
      if (imageData instanceof HTMLVideoElement || imageData instanceof HTMLImageElement) {
        this.faceDetection.send({ image: imageData }).catch(reject);
      } else {
        reject(new Error('imageData debe ser HTMLVideoElement o HTMLImageElement'));
      }
    });
  }

  async extractDescriptor(imageData) {
    if (!this.initialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      this.faceMesh.onResults((results) => {
        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
          resolve(null);
          return;
        }

        // Convertir landmarks a descriptor
        const landmarks = results.multiFaceLandmarks[0];
        const descriptor = this.landmarksToDescriptor(landmarks);
        resolve(descriptor);
      });

      // Enviar imagen
      if (imageData instanceof HTMLVideoElement || imageData instanceof HTMLImageElement) {
        this.faceMesh.send({ image: imageData }).catch(reject);
      } else {
        reject(new Error('imageData debe ser HTMLVideoElement o HTMLImageElement'));
      }
    });
  }

  landmarksToDescriptor(landmarks) {
    // Extraer puntos clave importantes (128 valores para compatibilidad)
    // Usamos los primeros 42 landmarks (x, y, z) + padding
    const keyPoints = landmarks.slice(0, 42);
    const values = keyPoints.flatMap(p => [p.x, p.y, p.z]);
    
    // Rellenar hasta 128 valores
    while (values.length < 128) {
      values.push(0);
    }
    
    return new Float32Array(values.slice(0, 128));
  }

  async compareDescriptors(desc1, desc2) {
    if (!desc1 || !desc2) return 1;
    
    // Distancia euclidiana normalizada
    let sum = 0;
    for (let i = 0; i < Math.min(desc1.length, desc2.length); i++) {
      sum += Math.pow(desc1[i] - desc2[i], 2);
    }
    return Math.sqrt(sum) / Math.sqrt(128);
  }

  get threshold() {
    return this._threshold;
  }
}
