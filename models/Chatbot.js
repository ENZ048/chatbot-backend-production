const mongoose = require("mongoose");

const ChatbotSchema = new mongoose.Schema({
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  name: { type: String },
  company_name: { type: String, required: true },
  company_url: { type: String, required: true, unique: true },
  token_limit: { type: Number, default: 10000000 },
  used_tokens: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },

  config: {
    demo_link: String,
    demo_message: String,
    demo_keywords: [String],
    custom_intro: String,
    fallback_message: String,
    default_suggestions: [String],
    created_at: { type: Date, default: Date.now }
  }
});

module.exports = mongoose.model("Chatbot", ChatbotSchema);
