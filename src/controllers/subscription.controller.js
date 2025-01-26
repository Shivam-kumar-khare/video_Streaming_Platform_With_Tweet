import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../model/subscription.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.utils.js"

//controller to subscribe and unsubscribe a channel
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const userId = req.user._id; 

   
    const existingSubscription = await Subscription.findOne({
        channel: channelId, 
        subscriber: mongoose.Types.ObjectId(userId),
    });

    if (existingSubscription) {
       
        await existingSubscription.deleteOne(); 
        return res.status(200).json(
            new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully")
        );
    } else {
        const newSubscription = await Subscription.create({
            channel: channelId,  
            subscriber: mongoose.Types.ObjectId(userId),
        });

        if (!newSubscription) {
            throw new ApiError(500, "Subscription creation failed");
        }

        return res.status(201).json(
            new ApiResponse(201, { subscribed: true }, "Subscribed successfully")
        );
    }
});


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    let { page, limit } = req.query;

    // Parse and validate `page` and `limit`
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10; // Default to 10 if no valid limit is provided

    const skip = (page - 1) * limit;

    // Aggregate pipeline
    const subscriberData = await Subscription.aggregate([
        {
            $match: {
                channel: mongoose.Types.ObjectId(req.user._id), // Match documents with the channel ID
            },
        },
        {
            $facet: {
                metadata: [{ $count: "totalSubscribers" }], // Count total subscribers
                data: [
                    { $sort: { updatedAt: -1 } }, // Sort by updatedAt
                    { $skip: skip },              // Skip for pagination
                    { $limit: limit },            // Limit for pagination
                ],
            },
        },
        {
            $project: {
                totalSubscribers: { $arrayElemAt: ["$metadata.totalSubscribers", 0] }, // Extract total count
                subscribers: "$data", // Rename `data` to `subscribers` for clarity
            },
        },
    ]);

    // Handle no data case
    if (!subscriberData || subscriberData.length === 0) {
        throw new ApiError(400, "Some error occurred");
    }

    const result = subscriberData[0];

    // Response
    res.status(200).json(
        new ApiResponse(
            200,
            {
                subscribers: result.subscribers || [], // Default to empty array if no subscribers
                totalSubscribers: result.totalSubscribers || 0, // Default to 0 if undefined
            },
            "Subscribers fetched successfully"
        )
    );
});

// controller to return channel list to which authenticated user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    let { page, limit } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10; // Default to 10 if no valid limit is provided

    const skip = (page - 1) * limit;

    const subscribedChannelData = await Subscription.aggregate([
        {
            $match: {
                subscriber: mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $facet: {
                metadata: [{ $count: "totalSubscribedChannel" }], // Calculate total count
                data: [
                    { $sort: { updatedAt: -1 } }, // Sort by updatedAt
                    { $skip: skip },              // Apply pagination
                    { $limit: limit },            // Limit the results
                ],
            },
        },
        {
            $project: {
                totalSubscribedChannel: { $arrayElemAt: ["$metadata.totalSubscribedChannel", 0] },
                channel: "$data",
            },
        },
    ]);

    if (!subscribedChannelData || subscribedChannelData.length === 0) {
        throw new ApiError(400, "Some error occurred");
    }

    const result = subscribedChannelData[0];

    res.status(200).json(
        new ApiResponse(
            200,
            {
                channels: result.channel,
                totalSubscribedChannel: result.totalSubscribedChannel || 0, // Fallback to 0 if undefined
            },
            "Channels fetched successfully"
        )
    );
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}