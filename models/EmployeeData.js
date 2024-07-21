const mongoose=require("mongoose");

const employeeDataSchema=new mongoose.Schema({
    // data:[
    //     {
    //         name: String,
    //         email: String,
    //         phone: String,
    //         loanType: String,
    //     }
    // ],
    name: String,
    email: String,
    phone: String,
    alternate_number:String,
    loanType: String,
    location: String,
    connector_name: String,
    remarks: String,
    employeeId: String,
    employee_id:String,

    sheeet_url:String,
},{timestamps:true});

module.exports=mongoose.model("Employeedata",employeeDataSchema);