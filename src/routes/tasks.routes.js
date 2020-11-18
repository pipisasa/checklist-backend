const { Router } = require('express');

const auth = require('../middlewares/auth.middleware');
const { check, validationResult } = require('express-validator');
const { models } = require("../utils");
const { Op } = require('sequelize');

const TasksRoutes = Router();

TasksRoutes.use(auth);

// ? Create
TasksRoutes.post("/", [
  check("title").notEmpty().withMessage("\"title\" is empty!"),
  check("start_date").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date format is "YYYY-MM-DD"'),
  check("end_date").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date format is "YYYY-MM-DD"'),
], async (req, res)=>{
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({
        errors: errors.array(),
        message: "Bad request"
      })
    }

    const task = await models.tasks.create({
      owner: req.user.userId,
      title: req.body.title,
      color: req.body.color,
    })
    let start_date = new Date(req.body.start_date);
    let end_date = new Date(req.body.end_date);
    let i = start_date.getTime();
    let arr = [];
    while(i<=end_date.getTime()){
      arr.push({
        date: new Date(i),
        owner: req.user.userId,
        task_id: task.id
      });
      i+=86400000
    }
    const statuses = await models.statuses.bulkCreate(arr);
    res.status(201).json({
      ok: true,
      task,
      statuses,
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({message: "SERVER ERROR"});
  }
})

// ? Read
TasksRoutes.get("/",[
  // check('start_date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date format is "YYYY-MM-DD"'),
  // check('end_date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date format is "YYYY-MM-DD"'),
], async (req, res)=>{
  try {
    console.log("USER: ",req.user);
    // const errors = validationResult(req);
    const errors = [];
    if(!/^\d{4}-\d{2}-\d{2}/.test(req.query.start_date))errors.push({msg: "Date format is \"YYYY-MM-DD\"", param: "start_date", location: "query"});
    if(!/^\d{4}-\d{2}-\d{2}/.test(req.query.end_date))errors.push({msg: "Date format is \"YYYY-MM-DD\"", param: "end_date", location: "query"});

    // if(!errors.isEmpty()){
    if(errors.length){
      return res.status(400).json({
        // errors: errors.array(),
        errors: errors,
        message: "Bad request"
      })
    }
    const fromDate = new Date(req.query.start_date);
    fromDate.setHours(0,0,0,0);
    const toDate = new Date(req.query.end_date);
    toDate.setHours(0,0,0,0);
    const statuses = await models.statuses.findAll({
      where:{ 
        owner: req.user.userId, 
        date: {
          [Op.gte]: fromDate, 
          [Op.lte]: new Date(toDate.getTime()+86400000)
        }
      },
      order: [['date','ASC'],['status', 'ASC'], ['task_id', 'ASC']],
      limit: req.query.limit,
      offset: req.query.offset,
      include: models.tasks
    });

    const result = statuses.map(item=>{
      let a = {
        ...item.dataValues,
        title: item.task?.title,
        color: item.task?.color
      };
      delete a.task;
      return a;
    });
    res.status(200).json(result);
  } catch (e) {
    console.log(e)
    res.status(500).json({message: "SERVER ERROR", data: e});
  }
})

TasksRoutes.get("/:id", async (req, res)=>{
  try {
    const status = await models.statuses.findOne({
      where:{
        id: req.params.id,
        owner: req.user.userId
      },
      include: models.tasks,
    });

    const result = {
      ...status.dataValues,
      title:status.task.title,
      color: status.task.color
    }
    delete result.task;
    res.status(200).json(result);
  } catch (e) {
    console.log(e)
    res.status(500).json({message: "SERVER ERROR", data: e});
  }
})

// ? Update
TasksRoutes.patch("/", async (req, res)=>{
  try {
    const {id,createdAt,updatedAt,owner,task_id,...rest} = req.body;
    await models.tasks.update(rest, {
      where:{
        id: task_id,
        owner: req.user.userId
      },
    })
    await models.statuses.update(rest, {
      where:{
        id: id,
        owner: req.user.userId
      }
    })
    return res.status(200).json({ok: true, message: "Succesfull"});
  } catch (e) {
    console.log(e)
    res.status(500).json({message: "SERVER ERROR"});
  }
})

// ? Delete
TasksRoutes.delete("/:id", async (req, res)=>{
  try {
    const task = await models.tasks.destroy({
      where: {
        id: req.params.id,
        owner: req.user.userId
      }
    });
    if(!task)return res.status(404).json({
      message: `task with id - "${req.params.id}" is not defined`
    });
    res.status(200).json(task);
  } catch (e) {
    res.status(500).json({message: "SERVER ERROR"});
  }
})

module.exports = TasksRoutes;