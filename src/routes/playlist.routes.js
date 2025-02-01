import { Router } from "express";
import {
    createPlaylist,
    addVideoToPlaylist,
    getMyPlaylists,
    getUserPlaylists,
    getPlaylistById,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

//secured routes
router.use(verifyJWT);

router.route("/create").post(upload.none(), createPlaylist);

router.route("/:playlistId/video/:videoId").post(addVideoToPlaylist).patch(removeVideoFromPlaylist);

router.route("/my-playlists").get(getMyPlaylists);

router.route("/user-playlists/:userId").get(getUserPlaylists);

// router.route("/:playlistId").get(getPlaylistById);

router.route("/:playlistId")
.get(getPlaylistById)
.delete(deletePlaylist)
.patch(upload.none(), updatePlaylist);

export default router;
