#pragma once

#include <Arduino.h>
#include <WiFi.h>
#include "../include/types.h"

class WifiManager {
 public:
  WifiManager();
  void begin();
  bool connect(const WifiCreds& creds, uint32_t timeoutMs = 15000);
  void update();
  bool isConnected();
  int8_t getRssi();

 private:
  WifiCreds currentCreds;
  bool connecting = false;
  uint32_t connectStartTime = 0;
  uint32_t lastRetryTime = 0;
  uint32_t currentBackoffMs = 2000;
  const uint32_t MAX_BACKOFF_MS = 30000;
};

