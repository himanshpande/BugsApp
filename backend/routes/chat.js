const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const auth = authMiddleware();

// ============ CONVERSATIONS ============

// Get all conversations for the authenticated user
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      'participants.userId': req.user.id,
      isArchived: false
    })
    .populate('participants.userId', 'name email avatarDataUrl')
    .populate('lastMessage.sender', 'name avatarDataUrl')
    .populate('createdBy', 'name email')
    .sort({ updatedAt: -1 });

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find(
          p => p.userId._id.toString() === req.user.id
        );
        
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          createdAt: { $gt: participant?.lastRead || new Date(0) },
          sender: { $ne: req.user.id }
        });

        const convObj = conv.toObject();
        convObj.unreadCount = unreadCount;
        return convObj;
      })
    );

    res.json({ success: true, data: conversationsWithUnread });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Create a new direct conversation
router.post('/conversations/direct', auth, async (req, res) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ success: false, message: 'Participant ID is required' });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      type: 'direct',
      'participants.userId': { $all: [req.user.id, participantId] }
    })
    .populate('participants.userId', 'name email avatarDataUrl')
    .populate('lastMessage.sender', 'name avatarDataUrl');

    if (existingConversation) {
      return res.json({ success: true, data: existingConversation, exists: true });
    }

    // Get participant info
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create new conversation
    const newConversation = new Conversation({
      type: 'direct',
      participants: [
        { userId: req.user.id, role: 'member' },
        { userId: participantId, role: 'member' }
      ],
      createdBy: req.user.id
    });

    await newConversation.save();

    const populatedConversation = await Conversation.findById(newConversation._id)
      .populate('participants.userId', 'name email avatarDataUrl')
      .populate('createdBy', 'name email');

    res.status(201).json({ success: true, data: populatedConversation });
  } catch (err) {
    console.error('Error creating direct conversation:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Create a new group conversation
router.post('/conversations/group', auth, async (req, res) => {
  try {
    const { name, description, participantIds } = req.body;

    if (!name || !participantIds || participantIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Group name and participants are required' 
      });
    }

    // Create participants array with creator as admin
    const participants = [
      { userId: req.user.id, role: 'admin' }
    ];

    // Add other participants as members
    participantIds.forEach(id => {
      if (id !== req.user.id) {
        participants.push({ userId: id, role: 'member' });
      }
    });

    const newGroup = new Conversation({
      name,
      description,
      type: 'group',
      participants,
      createdBy: req.user.id
    });

    await newGroup.save();

    const populatedGroup = await Conversation.findById(newGroup._id)
      .populate('participants.userId', 'name email avatarDataUrl')
      .populate('createdBy', 'name email avatarDataUrl');

    res.status(201).json({ success: true, data: populatedGroup });
  } catch (err) {
    console.error('Error creating group:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Update group details
router.put('/conversations/:conversationId', auth, async (req, res) => {
  try {
    const { name, description, avatarUrl } = req.body;
    
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      'participants.userId': req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (conversation.type !== 'group') {
      return res.status(400).json({ success: false, message: 'Can only update group conversations' });
    }

    // Check if user is admin
    const participant = conversation.participants.find(
      p => p.userId.toString() === req.user.id
    );

    if (participant?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can update group details' });
    }

    if (name) conversation.name = name;
    if (description !== undefined) conversation.description = description;
    if (avatarUrl) conversation.avatarUrl = avatarUrl;

    await conversation.save();

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants.userId', 'name email avatarDataUrl')
      .populate('createdBy', 'name email avatarDataUrl');

    res.json({ success: true, data: populatedConversation });
  } catch (err) {
    console.error('Error updating conversation:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Add members to group
router.post('/conversations/:conversationId/members', auth, async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'User IDs array is required' });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      type: 'group',
      'participants.userId': req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Add new participants
    userIds.forEach(userId => {
      const exists = conversation.participants.some(
        p => p.userId.toString() === userId
      );
      if (!exists) {
        conversation.participants.push({ userId, role: 'member' });
      }
    });

    await conversation.save();

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants.userId', 'name email avatarDataUrl');

    res.json({ success: true, data: populatedConversation });
  } catch (err) {
    console.error('Error adding members:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Leave group
router.delete('/conversations/:conversationId/leave', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      type: 'group',
      'participants.userId': req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    conversation.participants = conversation.participants.filter(
      p => p.userId.toString() !== req.user.id
    );

    await conversation.save();

    res.json({ success: true, message: 'Left group successfully' });
  } catch (err) {
    console.error('Error leaving group:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ============ MESSAGES ============

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { limit = 50, before } = req.query;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      'participants.userId': req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const query = { conversationId: req.params.conversationId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name email avatarDataUrl')
      .populate('replyTo')
      .populate('readBy.userId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Update last read timestamp
    await Conversation.updateOne(
      { 
        _id: req.params.conversationId,
        'participants.userId': req.user.id 
      },
      { 
        $set: { 'participants.$.lastRead': new Date() }
      }
    );

    res.json({ success: true, data: messages.reverse() });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const { content, messageType = 'text', replyTo } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      'participants.userId': req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const newMessage = new Message({
      conversationId: req.params.conversationId,
      sender: req.user.id,
      content: content.trim(),
      messageType,
      replyTo: replyTo || undefined
    });

    await newMessage.save();

    // Update conversation's last message
    conversation.lastMessage = {
      content: content.trim(),
      sender: req.user.id,
      timestamp: new Date()
    };
    conversation.updatedAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name email avatarDataUrl')
      .populate('replyTo');

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Edit a message
router.put('/messages/:messageId', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const message = await Message.findOne({
      _id: req.params.messageId,
      sender: req.user.id
    });

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found or unauthorized' });
    }

    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email avatarDataUrl');

    res.json({ success: true, data: populatedMessage });
  } catch (err) {
    console.error('Error editing message:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Delete a message
router.delete('/messages/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.messageId,
      sender: req.user.id
    });

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found or unauthorized' });
    }

    await message.deleteOne();

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Search messages
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    // Get user's conversations
    const userConversations = await Conversation.find({
      'participants.userId': req.user.id
    }).select('_id');

    const conversationIds = userConversations.map(c => c._id);

    const messages = await Message.find({
      conversationId: { $in: conversationIds },
      content: { $regex: query, $options: 'i' }
    })
    .populate('sender', 'name email avatarDataUrl')
    .populate('conversationId', 'name type')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({ success: true, data: messages });
  } catch (err) {
    console.error('Error searching messages:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;



