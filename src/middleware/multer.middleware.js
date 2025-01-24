import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name from the current module's URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Resolving relative path from current directory to public/temp
        const tempPath = path.join(__dirname, "../../public/temp");
        cb(null, tempPath); // Save files in the temp folder
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Save with original file name
    }
});

export const upload = multer({ storage,  limits: { fileSize: 25 * 1024 * 1024 }})// Limit file size to 25 M });
