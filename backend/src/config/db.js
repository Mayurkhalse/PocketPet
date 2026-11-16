const mongoose = require("mongoose");
const { env } = require("./env");

async function connectDb(uri) {
  const connectionUri = uri || env.MONGODB_URI;
  await mongoose.connect(connectionUri);
  return mongoose.connection;
}

async function disconnectDb() {
  await mongoose.disconnect();
}

module.exports = {
  connectDb,
  disconnectDb,
};

