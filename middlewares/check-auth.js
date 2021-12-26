const jwt = require('jsonwebtoken');
const user = require('../models/User');
// a middleware to verify the token is valid or not for authorizing the tasks
module.exports = async (req,res,next)=>{
    // a preflight req thats checks for cors policy, a options method
    if(req.method === 'OPTIONS'){
        return next();
    }

    try{
        const token = req.headers.authorization.split(' ')[1];// header => Authorization : Bearer token_id
        if(!token){
            throw new Error('No Token');
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(decodedToken);
        if( !decodedToken ){
            return next({
                error:"Not a valid user",
                status:400
            })
        }
        if(decodedToken.verified !== undefined){
            let requester;
            try{
                requester = await user.findById(decodedToken.userId)
            }catch(err){
                return next({
                    error:"Something went wrong.Please try again later.",
                    status:500
                })
            }
            if(!requester.verified){
                return next({
                    error:"Please verify your email.",
                    status:403
                })
            }
        }
        req.userData = decodedToken
        next();
    }catch(err){
        return next({
          error: 'Authorization Failed.Your are not authorized to do this task.',
          status: 401,
        });
    }
}