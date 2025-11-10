import React, { useState, useEffect } from 'react';
import './Notes.css';
import { Button, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faThumbtack,
  faSearch,
  faTimes,
  faTag,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const Notes = ({ isDarkMode = false, showNotification }) => {
  const [notes, setNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Other',
    color: '#fef3c7',
    tags: []
  });
  const [selectedNote, setSelectedNote] = useState(null);
  const [tagInput, setTagInput] = useState('');

  const categories = ['All', 'Work', 'Personal', 'Ideas', 'Todo', 'Other'];
  const colorOptions = [
    { name: 'Yellow', value: '#fef3c7' },
    { name: 'Blue', value: '#dbeafe' },
    { name: 'Green', value: '#d1fae5' },
    { name: 'Pink', value: '#fce7f3' },
    { name: 'Purple', value: '#e9d5ff' },
    { name: 'Orange', value: '#fed7aa' }
  ];

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notes', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setNotes(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      showNotification?.({
        type: 'error',
        message: 'Failed to fetch notes'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      content: '',
      category: 'Other',
      color: '#fef3c7',
      tags: []
    });
    setSelectedNote(null);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEdit = (note) => {
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      color: note.color,
      tags: note.tags || []
    });
    setSelectedNote(note);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.title.trim() || !formData.content.trim()) {
        showNotification?.({
          type: 'error',
          message: 'Title and content are required'
        });
        return;
      }

      const token = localStorage.getItem('token');

      if (isEditMode && selectedNote) {
        const response = await axios.put(
          `http://localhost:5000/api/notes/${selectedNote._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setNotes(notes.map(n => n._id === selectedNote._id ? response.data.data : n));
        showNotification?.({
          type: 'success',
          message: 'Note updated successfully!'
        });
      } else {
        const response = await axios.post(
          'http://localhost:5000/api/notes',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setNotes([response.data.data, ...notes]);
        showNotification?.({
          type: 'success',
          message: 'Note created successfully!'
        });
      }

      setShowModal(false);
    } catch (err) {
      console.error('Error saving note:', err);
      showNotification?.({
        type: 'error',
        message: 'Failed to save note'
      });
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotes(notes.filter(n => n._id !== noteId));
      showNotification?.({
        type: 'success',
        message: 'Note deleted successfully!'
      });
    } catch (err) {
      console.error('Error deleting note:', err);
      showNotification?.({
        type: 'error',
        message: 'Failed to delete note'
      });
    }
  };

  const handleTogglePin = async (noteId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5000/api/notes/${noteId}/pin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes(notes.map(n => n._id === noteId ? response.data.data : n));
    } catch (err) {
      console.error('Error toggling pin:', err);
      showNotification?.({
        type: 'error',
        message: 'Failed to pin/unpin note'
      });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);

  const containerClass = isDarkMode ? 'notes-container dark' : 'notes-container';

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="notes-header">
        <h2 className="notes-title">📝 My Notes</h2>
        <Button
          onClick={handleCreate}
          className="create-note-btn"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '10px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FontAwesomeIcon icon={faPlus} />
          Create Note
        </Button>
      </div>

      {/* Filters */}
      <div className="notes-filters">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading notes...</p>
        </div>
      ) : (
        <>
          {pinnedNotes.length > 0 && (
            <div className="notes-section">
              <h3 className="section-title">
                <FontAwesomeIcon icon={faThumbtack} /> Pinned
              </h3>
              <div className="notes-grid">
                {pinnedNotes.map(note => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            </div>
          )}

          {unpinnedNotes.length > 0 && (
            <div className="notes-section">
              {pinnedNotes.length > 0 && <h3 className="section-title">All Notes</h3>}
              <div className="notes-grid">
                {unpinnedNotes.map(note => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredNotes.length === 0 && (
            <div className="empty-state">
              <p className="empty-icon">📝</p>
              <p className="empty-text">No notes found</p>
              <p className="empty-subtext">Create your first note to get started!</p>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? 'Edit Note' : 'Create New Note'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter note title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Content *</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                placeholder="Write your note here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Color</Form.Label>
                  <div className="color-picker">
                    {colorOptions.map(color => (
                      <div
                        key={color.value}
                        className={`color-option ${formData.color === color.value ? 'selected' : ''}`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        title={color.name}
                      />
                    ))}
                  </div>
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Tags</Form.Label>
              <div className="tag-input-container">
                <input
                  type="text"
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="tag-input"
                />
                <Button variant="outline-primary" size="sm" onClick={handleAddTag}>
                  <FontAwesomeIcon icon={faTag} /> Add
                </Button>
              </div>
              <div className="tags-display">
                {formData.tags.map(tag => (
                  <span key={tag} className="tag-badge">
                    {tag}
                    <FontAwesomeIcon
                      icon={faTimes}
                      className="tag-remove"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </span>
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            <FontAwesomeIcon icon={faSave} /> {isEditMode ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// Note Card Component
const NoteCard = ({ note, onEdit, onDelete, onTogglePin, isDarkMode }) => {
  return (
    <div
      className="note-card"
      style={{
        backgroundColor: isDarkMode ? '#1f2937' : note.color,
        border: isDarkMode ? '1px solid #374151' : 'none'
      }}
    >
      <div className="note-card-header">
        <span className="note-category">{note.category}</span>
        <button
          className={`pin-btn ${note.isPinned ? 'pinned' : ''}`}
          onClick={() => onTogglePin(note._id)}
          title={note.isPinned ? 'Unpin' : 'Pin'}
        >
          <FontAwesomeIcon icon={faThumbtack} />
        </button>
      </div>

      <h3 className="note-title">{note.title}</h3>
      <p className="note-content">{note.content}</p>

      {note.tags && note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map(tag => (
            <span key={tag} className="note-tag">#{tag}</span>
          ))}
        </div>
      )}

      <div className="note-card-footer">
        <span className="note-date">
          {new Date(note.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
        <div className="note-actions">
          <button
            className="action-btn edit-action"
            onClick={() => onEdit(note)}
            title="Edit"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            className="action-btn delete-action"
            onClick={() => onDelete(note._id)}
            title="Delete"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notes;



