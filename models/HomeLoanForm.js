const mongoose = require('mongoose');

const homeloanformSchema = new mongoose.Schema({
    userID: {
        type: String,
        // required: true,
    },
    applicant_kyc: {
        // userID: localStorage.getItem("userID"),
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
    home_loan_type: {
        type: String,
        // required: true,
    },
    employment_type: {
        type: String,
        // required: true,
    },
    seller_banking_details:[ {
        seller_bank_name: String,
        seller_account_type: String,
    }],
    applicant_banking_details: [
        {
            bank_name: String,
            account_type: String,
        }
    ],
    loan_history: [
        {
            loan_bank_name: String,
            Total_loan_amount: String,
            emi: String,
            pending: String,
        }
    ],
    co_applicant_kyc: {
        co_name: String,
        co_date_of_birth: String,
        occupation: String,
        co_relation: String,
    },
    business_details: {
        loan_purpose: String,
        company_name: String,
        business_register_year: String,
        registration_documents: String,
        business_turnover: String,
        file_itr: String,
        property_mortgage: String,
        property_location: String,
        property_owner: String,
        property_documents: String,
    },
    job_details:{
        salary_slip: String,
        form16: String,
        job_experience: String,
        designation: String,
        current_salary: String,
        company_name: String,
        current_job_experience: String,
        office_building_name: String,
        office_street_name: String,
        office_city_name: String,
        office_landmark: String,
        office_district: String,
        office_state: String,
        office_pincode: String,
    },

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
        default: null
    },
    application_no:String,
    remarks:String,
    connector_id: String
});

module.exports = mongoose.model('HomeLoanForm', homeloanformSchema);