import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";


const connect_DB = async ()=>{
    try {
      const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
      console.log("\n\nMongoDB connected successfully to host:",connectionInstance.connection.host);
    } catch (error) {  
        console.log("MONGO DB CONNECTION FAILED!! Error:: ",error.message||error);
        process.exit(1);
        
    }
};

export default connect_DB;