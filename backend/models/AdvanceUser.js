const mongoose = require('mongoose');

const advanceuserSchema = new mongoose.Schema({
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: "Year", required: true },
  name: { type: String, required: true },
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AdvanceUser", advanceuserSchema);
