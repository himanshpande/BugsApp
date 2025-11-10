const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    images: [
      {
        type: String,
        default: [],
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorRole: {
      type: String,
      required: true,
    },
    authorAvatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Avoid model overwrite in watch mode
const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

module.exports = Post;


