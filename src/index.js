// require('dotenv').config({path:'.env'})
import dotenv from "dotenv";
dotenv.config(); 
// dotenv.config({path:'.env'}); 


import connect_DB from "./db/index.js";
import {app} from "./app.js"
//debugging
// console.log("ENV Variables Loaded:", {
//     CLOUD_NAME: process.env.CLOUD_NAME,
//     API_KEY: process.env.API_KEY,
//     API_SECRET: process.env.API_SECRET,
//     PORT: process.env.PORT,
// });


connect_DB()
.then(() => {
    app.listen(process.env.PORT || 3030, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT||3030}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})
