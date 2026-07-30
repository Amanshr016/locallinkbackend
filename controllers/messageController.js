const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");

// @desc    Get chat history between current user and a target (worker/user)
// @route   GET /api/messages/:targetId
// @access  Private
const getChatMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const targetId = req.params.targetId;

    const isMongoId = mongoose.Types.ObjectId.isValid(targetId);

    const queryConditions = isMongoId
      ? [
          { sender: userId, receiver: targetId },
          { sender: targetId, receiver: userId },
          { sender: userId, workerId: targetId },
          { receiver: userId, workerId: targetId },
        ]
      : [
          { sender: userId },
          { receiver: userId },
        ];

    const messages = await Message.find({ $or: queryConditions }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations summary with unread counts
// @route   GET /api/messages/conversations/all
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all distinct participants user chatted with
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).sort({ createdAt: -1 });

    const conversationMap = new Map();

    for (const msg of messages) {
      const partnerId = String(msg.sender) === String(userId) ? String(msg.receiver) : String(msg.sender);
      if (!conversationMap.has(partnerId)) {
        const unreadCount = await Message.countDocuments({
          sender: partnerId,
          receiver: userId,
          read: false,
        });

        const partnerUser = await User.findById(partnerId).select("name avatar role city");

        conversationMap.set(partnerId, {
          partnerId,
          partnerName: partnerUser ? partnerUser.name : "Service Contact",
          partnerAvatar: partnerUser ? partnerUser.avatar : "",
          partnerRole: partnerUser ? partnerUser.role : "user",
          lastMessage: msg.text || (msg.msgType === "image" ? "[Photo Attachment]" : msg.msgType === "location" ? "[Location Shared]" : "[Service Quote]"),
          lastMessageAt: msg.createdAt,
          unreadCount,
        });
      }
    }

    res.status(200).json({
      success: true,
      conversations: Array.from(conversationMap.values()),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:targetId
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const targetId = req.params.targetId;

    if (mongoose.Types.ObjectId.isValid(targetId)) {
      await Message.updateMany(
        { sender: targetId, receiver: userId, read: false },
        { $set: { read: true, readAt: new Date() } }
      );
    }

    const io = req.app.get("io");
    if (io) {
      const room = [String(userId), String(targetId)].sort().join("_");
      io.to(room).emit("message_read", { readBy: userId, targetId });
    }

    res.status(200).json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, text, workerId, msgType, mediaUrl, location, priceQuote } = req.body;

    if (!text && !mediaUrl && !location && !priceQuote) {
      return res.status(400).json({ success: false, message: "Message content is required" });
    }

    const validReceiver = mongoose.Types.ObjectId.isValid(receiverId) ? receiverId : req.user._id;
    const validWorker = mongoose.Types.ObjectId.isValid(workerId) ? workerId : null;

    const message = await Message.create({
      sender: req.user._id,
      receiver: validReceiver,
      workerId: validWorker,
      text: (text || "").trim(),
      msgType: msgType || "text",
      mediaUrl: mediaUrl || "",
      location: location || null,
      priceQuote: priceQuote || null,
    });

    const io = req.app.get("io");
    if (io) {
      const room = [String(req.user._id), String(receiverId || req.user._id)].sort().join("_");
      io.to(room).emit("receive_message", message);
    }

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit a sent message (Allowed only within 5 minutes of sending)
// @route   PUT /api/messages/item/:id
// @access  Private
const updateMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this message" });
    }

    const elapsedMs = Date.now() - new Date(message.createdAt).getTime();
    if (elapsedMs > 5 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: "Messages can only be edited within 5 minutes of sending",
      });
    }

    message.text = text.trim();
    await message.save();

    const io = req.app.get("io");
    if (io) {
      const room = [String(message.sender), String(message.receiver)].sort().join("_");
      io.to(room).emit("message_edited", message);
    }

    res.status(200).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a sent message (Allowed only within 5 minutes of sending)
// @route   DELETE /api/messages/item/:id
// @access  Private
const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this message" });
    }

    const elapsedMs = Date.now() - new Date(message.createdAt).getTime();
    if (elapsedMs > 5 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: "Messages can only be deleted within 5 minutes of sending",
      });
    }

    const msgId = message._id;
    const room = [String(message.sender), String(message.receiver)].sort().join("_");
    await message.deleteOne();

    const io = req.app.get("io");
    if (io) {
      io.to(room).emit("message_deleted", { messageId: msgId });
    }

    res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getChatMessages, 
  getConversations,
  markAsRead,
  sendMessage, 
  updateMessage, 
  deleteMessage 
};
