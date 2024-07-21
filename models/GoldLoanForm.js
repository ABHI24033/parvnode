const mongoose = require('mongoose');

const goldloanformSchema = new mongoose.Schema({
    userID: String,
    applicant_kyc: {
        fname: String,
        mname: String,
        lname: String,
        email: String,
        phone: String,
        alternate_number: String,
        dob: String,
        gender: String,
        marital_status: String,
        spouse_name: String,
        father_name: String,
        mother_name: String,
        house_name: String,
        street_name: String,
        city_name: String,
        landmark: String,
        district: String,
        state: String,
        pincode: String,
        present_house_name: String,
        present_street_name: String,
        present_city_name: String,
        present_landmark: String,
        present_district: String,
        present_state: String,
        present_pincode: String,
    },
    bank_details: [
        {
            bank_name: String,
            account_type: String,
        }
    ],
    loan_history: [{
        loan_bank_name: String,
        Total_loan_amount: String,
        emi: String,
        pandding: String,
    }],
    files: [
        {
            fileName: String,
            url: String,
            path: String,
            originalFileName: String,
            fieldName: String
        }
    ],
    loan_status: {
        type: String,
        default: null,
    },
    application_no: String,
    remarks: String,
    loan_check:String,
    connector_id: String,
});

module.exports = mongoose.model('GoldLoanForm', goldloanformSchema);