const app = require("./app");
const { connectDb } = require("./config/db");
const { env } = require("./config/env");
const { startExpiryJob } = require("./jobs/expireCommands");

async function bootstrap() {
  try {
    console.log("Connecting to database...");
    await connectDb();
    console.log("Connected to MongoDB.");

    const stopExpiryJob = startExpiryJob(60000);

    const server = app.listen(env.PORT, () => {
      console.log(`PocketPet API server running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
    });

    const shutdown = async () => {
      console.log("Shutting down gracefully...");
      stopExpiryJob();
      server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

if (require.main === module) {
  bootstrap();
}

