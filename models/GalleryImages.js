const mongoose=require('mongoose');

const imageSchema = new mongoose.Schema({
    filename: String,
    originalname: String,
    path:String,
    url:String,
    mimetype: String,
    size: Number,
    uploadDate: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('GalleryImage', imageSchema);