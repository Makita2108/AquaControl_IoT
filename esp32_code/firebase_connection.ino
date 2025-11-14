
#include <WiFi.h>
#include <Firebase_ESP_Client.h>

// Provide the token generation process info.
#include "addons/TokenHelper.h" 

// Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// 1. Wi-Fi Credentials
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// 2. Firebase Project Configuration
#define API_KEY "YOUR_WEB_API_KEY" // Get from Firebase console
#define DATABASE_URL "https://makita-38473547-33024-default-rtdb.firebaseio.com/" // Get from Firebase console

// 3. Define LED Pin
#define LED_PIN 2

// Define Firebase objects
FirebaseData fbdo;
FirebaseData stream;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
int count = 0;
String led_status_path = "/esp32/led_status";

// Callback function to handle stream data
void streamCallback(StreamData data)
{
  Serial.printf("Stream data received at %s, type: %s, value: %s\n",
                data.dataPath().c_str(),
                data.dataType().c_str(),
                data.stringData().c_str());

  if (data.dataType() == "boolean") {
    if (data.boolData()) {
      digitalWrite(LED_PIN, HIGH);
      Serial.println("LED turned ON");
    } else {
      digitalWrite(LED_PIN, LOW);
      Serial.println("LED turned OFF");
    }
  }
}

void streamTimeoutCallback(bool timeout)
{
  if (timeout)
    Serial.println("Stream timeout, resuming...");

  if (!stream.httpConnected())
    Serial.printf("Error code: %d, reason: %s\n", stream.httpCode(), stream.errorReason().c_str());
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);

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

  // Sign up credentials (can be empty if you have already signed up)
  auth.user.email = "a@h.cl";
  auth.user.password = "123456";

  // Assign the callback function for the long running token generation task
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  // Begin stream on the led_status path
  if (!Firebase.RTDB.beginStream(&stream, led_status_path.c_str()))
    Serial.printf("Stream begin error, %s\n", stream.errorReason().c_str());
  
  Firebase.RTDB.setStreamCallback(&stream, streamCallback, streamTimeoutCallback);
}

void loop() {
  // Send counter data to Firebase every 10 seconds
  if (millis() - sendDataPrevMillis > 10000) {
    sendDataPrevMillis = millis();
    count++;
    Serial.printf("Sending value to Firebase: %d\n", count);

    String counter_path = "/esp32/counter";

    if (Firebase.RTDB.setInt(&fbdo, counter_path.c_str(), count)) {
        Serial.println("COUNTER UPDATE PASSED");
    } else {
        Serial.println("COUNTER UPDATE FAILED");
        Serial.println("REASON: " + fbdo.errorReason());
    }
  }
}
