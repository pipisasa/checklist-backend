const { Router } = require('express');

const AdminRoutes = require('./admin.routes');
const AuthRouter = require('./auth.routes');
const TasksRoutes = require('./tasks.routes');

const router = Router();

router.use('/auth', AuthRouter);
router.use('/checklists', TasksRoutes);
router.use('/admin', AdminRoutes)

module.exports = router;