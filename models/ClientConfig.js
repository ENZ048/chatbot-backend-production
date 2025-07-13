// models/ClientConfig.js
const mongoose = require("mongoose");

const clientConfigSchema = new mongoose.Schema(
  {
    chatbot_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chatbot",
      required: true,
      unique: true,
    },
    demo_link: { type: String },
    demo_message: { type: String },
    demo_keywords: [String],
    default_suggestions: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClientConfig", clientConfigSchema);
