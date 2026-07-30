const express = require("express");
const { createReview, getWorkerReviews } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, createReview);
router.route("/:workerId").get(getWorkerReviews);

module.exports = router;
