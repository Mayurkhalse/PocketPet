#include "provisioning.h"
#include <LittleFS.h>
#include <ArduinoJson.h>

const byte DNS_PORT = 53;

Provisioning::Provisioning() : server(80) {}

void Provisioning::start(const String& apSuffix) {
  String apName = "PocketPet-Setup";
  if (apSuffix.length() > 0) {
    apName += "-" + apSuffix;
  }

  WiFi.mode(WIFI_AP);
  WiFi.softAP(apName.c_str());

  dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());

  server.on("/", HTTP_GET, [this]() { handleRoot(); });
  server.on("/scan", HTTP_GET, [this]() { handleScan(); });
  server.on("/save", HTTP_POST, [this]() { handleSave(); });

  // Captive portal detection redirects
  server.on("/generate_204", HTTP_GET, [this]() { handleCaptivePortal(); });
  server.on("/hotspot-detect.html", HTTP_GET, [this]() { handleCaptivePortal(); });
  server.on("/ncsi.txt", HTTP_GET, [this]() { handleCaptivePortal(); });
  server.onNotFound([this]() { handleCaptivePortal(); });

  server.begin();
  active = true;
  credentialsSaved = false;
  startTime = millis();
}

void Provisioning::update() {
  if (!active) return;
  dnsServer.processNextRequest();
  server.handleClient();
}

void Provisioning::stop() {
  if (!active) return;
  server.stop();
  dnsServer.stop();
  WiFi.softAPdisconnect(true);
  active = false;
}

void Provisioning::handleCaptivePortal() {
  server.sendHeader("Location", String("http://") + WiFi.softAPIP().toString(), true);
  server.send(302, "text/plain", "");
}

void Provisioning::handleRoot() {
  if (LittleFS.exists("/portal/index.html")) {
    File f = LittleFS.open("/portal/index.html", "r");
    server.streamFile(f, "text/html");
    f.close();
    return;
  }

  // Fallback inline HTML if LittleFS file is not uploaded yet
  String html = R"rawhtml(
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>PocketPet Wi-Fi Setup</title>
  <style>
    body { font-family: sans-serif; background: #0f172a; color: #fff; padding: 24px; text-align: center; }
    .box { background: #1e293b; padding: 24px; border-radius: 12px; max-width: 320px; margin: 0 auto; }
    h2 { margin-top: 0; color: #38bdf8; }
    input { width: 100%; box-sizing: border-box; padding: 12px; margin: 8px 0; border: 1px solid #334155; border-radius: 6px; background: #0f172a; color: #fff; }
    button { width: 100%; padding: 12px; border: none; background: #38bdf8; color: #0f172a; font-weight: bold; border-radius: 6px; cursor: pointer; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="box">
    <h2>🐶 PocketPet Setup</h2>
    <form action="/save" method="POST">
      <input type="text" name="ssid" placeholder="Wi-Fi SSID" required>
      <input type="password" name="password" placeholder="Wi-Fi Password">
      <button type="submit">Connect PocketPet</button>
    </form>
  </div>
</body>
</html>
)rawhtml";
  server.send(200, "text/html", html);
}

void Provisioning::handleScan() {
  int n = WiFi.scanNetworks();
  JsonDocument doc;
  JsonArray arr = doc.to<JsonArray>();
  for (int i = 0; i < n; ++i) {
    JsonObject net = arr.add<JsonObject>();
    net["ssid"] = WiFi.SSID(i);
    net["rssi"] = WiFi.RSSI(i);
  }
  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

void Provisioning::handleSave() {
  if (server.hasArg("ssid")) {
    savedCreds.ssid = server.arg("ssid");
    savedCreds.pass = server.arg("password");
    credentialsSaved = true;

    server.send(200, "text/html", "<h3>Saved! Connecting to Wi-Fi... Check your PocketPet screen!</h3>");
  } else {
    server.send(400, "text/plain", "Missing SSID");
  }
}

