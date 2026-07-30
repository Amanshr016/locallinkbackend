const Offer = require("../models/Offer");

// @desc    Get all active offers
// @route   GET /api/offers
// @access  Public
const getOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: offers.length, offers });
  } catch (error) {
    next(error);
  }
};

// @desc    Create an offer
// @route   POST /api/offers
// @access  Private (Admin/Provider)
const createOffer = async (req, res, next) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json({ success: true, offer });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOffers, createOffer };
