#pragma once

#include <Arduino.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include "../include/types.h"
#include "../include/secrets.example.h"

struct PollResponse {
  bool ok = false;
  bool paired = false;
  String pairingCode;
  uint16_t pollIntervalSec = 8;
  std::vector<CommandItem> commands;
};

class CloudClient {
 public:
  CloudClient();
  void begin(const String& baseUrl, const String& token = "");
  void setDeviceToken(const String& token);

  bool registerDevice(const String& hardwareId, String& tokenOut, String& pairingCodeOut);
  PollResponse poll(uint32_t lastSeq, const DeviceStats& stats);
  bool ack(const std::vector<AckItem>& acks);
  bool sendReaction(const ReactionEvent& reaction);

 private:
  String apiBaseUrl;
  String deviceToken;
  WiFiClientSecure client;

  void configureTls();
};

