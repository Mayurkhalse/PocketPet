#include "cloud_client.h"
#include <ArduinoJson.h>

CloudClient::CloudClient() {}

void CloudClient::begin(const String& baseUrl, const String& token) {
  apiBaseUrl = baseUrl;
  deviceToken = token;
  configureTls();
}

void CloudClient::setDeviceToken(const String& token) {
  deviceToken = token;
}

void CloudClient::configureTls() {
  // During prototyping / development or if no CA cert:
  client.setInsecure();
  client.setTimeout(10000);
}

bool CloudClient::registerDevice(const String& hardwareId, String& tokenOut, String& pairingCodeOut) {
  HTTPClient http;
  String url = apiBaseUrl + "/device/register";
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");

  JsonDocument doc;
  doc["hardwareId"] = hardwareId;
  doc["fwVersion"] = "1.0.0";
  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  if (code == 200) {
    String resp = http.getString();
    JsonDocument resDoc;
    deserializeJson(resDoc, resp);
    tokenOut = resDoc["deviceToken"].as<String>();
    pairingCodeOut = resDoc["pairingCode"].as<String>();
    http.end();
    return true;
  }
  http.end();
  return false;
}

PollResponse CloudClient::poll(uint32_t lastSeq, const DeviceStats& stats) {
  PollResponse response;
  if (deviceToken.length() == 0) return response;

  HTTPClient http;
  String url = apiBaseUrl + "/device/poll?lastSeq=" + String(lastSeq) +
               "&fw=" + stats.fwVersion +
               "&rssi=" + String(stats.rssi) +
               "&bat=" + String(stats.battery) +
               "&mode=" + stats.currentMode;

  http.begin(client, url);
  http.addHeader("Authorization", "Bearer " + deviceToken);

  int code = http.GET();
  if (code == 200) {
    String resp = http.getString();
    JsonDocument resDoc;
    DeserializationError err = deserializeJson(resDoc, resp);
    if (!err) {
      response.ok = true;
      response.paired = resDoc["paired"].as<bool>();
      response.pairingCode = resDoc["pairingCode"].as<String>();
      response.pollIntervalSec = resDoc["pollIntervalSec"] | 8;

      JsonArray cmds = resDoc["commands"].as<JsonArray>();
      for (JsonObject c : cmds) {
        CommandItem item;
        item.seq = c["seq"].as<uint32_t>();
        item.rawType = c["type"].as<String>();

        if (item.rawType == "SHOW_CONTENT") item.type = CmdType::SHOW_CONTENT;
        else if (item.rawType == "PLAY_PLAYLIST") item.type = CmdType::PLAY_PLAYLIST;
        else if (item.rawType == "STOP") item.type = CmdType::STOP;
        else if (item.rawType == "SET_SETTINGS") item.type = CmdType::SET_SETTINGS;
        else if (item.rawType == "UNPAIR") item.type = CmdType::UNPAIR;
        else if (item.rawType == "REBOOT") item.type = CmdType::REBOOT;

        String payloadStr;
        serializeJson(c["payload"], payloadStr);
        item.payloadJson = payloadStr;
        response.commands.push_back(item);
      }
    }
  }
  http.end();
  return response;
}

bool CloudClient::ack(const std::vector<AckItem>& acks) {
  if (acks.empty() || deviceToken.length() == 0) return true;

  HTTPClient http;
  String url = apiBaseUrl + "/device/ack";
  http.begin(client, url);
  http.addHeader("Authorization", "Bearer " + deviceToken);
  http.addHeader("Content-Type", "application/json");

  JsonDocument doc;
  JsonArray arr = doc["acks"].to<JsonArray>();
  for (const auto& a : acks) {
    JsonObject o = arr.add<JsonObject>();
    o["seq"] = a.seq;
    o["status"] = a.status;
    if (a.error.length() > 0) o["error"] = a.error;
  }

  String body;
  serializeJson(doc, body);
  int code = http.POST(body);
  http.end();
  return code == 204;
}

bool CloudClient::sendReaction(const ReactionEvent& reaction) {
  if (deviceToken.length() == 0) return false;

  HTTPClient http;
  String url = apiBaseUrl + "/device/event";
  http.begin(client, url);
  http.addHeader("Authorization", "Bearer " + deviceToken);
  http.addHeader("Content-Type", "application/json");

  JsonDocument doc;
  doc["type"] = "REACTION";
  doc["reaction"] = reaction.reaction;
  doc["refSeq"] = reaction.refSeq;

  String body;
  serializeJson(doc, body);
  int code = http.POST(body);
  http.end();
  return code == 204;
}

