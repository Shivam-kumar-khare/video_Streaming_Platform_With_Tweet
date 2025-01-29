import { Router } from "express";
import {
    getVideoComments,   
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comments.controller.js";

import {verifyJWT} from "../middleware/auth.middleware.js"
import { upload } from "../middleware/multer.middleware.js";

const router=Router();

router.use(verifyJWT);

router.route("/:videoId").get(getVideoComments).post(upload.none(),addComment);
router.route("/c/:commentId").delete(deleteComment).patch(upload.none(),updateComment);

export default router