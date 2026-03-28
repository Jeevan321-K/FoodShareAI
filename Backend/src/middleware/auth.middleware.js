import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // 1. Check for the Bearer token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Attach user to request (excluding password)
      req.user = await User.findById(decoded.id).select("-password");
      
      // 4. Move to next middleware and EXIT this function
      return next(); 
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // 5. If no token was found at all
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};