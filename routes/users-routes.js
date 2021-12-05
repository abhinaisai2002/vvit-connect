const express = require('express'); // for handling requests
const usersRouter = express.Router();
const UserModel = require('../models/user');
const bcyprt = require('bcrypt');
const checkAuth = require('../middlewares/check-auth');
const jwt = require('jsonwebtoken');

usersRouter.get('/',checkAuth, async (req,res,next)=>{
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

usersRouter.get('/:id',checkAuth,async (req,res,next)=>{
    const userId = req.params.id;
    let user;
    try{
        user = await UserModel.findById(userId);
    }catch(err){
        return next({
            error:"Could fetch details of user.Please try again.",
            status:500
        })
    }
    if(!user){
        return next({
            error:"There is no user for the provided Id.",
            status:404
        })
    }
    return res.json({
        user:user.toObject({getters:true})
    })
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
        existingUser = await UserModel.findOne({email:email});
    }
    catch(err){
        return next({
            error:'Signing Up failed.Please try again after sometime',
            status:500
        })
    }
    // if he exists,sending a error response
    if(existingUser){
        return next({
            error:"User email already Exists.Try another one.",
            status:422
        })
    }
    let hashedPassword;
    // hashing techniques on passwords for more security
    try{
        hashedPassword = await bcyprt.hash(password,10);
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
    let token;
    try {
    token = jwt.sign(
        {
        userId: createdUser.id,
        email: createdUser.email,
        name: createdUser.fullname,
        },
        process.env.JWT_SECRET_KEY
    );
    } catch (err) {
    return next({
        error: '1 Could not create user.Please try again later.',
        status: 500,
    });
    }
    res.send({
        userId:createdUser.id,
        userEmail:createdUser.email,
        token:token
    });
})

usersRouter.post('/login',async (req,res,next)=>{
    const {
        email,
        password
    } = req.body;//getting the data from the request body
    const isValid = validateLogin(email,password);//checking the details are valid or not
    if(!isValid){
        return next({
            error:'The Entered Details are Invalid',
            status:422
        })
    }
    let existingUser;//getting the existing user for login
    try{
        existingUser = await UserModel.findOne({email:email})
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
    let isPasswordValid = false;//checking the entered password is correct or not

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
    let token;
    try {
    token = jwt.sign(
        {
        userId: existingUser.id,
        email: existingUser.email,
        name: existingUser.fullname,
        },
        process.env.JWT_SECRET_KEY
    );
    } catch (err) {
    return next({
        error: 'Could not create user.Please try again later.',
        status: 500,
    });
    }
    return res.json({
        userEmail:existingUser.email,
        userId : existingUser.id,
        token:token
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
      '[0-9][0-9][bB][qQ]1[aA][0-1][0-5][0-9A-Za-z][0-9]@vvit.net'
    );
    
    return emailRe.test(email) && password.length >= 8;
}
module.exports = usersRouter