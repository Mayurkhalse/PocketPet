const { z } = require("zod");
const { validatePetText } = require("./textValidator");
const { validateBitmapB64 } = require("../utils/bitmap");

const playlistItemSchema = z
  .object({
    type: z.enum(["text", "bitmap"]),
    text: z.string().optional(),
    bitmapB64: z.string().optional(),
    durationSec: z.number().int().min(1).max(600).default(5),
  })
  .superRefine((item, ctx) => {
    if (item.type === "text") {
      if (!item.text) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Text is required when type is text",
          path: ["text"],
        });
      } else {
        try {
          validatePetText(item.text);
        } catch (e) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: e.message,
            path: ["text"],
          });
        }
      }
    } else if (item.type === "bitmap") {
      if (!item.bitmapB64) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "bitmapB64 is required when type is bitmap",
          path: ["bitmapB64"],
        });
      } else {
        try {
          validateBitmapB64(item.bitmapB64);
        } catch (e) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: e.message,
            path: ["bitmapB64"],
          });
        }
      }
    }
  });

const createPlaylistSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    repeat: z.boolean().default(false),
    items: z.array(playlistItemSchema).max(20).default([]),
  }),
});

const updatePlaylistSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    repeat: z.boolean().optional(),
    items: z.array(playlistItemSchema).max(20).optional(),
  }),
});

module.exports = {
  createPlaylistSchema,
  updatePlaylistSchema,
};

