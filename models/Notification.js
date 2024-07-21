const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    notificationSeen: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    email: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Notification', notificationSchema);