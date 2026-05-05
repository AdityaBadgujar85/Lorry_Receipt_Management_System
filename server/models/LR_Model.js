const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const lr_data = new Schema({
    e_waybill_no: {
        type: String,
        required: true,
        trim: true
    },

    e_waybill_exp_date: {
        type: Date,
        required: true,
    },

    lr_no: {
        type: String,
        required: true,
        unique: true,   
        trim: true
    },

    lr_date: {
        type: Date,
        required: true,
    },

    from: {
        type: String,
        required: true,
        trim: true
    },

    to: {
        type: String,
        required: true,
        trim: true
    },

    consignor_ms: {
        type: String,
        required: true,
        trim: true
    },

    consignor_GST: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },

    consignee_ms: {
        type: String,
        required: true,
        trim: true
    },

    consignee_GST: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },

    goods: [
        {
            description: {
                type: String,
                required: true,
                trim: true
            },
            no_of_article: {
                type: String,
                required: true,
            }
        }
    ],

    weight_actual: {
        type: String,
        required: true,
    },

    weight_charged: {
        type: String,
        required: true,
    },

    invoice_number: {
        type: String,
        required: true,
        trim: true
    },

    truck_number: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },

    shipment_document_no: {
        type: String,
        required: true,
        trim: true
    },

    shipment_cost: {
        type: String,
        required: true,
    },

    declare_value: {
        type: String,
        required: true,
    },

    trip_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "trip_data",
        default: null
    },

    status: {
        type: String,
        enum: ["UNASSIGNED", "ASSIGNED", "BILLED"],
        default: "UNASSIGNED"
    }

}, { timestamps: true });

module.exports = mongoose.model("lr_data", lr_data);