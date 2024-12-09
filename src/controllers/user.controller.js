import { asyncHandler } from "../utils/asyncHandler.utils.js";
import {ApiError} from "../utils/apiError.js";
import {User} from "../model/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.utils.js";
import {ApiResponse} from "../utils/apiResponse.js";

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

    const userExisted= await User.findOne({
        $or:[{userName},{email}]
    });

    if(userExisted){
        throw new ApiError (409,"username or email existed")
    }

//req.file from multer
    const avatarLocalPath = req.file?.avatar[0]?.path;
    const coverImageLocalPath = req.file?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage=coverImageLocalPath? await uploadOnCloudinary(coverImageLocalPath):null

    if(!avatar){ throw new ApiError(400,"avatar file is required ")}


    
    const user= await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        userName:userName.toLowerCase()
    })

    const createdUser= await User.findById(user._id).select("-password -refreshToken");//.select remove the feild inside
    if(!createdUser){ throw new ApiError(500,"something went wrong while registering user in controller file") }
    

    return res.status(201).json(
        new ApiResponse (200,createdUser,"user registered Successfully") 
    )
})

export { registerUser }