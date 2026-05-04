@echo off
echo ========================================
echo Instalador de APIs de Reconocimiento Facial
echo ========================================
echo.

echo [1/3] Verificando npm...
call npm --version
if errorlevel 1 (
    echo ERROR: npm no esta instalado
    pause
    exit /b 1
)

echo.
echo [2/3] Instalando MediaPipe...
call npm install @mediapipe/face_detection @mediapipe/face_mesh
if errorlevel 1 (
    echo ADVERTENCIA: Error instalando MediaPipe
)

echo.
echo [3/3] Instalando TensorFlow.js...
call npm install @tensorflow/tfjs @tensorflow-models/blazeface
if errorlevel 1 (
    echo ADVERTENCIA: Error instalando TensorFlow.js
)

echo.
echo ========================================
echo Instalacion completada!
echo ========================================
echo.
echo Ahora puedes ejecutar:
echo   npm run dev
echo.
echo Y navegar a:
echo   http://localhost:5173/facial-recognition-test
echo.
pause
