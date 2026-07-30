const express = require("express");
const { submitContactForm, getContactSubmissions } = require("../controllers/contactController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(submitContactForm).get(protect, authorize("admin"), getContactSubmissions);

module.exports = router;
