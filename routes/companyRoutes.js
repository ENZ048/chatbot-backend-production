const express = require("express");
const router = express.Router();
const {
  createCompany,
  editCompany,
  deleteCompany,
  getAllCompaniesWithChatbots,
} = require("../controllers/companyController");

router.post("/create", createCompany);
router.put("/:id", editCompany);
router.delete("/delete/:id", deleteCompany);
router.get("/all", getAllCompaniesWithChatbots);

module.exports = router;
