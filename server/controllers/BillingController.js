const Billing = require("../models/BillingModel");
const Trip = require("../models/TripDataModel"); // Ensure this path is correct

// ================= GET ALL =================
exports.getAllbillData = async (req, res) => {
    try {
        const billingData = await Billing.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: billingData });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

// ================= GET ONE =================
exports.getEachBillData = async (req, res) => {
    try {
        const { id } = req.params;
        const eachBill = await Billing.findById(id);
        if (!eachBill) {
            return res.status(404).json({ success: false, msg: "Bill not found" });
        }
        res.status(200).json({ success: true, data: eachBill });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

// ================= CREATE (TRIP BASED) =================
// ================= CREATE (TRIP BASED) =================
exports.createNewBill = async (req, res) => {
    try {
        const { tripIds, date, partyName } = req.body;

        const trips = await Trip.find({ _id: { $in: tripIds } }).populate("lr_ids");

        if (!trips || trips.length === 0) {
            return res.status(400).json({ success: false, msg: "No Trips selected" });
        }

        // 🔥 AUTO INCREMENT BILL NUMBER (01, 02, 03...)
        const lastBill = await Billing.findOne().sort({ createdAt: -1 });

        let nextNumber = 1;

        if (lastBill && lastBill.billingID) {
            const lastNumber = parseInt(lastBill.billingID);
            nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;
        }

        // ✅ FORMAT: 01, 02, 03...
        const formattedBillID = String(nextNumber).padStart(2, "0");


        // ✅ FUNCTION TO CALCULATE LR WEIGHT
        const calculateTripWeight = (trip) => {
            return (trip.lr_ids || []).reduce((sum, lr) => {
                const cleaned = String(lr.weight_actual || "").replace(/[^\d.]/g, "");
                return sum + (parseFloat(cleaned) || 0);
            }, 0);
        };

        const tripListData = trips.map(trip => {
            const lrNos = trip.lr_ids?.map(lr => lr.lr_no).join(", ") || "-";
            const sdNos = trip.lr_ids?.map(lr => lr.shipment_document_no).join(", ") || "-";
            const vehicles = [...new Set(trip.lr_ids?.map(lr => lr.truck_number))].join(", ") || "-";
            const destinations = [...new Set(trip.lr_ids?.map(lr => lr.to))].join(" / ") || "-";

            const weight = calculateTripWeight(trip);

            const rate = 0;              // ✅ FIX
            const extraWeight = 0;
            const detention = 0;         // ✅ FIX

            const total = rate + extraWeight + detention;

            return {
                tripId: trip._id,
                date: trip.unloading_date || new Date(),
                lr_no: lrNos,
                sd_no: sdNos,
                vehicleNO: vehicles,
                destination: destinations,
                unloadingdate: trip.unloading_date || "",
                weight: weight.toString(),
                rate: rate.toString(),
                extraWeight: extraWeight.toString(),
                detention: detention.toString(),
                total: total.toFixed(2).toString(),
                edited: false
            };
        });

        const grandTotal = tripListData.reduce((sum, item) => sum + parseFloat(item.total), 0);

        const newBill = await Billing.create({
            billingID: formattedBillID, // ✅ FIXED HERE
            date: date || new Date(),
            partyName,
            tripList: tripListData,
            grandTotal: grandTotal.toFixed(2).toString()
        });

        await Trip.updateMany(
            { _id: { $in: tripIds } },
            { $set: { billing_status: "BILLED" } }
        );

        res.status(201).json({ success: true, data: newBill });

    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

// ================= UPDATE =================
exports.updateBills = async (req, res) => {
    try {
        const { id } = req.params;
        const { tripList, billingID, date, partyName } = req.body;

        // Recalculate each row's total and the grand total based on frontend edits
        const finalTripList = tripList.map(item => {
            const rate = parseFloat(item.rate || 0);
            const extra = parseFloat(item.extraWeight || 0);
            const det = parseFloat(item.detention || 0);

            const rowTotal = rate + extra + det;
            return {
                ...item,
                total: rowTotal.toFixed(2).toString(),
                edited: true
            };
        });

        const grandTotal = finalTripList.reduce((sum, item) => sum + parseFloat(item.total), 0);

        const updatedBill = await Billing.findByIdAndUpdate(
            id,
            { 
                tripList: finalTripList, 
                billingID, 
                date, 
                partyName,
                grandTotal: grandTotal.toFixed(2).toString() 
            },
            { new: true }
        );

        res.status(200).json({ success: true, data: updatedBill });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

// ================= DELETE =================
exports.deletebill = async (req, res) => {
    try {
        const { id } = req.params;
        const bill = await Billing.findById(id);

        if (!bill) {
            return res.status(404).json({ success: false, msg: "Bill not found" });
        }

        // 🔥 OPTIONAL: Reset trips to NOT_BILLED if the bill is deleted
        const tripIds = bill.tripList.map(t => t.tripId);
        await Trip.updateMany(
            { _id: { $in: tripIds } },
            { $set: { billing_status: "NOT_BILLED" } }
        );

        await Billing.findByIdAndDelete(id);
        res.status(200).json({ success: true, msg: "Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};