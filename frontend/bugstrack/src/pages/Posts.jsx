import React, { useEffect, useMemo, useState } from "react";
import { Button, Form, Spinner, Card, Badge } from "react-bootstrap";
import axios from "axios";
import "./Posts.css";

const MAX_IMAGES = 4;

const Posts = ({
  isDarkMode = false,
  showNotification,
  currentUser,
  currentUserAvatar,
}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const token = useMemo(() => localStorage.getItem("token"), []);

  const theme = useMemo(
    () => ({
      cardBg: isDarkMode ? "#111827" : "#ffffff",
      cardBorder: isDarkMode ? "#1f2937" : "#e5e7eb",
      textPrimary: isDarkMode ? "#e2e8f0" : "#1f2937",
      textSecondary: isDarkMode ? "#94a3b8" : "#4b5563",
      surface: isDarkMode ? "#0f172a" : "#f9fafb",
    }),
    [isDarkMode]
  );

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (preview?.previewUrl) {
          URL.revokeObjectURL(preview.previewUrl);
        }
      });
    };
  }, [previews]);

  const fetchPosts = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
      showNotification?.({
        type: "error",
        message: "Failed to load posts. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    previews.forEach((preview) => {
      if (preview?.previewUrl) {
        URL.revokeObjectURL(preview.previewUrl);
      }
    });
    setContent("");
    setImages([]);
    setPreviews([]);
  };

  const handleImageChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    const fileReaders = filesToProcess.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    try {
      const newImages = await Promise.all(fileReaders);
      setImages((prev) => [...prev, ...newImages]);
      setPreviews((prev) => [
        ...prev,
        ...filesToProcess.map((file) => ({
          name: file.name,
          size: file.size,
          previewUrl: URL.createObjectURL(file),
        })),
      ]);
    } catch (err) {
      console.error("Error processing images:", err);
      showNotification?.({
        type: "error",
        message: "Unable to process one of the selected images.",
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
    setPreviews((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(index, 1);
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return updated;
    });
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();
    if (!token) return;

    if (!content.trim() && images.length === 0) {
      showNotification?.({
        type: "warning",
        message: "Please add some text or at least one image.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        content,
        images,
        authorAvatar: currentUserAvatar || "",
      };

      const res = await axios.post("http://localhost:5000/api/posts", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts((prev) => [res.data, ...prev]);
      showNotification?.({
        type: "success",
        message: "Post published successfully!",
      });
      resetForm();
    } catch (err) {
      console.error("Error creating post:", err);
      showNotification?.({
        type: "error",
        message: err.response?.data?.message || "Failed to publish post.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!token) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts((prev) => prev.filter((post) => post._id !== postId));
      showNotification?.({
        type: "success",
        message: "Post deleted.",
      });
    } catch (err) {
      console.error("Error deleting post:", err);
      showNotification?.({
        type: "error",
        message: err.response?.data?.message || "Failed to delete post.",
      });
    }
  };

  const canDelete = (post) => {
    if (!currentUser?._id && !currentUser?.id) return false;
    const currentUserId = currentUser._id || currentUser.id;
    return (
      currentUser?.role === "Admin" ||
      String(post.author) === String(currentUserId)
    );
  };

  return (
    <div className="posts-container">
      <Card
        className="post-editor-card"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
          color: theme.textPrimary,
        }}
      >
        <Card.Body>
          <div className="post-editor-header">
            <div className="post-editor-avatar">
              {currentUserAvatar ? (
                <img src={currentUserAvatar} alt={currentUser?.name || "User"} />
              ) : (
                <div className="avatar-fallback">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div>
              <h5 className="mb-0">{currentUser?.name || "User"}</h5>
              <small style={{ color: theme.textSecondary }}>
                {currentUser?.role || "Member"}
              </small>
            </div>
          </div>
          <Form onSubmit={handleCreatePost}>
            <Form.Group className="mb-3" controlId="postContent">
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Share an update..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={submitting}
              />
            </Form.Group>

            {previews.length > 0 && (
              <div className="post-image-preview-grid mb-3">
                {previews.map((preview, index) => (
                  <div key={index} className="post-image-preview-item">
                    <img src={preview.previewUrl} alt={preview.name} />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => handleRemoveImage(index)}
                      aria-label="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="post-editor-actions">
              <label className="image-upload-btn">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={submitting || images.length >= MAX_IMAGES}
                />
                <span>
                  📷 Add Images{" "}
                  {images.length > 0 && `(${images.length}/${MAX_IMAGES})`}
                </span>
              </label>
              <Button
                type="submit"
                disabled={submitting}
                className="publish-btn"
              >
                {submitting ? (
                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      className="me-2"
                    />{" "}
                    Publishing...
                  </>
                ) : (
                  "Publish"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <div className="posts-list">
        {loading ? (
          <div className="posts-loading-state">
            <Spinner animation="border" role="status" />
            <p>Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div
            className="posts-empty-state"
            style={{ color: theme.textSecondary }}
          >
            <p>No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <Card
              key={post._id}
              className="post-card"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
                color: theme.textPrimary,
              }}
            >
              <Card.Body>
                <div className="post-card-header">
                  <div className="post-card-avatar">
                    {post.authorAvatar ? (
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName || "User"}
                      />
                    ) : (
                      <div className="avatar-fallback">
                        {post.authorName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <div className="post-card-meta">
                    <div className="post-card-title">
                      <strong>{post.authorName || "Unknown User"}</strong>
                      {post.authorRole && (
                        <Badge bg="secondary" className="ms-2 text-uppercase">
                          {post.authorRole}
                        </Badge>
                      )}
                    </div>
                    <small style={{ color: theme.textSecondary }}>
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleString()
                        : ""}
                    </small>
                  </div>
                  {canDelete(post) && (
                    <button
                      type="button"
                      className="post-delete-btn"
                      onClick={() => handleDeletePost(post._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>

                {post.content && (
                  <Card.Text className="post-card-content">
                    {post.content}
                  </Card.Text>
                )}

                {Array.isArray(post.images) && post.images.length > 0 && (
                  <div className="post-card-images">
                    {post.images.map((img, index) => (
                      <img key={index} src={img} alt={`Post ${index + 1}`} />
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Posts;

