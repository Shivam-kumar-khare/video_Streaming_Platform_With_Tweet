import { Router } from "express";
import { 
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";
import {upload } from "../middleware/multer.middleware.js";

const router=Router();
router.use(verifyJWT)
router.route("/createTweet").post(upload.none(),createTweet);
router.route("get-UserTweet").get(getUserTweets);
router.route("/:tweetId").delete(deleteTweet).patch(updateTweet);

export default router;