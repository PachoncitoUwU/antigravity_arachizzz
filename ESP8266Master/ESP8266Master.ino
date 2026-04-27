#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// --- CONFIGURACIÓN WiFi ---
const char* WIFI_SSID     = "Famila_Pachon";
const char* WIFI_PASSWORD = "Familiapachon875";

// --- BACKEND URLs ---
const char* URL_RENDER_EVENT = "https://arachiz-backend.onrender.com/api/hardware/event";
const char* URL_RENDER_CMD   = "https://arachiz-backend.onrender.com/api/hardware/commands";
const char* URL_LOCAL_EVENT  = "http://192.168.X.X:3000/api/hardware/event";
const char* URL_LOCAL_CMD    = "http://192.168.X.X:3000/api/hardware/commands";
const char* API_KEY          = "arachiz-esp-2024";

// --- PANTALLA OLED ---
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
#define SCREEN_ADDRESS 0x3C
#define OLED_SDA 14
#define OLED_SCL 12

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// --- COMUNICACIÓN CON ARDUINO ---
SoftwareSerial arduinoSerial(4, 0); // RX=D2, TX=D3

void mostrarMensaje(String l1, String l2 = "", String l3 = "") {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);  display.println(l1);
  if (l2 != "") { display.setCursor(0, 22); display.println(l2); }
  if (l3 != "") { display.setCursor(0, 44); display.println(l3); }
  display.display();
}

void conectarWifi() {
  mostrarMensaje("Conectando", "WiFi...", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED && intentos < 20) {
    delay(500); intentos++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    mostrarMensaje("WiFi OK", WiFi.localIP().toString(), "Listo!");
    delay(1500);
  } else {
    mostrarMensaje("ERROR WiFi", "Sin conexion");
    delay(1500);
  }
}

bool enviarEvento(String type, String payload, bool online) {
  if (WiFi.status() != WL_CONNECTED) return false;

  String url = online ? URL_RENDER_EVENT : URL_LOCAL_EVENT;

  StaticJsonDocument<128> doc;
  doc["type"] = type;
  doc["payload"] = payload;
  String body;
  serializeJson(doc, body);

  bool ok = false;
  if (online) {
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient http;
    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-hardware-key", API_KEY);
    http.setTimeout(10000);
    int code = http.POST(body);
    ok = (code == 200);
    Serial.println("POST Render -> " + String(code));
    http.end();
  } else {
    WiFiClient client;
    HTTPClient http;
    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-hardware-key", API_KEY);
    int code = http.POST(body);
    ok = (code == 200);
    Serial.println("POST Local -> " + String(code));
    http.end();
  }
  return ok;
}

void consultarComandos() {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.begin(client, URL_RENDER_CMD);
  http.addHeader("x-hardware-key", API_KEY);
  http.setTimeout(5000);
  
  int code = http.GET();
  if (code == 200) {
    String payload = http.getString();
    StaticJsonDocument<128> doc;
    deserializeJson(doc, payload);
    const char* cmd = doc["command"];
    
    if (cmd != nullptr && strlen(cmd) > 0) {
      Serial.println("Comando recibido: " + String(cmd));
      arduinoSerial.println(cmd); // Enviar al Arduino
      mostrarMensaje("Comando", cmd);
      delay(500);
    }
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  arduinoSerial.begin(9600);

  Wire.begin(OLED_SDA, OLED_SCL);
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    for(;;);
  }

  mostrarMensaje("ARACHIZ", "Iniciando...");
  delay(500);
  conectarWifi();

  mostrarMensaje("ARACHIZ listo", "Esperando...");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) conectarWifi();

  // Consultar comandos pendientes cada 2 segundos
  static unsigned long lastCheck = 0;
  if (millis() - lastCheck > 2000) {
    lastCheck = millis();
    consultarComandos();
  }

  // Leer mensajes del Arduino
  if (arduinoSerial.available()) {
    String msg = arduinoSerial.readStringUntil('\n');
    msg.trim();
    if (msg.length() == 0) return;

    Serial.println("Arduino: " + msg);

    // Detectar modo desde el prefijo que manda el Arduino
    bool online = msg.startsWith("MODO:RENDER|");
    if (online) msg = msg.substring(12);

    if (msg.startsWith("READ_NFC:")) {
      String uid = msg.substring(9); uid.trim();
      mostrarMensaje("NFC leido", uid, "Enviando...");
      bool ok = enviarEvento("nfc", uid, online);
      mostrarMensaje("NFC leido", uid, ok ? "Registrado!" : "Error envio");

    } else if (msg.startsWith("READ_FINGER:")) {
      String id = msg.substring(12); id.trim();
      mostrarMensaje("Huella leida", "ID: " + id, "Enviando...");
      bool ok = enviarEvento("finger", id, online);
      mostrarMensaje("Huella leida", "ID: " + id, ok ? "Registrado!" : "Error envio");

    } else if (msg.startsWith("ENROLL_SUCCESS:")) {
      String id = msg.substring(15); id.trim();
      mostrarMensaje("Huella", "Enrolada OK", "ID: " + id);
      enviarEvento("enroll_success", id, online);

    } else if (msg.startsWith("ENROLL_ERROR:")) {
      String err = msg.substring(13); err.trim();
      mostrarMensaje("Error enrol.", err);
      enviarEvento("enroll_error", err, online);

    } else if (msg == "TEST_PING") {
      mostrarMensaje("Arduino OK", "Switch OFF", "Modo USB");
    }
  }
}
