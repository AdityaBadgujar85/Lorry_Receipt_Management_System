const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Expense = new Schema({
    date: {
        type: Date,
        required: true
    },
    description:{
        type: String,
        required: true,
    },
    amount:{
        type: String,
        required: true,
    },
    uploadReceipt:{
        type: String,
        required:false,
    }
}, { timestamps: true })

module.exports = mongoose.model("Expense", Expense);