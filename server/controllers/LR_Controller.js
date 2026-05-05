const lr_data = require("../models/LR_Model");
const Billing = require("../models/BillingModel");

// ✅ GET ALL
exports.getAllLRData = async (req, res) => {
    try {
        const data = await lr_data
            .find()
            .populate("trip_id")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ✅ ADD LR (DEFAULT UNASSIGNED)
exports.addLRData = async (req, res) => {
    try {
        const count = await lr_data.countDocuments();
        const lr_no = count + 1;

        req.body.lr_no = lr_no;
        req.body.status = "UNASSIGNED"; // 🔥 important
        req.body.trip_id = null;

        const lrData = await lr_data.create(req.body);

        res.status(201).json({
            success: true,
            data: lrData,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ✅ GET SINGLE LR
exports.getLRData = async (req, res) => {
    try {
        const { id } = req.params;

        const lrdata = await lr_data.findById(id).populate("trip_id");

        res.status(200).json({
            success: true,
            data: lrdata
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ✅ EDIT LR (RESTRICT IF BILLED)
exports.editLRData = async (req, res) => {
    try {
        const { id } = req.params;

        const existingLR = await lr_data.findById(id);

        if (!existingLR) {
            return res.status(404).json({
                success: false,
                message: "LR not found"
            });
        }

        // ❌ Do not allow editing billed LR
        if (existingLR.status === "BILLED") {
            return res.status(400).json({
                success: false,
                message: "Cannot edit a billed LR"
            });
        }

        const updatedLR = await lr_data.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: updatedLR,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ✅ ASSIGN LR TO TRIP (🔥 NEW API)
exports.assignLRToTrip = async (req, res) => {
    try {
        const { lrId, tripId } = req.body;

        const lr = await lr_data.findById(lrId);

        if (!lr) {
            return res.status(404).json({
                success: false,
                message: "LR not found"
            });
        }

        // ❌ already assigned
        if (lr.trip_id) {
            return res.status(400).json({
                success: false,
                message: "LR already assigned to a trip"
            });
        }

        lr.trip_id = tripId;
        lr.status = "ASSIGNED";

        await lr.save();

        res.status(200).json({
            success: true,
            message: "LR assigned to trip successfully",
            data: lr
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ✅ DELETE LR (SAFE DELETE)
exports.deleteLRData = async (req, res) => {
    try {
        const { id } = req.params;

        const lr = await lr_data.findById(id);

        if (!lr) {
            return res.status(404).json({
                success: false,
                message: "LR not found"
            });
        }

        // ❌ Prevent deleting billed LR
        if (lr.status === "BILLED") {
            return res.status(400).json({
                success: false,
                message: "Cannot delete billed LR"
            });
        }

        // ❌ Prevent deleting assigned LR
        if (lr.status === "ASSIGNED") {
            return res.status(400).json({
                success: false,
                message: "Remove LR from trip before deleting"
            });
        }

        await lr_data.findByIdAndDelete(id);

        // cleanup billing (safety)
        await Billing.updateMany(
            { "lrList.lrId": id },
            { $pull: { lrList: { lrId: id } } }
        );

        res.status(200).json({
            success: true,
            message: "LR deleted successfully",
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};