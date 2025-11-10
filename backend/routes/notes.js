const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const authMiddleware = require('../middleware/authMiddleware');

// Create auth wrapper for routes (no role restrictions for notes)
const auth = authMiddleware();

// Get all notes for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id })
      .populate('createdBy', 'name email avatarDataUrl')
      .sort({ isPinned: -1, createdAt: -1 });
    
    res.json({ success: true, data: notes });
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Create a new note
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, color, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const newNote = new Note({
      title,
      content,
      category: category || 'Other',
      color: color || '#fef3c7',
      tags: tags || [],
      userId: req.user.id,
      createdBy: req.user.id
    });

    await newNote.save();
    
    const populatedNote = await Note.findById(newNote._id)
      .populate('createdBy', 'name email avatarDataUrl');

    res.status(201).json({ success: true, data: populatedNote });
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Update a note
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, category, color, tags, isPinned } = req.body;
    
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Update fields
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (category !== undefined) note.category = category;
    if (color !== undefined) note.color = color;
    if (tags !== undefined) note.tags = tags;
    if (isPinned !== undefined) note.isPinned = isPinned;

    await note.save();
    
    const populatedNote = await Note.findById(note._id)
      .populate('createdBy', 'name email avatarDataUrl');

    res.json({ success: true, data: populatedNote });
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Toggle pin status
router.patch('/:id/pin', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    note.isPinned = !note.isPinned;
    await note.save();
    
    const populatedNote = await Note.findById(note._id)
      .populate('createdBy', 'name email avatarDataUrl');

    res.json({ success: true, data: populatedNote });
  } catch (err) {
    console.error('Error toggling pin:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Delete a note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    await note.deleteOne();
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Search notes
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const notes = await Note.find({
      userId: req.user.id,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    })
    .populate('createdBy', 'name email avatarDataUrl')
    .sort({ isPinned: -1, createdAt: -1 });

    res.json({ success: true, data: notes });
  } catch (err) {
    console.error('Error searching notes:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;

