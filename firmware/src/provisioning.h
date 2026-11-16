#pragma once

#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <DNSServer.h>
#include "../include/types.h"

class Provisioning {
 public:
  Provisioning();
  void start(const String& apSuffix = "");
  void update();
  void stop();
  bool isComplete() const { return credentialsSaved; }
  WifiCreds getSavedCreds() const { return savedCreds; }

 private:
  DNSServer dnsServer;
  WebServer server;
  bool active = false;
  bool credentialsSaved = false;
  WifiCreds savedCreds;
  uint32_t startTime = 0;

  void handleRoot();
  void handleScan();
  void handleSave();
  void handleCaptivePortal();
};

