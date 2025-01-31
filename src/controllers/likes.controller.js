import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { toggleLikes } from "../utils/toggleLike.utils.js";
import { Like } from "../model/likes.model.js";
import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/apiError.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
    
    const {videoId} = req.params;
    if(!videoId||!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId")
    }

    const response=await toggleLikes(videoId,"video",req.user._id)

    res.status(200).json(
        new ApiResponse(
            200,
            {},
            response

        )
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on comment

    const {commentId} = req.params
    if(!commentId || ! isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid Comment id")
    }


    const response=await toggleLikes(commentId,"comment",req.user._id)

    res.status(200).json(
        new ApiResponse(
            200,
            {},
            response

        )
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on tweet

    const {tweetId} = req.params

    if(!tweetId || ! isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet id")
    }

    const response=await toggleLikes(tweetId,"tweet",req.user._id)

    res.status(200).json(
        new ApiResponse(
            200,
            {},
            response

        )
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const user = req.user._id;
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    // Ensure valid pagination values
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    // Get all the videos liked by the user
    const required_data = await Like.aggregate([
        {
            $match: {
                likedBy: user
            }
        },
        {
            $skip: skip, 
        },
        {
            $limit: limit, 
        },
        {
            $project: {
                _id: 1,
                video: 1 //0 to exclude
            }
        }
    ]);

    
    const videosWithLikeCount = await Promise.all(required_data.map(async (element) => {
        const totalLikes = await Like.aggregate([
            {
                $match: { video: element.video }
            },
            {
                $count: "totalLikes"
            }
        ]);
     
        const totalLikesCount = totalLikes[0] ? totalLikes[0].totalLikes : 0;
     
        
        return { tweetId:element._id,videoId:element.video, totalLikesCount }; 
    }));

    res.status(200).json(
        new ApiResponse(200, videosWithLikeCount, "Success")
    );
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}