import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { toggleLikes } from "../utils/toggleLike.utils.js";
import { Like } from "../model/likes.model.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
    
    const {videoId} = req.params;

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

    const response=await toggleLikes(tweetIdId,"tweet",req.user._id)

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
    //TODO: get all liked videos and total likes
    const user=req.user._id;
    const {videoId} = req.params;
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    // Ensure valid pagination values
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    const totalLikes=await Like.aggregate([
        {
            $match: {
                video: videoId
            }

        },
        {
            $count:"Total_likes"
        }
    ])
    const totalLikesCount = totalLikes[0] ? totalLikes[0].Total_likes : 0;

    const LikedVideo=await Like.aggregate([
        {
            $match:{
                likedBy:user
            }
        },
        {
            $sort: {
                updatedAt: -1, // Sort by newest first
            },
        },
        {
            $skip: skip, // Skip for pagination
        },
        {
            $limit: limit, // Limit the number of results
        },
    ])
    const result={
        totalLikesCount,LikedVideo
    }
    res.status(200).json(
        new ApiResponse(200,result,"Success")
    )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}