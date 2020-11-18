// import { Response, Router } from 'express';

// import Checklist from '../models/Checklist';
// import auth from '../middlewares/auth.middleware';
// import { check, validationResult } from 'express-validator';

// const ChecklistRoutes = Router();

// ChecklistRoutes.use(auth);

// // ? Create
// ChecklistRoutes.post("/", [
//   check("title").notEmpty().withMessage("\"title\" is empty!"),
//   // check("date").isDate().withMessage("\"date\" must be of type \"Date\""),
// ], async (req:any, res:Response)=>{
//   try {
//     const errors = validationResult(req);
//     if(!errors.isEmpty()){
//       return res.status(400).json({
//         errors: errors.array(),
//         message: "Bad request"
//       })
//     }

//     if(req.body.is_infinite){
//       const checklist = new Checklist({
//         title: req.body.title,
//         date: null,
//         is_infinite: true,
//         owner: req.user.userId
//       });
//       await checklist.save()
//       return res.status(201).json(checklist);
//     }

//     const date = req.body.date ? new Date(req.body.date) : new Date();
//     const to_date = req.body.to_date ? new Date(req.body.to_date) : null;
//     if(to_date){
//       const arr = [];
//       for(let i = date.getTime(); i<=to_date.getTime(); i+=86400000){
//           arr.push(new Checklist({
//             title: req.body.title,
//             date: new Date(i).toDateString(),
//             is_infinite: false,
//             owner: req.user.userId
//           }).save())
//       };
//       const result = await Promise.all(arr);
//       return res.status(201).json(result);
//     }
//     const checklist = new Checklist({
//       title: req.body.title,
//       date: date.toDateString(),
//       is_infinite: false,
//       owner: req.user.userId
//     });
//     await checklist.save()
//     res.status(201).json(checklist);
//   } catch (e) {
//     res.status(500).json({message: "SERVER ERROR"});
//   }
// })

// // ? Read
// ChecklistRoutes.get("/", async (req:any, res:Response)=>{
//   try {
//     const limit = parseInt(req.body.limit || 10);
//     const page = parseInt(req.body.page || 1);
//     const titleLike = new RegExp(req.body.q, "i");
//     const fromDate = req.body.from_date || 0;
//     const checklists = await Checklist.find(
//       { owner: req.user.userId, title: titleLike, $or: [{date: {$gte: fromDate}}, {is_infinite: true}] },
//       null,
//       { sort: "date", skip: (page-1)*limit, limit }
//     );
//     res.status(200).json(checklists);
//   } catch (e) {
//     res.status(500).json({message: "SERVER ERROR", data: e});
//   }
// })

// // ? Update
// ChecklistRoutes.patch("/:id", async (req:any, res:Response)=>{
//   try {
//     const date = req.body.date ? new Date(new Date(req.body.date).toJSON().split("T")[0]).getTime() : null;
//     const data:any = {};
//     if(req.body.title)data.title = req.body.title;
//     if(date)data.date = date;
//     if(typeof req.body.is_infinite === "boolean"){
//       data.is_infinite = req.body.is_infinite;
//       data.date = req.body.is_infinite ? null : date;
//     }
//     if(req.body.status)data.status = req.body.status;

//     await Checklist.findByIdAndUpdate(req.params.id, data);
//     return res.status(200).json({ok: true, message: "Succesfull"});
//   } catch (e) {
//     res.status(500).json({message: "SERVER ERROR"});
//   }
// })

// // ? Delete
// ChecklistRoutes.delete("/:id", async (req:any, res:Response)=>{
//   try {
//     const checklist = await Checklist.findOneAndDelete({
//       _id: req.params.id,
//       owner: req.user.userId
//     });
//     if(!checklist)return res.status(404).json({
//       message: `Checklist with id - "${req.params.id}" is not defined`
//     });
//     res.status(200).json(checklist);
//   } catch (e) {
//     res.status(500).json({message: "SERVER ERROR"});
//   }
// })

// export default ChecklistRoutes;