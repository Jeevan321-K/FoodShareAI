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

// 1. Connect Database with Error Tracking
connectDB().then(() => {
    console.log("✅ MongoDB Connection Handshake Successful");
}).catch(err => {
    console.error("❌ MongoDB Initial Connection Failed:", err.message);
});

// 2. Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 🚀 STAGE 1 DEBUG: Request Logger
// If you click "Submit" and don't see this in the terminal, the request isn't reaching the server.
// 🚀 STAGE 1 DEBUG: Request Logger (Fixed Version)
// app.use((req, res, next) => {
//   const timestamp = new Date().toLocaleTimeString();
//   console.log(`\n[${timestamp}] 📥 ${req.method} request to: ${req.url}`);
  
//   // 🟢 Safer check: Ensure req.body exists before checking keys
//   if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
//     console.log("📦 Payload detected in body");
//   }
//   next();
// });

// 3. Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/ngos", ngoRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("API running 🚀");
});

// 4. Final Fallback for 404s (Missing Routes)
app.use((req, res) => {
  console.log(`⚠️ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: "Route not found on server" });
});

// 5. 🟢 STAGE 2 DEBUG: Deep Global Error Handler
// This catches "undefined" errors and prints the EXACT line number.
app.use((err, req, res, next) => {
  console.error("\n" + "=".repeat(50));
  console.error("🚨 BACKEND CRASH DETECTED 🚨");
  console.error(`ERROR TYPE: ${err.name || "Unknown Error"}`);
  console.error(`MESSAGE:    ${err.message || "No message provided"}`);
  console.error(`PATH:       ${req.method} ${req.url}`);
  
  if (err.stack) {
    console.error("\n🔍 STACK TRACE (Look for the first 'at' line with your filenames):");
    console.error(err.stack);
  } else {
    console.error("No stack trace available for this error.");
  }
  console.error("=".repeat(50) + "\n");

  res.status(500).json({
    success: false,
    message: "Internal Server Error - Check Backend Terminal",
    errorType: err.name,
    errorMessage: err.message,
    // Stack is only sent to frontend in development to prevent map reuse crashes
    stack: process.env.NODE_ENV === 'development' ? err.stack : "Hidden in Production"
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT} 🔥`);
  console.log(`📡 Listening for frontend at: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
});