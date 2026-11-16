const dotenv = require("dotenv");
const { z } = require("zod");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(8080),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/pocketpet"),
  JWT_SECRET: z.string().min(16).default("super-secret-development-jwt-key-replace-in-production"),
  JWT_TTL: z.string().default("30d"),
  FRONTEND_ORIGIN: z.string().default("http://localhost:5173"),
  DEVICE_POLL_DEFAULT_SEC: z.coerce.number().default(8),
  PAIRING_CODE_TTL_MIN: z.coerce.number().default(10),
  COMMAND_TTL_MIN: z.coerce.number().default(60),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

module.exports = {
  env: parsed.data,
};

