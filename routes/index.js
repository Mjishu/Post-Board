var express = require('express');
const passport = require('passport');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home Page' });
});

router.post("/log-in", passport.authenticate("local"), (req,res,next)=>{})

module.exports = router;
