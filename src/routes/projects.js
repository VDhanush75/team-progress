const express = require('express');
const Project = require('../models/Project');
const Team = require('../models/Team');
const { authMiddleware, requireRole } = require('../middlewares/auth');
const router = express.Router();

router.use(authMiddleware);

// create project (manager/admin) — manager must belong to team
router.post('/', requireRole(['manager','admin']), async (req,res,next) => {
  try{
    const { teamId, name, description, startDate, dueDate } = req.body;
    const team = await Team.findById(teamId);
    if(!team) return res.status(404).json({ error: 'Team not found' });
    // only team manager or admin can create
    if (req.user.role !== 'admin' && !team.manager.equals(req.user._id)) return res.status(403).json({ error: 'Not authorized' });
    const project = await Project.create({ team: teamId, name, description, startDate, dueDate, createdBy: req.user._id });
    res.json(project);
  }catch(e){ next(e); }
});

// get projects for a team
router.get('/', async (req,res,next) => {
  try {
    const { team } = req.query;
    const query = team ? { team } : {};
    const projects = await Project.find(query).populate('team','name').populate('createdBy','name email');
    res.json(projects);
  } catch (e) { next(e); }
});

module.exports = router;
