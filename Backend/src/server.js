import "./config/env.js";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import userRoutes from "./routes/user.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import authRoutes from "./routes/auth.routes.js";
import foodRoutes from "./routes/food.routes.js";
import ngoRoutes from "./routes/ngo.routes.js";
import aiRoutes from "./routes/ai.routes.js";

const app = express();

// DB connect
connectDB()
  .then(() => {
    console.log("✅ MongoDB Connection Handshake Successful");
  })
  .catch((err) => {
    console.error("❌ MongoDB Initial Connection Failed:", err.message);
  });

// Allowed origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://food-share-ai.vercel.app",
  "http://localhost:3000",
].filter(Boolean);

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server, curl, postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Optional manual preflight handler
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] 📥 ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/ngos", ngoRoutes);
app.use("/api/ai", aiRoutes);

// Health route
app.get("/", (req, res) => {
  res.send("API running 🚀 - Connection Healthy");
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found on server",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🚨 BACKEND ERROR:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT} 🔥`);
});