// models/JobPost.js
const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema({
    jobTitle: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    responsibilities: {
        type: String,
        required: true
    },
    requiredSkills: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    salaryRange: { type: String },
    contactEmail: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('JobPost', jobPostSchema);
