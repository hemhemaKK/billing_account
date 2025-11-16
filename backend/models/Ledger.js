const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true },
    flowerType: String,
    quantity: Number,
    price: Number,
    total: Number,
    description: String,
    date: { type: Date, default: Date.now },
    balanceAtThatTime: Number,
    sentMessage: {
        content: String,   // store last sent message
        sentAt: Date       // timestamp
    }
});

module.exports = mongoose.model("Ledger", ledgerSchema);
