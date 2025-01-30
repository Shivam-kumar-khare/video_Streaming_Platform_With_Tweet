import { Router } from "express";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();
router.use(verifyJWT);
router.route("/channel-statics").get(getChannelStats);
router.route("/channel-Video").get(getChannelVideos);
export default router;