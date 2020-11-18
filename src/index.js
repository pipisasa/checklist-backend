require('dotenv').config();
const colors = require('colors/safe')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const qs = require('qs')

const routes = require('./routes')
const cookieParser = require('cookie-parser')
const {db} = require('./utils');
// import jwt = require('jsonwebtoken';

const app = express();

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || 'localhost';
const PROTOCOL = process.env.PROTOCOL || 'http';

// ?Middlewares
app.use(cors());
// app.use(formidable());
// app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, _, next)=>{
console.log(`
  ${colors.green('Method')}: ${req.method}
  ${colors.green('Path')}: ${req.path}
  ${colors.green('Query')}: ${qs.stringify(req.query)}
  ${colors.green('Body')}: ${JSON.stringify(req.body)}
`);
  // console.log(`\n${colors.green(req.method)}${colors.red(req.url)}`);
  next();
})


// ? Routes
app.use('/api/v1', routes);


app.get("/", (_, res)=>{
  res.sendFile(__dirname+'/index.html')
});

// ? Main
const main = async ()=>{
  try {
    // await mongoose.connect(process.env.MONGO_URI, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    //   useCreateIndex: true,
    //   useFindAndModify: false,
    // })
    app.listen(PORT, ()=>{
      console.log(`Server started on ${PROTOCOL}://${HOST}:${PORT}`)
    })
  } catch (e) {
    process.exit(1);
  }
};

db.sync({ force: !true })
  .then(main)
  .catch(err=>console.log(err));