#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>

// --- Configuración de Red y Firebase ---
// Reemplaza con tus credenciales
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#define API_KEY "YOUR_FIREBASE_API_KEY"
#define DATABASE_URL "YOUR_FIREBASE_DATABASE_URL"

// --- Pines de los Actuadores ---
// (Descomenta y asigna los pines correctos para tu hardware)
// #define VALVE_PIN 26
// #define FAN_PIN 27

// --- Objetos de Firebase ---
FirebaseData stream;
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// --- Variables de Estado y Lectura ---
// Lecturas de sensores
float temperature = 0.0;
float humidity = 0.0;
float soilMoisture1 = 0.0;

// Estado real de los actuadores
bool valveState = false;
bool fanState = false;

// Comandos recibidos desde la App
bool valveCommand = false;
bool fanManualCommand = false;

// Lógica de control
bool fanAutoMode = true;       // Inicia en modo automático por defecto
float tempThreshold = 28.0;    // Umbral de temperatura en Celsius

// --- Declaración de Funciones ---
void streamCallback(FirebaseStream data);
void streamTimeoutCallback(bool timeout);
void sendReadingsToFirebase();
void handleControlLogic();
void updateActuatorStatesOnFirebase();
void applyActuatorStates();

void setup() {
  Serial.begin(115200);

  // (Descomenta para usar los pines)
  // pinMode(VALVE_PIN, OUTPUT);
  // pinMode(FAN_PIN, OUTPUT);

  // --- Conexión Wi-Fi ---
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());

  // --- Configuración de Firebase ---
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  config.signer.test_mode = true; // Usar autenticación anónima
  config.stream_callback = streamCallback;
  config.stream_timeout_callback = streamTimeoutCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // --- Iniciar Stream de Firebase ---
  // Escucha cambios en el nodo /controls
  if (!Firebase.RTDB.beginStream(&stream, "/controls")) {
    Serial.printf("Stream begin error, %s\n", stream.errorReason().c_str());
  }
}

void loop() {
  // --- Simulación de Lectura de Sensores ---
  // (Reemplaza con lecturas de tus sensores reales, ej: DHT11, etc.)
  temperature = random(200, 350) / 10.0; // Temp entre 20.0 y 35.0 C
  humidity = random(40, 70);
  soilMoisture1 = random(30, 80);

  // Solo ejecuta la lógica si estamos conectados a Firebase
  if (Firebase.ready()) {
    handleControlLogic();
    sendReadingsToFirebase();
    updateActuatorStatesOnFirebase();
  }

  delay(10000); // Espera 10 segundos entre ciclos
}

// --- Lógica de Control Principal ---
void handleControlLogic() {
  // La válvula siempre sigue el comando directo
  valveState = valveCommand;

  // Lógica del ventilador
  if (fanAutoMode) {
    // Modo Automático: se basa en la temperatura
    fanState = (temperature > tempThreshold);
  } else {
    // Modo Manual: sigue el comando de la app
    fanState = fanManualCommand;
  }

  applyActuatorStates();
}

// Aplica los estados a los pines físicos
void applyActuatorStates(){
    // (Descomenta y usa tus pines)
    // digitalWrite(VALVE_PIN, valveState);
    // digitalWrite(FAN_PIN, fanState);

    Serial.printf("Estado Válvula: %s, Estado Ventilador: %s (Modo: %s)\n", 
                  valveState ? "ON" : "OFF", 
                  fanState ? "ON" : "OFF", 
                  fanAutoMode ? "Auto" : "Manual");
}


// --- Funciones de Firebase ---

// Se ejecuta cuando llegan datos del stream (/controls)
void streamCallback(FirebaseStream data) {
  String path = data.dataPath();
  Serial.printf("Stream a: %s, Valor: %s, Tipo: %s\n", path.c_str(), data.stringData().c_str(), data.dataType().c_str());

  if (path == "/valveCommand") {
    if(data.dataType() == "boolean") valveCommand = data.boolData();
  } else if (path == "/fanManualCommand") {
    if(data.dataType() == "boolean") fanManualCommand = data.boolData();
  } else if (path == "/fanAutoMode") {
    if(data.dataType() == "boolean") fanAutoMode = data.boolData();
  } else if (path == "/tempThreshold") {
    if(data.dataType() == "number" || data.dataType() == "float") tempThreshold = data.floatData();
  }
}

// Envía las lecturas de los sensores a Firebase bajo el nodo /readings
void sendReadingsToFirebase() {
  FirebaseJson json;
  json.set("temperature", temperature);
  json.set("humidity", humidity);
  json.set("soilMoisture1", soilMoisture1);

  if (!Firebase.RTDB.setJSON(&fbdo, "/readings", &json)) {
    Serial.printf("Error enviando lecturas: %s\n", fbdo.errorReason().c_str());
  }
}

// Actualiza el estado real de los actuadores en Firebase bajo el nodo /state
void updateActuatorStatesOnFirebase(){
  FirebaseJson json;
  json.set("valveState", valveState);
  json.set("fanState", fanState);

  if (!Firebase.RTDB.setJSON(&fbdo, "/state", &json)) {
    Serial.printf("Error actualizando estados: %s\n", fbdo.errorReason().c_str());
  }
}

// Manejo de timeout del stream
void streamTimeoutCallback(bool timeout) {
  if (timeout) {
    Serial.println("Stream timeout, resuming...");
  }
  if (!stream.httpConnected()) {
    Serial.printf("Error de stream, código: %d, razón: %s\n", stream.httpCode(), stream.errorReason().c_str());
  }
}
