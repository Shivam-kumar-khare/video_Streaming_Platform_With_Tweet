import dotenv from 'dotenv';
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME,   
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.error("file path not found");
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        console.log("file upladed successfully on cloudinary", response.url);
        return response;

    }
    catch (error) {
        console.error("Cloudinary upload error:", error);
        fs.unlinkSync(localFilePath)//remove the local saved temporary file as the upload operation got failed
        return null;

    }
}

export {uploadOnCloudinary};
