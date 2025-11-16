// src/controllers/taskController.js
const Task = require('../models/Task');

// GET /api/tasks?project=...
// Returns tasks filtered by project (or all if no filter)
exports.getTasks = async (req, res) => {
  try {
    const filter = {};

    if (req.query.project) {
      filter.project = req.query.project;
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email')
      .populate({
        path: 'project',
        select: 'name team',
        populate: { path: 'team', select: 'name' },
      })
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// NEW: GET /api/tasks/my
// Returns tasks assigned to the current logged-in user (req.user.id)
exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id; // set by authMiddleware

    const tasks = await Task.find({ assignee: userId })
      .populate('assignee', 'name email')
      .populate({
        path: 'project',
        select: 'name team',
        populate: { path: 'team', select: 'name' },
      })
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error('Error fetching my tasks', err);
    res.status(500).json({ error: 'Failed to fetch my tasks' });
  }
};

// POST /api/tasks
// Body: { projectId, title, description, assigneeId? }
exports.createTask = async (req, res) => {
  try {
    const { projectId, title, description, assigneeId } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({ error: 'projectId and title are required' });
    }

    const task = await Task.create({
      project: projectId,
      title,
      description,
      // if frontend sends assigneeId, use it; else assign to current user
      assignee: assigneeId || req.user.id,
    });

    const populated = await task
      .populate('assignee', 'name email')
      .populate({
        path: 'project',
        select: 'name team',
        populate: { path: 'team', select: 'name' },
      });

    res.status(201).json(populated);
  } catch (err) {
    console.error('Error creating task', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// PATCH /api/tasks/:id
// Body: { status }
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['todo', 'inprogress', 'done'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('assignee', 'name email')
      .populate({
        path: 'project',
        select: 'name team',
        populate: { path: 'team', select: 'name' },
      });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    console.error('Error updating task', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
};
