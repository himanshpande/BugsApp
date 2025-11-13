const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Work', 'Personal', 'Ideas', 'Todo', 'Other'],
    default: 'Other'
  },
  color: {
    type: String,
    default: '#fef3c7' // Default yellow
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);






