const Review = require("../models/Review");
const Worker = require("../models/Worker");

// @desc    Create a review for a worker
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { workerId, rating, comment } = req.body;

    // Check if worker exists
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({
      worker: workerId,
      user: req.user._id,
    });
    if (existingReview) {
      return res.status(400).json({ success: false, message: "You have already reviewed this worker" });
    }

    const review = await Review.create({
      worker: workerId,
      user: req.user._id,
      userName: req.user.name,
      avatar: req.user.avatar || "",
      rating,
      comment,
      date: "Just now",
    });

    // Update worker rating
    const reviews = await Review.find({ worker: workerId });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    // Update rating breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
    });

    await Worker.findByIdAndUpdate(workerId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewsCount: reviews.length,
      ratingBreakdown: breakdown,
    });

    res.status(201).json({ success: true, message: "Review submitted", review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a worker
// @route   GET /api/reviews/:workerId
// @access  Public
const getWorkerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ worker: req.params.workerId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getWorkerReviews };
