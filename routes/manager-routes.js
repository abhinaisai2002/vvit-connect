const express = require('express');
const managerRoutes = express.Router();
const  Managers = require('../models/Manager');
const bcrypt = require('bcrypt'); // for password encryption
const jwt = require('jsonwebtoken');
const checkAuth = require('../middlewares/check-auth');
const fileUpload = require('../middlewares/file-upload');

managerRoutes.get('/',checkAuth, async (req,res,next)=>{
    let managers;
    try{
        //fetching all the managers from the database
        managers = await Managers.find().populate('posts');
    }catch(err){
        return next({
            error:"Could fetch all the managers.Please try again later.",
            status:500
        })
    }
    if(!managers && managers.length === 0){
        return next({
            error:"There are no managers at present.Please try again later.",
            status:404
        })
    }
    res.send({
        managers:managers.map(manager => manager.toObject({
            getters:true
        }))
    })
})



managerRoutes.post('/signup',fileUpload.single('image'),async (req,res,next)=>{
    if(!req.file){
      return next({
        error:"Please upload a image",
        status:400
      })
    }
    const {
        name,email,password
    } = req.body;
    const isValid = validateLogin(email,password) && name.toString().trim().length>0;
    if (!isValid) {
      return next({
        error: 'The Entered Details are Invalid',
        status: 422,
      });
    }
    let existingUser;
    // checking the user if he already exsits
    try {
      existingUser = await Managers.findOne({ $or:[{email: email},{name:name.toUpperCase()}]});
    } catch (err) {
      return next({
        error: 'Signing Up failed.Please try again after sometime',
        status: 500,
      });
    }
    // if he exists,sending a error response
    if (existingUser) {
      return next({
        error: 'User already Exists.Try another one.',
        status: 422,
      });
    }
    let hashedPassword;
    // hashing techniques on passwords for more security
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      return next({
        error: 'Could not create user.Please try again!',
        status: 500,
      });
    }
    const manager = new Managers({
        name:name.toUpperCase(),
        email,
        password:hashedPassword,
        image:req.file.path
    })
    try {
      await manager.save();
    } catch (err) {
      return next({
        error: 'Could not create user.Please try again later.!!',
        status: 500,
      });
    }

    let token;
    try{
       token = jwt.sign(
          {
            userId: manager.id,
            email: manager.email,
            name: email.name,
          },
          process.env.JWT_SECRET_KEY
        );
    }catch(err){
      return next({
        error: 'Could not create user.Please try again later.!!!',
        status: 500,
      });
    }
   
    res.status(201).json({
      managerId : manager.id,
      managerEmail : manager.email,
      token:token
    })
})
managerRoutes.post('/login',async (req,res,next)=>{
    const {
      email,password
    } = req.body;
    const isValid = validateLogin(email,password);
    if(!isValid){
        return next({
            error:"The Entered details are invalid.",
            status:422
        })
    }
    let manager; //getting the existing user for login
    try {
      manager = await Managers.findOne({ email: email });
    } catch (err) {
      return next({
        error: 'Logging in failed.Please try again Later.',
        status: 500,
      });
    }
    if (!manager) {
      return next({
        error: 'Invalid Credentials, could not login you.',
        status: 403,
      });
    }
    let isPasswordValid = false; //checking the entered password is correct or not
    try {
      isPasswordValid = await bcrypt.compare(password,manager.password);
    } catch (err) {
      return next({
        error: 'Could not login you.Please try again later',
        status: 500,
      });
    }

    if (!isPasswordValid) {
      return next({
        error: 'Invalid Credentials, could not login you.',
        status: 403,
      });
    }

    let token;
    try {
      token = jwt.sign(
        {
          userId: manager.id,
          email: manager.email,
          name: email.name,
        },
        process.env.JWT_SECRET_KEY
      );
    } catch (err) {
      return next({
        error: 'Could not login user.Please try again later.',
        status: 500,
      });
    }

    return res.status(200).json({
      userId:manager.id,
      email:manager.email,
      token:token
    })
})


const validateLogin = (email,password)=>{
    let emailRe = new RegExp(
        '[a-z0-9]*@vvit.net'
    );
    return emailRe.test(email) && password.length >=8
}
module.exports = managerRoutes