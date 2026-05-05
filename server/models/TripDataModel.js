const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tripDataSchema = new Schema({
  // 🔗 RELATIONSHIP
  // Array of IDs to link multiple LRs to this single Trip
  lr_ids: [{
    type: Schema.Types.ObjectId,
    ref: "lr_data", 
    required: true,
  }],

  // 📅 LOGISTICS
  unloading_date: {
    type: String, // Kept as string for frontend-side date handling
    required: true,
  },

  broker: {
    type: String,
    required: true,
    trim: true,
  },

  // 💰 FINANCIALS (All Strings as requested)
  freight: {
    type: String,
    required: true,
    trim: true,
  },

  advance: {
    type: String,
    required: true,
    trim: true,
  },

  diesel: {
    type: String,
    required: true,
    trim: true,
  },

  driver_allowance: {
    type: String,
    required: true,
    trim: true,
  },

  check_neft_advance: {
    type: String,
    required: true,
    trim: true,
  },

  balance: {
    type: String,
    required: true,
    trim: true,
  },

  unloading_amt: {
    type: String,
    required: true,
    trim: true,
  },

  detaintion: {
    type: String,
    required: true,
    trim: true,
  },

  total_balance: {
    type: String,
    required: true,
    trim: true,
  },

  check_neft_balance: {
    type: String,
    required: true,
    trim: true,
  },

  // 🚦 STATUSES
  payment_status: {
    type: String,
    required: true,
    enum: ["PENDING", "PARTIAL", "COMPLETED"],
    default: "PENDING",
  },

  billing_status: {
    type: String,
    enum: ["NOT_BILLED", "BILLED"],
    default: "NOT_BILLED",
  },

  // 📝 REMARKS & FILES
  lr_remark: {
    type: String,
    required: true,
    trim: true,
  },

  scanned_lr: {
    type: String,
    required: true,
    trim: true,
  },

}, {
  timestamps: true, // Still useful for "Created At" sorting in your table
});

module.exports = mongoose.model("trip_data", tripDataSchema);