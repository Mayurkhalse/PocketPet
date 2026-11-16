const { z } = require("zod");
const { validatePetText } = require("./textValidator");
const { validateBitmapB64 } = require("../utils/bitmap");

const claimDeviceSchema = z.object({
  body: z.object({
    code: z.string().length(6, "Pairing code must be 6 digits"),
    name: z.string().min(1).max(50).optional(),
  }),
});

const updateDeviceSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    settings: z
      .object({
        pollIntervalSec: z.number().int().min(5).max(60).optional(),
        brightness: z.number().int().min(0).max(255).optional(),
        petSkin: z.string().optional(),
        timezone: z.string().optional(),
      })
      .optional(),
  }),
});

const sendContentSchema = z.object({
  body: z
    .object({
      type: z.enum(["text", "bitmap"]),
      text: z.string().optional(),
      bitmapB64: z.string().optional(),
      durationSec: z.number().int().min(1).max(600).default(30),
      expiresInSec: z.number().int().min(10).max(86400).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.type === "text") {
        if (!data.text) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Text is required when type is text",
            path: ["text"],
          });
        } else {
          try {
            validatePetText(data.text);
          } catch (err) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: err.message,
              path: ["text"],
            });
          }
        }
      } else if (data.type === "bitmap") {
        if (!data.bitmapB64) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "bitmapB64 is required when type is bitmap",
            path: ["bitmapB64"],
          });
        } else {
          try {
            validateBitmapB64(data.bitmapB64);
          } catch (err) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: err.message,
              path: ["bitmapB64"],
            });
          }
        }
      }
    }),
});

const sendPlaylistSchema = z.object({
  body: z
    .object({
      playlistId: z.string().optional(),
      repeat: z.boolean().optional(),
      items: z
        .array(
          z.object({
            type: z.enum(["text", "bitmap"]),
            text: z.string().optional(),
            bitmapB64: z.string().optional(),
            durationSec: z.number().int().min(1).max(600).default(5),
          })
        )
        .max(20)
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.playlistId && (!data.items || data.items.length === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Either playlistId or items array is required",
          path: ["items"],
        });
      }
      if (data.items) {
        data.items.forEach((item, idx) => {
          if (item.type === "text") {
            if (!item.text) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Item ${idx} requires text`,
                path: ["items", idx, "text"],
              });
            } else {
              try {
                validatePetText(item.text);
              } catch (e) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `Item ${idx}: ${e.message}`,
                  path: ["items", idx, "text"],
                });
              }
            }
          } else if (item.type === "bitmap") {
            if (!item.bitmapB64) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Item ${idx} requires bitmapB64`,
                path: ["items", idx, "bitmapB64"],
              });
            } else {
              try {
                validateBitmapB64(item.bitmapB64);
              } catch (e) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `Item ${idx}: ${e.message}`,
                  path: ["items", idx, "bitmapB64"],
                });
              }
            }
          }
        });
      }
    }),
});

const acceptInviteSchema = z.object({
  body: z.object({
    code: z.string().length(8, "Invite code must be 8 characters"),
  }),
});

const markEventsReadSchema = z.object({
  body: z.object({
    ids: z.array(z.string()).min(1),
  }),
});

module.exports = {
  claimDeviceSchema,
  updateDeviceSchema,
  sendContentSchema,
  sendPlaylistSchema,
  acceptInviteSchema,
  markEventsReadSchema,
};

