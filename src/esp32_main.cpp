
#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>

// Replace with your network credentials
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Replace with your Firebase project API Key
#define API_KEY "YOUR_FIREBASE_API_KEY"

// Replace with your Firebase Realtime Database URL
#define DATABASE_URL "YOUR_FIREBASE_DATABASE_URL"


// Define Firebase objects
FirebaseData stream;
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Variables to store sensor data
float temperature = 0.0;
float humidity = 0.0;

// Variable to store fan state
bool fanOn = false;

// Flag to indicate if we are connected to Firebase
bool firebaseConnected = false;

// Queue for offline data
struct SensorData {
  float temperature;
  float humidity;
};

#define OFFLINE_QUEUE_SIZE 10
SensorData offline_queue[OFFLINE_QUEUE_SIZE];
int offline_queue_head = 0;
int offline_queue_tail = 0;

void streamCallback(FirebaseStream data);
void streamTimeoutCallback(bool timeout);
void sendDataToFirebase();
void sendOfflineData();

void setup() {
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  // Assign the API key (required)
  config.api_key = API_KEY;

  // Assign the RTDB URL (required)
  config.database_url = DATABASE_URL;

  // Sign up anonymously (or use other authentication methods)
  config.signer.test_mode = true;

  // Assign the stream callback function
  config.stream_callback = streamCallback;

  // Assign the stream timeout callback function
  config.stream_timeout_callback = streamTimeoutCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  // Start stream on a different path
  if (!Firebase.RTDB.beginStream(&stream, "/commands")) {
    Serial.println("------------------------------------");
    Serial.println("Can't begin stream path...");
    Serial.println("REASON: " + stream.errorReason());
    Serial.println("------------------------------------");
    Serial.println();
  }
}

void loop() {
  // Simulate sensor readings
  temperature = random(20, 30);
  humidity = random(40, 60);

  if (WiFi.status() == WL_CONNECTED && firebaseConnected) {
    if (offline_queue_head != offline_queue_tail) {
      sendOfflineData();
    }
    sendDataToFirebase();
  } else {
    // Store data offline if not connected
    offline_queue[offline_queue_head] = {temperature, humidity};
    offline_queue_head = (offline_queue_head + 1) % OFFLINE_QUEUE_SIZE;
    if (offline_queue_head == offline_queue_tail) {
        offline_queue_tail = (offline_queue_tail + 1) % OFFLINE_QUEUE_SIZE;
    }
  }

  delay(5000); // Wait 5 seconds
}

void sendDataToFirebase() {
  if (Firebase.RTDB.setFloat(&fbdo, "/data/temperature", temperature)) {
    Serial.println("Temperature sent successfully");
  } else {
    Serial.println("Error sending temperature");
  }

  if (Firebase.RTDB.setFloat(&fbdo, "/data/humidity", humidity)) {
    Serial.println("Humidity sent successfully");
  } else {
    Serial.println("Error sending humidity");
  }
}

void sendOfflineData() {
  while (offline_queue_head != offline_queue_tail) {
    SensorData data = offline_queue[offline_queue_tail];
    offline_queue_tail = (offline_queue_tail + 1) % OFFLINE_QUEUE_SIZE;

    if (Firebase.RTDB.setFloat(&fbdo, "/data/temperature", data.temperature) && Firebase.RTDB.setFloat(&fbdo, "/data/humidity", data.humidity)) {
      Serial.println("Offline data sent successfully");
    } else {
      // If sending fails, put it back in the queue
      offline_queue_tail = (offline_queue_tail -1 + OFFLINE_QUEUE_SIZE) % OFFLINE_QUEUE_SIZE;
      break;
    }
  }
}

void streamCallback(FirebaseStream data) {
  Serial.printf("stream path, %s/%s\n", data.streamPath().c_str(), data.dataPath().c_str());
  if (data.dataType() == "boolean") {
    fanOn = data.boolData();
    if(fanOn){
        Serial.println("Fan turned ON");
        // Add code here to turn on the fan
    } else {
        Serial.println("Fan turned OFF");
        // Add code here to turn off the fan
    }
  }
}

void streamTimeoutCallback(bool timeout) {
  if (timeout) {
    Serial.println("Stream timeout, resuming...");
  }
  
  if (!stream.httpConnected()) {
    Serial.printf("error code: %d, reason: %s\n\n", stream.httpCode(), stream.errorReason().c_str());
    firebaseConnected = false;
  } else {
    firebaseConnected = true;
  }
}
