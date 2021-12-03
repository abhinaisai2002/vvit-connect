const mongoose = require('mongoose');

const postsValidator = require('mongoose-unique-validator');

const postSchema = mongoose.Schema({
    createdBy:{type:String,required:true,unique:true},
    creator:{type:mongoose.Types.ObjectId,required:true,ref:'User',},
    date:{type:Date,default:Date.now},
    description:{type:String,required:true},
    image:{type:String,required:true},
    like:{type:Number,default:0},
    comments:[{type:String,default:'Hi'}],

})

postSchema.plugin(postsValidator) // for unique field in the documents
module.exports = mongoose.model('Post',postSchema)
