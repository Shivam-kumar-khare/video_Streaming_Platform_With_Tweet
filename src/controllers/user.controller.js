import { asyncHandler } from "../utils/asyncHandler.utils.js";
import {ApiError} from "../utils/apiError.js";
import {User} from "../model/user.model.js"

// const registerUser=asyncHandler( async (req,res) =>  {
//     res.status(200).json({message:"ok"})
// })
const registerUser=asyncHandler( async (req,res) =>  {
    const {fullName,email,userName,password}=req.body;
    console.log("email::",email);//testing if got successfull response

    //validations
    if(!fullName || !email || !userName  || !password ){
        throw new ApiError(400,"All Field Are Required");
    }
    if(!email.includes("@")) throw new ApiError(400,"Invalid Email Address");

    const userExisted=User.findOne({
        $or:[{userName},{email}]
    });

    if(userExisted) throw new ApiError (409,"username or email existed");

export { registerUser }