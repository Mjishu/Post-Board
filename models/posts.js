const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title:{type:String, required:true},
    desc:{type:String},
    date:{},
    user:{},
})

PostSchema.virtual("url").get(function(){
    return `/${this._id}`
})

module.exports = mongoose.model("Post", PostSchema)