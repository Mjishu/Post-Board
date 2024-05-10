const Post = require("../models/posts");
const asyncHandler = require("express-async-handler");
const {body,validationResult} = require("express-validator");
const {format} = require("date-fns/format");
const posts = require("../models/posts");


exports.post_create_get = asyncHandler(async(req,res,next)=>{
    res.render("create-post", {title:"Create Post"})
});

exports.post_create_post = [
    body("title", "Title must not be empty").trim().isLength({min:1}).escape(),
    body("desc", "description must not be empty").trim().isLength({min:1}).escape(),
    body("date").trim().escape(),

    asyncHandler(async(req,res,next) =>{
        const errors = validationResult(req);

        const post = new Post({title:req.body.title, desc:req.body.desc, date:format(new Date(), 'do/MMM/yyyy'), user:{/* Find the current logged in user */}})
        console.log(post)

        if(!errors.isEmpty()){
            res.render("create-post",{title:"Create Post", errors: errors.array()});
            return
        }else{
            await post.save();
            res.redirect("/") //? Maybe change to the posts url? 
        }
    })
]

exports.post_list = asyncHandler(async(req,res,next) =>{
    const allPosts = await Post.find({}, "title desc date" )
        .sort({date:1})
        .exec()

        res.render("posts_list", {title:"Posts:", post_list: allPosts})
})