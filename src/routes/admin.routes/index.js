const { Router } = require("express");
const { models } = require("../../utils");
const auth = require("../../middlewares/auth.middleware");
const isAdmin = require("../../middlewares/admin.middleware");
const UserTasksRoutes = require("./user_tasks.routes");
const { check } = require("express-validator");
// const User = require("../models/User");

const AdminRoutes = Router();

AdminRoutes.use(auth, isAdmin);

AdminRoutes.get('/users', async (_,res)=>{
  try {
    const result = await models.users.findAll();
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({message: "SERVER ERROR"});
  }
})


AdminRoutes.get('/users/:id', async (req,res)=>{
  try {
    const result = await models.users.findByPk(req.params.id);
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({message: "SERVER ERROR"});
  }
})


AdminRoutes.delete('/users/:id', async (req,res)=>{
  try {
    const result = await models.users.destroy({
      where:{
        id: req.params.id
      }
    });
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({message: "SERVER ERROR"});
  }
})

AdminRoutes.use("/users/:id/tasks", UserTasksRoutes);

AdminRoutes.patch('/users/:id',[
  check("role").isString().custom((val)=>["ADMIN", "USER"].includes(val)).withMessage("role must be one of (ADMIN, USER)").notEmpty().withMessage("role - is required!"),
], async (req,res)=>{
  try {
    if(!["CREATOR", "SUPER_ADMIN"].includes(req.user.role)){
      return res.status(301).json({ message: "Permission denied!" })
    }
    await models.users.update({role: req.body.role},{
      where:{
        id: req.params.id
      }
    });
    res.status(200).json({ok: true, message: "Successful"});
  } catch (e) {
    res.status(500).json({message: "SERVER ERROR"});
  }
})

module.exports = AdminRoutes;