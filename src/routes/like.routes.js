import { Router } from "express";
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
} from "../controllers/likes.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router=Router();

router.use(verifyJWT);

router.route("/video/:videoId").post(toggleVideoLike).get(getLikedVideos);
router.route("/comment/:commentId").post(toggleCommentLike);
router.route("/tweet/:tweetId").post(toggleTweetLike);


export default router;