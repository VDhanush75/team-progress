const express = require('express');
const Team = require('../models/Team');
const User = require('../models/User');
const { authMiddleware, requireRole } = require('../middlewares/auth');
const router = express.Router();

router.use(authMiddleware);

// create team (manager or admin)
router.post('/', requireRole(['manager','admin']), async (req,res,next)=>{
  try{
    const { name, description } = req.body;
    const team = await Team.create({ name, description, manager: req.user._id, members: [req.user._id] });
    // add team to user
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { teams: team._id }});
    res.json(team);
  }catch(e){ next(e); }
});

// list all teams (any authenticated)
router.get('/', async (req,res,next)=>{
  try{
    const teams = await Team.find().populate('manager','name email').populate('members','name email');
    res.json(teams);
  }catch(e){ next(e); }
});

// add member to team (manager or admin)
router.post('/:id/add-member', requireRole(['manager','admin']), async (req,res,next)=>{
  try{
    const teamId = req.params.id;
    const { memberEmail } = req.body;
    const member = await User.findOne({ email: memberEmail });
    if(!member) return res.status(404).json({ error: 'Member not found' });
    const team = await Team.findById(teamId);
    if(!team) return res.status(404).json({ error: 'Team not found' });
    // Only manager of team or admin can add
    if (req.user.role !== 'admin' && !team.manager.equals(req.user._id)) return res.status(403).json({ error: 'Not authorized' });
    team.members.addToSet(member._id);
    await team.save();
    member.teams.addToSet(team._id);
    await member.save();
    res.json(team);
  }catch(e){ next(e); }
});

module.exports = router;
