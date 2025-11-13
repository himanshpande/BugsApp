const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['direct', 'group'],
    required: true
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastRead: {
      type: Date,
      default: Date.now
    }
  }],
  description: {
    type: String,
    trim: true
  },
  avatarUrl: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  settings: {
    muteNotifications: {
      type: Boolean,
      default: false
    },
    allowMembersToAddOthers: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ type: 1, updatedAt: -1 });
conversationSchema.index({ createdBy: 1 });

// Virtual for unread count
conversationSchema.virtual('unreadCount').get(function() {
  return this._unreadCount || 0;
});

conversationSchema.set('toJSON', { virtuals: true });
conversationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Conversation', conversationSchema);






