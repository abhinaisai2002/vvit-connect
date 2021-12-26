const mongoose = require('mongoose');
const managerSchema = new mongoose.Schema({
    verified:{type:Boolean,default:false},
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true,minlength:8},
    image:{type:String,required:true,default:'/uploads/images/default.png'},
    posts:[{type:mongoose.Types.ObjectId,ref:'Post',required:true}]
});

module.exports = mongoose.model('Manager',managerSchema);


