const express = require("express");
const { getOffers, createOffer } = require("../controllers/offerController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(getOffers).post(protect, authorize("provider", "admin"), createOffer);

module.exports = router;
