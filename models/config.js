const mongoose=require('mongoose');
const process = require('process');
const dotenv = require('dotenv')
dotenv.config();
const mongoURI = process.env.mongoURI;


const connectToMongo=async()=>{
    mongoose.connect(mongoURI);
    console.log("Connected to MongoDB successfully")
}

module.exports=connectToMongo;