const express = require("express");
const router = express.Router();

const {
    getAllLRData,
    addLRData,
    getLRData,
    editLRData,
    deleteLRData,
    assignLRToTrip   // 🔥 NEW
} = require("../controllers/LR_Controller.js");

// ✅ BASIC CRUD
router.get("/", getAllLRData);
router.post("/", addLRData);
router.get("/:id", getLRData);
router.put("/:id", editLRData);
router.delete("/:id", deleteLRData);

// 🔥 NEW ROUTES (IMPORTANT)

// Assign LR to Trip
router.post("/assign-trip", assignLRToTrip);

// OPTIONAL (recommended)
// Get only unassigned LRs (useful in UI dropdown)
router.get("/status/unassigned", async (req, res) => {
    const lr_data = require("../models/LR_Model");
    try {
        const data = await lr_data.find({ status: "UNASSIGNED" });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// OPTIONAL (assigned LRs)
router.get("/status/assigned", async (req, res) => {
    const lr_data = require("../models/LR_Model");
    try {
        const data = await lr_data.find({ status: "ASSIGNED" });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;