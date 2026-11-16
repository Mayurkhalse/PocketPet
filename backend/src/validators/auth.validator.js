const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    displayName: z.string().min(1).max(50),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1, "Password is required"),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};

