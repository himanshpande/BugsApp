const express = require('express');
const router = express.Router();
const { 
  punchIn, 
  punchOut, 
  getMyPunchRecords, 
  getAllPunchRecords, 
  getPunchStatus,
  updatePunchRecord,
  deletePunchRecord,
  getTotalTimeForDay
} = require('../controllers/punchController');
const authMiddleware = require('../middleware/authMiddleware');

// All users can punch in/out and view their own records
router.post('/punch-in', authMiddleware(['Dev', 'Tester', 'Admin']), punchIn);
router.post('/punch-out', authMiddleware(['Dev', 'Tester', 'Admin']), punchOut);
router.get('/my', authMiddleware(['Dev', 'Tester', 'Admin']), getMyPunchRecords);
router.get('/status', authMiddleware(['Dev', 'Tester', 'Admin']), getPunchStatus);
router.get('/total-time', authMiddleware(['Dev', 'Tester', 'Admin']), getTotalTimeForDay);

// Admin only routes
router.get('/all', authMiddleware(['Admin']), getAllPunchRecords);
router.put('/:id', authMiddleware(['Admin']), updatePunchRecord);
router.delete('/:id', authMiddleware(['Admin']), deletePunchRecord);

module.exports = router;
