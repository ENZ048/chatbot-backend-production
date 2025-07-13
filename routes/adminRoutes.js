const express = require("express");
const router = express.Router();
const { login, getStats, createAdmin } = require("../controllers/adminController");
const Admin = require("../models/Admin"); // 🔁 Add this

router.post("/login", login);
router.get("/stats", getStats);
router.post("/create", createAdmin);

// ✅ GET all admins (MongoDB version)
router.get("/all", async (req, res) => {
  try {
    const admins = await Admin.find({}, "id name email created_at").sort({ created_at: -1 });
    res.json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
