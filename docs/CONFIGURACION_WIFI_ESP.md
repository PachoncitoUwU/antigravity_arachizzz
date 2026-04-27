# 📡 Configuración WiFi del ESP8266 - Portal Cautivo

## ¿Qué es esto?

El ESP8266 ahora tiene un **portal cautivo WiFi** que te permite configurar cualquier red WiFi sin necesidad de reprogramar el dispositivo. Es como configurar un router o un dispositivo inteligente desde tu celular.

**✨ NUEVO: Ahora se abre automáticamente cuando te conectas!**

---

## 🚀 Primera Configuración

### Paso 1: Encender el ESP8266
1. Conecta el ESP8266 a la corriente
2. La pantalla OLED mostrará:
   ```
   MODO CONFIG
   WiFi: ARACHIZ-CONFIG
   IP: 192.168.4.1
   ```

### Paso 2: Conectarse desde el celular
1. Abre la configuración WiFi de tu celular
2. Busca la red: **ARACHIZ-CONFIG**
3. Conéctate a esa red (no tiene contraseña)
4. **¡La página se abrirá automáticamente!** 🎉

### Paso 3: Configurar tu WiFi
1. Verás un formulario bonito con el logo de ARACHIZ
2. Ingresa:
   - **Red WiFi (SSID)**: El nombre de tu WiFi
   - **Contraseña**: La contraseña de tu WiFi
3. Presiona **"💾 Guardar y Conectar"**
4. Espera a que diga "Configuración Guardada"

### Paso 4: Listo!
- El ESP se reiniciará automáticamente (toma 5-10 segundos)
- Se conectará a tu WiFi
- La pantalla mostrará:
  ```
  WiFi OK
  192.168.X.X
  Listo!
  ```

---

## � Librerías Necesarias en Arduino IDE

Antes de subir el código, asegúrate de tener instaladas:

1. **ESP8266WiFi** (viene con el core ESP8266)
2. **ESP8266WebServer** (viene con el core ESP8266)
3. **DNSServer** (viene con el core ESP8266)
4. **Adafruit_SSD1306** (instalar desde Library Manager)
5. **Adafruit_GFX** (instalar desde Library Manager)
6. **ArduinoJson** (instalar desde Library Manager)

### Cómo instalar el core ESP8266:
1. Arduino IDE → Archivo → Preferencias
2. En "Gestor de URLs Adicionales de Tarjetas":
   ```
   http://arduino.esp8266.com/stable/package_esp8266com_index.json
   ```
3. Herramientas → Placa → Gestor de tarjetas
4. Buscar "ESP8266" e instalar

---

## �🔄 Cambiar de Red WiFi

Si necesitas conectar el ESP a otra red (por ejemplo, cambiar de casa al SENA):

### Opción 1: Desde el Portal (Recomendada)
1. Conecta el ESP a la corriente
2. Conéctate a la red **ARACHIZ-CONFIG** desde tu celular
3. La página se abrirá automáticamente
4. Presiona el botón **"🔄 Borrar Configuración"**
5. El ESP se reiniciará en modo configuración
6. Sigue los pasos de "Primera Configuración"

### Opción 2: Forzar Reset
Si el ESP no entra en modo configuración:
1. Mantén presionado el botón **RESET** del ESP
2. Mientras lo mantienes, presiona el botón **FLASH**
3. Suelta **RESET**, luego suelta **FLASH**
4. El ESP borrará la configuración y entrará en modo portal

---

## �️ Solución de Problemas

### La página no se abre automáticamente
**Solución:**
- Espera 10 segundos después de conectarte
- Desactiva los datos móviles en tu celular
- Abre el navegador manualmente y ve a: `http://192.168.4.1`
- En Android, toca la notificación "Iniciar sesión en la red"
- En iOS, toca "Usar sin Internet" cuando aparezca

### No guarda las credenciales
**Solución:**
- Verifica que el SSID y contraseña sean correctos
- Espera a ver el mensaje "Configuración Guardada"
- No desconectes el ESP hasta que se reinicie solo
- Abre el Monitor Serial (115200 baud) para ver logs de debug

### El ESP dice "ERROR WiFi"
**Solución:**
- Verifica que el nombre del WiFi sea correcto (distingue mayúsculas)
- Verifica que la contraseña sea correcta
- Asegúrate de que el WiFi sea de **2.4GHz** (el ESP no soporta 5GHz)
- El ESP se reiniciará automáticamente y volverá al modo configuración

### El ESP no crea la red ARACHIZ-CONFIG
**Solución:**
- Verifica que el ESP esté encendido
- Espera 10 segundos después de encenderlo
- Presiona el botón RESET del ESP
- Abre el Monitor Serial para ver si hay errores

### Cómo verificar si guardó las credenciales
**Solución:**
1. Abre el Monitor Serial en Arduino IDE (115200 baud)
2. Reinicia el ESP
3. Deberías ver:
   ```
   Config flag: SI
   SSID cargado: TuWiFi
   Conectando WiFi...
   ```

---

## � Notas Técnicas

### Mejoras Implementadas:
✅ **DNS Server** - Captura todas las peticiones y redirige al portal
✅ **Rutas múltiples** - Soporta Android, iOS y Windows
✅ **EEPROM mejorado** - Guarda correctamente con commit()
✅ **Debug serial** - Logs para diagnosticar problemas
✅ **Terminadores null** - Strings correctamente terminados

### Direcciones de Memoria EEPROM:
- `0-63`: SSID (nombre del WiFi)
- `64-127`: Password (contraseña)
- `128`: Flag de configuración (1 = configurado, 0 = sin configurar)

### Comportamiento:
1. Al encender, el ESP lee la EEPROM
2. Si no hay configuración → Modo Portal Cautivo
3. Si hay configuración → Intenta conectarse
4. Si falla la conexión → Borra config y vuelve a Portal

---

## 🎯 Resumen Rápido

1. **Primera vez**: Conecta a ARACHIZ-CONFIG → Página se abre sola → Configura WiFi → Listo
2. **Cambiar WiFi**: Botón "Borrar Configuración" → Configura nuevo WiFi
3. **Problemas**: Abre Monitor Serial (115200 baud) → Ve los logs → Diagnostica

**¡Ahora tu ESP8266 funciona con cualquier WiFi! 🎉**
