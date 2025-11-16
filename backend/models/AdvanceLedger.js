const mongoose = require('mongoose');

const advanceledgerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdvanceUser', required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true },
    description: String,
    date: { type: Date, default: Date.now },
    balanceAtThatTime: Number,
    sentMessage: {
        content: String,   // store last sent message
        sentAt: Date       // timestamp
    }
});

module.exports = mongoose.model("AdvanceLedger", advanceledgerSchema);
