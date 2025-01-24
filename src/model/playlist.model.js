import mongoose from "mongoose";


const playlistSchema=new mongoose.model({
    name:{
        type:String,
        required:true,
        maxlength:[80,"Your playlist name is too long"]
    },
    description:{
        type:String,
        required:[true,"description is required"]
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