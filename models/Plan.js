const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration_days: { type: Number, required: true },
  max_users: { type: Number, required: true },
  price: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Plan", PlanSchema);
