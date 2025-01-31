import mongoose, { Schema } from "mongoose";

const commentsSchema = new Schema({
    content: {
        type: String,
        maxlength: [400, "Maximum 400 character comments allowed"],
        required: [true, "Empty comments are not allowed"],
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true })

export const UserComment = mongoose.model("UserComment", commentsSchema)