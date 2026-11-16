#include "power_manager.h"
#include <WiFi.h>

PowerManager::PowerManager() {}

void PowerManager::begin() {
  analogReadResolution(12); // ESP32 12-bit ADC
  WiFi.setSleep(true);      // Wi-Fi modem sleep to conserve battery
}

float PowerManager::readBatteryVoltage() {
  // ADC1 GPIO0 with 2x 100k divider (multiply by 2.0)
  uint32_t raw = analogRead(PIN_BATTERY_ADC);
  float pinVoltage = (raw / 4095.0f) * 3.3f;
  return pinVoltage * 2.0f;
}

uint8_t PowerManager::readBatteryPercentage() {
  float v = readBatteryVoltage();
  if (v <= 3.2f) return 0;
  if (v >= 4.2f) return 100;
  return (uint8_t)(((v - 3.2f) / 1.0f) * 100.0f);
}

void PowerManager::updatePowerState(uint32_t lastActivityTime) {
  uint32_t idleMs = millis() - lastActivityTime;
  if (idleMs >= SLEEP_TIMEOUT_MS) {
    sleeping = true;
    dimmed = true;
  } else if (idleMs >= DIM_TIMEOUT_MS) {
    sleeping = false;
    dimmed = true;
  } else {
    sleeping = false;
    dimmed = false;
  }
}

