// services/configService.js
const ClientConfig = require("../models/ClientConfig");

async function getClientConfig(chatbotId) {
  try {
    const config = await ClientConfig.findOne({ chatbot_id: chatbotId });

    if (!config) {
      console.warn(`No client config found for chatbotId: ${chatbotId}`);
      return {};
    }

    return {
      demo_keywords: config.demo_keywords || [
        "demo",
        "free trial",
        "try it",
        "sample",
      ],
      default_suggestions: config.default_suggestions || [
        "Contact info",
        "Pricing",
        "Talk to agent",
      ],
      ...config.toObject(),
    };
  } catch (err) {
    console.error("MongoDB getClientConfig error:", err.message);
    return {};
  }
}

module.exports = { getClientConfig };
