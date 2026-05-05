import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { loadFaceModels, faceDistance, arrayToDescriptor, descriptorToArray } from '../utils/faceApi';
import { FacialRecognitionBenchmark } from '../utils/facialRecognition/benchmark';
import { FaceApiAdapter } from '../utils/facialRecognition/adapters/FaceApiAdapter';
import { MediaPipeAdapter } from '../utils/facialRecognition/adapters/MediaPipeAdapter';
import { TensorFlowAdapter } from '../utils/facialRecognition/adapters/TensorFlowAdapter';

export default function FacialRecognitionTest() {
  const [mode, setMode] = useState('register'); // 'register' | 'recognize' | 'benchmark'
  const [selectedAPI, setSelectedAPI] = useState('faceapi');
  
  // Estado de cámara
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const loopRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  
  // Registro de rostros
  const [savedFaces, setSavedFaces] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentDetection, setCurrentDetection] = useState(null);
  
  // Reconocimiento
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  
  // Benchmark
  const [benchmarkResults, setBenchmarkResults] = useState(null);
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);
  const [selectedAPIs, setSelectedAPIs] = useState({
    faceapi: true,
    mediapipe: false,
    tensorflow: false
  });

  const THRESHOLD = 0.55;

  // Inicializar modelos y cámara
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        // Cargar modelos
        await loadFaceModels();
        if (cancelled) return;
        setModelsReady(true);

        // Iniciar cámara
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraReady(true);
      } catch (error) {
        console.error('Error inicializando:', error);
        alert('Error: ' + error.message);
      }
    };

    init();

    return () => {
      cancelled = true;
      if (loopRef.current) clearTimeout(loopRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Loop de detección automática (modo registro)
  useEffect(() => {
    if (!cameraReady || !modelsReady || mode !== 'register' || !isDetecting) {
      return;
    }

    const OPTIONS = new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.4 });

    const detectLoop = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        loopRef.current = setTimeout(detectLoop, 100);
        return;
      }

      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, OPTIONS)
          .withFaceLandmarks(true)
          .withFaceDescriptor();

        if (detection) {
          setCurrentDetection({
            descriptor: detection.descriptor,
            box: detection.detection.box
          });
        } else {
          setCurrentDetection(null);
        }
      } catch (error) {
        console.error('Error en detección:', error);
      }

      loopRef.current = setTimeout(detectLoop, 300);
    };

    detectLoop();

    return () => {
      if (loopRef.current) clearTimeout(loopRef.current);
    };
  }, [cameraReady, modelsReady, mode, isDetecting]);

  // Loop de reconocimiento automático
  useEffect(() => {
    if (!cameraReady || !modelsReady || mode !== 'recognize' || !isRecognizing || savedFaces.length === 0) {
      return;
    }

    const OPTIONS = new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.4 });

    const recognizeLoop = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        loopRef.current = setTimeout(recognizeLoop, 100);
        return;
      }

      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, OPTIONS)
          .withFaceLandmarks(true)
          .withFaceDescriptor();

        if (detection) {
          // Comparar con rostros guardados
          let best = null;
          let bestDist = Infinity;

          for (const saved of savedFaces) {
            const dist = faceDistance(detection.descriptor, arrayToDescriptor(saved.descriptor));
            if (dist < bestDist) {
              bestDist = dist;
              best = saved;
            }
          }

          if (best && bestDist < THRESHOLD) {
            setRecognitionResult({
              name: best.name,
              distance: bestDist,
              confidence: ((1 - bestDist) * 100).toFixed(1),
              isMatch: true
            });
          } else {
            setRecognitionResult({
              distance: bestDist,
              confidence: 0,
              isMatch: false
            });
          }
        } else {
          setRecognitionResult(null);
        }
      } catch (error) {
        console.error('Error en reconocimiento:', error);
      }

      loopRef.current = setTimeout(recognizeLoop, 300);
    };

    recognizeLoop();

    return () => {
      if (loopRef.current) clearTimeout(loopRef.current);
    };
  }, [cameraReady, modelsReady, mode, isRecognizing, savedFaces]);

  // Guardar rostro detectado
  const saveFace = () => {
    if (!currentDetection) {
      alert('No hay ningún rostro detectado');
      return;
    }

    const name = prompt('¿Cómo te llamas?');
    if (!name) return;

    const newFace = {
      id: Date.now(),
      name,
      descriptor: descriptorToArray(currentDetection.descriptor),
      timestamp: new Date().toISOString()
    };

    setSavedFaces(prev => [...prev, newFace]);
    alert(`✓ Rostro de ${name} guardado`);
  };

  // Eliminar rostro guardado
  const deleteFace = (id) => {
    if (confirm('¿Eliminar este rostro?')) {
      setSavedFaces(prev => prev.filter(f => f.id !== id));
    }
  };

  // Ejecutar benchmark
  const runBenchmark = async () => {
    if (savedFaces.length < 2) {
      alert('Necesitas al menos 2 rostros guardados para el benchmark');
      return;
    }

    setIsRunningBenchmark(true);
    setMode('benchmark');

    try {
      const benchmark = new FacialRecognitionBenchmark();

      // Preparar imágenes de prueba desde el video
      const testImages = [];
      for (const face of savedFaces) {
        // Crear imagen desde el descriptor guardado
        testImages.push({
          name: face.name,
          data: videoRef.current, // Usamos el video como referencia
          personId: face.name.toLowerCase().replace(/\s+/g, '_'),
          expectedFaces: 1
        });
      }

      await benchmark.loadTestImages(testImages);

      // Registrar APIs seleccionadas
      if (selectedAPIs.faceapi) {
        benchmark.registerAPI('face-api.js', new FaceApiAdapter());
      }
      if (selectedAPIs.mediapipe) {
        benchmark.registerAPI('MediaPipe', new MediaPipeAdapter());
      }
      if (selectedAPIs.tensorflow) {
        benchmark.registerAPI('TensorFlow.js', new TensorFlowAdapter());
      }

      const report = await benchmark.compareAll();
      setBenchmarkResults(report);
    } catch (error) {
      console.error('Error en benchmark:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsRunningBenchmark(false);
    }
  };

  const downloadResults = () => {
    const dataStr = JSON.stringify(benchmarkResults, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `facial-benchmark-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🧪 Pruebas de Reconocimiento Facial
          </h1>
          <p className="text-gray-600 mb-8">
            Sistema automático como Arachiz: detecta, guarda y reconoce rostros
          </p>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b">
            <button
              onClick={() => { setMode('register'); setIsDetecting(false); setIsRecognizing(false); }}
              className={`pb-3 px-4 font-semibold transition ${
                mode === 'register'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📝 Registrar Rostros
            </button>
            <button
              onClick={() => { setMode('recognize'); setIsDetecting(false); setIsRecognizing(false); }}
              disabled={savedFaces.length === 0}
              className={`pb-3 px-4 font-semibold transition ${
                mode === 'recognize'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : savedFaces.length === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🎯 Reconocer
            </button>
            <button
              onClick={() => { setMode('benchmark'); setIsDetecting(false); setIsRecognizing(false); }}
              disabled={savedFaces.length < 2}
              className={`pb-3 px-4 font-semibold transition ${
                mode === 'benchmark'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : savedFaces.length < 2
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Benchmark
            </button>
          </div>

          {/* Video de cámara */}
          <div className="mb-8">
            <div className="relative rounded-xl overflow-hidden bg-black" style={{ maxHeight: 480 }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full"
                style={{ transform: 'scaleX(-1)' }}
              />

              {!cameraReady && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin text-4xl mb-2">⏳</div>
                    <p>Iniciando cámara...</p>
                  </div>
                </div>
              )}

              {/* Indicador de detección */}
              {mode === 'register' && isDetecting && currentDetection && (
                <div className="absolute inset-x-0 bottom-0 bg-green-600 text-white p-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">✓</span>
                    <span className="font-bold">Rostro detectado - Listo para guardar</span>
                  </div>
                </div>
              )}

              {/* Resultado de reconocimiento */}
              {mode === 'recognize' && isRecognizing && recognitionResult && (
                <div className={`absolute inset-x-0 bottom-0 p-4 ${
                  recognitionResult.isMatch ? 'bg-green-600' : 'bg-red-600'
                } text-white`}>
                  {recognitionResult.isMatch ? (
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">{recognitionResult.name}</div>
                      <div className="text-lg">Confianza: {recognitionResult.confidence}%</div>
                      <div className="text-sm opacity-80">Distancia: {recognitionResult.distance.toFixed(4)}</div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-2xl font-bold">❌ No reconocido</div>
                      <div className="text-sm">Distancia: {recognitionResult.distance.toFixed(4)}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Guías de esquinas */}
              {cameraReady && !currentDetection && !recognitionResult && (
                <>
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/50" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/50" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/50" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/50" />
                </>
              )}
            </div>
          </div>

          {/* Modo: Registrar */}
          {mode === 'register' && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setIsDetecting(!isDetecting)}
                  disabled={!cameraReady || !modelsReady}
                  className={`flex-1 py-4 rounded-lg font-semibold text-lg transition ${
                    isDetecting
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isDetecting ? '⏹️ Detener Detección' : '▶️ Iniciar Detección'}
                </button>

                <button
                  onClick={saveFace}
                  disabled={!currentDetection}
                  className={`flex-1 py-4 rounded-lg font-semibold text-lg transition ${
                    currentDetection
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  💾 Guardar Rostro
                </button>
              </div>

              {/* Rostros guardados */}
              {savedFaces.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Rostros Guardados ({savedFaces.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {savedFaces.map((face) => (
                      <div key={face.id} className="bg-white rounded-lg p-4 shadow">
                        <div className="text-6xl text-center mb-2">👤</div>
                        <div className="font-semibold text-center mb-2">{face.name}</div>
                        <div className="text-xs text-gray-500 text-center mb-3">
                          {new Date(face.timestamp).toLocaleString()}
                        </div>
                        <button
                          onClick={() => deleteFace(face.id)}
                          className="w-full bg-red-100 text-red-600 py-2 rounded hover:bg-red-200 transition text-sm"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                  💡 <strong>Cómo funciona:</strong> Igual que Arachiz
                </p>
                <ol className="text-sm text-gray-600 mt-2 ml-4 list-decimal space-y-1">
                  <li>Clic en "▶️ Iniciar Detección"</li>
                  <li>Mira a la cámara hasta que aparezca "✓ Rostro detectado"</li>
                  <li>Clic en "💾 Guardar Rostro" e ingresa tu nombre</li>
                  <li>Repite 2-3 veces desde diferentes ángulos</li>
                </ol>
              </div>
            </div>
          )}

          {/* Modo: Reconocer */}
          {mode === 'recognize' && (
            <div className="space-y-6">
              <button
                onClick={() => setIsRecognizing(!isRecognizing)}
                disabled={!cameraReady || !modelsReady}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
                  isRecognizing
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isRecognizing ? '⏹️ Detener Reconocimiento' : '▶️ Iniciar Reconocimiento'}
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                  💡 <strong>Reconocimiento automático:</strong> Mira a la cámara y te reconocerá instantáneamente
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Rostros registrados: <strong>{savedFaces.map(f => f.name).join(', ')}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Modo: Benchmark */}
          {mode === 'benchmark' && (
            <div className="space-y-6">
              {!benchmarkResults ? (
                <>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Seleccionar APIs a Comparar</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAPIs.faceapi}
                          onChange={(e) => setSelectedAPIs({...selectedAPIs, faceapi: e.target.checked})}
                          className="w-5 h-5"
                        />
                        <div>
                          <span className="font-semibold">face-api.js</span>
                          <span className="text-sm text-gray-600 ml-2">(Actual)</span>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAPIs.mediapipe}
                          onChange={(e) => setSelectedAPIs({...selectedAPIs, mediapipe: e.target.checked})}
                          className="w-5 h-5"
                        />
                        <div>
                          <span className="font-semibold">MediaPipe</span>
                          <span className="text-sm text-gray-600 ml-2">(Google)</span>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAPIs.tensorflow}
                          onChange={(e) => setSelectedAPIs({...selectedAPIs, tensorflow: e.target.checked})}
                          className="w-5 h-5"
                        />
                        <div>
                          <span className="font-semibold">TensorFlow.js</span>
                          <span className="text-sm text-gray-600 ml-2">(BlazeFace)</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={runBenchmark}
                    disabled={isRunningBenchmark}
                    className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
                      isRunningBenchmark
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                    }`}
                  >
                    {isRunningBenchmark ? '⏳ Ejecutando...' : '🚀 Ejecutar Benchmark'}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-semibold">📊 Resultados</h3>
                    <button
                      onClick={downloadResults}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      💾 Descargar JSON
                    </button>
                  </div>

                  {/* Ganadores */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
                      <div className="text-sm text-gray-600">🏆 Más Rápida</div>
                      <div className="text-lg font-bold">{benchmarkResults.winner.fastest}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                      <div className="text-sm text-gray-600">🎯 Más Precisa</div>
                      <div className="text-lg font-bold">{benchmarkResults.winner.mostAccurate}</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                      <div className="text-sm text-gray-600">💾 Menos Memoria</div>
                      <div className="text-lg font-bold">{benchmarkResults.winner.leastMemory}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
                      <div className="text-sm text-gray-600">👑 Ganador General</div>
                      <div className="text-lg font-bold">{benchmarkResults.winner.overall}</div>
                    </div>
                  </div>

                  {/* Tabla */}
                  <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left">API</th>
                          <th className="p-3 text-right">Init (ms)</th>
                          <th className="p-3 text-right">Detección (ms)</th>
                          <th className="p-3 text-right">Extracción (ms)</th>
                          <th className="p-3 text-right">Matching (ms)</th>
                          <th className="p-3 text-right">Precisión (%)</th>
                          <th className="p-3 text-right">Memoria (MB)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {benchmarkResults.apis.map((api, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-semibold">{api.name}</td>
                            <td className="p-3 text-right">{api.initialization.toFixed(2)}</td>
                            <td className="p-3 text-right">{api.avgDetection.toFixed(2)}</td>
                            <td className="p-3 text-right">{api.avgExtraction.toFixed(2)}</td>
                            <td className="p-3 text-right">{api.avgMatching.toFixed(2)}</td>
                            <td className="p-3 text-right">{(api.accuracy * 100).toFixed(1)}%</td>
                            <td className="p-3 text-right">{api.memoryUsedMB.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border-2 border-purple-200">
                    <h3 className="text-xl font-bold mb-3">💡 Recomendación</h3>
                    <p className="text-gray-700">
                      <strong>{benchmarkResults.winner.overall}</strong> es la mejor opción general para Arachiz.
                    </p>
                  </div>

                  <button
                    onClick={() => setBenchmarkResults(null)}
                    className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    ← Volver a ejecutar
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
