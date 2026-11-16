#pragma once

#include <Arduino.h>
#include "display_manager.h"
#include "../lib/sprites/dog_idle.h"
#include "../lib/sprites/dog_walk.h"
#include "../lib/sprites/dog_sleep.h"
#include "../lib/sprites/dog_happy.h"

enum class PetBehavior {
  IDLE,
  WALK_LEFT,
  WALK_RIGHT,
  SLEEP,
  HAPPY
};

class PetAnimation {
 public:
  PetAnimation(DisplayManager& display);
  void begin();
  void update();
  void triggerHappy();
  void resetInactivity();

 private:
  DisplayManager& display;
  PetBehavior currentBehavior = PetBehavior::IDLE;

  int petX = 40;
  int petY = 8;
  int walkDirection = 1;

  uint32_t lastFrameTime = 0;
  uint32_t framePeriodMs = 150;
  uint8_t frameIndex = 0;

  uint32_t lastBehaviorChange = 0;
  uint32_t behaviorDurationMs = 5000;
  uint32_t lastInteractionTime = 0;

  void chooseNextBehavior();
};

