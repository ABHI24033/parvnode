const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    paymentDate: {
        type: Date,
        required: true
    },
    paymentAmount: { 
        type: Number, 
        required: true 
    },
    paymentTime: { 
        type: String, 
        required: true 
    },
    applicationNumber: { 
        type: String, 
        required: true 
    },
    connector_id:{
        type:String,
    }
});

// Create a model for payments
const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;