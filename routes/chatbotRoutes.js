const express = require("express");
const router = express.Router();
const {
  createChatbot,
  editChatbot,
  deleteChatbot,
  getMessageHistory,
  updateTokenLimit,
  getAllChatbotsWithStats,
} = require("../controllers/chatbotController");
const {
  getClientConfig,
  updateClientConfig,
} = require("../controllers/clientConfigController");
const {
  getSubscription,
  renewSubscription,
} = require("../controllers/subscriptionController");
const adminProtect = require("../middleware/adminAuthMiddleware");

// Core chatbot routes
router.post("/create", adminProtect, createChatbot);
router.put("/edit/:id", adminProtect, editChatbot);
router.delete("/delete/:id", adminProtect, deleteChatbot);
router.get("/all", adminProtect, getAllChatbotsWithStats);
router.get("/messages/:id", adminProtect, getMessageHistory);
router.put("/update-token-limit/:id", adminProtect, updateTokenLimit);

// Subscription (migrated to MongoDB logic)
router.get("/:id/subscription", adminProtect, getSubscription);
router.post("/:id/renew", adminProtect, renewSubscription);

// Client config routes
router.get("/:id/config", getClientConfig);
router.put("/:id/config", updateClientConfig);

module.exports = router;
