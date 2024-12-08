import mongoose, { Schema } from "mongoose";

const videoSchema =new mongoose.Schema({

    videofile:{type:String,required:true},//couldinary 
    thumbnail:{type:String,required:true},//couldinary 
    title:{type:String,required:true},//couldinary 
    description:{type:String},
    duration:{type:Number,required:true},//couldinary 
    views:{type:Number,default:0},
    isPublished:{type:Boolean,default:true},
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true});

export const Video =mongoose.model("Video",videoSchema);
