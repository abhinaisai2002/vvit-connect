const mongoose = require('mongoose');


const postSchema = mongoose.Schema({
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'Manager' },
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
  image: { type: String, required: true },
  likes: [{ type: mongoose.Types.ObjectId,ref:'User'}],
  comments: [{ type: String, default: 'Hi' }],
});

module.exports = mongoose.model('Post',postSchema)
