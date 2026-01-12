import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;

if(!MONGODB_URL){
    throw console.error("Error in database configuration...");
}

const connectToDatabse = async () =>{
    try{
        await mongoose.connect(MONGODB_URL);
        console.log("Connected to database successfully");
    }catch(err){
        console.log(err);
        process.exit(1);
    }
}

export default connectToDatabse;