const jwt = require('jsonwebtoken');
// a middleware to verify the token is valid or not for authorizing the tasks
module.exports = (req,res,next)=>{
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
        req.userData = {userId : decodedToken.userId};
        next();
    }catch(err){
        return next({
          error: 'Authorization Failed.Your are not authorized to do this task.',
          status: 401,
        });
    }
}