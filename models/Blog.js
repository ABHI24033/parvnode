const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    heading: String,
    created_at: {
        type: Date,
        default: Date.now(),
    },
    description: String,
    image: {
        path: String,
        originalFileName: String,
        key: String
    },
    category: String,
});

module.exports = mongoose.model('Blog', blogSchema);