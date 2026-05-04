import { useState, useRef } from 'react';
import { FacialRecognitionBenchmark } from '../utils/facialRecognition/benchmark';
import { FaceApiAdapter } from '../utils/facialRecognition/adapters/FaceApiAdapter';
import { MediaPipeAdapter } from '../utils/facialRecognition/adapters/MediaPipeAdapter';
import { TensorFlowAdapter } from '../utils/facialRecognition/adapters/TensorFlowAdapter';

export default function FacialRecognitionTest() {
  const [testImages, setTestImages] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedAPIs, setSelectedAPIs] = useState({
    faceapi: true,
    mediapipe: false,
    tensorflow: false
  });
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const images = [];

    for (const file of files) {
      const img = await loadImage(file);
      images.push({
        name: file.name,
        data: img,
        personId: prompt(`ID de persona para ${file.name}:`),
        expectedFaces: parseInt(prompt(`¿Cuántos rostros en ${file.name}?`, '1'))
      });
    }

    setTestImages(prev => [...prev, ...images]);
  };

  const loadImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const runBenchmark = async () => {
    if (testImages.length < 2) {
      alert('Necesitas al menos 2 imágenes para comparar');
      return;
    }

    setIsRunning(true);
    const benchmark = new FacialRecognitionBenchmark();
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

    try {
      const report = await benchmark.compareAll();
      setResults(report);
    } catch (error) {
      console.error('Error en benchmark:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `facial-recognition-benchmark-${Date.now()}.json`;

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
            Compara diferentes APIs para encontrar la más rápida, precisa y segura
          </p>

          {/* Selección de APIs */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">APIs a Probar</h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition">
                <input
                  type="checkbox"
                  checked={selectedAPIs.faceapi}
                  onChange={(e) => setSelectedAPIs({...selectedAPIs, faceapi: e.target.checked})}
                  className="w-5 h-5"
                />
                <div>
                  <span className="font-semibold">face-api.js</span>
                  <span className="text-sm text-gray-600 ml-2">(Actual - Ya instalada)</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition">
                <input
                  type="checkbox"
                  checked={selectedAPIs.mediapipe}
                  onChange={(e) => setSelectedAPIs({...selectedAPIs, mediapipe: e.target.checked})}
                  className="w-5 h-5"
                />
                <div>
                  <span className="font-semibold">MediaPipe</span>
                  <span className="text-sm text-gray-600 ml-2">(Google - Muy rápido)</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition">
                <input
                  type="checkbox"
                  checked={selectedAPIs.tensorflow}
                  onChange={(e) => setSelectedAPIs({...selectedAPIs, tensorflow: e.target.checked})}
                  className="w-5 h-5"
                />
                <div>
                  <span className="font-semibold">TensorFlow.js</span>
                  <span className="text-sm text-gray-600 ml-2">(BlazeFace - Ligero)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Carga de imágenes */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Imágenes de Prueba</h2>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              📁 Cargar Imágenes
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Carga al menos 2 imágenes. Incluye múltiples fotos de la misma persona para probar precisión.
            </p>

            {testImages.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {testImages.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={img.data.src}
                      alt={img.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 rounded-b-lg">
                      <div>{img.name}</div>
                      <div>ID: {img.personId}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botón de ejecución */}
          <button
            onClick={runBenchmark}
            disabled={isRunning || testImages.length < 2}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
              isRunning || testImages.length < 2
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
            }`}
          >
            {isRunning ? '⏳ Ejecutando pruebas...' : '🚀 Iniciar Benchmark'}
          </button>

          {/* Resultados */}
          {results && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">📊 Resultados</h2>
                <button
                  onClick={downloadResults}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  💾 Descargar JSON
                </button>
              </div>

              {/* Ganadores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
                  <div className="text-sm text-gray-600">🏆 Más Rápida</div>
                  <div className="text-lg font-bold">{results.winner.fastest}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                  <div className="text-sm text-gray-600">🎯 Más Precisa</div>
                  <div className="text-lg font-bold">{results.winner.mostAccurate}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                  <div className="text-sm text-gray-600">💾 Menos Memoria</div>
                  <div className="text-lg font-bold">{results.winner.leastMemory}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
                  <div className="text-sm text-gray-600">👑 Ganador General</div>
                  <div className="text-lg font-bold">{results.winner.overall}</div>
                </div>
              </div>

              {/* Tabla comparativa */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left">API</th>
                      <th className="p-3 text-right">Inicialización (ms)</th>
                      <th className="p-3 text-right">Detección (ms)</th>
                      <th className="p-3 text-right">Extracción (ms)</th>
                      <th className="p-3 text-right">Matching (ms)</th>
                      <th className="p-3 text-right">Precisión (%)</th>
                      <th className="p-3 text-right">Memoria (MB)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.apis.map((api, idx) => (
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
