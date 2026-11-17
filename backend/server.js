
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const db = require("./db");

const app = express();

// ===================================
// CREATE UPLOADS FOLDER
// ===================================

const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// ===================================
// CORS CONFIGURATION
// DEVELOPMENT MODE
// ===================================

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ===================================
// MIDDLEWARE
// ===================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use("/uploads", express.static(uploadsPath));

// ===================================
// HOME ROUTE
// ===================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart CropCare Backend is running!",
    database: "Smart CropCare",
  });
});

// ===================================
// DATABASE HEALTH CHECK
// ===================================

app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");

    res.status(200).json({
      success: true,
      message: "Backend and MySQL are connected!",
      database: "connected",
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(503).json({
      success: false,
      message: "Database connection failed.",
      database: "disconnected",
    });
  }
});

// ===================================
// API ROUTES
// ===================================

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/crops", require("./routes/cropRoutes"));

app.use("/api/history", require("./routes/historyRoutes"));

// ===================================
// 404 NOT FOUND
// ===================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ===================================
// GLOBAL ERROR HANDLER
// ===================================

app.use((error, req, res, next) => {
  console.error("SERVER ERROR:", error);

  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body.",
    });
  }

  res.status(500).json({
    success: false,
    message: error.message || "Internal server error.",
  });
});

// ===================================
// START SERVER
// ===================================

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await db.query("SELECT 1");

    console.log("-----------------------------------");
    console.log("MySQL connected successfully!");
    console.log("Database: smart_cropcare_db");
    console.log("-----------------------------------");

    app.listen(PORT, () => {
      console.log("-----------------------------------");
      console.log("SMART CROPCARE BACKEND RUNNING");
      console.log(`Backend: http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
      console.log("Auth: /api/auth");
      console.log("Crops: /api/crops");
      console.log("History: /api/history");
      console.log("AI: POST /api/crops/detect");
      console.log("-----------------------------------");
    });

  } catch (error) {
    console.error("BACKEND STARTUP FAILED!");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
