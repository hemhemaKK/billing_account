const mongoose = require('mongoose');

const yearSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Year", yearSchema);
