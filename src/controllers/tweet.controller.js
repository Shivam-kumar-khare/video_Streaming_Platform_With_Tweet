import mongoose from "mongoose"
import { User } from "../model/user.model.js"
import { Tweet } from "../model/tweets.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.utils.js"
import { Like } from "../model/likes.model.js"


const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    if (!content) throw new ApiError(402, "Empty tweet cannot be created")
    const user = req.user._id
    if (!user) throw new ApiError(400, "User is not logged in")

    const tweet = await Tweet.create({
        content,
        owner: user
    })

    if (!tweet) {
        throw new ApiError(500, "Problem Incurred During creating tweet")

    }
    res.status(200).json(
        new ApiResponse(200, tweet, "Tweet created Successfully")
    )


})

const getUserTweets = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10 } = req.query;

    page=parseInt(page,10);
    limit=parseInt(limit,10);

    if(page<1 || isNaN(page)) page=1;
    if(limit<1|| isNaN(limit)) limit=10;

    const skip = (page - 1) * limit;

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: req.user._id
            }
        },
        {
            $sort: {
                updatedAt: -1
            }
        },
        {
            $skip: skip
        },
        {
            $limit: limit
        },
        {
            $project:{
                owner:1,
                _id:1,
                content:1
            }
        }
    ]);


    if (tweets.length === 0) {
        return res.status(203).json(
            new ApiResponse(203, [], "No previous tweet exists")
        );
    }
    const pagination={
        "page":page,
        "limit":limit
    }
    const tweetWithLikes = await Promise.all(tweets.map(async (tweet) => {
        const likes = await Like.countDocuments({ tweet: tweet._id }) || 0;
        return { ...tweet, likes };
    }));

    res.status(200).json(
        new ApiResponse(200, {pagination,tweetWithLikes}, "Tweets fetched successfully")
    );
});


const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid Id")
    }

    const { content } = req.body;
    if (!content) throw new ApiError(400, "Content Can not be empty");

    const tweet = await Tweet.findOneAndUpdate(
        {
            _id: tweetId,
            owner: new mongoose.Types.ObjectId(req.user._id)
        },
        {
            content: content
        },
        {
            new: true
        }
    )
   

    if (!tweet) {
        throw new ApiError(404, "Tweet not found or unauthorized to update");
    }

    res.status(200).json(
        new ApiResponse(200, tweet, "Tweets Updated")
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID");
    }


    const tweet = await Tweet.findById(tweetId);


    if (!tweet) {
        throw new ApiError(404, "Tweet does not exist");
    }


    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }


    await tweet.deleteOne();

  
    res.status(200).json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    );
 
});


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}