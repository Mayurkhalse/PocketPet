#include "pet_animation.h"

PetAnimation::PetAnimation(DisplayManager& display) : display(display) {}

void PetAnimation::begin() {
  lastInteractionTime = millis();
  lastBehaviorChange = millis();
  chooseNextBehavior();
}

void PetAnimation::resetInactivity() {
  lastInteractionTime = millis();
  if (currentBehavior == PetBehavior::SLEEP) {
    currentBehavior = PetBehavior::IDLE;
  }
}

void PetAnimation::triggerHappy() {
  currentBehavior = PetBehavior::HAPPY;
  lastBehaviorChange = millis();
  behaviorDurationMs = 3000;
  resetInactivity();
}

void PetAnimation::chooseNextBehavior() {
  uint32_t now = millis();
  lastBehaviorChange = now;

  // Inactivity timeout -> SLEEP
  if (now - lastInteractionTime > SLEEP_TIMEOUT_MS) {
    currentBehavior = PetBehavior::SLEEP;
    behaviorDurationMs = 20000;
    return;
  }

  // Random behavior selection
  int r = random(0, 100);
  if (r < 45) {
    currentBehavior = PetBehavior::IDLE;
    behaviorDurationMs = random(3000, 7000);
  } else if (r < 75) {
    currentBehavior = (random(0, 2) == 0) ? PetBehavior::WALK_LEFT : PetBehavior::WALK_RIGHT;
    behaviorDurationMs = random(4000, 8000);
  } else {
    currentBehavior = PetBehavior::HAPPY;
    behaviorDurationMs = random(2000, 4000);
  }
}

void PetAnimation::update() {
  uint32_t now = millis();

  if (now - lastBehaviorChange > behaviorDurationMs) {
    chooseNextBehavior();
  }

  if (now - lastFrameTime >= framePeriodMs) {
    lastFrameTime = now;
    frameIndex = (frameIndex + 1) % 2;

    display.clear();

    switch (currentBehavior) {
      case PetBehavior::IDLE: {
        const unsigned char* frame = (frameIndex == 0) ? dog_idle_frame1 : dog_idle_frame2;
        display.drawPet(petX, petY, frame);
        break;
      }
      case PetBehavior::WALK_LEFT: {
        petX -= 2;
        if (petX < 0) {
          petX = 0;
          currentBehavior = PetBehavior::WALK_RIGHT;
        }
        const unsigned char* frame = (frameIndex == 0) ? dog_walk_frame1 : dog_walk_frame2;
        display.drawPet(petX, petY, frame);
        break;
      }
      case PetBehavior::WALK_RIGHT: {
        petX += 2;
        if (petX > OLED_W - 48) {
          petX = OLED_W - 48;
          currentBehavior = PetBehavior::WALK_LEFT;
        }
        const unsigned char* frame = (frameIndex == 0) ? dog_walk_frame1 : dog_walk_frame2;
        display.drawPet(petX, petY, frame);
        break;
      }
      case PetBehavior::HAPPY: {
        display.drawPet(petX, petY, dog_happy_frame1);
        break;
      }
      case PetBehavior::SLEEP: {
        display.drawPet(petX, petY, dog_sleep_frame1);
        break;
      }
    }

    display.display();
  }
}

