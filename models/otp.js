const mongoose = require("mongoose");

const OtpSchema = mongoose.Schema({
    otp: String,
    email: String,
});

const OtpModal = mongoose.model("otp", OtpSchema);

module.exports = OtpModal;