const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getPosts,
  createPost,
  deletePost,
} = require("../controllers/postController");

router.get("/", authMiddleware(), getPosts);
router.post("/", authMiddleware(), createPost);
router.delete("/:id", authMiddleware(), deletePost);

module.exports = router;


