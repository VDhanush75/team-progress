// src/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const {
  getTasks,
  getMyTasks,
  createTask,
  updateTaskStatus,
} = require('../controllers/taskController');

// All task routes require login
router.use(requireAuth);

// GET /api/tasks/my --> tasks for current user
router.get('/my', getMyTasks);

// GET /api/tasks --> optional ?project=...
router.get('/', getTasks);

// POST /api/tasks
router.post('/', createTask);

// PATCH /api/tasks/:id
router.patch('/:id', updateTaskStatus);

module.exports = router;
