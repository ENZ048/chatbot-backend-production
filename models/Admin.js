const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  name: { type: String, default: "" },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Admin", AdminSchema);
