const User = require("../models/User");

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const allowedFields = ["name", "phone", "address", "city", "avatar", "notifications"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add worker to favorites
// @route   POST /api/users/favorites/:workerId
// @access  Private
const addFavorite = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const workerId = req.params.workerId;

    if (user.favorites.includes(workerId)) {
      return res.status(400).json({ success: false, message: "Already in favorites" });
    }

    user.favorites.push(workerId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Added to favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove worker from favorites
// @route   DELETE /api/users/favorites/:workerId
// @access  Private
const removeFavorite = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const workerId = req.params.workerId;

    user.favorites = user.favorites.filter(
      (fav) => fav.toString() !== workerId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: "Removed from favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites");

    res.status(200).json({
      success: true,
      favorites: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  addFavorite,
  removeFavorite,
  getFavorites,
};
