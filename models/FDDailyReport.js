

const mongoose = require('mongoose');

const FSDailySchemaReport = new mongoose.Schema({
    current_date: {
        type: String,
        // require: true,
    },
    company_name: {
        type: String,
        // required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
    emp_name: {
        type: String,
        // required: true,
    },
    cli_name: {
        type: String,
        // required: true,
    },
    contact_number:{
        type:String,
    },
    contact_person_name:String,

    whats_number:String, 
    house_name:String,
    street_name:String,
    city_name:String,
    landmark:String,
    district:String,
    state:String,
    pincode:String,

    product_discussed:String,
    remark:String,
    next_meeting:String,
});

const FSdailyReport=mongoose.model('fieldstaff_daily_report', FSDailySchemaReport,"fieldstaff_daily_report");
module.exports = FSdailyReport;
