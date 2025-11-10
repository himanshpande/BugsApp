const express = require('express');
const router = express.Router();
const { punchIn, punchOut, getTodayAttendance } = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require logged-in user
router.get('/today', authMiddleware(), getTodayAttendance);
router.post('/punchin', authMiddleware(), punchIn);
router.post('/punchout', authMiddleware(), punchOut);

module.exports = router;
