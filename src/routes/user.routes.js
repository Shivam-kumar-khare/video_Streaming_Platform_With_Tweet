import { Router } from "express";
import {registerUser} from "../controllers/user.controller.js"

const router= Router();
// console.log(router.route,router.post)
router.route("/register").post(registerUser)


export default router;