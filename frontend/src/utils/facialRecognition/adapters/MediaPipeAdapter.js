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
    this.threshold = 0.5;
  }

  async initialize() {
    // Importación dinámica para no romper si no está instalado
    try {
      const { FaceDetection } = await import('@mediapipe/face_detection');
      const { FaceMesh } = await import('@mediapipe/face_mesh');

      this.faceDetection = new FaceDetection({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
        }
      });

      this.faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5
      });

      this.faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      await this.faceDetection.initialize();
      await this.faceMesh.initialize();
    } catch (error) {
      console.error('MediaPipe no está instalado:', error);
      throw new Error('MediaPipe no disponible. Instalar: npm install @mediapipe/face_detection @mediapipe/face_mesh');
    }
  }

  async detectFaces(imageData) {
    const results = await this.faceDetection.send({ image: imageData });
    return results.detections || [];
  }

  async extractDescriptor(imageData) {
    const results = await this.faceMesh.send({ image: imageData });
    
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      return null;
    }

    // Convertir landmarks a descriptor (simplificado)
    const landmarks = results.multiFaceLandmarks[0];
    const descriptor = this.landmarksToDescriptor(landmarks);
    
    return descriptor;
  }

  landmarksToDescriptor(landmarks) {
    // Extraer puntos clave y crear un descriptor simple
    // En producción, usarías un modelo de embedding más sofisticado
    const keyPoints = [
      landmarks[1],   // Nariz
      landmarks[33],  // Ojo izquierdo
      landmarks[263], // Ojo derecho
      landmarks[61],  // Boca izquierda
      landmarks[291], // Boca derecha
      landmarks[10],  // Frente
      landmarks[152]  // Barbilla
    ];

    return new Float32Array(keyPoints.flatMap(p => [p.x, p.y, p.z]));
  }

  async compareDescriptors(desc1, desc2) {
    if (!desc1 || !desc2) return 1;
    
    // Distancia euclidiana
    let sum = 0;
    for (let i = 0; i < desc1.length; i++) {
      sum += Math.pow(desc1[i] - desc2[i], 2);
    }
    return Math.sqrt(sum);
  }

  get threshold() {
    return 0.5;
  }
}
