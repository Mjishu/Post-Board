const express = require("express");
const router = express.Router();
const {format} = require("date-fns/format");

const post_controller = require("../controllers/postController");

router.get("/", function(req,res,next){
    res.render("create-post",{title:"Create New Post"})
})

router.post("/new-post",function(req,res,next){
    const message = req.body.message; //? This shouldnt be a body.message it should just take the current logged in user
    const user = req.body.user;
    const dateCreated = format(new Date(), 'do/MMM/yyyy')
    Posts.push({text:message,user:user,added:dateCreated}) //? create a new collection in mongo to store posts?
    res.redirect("/")
})

//* ----------------------CREATE POSTS ---------------------------------------

router.get("/", post_controller.post_create_get);

router.post("/", post_controller.post_create_post);

module.exports = router;