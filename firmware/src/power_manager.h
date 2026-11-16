#pragma once

#include <Arduino.h>
#include "../include/config.h"

class PowerManager {
 public:
  PowerManager();
  void begin();
  uint8_t readBatteryPercentage();
  float readBatteryVoltage();
  void updatePowerState(uint32_t lastActivityTime);
  bool isDimmed() const { return dimmed; }
  bool isSleeping() const { return sleeping; }

 private:
  bool dimmed = false;
  bool sleeping = false;
};

