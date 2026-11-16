const { z } = require("zod");

const registerDeviceApiSchema = z.object({
  body: z.object({
    hardwareId: z.string().min(3).max(64),
    fwVersion: z.string().max(20).optional().default("1.0.0"),
  }),
});

const pollQuerySchema = z.object({
  query: z.object({
    lastSeq: z.coerce.number().int().nonnegative().optional(),
    fw: z.string().optional(),
    rssi: z.coerce.number().optional(),
    bat: z.coerce.number().min(0).max(100).optional(),
    mode: z.enum(["pet", "content", "playlist", "unknown"]).optional(),
  }),
});

const ackDeviceApiSchema = z.object({
  body: z.object({
    acks: z
      .array(
        z.object({
          seq: z.number().int().positive(),
          status: z.enum(["ok", "error"]),
          error: z.string().optional(),
        })
      )
      .min(1),
  }),
});

const eventDeviceApiSchema = z.object({
  body: z.object({
    type: z.enum(["REACTION"]),
    reaction: z.enum(["heart", "smile"]),
    refSeq: z.number().int().positive(),
  }),
});

module.exports = {
  registerDeviceApiSchema,
  pollQuerySchema,
  ackDeviceApiSchema,
  eventDeviceApiSchema,
};

