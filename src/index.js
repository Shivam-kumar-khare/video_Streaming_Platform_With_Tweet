// require('dotenv').config({path:'.env'})
import dotenv from "dotenv";
dotenv.config({path:'.env'}); 
import connect_DB from "./db/index.js";
import {app} from "./app.js"


connect_DB()
.then(() => {
    app.listen(process.env.PORT || 3030, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT||3030}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})




















/*import express from "express";
const app=express();

;(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("errror",(error)=>{
            console.log("ERROR",error);
            throw error;
        });
        app.listen(process.env.PORT,()=>{
            console.log("app listening on port ",`${process.env.PORT}`)
            
        })
    } catch (error) {
        console.error("error",error);
        throw error;
        
    }
})()*/