const { retrieveRelevantChunks } = require("../services/queryService");
const { generateAnswer } = require("../services/chatService");
const Chatbot = require("../models/Chatbot");
const Message = require("../models/Message");
const Subscription = require("../models/Subscription");
const Plan = require("../models/Plan");
const { getClientConfig } = require("../services/configService");

exports.answerQuery = async (req, res) => {
  try {
    const { query, chatbotId, sessionId = "anonymous-session" } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Please ask anything" });
    }

    // 🔍 Validate active subscription
    const subscription = await Subscription.findOne({
      chatbot_id: chatbotId,
      status: "active",
    }).populate("plan_id");

    if (!subscription) {
      return res.status(403).json({
        message: "This chatbot's subscription is inactive.",
      });
    }

    // 🧠 Retrieve context
    const chunks = await retrieveRelevantChunks(query, chatbotId);
    const topContext = chunks.map((c) => c.content);

    // ⚙️ Get chatbot config
    const clientConfig = await getClientConfig(chatbotId);

    // 🤖 Generate answer
    const { answer, tokens, suggestions } = await generateAnswer(
      query,
      topContext,
      clientConfig
    );

    // 🔄 Update token usage
    const chatbot = await Chatbot.findById(chatbotId);
    if (chatbot) {
      chatbot.used_tokens = (chatbot.used_tokens || 0) + tokens;
      chatbot.used_today = (chatbot.used_today || 0) + tokens;
      await chatbot.save();
    }

    // 💾 Save user & bot messages
    await Message.insertMany([
      {
        chatbot_id: chatbotId,
        sender: "user",
        content: query,
        session_id: sessionId,
        timestamp: new Date(),
      },
      {
        chatbot_id: chatbotId,
        sender: "bot",
        content: answer,
        session_id: sessionId,
        timestamp: new Date(),
      },
    ]);

    // ✅ Send response
    res.status(200).json({ answer, suggestions, tokens });
  } catch (error) {
    console.error("Answer generation error:", error.message);
    res.status(500).json({ message: "Error generating answer" });
  }
};
