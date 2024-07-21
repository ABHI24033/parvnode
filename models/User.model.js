// import mongoose from "mongoose";
const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
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
    current_profession: {
        type: String
    },
    company_name: {
        type: String
    },
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
    files:[
        {
            url:String,
            fieldName:String,
            path:String,
        }
    ],
    // phonenumber,
    approved:{
        type:Boolean,
        default:null  
    },
    code: String,
    user_type: String,//employee,admin,connector
});


module.exports = mongoose.model("Users", userSchema);