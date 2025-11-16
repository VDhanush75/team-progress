const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/teams', require('./teams'));
router.use('/projects', require('./projects'));
router.use('/tasks', require('./tasks'));
router.use('/updates', require('./updates'));

const taskRoutes = require('./taskRoutes');
router.use('/tasks', taskRoutes);

module.exports = router;

// const express = require('express');
// const router = express.Router();

// const taskRoutes = require('./taskRoutes');
// // ... other routes

// router.use('/tasks', taskRoutes);

// module.exports = router;
