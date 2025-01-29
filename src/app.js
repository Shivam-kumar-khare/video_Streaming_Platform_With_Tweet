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
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import subscriptionRoute from "./routes/subscription.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
//routes declaration cum as  middleware 
app.use("/api/v1/user",userRouter)
app.use("/api/v1/comment",commentRouter)
app.use("/api/vi/like",likeRouter)
app.use("/api/v1/subscription",subscriptionRoute)
app.use("/api/v1/tweet",tweetRouter)

export {app};