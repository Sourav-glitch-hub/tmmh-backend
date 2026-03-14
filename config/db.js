// ============================================================
// config/db.js
// MongoDB connection using Mongoose
// ============================================================

const mongoose = require("mongoose");

/**
 * Connect to MongoDB
 * Exits the process if connection fails (critical startup failure)
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 8+ has these enabled by default, but explicit is better
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
    });

    console.log(
      `✅ MongoDB Connected: ${conn.connection.host} | DB: ${conn.connection.name}`
    );

    // Graceful shutdown on app termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🔌 MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure code
  }
};

module.exports = connectDB;