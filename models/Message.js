const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatbot_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chatbot",
    required: true,
  },
  session_id: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    enum: ["user", "bot"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  token_count: {
    type: Number,
    default: 0, // optional — useful for tracking token usage
  },
});

module.exports = mongoose.model("Message", messageSchema);
