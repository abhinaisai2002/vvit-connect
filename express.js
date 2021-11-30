const express = require('express');
const app = express();
const usersRoutes = require('./routes/users-routes');
const mongoose = require('mongoose');

/*
mongodb
username = abhinai10
password = abhinaisai10
*/
// a middleware function used to parse the json data in post requests

app.use(express.json())

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
app.use('/users',usersRoutes);


//sending error status codes from the server if any error occurs

app.use((error,req,res,next)=>{
    res.status(error['status'] || 500);
    res.send(error['error'] || "An unknown error ocurred from the server");
})

// connecting to the mongodb remote server
mongoose
  .connect(
    'mongodb+srv://abhinai10:abhinaisai10@cluster0.ntyyq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
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