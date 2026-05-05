const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Billing = new Schema({

    billingID: { type: String, required: true },
    date: { type: Date, required: true },

    partyName: { type: String }, // optional (like Kansai Nerolac)

    // 🔥 TRIP SNAPSHOT DATA
    // Most of these values come from the Trip Data backend but remain editable here
    tripList: [
        {
            tripId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "trip_data" // Reference to your Trip model
            },

            date: Date,                  // Trip unloading_date or current date
            lr_no: String,               // Combined LR numbers from the trip
            sd_no: String,               // Shipment document numbers
            vehicleNO: String,           // Truck number from trip
            destination: String,         // Route/Destination from trip
            unloadingdate: String,       // Manual/Trip unloading date

            // 💰 FINANCIALS (Kept as Strings for editability)
            weight: String,              // Weight from trip/LRs
            rate: String,                // Manual entry or base rate
            extraWeight: String,         // Additional charges
            detention: String,           // From trip detaintion field
            total: String,               // Total for this specific trip row

            edited: {
                type: Boolean,
                default: false
            }
        }
    ],

    grandTotal: {
        type: String
    }

}, { timestamps: true });

module.exports = mongoose.model("Billing", Billing);