const mongoose = require("mongoose");

const VerifiedUserSchema = new mongoose.Schema({
  chatbot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Chatbot", required: true },
  email: { type: String, required: true },
  session_id: { type: String },
  verified_at: { type: Date, default: Date.now }
});

VerifiedUserSchema.index({ chatbot_id: 1 });

module.exports = mongoose.model("VerifiedUser", VerifiedUserSchema);
