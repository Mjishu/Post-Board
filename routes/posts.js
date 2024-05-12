const express = require("express");
const router = express.Router();
const {format} = require("date-fns/format");

const post_controller = require("../controllers/postController");
//* ----------------------CREATE POSTS ---------------------------------------

router.get("/", post_controller.post_create_get);

router.post("/", post_controller.post_create_post);

 //! figure out how to call this to update '/' with the posts; maybe delete it here and call it in app.js? 

module.exports = router;