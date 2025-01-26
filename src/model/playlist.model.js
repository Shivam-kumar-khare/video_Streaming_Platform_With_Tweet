import mongoose from "mongoose";


const playlistSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        maxlength:[80,"Your playlist name is too long"]
    },
    description:{
        type:String,
        required:[true,"description is required"],
        maxlength:[600,"Your playlist Description is too long"]
    },
    videos:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    }],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
},{timestamps:true}) 

export const Playlist = mongoose.model("Playlist", playlistSchema)