// import mongoose from "mongoose";
const mongoose = require('mongoose');


const employeeSchema = new mongoose.Schema({
    full_name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
    },
    mobile_number: {
        type: Number,
    },
    whats_app_number: {
        type: Number
    },
    // current_profession: {
    //     type: String
    // },
    // company_name: {
    //     type: String
    // },
    address: [
        {
            street: String,
            city: String,
            landmark: String,
            district: String,
            pincode: Number,
            state: String,
        }
    ],
    password: {
        type: String,
        required: true,
    },
    
    // phonenumber,
    code: String,
    approved: {
        type: Boolean,
        default: false
    },
    user_type: String,//employee,admin,connector
});


module.exports = mongoose.model("Employee", employeeSchema);