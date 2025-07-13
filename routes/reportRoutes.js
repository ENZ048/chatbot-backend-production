const express = require("express");
const router = express.Router();
const { getOverallReport } = require("../controllers/reportController");
const adminProtect = require("../middleware/adminAuthMiddleware");

router.get("/overall", adminProtect, getOverallReport);
module.exports = router;
    