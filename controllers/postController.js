const Post = require("../models/posts");
const asyncHandler = require("express-async-handler");
const {body,validationResult} = require("express-validator");
const {format} = require("date-fns/format")


exports.post_create_get = asyncHandler(async(req,res,next)=>{
    res.render("create-post", {})
});

exports.post_create_post = [
    body("title", "Title must not be empty").trim().isLength({min:1}).escape(),
    body("desc", "description must not be empty").trim().isLength({min:1}).escape(),
    body("date").trim().escape(),

    asyncHandler(async(req,res,next) =>{
        const errors = validationResult(req);

        const post = new Post({title:req.body.title, desc:req.body.desc, date:format(new Date(), 'do/MMM/yyyy')})
        console.log(post)

        if(!errors.isEmpty()){
            res.render("create-post",{title:"Create Post", errors: errors.array()});
            console.log("uh oh errror territory")
            return
        }else{
            await post.save();
            res.redirect("/") //? Maybe change to the posts url? 
            console.log("we made it to the end")
        }
    })
]