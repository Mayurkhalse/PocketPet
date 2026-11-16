#include "wifi_manager.h"

WifiManager::WifiManager() {}

void WifiManager::begin() {
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
}

bool WifiManager::connect(const WifiCreds& creds, uint32_t timeoutMs) {
  currentCreds = creds;
  if (creds.ssid.length() == 0) return false;

  WiFi.begin(creds.ssid.c_str(), creds.pass.c_str());
  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < timeoutMs) {
    delay(200);
  }

  if (WiFi.status() == WL_CONNECTED) {
    currentBackoffMs = 2000;
    return true;
  }
  return false;
}

void WifiManager::update() {
  if (WiFi.status() == WL_CONNECTED) {
    currentBackoffMs = 2000;
    return;
  }

  uint32_t now = millis();
  if (now - lastRetryTime >= currentBackoffMs && currentCreds.ssid.length() > 0) {
    lastRetryTime = now;
    WiFi.reconnect();
    currentBackoffMs = min(currentBackoffMs * 2, MAX_BACKOFF_MS);
  }
}

bool WifiManager::isConnected() {
  return WiFi.status() == WL_CONNECTED;
}

int8_t WifiManager::getRssi() {
  return isConnected() ? WiFi.RSSI() : 0;
}

