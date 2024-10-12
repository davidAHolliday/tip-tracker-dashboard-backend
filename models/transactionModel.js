const mongoose = require('mongoose')

//Define Schema

const transactionSchema = new mongoose.Schema({
    timeStamp: {
        type: Date,
        default: Date.now,   // Automatically sets to the current date and time
    },
    timeIn: {
        type: Date,
        required: true,      // Ensure timeIn is provided
    },
    timeOut: {
        type: Date,
        required: true,      // Ensure timeOut is provided
    },
    hoursWorked: {
        type: Number,
        required: true,      // Automatically calculated, so required
    },
    creditCardTips: {
        type: Number,
        required: true,      // Ensure credit card tips are provided
    },
    svcCharge: {
        type: Number,
        required: true,      // Ensure credit card tips are provided
    },
    tipOut: {
        type: Number,
        required: true,      // Ensure tip out is provided
    },
    holliday: {
        type: Boolean,
        default: false,      // Default to false if not a holiday
    }
});




const Transaction = mongoose.model('Transaction',transactionSchema)
module.exports = Transaction;