const Post = require("../models/Post");

// @desc    Get all posts (with filter)
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const query = {};
    if (category && category !== "All Posts") {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const post = await Post.create({
      author: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar || "",
      city: req.body.city || req.user.city || "",
      category: req.body.category || "General",
      description: req.body.description,
    });

    res.status(201).json({ success: true, message: "Post created", post });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const userId = req.user._id;
    const alreadyLiked = post.likedBy.includes(userId);

    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter((id) => id.toString() !== userId.toString());
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userId);
      post.likes += 1;
    }

    await post.save();

    res.status(200).json({
      success: true,
      likes: post.likes,
      isLiked: !alreadyLiked,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (Owner/Admin)
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await post.deleteOne();
    res.status(200).json({ success: true, message: "Post deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPosts, createPost, toggleLikePost, deletePost };
