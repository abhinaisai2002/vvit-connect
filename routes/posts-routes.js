const express = require('express');
const postsRouter = express.Router();
const Post = require('../models/posts')
const Managers = require('../models/manager');
const mongoose = require('mongoose');
const checkAuth = require('../middlewares/check-auth');
const fileUpload = require('../middlewares/file-upload');


postsRouter.use(checkAuth);

postsRouter.get('/',async (req,res,next)=>{
    let posts;
    let postss;
    try{
        posts = await Post.find({})
        postss = posts.map(async (post) => {
            console.log(await post.populate('creator'));
        })
    }catch(err){
        next({
            error:"Could not retrive posts.Please try again later.",
            status:500
        })
    }
    if(!posts || posts.length === 0){
        return next({
            error:"There are no posts to show.Please try again later.",
            status:404
        })
    }

    return res
            .status(200)
            .json({
                posts:posts
            })
})

postsRouter.get('/:pid',async (req,res,next)=>{
    const placeId = req.params.pid;
    console.log('hello');
    let post;
    try{
        post = await Post.findById(placeId);
    }catch(err){
        next({
            error:"Something went wrong.Could find a post.",
            status:500
        })
    }
    if(!post){
        next({
            error:"Could not find a post for the given url.Please try again later.",
            status:404,
        })
    }
    return res.json({post:post.toObject({getters:true})})
})

postsRouter.get('/manager/:mid',async (req,res,next)=>{
    const managerId = req.params.mid;
    console.log(managerId);
    let userWithPlaces;
    try{
        userWithPlaces = await Managers.findById(managerId).populate('posts')
    }catch(err){
        return next({
            error:"Fetching places failed.Please try again later.",
            status:500
        })
    }
    if(!userWithPlaces || userWithPlaces.posts.length === 0){
        return next({
            error:"Could not find places for provide id.",
            status:404
        })
    }

    return res.json({
        places:userWithPlaces.posts.map(post => {
            return post.toObject({getters:true})
        })
    })
})

postsRouter.post('/',
    fileUpload.single('image'),
    async (req,res,next)=>{
    const {
        creator,
        description,
    } = req.body;
    let user;
    try{
        user = await Managers.findById(creator)
    }catch(err){
        return next({
            error:"Creating a post failed.Try Again later",
            status:500
        })
    }
    if(!user){
        return next({
            error:"Could find the user for the provided id.",
            status:404
        })   
    }
    
    const createdPost = new Post({
      createdBy:user.name,  
      creator: creator,
      description: description,
      image: req.file.path
    });
    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPost.save({session:sess})
        user.posts.push(createdPost)
        await user.save({session:sess})
        await sess.commitTransaction();
    }catch(err){
        next({
            error:"Could not create a post.Try again later",
            status:500
        })
    }

    return res.status(201).json({
        post:createdPost
    })
})

postsRouter.post('/delete/:pid',async (req,res,next)=>{
    const postId = req.params.pid;

    let post;
    try{
        post = await (await Post.findById(postId)).populate('creator');
    }catch(err){
        next({
            error:"Something went wrong.Could not delete post.",
            status:500
        })
    }
    if(!post){
        next({
            error:"Could not find place for this id",
            status:404
        })
    }

    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await post.remove({session:sess});
        post.creator.posts.pull(post)
        await place.creator.save({session:sess});
        sess.commitTransaction();
    }catch(err){
        next({
            error:"Something went wrong.Could not delete place.",
            status:500
        })
    }
})

module.exports = postsRouter