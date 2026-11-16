#include "storage_manager.h"
#include <ArduinoJson.h>

#define PREFS_NAMESPACE "pocketpet"

StorageManager::StorageManager() {}

bool StorageManager::begin() {
  prefs.begin(PREFS_NAMESPACE, false);
  littleFsMounted = LittleFS.begin(true);
  return littleFsMounted;
}

bool StorageManager::loadWifi(WifiCreds& creds) {
  creds.ssid = prefs.getString("wifi_ssid", "");
  creds.pass = prefs.getString("wifi_pass", "");
  return creds.ssid.length() > 0;
}

bool StorageManager::saveWifi(const WifiCreds& creds) {
  prefs.putString("wifi_ssid", creds.ssid);
  prefs.putString("wifi_pass", creds.pass);
  return true;
}

void StorageManager::clearWifi() {
  prefs.remove("wifi_ssid");
  prefs.remove("wifi_pass");
}

String StorageManager::loadDeviceToken() {
  return prefs.getString("dev_token", "");
}

void StorageManager::saveDeviceToken(const String& token) {
  prefs.putString("dev_token", token);
}

void StorageManager::clearDeviceToken() {
  prefs.remove("dev_token");
}

uint32_t StorageManager::loadLastSeq() {
  return prefs.getUInt("last_seq", 0);
}

void StorageManager::saveLastSeq(uint32_t seq) {
  prefs.putUInt("last_seq", seq);
}

uint16_t StorageManager::loadPollInterval() {
  return prefs.getUShort("poll_int", 8);
}

void StorageManager::savePollInterval(uint16_t sec) {
  prefs.putUShort("poll_int", sec);
}

bool StorageManager::savePlaylist(const PlaylistData& playlist) {
  if (!littleFsMounted) return false;

  JsonDocument doc;
  doc["id"] = playlist.id;
  doc["name"] = playlist.name;
  doc["repeat"] = playlist.repeat;
  JsonArray itemsArr = doc["items"].to<JsonArray>();

  LittleFS.mkdir("/pl");

  for (size_t i = 0; i < playlist.items.size() && i < 20; i++) {
    JsonObject itemObj = itemsArr.add<JsonObject>();
    itemObj["type"] = playlist.items[i].type;
    itemObj["duration"] = playlist.items[i].durationSec;

    if (playlist.items[i].type == "text") {
      itemObj["text"] = playlist.items[i].text;
    } else if (playlist.items[i].type == "bitmap" && playlist.items[i].bitmap) {
      String path = "/pl/" + String(i) + ".bin";
      itemObj["file"] = path;
      File f = LittleFS.open(path, "w");
      if (f) {
        f.write(playlist.items[i].bitmap, 1024);
        f.close();
      }
    }
  }

  File f = LittleFS.open("/playlist.json", "w");
  if (!f) return false;
  serializeJson(doc, f);
  f.close();
  return true;
}

bool StorageManager::loadPlaylist(PlaylistData& playlist) {
  if (!littleFsMounted || !LittleFS.exists("/playlist.json")) return false;

  File f = LittleFS.open("/playlist.json", "r");
  if (!f) return false;

  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, f);
  f.close();
  if (err) return false;

  playlist.id = doc["id"].as<String>();
  playlist.name = doc["name"].as<String>();
  playlist.repeat = doc["repeat"].as<bool>();
  playlist.items.clear();

  JsonArray itemsArr = doc["items"].as<JsonArray>();
  for (JsonObject itemObj : itemsArr) {
    PlaylistItem item;
    item.type = itemObj["type"].as<String>();
    item.durationSec = itemObj["duration"].as<uint16_t>();

    if (item.type == "text") {
      item.text = itemObj["text"].as<String>();
    } else if (item.type == "bitmap") {
      String path = itemObj["file"].as<String>();
      if (LittleFS.exists(path)) {
        File bf = LittleFS.open(path, "r");
        if (bf && bf.size() == 1024) {
          item.bitmap = (uint8_t*)malloc(1024);
          bf.read(item.bitmap, 1024);
        }
        bf.close();
      }
    }
    playlist.items.push_back(item);
  }

  return true;
}

void StorageManager::clearPlaylist() {
  if (littleFsMounted) {
    LittleFS.remove("/playlist.json");
    for (int i = 0; i < 20; i++) {
      LittleFS.remove("/pl/" + String(i) + ".bin");
    }
  }
}

void StorageManager::factoryReset() {
  prefs.clear();
  if (littleFsMounted) {
    LittleFS.format();
  }
}

