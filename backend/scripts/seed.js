const bcrypt = require("bcryptjs");
const { connectDb, disconnectDb } = require("../src/config/db");
const User = require("../src/models/User");

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await connectDb();

    const email = "demo@pocketpet.dev";
    const password = "password123";
    const displayName = "Demo Owner";

    let user = await User.findOne({ email });
    if (!user) {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);
      user = await User.create({ email, passwordHash, displayName });
      console.log("✅ Seed user created successfully!");
    } else {
      const salt = await bcrypt.genSalt(12);
      user.passwordHash = await bcrypt.hash(password, salt);
      user.displayName = displayName;
      await user.save();
      console.log("✅ Seed user password updated successfully!");
    }

    console.log("\n📋 Demo Login Credentials:");
    console.log("-----------------------------------------");
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log("-----------------------------------------\n");

    await disconnectDb();
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to seed database:", err.message);
    if (err.message.includes("ECONNREFUSED")) {
      console.error("\n💡 Make sure MongoDB is running locally, or configure MONGODB_URI in backend/.env with your MongoDB Atlas connection string.");
    }
    process.exit(1);
  }
}

seed();

