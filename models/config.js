const mongoose=require('mongoose');
const process = require('process');
const dotenv = require('dotenv')
dotenv.config();
const mongoURI ="mongodb://localhost:27017/Bus-book";


const connectToMongo=async()=>{
    mongoose.connect(mongoURI);
    console.log("Connected to MongoDB successfully")
}

module.exports=connectToMongo;