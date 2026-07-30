const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
  addFavorite,
  removeFavorite,
  getFavorites,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/profile").get(getUserProfile).put(updateUserProfile);
router.route("/favorites").get(getFavorites);
router.route("/favorites/:workerId").post(addFavorite).delete(removeFavorite);

module.exports = router;
