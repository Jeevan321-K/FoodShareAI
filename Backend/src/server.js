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


// 1. Connect Database
const app = express();

// 1. Connect Database
connectDB().then(() => {
    console.log("✅ MongoDB Connection Handshake Successful");
}).catch(err => {
    console.error("❌ MongoDB Initial Connection Failed:", err.message);
});

// 2. Middleware - CLEANED & FIXED
const allowedOrigins = [
  process.env.FRONTEND_URL,              // https://food-share-ai.vercel.app
  "https://food-share-ai.vercel.app",    // Hardcoded fallback
  "http://localhost:3000"                // Local development
].filter(Boolean);                       // Removes undefined values

app.use(cors({
  origin: function (origin, callback) {
    // 🕵️‍♂️ DEBUG LOG: Check this in Render Logs to see the EXACT string being sent
    console.log("Incoming Request Origin:", origin); 

    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`CORS Fail! Origin ${origin} is NOT in allowed list:`, allowedOrigins);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// MUST come after CORS but before Routes
app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 🚀 Request Logger (Uncomment for easier debugging on Render)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] 📥 ${req.method} ${req.url}`);
  next();
});

// 3. Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/ngos", ngoRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("API running 🚀 - Connection Healthy");
});

// 4. Fallback for 404s
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found on server" });
});

// 5. Global Error Handler
app.use((err, req, res, next) => {
  console.error("🚨 BACKEND ERROR:", err.message);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 6. Port Handling
// Render uses process.env.PORT (usually 10000), default to 4000 locally
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running on port ${PORT} 🔥`);
});