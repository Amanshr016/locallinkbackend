const Worker = require("../models/Worker");
const Review = require("../models/Review");

// @desc    Get all workers (with filters)
// @route   GET /api/workers
// @access  Public
const getWorkers = async (req, res, next) => {
  try {
    const { category, search, city, page = 1, limit = 10 } = req.query;
    const query = {};

    if (category && category !== "all") {
      query.category = category;
    }

    if (city) {
      query.city = { $regex: city, $options: "i" };
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Worker.countDocuments(query);
    const workers = await Worker.find(query)
      .sort({ rating: -1, reviewsCount: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: workers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      workers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single worker by ID
// @route   GET /api/workers/:id
// @access  Public
const getWorkerById = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    // Get reviews for this worker
    const reviews = await Review.find({ worker: req.params.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      worker,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a worker profile
// @route   POST /api/workers
// @access  Private (Provider)
const createWorker = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    const worker = await Worker.create(req.body);

    res.status(201).json({
      success: true,
      message: "Worker profile created",
      worker,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update worker profile
// @route   PUT /api/workers/:id
// @access  Private (Owner/Admin)
const updateWorker = async (req, res, next) => {
  try {
    let worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    // Check ownership
    if (worker.user && worker.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this profile" });
    }

    worker = await Worker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, worker });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWorkers, getWorkerById, createWorker, updateWorker };
