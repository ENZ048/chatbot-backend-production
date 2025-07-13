const { v4: uuidv4 } = require("uuid");
const UserOtpVerification = require("../models/UserOTPVerification");
const VerifiedUser = require("../models/VerifiedUser");
const UserSession = require("../models/UserSession");
const Subscription = require("../models/Subscription");
const { sendOtpEmail } = require("../services/emailService");

const SESSION_VALIDITY_HOURS = 6; // 🔧 To change session duration, modify this constant
const SESSION_VALIDITY_MS = SESSION_VALIDITY_HOURS * 60 * 60 * 1000;

// ✅ Send OTP
exports.requestOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await UserOtpVerification.create({ email, otp });
  await sendOtpEmail(email, otp);

  res.json({ message: "OTP sent to your email" });
};

// ✅ Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp, chatbotId, sessionId } = req.body;

  if (!email || !otp || !chatbotId)
    return res.status(400).json({ message: "Email, OTP, and Chatbot ID required" });

  // 🔍 Find the latest OTP for this email
  const record = await UserOtpVerification.findOne({ email }).sort({ created_at: -1 });
  if (!record) return res.status(400).json({ message: "Invalid request" });

  const isValid = record.otp === otp;
  const ageInMin = (Date.now() - record.created_at.getTime()) / 60000;
  if (!isValid || ageInMin > 10)
    return res.status(400).json({ message: "OTP expired or incorrect" });

  // 🔍 Check if a recent session exists for this email + chatbot
  const lastSession = await UserSession.findOne({ email, chatbot_id: chatbotId })
    .sort({ last_verified: -1 });

  const now = Date.now();
  const sessionIsExpired =
    !lastSession || now - new Date(lastSession.last_verified).getTime() > SESSION_VALIDITY_MS;

  // ✅ If session is expired or doesn't exist, count as new user
  if (sessionIsExpired) {
    // ⛔ Enforce subscription plan limit
    const activeSub = await Subscription.findOne({
      chatbot_id: chatbotId,
      status: "active",
    }).populate("plan_id");

    if (!activeSub)
      return res.status(403).json({ message: "No active plan for this chatbot", chatbot_id: chatbotId });

    const currentSessionCount = await UserSession.countDocuments({ chatbot_id: chatbotId });
    const maxUsers = activeSub.plan_id.max_users || 99999;

    if (currentSessionCount >= maxUsers)
      return res
        .status(403)
        .json({ message: "User limit reached for this plan. Upgrade required." });

    // ✅ Create a new session record
    await UserSession.create({
      email,
      chatbot_id: chatbotId,
      last_verified: now,
    });
  } else {
    // 🕒 Optional: Refresh last_verified on reused session
    lastSession.last_verified = now;
    await lastSession.save();
  }

  // 📌 Log verified login always
  await VerifiedUser.create({
    email,
    chatbot_id: chatbotId,
    session_id: sessionId || uuidv4(),
    verified_at: new Date(),
  });

  res.json({ success: true });
};

// ✅ Add this function to otpController.js
exports.checkSession = async (req, res) => {
  const { email, chatbotId } = req.query;
  if (!email || !chatbotId)
    return res.status(400).json({ message: "Email and Chatbot ID are required" });

  const cutoffTime = new Date(Date.now() - SESSION_VALIDITY_MS);

  const recentSession = await UserSession.findOne({
    email,
    chatbot_id: chatbotId,
    last_verified: { $gte: cutoffTime },
  }).sort({ last_verified: -1 });

  res.json({ valid: !!recentSession });
};

