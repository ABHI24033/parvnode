const mongoose = require('mongoose');
const careersSchema = new mongoose.Schema({
    name: {
        type: String,
        // required: true,
    },
    email: {
        type: String,
        // required: true,
    },
    phone: {
        type: String,
        // required: true,
    },
    resume: {
        url:String,
        path:String,
        name:String,
    },
    job_id:String,

    message: {
        type: String,
        // required: true,
    },
});
module.exports = mongoose.model('Careers', careersSchema);