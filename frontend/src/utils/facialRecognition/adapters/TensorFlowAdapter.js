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
    this.threshold = 0.5;
  }

  async initialize() {
    try {
      const blazeface = await import('@tensorflow-models/blazeface');
      await import('@tensorflow/tfjs');
      
      this.model = await blazeface.load();
    } catch (error) {
      console.error('TensorFlow.js no está instalado:', error);
      throw new Error('TensorFlow.js no disponible. Instalar: npm install @tensorflow/tfjs @tensorflow-models/blazeface');
    }
  }

  async detectFaces(imageData) {
    const predictions = await this.model.estimateFaces(imageData, false);
    return predictions;
  }

  async extractDescriptor(imageData) {
    const predictions = await this.detectFaces(imageData);
    
    if (predictions.length === 0) return null;

    // BlazeFace devuelve landmarks, los usamos como descriptor
    const face = predictions[0];
    const landmarks = face.landmarks;
    
    // Crear descriptor a partir de landmarks
    const descriptor = new Float32Array(landmarks.flat());
    
    return descriptor;
  }

  async compareDescriptors(desc1, desc2) {
    if (!desc1 || !desc2) return 1;
    
    // Distancia euclidiana normalizada
    let sum = 0;
    for (let i = 0; i < Math.min(desc1.length, desc2.length); i++) {
      sum += Math.pow(desc1[i] - desc2[i], 2);
    }
    return Math.sqrt(sum) / Math.min(desc1.length, desc2.length);
  }

  get threshold() {
    return 0.5;
  }
}
