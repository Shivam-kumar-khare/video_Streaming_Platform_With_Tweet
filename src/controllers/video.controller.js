import mongoose, { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.utils.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.utils.js"
import { Video } from "../model/video.model.js"
import { User } from "../model/user.model.js"





const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query = {}, sortBy = "updatedAt", sortType = -1, userId } = req.query;

    // Validate userId
    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User Id");
    }

    // Parse pagination params
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    const skip = (page - 1) * limit;

    // Parse and validate `query`
    if (typeof query === "string") {
        try {
            query = JSON.parse(query);
        } catch (err) {
            throw new ApiError(400, "Invalid query format");
        }
    }

    if (query && typeof query !== "object") {
        throw new ApiError(400, "Invalid query format");
    }

    // Validate `sortBy`
    const validFields = ["duration", "views", "updatedAt"];
    if (!validFields.includes(sortBy)) {
        throw new ApiError(400, `Invalid sort field: ${sortBy}`);
    }

    // Convert `sortType` to numeric value
    sortType = sortType === "Ascending" ? 1 : sortType === "Descending" ? -1 : -1;

    // Fetch videos
    const videos = await Video.aggregate([
        {
            $match: {
                owner: userId,
                ...query
            }
        },
        {
            $sort: {
                [sortBy]: sortType
            }
        },
        { $skip: skip },
        { $limit: limit }
    ]);

    // Respond with results
    res.status(200).json(
        new ApiResponse(200, videos, "Success")
    );
});

//to view a video
const viewVideo = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get user ID from the authenticated request
    const { videoId } = req.params; // Get video ID from the route parameters

    // Validate video ID
    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Video ID is required");
    }

    // Check if the video exists
    const video = await Video.findByIdAndUpdate(videoId, {
        $inc: { views: 1 }
    });
    if (!video) {
        throw new ApiError(404, "Video not found");
    }



    // Update the user's watchHistory
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { watchHistory: videoId } }, // $addToSet ensures no duplicates
        { new: true } // Return the updated user document
    );

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    // Respond with the video details
    res.status(200).json(
        new ApiResponse(200, video, "Success")
    );
});


const publishAVideo = asyncHandler(async (req, res) => {
    function formatDuration(seconds = 0) {
        const minutes = Math.floor(seconds / 60); // Get the whole minutes
        const remainingSeconds = Math.floor(seconds % 60); // Get the remaining seconds
        return `${minutes}m ${remainingSeconds}s`;
    }

    const { title, description } = req.body;


    let videoLocalPath;
    console.log(req.file)


    if (req.file && Array.isArray(req.file.videoLocalPath) && req.files.videoLocalPath.length > 0) {
        console.log(req.file)
        videoLocalPath = req.file.videoLocalPath[0].path;

    }
    else { throw new ApiError(404, "Video File not found") }


    const video = videoLocalPath ? await uploadOnCloudinary(videoLocalPath) : null

    const videoObject = {
        owner: req.user._id,
        videofile: video.url,
        title,
        description,
        duration: formatDuration(video.duration)
    }

    const publishedVideo = await Video.create(videoObject)

    if (publishedVideo === 0) {
        throw new ApiError(400, "Video Uploadation failed")
    }


    res.status(200).json(
        new ApiResponse(200, publishedVideo, "video publihed Successfully")
    )


    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;


    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "No Video Found")
    }

    res.status(200).json(
        new ApiResponse(200, video, "Video fetched Successfully")
    )



    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail

    const { title, description } = req.body;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id")
    }

    const updateParameter = {};

    if (title) { updateParameter.title = title }
    if (description) { updateParameter.description = description }

    const userId = req.user._id;

    const updatedVideo = await Video.findOneAndUpdate(
        {
            owner: userId,
            _id: videoId
        },
        updateParameter,
        {
            new: true
        }
    )


    if (!updatedVideo) {
        throw new ApiError(400, "Vido not found")
    }

    res.status(200).json(
        new ApiResponse(200, updatedVideo, "Success")
    )


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id")
    }

    const video = await Video.findOneAndDelete(
        {
            owner: mongoose.Types.ObjectId(userId),
            _id: videoId
        }
    )

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const result = await deleteFromCloudinary(video.videofile)



    res.status(200).json(
        new ApiResponse(200, result, "Video Deleted Successfully")
    )


    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id; // Assuming `req.user` contains the authenticated user's ID

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id")
    }

    // Find the video and check ownership
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    // Toggle the publish status
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: { isPublished: !video.isPublished } },
        { new: true } // Return the updated document
    );

    res.status(200).json(
        new ApiResponse(
            200,
            { videoId: updatedVideo._id, isPublished: updatedVideo.isPublished },
            "Publish status updated successfully"
        )
    );
});


export {
    getAllVideos,//done
    publishAVideo,//done
    getVideoById,//done
    updateVideo,//done
    deleteVideo,//done 
    togglePublishStatus,//done
    viewVideo//done
}