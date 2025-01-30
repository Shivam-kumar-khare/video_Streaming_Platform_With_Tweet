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

router.route("/playlist/:playlistId/video/:videoId").post(addVideoToPlaylist).patch(removeVideoFromPlaylist);

router.route("/my-playlists").get(getMyPlaylists);

router.route("/user-playlists/:userId").get(getUserPlaylists);

router.route("/playlist/:playlistId").get(getPlaylistById);

router.route("/playlist/:playlistId").delete(deletePlaylist).patch(upload.none(), updatePlaylist);

export default router;
