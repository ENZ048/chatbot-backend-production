const Company = require("../models/Company");
const Chatbot = require("../models/Chatbot");

// ✅ Create a new company
exports.createCompany = async (req, res) => {
  try {
    const { name, url } = req.body;

    if (!name || !url) {
      return res
        .status(400)
        .json({ message: "Company name and domain (URL) are required." });
    }

    const existing = await Company.findOne({ url });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Company domain (URL) already exists." });
    }

    const company = new Company({ name, url, created_at: new Date() });
    await company.save();

    res.status(201).json({ message: "Company created", data: company });
  } catch (err) {
    console.error("Create company error:", err.message);
    res.status(500).json({ message: "Server error while creating company" });
  }
};

// ✏️ Edit existing company
exports.editCompany = async (req, res) => {
  const { id } = req.params;
  const { name, url } = req.body;

  try {
    if (!name && !url) {
      return res.status(400).json({ message: "Nothing to update." });
    }

    // Check for duplicate URL (excluding current company)
    if (url) {
      const existing = await Company.findOne({ url, _id: { $ne: id } });
      if (existing) {
        return res
          .status(409)
          .json({ message: "Company domain (URL) already exists." });
      }
    }

    const updatePayload = {};
    if (name) updatePayload.name = name;
    if (url) updatePayload.url = url;

    const updatedCompany = await Company.findByIdAndUpdate(id, updatePayload, {
      new: true,
    });

    res
      .status(200)
      .json({ message: "Company updated", data: updatedCompany });
  } catch (err) {
    console.error("Edit company error:", err.message);
    res.status(500).json({ message: "Server error while editing company" });
  }
};

// ❌ Delete company (and optionally cascade delete chatbots manually)
exports.deleteCompany = async (req, res) => {
  const { id } = req.params;

  try {
    // Optional: delete related chatbots
    await Chatbot.deleteMany({ company_id: id });

    const deleted = await Company.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({ message: "Company deleted" });
  } catch (err) {
    console.error("Delete company error:", err.message);
    res.status(500).json({ message: "Server error while deleting company" });
  }
};

// 📦 Get all companies with their chatbots
exports.getAllCompaniesWithChatbots = async (req, res) => {
  try {
    const companies = await Company.find().sort({ created_at: -1 });

    const enriched = await Promise.all(
      companies.map(async (company) => {
        const chatbots = await Chatbot.find({ company_id: company._id });
        return {
          ...company.toObject(),
          chatbots,
        };
      })
    );

    res.status(200).json({ companies: enriched });
  } catch (err) {
    console.error("Fetch companies error:", err.message);
    res.status(500).json({ message: "Error fetching companies and chatbots" });
  }
};
