const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Comment = require("../models/Comment");
const User = require("../models/User");

// Get all comments (only top-level comments, with replies populated)
router.get("/", authMiddleware([]), async (req, res) => {
  try {
    const comments = await Comment.find({ parentComment: null })
      .populate("createdBy", "name role")
      .populate("mentionedUsers", "name role")
      .populate({
        path: "replies",
        populate: [
          { path: "createdBy", select: "name role" },
          { path: "mentionedUsers", select: "name role" }
        ]
      })
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Create new comment or reply
router.post("/", authMiddleware([]), async (req, res) => {
  try {
    const { text, mentionedUserIds, parentCommentId } = req.body;
    
    const comment = new Comment({
      text,
      mentionedUsers: mentionedUserIds || [],
      createdBy: req.user.id,
      parentComment: parentCommentId || null,
    });
    
    await comment.save();
    
    // If this is a reply, add it to the parent comment's replies array
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(
        parentCommentId,
        { $push: { replies: comment._id } }
      );
    }
    
    await comment.populate("createdBy", "name role");
    await comment.populate("mentionedUsers", "name role");
    res.json(comment);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Update comment (only owner or Admin)
router.put("/:id", authMiddleware([]), async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.createdBy.toString() !== req.user.id && req.user.role !== "Admin")
      return res.status(403).json({ message: "Not authorized" });

    comment.text = req.body.text || comment.text;
    comment.updatedAt = new Date();
    await comment.save();
    
    // Populate user data before returning
    await comment.populate("createdBy", "name role");
    await comment.populate("mentionedUsers", "name role");
    
    res.json(comment);
  } catch (err) {
    console.error("Error updating comment:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete comment (Admin or owner)
router.delete("/:id", authMiddleware([]), async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.createdBy.toString() !== req.user.id && req.user.role !== "Admin")
      return res.status(403).json({ message: "Not authorized" });

    // If this is a reply, remove it from parent's replies array
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(
        comment.parentComment,
        { $pull: { replies: comment._id } }
      );
    }

    // Delete all replies first
    if (comment.replies && comment.replies.length > 0) {
      await Comment.deleteMany({ _id: { $in: comment.replies } });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully", id: req.params.id });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
