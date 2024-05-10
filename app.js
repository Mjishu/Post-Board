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
const {body,validationResult} = require("express-validator")

require("dotenv").config()
const bcrypt = require("bcryptjs")

const MongoStore = require("connect-mongo");

const mongoDB = process.env.mongoUrl;
mongoose.connect(mongoDB);
const db = mongoose.connection;
db.on("error", console.error.bind(console,"mongo connection uh oh"));


const User = mongoose.model(
  "User",
  new Schema({
    email: {type:String ,required: true},
    username: {type:String ,required: true},
    password: {type:String ,required: true},
    member:{type:Boolean}
  })
)

const postsRoute = require("./routes/posts") //*

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret:process.env.sessionSecret,
   resave:false,
   saveUninitialized:true,
   store: MongoStore.create({mongoUrl:mongoDB})

}))
app.use(passport.session());

app.use("/new-post", postsRoute);

app.get("/", (req,res) =>{
  res.render("index", {user:req.user})
})
app.get("/sign-up", (req,res) => res.render("sign-up-form",{ title:"Sign Up"}))

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

app.post("/sign-up", 
  body('password', "password must be longer than 5 characters").isLength({min:5}).trim().escape(),
  body('confirmPassword').custom((value,{req})=>{ //! Doesnt put error message in body?
    if(value !== req.body.password){
      return Promise.reject("Passwords do not match")
    }
    return true;
  }).trim().withMessage("Passwords do not match").escape(),
  body("email").trim().isEmail().withMessage("Not a valid email").escape(),
  body("username", "username must not be empty").trim().isLength({min:1}).escape()

  ,async(req,res,next)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
      res.render("sign-up-form", {title:"Sign Up Again", errors:errors.array()});
      return
    }

    try{
      const hashedPassword =await bcrypt.hash(req.body.password,10);
      const user = new User({
        email: req.body.email,
        username: req.body.username,
        password:hashedPassword
      })
      const result = await user.save();
      res.redirect('/');
    }catch(err){
      return next(err)
    }
})

passport.use(
  new LocalStrategy(async(username,password,done)=>{
    try{
      const user = await User.findOne({username:username})
      if(!user){
        return done(null,false, {message: "Incorrect username"})
      };
      const match = await bcrypt.compare(password,user.password);
      if(!match){
        return done(null,false,{message:"Incorrect Password"})
      };
      return done(null,user)
    }catch(err){return done(err)}
  })
)

passport.serializeUser((user,done) => {
  console.log("serialize user")
  done(null, user.id)
});

passport.deserializeUser(async(id,done) => {
  try{
    const user = await User.findById(id);
    console.log("user found")
    done(null,user);
  }catch(err){
    console.log("user not found")
    done(err)}
})

app.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
);

app.get("/log-out", (req,res,next) =>{
  req.logout((err)=>{
    if(err){
      return next(err);
    }
    res.redirect("/")
  })
})

module.exports = app;

//todo: populate a posts collection in mongo instead of having the posts hard written in code
//todo: add membership status that gives an advanced functionality? maybe a checkmark on the page idk