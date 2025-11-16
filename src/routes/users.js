const express = require('express');
const User = require('../models/User');
const { authMiddleware, requireRole } = require('../middlewares/auth');
const router = express.Router();

router.use(authMiddleware);

// get all users (admin only)
router.get('/', requireRole(['admin']), async (req,res,next)=>{
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) { next(err); }
});

module.exports = router;
