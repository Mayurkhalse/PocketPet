import { describe, it, expect } from "vitest";
const {
  sha256,
  generateDeviceToken,
  generatePairingCode,
  generateInviteCode,
  signJwt,
  verifyJwt,
} = require("../../src/utils/tokens");

describe("Tokens Utility", () => {
  it("computes consistent sha256 hashes", () => {
    const hash1 = sha256("test-device-token");
    const hash2 = sha256("test-device-token");
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it("generates a 64-hex-char device token", () => {
    const token = generateDeviceToken();
    expect(token).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(token)).toBe(true);
  });

  it("generates a 6-digit pairing code", () => {
    const code = generatePairingCode();
    expect(code).toHaveLength(6);
    expect(/^\d{6}$/.test(code)).toBe(true);
  });

  it("generates an 8-character uppercase invite code", () => {
    const code = generateInviteCode();
    expect(code).toHaveLength(8);
    expect(/^[A-Z0-9]{8}$/.test(code)).toBe(true);
  });

  it("signs and verifies JWT tokens", () => {
    const payload = { userId: "user-123", email: "test@pocketpet.dev" };
    const token = signJwt(payload);
    const decoded = verifyJwt(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });
});

