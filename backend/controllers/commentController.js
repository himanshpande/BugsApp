const WorkItem = require("../models/WorkItem");
const User = require("../models/User");

// ✅ Fetch all comments for a specific work item
exports.getComments = async (req, res) => {
  try {
    const workItem = await WorkItem.findById(req.params.id)
      .populate("comments.user", "name email role");

    if (!workItem) return res.status(404).json({ message: "Work item not found" });

    res.json(workItem.comments || []);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Add a new comment
exports.addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const userId = req.user.id;

    const workItem = await WorkItem.findById(req.params.id);
    if (!workItem) return res.status(404).json({ message: "Work item not found" });

    const newComment = {
      user: userId,
      text: comment,
      createdAt: new Date(),
    };

    // Mentions detection (simple "@username" parser)
    const mentionedUsers = await extractMentions(comment);

    workItem.comments.push(newComment);
    await workItem.save();

    const updatedItem = await WorkItem.findById(req.params.id)
      .populate("comments.user", "name email role");

    res.json({
      message: "Comment added successfully",
      comments: updatedItem.comments,
      mentions: mentionedUsers,
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Edit a comment
exports.editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    const workItem = await WorkItem.findOne({
      "comments._id": commentId,
    });

    if (!workItem) return res.status(404).json({ message: "Comment not found" });

    const comment = workItem.comments.id(commentId);
    if (!comment.user.equals(userId))
      return res.status(403).json({ message: "Not authorized" });

    comment.text = text;
    comment.updatedAt = new Date();
    await workItem.save();

    const updatedItem = await WorkItem.findById(workItem._id)
      .populate("comments.user", "name email role");

    res.json({
      message: "Comment updated successfully",
      comments: updatedItem.comments,
    });
  } catch (err) {
    console.error("Error editing comment:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const workItem = await WorkItem.findOne({ "comments._id": commentId });
    if (!workItem) return res.status(404).json({ message: "Comment not found" });

    const comment = workItem.comments.id(commentId);
    if (!comment.user.equals(userId) && req.user.role !== "Admin")
      return res.status(403).json({ message: "Not authorized" });

    comment.deleteOne();
    await workItem.save();

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 Helper: Extract mentioned users
async function extractMentions(text) {
  const mentionRegex = /@(\w+)/g;
  const mentionedNames = [];
  let match;
  while ((match = mentionRegex.exec(text))) {
    mentionedNames.push(match[1]);
  }

  const mentionedUsers = await User.find({ name: { $in: mentionedNames } });
  return mentionedUsers.map((u) => ({ id: u._id, name: u.name }));
}
