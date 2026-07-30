const express = require("express");
const { getPosts, createPost, toggleLikePost, deletePost } = require("../controllers/postController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(getPosts).post(protect, createPost);
router.route("/:id/like").put(protect, toggleLikePost);
router.route("/:id").delete(protect, deletePost);

module.exports = router;
