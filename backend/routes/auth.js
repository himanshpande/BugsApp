const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

// Register a new user
router.post('/register', register);

// Login
router.post('/login', login);

// Get current user info (for debugging)
router.get('/me', authMiddleware([]), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user: user,
      userRole: user.role,
      userRoleType: typeof user.role,
      userRoleLength: user.role ? user.role.length : 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Test endpoint to check role permissions
router.get('/test-role', authMiddleware(['Admin', 'Dev', 'Tester']), async (req, res) => {
  res.json({
    success: true,
    message: 'Role test successful',
    userRole: req.user.role,
    allowedRoles: ['Admin', 'Dev', 'Tester']
  });
});

// Get all users (Admin and Dev only)
router.get('/users', authMiddleware(['Admin', 'Dev']), async (req, res) => {
  try {
    const users = await User.find({}, 'name email role'); // return only necessary fields
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update user role (Admin only)
router.put('/users/:id/role', authMiddleware(['Admin']), async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['Admin', 'Dev', 'Tester'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be Admin, Dev, or Tester' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('name email role');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User role updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
