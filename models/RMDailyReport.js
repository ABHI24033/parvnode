const mongoose = require('mongoose');

const RmDailySchemaReport = new mongoose.Schema({
    login_fee: {
        type: String,
        // require: true,
    },
    entries_hubspot: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        // required: true,
    },
    new_file_today:{
        type:String,
    },
    documents_collections:String, 
    old_connector_call:String,
    satisfied_work:String,
    total_calls:String,
});

const RmdailyReport=mongoose.model('rm_daily_report', RmDailySchemaReport,"rm_daily_report");
module.exports = RmdailyReport;