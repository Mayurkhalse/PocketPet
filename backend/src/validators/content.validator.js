const { z } = require("zod");
const { validatePetText } = require("./textValidator");
const { validateBitmapB64 } = require("../utils/bitmap");

const createContentSchema = z.object({
  body: z
    .object({
      type: z.enum(["text", "bitmap"]),
      title: z.string().min(1).max(100),
      text: z.string().optional(),
      bitmapB64: z.string().optional(),
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

const updateContentSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    text: z.string().optional(),
    bitmapB64: z.string().optional(),
  }),
});

module.exports = {
  createContentSchema,
  updateContentSchema,
};

