const express = require('express');
const postsRouter = express.Router();
const Post = require('../models/Posts')
const Managers = require('../models/Manager');
const mongoose = require('mongoose');
const checkAuth = require('../middlewares/check-auth');
const fileUpload = require('../middlewares/file-upload');
const UserModel = require('../models/User');


postsRouter.use(checkAuth);

postsRouter.get('/',async (req,res,next)=>{
    let posts;
    try{
        posts = await Post.find().populate('creator');
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

    return res.status(200).json({posts:posts})
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
    let userWithPosts;
    try{
        userWithPosts = await Managers.findById(managerId).populate('posts')
    }catch(err){
        return next({
            error:"Fetching places failed.Please try again later.",
            status:500
        })
    }
    if(!userWithPosts || userWithPosts.posts.length === 0){
        return next({
            error:"Could not find places for provide id.",
            status:404
        })
    }

    return res.json({
        manager : userWithPosts
    })
})

postsRouter.post('/',fileUpload.single('image'),async (req,res,next)=>{
    if (!req.file) {
      return next({
        error: 'Please upload a image',
        status: 400,
      });
    }
    const {
        description,
    } = req.body;
    let user;
    try{
        user = await Managers.findById(req.userData.userId)
    }catch(err){
        return next({
            error:"Creating a post failed.Try Again later",
            status:500
        })
    }
    if(!user){
        return next({
            error:"You have no permissions to post any events!!!",
            status:404
        })   
    }
    console.log(user);
    const createdPost = new Post({  
      creator: user._id,
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
        console.log(err)
        return next({
            error:"Could not create a post.Try again later",
            status:500
        })
    }

    return res.status(201).json({
        post:createdPost
    })
})

postsRouter.delete('/delete/:pid',async (req,res,next)=>{
    const postId = req.params.pid;

    let post;
    try{
        post = await Post.findById(postId);
        user = await Managers.findById(req.userData.userId);
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
    if(req.userData.userId.toString() !== post.creator.toString()){
        return next({
            error:"You are not authorized to delele this post.",
            status:403
        })
    }
    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await post.remove({session:sess});
        user.posts.pull(post)
        await user.save({session:sess});
        await sess.commitTransaction();
    }catch(err){
        console.log(err)
        return next({
            error:"Something went wrong.Could not delete place.",
            status:500
        })
    }
    return res.status(201).json({
        message:"Delted post"
    })
})

postsRouter.delete('/unlike/:pid',async (req,res,next)=>{
    const pid = req.params.pid;
    let post;
    const userId = req.userData.userId;
    let user;
    try{
        post = await Post.findById(pid);
        user = await UserModel.findById(userId);
    }catch(err){
        return next({
            error:"Something went wrong.Please try again later.",
            status:500,
        })
    }
    if(!post){
        return next({
            error:"There is not post for the specified id",
            status:500
        })
    }
    try{
        const like = await post.likes.indexOf(user.id);
        if(like == -1){
            return next({
                error:"You didnt liked this post.",
                message:300
            })
        }else{
            post.likes.pull(user);
            await post.save();
        }
    }catch(err){
        console.log(err);
        return next({
            error:"Something went wrong.Please try again later.",
            status:500
        })
    }
    if(!user){
        return next({
            error:"Something went wrong.Your are not allowed to like this post.Please try again later.",
            status:500
        })
    }
    res.status(200).json({
        message:"Your unlike was saved for this post.",
        likes:post.likes.length
    })
})

postsRouter.post('/like/:pid', async (req, res, next) => {
    const pid = req.params.pid;
    let post;
    const userId = req.userData.userId;
    let user;
    try {
        post = await Post.findById(pid);
        user = await UserModel.findById(userId);
    } catch (err) {
        return next({
        error: 'Something went wrong.Please try again later.',
        status: 500,
        });
    }
    if (!post) {
        return next({
        error: 'There is not post for the specified id',
        status: 500,
        });
    }
    try {
        const like = await post.likes.indexOf(user.id);
        if (like == -1) {
        post.likes.push(user);
        await post.save();
        } else {
        return next({
            error: 'You already liked this post.',
            status: 300,
        });
        }
    } catch (err) {
        console.log(err);
        return next({
        error: 'Something went wrong.Please try again later.',
        status: 500,
        });
    }
    if (!user) {
        return next({
        error:
            'Something went wrong.Your are not allowed to like this post.Please try again later.',
        status: 500,
        });
    }
    res.status(200).json({
        message: 'Your like was saved for this post.',
        likes: post.likes.length,
    });
});

postsRouter.get('/likes/:pid',async (req,res,next)=>{
    const pid = req.params.pid;
    let post;
    try{
        post = await Post.findById(pid).populate('likes');
    }catch(err){
        return next({
            error:"Something went wrong in the database.",
            status:500
        })
    }
    if(!post){
        return next({
            error:"There is no post for the specified id.",
            status:404
        })
    }

    res.status(200).json({
        likes:post.likes.map(item => {
            return {
                fullname:item.fullname,
                image:item.image,
                email:item.email
            }
        })
    })

})

module.exports = postsRouter