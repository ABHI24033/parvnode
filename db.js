const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// path to .env file
dotenv.config({ path: path.join(__dirname, 'config.env') })

// const mongoURL = process.env.DATABASE_URL;
const mongoURL = `mongodb+srv://abhishek24033c:parv@parv.tpsyb2o.mongodb.net/?retryWrites=true&w=majority&appName=parv`;
// connection to mongodb Atlas
// const uri = 'mongodb://db_admin:Mh34Ghdk82An934Jdn82A01AB@15.207.195.184:27017/admin';
const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURL);
        // mongoose.set('debug', true);
        console.log("Connected to mongo successfully");
    } catch (error) {
        console.log(error);
    }
}



// Connection URL





module.exports = { connectToMongo };