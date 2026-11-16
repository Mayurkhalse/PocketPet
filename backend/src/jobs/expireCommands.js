const Command = require("../models/Command");

async function expireCommands() {
  try {
    const now = new Date();
    const result = await Command.updateMany(
      {
        status: { $in: ["pending", "delivered"] },
        expiresAt: { $lt: now },
      },
      {
        $set: { status: "expired" },
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Job] Expired ${result.modifiedCount} stale commands.`);
    }
  } catch (err) {
    console.error("[Job] Error expiring commands:", err);
  }
}

function startExpiryJob(intervalMs = 60000) {
  const timer = setInterval(expireCommands, intervalMs);
  return () => clearInterval(timer);
}

module.exports = {
  expireCommands,
  startExpiryJob,
};

