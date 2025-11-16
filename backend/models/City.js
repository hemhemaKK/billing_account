const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  advanceYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdvanceYear', required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('City', citySchema);
