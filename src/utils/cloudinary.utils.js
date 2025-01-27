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
        // console.log(response)
        console.log("\n\nfile uploaded successfully on cloudinary\n", response.url);
        return response;

    }
    catch (error) {
        console.error("Cloudinary upload error:", error);
        fs.unlinkSync(localFilePath)//remove the local saved temporary file as the upload operation got failed
        return null;

    }
}
const deleteFromCloudinary=async (filePath)=>{
    
    try {
        if (!filePath) {
            console.error("file path not found to delete");
            return null;
        }
        
        const url=filePath.split('/')
        const fileName=url[url.length-1];
        const publicId = fileName.substring(0, fileName.lastIndexOf('.'));

        if (!publicId) {
            console.error("Failed to extract public ID from file path.");
            return null;
        }
        
        const result=await cloudinary.uploader
        .destroy(
            publicId,
            {
                invalidate:true
            }
        )
        // console.log(result.result,"      file removed successfully");
        return result;
    } catch (error) {
        console.log("an error occured while deleting the image===",error);
    }
}
export {uploadOnCloudinary,deleteFromCloudinary};
