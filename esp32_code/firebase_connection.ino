
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
#define DATABASE_URL "https://<DATABASE_NAME>.firebaseio.com" // Get from Firebase console

// Define Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
int count = 0;

void setup() {
  Serial.begin(115200);
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

  // Sign up credentials (only needed for the first time)
  auth.user.email = "user@example.com";
  auth.user.password = "password";

  // Assign the callback function for the long running token generation task
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

}

void loop() {
  // Send data to Firebase every 10 seconds
  if (millis() - sendDataPrevMillis > 10000) {
    sendDataPrevMillis = millis();
    count++;
    Serial.printf("Sending value to Firebase: %d\n", count);

    // The path in the database where the data will be stored
    String path = "/esp32/counter";

    if (Firebase.RTDB.setInt(&fbdo, path.c_str(), count)) {
        Serial.println("PASSED");
        Serial.println("PATH: " + fbdo.dataPath());
        Serial.println("TYPE: " + fbdo.dataType());
    } else {
        Serial.println("FAILED");
        Serial.println("REASON: " + fbdo.errorReason());
    }
  }
}
