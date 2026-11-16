import { describe, it, expect } from "vitest";
const { validatePetText } = require("../../src/validators/textValidator");

describe("Text & Icon Validator", () => {
  it("allows simple ASCII messages under 64 chars", () => {
    expect(() => validatePetText("Good morning, PocketPet!")).not.toThrow();
  });

  it("counts each :icon: token as 1 character", () => {
    // 60 chars of text + 4 icons = 64 effective chars
    const base = "A".repeat(60);
    const textWithIcons = `${base}:heart::bone::paw::star:`;
    expect(() => validatePetText(textWithIcons)).not.toThrow();

    // 61 chars + 4 icons = 65 -> exceeds
    const tooLong = `B${textWithIcons}`;
    expect(() => validatePetText(tooLong)).toThrow("exceeds 64 characters");
  });

  it("rejects unknown icon names", () => {
    expect(() => validatePetText("Hello :dragon:")).toThrow("Unknown icon token :dragon:");
  });

  it("rejects non-ASCII characters like emojis", () => {
    expect(() => validatePetText("Hello ❤️")).toThrow("Only printable ASCII characters and valid icons are allowed");
  });

  it("rejects more than 4 lines", () => {
    const multiLines = "1\n2\n3\n4\n5";
    expect(() => validatePetText(multiLines)).toThrow("cannot exceed 4 lines");
  });
});

