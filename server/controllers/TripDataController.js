const trip_data = require("../models/TripDataModel");
const lr_data = require("../models/LR_Model");
const fs = require("fs");
const path = require("path");

// ==========================================
// 🔧 HELPERS
// ==========================================

// Normalize lr_ids (FormData safe)
const normalizeLrIds = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (raw) return [raw];
  return [];
};

// Safe file delete (FIXED PATH)
const deleteFileIfExists = (fileName) => {
  try {
    const filePath = path.join(__dirname, "../uploads/tripdata", fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("File delete error:", err);
  }
};

// ==========================================
// ✅ GET ALL TRIPS
// ==========================================
exports.getAllTripData = async (req, res) => {
  try {
    const trips = await trip_data
      .find()
      .populate("lr_ids")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: trips,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// ✅ CREATE TRIP
// ==========================================
exports.addTripData = async (req, res) => {
  try {
    const { lr_ids: rawLrIds, ...tripFields } = req.body;
    const lr_ids = normalizeLrIds(rawLrIds);

    const dataToSave = {
      ...tripFields,
      lr_ids,
    };

    // Save uploaded file
    if (req.file?.filename) {
      dataToSave.scanned_lr = req.file.filename;
    }

    const tripData = await trip_data.create(dataToSave);

    // Assign LRs to trip
    if (lr_ids.length > 0) {
      await lr_data.updateMany(
        { _id: { $in: lr_ids } },
        {
          $set: {
            trip_id: tripData._id,
            status: "ASSIGNED",
          },
        }
      );
    }

    res.status(201).json({
      success: true,
      data: tripData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// ✅ GET SINGLE TRIP
// ==========================================
exports.getTrip = async (req, res) => {
  try {
    const trip = await trip_data
      .findById(req.params.id)
      .populate("lr_ids");

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// ✅ EDIT TRIP
// ==========================================
exports.editTripData = async (req, res) => {
  try {
    const { id } = req.params;
    const { lr_ids: rawLrIds, ...updateFields } = req.body;
    const lr_ids = normalizeLrIds(rawLrIds);

    const trip = await trip_data.findById(id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (trip.billing_status === "BILLED") {
      return res.status(400).json({
        success: false,
        message: "Cannot edit billed trip",
      });
    }

    const dataToUpdate = {
      ...updateFields,
      lr_ids,
    };

    // Handle file update
    if (req.file?.filename) {
      if (trip.scanned_lr) {
        deleteFileIfExists(trip.scanned_lr);
      }
      dataToUpdate.scanned_lr = req.file.filename;
    }

    const updatedTrip = await trip_data.findByIdAndUpdate(id, dataToUpdate, {
      new: true,
    });

    // Reset old LRs
    await lr_data.updateMany(
      { trip_id: id },
      { $set: { trip_id: null, status: "UNASSIGNED" } }
    );

    // Assign new LRs
    if (lr_ids.length > 0) {
      await lr_data.updateMany(
        { _id: { $in: lr_ids } },
        { $set: { trip_id: id, status: "ASSIGNED" } }
      );
    }

    res.status(200).json({
      success: true,
      data: updatedTrip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// ✅ DELETE TRIP
// ==========================================
exports.deleteTripData = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await trip_data.findById(id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (trip.billing_status === "BILLED") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete billed trip",
      });
    }

    // Delete file
    if (trip.scanned_lr) {
      deleteFileIfExists(trip.scanned_lr);
    }

    // Reset LRs
    await lr_data.updateMany(
      { trip_id: id },
      { $set: { trip_id: null, status: "UNASSIGNED" } }
    );

    await trip.deleteOne();

    res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};