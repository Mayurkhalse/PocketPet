#pragma once

#include <Arduino.h>
#include "../include/config.h"
#include "../include/types.h"

class ButtonManager {
 public:
  ButtonManager();
  void begin();
  ButtonGesture update();

 private:
  bool readRawButton();

  bool lastState = HIGH;
  bool isPressed = false;
  uint32_t pressStartTime = 0;
  uint32_t lastReleaseTime = 0;
  uint8_t tapCount = 0;
  bool longPressFired = false;
  bool resetPressFired = false;
};

