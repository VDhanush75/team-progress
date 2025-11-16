const express = require('express');
const Update = require('../models/Update');
const { authMiddleware, requireRole } = require('../middlewares/auth');
const router = express.Router();

router.use(authMiddleware);

// post an update
router.post('/', async (req,res,next)=>{
  try{
    const { projectId, taskId, content } = req.body;
    const update = await Update.create({
      project: projectId || null,
      task: taskId || null,
      author: req.user._id,
      content
    });
    res.json(update);
  }catch(e){ next(e); }
});

// get updates for a project
router.get('/', async (req,res,next)=>{
  try{
    const { project } = req.query;
    const q = project ? { project } : {};
    const updates = await Update.find(q).populate('author','name email').populate('task','title');
    res.json(updates);
  }catch(e){ next(e); }
});

// approve update (manager/admin)
router.patch('/:id/approve', requireRole(['manager','admin']), async (req,res,next) => {
  try{
    const upd = await Update.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    res.json(upd);
  }catch(e){ next(e); }
});

module.exports = router;
