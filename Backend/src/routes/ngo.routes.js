import express from "express";
import Ngo from "../models/Ngo.js";

const router = express.Router();

// ✅ ADD A NEW NGO (Registration)
// ✅ ADD A NEW NGO (Registration)
router.post("/register", async (req, res) => {
  try {
    const { name, lat, lng, category, capacity } = req.body;

    // Validation Safety Net
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
       return res.status(400).json({ success: false, message: "Valid Map Coordinates are required." });
    }

    const ngo = new Ngo({
      name,
      category,
      capacity,
      location: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)], // Longitude first!
      },
      verified: true // Auto-verify for hackathon testing
    });

    await ngo.save();
    res.status(201).json({ success: true, ngo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ GET ALL NGOs
router.get("/", async (req, res) => {
  try {
    const ngos = await Ngo.find().sort({ createdAt: -1 });
    res.json(ngos);
  } catch (err) {
    res.status(500).json({ message: "Error fetching NGOs" });
  }
});

// ✅ FIND NEARBY NGOs (For the Map)
router.get("/nearby", async (req, res) => {
  const { lat, lng, radius = 10000 } = req.query; // Default 10km

  try {
    const nearbyNgos = await Ngo.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius),
        },
      },
    });
    res.json(nearbyNgos);
  } catch (err) {
    res.status(500).json({ message: "Geospatial search failed", error: err.message });
  }
});

export default router;