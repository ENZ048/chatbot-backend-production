const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");
const Company = require("../models/Company");
const Chatbot = require("../models/Chatbot");
const Message = require("../models/Message");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

exports.getStats = async (req, res) => {
  try {
    // 1. Total companies
    const totalCompanies = await Company.countDocuments();

    // 2. Total chatbots
    const totalChatbots = await Chatbot.countDocuments();

    // 3. Unique users (by distinct session_id in messages)
    const sessions = await Message.distinct("session_id");
    const unique_users = sessions.length;

    // 4. Total messages
    const totalMessages = await Message.countDocuments();

    // 5. Monthly token usage
    const currentMonth = new Date().getMonth();
    const chatbots = await Chatbot.find({}, "used_tokens last_reset");

    const monthlyTokenUsage = chatbots.reduce((sum, bot) => {
      const resetMonth = new Date(bot.last_reset).getMonth();
      return resetMonth === currentMonth ? sum + (bot.used_tokens || 0) : sum;
    }, 0);

    res.json({
      totalCompanies,
      totalChatbots,
      unique_users,
      totalMessages,
      monthlyTokenUsage,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required." });
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });

    if (existingAdmin) {
      return res
        .status(400)
        .json({ error: "Admin with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email: email.toLowerCase(),
      password_hash: hashedPassword,
      created_at: new Date(),
    });

    await newAdmin.save();

    return res.status(201).json({
      success: true,
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        created_at: newAdmin.created_at,
      },
    });
  } catch (err) {
    console.error("CreateAdmin error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
