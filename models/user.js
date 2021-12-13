const {Schema} = require('mongoose');
const mongoose = require('mongoose');

// user model for storing data in the mongodb
const userSchema = new Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true},
    password: { type: String,required:true,minlength:8 },
    year:{type:Number,required:true,},
    branch:{type:String,required:true,},
    section:{type:String,required :true},
    image:{type:String,required:true,default:'/uploads/images/default.png'},
    verified:{type:Boolean,default:false}
});


module.exports = mongoose.model('User',userSchema);


