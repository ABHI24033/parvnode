const mongoose = require('mongoose');

const testimonialsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    testimonial: {
        type: String,
        required: true,
    },
    uploadTime: {
        type: Date,
        default: Date.now
      }
});

module.exports = mongoose.model('Testimonials', testimonialsSchema);