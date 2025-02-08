import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";


//verify jwt used in C:\Users\Shivam\Desktop\MyYoutube\src\routes\user.routes.js
export const verifyJWT =asyncHandler(async (req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "");
        // console.log(token)
        if(!token){
            throw  new ApiError(401,"Unauthorized Request")
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
        const user= await User.findById(decodedToken?._id).select("-password -refreshToken");//_id name come from user model while you were creating user model token line 71 approx
    
    
        //NEXT_VIDEO: discuss about frontend
        if(!user) throw new ApiError("401","inavalid access token!!! from {midlleware auth file}");
        req.user=user;
    
        next();
    } catch (error) {
        throw new ApiError(401,`Error :: ${error?.message||"Login failed"} Please login`)
    }

})
