const mongoose = require('mongoose');
const managerValidator = require('mongoose-unique-validator')
const managerSchema = new mongoose.Schema({
    name:{type:String,required:true,unique:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true,minlength:8},
    image:{type:String,required:true,default:'/uploads/images/default.png'},
    posts:[{type:mongoose.Types.ObjectId,ref:'Post',required:true}]
});
managerSchema.plugin(managerValidator)
module.exports = mongoose.model('Manager',managerSchema);