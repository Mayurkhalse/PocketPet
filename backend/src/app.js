const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const pinoHttp = require("pino-http");
const pino = require("pino");

const { env } = require("./config/env");
const requestId = require("./middleware/requestId");
const errorHandler = require("./middleware/errorHandler");
const { globalLimiter } = require("./middleware/rateLimit");
const apiRouter = require("./routes/index");

const app = express();

const logger = pino({
  level: env.NODE_ENV === "test" ? "silent" : "info",
});

// Middleware pipeline
app.use(requestId);
app.use(pinoHttp({ logger, autoLogging: env.NODE_ENV !== "test" }));
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  env.FRONTEND_ORIGIN,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or device hardware)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        env.NODE_ENV === "development"
      ) {
        return callback(null, true);
      }
      return callback(new Error("CORS not allowed for this origin"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "64kb" }));
app.use(globalLimiter);

// Liveness & Readiness checks
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/readyz", (req, res) => {
  const isDbReady = mongoose.connection.readyState === 1;
  if (isDbReady) {
    return res.status(200).json({ status: "ready", db: "connected" });
  }
  return res.status(503).json({ status: "unready", db: "disconnected" });
});

// API Routes
app.use("/api/v1", apiRouter);

// Global error handler
app.use(errorHandler);

module.exports = app;

