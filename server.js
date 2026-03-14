// ============================================================
// server.js
// Application entry point — bootstraps Express + MongoDB
// ============================================================

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const dotenv = require("dotenv");
// const dns = require("dns");
//  // Use Google and Cloudflare DNS for better reliability

//  // Change DNS
// dns.setServers(["1.1.1.1", "8.8.8.8"]);

// ── Load environment variables FIRST ────────────────────────────────────────
dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const repairRoutes = require("./routes/repairRoutes");
const productRoutes = require("./routes/productRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// ── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ── Initialize Express app ───────────────────────────────────────────────────
const app = express();

// ============================================================
// GLOBAL MIDDLEWARE
// ============================================================

// ── HTTP request logger ──────────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // Colorized, concise dev logging
} else {
  app.use(morgan("combined")); // Standard Apache-style production logs
}

// ── CORS configuration ───────────────────────────────────────────────────────
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);

    // In development, allow all origins
    if (process.env.NODE_ENV === "development" || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin '${origin}' is not allowed.`));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// ── Parse JSON and URL-encoded bodies ───────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Serve uploaded images as static files ────────────────────────────────────
// Accessible at: /uploads/repairs/<filename>  and  /uploads/products/<filename>
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ============================================================
// API ROUTES
// ============================================================

app.use("/api/auth", authRoutes);
app.use("/api/repairs", repairRoutes);
app.use("/api/products", productRoutes);

// ── Health check endpoint ────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running.",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Root endpoint ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Mobile Servicing Shop API",
    version: "1.0.0",
    docs: "/api/health",
  });
});

// ============================================================
// ERROR HANDLING (must be last)
// ============================================================

app.use(notFound);    // 404 handler for undefined routes
app.use(errorHandler); // Global error handler

// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `\n🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
  console.log(`   Local: http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

// ── Handle unhandled promise rejections ──────────────────────────────────────
process.on("unhandledRejection", (err) => {
  console.error("💥 UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

// ── Handle uncaught exceptions ───────────────────────────────────────────────
process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

module.exports = app; // Export for testing