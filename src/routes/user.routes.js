import { Router } from "express";
import {registerUser} from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js";

const router= Router();
// console.log(router.route,router.post)
router.route("/register").post(
    upload.fields([
        {name:"avatar",maxCount:1},
        {name:"coverimage",maxCount:1}
    ]),
    registerUser

)


export default router;