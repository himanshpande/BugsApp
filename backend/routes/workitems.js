const express = require('express');
const router = express.Router();
const { createWorkItem, getAllWorkItems, getMyWorkItems, updateWorkItem, updateWorkItemStatus, deleteWorkItem, addBugToWorkItem, updateBug, deleteBug } = require('../controllers/workItemController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin and Dev routes
router.post('/', authMiddleware(['Admin', 'Dev']), createWorkItem);
router.get('/', authMiddleware(['Admin', 'Dev']), getAllWorkItems);
router.put('/:id', authMiddleware(['Admin', 'Dev']), updateWorkItem);

// Dev/Tester/Admin routes
router.get('/my', authMiddleware(['Dev','Tester','Admin']), getMyWorkItems);
router.patch('/:id', authMiddleware(['Dev','Tester','Admin']), updateWorkItemStatus);
router.delete('/:id', authMiddleware(['Admin', 'Dev']), deleteWorkItem);

// Bug routes
router.post('/:id/bugs', authMiddleware(['Admin', 'Dev', 'Tester']), addBugToWorkItem);
router.put('/:workItemId/bugs/:bugId', authMiddleware(['Admin', 'Dev', 'Tester']), updateBug);
router.delete('/:workItemId/bugs/:bugId', authMiddleware(['Admin', 'Dev', 'Tester']), deleteBug);


module.exports = router;
