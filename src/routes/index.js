const { Router } = require('express');

const AdminRoutes = require('./admin.routes');
const AuthRouter = require('./auth.routes');
const TasksRoutes = require('./tasks.routes');
// const AdminBroRoutes = require('./adminBro.routes');

const router = Router();

router.use('/auth', AuthRouter);
router.use('/checklists', TasksRoutes);
router.use('/admin', AdminRoutes);
// router.use('/adminbro', AdminBroRoutes)

module.exports = router;