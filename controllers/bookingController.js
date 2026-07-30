const Booking = require("../models/Booking");
const Worker = require("../models/Worker");

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    req.body.customer = req.user._id;
    req.body.customerName = req.user.name;

    // Resolve provider owner if worker ID is provided
    if (req.body.worker) {
      const workerObj = await Worker.findById(req.body.worker);
      if (workerObj && workerObj.user) {
        req.body.provider = workerObj.user;
      }
    }

    const booking = await Booking.create(req.body);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookings (Customer view)
// @route   GET /api/bookings
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate("worker", "name profession image")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings for a provider ONLY (Authorized provider view)
// @route   GET /api/bookings/provider
// @access  Private (Provider)
const getProviderBookings = async (req, res, next) => {
  try {
    const workerProfile = await Worker.findOne({ user: req.user._id });
    
    // Strict authorization filter: provider must match current user or user's worker profile
    const filter = {
      $or: [
        { provider: req.user._id },
        ...(workerProfile ? [{ worker: workerProfile._id }] : [])
      ]
    };

    const bookings = await Booking.find(filter)
      .populate("customer", "name email phone avatar")
      .populate("worker", "name profession image")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Authorized for provider owner only)
// @route   PUT /api/bookings/:id
// @access  Private
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Authorization check: Verify if the booking belongs to this provider or admin
    const workerProfile = await Worker.findOne({ user: req.user._id });
    const isOwner = (booking.provider && booking.provider.toString() === req.user._id.toString()) ||
                    (booking.worker && workerProfile && booking.worker.toString() === workerProfile._id.toString()) ||
                    req.user.role === 'admin';

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update status for booking requests belonging to another service provider",
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (admin)
// @route   GET /api/bookings/all
// @access  Private (Admin)
const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Booking.countDocuments();
    const bookings = await Booking.find()
      .populate("customer", "name email")
      .populate("worker", "name profession")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
  getAllBookings,
};
