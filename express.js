const express = require('express');
const app = express();
const usersRoutes = require('./routes/users-routes');
const mongoose = require('mongoose');
const path = require('path');
const postsRouter = require('./routes/posts-routes');
const managerRoutes = require('./routes/manager-routes');
require('dotenv').config(); // for loading the variables in the dot.env file


// a middleware function used to parse the json data in post requests
app.use(express.json())
// a middleware that used to serve the static files from the server
// generally the server will not share the files 
app.use('/uploads/images', express.static(path.join('uploads','images')));
// a middleware function used to stop the cors policy security
app.use((req,res,next)=>{
    //allowing the browser to access all domains by the browser,headers in the request,methods by the request
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Requests','POST, GET, PATCH, DELETE');
    next();
})

// all the users endpoints
app.use('/api/users',usersRoutes);

// all the posts endpoints
app.use('/api/posts',postsRouter);

// all the manager endpoints
app.use('/api/managers/',managerRoutes);

app.use((req,res,next)=>{
  return next({
    error:'Could found this route.',
    status:404
  })
})


//sending error status codes from the server if any error occurs

app.use((error,req,res,next)=>{
    res
    .status(error['status'] || 500)
    .json({
      message:error['error'] || "An unknown error ocurred from the server"
    });
})

// connecting to the mongodb remote server
mongoose
  .connect(
    'mongodb+srv://' +
      process.env.MONOGODB_USERNAME +
      ':' +
      process.env.MONOGODB_PASSWORD +
      '@cluster0.ntyyq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
  )
  .then((res) => {
    console.log('server connected to database');
  })
  .catch((err) => {
    console.log('server not connected to database');
  });

// app listening on port 5000
app.listen(5000,()=>{
    console.log("Server sucessfully connected");
})

// process.env.MONOGODB_USERNAME
// process.env.MONOGODB_PASSWORD