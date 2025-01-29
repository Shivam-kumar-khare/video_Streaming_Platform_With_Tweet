import { Router } from "express";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router=Router();
router.use(verifyJWT)

router.route("/c/:channelId").post(toggleSubscription)//route to subscribe--unsubscribe
router.route("/getSubscribers").get(getUserChannelSubscribers)//route that return Subcribers List 
router.route("/channelSubscibed").get(getSubscribedChannels)//route that return List of channel subscribed to

export default router;








