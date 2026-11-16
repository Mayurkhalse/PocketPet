#include <Arduino.h>
#include "app_state.h"

AppState app;

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println("\n--- PocketPet ESP32-C3 Firmware Starting ---");
  app.begin();
}

void loop() {
  app.loop();
  yield();
}

