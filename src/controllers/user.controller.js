import { asyncHandler } from "../utils/asyncHandler.utils.js";
import {ApiError} from "../utils/apiError.js";
import {User} from "../model/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.utils.js";
import {ApiResponse} from "../utils/apiResponse.js";


const generateAccessAndRefreshToken=async (userid)=>{
    try {
        const user=await User.findById(userid);
        const accessToken= user.generateAccessToken();
        const refreshToken = user.refreshAccessToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});

        return{
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw new ApiError(500,`Some error occured while generating access and refresh token !!  =  ${error}`);
    }

}

// const registerUser=asyncHandler( async (req,res) =>  {
//     res.status(200).json({message:"ok"})
// })
const registerUser=asyncHandler( async (req,res) =>  {
    const {fullName,email,userName,password}=req.body;
   // console.log("email::",email ,"\nfullname",fullName,"\nusername",userName,"\npassword",password);//testing if got successfull response

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
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverimageLocalPath = req.files?.coverimage[0]?.path;
    // console.log(req.files)
    // console.log("avatarLocalPath::", avatarLocalPath); // Debugging
    // console.log("coverimageLocalPath::", coverimageLocalPath); 
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath.replace(/\\/g, "/"))
    const coverimage=coverimageLocalPath? await uploadOnCloudinary(coverimageLocalPath.replace(/\\/g, "/")):null;
    // console.log("avatar",avatar,"\ncoverimage::",coverimage)

    if(!avatar){ throw new ApiError(400,"avatar file is required problem on uplading on cloudinary ")}


    
    const user= await User.create({
        fullName,
        avatar:avatar.url,
        coverimage:coverimage?.url||"",
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

const loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, userName, password } = req.body;
        if (!userName || !email) throw new ApiError(400, "login failed!!  please enter userName or email");

        const user = await User.findOne({
            $or: [{ userName }, { email }]
        });
        if (!user) throw new ApiError(400, "User not found ");

        const isValidPassword = await user.isPasswordCorrect(password);
        if (!isValidPassword) throw new ApiError(400, "Invalid Password");   

        const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);

        const loggedInUser=User.findById(user._id).select("-password -refreshToken");

        const options={
            httpOnly:true,
            secure:true
        }
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(200,
                {
                    user:loggedInUser,accessToken,refreshToken
                },
                "User logged in successfully"
            )
        )
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }

})

const logoutUser= asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("accessToken",options)
    .json( new ApiResponse(200,{},"User logged out Successfully"))
    

})

export { 
    registerUser,
    loginUser,
    logoutUser
}