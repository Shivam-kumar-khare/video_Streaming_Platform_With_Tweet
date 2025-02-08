import mongoose from "mongoose"
import { Like } from "../model/likes.model.js"
import { ApiError } from "../utils/apiError.js"
import { Video } from "../model/video.model.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { Subscription } from "../model/subscription.model.js"
import { asyncHandler } from "../utils/asyncHandler.utils.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const user = new mongoose.Types.ObjectId(req.user._id);

    const [videoStats, totalSubscriber, totalLikes] = await Promise.all([
        Video.aggregate([
            {
                $facet: {
                    totalVideos: [
                        { $match: { owner: user } },
                        { $count: "totalVideos" }
                    ],
                    totalVideosView: [
                        { $match: { owner: user } },
                        { 
                            $group: { _id: null, totalVideosView: { $sum: "$views" } }
                        }
                    ]
                }
            }
        ]),

        Subscription.aggregate([
            { $match: { channel: user } },
            { $count: "TotalSubscriber" }
        ]),

        Like.aggregate([
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "videoDetails"
                }
            },
            { $unwind: "$videoDetails" },
            { $match: { "videoDetails.owner": user } },
            { $count: "TotalLikes" }
        ])
    ]);

    console.log("\n\nvideoStats:", videoStats, "\ntotalSubscriber:", totalSubscriber, "\ntotalLikes:", totalLikes, "\n\n");

    const channelStats = {
        totalVideo: videoStats[0]?.totalVideos[0]?.totalVideos || 0,
        totalVideosView: videoStats[0]?.totalVideosView[0]?.totalVideosView || 0,
        totalSubscriber: totalSubscriber[0]?.TotalSubscriber || 0,
        totalLikes: totalLikes[0]?.TotalLikes || 0
    };

    res.status(200).json(new ApiResponse(200, channelStats, "Channel Stats fetched successfully"));
});


const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const video=await Video.find({
        owner:new mongoose.Types.ObjectId(req.user._id)
    })

    res.status(200).json(
        new ApiResponse(200,{"totalVideos":video.length,video},"video fetched successfully")
    )
})

export {
    getChannelStats,
    getChannelVideos
}
