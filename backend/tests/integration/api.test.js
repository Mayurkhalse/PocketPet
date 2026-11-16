import { describe, it, expect, beforeAll, afterAll } from "vitest";
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const app = require("../../src/app");
const { connectDb, disconnectDb } = require("../../src/config/db");

let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await connectDb(uri);
});

afterAll(async () => {
  await disconnectDb();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("PocketPet API End-to-End Integration", () => {
  let userToken;
  let userId;
  let deviceToken;
  let pairingCode;
  let deviceId;

  it("checks liveness and readiness endpoints", async () => {
    const health = await request(app).get("/healthz");
    expect(health.status).toBe(200);
    expect(health.body.status).toBe("ok");

    const ready = await request(app).get("/readyz");
    expect(ready.status).toBe(200);
    expect(ready.body.status).toBe("ready");
  });

  it("registers a new user", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: "alice@pocketpet.dev",
        password: "securepassword123",
        displayName: "Alice",
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("alice@pocketpet.dev");
    userToken = res.body.token;
    userId = res.body.user._id;
  });

  it("allows user login", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "alice@pocketpet.dev",
        password: "securepassword123",
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("registers a hardware device and generates pairing code", async () => {
    const res = await request(app)
      .post("/api/v1/device/register")
      .send({
        hardwareId: "pp-TEST01",
        fwVersion: "1.0.0",
      });

    expect(res.status).toBe(200);
    expect(res.body.deviceToken).toBeDefined();
    expect(res.body.pairingCode).toHaveLength(6);
    deviceToken = res.body.deviceToken;
    pairingCode = res.body.pairingCode;
  });

  it("claims the device from user account using pairing code", async () => {
    const res = await request(app)
      .post("/api/v1/devices/claim")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        code: pairingCode,
        name: "Alice Doggo",
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Alice Doggo");
    expect(res.body.userRole).toBe("owner");
    deviceId = res.body._id;
  });

  it("allows device to poll and reports paired: true", async () => {
    const res = await request(app)
      .get("/api/v1/device/poll?lastSeq=0&fw=1.0.0&rssi=-60&bat=95&mode=pet")
      .set("Authorization", `Bearer ${deviceToken}`);

    expect(res.status).toBe(200);
    expect(res.body.paired).toBe(true);
    expect(res.body.commands).toEqual([]);
  });

  it("enqueues a content message from user to device", async () => {
    const res = await request(app)
      .post(`/api/v1/devices/${deviceId}/commands/content`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        type: "text",
        text: "Hello my puppy :heart:!",
        durationSec: 15,
      });

    expect(res.status).toBe(201);
    expect(res.body.seq).toBe(1);
    expect(res.body.status).toBe("pending");
  });

  it("delivers the command on device poll and acks it", async () => {
    // Poll from device
    const pollRes = await request(app)
      .get("/api/v1/device/poll?lastSeq=0")
      .set("Authorization", `Bearer ${deviceToken}`);

    expect(pollRes.status).toBe(200);
    expect(pollRes.body.commands).toHaveLength(1);
    expect(pollRes.body.commands[0].seq).toBe(1);
    expect(pollRes.body.commands[0].payload.text).toBe("Hello my puppy :heart:!");

    // Ack from device
    const ackRes = await request(app)
      .post("/api/v1/device/ack")
      .set("Authorization", `Bearer ${deviceToken}`)
      .send({
        acks: [{ seq: 1, status: "ok" }],
      });

    expect(ackRes.status).toBe(204);

    // Verify command status in history
    const statusRes = await request(app)
      .get(`/api/v1/devices/${deviceId}/commands`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.items[0].status).toBe("acked");
  });

  it("records a reaction event from device and surfaces it to user", async () => {
    // Device sends double-press heart reaction
    const eventRes = await request(app)
      .post("/api/v1/device/event")
      .set("Authorization", `Bearer ${deviceToken}`)
      .send({
        type: "REACTION",
        reaction: "heart",
        refSeq: 1,
      });

    expect(eventRes.status).toBe(204);

    // User checks events
    const userEventsRes = await request(app)
      .get(`/api/v1/devices/${deviceId}/events?unread=true`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(userEventsRes.status).toBe(200);
    expect(userEventsRes.body).toHaveLength(1);
    expect(userEventsRes.body[0].reaction).toBe("heart");
    expect(userEventsRes.body[0].refSeq).toBe(1);

    // Mark event as read
    const readRes = await request(app)
      .post(`/api/v1/devices/${deviceId}/events/read`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        ids: [userEventsRes.body[0]._id],
      });

    expect(readRes.status).toBe(200);
  });
});

