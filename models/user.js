const {Schema} = require('mongoose');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// user model for storing data in the mongodb
const userSchema = new Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true,unique:true},
    password: { type: String,required:true,minlength:8 },
    year:{type:Number,required:true,},
    branch:{type:String,required:true,},
    section:{type:String,required :true},
    image:{type:String,required:true,default:'/uploads/images/default.png'}
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User',userSchema);



/*
user1 
{
    "fullname":"abhinaisai",
    "email":"19bq1a05i7@vvit.net",
    "password":"abhinaisai@10",
    "year":3,
    "branch":"CSE",
    "section":"C"
}
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MWFjNWYzYjMxZjgxM2NjN2NlNjFkMjciLCJlbWFpbCI6IjE5YnExYTA1aTdAdnZpdC5uZXQiLCJuYW1lIjoiYWJoaW5haXNhaSIsImlhdCI6MTYzODY4NjgyOX0.0bAdb6inqLbdiJ9nxdxBr34_uo5RWAWhbXxZBFlb8gA
user2
{
    "fullname":"praveen",
    "email":"19bq1a05f1@vvit.net",
    "password":"praveen@10",
    "year":3,
    "branch":"CSE",
    "section":"C"
}
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MWFjNjAzNDMxZjgxM2NjN2NlNjFkMmMiLCJlbWFpbCI6IjE5YnExYTA1ZjFAdnZpdC5uZXQiLCJuYW1lIjoicHJhdmVlbiIsImlhdCI6MTYzODY4NjgwMn0.tev4YA9mYiY7dun2AL_nt4OXJQ3N8_-Ft7Qc8KAnKGc"
*/