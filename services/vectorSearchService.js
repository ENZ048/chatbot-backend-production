// const EmbeddingChunk = require("../models/Embedding");
// const { generateEmbedding } = require("./embeddingService");

// async function findSimilarChunks(query, chatbotId, topK = 5) {
//   const queryEmbedding = await generateEmbedding(query);

//   const results = await EmbeddingChunk.aggregate([
//     {
//       $search: {
//         index: "default", // or your vector index name
//         knnBeta: {
//           vector: queryEmbedding,
//           path: "embedding",
//           k: topK,
//           filter: { chatbot_id: chatbotId },
//         },
//       },
//     },
//     {
//       $project: {
//         content: 1,
//         score: { $meta: "searchScore" },
//       },
//     },
//   ]);

//   return results;
// }

// module.exports = { findSimilarChunks };
