const Subscription = require("../models/Subscription");
const Plan = require("../models/Plan");

// ✅ GET active subscription for chatbot
exports.getSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const activeSub = await Subscription.findOne({
      chatbot_id: id,
      status: "active",
    })
      .populate("plan_id")
      .sort({ start_date: -1 });

    if (!activeSub) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    res.json({ subscription: activeSub });
  } catch (err) {
    console.error("getSubscription error:", err.message);
    res.status(500).json({ message: "Server error while fetching subscription" });
  }
};

// 🔁 RENEW chatbot subscription
exports.renewSubscription = async (req, res) => {
  try {
    const { id } = req.params; // chatbot_id
    const { plan_id, months } = req.body;

    if (!plan_id || !months) {
      return res.status(400).json({ message: "plan_id and months are required" });
    }

    const plan = await Plan.findById(plan_id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // ❌ Expire previous subscriptions
    await Subscription.updateMany(
      { chatbot_id: id, status: "active" },
      { $set: { status: "expired" } }
    );

    // 🆕 Create new subscription
    const now = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + parseInt(months));

    await Subscription.create({
      chatbot_id: id,
      plan_id: plan._id,
      plan_name: plan.name,
      start_date: now,
      end_date: end,
      status: "active",
    });

    res.json({ success: true, message: "Plan renewed successfully" });
  } catch (err) {
    console.error("renewSubscription error:", err.message);
    res.status(500).json({ message: "Server error during renewal" });
  }
};
