const axios = require("axios");

async function generateAnswer(query, contextChunks, clientConfig = {}) {
  const lowerQuery = query.toLowerCase();
  const demoKeywords = clientConfig?.demo_keywords || [
    "demo",
    "free trial",
    "try it",
    "sample",
  ];
  const isDemoRequest = demoKeywords.some((word) => lowerQuery.includes(word));

  if (isDemoRequest) {
    const demoMessage =
      clientConfig?.demo_message ||
      "You can try a free demo here: https://troikatech.in/demo";
    return {
      answer: demoMessage,
      suggestions: clientConfig?.default_suggestions || [
        "Services",
        "Pricing",
        "Contact info",
      ],
      tokens: 0,
    };
  }

  const greetingKeywords = [
    "hi",
    "hello",
    "hey",
    "good morning",
    "good evening",
    "good afternoon",
  ];
  const isGreeting = greetingKeywords.some((g) => lowerQuery.includes(g));

  if (isGreeting) {
    return {
      answer: "Hello! 👋 How can I assist you with our services today?",
      suggestions: ["View services", "Get a demo", "Contact support"],
      tokens: 0,
    };
  }

  context = contextChunks.join("\n---\n");

  // ✳️ Reject if there's no context (this prevents hallucination)
  const cleanedChunks = contextChunks.filter(
    (chunk) => chunk && chunk.trim().length > 10
  );

  if (cleanedChunks.length === 0) {
    return {
      answer:
        "I'm sorry, I currently don’t have enough information to help with that.",
      suggestions: [],
      tokens: 0,
    };
  }

  context = cleanedChunks.join("\n---\n");

  const systemPrompt = `
You are a helpful support assistant.

Use ONLY the information provided in the CONTEXT section below to answer questions.

If the user asks anything unrelated (like coding, math, or generic AI prompts), reply:
"I'm sorry, I can only assist with questions related to our services."

Limit your answer to around 30–50 words. Be helpful and clear.

Give answer in same language as query
CONTEXT:
${context}
`;

  // console.log("Final system prompt:", systemPrompt);
  // console.log("User question:", query);


  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: query,
          },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const mainAnswer = response.data.choices[0].message.content;

    // Generate follow-up suggestions
    const suggestionPrompt = `Based ONLY on this answer, give 3 very short follow-up prompts as a raw JSON array (like ["View pricing", "Contact team", "Learn more"]). Do NOT number them or return an object.

Answer: "${mainAnswer}"`;

    const suggestionResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: suggestionPrompt }],
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let suggestions = [];
    try {
      const raw = suggestionResponse.data.choices[0].message.content.trim();
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        suggestions = parsed;
      } else if (parsed?.suggestions && Array.isArray(parsed.suggestions)) {
        suggestions = parsed.suggestions;
      } else {
        suggestions = Object.values(parsed).filter(
          (v) => typeof v === "string"
        );
      }
    } catch (e) {
      suggestions = [];
    }

    return {
      answer: mainAnswer,
      suggestions: suggestions.slice(0, 3),
      tokens:
        response.data.usage.total_tokens +
        (suggestionResponse.data.usage?.total_tokens || 0),
    };
  } catch (error) {
    console.error(
      "Error generating response:",
      error.response?.data || error.message
    );
    return {
      answer:
        "Sorry, I'm currently unable to assist with that. Please try again later.",
      suggestions: [],
      tokens: 0,
    };
  }
}

module.exports = { generateAnswer };
