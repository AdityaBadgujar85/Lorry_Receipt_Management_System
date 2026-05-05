const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

// Import Controllers
const {
  getAllTripData,
  addTripData,
  getTrip,
  editTripData,
  deleteTripData,
} = require("../controllers/TripDataController");

// Import Model for inline status queries
const trip_data = require("../models/TripDataModel");

// ==========================================
// 🔥 STATUS ROUTES (KEEP ABOVE :id)
// ==========================================

/**
 * @route   GET /status/not-billed
 * @desc    Fetch trips that have not been billed yet (includes LR details)
 */
router.get("/status/not-billed", async (req, res) => {
  try {
    const data = await trip_data.find({ billing_status: "NOT_BILLED" })
      .populate("lr_ids")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/**
 * @route   GET /status/billed
 * @desc    Fetch trips that are already billed (includes LR details)
 */
router.get("/status/billed", async (req, res) => {
  try {
    const data = await trip_data.find({ billing_status: "BILLED" })
      .populate("lr_ids")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ==========================================
// ✅ STANDARD CRUD ROUTES
// ==========================================

// GET ALL TRIPS
router.get("/", getAllTripData);

// GET SINGLE TRIP (BY ID)
router.get("/:id", getTrip);

// CREATE NEW TRIP
// Note: handle multiple LR IDs by sending an array in req.body.lr_ids
router.post("/", upload.single("scanned_lr"), addTripData);

// UPDATE EXISTING TRIP
router.put("/:id", upload.single("scanned_lr"), editTripData);

// DELETE TRIP
router.delete("/:id", deleteTripData);

module.exports = router;