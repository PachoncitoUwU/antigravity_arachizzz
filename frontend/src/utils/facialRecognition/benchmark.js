/**
 * Sistema de Benchmarking para APIs de Reconocimiento Facial
 * 
 * Compara diferentes APIs en términos de:
 * - Velocidad (detección, extracción, matching)
 * - Precisión (true/false positives)
 * - Uso de recursos (memoria, CPU)
 */

export class FacialRecognitionBenchmark {
  constructor() {
    this.results = [];
    this.testImages = [];
  }

  /**
   * Registra una API para probar
   */
  registerAPI(name, adapter) {
    this.apis = this.apis || {};
    this.apis[name] = adapter;
  }

  /**
   * Carga imágenes de prueba
   */
  async loadTestImages(images) {
    this.testImages = images;
  }

  /**
   * Ejecuta benchmark completo para una API
   */
  async benchmarkAPI(apiName) {
    const adapter = this.apis[apiName];
    if (!adapter) {
      throw new Error(`API ${apiName} no registrada`);
    }

    console.log(`🧪 Iniciando benchmark para: ${apiName}`);
    
    const result = {
      apiName,
      timestamp: new Date().toISOString(),
      tests: {
        initialization: await this.testInitialization(adapter),
        detection: await this.testDetection(adapter),
        extraction: await this.testExtraction(adapter),
        matching: await this.testMatching(adapter),
        resources: await this.testResources(adapter)
      }
    };

    this.results.push(result);
    return result;
  }

  /**
   * Test 1: Tiempo de inicialización
   */
  async testInitialization(adapter) {
    const start = performance.now();
    
    try {
      await adapter.initialize();
      const duration = performance.now() - start;
      
      return {
        success: true,
        duration,
        unit: 'ms'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: performance.now() - start
      };
    }
  }

  /**
   * Test 2: Velocidad de detección de rostros
   */
  async testDetection(adapter) {
    const results = [];
    
    for (const testImage of this.testImages) {
      const start = performance.now();
      
      try {
        const detections = await adapter.detectFaces(testImage.data);
        const duration = performance.now() - start;
        
        results.push({
          imageName: testImage.name,
          success: true,
          duration,
          facesDetected: detections.length,
          expectedFaces: testImage.expectedFaces
        });
      } catch (error) {
        results.push({
          imageName: testImage.name,
          success: false,
          error: error.message,
          duration: performance.now() - start
        });
      }
    }

    return {
      results,
      avgDuration: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
      successRate: results.filter(r => r.success).length / results.length
    };
  }

  /**
   * Test 3: Velocidad de extracción de descriptores
   */
  async testExtraction(adapter) {
    const results = [];
    
    for (const testImage of this.testImages) {
      const start = performance.now();
      
      try {
        const descriptor = await adapter.extractDescriptor(testImage.data);
        const duration = performance.now() - start;
        
        results.push({
          imageName: testImage.name,
          success: true,
          duration,
          descriptorSize: descriptor ? descriptor.length : 0
        });
      } catch (error) {
        results.push({
          imageName: testImage.name,
          success: false,
          error: error.message,
          duration: performance.now() - start
        });
      }
    }

    return {
      results,
      avgDuration: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
      successRate: results.filter(r => r.success).length / results.length
    };
  }

  /**
   * Test 4: Precisión de matching
   */
  async testMatching(adapter) {
    const results = [];
    
    // Probar matching entre pares conocidos
    for (let i = 0; i < this.testImages.length; i++) {
      for (let j = i + 1; j < this.testImages.length; j++) {
        const img1 = this.testImages[i];
        const img2 = this.testImages[j];
        
        const start = performance.now();
        
        try {
          const desc1 = await adapter.extractDescriptor(img1.data);
          const desc2 = await adapter.extractDescriptor(img2.data);
          const distance = await adapter.compareDescriptors(desc1, desc2);
          const duration = performance.now() - start;
          
          const isMatch = distance < adapter.threshold;
          const shouldMatch = img1.personId === img2.personId;
          
          results.push({
            pair: `${img1.name} vs ${img2.name}`,
            distance,
            isMatch,
            shouldMatch,
            correct: isMatch === shouldMatch,
            duration
          });
        } catch (error) {
          results.push({
            pair: `${img1.name} vs ${img2.name}`,
            error: error.message,
            duration: performance.now() - start
          });
        }
      }
    }

    const correct = results.filter(r => r.correct).length;
    const total = results.length;
    const truePositives = results.filter(r => r.isMatch && r.shouldMatch).length;
    const falsePositives = results.filter(r => r.isMatch && !r.shouldMatch).length;
    const trueNegatives = results.filter(r => !r.isMatch && !r.shouldMatch).length;
    const falseNegatives = results.filter(r => !r.isMatch && r.shouldMatch).length;

    return {
      results,
      accuracy: correct / total,
      precision: truePositives / (truePositives + falsePositives) || 0,
      recall: truePositives / (truePositives + falseNegatives) || 0,
      truePositives,
      falsePositives,
      trueNegatives,
      falseNegatives,
      avgDuration: results.reduce((sum, r) => sum + r.duration, 0) / results.length
    };
  }

