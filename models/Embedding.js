const mongoose = require("mongoose");

const embeddingChunkSchema = new mongoose.Schema({
  chatbot_id: { type: mongoose.Schema.Types.ObjectId, ref: "Chatbot" },
  content: { type: String, required: true },
  embedding: { type: [Number], required: true }, // OpenAI vector
}, { timestamps: true });

embeddingChunkSchema.index({ embedding: "cosmos" }); // Enable vector search

module.exports = mongoose.model("EmbeddingChunk", embeddingChunkSchema);
