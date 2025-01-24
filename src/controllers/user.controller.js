import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.utils.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const generateAccessAndRefreshToken = async (userid) => {
    try {
        const user = await User.findById(userid);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.refreshAccessToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw new ApiError(500, `Some error occured while generating access and refresh token !!  =  ${error}`);
    }

}

// const registerUser=asyncHandler( async (req,res) =>  {
//     res.status(200).json({message:"ok"})
// })
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, userName, password } = req.body;
    // console.log("email::",email ,"\nfullname",fullName,"\nusername",userName,"\npassword",password);//testing if got successfull response

    //validations
    if (!fullName || !email || !userName || !password) {
        throw new ApiError(400, "All Field Are Required");
    }
    if (!email.includes("@")) throw new ApiError(400, "Invalid Email Address");

    const userExisted = await User.findOne({
        $or: [{ userName }, { email }]
    });

    if (userExisted) {
        throw new ApiError(409, "username or email existed")
    }

    //req.file from multer
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverimageLocalPath = req.files?.coverimage[0]?.path;
    let coverimageLocalPath;
    if (req.files && Array.isArray(req.files.coverimage)&& req.files.coverimage.length>0) {
        coverimageLocalPath=req.files?.coverimage[0].path
        
    }


    // console.log(req.files)
    // console.log("avatarLocalPath::", avatarLocalPath); // Debugging
    // console.log("coverimageLocalPath::", coverimageLocalPath); 
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath.replace(/\\/g, "/"))
    const coverimage = coverimageLocalPath ? await uploadOnCloudinary(coverimageLocalPath.replace(/\\/g, "/")) : null;
    // console.log("avatar",avatar,"\ncoverimage::",coverimage)

    if (!avatar) { throw new ApiError(400, "avatar file is required problem on uploading on cloudinary ") }



    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverimage: coverimage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");//.select remove the feild inside
    if (!createdUser) { throw new ApiError(500, "something went wrong while registering user in controller file") }


    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered Successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, userName, password } = req.body;
        // console.log("REQUEST BODY====",req.body)
        if (!(userName || email)) throw new ApiError(400, "login failed!!  please enter userName or email");

        const user = await User.findOne({
            $or: [{ userName }, { email }]
        });
        if (!user) throw new ApiError(400, "User not found ");

        const isValidPassword = await user.isPasswordCorrect(password);
        if (!isValidPassword) throw new ApiError(400, "Invalid Password");

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        // const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
        const loggedInUser = user.toObject();
        delete loggedInUser.password;
        delete loggedInUser.refreshToken;

        const options = {
            httpOnly: true,
            secure: true
        }
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200,
                    {
                        user: loggedInUser, accessToken, refreshToken
                    },
                    "User logged in successfully"
                )
            )
    console.log("\n\nUser logged-in Successfully")
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:null
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out Successfully"))


})


const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    console.log("\n\nincoming refresh token===", incomingRefreshToken)
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorised request usercontroller.js")
    }
    // console.log("\n\nrefresh secret===", process.env.REFRESH_TOKEN_SECRET)

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )
    console.log("\n\ndecoded token==", decodedToken)
    const user = await User.findById(decodedToken?._id)
    console.log("Stored refresh token in DB: ", user?.refreshToken);


    console.log("user==\t\t", user)
    if (!user) {
        throw new ApiError(401, "unauthorised request usercontroller.js 2----")
    }
    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "access token is expired usercontrolerr-----")

    }
    const options = {
        httpOnly: true,
        secure: true
    }
    const { accessToken, newrefreshToken } = await generateAccessAndRefreshToken(user._id)

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options).
        json(
            new ApiResponse(
                200,
                { accessToken, refreshToken: newrefreshToken },
                "Access token refreshed"
            )
        )


})

const changePassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body

    // console.log("oldpassword==",oldPassword,"\nnewpassword=",newPassword)

    if(!(oldPassword && newPassword)){
        throw new ApiError(400, "Both old and new passwords are required");
    }

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password")
    }

    user.password = newPassword

    await user.save({ validateBeforeSave: false })
    console.log("\n\nPassword Changed Successfully\n\n")
    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password changed Successfully")
        )

})

const getCurrentUser = asyncHandler(async (req, res) => {
    // const user=User.findById(req.user?._id)
    // console.log(req.user)
    return res
        .status(200)
        .json(
            new ApiResponse(200,req.user,"User fetched Successfully")
        )
})

const updateAccountDetail = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    // Validate input
    if (!(fullName||email)) {
        throw new ApiError(400, "At least one of fullName or email is required.");
    }

    // Build update object dynamically
    const updateFields = {};
    if (fullName) updateFields.fullName = fullName;
    if (email) updateFields.email = email;

    // Update user details
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: updateFields },
        { new: true }
    );

    if (!updatedUser) {
        throw new ApiError(404, "User not found.");
    }

    // Convert to object and exclude the password field
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    // Send success response
    res.status(200).json(
        new ApiResponse(200, userResponse, "Account details updated successfully.")
    );
})

const updateUserAvatar= asyncHandler(async(req,res)=>{
    
    const avatarNewPath=req.file?.path
    
    if(!avatarNewPath){
        throw new ApiError(400,"Avatar file not found") 
    }

    
    const avatarNew=await uploadOnCloudinary(avatarNewPath)

    if(!avatarNew.url){
        throw new ApiError(400,"Problem Incurred during file upload")
    }
    // const user=await User.findById(req.user?._id)
    const user=req.user
    // console.log(user)
    const oldpath=user.avatar
    user.avatar = avatarNew.url; // Directly update the avatar field
    await user.save({validateBeforeSave:false});

    if (oldpath) {
        await deleteFromCloudinary(oldpath)
    }
    
    res.status(200).json(
        new ApiResponse(200,user,"FIlE updated successfully")
    )

})

const updateUserCoverImage= asyncHandler(async(req,res)=>{
    
    const coverImageNewPath=req.file?.path
    
    if(!coverImageNewPath){
        throw new ApiError(400,"Cover Image  file not found")
    }
    const coverImageNew=await uploadOnCloudinary(coverImageNewPath)

    if(!coverImageNew.url){
        throw new ApiError(400,"Problem Incurred during file upload")
    }
    
    if (req.user?.coverimage) {
        await deleteFromCloudinary(req.user.coverimage).catch(err => {
            console.error("Error deleting old cover image:", err);
        });
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImageNew.url
            }
        },
        {
            new:true,

        }
    ).select("-password")
    
    res.status(200).json(
        new ApiResponse(200,user,"FIlE updated successfully")
    )

})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        //Syntax: { $in: [<value>, <array>] }
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }
    console.log(channel)
    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})




const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        userName: 1,
                                        avatar: 1
                                    }
                                }
                            ]


                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $arrayElemAt:["$owner",0]
                            }
                        }
                    }
                ]
            }
        }
    ])
    if(!user){
        throw new ApiError(402,"watch history can not be fetched ")
    }
    console.log(user)
    res.status(200).json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "History fetched successfully"
        )
    )
})

export {
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

}