  /**
   * Test 5: Uso de recursos
   */
  async testResources(adapter) {
    const memoryBefore = performance.memory ? performance.memory.usedJSHeapSize : 0;
    
    // Ejecutar operaciones intensivas
    const operations = 10;
    const start = performance.now();
    
    for (let i = 0; i < operations; i++) {
      const testImage = this.testImages[i % this.testImages.length];
      await adapter.detectFaces(testImage.data);
      await adapter.extractDescriptor(testImage.data);
    }
    
    const duration = performance.now() - start;
    const memoryAfter = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const memoryUsed = memoryAfter - memoryBefore;

    return {
      operations,
      totalDuration: duration,
      avgDurationPerOp: duration / operations,
      memoryUsed,
      memoryUsedMB: memoryUsed / (1024 * 1024)
    };
  }

  /**
   * Compara todas las APIs registradas
   */
  async compareAll() {
    console.log('🚀 Iniciando comparación de todas las APIs...\n');
    
    for (const apiName of Object.keys(this.apis)) {
      await this.benchmarkAPI(apiName);
    }

    return this.generateReport();
  }

  /**
   * Genera reporte comparativo
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      testImages: this.testImages.length,
      apis: this.results.map(r => ({
        name: r.apiName,
        initialization: r.tests.initialization.duration,
        avgDetection: r.tests.detection.avgDuration,
        avgExtraction: r.tests.extraction.avgDuration,
        avgMatching: r.tests.matching.avgDuration,
        accuracy: r.tests.matching.accuracy,
        precision: r.tests.matching.precision,
        recall: r.tests.matching.recall,
        memoryUsedMB: r.tests.resources.memoryUsedMB
      })),
      winner: this.determineWinner()
    };

    console.log('\n📊 REPORTE COMPARATIVO\n');
    console.table(report.apis);
    console.log('\n🏆 Ganadores por categoría:', report.winner);

    return report;
  }

  /**
   * Determina el ganador en cada categoría
   */
  determineWinner() {
    const apis = this.results.map(r => ({
      name: r.apiName,
      initialization: r.tests.initialization.duration,
      detection: r.tests.detection.avgDuration,
      extraction: r.tests.extraction.avgDuration,
      matching: r.tests.matching.avgDuration,
      accuracy: r.tests.matching.accuracy,
      memory: r.tests.resources.memoryUsedMB
    }));

    return {
      fastest: apis.reduce((min, api) => 
        api.detection < min.detection ? api : min
      ).name,
      mostAccurate: apis.reduce((max, api) => 
        api.accuracy > max.accuracy ? api : max
      ).name,
      leastMemory: apis.reduce((min, api) => 
        api.memory < min.memory ? api : min
      ).name,
      overall: this.calculateOverallWinner(apis)
    };
  }

  /**
   * Calcula ganador general (ponderado)
   */
  calculateOverallWinner(apis) {
    const weights = {
      speed: 0.3,      // 30% velocidad
      accuracy: 0.4,   // 40% precisión
      memory: 0.3      // 30% memoria
    };

    const scores = apis.map(api => {
      // Normalizar valores (0-1, donde 1 es mejor)
      const maxSpeed = Math.max(...apis.map(a => a.detection));
      const maxMemory = Math.max(...apis.map(a => a.memory));
      
      const speedScore = 1 - (api.detection / maxSpeed);
      const accuracyScore = api.accuracy;
      const memoryScore = 1 - (api.memory / maxMemory);

      const totalScore = 
        speedScore * weights.speed +
        accuracyScore * weights.accuracy +
        memoryScore * weights.memory;

      return {
        name: api.name,
        score: totalScore
      };
    });

    return scores.reduce((max, api) => 
      api.score > max.score ? api : max
    ).name;
  }

  /**
   * Exporta resultados a JSON
   */
  exportResults() {
    return JSON.stringify(this.results, null, 2);
  }
}

/**
 * Interfaz que deben implementar los adaptadores de APIs
 */
export class FacialRecognitionAdapter {
  async initialize() {
    throw new Error('initialize() debe ser implementado');
  }

  async detectFaces(imageData) {
    throw new Error('detectFaces() debe ser implementado');
  }

  async extractDescriptor(imageData) {
    throw new Error('extractDescriptor() debe ser implementado');
  }

  async compareDescriptors(desc1, desc2) {
    throw new Error('compareDescriptors() debe ser implementado');
  }

  get threshold() {
    throw new Error('threshold debe ser implementado');
  }
}
