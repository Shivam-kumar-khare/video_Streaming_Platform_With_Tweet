import { Like } from "../model/likes.model.js";
import mongoose from "mongoose";
import { ApiError } from "./apiError.js";


const toggleLikes=async (modelId,model_name,userId) => {
    try {
            if(!modelId || !mongoose.Types.ObjectId.isValid(modelId)){
                throw new ApiError(400,`Invalid ${model_name}  ID`)
            }
            
          
            const like = await Like.findOne(
                {
                    [model_name.toLowerCase()]:modelId ,
                    likedBy: userId
                }
            )
        
            let liked_or_unliked;
        
            if(!like){
                await Like.create({
                    [model_name.toLowerCase()]:modelId ,
                    likedBy:userId
                })
                liked_or_unliked="liked"
            }else{
                // Like.findByIdAndDelete(videoId)
                await like.deleteOne()
                liked_or_unliked="unliked"
            }

            

            return `${model_name} ${liked_or_unliked}`;

            //TODO: toggle like on tweet
        }
        
    catch (error) {
        console.log(error)
        throw new ApiError(400,error.message)
        
    }

}

export {toggleLikes};
