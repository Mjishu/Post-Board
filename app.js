const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

require("dotenv").config()
const bcrypt = require("bcryptjs")

const mongoDB = process.env.mongoUrl;
mongoose.connect(mongoDB);
const db = mongoose.connection;
db.on("error", console.error.bind(console,"mongo connection uh oh"))

const indexRouter = require('./routes/index');
const signUpRouter = require('./routes/signup');

const User = mongoose.model(
  "User",
  new Schema({
    firstName: {type:String ,required: true},
    lastName: {type:String ,required: true},
    email: {type:String ,required: true},
    password: {type:String ,required: true},
  })
)


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:process.env.sessionSecret, resave:false,saveUninitialized:true,}))
app.use(passport.session());


app.use('/', indexRouter);
app.get("/sign-up", (req,res) => res.render("sign-up-form"))

// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
  next(createError(404));
});
*/
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.post("/sign-up", async(req,res,next)=>{
  console.log("starts post")
  try{
    const hashedPassword =await bcrypt.hash(req.body.password,10);
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password:hashedPassword
    })
    const result = await user.save();
    res.redirect('/');
  }catch(err){
    return next(err)
  }
})
module.exports = app;

//todo problems with sign up button gives error 404 on line 50 so soemthings wrong i just dont know where at 