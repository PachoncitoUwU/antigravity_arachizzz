/**
 * Adaptador para TensorFlow.js con BlazeFace
 * 
 * Instalación: npm install @tensorflow/tfjs @tensorflow-models/blazeface
 */
import { FacialRecognitionAdapter } from '../benchmark';

export class TensorFlowAdapter extends FacialRecognitionAdapter {
  constructor() {
    super();
    this.model = null;
    this._threshold = 0.5;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Importar TensorFlow y BlazeFace
      await import('@tensorflow/tfjs');
      const blazefaceModule = await import('@tensorflow-models/blazeface');
      
      // Cargar modelo
      this.model = await blazefaceModule.load();
      this.initialized = true;
    } catch (error) {
      console.error('TensorFlow.js no está instalado:', error);
      throw new Error('TensorFlow.js no disponible. Instalar: npm install @tensorflow/tfjs @tensorflow-models/blazeface');
    }
  }

  async detectFaces(imageData) {
    if (!this.initialized) {
      await this.initialize();
    }

    const predictions = await this.model.estimateFaces(imageData, false);
    return predictions;
  }

  async extractDescriptor(imageData) {
    if (!this.initialized) {
      await this.initialize();
    }

    const predictions = await this.detectFaces(imageData);
    
    if (predictions.length === 0) return null;

    // BlazeFace devuelve landmarks (6 puntos: ojos, nariz, boca)
    const face = predictions[0];
    
    // Crear descriptor a partir de:
    // 1. Posición de la caja (4 valores)
    // 2. Landmarks (6 puntos x 2 coordenadas = 12 valores)
    // 3. Probabilidad (1 valor)
    // Total: 17 valores base
    
    const descriptor = [];
    
    // Normalizar posición de la caja
    const box = face.topLeft.concat(face.bottomRight);
    descriptor.push(...box);
    
    // Landmarks
    if (face.landmarks) {
      const landmarks = face.landmarks.flat();
      descriptor.push(...landmarks);
    }
    
    // Probabilidad
    if (face.probability) {
      descriptor.push(...face.probability);
    }
    
    // Calcular características adicionales (distancias entre puntos)
    if (face.landmarks && face.landmarks.length >= 6) {
      // Distancia entre ojos
      const eyeDist = Math.sqrt(
        Math.pow(face.landmarks[0][0] - face.landmarks[1][0], 2) +
        Math.pow(face.landmarks[0][1] - face.landmarks[1][1], 2)
      );
      descriptor.push(eyeDist);
      
      // Distancia ojo-nariz (izquierdo)
      const eyeNoseDist = Math.sqrt(
        Math.pow(face.landmarks[0][0] - face.landmarks[2][0], 2) +
        Math.pow(face.landmarks[0][1] - face.landmarks[2][1], 2)
      );
      descriptor.push(eyeNoseDist);
      
      // Distancia nariz-boca
      const noseMouthDist = Math.sqrt(
        Math.pow(face.landmarks[2][0] - face.landmarks[3][0], 2) +
        Math.pow(face.landmarks[2][1] - face.landmarks[3][1], 2)
      );
      descriptor.push(noseMouthDist);
      
      // Ancho de la boca
      const mouthWidth = Math.sqrt(
        Math.pow(face.landmarks[3][0] - face.landmarks[4][0], 2) +
        Math.pow(face.landmarks[3][1] - face.landmarks[4][1], 2)
      );
      descriptor.push(mouthWidth);
    }
    
    // Rellenar hasta 128 valores para compatibilidad
    while (descriptor.length < 128) {
      descriptor.push(0);
    }
    
    return new Float32Array(descriptor.slice(0, 128));
  }

  async compareDescriptors(desc1, desc2) {
    if (!desc1 || !desc2) return 1;
    
    // Distancia euclidiana normalizada
    let sum = 0;
    for (let i = 0; i < desc1.length; i++) {
      sum += Math.pow(desc1[i] - desc2[i], 2);
    }
    return Math.sqrt(sum) / Math.sqrt(desc1.length);
  }

  get threshold() {
    return this._threshold;
  }
}
