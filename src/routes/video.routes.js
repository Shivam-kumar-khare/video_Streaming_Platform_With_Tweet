import { Router } from "express";
import {
    getAllVideos,//done
    publishAVideo,//done
    getVideoById,//done
    updateVideo,//done
    deleteVideo,//done 
    togglePublishStatus,//done
    viewVideo//done
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js"
import { upload } from "../middleware/multer.middleware.js";

const router=Router();

// router.use(verifyJWT);

router.route("/publish").post(verifyJWT,upload.single("videofile"),publishAVideo);//tested {status :"ok"}
router.route("/get-video/:videoId").get(getVideoById);//tested
router.route("/changePublished-status/:videoId").patch(verifyJWT,togglePublishStatus);//tested
router.route("/update/:videoId").patch(verifyJWT,updateVideo);//tested
router.route("/veiw-video/:videoId").post(verifyJWT,viewVideo);//tested
router.route("/:videoId").delete(verifyJWT,deleteVideo);//tested
export default router;