import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";



const app= express();

app.use(helmet())

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser())

import userRouter from "./routes/user.routes.js";
//routes declaration cum as  middleware 
app.use("/api/v1/user",userRouter)

export {app};