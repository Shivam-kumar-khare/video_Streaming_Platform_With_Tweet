import mongoose from "mongoose"
import { UserComment } from "../model/comments.model.js"
import { Video } from "../model/video.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.utils.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "Video ID not found");
    }

    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    // Ensure valid pagination values
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    // Fetch comments using aggregation
    const comments = await Comment.aggregate([
        {
            $match: {
                video: videoId,
            },
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
    ]);

    // Optional: Get total count of comments for the video
    const totalComments = await Comment.countDocuments({ video: videoId });

    res.status(200).json(
        new ApiResponse(200, {
            comments,
            pagination: {
                total: totalComments,
                page,
                limit,
                totalPages: Math.ceil(totalComments / limit),
            },
        }, "Comments fetched successfully")
    );

    console.log(comments)
});


const addComment = asyncHandler(async (req, res) => {
    // Extract content from the request body
    const { content } = req.body;
    // Extract user ID from the authenticated request
    const userId = req.user._id;
    // Extract video ID from request parameters
    const { videoId } = req.params;

    // Validate content (should not be empty or only whitespace)


    // Validate user existence
    if (!userId) {
        throw new ApiError(400, "user not found---src comment controller.js");
    }

    // Validate videoId format (should be a valid ObjectId)
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID format.");
    }

    // Check if the video exists in the database
    const videoExists = await Video.findById(videoId);
    if (!videoExists) {
        throw new ApiError(400, "Invalid or missing Video ID.");
    }

    // Create a new comment document
    const comment = await UserComment.create({
        content,
        video: videoId,
        owner: userId
    });

    // Check if the comment was created successfully
    if (!comment) {
        throw new ApiError(400, "Something Went wrong While creating an comment document");
    }

    // Respond with success and the created comment
    res.status(200).json(
        new ApiResponse(
            200,
            comment,
            "comments added successfully "
        )
    );
});


const updateComment = asyncHandler(async (req, res) => {
    const { newComment } = req.body;
    const { commentId } = req.params;

    // Validate inputs
    if (!commentId) {
        throw new ApiError(400, "Invalid Request: Missing comment ID");
    }

    // Find the comment by ID
    const validated_Comment = await UserComment.findById(commentId);
    if (!validated_Comment) {
        throw new ApiError(400, "Invalid old comment id");
    }

    // Check if the logged-in user is the owner of the comment
    if (validated_Comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this comment");
    }

    // Update the comment content
    validated_Comment.content = newComment;

    // Save the updated comment to the database (Mongoose will validate `newComment`)
    await validated_Comment.save();

    // Send a success response
    res.status(200).json(
        new ApiResponse(
            200,
            validated_Comment,
            "Comment updated successfully"
        )
    );
});


const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, "Invalid Request: Missing comment ID");
    }

    const validated_Comment = await UserComment.findById(commentId);
    if (!validated_Comment) {
        throw new ApiError(400, "Invalid old comment id");
    }

    // Check if the logged-in user is the owner of the comment
    if (validated_Comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete this comment");
    }

    //delete the comment
    await UserComment.findByIdAndDelete(validated_Comment._id)

    res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Comment deleted successfully"
        )
    );

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}