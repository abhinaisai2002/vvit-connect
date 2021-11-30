const express = require('express'); // for handling requests
const validator = require('validator');
const usersRouter = express.Router();
const UserModel = require('../models/user');
const bcyprt = require('bcrypt');
const { create } = require('../models/user');

usersRouter.get('/', async (req,res,next)=>{
    let users;
    try{
        // querying the dabase,getting all the user documents
        users = await UserModel.find({},'-password')
    }
    catch(err){
        return next({
            error:"Couldn't fetch all the users from the database.Please try again later.",
            status:500
        })
    }
    // converting the mongoose object to plain javascript object,and adding an id to the object, which is easily managed in front end
    res.send({users:users.map(user => user.toObject({getters:true}))})
})

usersRouter.post('/signup',async (req,res,next)=>{
    const {
        fullname,
        email,
        password,
        year,
        branch,
        section
    } = req.body;
    // validating the information
    const isValid = validateUserDetails(fullname,email,password,year,branch,section)

    // if it is not valid,sending the error response
    if(!isValid){
        return next({
            error:'The Entered Details are Invalid',
            status:422
        })
    }
    let existingUser;
    // checking the user if he already exsits
    try{
        existingUser = await UserModel.find({email:email});
    }
    catch(err){
        return next({
            error:'Signing Up failed.Please try again after sometime',
            status:500
        })
    }
    // if he exists,sending a error response
    if(!existingUser){
        return next({
            error:"User email already Exists.Try another one.",
            status:422
        })
    }
    let hashedPassword;
    // hashing techniques on passwords for more security
    try{
        hashedPassword = await bcyprt.hash(password,12);
    }catch(err){
        return next({
            error:"Could not create user.Please try again",
            status:500
        })
    }
    //creating the usermodel
    const createdUser = new UserModel({
        fullname:fullname,
        email:email,
        branch:branch,
        year:year,
        password:hashedPassword,
        section:section,
    })
    // saving the mongoose object into the database
    try{
        await createdUser.save();
    }catch(err){
        return next({
            error:"Could not create user.Please try again later.",
            status:500
        })
    }
    res.send({user:createdUser.toObject({getters:true})});
})

usersRouter.post('/login',async (req,res,next)=>{
    const {
        email,
        password
    } = req.body;
    const isValid = validateLogin(email,password);
    if(!isValid){
        return next({
            error:'The Entered Details are Invalid',
            status:422
        })
    }
    let existingUser;
    try{
        existingUser = await UserModel({email:email})
    }catch(err){
        return next({
            error:"Logging in failed.Please try again Later.",
            status:500
        })
    }
    if(!existingUser){
        return next({
            error:"Invalid Credentials, could not login you.",
            status:403
        })
    }
    let isPasswordValid = false;
    try{
        isPasswordValid = await bcyprt.compare(password,existingUser.password);
    }catch(err){
        return next({
            error:"Could not login you.Please try again later",
            status:500
        })
    }
    if(!isPasswordValid){
        return next({
            error:"Invalid Credentials, could not login you.",
            status:403
        })
    }
    return res.json({
        userEmail:email,
        userId : existingUser.id
    })
})

const validateUserDetails = (fullname,email,password,year,branch,section) => {
    
    const isValid = validateLogin(email,password) &&
        fullname.length > 0 &&
        1 <= year < 4 &&
        !!(['CSE', 'ECE', 'IT', 'MECH', 'CE', 'EEE'].indexOf(branch) + 1) && 
        !!(['A', 'B', 'C', 'D'].indexOf(section));

    return isValid;
};

const validateLogin = (email,password)=>{
    let emailRe = new RegExp(
      '[0-9][0-9][bB][qQ]1[aA][0-9][0-5][0-9A-Za-z][0-9]@vvit.net'
    );
    return emailRe.test(email) && password.length >= 8;
}
module.exports = usersRouter