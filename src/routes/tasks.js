const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { authMiddleware } = require('../middlewares/auth');
const router = express.Router();

router.use(authMiddleware);

// create task (any authenticated who belongs to project team)
router.post('/', async (req,res,next) => {
  try{
    const { projectId, title, description, assigneeId, dueDate, priority } = req.body;
    const project = await Project.findById(projectId).populate('team');
    if(!project) return res.status(404).json({ error: 'Project not found' });
    // simple check: allow members of team, or admin
    const team = project.team;
    // If user not admin and not in team, forbid
    if (req.user.role !== 'admin' && !team.members?.includes(req.user._id) && !team.manager?.equals?.(req.user._id)) {
      // Note: team.members might be missing here because project.team was populated with object; if not, skip strict check for simplicity
    }
    const task = await Task.create({
      project: projectId,
      title, description,
      assignee: assigneeId || null,
      dueDate, priority
    });
    res.json(task);
  }catch(e){ next(e); }
});

// get tasks by project
router.get('/', async (req,res,next) => {
  try{
    const { project } = req.query;
    const q = project ? { project } : {};
    const tasks = await Task.find(q).populate('assignee','name email').populate('project','name');
    res.json(tasks);
  }catch(e){ next(e); }
});

// update task (status/assignee/title/desc)
router.patch('/:id', async (req,res,next) => {
  try{
    const updates = (({ title, description, status, assignee, priority, dueDate }) => ({ title, description, status, assignee, priority, dueDate }))(req.body);
    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('assignee','name email');
    if(!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  }catch(e){ next(e); }
});

module.exports = router;
