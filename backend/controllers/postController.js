const Post = require("../models/Post");
const Employee = require("../models/Employee");

const MAX_IMAGE_COUNT = 5;
const MAX_IMAGE_LENGTH = 5 * 1024 * 1024; // ~5MB per image when base64 encoded

const sanitizeImages = (images = []) => {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .filter((img) => typeof img === "string" && img.trim().length > 0)
    .slice(0, MAX_IMAGE_COUNT)
    .map((img) => {
      const trimmed = img.trim();
      if (trimmed.length > MAX_IMAGE_LENGTH) {
        return trimmed.substring(0, MAX_IMAGE_LENGTH);
      }
      return trimmed;
    });
};

const resolveAuthorAvatar = async (userId, fallbackAvatar) => {
  if (fallbackAvatar) return fallbackAvatar;

  try {
    const employee = await Employee.findOne({ userId: String(userId) }).select(
      "avatarDataUrl"
    );
    return employee?.avatarDataUrl || "";
  } catch (err) {
    console.error("Error resolving author avatar:", err);
    return "";
  }
};

exports.getPosts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Failed to load posts" });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { content = "", images = [], authorAvatar = "" } = req.body;
    const trimmedContent = content.trim();
    const sanitizedImages = sanitizeImages(images);

    if (!trimmedContent && sanitizedImages.length === 0) {
      return res
        .status(400)
        .json({ message: "Post must include text or at least one image" });
    }

    const avatar = await resolveAuthorAvatar(req.user.id, authorAvatar);

    const post = await Post.create({
      content: trimmedContent,
      images: sanitizedImages,
      author: req.user.id,
      authorName: req.user.name,
      authorRole: req.user.role,
      authorAvatar: avatar,
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isAuthor = String(post.author) === String(req.user.id);
    const isAdmin = req.user.role === "Admin";

    if (!isAuthor && !isAdmin) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this post" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};





