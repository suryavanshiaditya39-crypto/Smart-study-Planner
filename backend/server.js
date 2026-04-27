// server.js
// ─────────────────────────────────────────────
// Main Express server for Smart Study Planner
// ─────────────────────────────────────────────

// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Import task routes
const taskRoutes = require("./routes/tasks");

// ── Create Express app ──
const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────

// Enable CORS so the frontend (on a different port) can talk to this server
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Serve static frontend files from the /frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// ─────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────

// Mount all task-related routes under /tasks
app.use("/tasks", taskRoutes);

// Catch-all: serve the frontend for any non-API route
// (useful when the user refreshes the page)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

// ─────────────────────────────────────────────
// CONNECT TO MONGODB, THEN START SERVER
// ─────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅  Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀  Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1); // Exit if DB connection fails — no point running without a DB
  });
