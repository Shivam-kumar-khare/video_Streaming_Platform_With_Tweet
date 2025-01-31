import mongoose, { isValidObjectId } from "mongoose"
import { UserComment } from "../model/comments.model.js"
import { Like } from "../model/likes.model.js"
import { Video } from "../model/video.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.utils.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Video ID not found");
    }

    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    
    const comments = await UserComment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
            }
        },
        {
            $sort: {
                updatedAt: -1,
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
                _id:1,
                content:1,
                owner:1
            }
        }
    ]);

    const commentWithLikes = await Promise.all(comments.map(async (comment) => {
        const likeCount = await Like.countDocuments({ comment: comment._id }) || 0; 
        return { ...comment, likes: likeCount };
    }));
    
    // Optional: Get total count of comments for the video
    const totalComments = await UserComment.countDocuments({ video: videoId });

    res.status(200).json(
        new ApiResponse(200, {
            commentWithLikes,
            pagination: {
                total_Comments: totalComments,
                page,
                limit,
                totalPages: Math.ceil(totalComments / limit),
            },
        }, "Comments fetched successfully")
    );

    console.log(comments)
});


const addComment = asyncHandler(async (req, res) => {
   
    const { content } = req.body;
    
    const userId = req.user._id;
 
    const { videoId } = req.params;

    if (!userId) {
        throw new ApiError(400, "Please Login ");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID format.");
    }

    const videoExists = await Video.findById(videoId);
    if (!videoExists) {
        throw new ApiError(400, "Invalid or missing Video ID.");
    }

    const comment = await UserComment.create({
        content,
        video: videoId,
        owner: userId
    });

    if (!comment) {
        throw new ApiError(400, "Something Went wrong While creating an comment document");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            {
                _id:comment._id,
                owner:comment.owner,
                content:comment.content

            },
            "comments added successfully "
        )
    );
});


const updateComment = asyncHandler(async (req, res) => {
    const { newComment } = req.body;
    const { commentId } = req.params;
 
    
    if (!commentId) {
        throw new ApiError(400, "Invalid Request: Missing comment ID");
    }

   
    const validated_Comment = await UserComment.findById(commentId);
    if (!validated_Comment) {
        throw new ApiError(400, "Invalid old comment id");
    }

   
    if (validated_Comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this comment");
    }

    
    validated_Comment.content = newComment;

    
    await validated_Comment.save();

    // Send a success response
    res.status(200).json(
        new ApiResponse(
            200,
            {
                _id:validated_Comment._id,
                owner:validated_Comment.owner,
                content:validated_Comment.content

            },
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

   
    if (validated_Comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete this comment");
    }

    
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