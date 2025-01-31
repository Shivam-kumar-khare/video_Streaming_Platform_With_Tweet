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

        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: "auto",
                transformation: [
                    { quality: "auto" }, // Optimize
                    { fetch_format: "auto" } // Auto-format
                ]
            }
        )
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
const deleteFromCloudinary = async (filePath) => {

    try {
        if (!filePath) {
            console.error("file path not found to delete");
            return null;
        }

        const url = filePath.split('/');

        const fileName = url[url.length - 1];

        const publicId = fileName.split('.')[0];

        let resource_type = fileName.split('.')[1];



        if (resource_type === "mp4") resource_type = "video";
        else if (resource_type === "mp3") resource_type = "audio";
        else resource_type = "image";


        if (!publicId) {
            console.error("Failed to extract public ID from file path.");
            return null;
        }

        const result = await cloudinary.uploader
            .destroy(
                publicId,
                {
                    invalidate: true,
                    resource_type
                }
            )
        console.log(result, " file removed successfully");
        return result;
    } catch (error) {
        console.log("an error occured while deleting the image===",error);
    }
}
export { uploadOnCloudinary, deleteFromCloudinary };
