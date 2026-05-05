/**
 * Adaptador para face-api.js (API actual)
 */
import * as faceapi from 'face-api.js';
import { FacialRecognitionAdapter } from '../benchmark';

export class FaceApiAdapter extends FacialRecognitionAdapter {
  constructor() {
    super();
    this.modelsLoaded = false;
    this._threshold = 0.6;
  }

  async initialize() {
    if (this.modelsLoaded) return;

    const MODEL_URL = '/models';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);

    this.modelsLoaded = true;
  }

  async detectFaces(imageData) {
    const detections = await faceapi
      .detectAllFaces(imageData, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true)
      .withFaceDescriptors();

    return detections;
  }

  async extractDescriptor(imageData) {
    const detections = await this.detectFaces(imageData);
    return detections.length > 0 ? detections[0].descriptor : null;
  }

  async compareDescriptors(desc1, desc2) {
    if (!desc1 || !desc2) return 1;
    return faceapi.euclideanDistance(desc1, desc2);
  }

  get threshold() {
    return this._threshold;
  }
}
