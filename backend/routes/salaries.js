const express = require('express');
const router = express.Router();
const { 
  getAllSalaries, 
  createSalary, 
  updateSalary, 
  deleteSalary, 
  getStaffSalaries,
  getMySalaries
} = require('../controllers/salaryController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all salary records (Admin only)
router.get('/', authMiddleware(['Admin']), getAllSalaries);

// Create new salary record (Admin only)
router.post('/', authMiddleware(['Admin']), createSalary);

// Update salary record (Admin only)
router.put('/:id', authMiddleware(['Admin']), updateSalary);

// Delete salary record (Admin only)
router.delete('/:id', authMiddleware(['Admin']), deleteSalary);

// Get salary records for specific staff member (Admin only)
router.get('/staff/:staffId', authMiddleware(['Admin']), getStaffSalaries);

// Get current user's own salary records (Dev/Tester/Admin)
router.get('/my', authMiddleware(['Dev', 'Tester', 'Admin']), getMySalaries);

module.exports = router;
