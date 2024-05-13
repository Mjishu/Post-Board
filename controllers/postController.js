const Post = require("../models/posts");
const asyncHandler = require("express-async-handler");
const {body,validationResult} = require("express-validator");
const {format} = require("date-fns/format");
const posts = require("../models/posts");


exports.post_create_get = asyncHandler(async(req,res,next)=>{
    res.render("create-post", {title:"Create Post"})
    console.log("post get")
});

exports.post_create_post = [
    body("title", "Title must not be empty").trim().isLength({min:1}).escape(),
    body("desc", "description must not be empty").trim().isLength({min:1}).escape(),
    body("date").trim().escape(),

    asyncHandler(async(req,res,next) =>{
        const errors = validationResult(req);
        console.log("post post")

        const post = new Post({title:req.body.title, desc:req.body.desc, date:format(new Date(), 'do/MMM/yyyy'), user:req.user.username})
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

exports.post_list = asyncHandler(async(req,res,next) =>{ //! I need to figure out where to call this so that I can show the posts
    //console.log("post_list") //? I dont think its even getting here because its not logging this at all
    const allPosts = await Post.find({}, "title desc date user" )
        .sort({date:1})
        .exec()

        res.render("index", {title:"Posts:", post_list:allPosts, user:req.user})
        //console.log(allPosts)
   
})

exports.deletePost_get = asyncHandler(async(req,res,next) => {
    console.log("delete Post get")
    const post = await Post.findById(req.params.id).exec()

    if(post === null){
        res.redirect("/")
    }
    console.log(post._id)
    res.render("delete-post",{title:"Delete Post", post:post})
})

exports.deletePost_post = asyncHandler(async(req,res,next) => {

    await Post.findByIdAndDelete(req.params.id) //! What do i replace postId with
    res.redirect("/")
})

//todo: Check where post_list gets called, idk if thats it but that might be why its not loading any posts? its not logging any of my post elements but
//todo: ill try making a new post and see if it logs the create elements?