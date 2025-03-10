import mongoose ,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema= new Schema({
    userName:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        maxlength:[50,"max character limit is 50"],
        index:true
    },
    email:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        maxlength:[50,"max character limit is 50"],
    },
    fullName:{
        type: String,
        required:true,
        lowercase:true,
        maxlength:[50,"max character limit is 50"],
        index:true
    },
    avatar:{
        type: String,//cloudniary service url
        required:true,
    },
    coverimage:String,
    password:{
        type: String,
        required:[true,"password is required"],
        unique:true,
        maxlength:[50,"max character limit is 50"],
        index:true
    },
    refreshToken: String,
    watchHistory:[{
        type : Schema.Types.ObjectId,
        ref: "Video"

    }]

},{timestamps:true});

userSchema.pre("save", async function (next) {
    try {
        if (!this.isModified("password")) return next();//added next flag here
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (err) {
        next(err);
    }
});


//https://mongoosejs.com/docs/middleware.html  //read about pre midlleware;
userSchema.methods.isPasswordCorrect = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (err) {
        throw new Error(`Error while checking password::${err}`);
    }
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
};
userSchema.methods.refreshAccessToken = function () {
    return jwt.sign(
        { _id: this._id, },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
};



export const User = mongoose.model("User",userSchema);


