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

// ✅ 1. Connect Database
connectDB()
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// ✅ 2. CORS Configuration (FIXED)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://food-share-ai.vercel.app",
  "http://localhost:3000"
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like curl/postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed"), false);
    }
  },
  credentials: true,
}));

// ✅ IMPORTANT: Handle preflight requests
app.options("*", cors());

// ✅ 3. Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ 4. Request Logger (VERY useful on Render)
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// ✅ 5. Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/ngos", ngoRoutes);
app.use("/api/ai", aiRoutes);

// ✅ 6. Health Check Route
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// ✅ 7. 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// ✅ 8. Global Error Handler
app.use((err, req, res, next) => {
  console.error("🚨 ERROR:", err.message);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// ✅ 9. Start Server (Render compatible)
const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});