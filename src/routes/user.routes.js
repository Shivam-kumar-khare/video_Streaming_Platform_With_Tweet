import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetail,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory

} from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js";
import {verifyJWT} from "../middleware/auth.middleware.js"

const router= Router();
// console.log(router.route,router.post)
router.route("/register").post(
    upload.fields([
        {name:"avatar",maxCount:1},
        {name:"coverimage",maxCount:1}
    ]),
    registerUser

)

router.route("/login").post(upload.none() ,loginUser)
// router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, upload.none(),changePassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT,upload.none(), updateAccountDetail)

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/update-coverimage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router;