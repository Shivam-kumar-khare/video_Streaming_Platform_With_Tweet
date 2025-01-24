import mongoose ,{Schema,model}from "mongoose";

const commentsSchema = new Schema({
    content:{
        type:String,
        maxlength:[400,"Maximum 400 character tweet allowed"]
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }

}, { timestamps: true })

export const Comment=model("Comment",commentsSchema)