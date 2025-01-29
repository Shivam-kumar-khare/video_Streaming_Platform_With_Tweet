import mongoose from "mongoose"
import { User } from "../model/user.model.js"
import { Tweet } from "../model/tweets.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content }= req.body
    if(!content) throw new ApiError(402,"Empty tweet cannot be created")
    const user=req.user._id
    if(!user)  throw new ApiError(400,"User is not logged in")

    const tweet=await Tweet.create({
        content,
        owner:user
    })  
    
    if (!tweet) {
        throw new ApiError(500,"Problem Incurred During creating tweet")
        
    }
    res.status(200).json(
        new ApiResponse(200,tweet,"Tweet created Successfully")
    )


})

const getUserTweets = asyncHandler(async (req, res) => {
   
    let { page = 1, limit = 10 } = req.query;

      // Ensure page and limit are positive integers
      page = Math.max(1, parseInt(page, 10) || 1);
      limit = Math.max(1, parseInt(limit, 10) || 10);

    // Ensure valid pagination values
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const skip = (page - 1) * limit;
   
    const tweets=await Tweet.aggregate([
        {
            $match:{
                owner:req.user._id
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

    

    if (tweets.length > 0) {
        res.status(200).json(
            new ApiResponse(200,tweets,"User tweet fetched Successfully")
        )
    } else {
        res.status(200).json(
            new ApiResponse(200,[],"No previous tweet exist")
        )
        
    }
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid Id")
    }

    const {content} = req.body;
    if (!content) throw new ApiError(400, "Content Can not be empty");

    const tweet=await Tweet.findOneAndUpdate(
        {
            _id:tweetId,
            owner:mongoose.Types.ObjectId(req.user._id)
        },
        {
            content:content
        },
        {
            new :true
        }
    )
        // const tweet = await Tweet.findById(tweetId);
    // if (!tweet) {
    //     throw new ApiError(404, "Tweet not found");
    // }

    // if (tweet.owner.toString() !== req.user._id.toString()) {
    //     throw new ApiError(403, "You Are Not Authenticated To Update this tweet")
    // }
    // tweet.content = content.toString()
    // await tweet.save();

    if (!tweet) {
        throw new ApiError(404, "Tweet not found or unauthorized to update");
    }

    res.status(200).json(
        new ApiResponse(200, tweet, "Tweets Updated")
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    // Validate tweet ID
    if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID");
    }

    // Find the tweet
    const tweet = await Tweet.findById(tweetId);
   

    // Check if the tweet exists
    if (!tweet) {
        throw new ApiError(404, "Tweet does not exist");
    }

    // Check ownership using `.toString()`
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    // Delete the tweet
    await tweet.deleteOne();  

    // Send response
    res.status(200).json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    );
     // 204 No Content
});


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}