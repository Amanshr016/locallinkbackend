const express = require("express");
const { 
  getChatMessages, 
  getConversations,
  markAsRead,
  sendMessage, 
  updateMessage, 
  deleteMessage 
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/").post(sendMessage);
router.route("/conversations/all").get(getConversations);
router.route("/read/:targetId").put(markAsRead);
router.route("/:targetId").get(getChatMessages);
router.route("/item/:id").put(updateMessage).delete(deleteMessage);

module.exports = router;
